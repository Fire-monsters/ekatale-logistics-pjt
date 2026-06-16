// backend/all-services/listing-service/src/listings/listing.routes.ts
import { Router } from 'express'
import multer from 'multer'
import { listingController } from './listing.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 4 }, // 8MB per photo, max 4
})

const router = Router()

// ── Farmer routes ─────────────────────────────────────────────────────────────
router.post('/farmer/listings',              authenticate, requireRole('farmer'), listingController.create.bind(listingController))
router.get('/farmer/listings',               authenticate, requireRole('farmer'), listingController.listMine.bind(listingController))
router.get('/farmer/listings/:id',           authenticate, listingController.getById.bind(listingController))
router.post('/farmer/listings/:id/photos',   authenticate, requireRole('farmer'), upload.array('photos', 4), listingController.uploadPhotos.bind(listingController))
router.delete('/farmer/listings/:id',        authenticate, requireRole('farmer'), listingController.delete.bind(listingController))

// ── Status transitions (farmer can cancel own; warehouse/admin drive the rest) ─
router.patch('/listings/:id/status',         authenticate, listingController.updateStatus.bind(listingController))

// ── Warehouse / admin ────────────────────────────────────────────────────────
router.get('/listings',                      authenticate, requireRole('admin', 'warehouse'), listingController.listAll.bind(listingController))

export default router