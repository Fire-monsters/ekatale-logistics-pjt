export enum UserRole {
  FARMER = 'FARMER',
  CONSUMER = 'CONSUMER',
  WAREHOUSE = 'WAREHOUSE',
  TRANSPORT = 'TRANSPORT',
  ADMIN = 'ADMIN',
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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Listing {
  id: string;
  farmerId: string;
  cropId: string;
  quantityKg: number;
  pricePerKg: number;
  status: ListingStatus;
  createdAt: string;
}

export interface ProduceListing {
  id: string;
  farmerId?: string;
  commodityId: string;
  commodityName: string;
  quantity: number;
  unit: ProduceUnit;
  grade: ProduceGrade;
  status: ListingStatus;
  availabilityDate?: string;
  askingPricePerUnit?: number;
  photos?: string[];
  qualityDescription?: string;
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
  regionId: string;
  currentPrice: number;
  floorPrice?: number;
  ceilingPrice?: number;
  trend?: 'RISING' | 'FALLING' | 'STABLE';
  trendPct?: number;
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

export interface Notification {
  id: string;
  title: string;
  message?: string;
  body?: string;
  read?: boolean;
  isRead?: boolean;
  createdAt: string;
  updatedAt?: string;
  data?: Record<string, unknown>;
  channel?: string;
  userId?: string;
}
