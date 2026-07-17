// backend/all-services/listing-service/src/inventory/inventory.service.ts
import { prisma } from '../lib/prisma'
import { Prisma } from '.prisma/listing-client'
import type {
  CreateSkuInput,
  UpdateSkuInput,
  AdjustStockInput,
  ReserveStockInput,
  ReleaseStockInput,
  StockQueryInput,
  SkuQueryInput,
} from './inventory.validation'

export class InventoryService {

  // ── SKU MANAGEMENT ─────────────────────────────────────────────────────────

  async createSku(input: CreateSkuInput) {
    // Verify commodity exists
    const commodity = await prisma.commodity.findUnique({
      where: { commodityId: input.commodityId },
    })
    if (!commodity) {
      throw new Error('COMMODITY_NOT_FOUND')
    }

    // Check if skuCode is unique
    const existing = await prisma.sKU.findUnique({
      where: { skuCode: input.skuCode },
    })
    if (existing) {
      throw new Error('SKU_CODE_ALREADY_EXISTS')
    }

    return prisma.sKU.create({
      data: {
        skuCode:     input.skuCode,
        commodityId: input.commodityId,
        grade:       input.grade,
        unit:        input.unit,
        name:        input.name,
        description: input.description,
      },
      include: {
        commodity: true,
      },
    })
  }

  async updateSku(skuId: string, input: UpdateSkuInput) {
    const sku = await prisma.sKU.findUnique({ where: { skuId } })
    if (!sku) throw new Error('SKU_NOT_FOUND')

    return prisma.sKU.update({
      where: { skuId },
      data: input,
      include: { commodity: true },
    })
  }

  async getSkuById(skuId: string) {
    return prisma.sKU.findUnique({
      where: { skuId },
      include: { commodity: true },
    })
  }

  async getSkuByCode(skuCode: string) {
    return prisma.sKU.findUnique({
      where: { skuCode },
      include: { commodity: true },
    })
  }

  async listSkus(query: SkuQueryInput) {
    const where: any = {}
    if (query.commodityId) where.commodityId = query.commodityId

    const [items, total] = await Promise.all([
      prisma.sKU.findMany({
        where,
        include: { commodity: true },
        orderBy: { skuCode: 'asc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.sKU.count({ where }),
    ])

    return { items, total, page: query.page, limit: query.limit }
  }

  // ── STOCK MANAGEMENT ───────────────────────────────────────────────────────

  async adjustStock(input: AdjustStockInput, changedBy: string) {
    const { warehouseId, skuId, quantity, type, referenceType, referenceId, notes } = input

    // Check SKU exists
    const sku = await prisma.sKU.findUnique({ where: { skuId } })
    if (!sku) throw new Error('SKU_NOT_FOUND')

    return prisma.$transaction(async (tx) => {
      // Find current stock
      const currentStock = await tx.warehouseStock.findUnique({
        where: {
          warehouseId_skuId: { warehouseId, skuId },
        },
      })

      const currentQty = currentStock ? Number(currentStock.quantity) : 0
      const currentReserved = currentStock ? Number(currentStock.reservedQuantity) : 0
      const newQty = currentQty + quantity

      // Validate new quantity is not less than reserved stock (or less than 0)
      if (newQty < 0) {
        throw new Error('INSUFFICIENT_STOCK')
      }
      if (newQty < currentReserved) {
        throw new Error('STOCK_CANNOT_BE_LESS_THAN_RESERVED')
      }

      // Upsert warehouse stock
      const updatedStock = await tx.warehouseStock.upsert({
        where: {
          warehouseId_skuId: { warehouseId, skuId },
        },
        create: {
          warehouseId,
          skuId,
          quantity: newQty,
          reservedQuantity: 0,
        },
        update: {
          quantity: newQty,
        },
      })

      // Log movement
      await tx.stockMovement.create({
        data: {
          warehouseId,
          skuId,
          quantity: new Prisma.Decimal(quantity),
          type,
          referenceType,
          referenceId,
          notes: notes ?? `Manual adjustment of ${quantity}`,
          changedBy,
        },
      })

      return updatedStock
    })
  }

  async reserveStock(input: ReserveStockInput, changedBy: string) {
    const { warehouseId, skuId, quantity, referenceType, referenceId, notes } = input

    // Check SKU exists
    const sku = await prisma.sKU.findUnique({ where: { skuId } })
    if (!sku) throw new Error('SKU_NOT_FOUND')

    return prisma.$transaction(async (tx) => {
      const currentStock = await tx.warehouseStock.findUnique({
        where: {
          warehouseId_skuId: { warehouseId, skuId },
        },
      })

      const currentQty = currentStock ? Number(currentStock.quantity) : 0
      const currentReserved = currentStock ? Number(currentStock.reservedQuantity) : 0
      const availableQty = currentQty - currentReserved

      if (availableQty < quantity) {
        throw new Error('INSUFFICIENT_STOCK')
      }

      const updatedStock = await tx.warehouseStock.upsert({
        where: {
          warehouseId_skuId: { warehouseId, skuId },
        },
        create: {
          warehouseId,
          skuId,
          quantity: 0, // Should not happen since we checked availableQty >= quantity, but prisma upsert requires create
          reservedQuantity: quantity,
        },
        update: {
          reservedQuantity: currentReserved + quantity,
        },
      })

      // Log movement (physical qty does not change, log quantity as 0)
      await tx.stockMovement.create({
        data: {
          warehouseId,
          skuId,
          quantity: new Prisma.Decimal(0),
          type: 'RESERVATION',
          referenceType,
          referenceId,
          notes: notes ?? `Reserved ${quantity} units`,
          changedBy,
        },
      })

      return updatedStock
    })
  }

  async releaseStock(input: ReleaseStockInput, changedBy: string) {
    const { warehouseId, skuId, quantity, commit, referenceType, referenceId, notes } = input

    // Check SKU exists
    const sku = await prisma.sKU.findUnique({ where: { skuId } })
    if (!sku) throw new Error('SKU_NOT_FOUND')

    return prisma.$transaction(async (tx) => {
      const currentStock = await tx.warehouseStock.findUnique({
        where: {
          warehouseId_skuId: { warehouseId, skuId },
        },
      })

      if (!currentStock) {
        throw new Error('STOCK_NOT_FOUND')
      }

      const currentQty = Number(currentStock.quantity)
      const currentReserved = Number(currentStock.reservedQuantity)

      if (currentReserved < quantity) {
        throw new Error('INSUFFICIENT_RESERVED_STOCK')
      }

      let updatedStock;
      if (commit) {
        // Physical stock leaves the warehouse: decrease quantity & reservedQuantity
        if (currentQty < quantity) {
          throw new Error('INSUFFICIENT_PHYSICAL_STOCK')
        }

        updatedStock = await tx.warehouseStock.update({
          where: {
            warehouseId_skuId: { warehouseId, skuId },
          },
          data: {
            quantity: currentQty - quantity,
            reservedQuantity: currentReserved - quantity,
          },
        })

        // Log movement (physical qty decreases)
        await tx.stockMovement.create({
          data: {
            warehouseId,
            skuId,
            quantity: new Prisma.Decimal(-quantity),
            type: 'OUTBOUND',
            referenceType,
            referenceId,
            notes: notes ?? `Committed reservation of ${quantity} units`,
            changedBy,
          },
        })
      } else {
        // Reservation cancelled: decrease reservedQuantity only (physical quantity unchanged)
        updatedStock = await tx.warehouseStock.update({
          where: {
            warehouseId_skuId: { warehouseId, skuId },
          },
          data: {
            reservedQuantity: currentReserved - quantity,
          },
        })

        // Log movement (physical qty does not change)
        await tx.stockMovement.create({
          data: {
            warehouseId,
            skuId,
            quantity: new Prisma.Decimal(0),
            type: 'RELEASE_RESERVATION',
            referenceType,
            referenceId,
            notes: notes ?? `Released reservation of ${quantity} units`,
            changedBy,
          },
        })
      }

      return updatedStock
    })
  }

  async getStock(warehouseId: string, skuId: string) {
    return prisma.warehouseStock.findUnique({
      where: {
        warehouseId_skuId: { warehouseId, skuId },
      },
      include: {
        sku: {
          include: { commodity: true }
        }
      }
    })
  }

  async listStock(query: StockQueryInput) {
    const where: any = {}
    if (query.warehouseId) where.warehouseId = query.warehouseId
    if (query.skuId)       where.skuId = query.skuId

    const [items, total] = await Promise.all([
      prisma.warehouseStock.findMany({
        where,
        include: {
          sku: {
            include: { commodity: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.warehouseStock.count({ where }),
    ])

    return { items, total, page: query.page, limit: query.limit }
  }

  async listStockMovements(query: { warehouseId?: string; skuId?: string; page: number; limit: number }) {
    const where: any = {}
    if (query.warehouseId) where.warehouseId = query.warehouseId
    if (query.skuId)       where.skuId = query.skuId

    const [items, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          sku: {
            include: { commodity: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.stockMovement.count({ where }),
    ])

    return { items, total, page: query.page, limit: query.limit }
  }
}

export const inventoryService = new InventoryService()
