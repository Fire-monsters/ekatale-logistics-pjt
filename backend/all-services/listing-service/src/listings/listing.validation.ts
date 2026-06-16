// backend/all-services/listing-service/src/listings/listing.validation.ts
import { z } from 'zod'

export const ProduceUnitEnum = z.enum(['kg', 'tonne', 'sack', 'crate', 'bunch'])
export const ProduceGradeEnum = z.enum(['A', 'B', 'C'])

export const ListingStatusEnum = z.enum([
  'DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'ORDER_CONFIRMED',
  'COLLECTED', 'DISPATCHED', 'DELIVERED', 'PAID',
  'COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED',
])

/**
 * Create a listing.
 * `offlineId` lets the mobile app's offline sync queue dedupe: if a listing
 * with this offlineId already exists, the API returns it instead of creating
 * a duplicate (idempotent create — critical for retry-after-reconnect).
 */
export const CreateListingSchema = z.object({
  commodityId:        z.string().min(1, 'Select a crop type'),
  quantity:           z.number().positive('Enter a valid quantity').max(1_000_000),
  unit:               ProduceUnitEnum.default('kg'),
  grade:              ProduceGradeEnum.default('B'),
  askingPricePerUnit: z.number().positive().optional(),
  availabilityDate:   z.string().optional(),       // ISO date string
  district:           z.string().max(100).optional(),
  village:            z.string().max(100).optional(),
  gpsLat:             z.number().min(-90).max(90).optional(),
  gpsLng:             z.number().min(-180).max(180).optional(),
  qualityDescription: z.string().max(500).optional(),
  aiScore:            z.number().min(0).max(100).optional(),
  aiDiseaseFlag:      z.boolean().optional(),
  aiReport:           z.record(z.unknown()).optional(),
  source:             z.enum(['app', 'ussd', 'agent']).default('app'),
  offlineId:          z.string().max(100).optional(),
})

export const UpdateListingStatusSchema = z.object({
  status:             ListingStatusEnum,
  notes:              z.string().max(500).optional(),
  rejectionReason:    z.string().max(500).optional(),
  finalPricePerUnit:  z.number().positive().optional(),
})

export const ListQuerySchema = z.object({
  status:   z.string().optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateListingInput       = z.infer<typeof CreateListingSchema>
export type UpdateListingStatusInput = z.infer<typeof UpdateListingStatusSchema>
export type ListQueryInput           = z.infer<typeof ListQuerySchema>