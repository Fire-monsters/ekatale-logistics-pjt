// apps/app1-farmer/src/store/slices/listingSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ProduceListing } from '../../types';
import type { RootState } from '../index';
import { listingApi } from '../../services/api/listing.api';
import type { CreateListingPayload } from '../../services/api/listing.api';
import {
  saveCachedOrders,
  getCachedOrders,
  savePendingListing,
  getPendingListings,
  enqueueSyncAction,
} from '../../db/database';
import { runSync } from '../../services/sync/offlineSync';
import { SYNC_ACTION_TYPES } from '../../constants';
import { generateUuid } from '../../utils/uuid';
import { selectIsOnline } from './offlineQueueSlice';

interface ListingState {
  listings: ProduceListing[];
  activeDraft: Partial<ProduceListing> | null; // multi-step form state
  selectedListing: ProduceListing | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isSyncing: boolean;
  error: string | null;
  lastFetchedAt: string | null;
  /** Number of listings created offline and not yet synced */
  pendingSyncCount: number;
}

const initialState: ListingState = {
  listings: [],
  activeDraft: null,
  selectedListing: null,
  isLoading: false,
  isSubmitting: false,
  isSyncing: false,
  error: null,
  lastFetchedAt: null,
  pendingSyncCount: 0,
};

// ─────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────

/**
 * Fetches the farmer's listings. Online: hits listing-service and caches the
 * result for offline viewing. Offline: returns the last cached page, with
 * any not-yet-synced local drafts merged in (pendingSync: true).
 */
export const fetchMyListings = createAsyncThunk(
  'listings/fetchMy',
  async (_, { getState }) => {
    const isOnline = selectIsOnline(getState() as RootState);
    const pending = await getPendingListings();
    const pendingListings: ProduceListing[] = pending.map((p) => ({
      ...(p.listing as ProduceListing),
      id: p.offlineId,
      pendingSync: true,
      createdAt: p.createdAt,
    }));

    if (!isOnline) {
      const cached = (await getCachedOrders()) as ProduceListing[];
      return { items: [...pendingListings, ...cached], fromCache: true };
    }

    try {
      const { items } = await listingApi.getMyListings({ limit: 50 });
      await saveCachedOrders(items);
      return { items: [...pendingListings, ...items], fromCache: false };
    } catch (err: any) {
      // Network blip even though isOnline said true — fall back to cache
      const cached = (await getCachedOrders()) as ProduceListing[];
      return { items: [...pendingListings, ...cached], fromCache: true };
    }
  },
);

export const fetchListingById = createAsyncThunk(
  'listings/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await listingApi.getById(id);
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Failed to load listing');
    }
  },
);

export interface SubmitListingInput {
  listing: CreateListingPayload;
  photoUris: string[];
}

/**
 * Creates a listing.
 *  - Online: submits to listing-service immediately (with photos).
 *  - Offline: saves a local draft + queues a CREATE_LISTING sync action,
 *    and returns an optimistic local entry (id = offlineId, pendingSync: true)
 *    that's immediately visible in MyListings.
 */
export const submitListing = createAsyncThunk(
  'listings/submit',
  async (input: SubmitListingInput, { getState, rejectWithValue }) => {
    const isOnline = selectIsOnline(getState() as RootState);

    if (isOnline) {
      try {
        const listing = await listingApi.create(input.listing);
        if (input.photoUris.length > 0) {
          const photos = await listingApi.uploadPhotos(listing.id, input.photoUris);
          listing.photos = photos.map((p) => p.url);
        }
        return { listing, queued: false };
      } catch (err: any) {
        return rejectWithValue(err.message ?? 'Failed to submit listing');
      }
    }

    // ── Offline path ──────────────────────────────────────────────────────
    const offlineId = generateUuid();
    const optimistic: ProduceListing = {
      id: offlineId,
      commodityId: input.listing.commodityId,
      commodityName: input.listing.commodityName ?? input.listing.commodityId,
      quantity: input.listing.quantity,
      unit: input.listing.unit,
      grade: input.listing.grade,
      askingPricePerUnit: input.listing.askingPricePerUnit,
      availabilityDate: input.listing.availabilityDate,
      photos: input.photoUris,
      status: 'PENDING_REVIEW',
      pendingSync: true,
      source: 'app',
      createdAt: new Date().toISOString(),
    };

    await savePendingListing(offlineId, optimistic, input.photoUris);
    await enqueueSyncAction(offlineId, SYNC_ACTION_TYPES.CREATE_LISTING, {
      offlineId,
      listing: { ...input.listing, offlineId },
      photoUris: input.photoUris,
    });

    return { listing: optimistic, queued: true };
  },
);

/** Farmer cancels their own listing (only allowed before COLLECTED) */
export const cancelListing = createAsyncThunk(
  'listings/cancel',
  async (id: string, { getState, rejectWithValue }) => {
    const isOnline = selectIsOnline(getState() as RootState);

    if (!isOnline) {
      // Queue the cancellation; optimistically mark as CANCELLED locally
      await enqueueSyncAction(generateUuid(), SYNC_ACTION_TYPES.CANCEL_LISTING, { listingId: id });
      return { id, queued: true };
    }

    try {
      const listing = await listingApi.cancel(id);
      return { id, listing, queued: false };
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Failed to cancel listing');
    }
  },
);

export const deleteListing = createAsyncThunk(
  'listings/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await listingApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message ?? 'Failed to delete listing');
    }
  },
);

/**
 * Runs the offline sync engine and merges results back into the store:
 * optimistic (offlineId-keyed) entries are replaced with the real
 * server-assigned listing.
 */
export const syncPendingListings = createAsyncThunk(
  'listings/sync',
  async (_, { getState }) => {
    const isOnline = selectIsOnline(getState() as RootState);
    if (!isOnline) return null;
    return runSync();
  },
);

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const listingSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    // Multi-step listing form — accumulate draft across screens
    startDraft: (state) => {
      state.activeDraft = {};
    },
    updateDraft: (state, action: PayloadAction<Partial<ProduceListing>>) => {
      state.activeDraft = { ...(state.activeDraft ?? {}), ...action.payload };
    },
    clearDraft: (state) => {
      state.activeDraft = null;
    },
    setSelectedListing: (state, action: PayloadAction<ProduceListing | null>) => {
      state.selectedListing = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchMyListings ─────────────────────────────────────────────────
      .addCase(fetchMyListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listings = action.payload.items;
        state.pendingSyncCount = action.payload.items.filter((l) => l.pendingSync).length;
        if (!action.payload.fromCache) state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(fetchMyListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ── fetchListingById ─────────────────────────────────────────────────
      .addCase(fetchListingById.fulfilled, (state, action) => {
        state.selectedListing = action.payload;
        const idx = state.listings.findIndex((l) => l.id === action.payload.id);
        if (idx !== -1) state.listings[idx] = action.payload;
      })

      // ── submitListing ─────────────────────────────────────────────────────
      .addCase(submitListing.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitListing.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.listings.unshift(action.payload.listing);
        if (action.payload.queued) state.pendingSyncCount += 1;
        state.activeDraft = null;
      })
      .addCase(submitListing.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // ── cancelListing ─────────────────────────────────────────────────────
      .addCase(cancelListing.fulfilled, (state, action) => {
        const idx = state.listings.findIndex((l) => l.id === action.payload.id);
        if (idx === -1) return;

        if (action.payload.queued) {
          state.listings[idx].status = 'CANCELLED';
          state.listings[idx].pendingSync = true;
          return;
        }

        const listing = action.payload.listing;
        if (!listing) return;
        state.listings[idx] = listing;
      })

      // ── deleteListing ─────────────────────────────────────────────────────
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.listings = state.listings.filter((l) => l.id !== action.payload);
      })

      // ── syncPendingListings ─────────────────────────────────────────────────
      .addCase(syncPendingListings.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(syncPendingListings.fulfilled, (state, action) => {
        state.isSyncing = false;
        if (!action.payload) return;

        // Replace optimistic (offlineId-keyed) entries with the synced listing
        for (const { offlineId, listing } of action.payload.created) {
          const idx = state.listings.findIndex((l) => l.id === offlineId);
          if (idx !== -1) state.listings[idx] = listing;
          else state.listings.unshift(listing);
        }

        // Mark cancelled-while-offline listings as confirmed
        for (const listingId of action.payload.cancelled) {
          const idx = state.listings.findIndex((l) => l.id === listingId);
          if (idx !== -1) state.listings[idx].pendingSync = false;
        }

        state.pendingSyncCount = state.listings.filter((l) => l.pendingSync).length;
      })
      .addCase(syncPendingListings.rejected, (state) => {
        state.isSyncing = false;
      });
  },
});

export const {
  startDraft,
  updateDraft,
  clearDraft,
  setSelectedListing,
  clearError,
} = listingSlice.actions;

export default listingSlice.reducer;

// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────

export const selectAllListings = (state: RootState) => state.listings.listings;

export const selectActiveListings = (state: RootState) =>
  state.listings.listings.filter((l) => !['PAID', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(l.status));

export const selectActiveDraft = (state: RootState) => state.listings.activeDraft;

export const selectListingById = (id: string) => (state: RootState) =>
  state.listings.listings.find((l) => l.id === id);

export const selectIsSubmitting = (state: RootState) => state.listings.isSubmitting;
export const selectIsSyncing = (state: RootState) => state.listings.isSyncing;
export const selectListingsLoading = (state: RootState) => state.listings.isLoading;
export const selectListingsError = (state: RootState) => state.listings.error;
export const selectPendingSyncCount = (state: RootState) => state.listings.pendingSyncCount;