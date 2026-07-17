// backend/all-services/listing-service/src/inventory/inventory.validation.ts
import { z } from 'zod'

export const StockMovementTypeEnum = z.enum([
  'INBOUND',
  'OUTBOUND',
  'RESERVATION',
  'RELEASE_RESERVATION',
  'ADJUSTMENT',
])

export const CreateSkuSchema = z.object({
  skuCode:     z.string().min(2, 'SKU code must be at least 2 characters').max(50),
  commodityId: z.string().min(1, 'Select a commodity'),
  grade:       z.string().length(1, 'Grade must be 1 character').default('B'),
  unit:        z.string().min(1, 'Unit is required').default('kg'),
  name:        z.string().min(2, 'SKU name is required').max(255),
  description: z.string().max(500).optional(),
})

export const UpdateSkuSchema = z.object({
  name:        z.string().min(2, 'SKU name is required').max(255).optional(),
  description: z.string().max(500).optional(),
  isActive:    z.boolean().optional(),
})

export const AdjustStockSchema = z.object({
  warehouseId:   z.string().uuid('Invalid warehouse ID'),
  skuId:         z.string().uuid('Invalid SKU ID'),
  quantity:      z.number({ required_error: 'Quantity is required' }), // can be negative for adjustments
  type:          z.enum(['INBOUND', 'OUTBOUND', 'ADJUSTMENT']).default('ADJUSTMENT'),
  referenceType: z.string().max(50).optional(),
  referenceId:   z.string().max(100).optional(),
  notes:         z.string().max(500).optional(),
})

export const ReserveStockSchema = z.object({
  warehouseId:   z.string().uuid('Invalid warehouse ID'),
  skuId:         z.string().uuid('Invalid SKU ID'),
  quantity:      z.number().positive('Reservation quantity must be positive'),
  referenceType: z.string().max(50).optional(),
  referenceId:   z.string().max(100).optional(),
  notes:         z.string().max(500).optional(),
})

export const ReleaseStockSchema = z.object({
  warehouseId:   z.string().uuid('Invalid warehouse ID'),
  skuId:         z.string().uuid('Invalid SKU ID'),
  quantity:      z.number().positive('Quantity must be positive'),
  commit:        z.boolean().default(false), // true to consume/dispatch, false to release back to available
  referenceType: z.string().max(50).optional(),
  referenceId:   z.string().max(100).optional(),
  notes:         z.string().max(500).optional(),
})

export const StockQuerySchema = z.object({
  warehouseId: z.string().uuid('Invalid warehouse ID').optional(),
  skuId:       z.string().uuid('Invalid SKU ID').optional(),
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
})

export const SkuQuerySchema = z.object({
  commodityId: z.string().optional(),
  page:        z.coerce.number().int().min(1).default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateSkuInput      = z.infer<typeof CreateSkuSchema>
export type UpdateSkuInput      = z.infer<typeof UpdateSkuSchema>
export type AdjustStockInput    = z.infer<typeof AdjustStockSchema>
export type ReserveStockInput   = z.infer<typeof ReserveStockSchema>
export type ReleaseStockInput   = z.infer<typeof ReleaseStockSchema>
export type StockQueryInput     = z.infer<typeof StockQuerySchema>
export type SkuQueryInput       = z.infer<typeof SkuQuerySchema>
