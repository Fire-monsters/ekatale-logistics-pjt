import { z } from 'zod'

export const ProductQuerySchema = z.object({
  category: z.string().max(100).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const CreateOrderItemSchema = z.object({
  productId: z.string().uuid().optional(),
  productName: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPriceUgx: z.coerce.number().nonnegative(),
})

export const CreateConsumerOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().max(50).optional(),
  deliveryAddress: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
  deliveryFeeUgx: z.coerce.number().min(0).default(0),
  items: z.array(CreateOrderItemSchema).min(1),
})

export const OrderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type ProductQueryInput = z.infer<typeof ProductQuerySchema>
export type CreateConsumerOrderInput = z.infer<typeof CreateConsumerOrderSchema>
export type OrderQueryInput = z.infer<typeof OrderQuerySchema>
