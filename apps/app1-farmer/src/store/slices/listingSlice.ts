import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ProduceListing } from '@ekatale/types';
import { get, post, del } from '@services/api/client';
import { API_ROUTES } from '@constants/index';

interface ListingState {
  listings: ProduceListing[];
  activeDraft: Partial<ProduceListing> | null; // multi-step form state
  selectedListing: ProduceListing | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastFetchedAt: string | null;
}

const initialState: ListingState = {
  listings: [],
  activeDraft: null,
  selectedListing: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  lastFetchedAt: null,
};

// ─────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────

export const fetchMyListings = createAsyncThunk(
  'listings/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await get<ProduceListing[]>(API_ROUTES.FARMER_LISTINGS);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to load listings');
    }
  },
);

export const fetchListingById = createAsyncThunk(
  'listings/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await get<ProduceListing>(API_ROUTES.FARMER_LISTING_BY_ID(id));
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to load listing');
    }
  },
);

export const submitListing = createAsyncThunk(
  'listings/submit',
  async (listing: Omit<ProduceListing, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      return await post<ProduceListing>(API_ROUTES.FARMER_LISTING_CREATE, listing);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to submit listing');
    }
  },
);

export const deleteListing = createAsyncThunk(
  'listings/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await del(`${API_ROUTES.FARMER_LISTINGS}/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to delete listing');
    }
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
    // Optimistic local update from offline queue
    addListingLocally: (state, action: PayloadAction<ProduceListing>) => {
      state.listings.unshift(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listings = action.payload;
        state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(fetchMyListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchListingById.fulfilled, (state, action) => {
        state.selectedListing = action.payload;
        // Also update it in the list if present
        const idx = state.listings.findIndex((l) => l.id === action.payload.id);
        if (idx !== -1) state.listings[idx] = action.payload;
      })
      .addCase(submitListing.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitListing.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.listings.unshift(action.payload);
        state.activeDraft = null;
      })
      .addCase(submitListing.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.listings = state.listings.filter((l) => l.id !== action.payload);
      });
  },
});

export const {
  startDraft,
  updateDraft,
  clearDraft,
  setSelectedListing,
  addListingLocally,
  clearError,
} = listingSlice.actions;

export default listingSlice.reducer;

// Selectors
export const selectAllListings = (state: { listings: ListingState }) =>
  state.listings.listings;
export const selectActiveListings = (state: { listings: ListingState }) =>
  state.listings.listings.filter(
    (l) => !['PAID', 'REJECTED', 'EXPIRED'].includes(l.status),
  );
export const selectActiveDraft = (state: { listings: ListingState }) =>
  state.listings.activeDraft;
export const selectListingById = (id: string) => (state: { listings: ListingState }) =>
  state.listings.listings.find((l) => l.id === id);
export const selectIsSubmitting = (state: { listings: ListingState }) =>
  state.listings.isSubmitting;
