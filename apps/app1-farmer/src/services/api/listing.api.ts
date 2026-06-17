// apps/app1-farmer/src/services/api/listing.api.ts
import { get, post, patch, del } from './httpClient';
import { LISTING_API_BASE_URL, API_ROUTES } from '../../constants';
import type {
  ProduceListing,
  ListingStatus,
  ProduceUnit,
  ProduceGrade,
  ListingPhoto,
} from '../../types';

// ─────────────────────────────────────────────
// Raw shapes returned by listing-service
// (snake_case DB columns are mapped to camelCase by Prisma already,
// but the object shape differs from the app's flat ProduceListing)
// ─────────────────────────────────────────────

interface RawCommodity {
  commodityId: string;
  nameEn: string;
  emoji?: string | null;
}

interface RawPhoto {
  photoId: string;
  url: string;
  isPrimary: boolean;
}

interface RawHistoryEntry {
  fromStatus: string | null;
  toStatus: string;
  notes?: string | null;
  createdAt: string;
}

interface RawListing {
  listingId: string;
  farmerId: string;
  commodityId: string;
  commodity?: RawCommodity;
  quantity: string | number;
  unit: string;
  grade: string;
  status: string;
  availabilityDate?: string | null;
  askingPricePerUnit?: string | number | null;
  district?: string | null;
  village?: string | null;
  gpsLat?: string | number | null;
  gpsLng?: string | number | null;
  qualityDescription?: string | null;
  aiScore?: number | null;
  aiDiseaseFlag?: boolean;
  aiReport?: Record<string, unknown> | null;
  rejectionReason?: string | null;
  warehouseNotes?: string | null;
  finalPricePerUnit?: string | number | null;
  totalAmount?: string | number | null;
  commissionAmount?: string | number | null;
  netAmount?: string | number | null;
  source?: string;
  photos?: RawPhoto[];
  history?: RawHistoryEntry[];
  createdAt: string;
  updatedAt?: string;
}

interface PaginatedRaw {
  items: RawListing[];
  total: number;
  page: number;
  limit: number;
}

const num = (v: string | number | null | undefined): number | undefined =>
  v === null || v === undefined ? undefined : Number(v);

/**
 * Normalises a listing-service response into the app's flat ProduceListing
 * shape used by MyListings, ListingDetail, FarmerDashboard, etc.
 */
export function mapListingResponse(raw: RawListing): ProduceListing {
  return {
    id: raw.listingId,
    farmerId: raw.farmerId,
    commodityId: raw.commodityId,
    commodityName: raw.commodity?.nameEn ?? raw.commodityId,
    commodityEmoji: raw.commodity?.emoji ?? undefined,
    quantity: Number(raw.quantity),
    unit: raw.unit as ProduceUnit,
    grade: raw.grade as ProduceGrade,
    status: raw.status as ListingStatus,
    availabilityDate: raw.availabilityDate ?? undefined,
    askingPricePerUnit: num(raw.askingPricePerUnit),
    district: raw.district ?? undefined,
    village: raw.village ?? undefined,
    gpsLat: num(raw.gpsLat),
    gpsLng: num(raw.gpsLng),
    qualityDescription: raw.qualityDescription ?? undefined,
    aiScore: raw.aiScore ?? undefined,
    aiDiseaseFlag: raw.aiDiseaseFlag ?? false,
    aiReport: raw.aiReport ?? null,
    rejectionReason: raw.rejectionReason ?? null,
    warehouseNotes: raw.warehouseNotes ?? null,
    finalPricePerUnit: num(raw.finalPricePerUnit),
    totalAmount: num(raw.totalAmount),
    commissionAmount: num(raw.commissionAmount),
    netAmount: num(raw.netAmount),
    source: (raw.source as ProduceListing['source']) ?? 'app',
    photos: (raw.photos ?? [])
      .slice()
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
      .map((p) => p.url),
    statusHistory: (raw.history ?? []).map((h) => ({
      fromStatus: (h.fromStatus as ListingStatus) ?? null,
      toStatus: h.toStatus as ListingStatus,
      notes: h.notes,
      createdAt: h.createdAt,
    })),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export interface CreateListingPayload {
  commodityId: string;
  quantity: number;
  unit: ProduceUnit;
  grade: ProduceGrade;
  askingPricePerUnit?: number;
  availabilityDate?: string;
  district?: string;
  village?: string;
  gpsLat?: number;
  gpsLng?: number;
  qualityDescription?: string;
  aiScore?: number;
  aiDiseaseFlag?: boolean;
  aiReport?: Record<string, unknown>;
  source?: 'app' | 'ussd' | 'agent';
  /** Client-generated UUID — lets the server dedupe retried offline syncs */
  offlineId?: string;
  /**
   * Display-only — not part of the listing-service schema (stripped
   * server-side). Carried so the offline-optimistic entry in MyListings
   * can show "Maize" instead of "maize" before the first sync.
   */
  commodityName?: string;
}

export interface PaginatedListings {
  items: ProduceListing[];
  total: number;
  page: number;
  limit: number;
}

export const listingApi = {
  /** Create a listing. Safe to retry with the same offlineId (idempotent). */
  create: async (payload: CreateListingPayload): Promise<ProduceListing> => {
    const raw = await post<RawListing>(LISTING_API_BASE_URL, API_ROUTES.FARMER_LISTING_CREATE, payload);
    return mapListingResponse(raw);
  },

  /** Upload 1-4 photos for a listing. `uris` are local file:// URIs from the picker/camera. */
  uploadPhotos: async (listingId: string, uris: string[]): Promise<ListingPhoto[]> => {
    const formData = new FormData();
    uris.forEach((uri, i) => {
      formData.append('photos', {
        uri,
        type: 'image/jpeg',
        name: `crop_${Date.now()}_${i}.jpg`,
      } as any);
    });
    const photos = await post<{ photoId: string; url: string; isPrimary: boolean }[]>(
      LISTING_API_BASE_URL,
      API_ROUTES.FARMER_LISTING_PHOTOS(listingId),
      formData,
    );
    return photos.map((p) => ({ id: p.photoId, url: p.url, isPrimary: p.isPrimary }));
  },

  getMyListings: async (params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedListings> => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';

    const raw = await get<PaginatedRaw>(LISTING_API_BASE_URL, `${API_ROUTES.FARMER_LISTINGS}${query}`);
    return { ...raw, items: raw.items.map(mapListingResponse) };
  },

  getById: async (id: string): Promise<ProduceListing> => {
    const raw = await get<RawListing>(LISTING_API_BASE_URL, API_ROUTES.FARMER_LISTING_BY_ID(id));
    return mapListingResponse(raw);
  },

  /** Farmer can only cancel their own not-yet-collected listing */
  cancel: async (id: string): Promise<ProduceListing> => {
    const raw = await patch<RawListing>(LISTING_API_BASE_URL, API_ROUTES.LISTING_STATUS(id), {
      status: 'CANCELLED',
    });
    return mapListingResponse(raw);
  },

  /** Only allowed while status is DRAFT or PENDING_REVIEW */
  delete: (id: string) => del<void>(LISTING_API_BASE_URL, API_ROUTES.FARMER_LISTING_DELETE(id)),
};