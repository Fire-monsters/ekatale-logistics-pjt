// apps/app1-farmer/src/services/sync/offlineSync.ts
import { SYNC_ACTION_TYPES, BUSINESS_RULES } from '../../constants';
import {
  getPendingSyncActions,
  removeSyncAction,
  incrementRetryCount,
  removePendingListing,
} from '../../db/database';
import { listingApi } from '../api/listing.api';
import type { ProduceListing, SyncActionType } from '../../types';

// ─────────────────────────────────────────────
// Payload shapes for each queued action type
// (kept here so listingSlice and this engine agree on the contract)
// ─────────────────────────────────────────────

export interface CreateListingActionPayload {
  offlineId: string;
  listing: Parameters<typeof listingApi.create>[0];
  photoUris: string[];
}

export interface UploadPhotosActionPayload {
  listingId: string;
  photoUris: string[];
}

export interface CancelListingActionPayload {
  listingId: string;
}

export interface SyncResult {
  /** Listings that were successfully created — keyed by their offlineId so
   *  the redux slice can replace the optimistic local entry with the real one. */
  created: { offlineId: string; listing: ProduceListing }[];
  /** Listing IDs that were successfully cancelled */
  cancelled: string[];
  failedCount: number;
  droppedCount: number;
}

/**
 * Processes the offline sync queue in order (FIFO). Each action is
 * idempotent server-side (CREATE_LISTING uses offlineId for dedupe), so
 * it's safe to retry after partial failures.
 *
 * Call this whenever connectivity is restored (see hooks/useOfflineSync.ts).
 */
export async function runSync(): Promise<SyncResult> {
  const result: SyncResult = { created: [], cancelled: [], failedCount: 0, droppedCount: 0 };
  const actions = await getPendingSyncActions();

  for (const action of actions) {
    try {
      await processAction(action.actionType as SyncActionType, action.payload, result);
      await removeSyncAction(action.id);
    } catch (err: any) {
      await incrementRetryCount(action.id, err?.message ?? 'Unknown error');
      result.failedCount += 1;

      if (action.retryCount + 1 >= BUSINESS_RULES.SYNC_MAX_RETRIES) {
        // Give up on this action — drop it so it doesn't block the queue
        // forever. The user can re-create the listing manually; we keep
        // the local pending-listing row marked (not deleted) so MyListings
        // can show a "sync failed" state rather than silently disappearing.
        await removeSyncAction(action.id);
        result.droppedCount += 1;
      }
    }
  }

  return result;
}

async function processAction(
  type: SyncActionType,
  payload: unknown,
  result: SyncResult,
): Promise<void> {
  switch (type) {
    case SYNC_ACTION_TYPES.CREATE_LISTING: {
      const p = payload as CreateListingActionPayload;

      // Idempotent — if this offlineId was already synced (e.g. previous
      // attempt created it but then failed on the photo step), the server
      // returns the existing listing instead of duplicating it.
      const listing = await listingApi.create({ ...p.listing, offlineId: p.offlineId });

      // Upload any photos captured while offline
      if (p.photoUris.length > 0) {
        try {
          const photos = await listingApi.uploadPhotos(listing.id, p.photoUris);
          listing.photos = photos.map((ph) => ph.url);
        } catch (photoErr) {
          // Listing exists but photos failed — leave a queued UPLOAD_PHOTOS
          // action so they're retried independently next sync pass.
          console.warn('Photo upload failed during sync, will retry separately:', photoErr);
        }
      }

      await removePendingListing(p.offlineId);
      result.created.push({ offlineId: p.offlineId, listing });
      break;
    }

    case SYNC_ACTION_TYPES.UPLOAD_PHOTOS: {
      const p = payload as UploadPhotosActionPayload;
      await listingApi.uploadPhotos(p.listingId, p.photoUris);
      break;
    }

    case SYNC_ACTION_TYPES.CANCEL_LISTING: {
      const p = payload as CancelListingActionPayload;
      await listingApi.cancel(p.listingId);
      result.cancelled.push(p.listingId);
      break;
    }

    default:
      // Unknown action type — drop it rather than looping forever
      console.warn(`Unknown sync action type: ${type}`);
  }
}