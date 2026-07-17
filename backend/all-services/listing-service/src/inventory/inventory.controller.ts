// backend/all-services/listing-service/src/inventory/inventory.controller.ts
import { Request, Response } from 'express'
import { inventoryService } from './inventory.service'
import {
  CreateSkuSchema,
  UpdateSkuSchema,
  AdjustStockSchema,
  ReserveStockSchema,
  ReleaseStockSchema,
  StockQuerySchema,
  SkuQuerySchema,
} from './inventory.validation'

const handleError = (error: unknown, res: Response) => {
  const message = error instanceof Error ? error.message : 'INTERNAL_ERROR'
  const statusMap: Record<string, number> = {
    COMMODITY_NOT_FOUND:           404,
    SKU_NOT_FOUND:                 404,
    STOCK_NOT_FOUND:               404,
    SKU_CODE_ALREADY_EXISTS:       409,
    INSUFFICIENT_STOCK:            400,
    STOCK_CANNOT_BE_LESS_THAN_RESERVED: 400,
    INSUFFICIENT_RESERVED_STOCK:   400,
    INSUFFICIENT_PHYSICAL_STOCK:   400,
    FORBIDDEN:                     403,
  }
  let status = statusMap[message] ?? 500
  res.status(status).json({ success: false, error: message })
}

export class InventoryController {
  
  // ── SKU CONTROLLER METHODS ────────────────────────────────────────────────

  // POST /inventory/skus
  async createSku(req: Request, res: Response) {
    try {
      const input = CreateSkuSchema.parse(req.body)
      const sku = await inventoryService.createSku(input)
      res.status(201).json({ success: true, data: sku })
    } catch (error) {
      handleError(error, res)
    }
  }

  // PATCH /inventory/skus/:id
  async updateSku(req: Request, res: Response) {
    try {
      const { id } = req.params
      const input = UpdateSkuSchema.parse(req.body)
      const sku = await inventoryService.updateSku(id, input)
      res.status(200).json({ success: true, data: sku })
    } catch (error) {
      handleError(error, res)
    }
  }

  // GET /inventory/skus/:id
  async getSkuById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const sku = await inventoryService.getSkuById(id)
      if (!sku) {
        return res.status(404).json({ success: false, error: 'SKU_NOT_FOUND' })
      }
      res.status(200).json({ success: true, data: sku })
    } catch (error) {
      handleError(error, res)
    }
  }

  // GET /inventory/skus
  async listSkus(req: Request, res: Response) {
    try {
      const query = SkuQuerySchema.parse(req.query)
      const result = await inventoryService.listSkus(query)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  // ── STOCK CONTROLLER METHODS ──────────────────────────────────────────────

  // POST /inventory/adjust
  async adjustStock(req: Request, res: Response) {
    try {
      const changedBy = req.user!.userId
      const input = AdjustStockSchema.parse(req.body)

      // Ensure that only admins or warehouse managers (role: 'warehouse') can adjust stock
      const isStaff = ['admin', 'warehouse'].includes(req.user!.role)
      if (!isStaff) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' })
      }

      const stock = await inventoryService.adjustStock(input, changedBy)
      res.status(200).json({ success: true, data: stock })
    } catch (error) {
      handleError(error, res)
    }
  }

  // POST /inventory/reserve
  async reserveStock(req: Request, res: Response) {
    try {
      const changedBy = req.user!.userId
      const input = ReserveStockSchema.parse(req.body)

      const isAllowed = ['admin', 'warehouse'].includes(req.user!.role)
      if (!isAllowed) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' })
      }

      const stock = await inventoryService.reserveStock(input, changedBy)
      res.status(200).json({ success: true, data: stock })
    } catch (error) {
      handleError(error, res)
    }
  }

  // POST /inventory/release
  async releaseStock(req: Request, res: Response) {
    try {
      const changedBy = req.user!.userId
      const input = ReleaseStockSchema.parse(req.body)

      const isAllowed = ['admin', 'warehouse'].includes(req.user!.role)
      if (!isAllowed) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' })
      }

      const stock = await inventoryService.releaseStock(input, changedBy)
      res.status(200).json({ success: true, data: stock })
    } catch (error) {
      handleError(error, res)
    }
  }

  // GET /inventory/stock
  async listStock(req: Request, res: Response) {
    try {
      const query = StockQuerySchema.parse(req.query)
      const result = await inventoryService.listStock(query)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  // GET /inventory/movements
  async listStockMovements(req: Request, res: Response) {
    try {
      const query = StockQuerySchema.parse(req.query)
      const result = await inventoryService.listStockMovements(query)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }
}

export const inventoryController = new InventoryController()
