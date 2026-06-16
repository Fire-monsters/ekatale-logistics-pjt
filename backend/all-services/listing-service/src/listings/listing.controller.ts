// backend/all-services/listing-service/src/listings/listing.controller.ts
import { Request, Response, NextFunction } from 'express'
import { listingService } from './listing.service'
import { saveListingPhoto } from '../lib/storage'
import {
  CreateListingSchema,
  UpdateListingStatusSchema,
  ListQuerySchema,
} from './listing.validation'

const handleError = (error: unknown, res: Response) => {
  const message = error instanceof Error ? error.message : 'INTERNAL_ERROR'
  const statusMap: Record<string, number> = {
    LISTING_NOT_FOUND: 404,
    FORBIDDEN:         403,
  }
  let status = statusMap[message] ?? 500
  if (message.startsWith('INVALID_TRANSITION')) status = 409

  res.status(status).json({ success: false, error: message })
}

export class ListingController {

  // POST /farmer/listings
  async create(req: Request, res: Response) {
    try {
      const farmerId = req.user!.userId
      const input = CreateListingSchema.parse(req.body)
      const listing = await listingService.create(farmerId, input)
      res.status(201).json({ success: true, data: listing })
    } catch (error) {
      handleError(error, res)
    }
  }

  // POST /farmer/listings/:id/photos  (multipart/form-data, field name "photos")
  async uploadPhotos(req: Request, res: Response) {
    try {
      const { id } = req.params
      const listing = await listingService.getById(id)
      if (!listing) return res.status(404).json({ success: false, error: 'LISTING_NOT_FOUND' })
      if (listing.farmerId !== req.user!.userId) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' })
      }

      const files = (req.files as Express.Multer.File[]) ?? []
      if (files.length === 0) {
        return res.status(400).json({ success: false, error: 'NO_FILES' })
      }

      const stored = await Promise.all(
        files.map((f) => saveListingPhoto(id, f.buffer, f.originalname)),
      )
      const photos = await listingService.attachPhotos(id, stored)
      res.status(201).json({ success: true, data: photos })
    } catch (error) {
      handleError(error, res)
    }
  }

  // GET /farmer/listings  (own listings)
  async listMine(req: Request, res: Response) {
    try {
      const farmerId = req.user!.userId
      const query = ListQuerySchema.parse(req.query)
      const result = await listingService.listForFarmer(farmerId, query)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  // GET /farmer/listings/:id
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const listing = await listingService.getById(id)
      if (!listing) return res.status(404).json({ success: false, error: 'LISTING_NOT_FOUND' })

      // Farmers can only view their own listing; staff can view any.
      const isOwner = listing.farmerId === req.user!.userId
      const isStaff = ['admin', 'warehouse', 'village_agent'].includes(req.user!.role)
      if (!isOwner && !isStaff) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' })
      }

      res.status(200).json({ success: true, data: listing })
    } catch (error) {
      handleError(error, res)
    }
  }

  // GET /listings  (warehouse/admin — all listings, filterable)
  async listAll(req: Request, res: Response) {
    try {
      const query = ListQuerySchema.parse(req.query)
      const result = await listingService.listAll({
        ...query,
        district:    req.query.district as string | undefined,
        commodityId: req.query.commodityId as string | undefined,
      })
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  // PATCH /listings/:id/status  (warehouse/admin transitions; farmer can CANCEL own DRAFT)
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const input = UpdateListingStatusSchema.parse(req.body)

      const listing = await listingService.getById(id)
      if (!listing) return res.status(404).json({ success: false, error: 'LISTING_NOT_FOUND' })

      const isOwner = listing.farmerId === req.user!.userId
      const isStaff = ['admin', 'warehouse'].includes(req.user!.role)

      // Farmers may only cancel their own not-yet-collected listings
      if (!isStaff) {
        if (!isOwner) return res.status(403).json({ success: false, error: 'FORBIDDEN' })
        if (input.status !== 'CANCELLED') {
          return res.status(403).json({ success: false, error: 'FORBIDDEN' })
        }
      }

      const updated = await listingService.updateStatus(id, input, {
        userId: req.user!.userId,
        role:   req.user!.role,
      })
      res.status(200).json({ success: true, data: updated })
    } catch (error) {
      handleError(error, res)
    }
  }

  // DELETE /farmer/listings/:id  (owner only, DRAFT/PENDING_REVIEW only)
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const listing = await listingService.getById(id)
      if (!listing) return res.status(404).json({ success: false, error: 'LISTING_NOT_FOUND' })
      if (listing.farmerId !== req.user!.userId) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' })
      }
      if (!['DRAFT', 'PENDING_REVIEW'].includes(listing.status)) {
        return res.status(409).json({ success: false, error: 'CANNOT_DELETE_AFTER_REVIEW' })
      }
      await listingService.delete(id)
      res.status(204).send()
    } catch (error) {
      handleError(error, res)
    }
  }
}

export const listingController = new ListingController()