export enum UserRole {
  FARMER = 'farmer',
  VILLAGE_AGENT = 'village_agent',
  WAREHOUSE = 'warehouse',
  SME = 'sme',
  GROCERY = 'grocery',
  CONSUMER = 'consumer',
  TRANSPORT = 'transport',
  ADMIN = 'admin',
}

export type Language = 'en' | 'lg' | 'sw' | 'rn';
export type ProduceUnit = 'kg' | 'tonne' | 'sack' | 'crate' | 'bunch';
export type ProduceGrade = 'A' | 'B' | 'C';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  name?: string;
  fullName?: string;
  language: Language;
}

export interface FarmerProfile {
  userId?: string;
  fullName?: string;
  nin?: string;
  district?: string;
  village?: string;
  farmSizeAcres?: number;
  crops?: string[];
  paymentProvider?: 'MTN_MOMO' | 'AIRTEL_MONEY';
  paymentNumber?: string;
  gpsLat?: number;
  gpsLng?: number;
}

export interface AgentProfile {
  userId?: string;
  fullName?: string;
  territoryDistrict?: string;
  territoryVillages?: string[];
  commissionRate?: number;
  totalFarmersReg?: number;
  totalEarnings?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─────────────────────────────────────────────
// COMMODITIES (taxonomy from listing-service)
// ─────────────────────────────────────────────

export interface Commodity {
  commodityId: string;
  nameEn: string;
  nameLg?: string | null;
  nameSw?: string | null;
  category: string;
  unitDefault: ProduceUnit;
  emoji?: string | null;
}

// ─────────────────────────────────────────────
// LISTINGS
// ─────────────────────────────────────────────

export interface ListingPhoto {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface ListingStatusHistoryEntry {
  fromStatus: ListingStatus | null;
  toStatus: ListingStatus;
  notes?: string | null;
  createdAt: string;
}

/**
 * App-side shape of a produce listing.
 * The listing-service returns a richer/differently-keyed object
 * (listingId, commodity: {...}, photos: [{url,...}]) — `mapListingResponse`
 * in services/api/listing.api.ts normalises it to this shape so existing
 * screens (MyListings, ListingDetail, FarmerDashboard) don't need to change.
 */
export interface ProduceListing {
  id: string;
  farmerId?: string;
  commodityId: string;
  commodityName: string;
  commodityEmoji?: string;
  quantity: number;
  unit: ProduceUnit;
  grade: ProduceGrade;
  status: ListingStatus;
  availabilityDate?: string;
  askingPricePerUnit?: number;
  district?: string;
  village?: string;
  gpsLat?: number;
  gpsLng?: number;
  photos?: string[];
  qualityDescription?: string;
  aiScore?: number;
  aiDiseaseFlag?: boolean;
  aiReport?: Record<string, unknown> | null;
  rejectionReason?: string | null;
  warehouseNotes?: string | null;
  finalPricePerUnit?: number;
  totalAmount?: number;
  commissionAmount?: number;
  netAmount?: number;
  statusHistory?: ListingStatusHistoryEntry[];
  source?: 'app' | 'ussd' | 'agent';
  /** Set when this listing was created offline and not yet synced */
  pendingSync?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ListingStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'ORDER_CONFIRMED'
  | 'COLLECTED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'PAID'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED';

export type OrderStatus =
  | 'NEW'
  | 'PENDING'
  | 'ORDER_CONFIRMED'
  | 'COLLECTED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface PriceGuidance {
  commodityId: string;
  commodityName?: string;
  commodityEmoji?: string;
  unit?: ProduceUnit;
  regionId: string;
  currentPrice: number;
  floorPrice?: number;
  ceilingPrice?: number;
  trend?: 'RISING' | 'FALLING' | 'STABLE';
  trendPct?: number;
}

export interface PriceForecastPoint {
  date: string;
  price: number;
}

export interface PriceForecast {
  commodityId: string;
  regionId: string;
  currentPrice: number;
  forecast14d: PriceForecastPoint[];
}

export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  description?: string;
}

export interface TransportJob {
  id: string;
  status: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  driverId?: string;
}

// ─────────────────────────────────────────────
// NOTIFICATIONS (Firestore real-time documents)
// ─────────────────────────────────────────────

export type NotificationChannel = 'PUSH' | 'SMS' | 'IN_APP';

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message?: string;
  body?: string;
  channels?: NotificationChannel[];
  read?: boolean;
  isRead?: boolean;
  createdAt: string;
  updatedAt?: string;
  data?: Record<string, unknown>;
  channel?: string;
}

// ─────────────────────────────────────────────
// OFFLINE SYNC QUEUE
// ─────────────────────────────────────────────

export type SyncActionType = 'CREATE_LISTING' | 'UPLOAD_PHOTOS' | 'CANCEL_LISTING';

export interface SyncQueueAction {
  id: string;
  actionType: SyncActionType;
  payload: unknown;
  retryCount: number;
}