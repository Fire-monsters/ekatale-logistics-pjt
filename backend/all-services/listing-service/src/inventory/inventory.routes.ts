// backend/all-services/listing-service/src/inventory/inventory.routes.ts
import { Router } from 'express'
import { inventoryController } from './inventory.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

// ── SKU Routes ─────────────────────────────────────────────────────────────
// Only admin can create or update SKUs
router.post('/inventory/skus', authenticate, requireRole('admin'), inventoryController.createSku.bind(inventoryController))
router.patch('/inventory/skus/:id', authenticate, requireRole('admin'), inventoryController.updateSku.bind(inventoryController))
router.get('/inventory/skus/:id', authenticate, inventoryController.getSkuById.bind(inventoryController))
router.get('/inventory/skus', authenticate, inventoryController.listSkus.bind(inventoryController))

// ── Stock / Warehouse Stock Routes ─────────────────────────────────────────
// Adjust stock (admin/warehouse only)
router.post('/inventory/adjust', authenticate, requireRole('admin', 'warehouse'), inventoryController.adjustStock.bind(inventoryController))

// Reserve and release stock (admin/warehouse only)
router.post('/inventory/reserve', authenticate, requireRole('admin', 'warehouse'), inventoryController.reserveStock.bind(inventoryController))
router.post('/inventory/release', authenticate, requireRole('admin', 'warehouse'), inventoryController.releaseStock.bind(inventoryController))

// View stock and movements (staff/admin)
router.get('/inventory/stock', authenticate, requireRole('admin', 'warehouse'), inventoryController.listStock.bind(inventoryController))
router.get('/inventory/movements', authenticate, requireRole('admin', 'warehouse'), inventoryController.listStockMovements.bind(inventoryController))

export default router
