// backend/all-services/listing-service/src/listings/listing.service.ts
import { prisma } from '../lib/prisma'
import type { CreateListingInput, UpdateListingStatusInput, ListQueryInput } from './listing.validation'
import type { StoredFile } from '../lib/storage'
import { notify, STATUS_MESSAGES } from '../lib/notify'
import type { NotificationChannel } from '../lib/notify'

/** Platform commission taken when a listing is collected/paid out */
export const PLATFORM_COMMISSION_PCT = 3

// Valid forward transitions — prevents skipping/jumping the pipeline by mistake.
// (Admin/warehouse roles can still force REJECTED/CANCELLED from most states.)
const FORWARD_TRANSITIONS: Record<string, string[]> = {
  DRAFT:            ['PENDING_REVIEW', 'CANCELLED'],
  PENDING_REVIEW:   ['ACTIVE', 'REJECTED', 'CANCELLED'],
  ACTIVE:           ['ORDER_CONFIRMED', 'EXPIRED', 'CANCELLED'],
  ORDER_CONFIRMED:  ['COLLECTED', 'CANCELLED'],
  COLLECTED:        ['DISPATCHED'],
  DISPATCHED:       ['DELIVERED'],
  DELIVERED:        ['PAID'],
  PAID:             ['COMPLETED'],
  COMPLETED:        [],
  CANCELLED:        [],
  REJECTED:         [],
  EXPIRED:          [],
}

export class ListingService {

  // ── CREATE ───────────────────────────────────────────────────────────────
  async create(farmerId: string, input: CreateListingInput) {
    // Idempotency: if this offlineId was already submitted, return the
    // existing listing instead of creating a duplicate (offline-sync retries).
    if (input.offlineId) {
      const existing = await prisma.produceListing.findUnique({
        where: { offlineId: input.offlineId },
        include: { photos: true },
      })
      if (existing) return existing
    }

    const listing = await prisma.produceListing.create({
      data: {
        farmerId,
        commodityId:        input.commodityId,
        quantity:           input.quantity,
        unit:               input.unit,
        grade:              input.grade,
        askingPricePerUnit: input.askingPricePerUnit,
        availabilityDate:   input.availabilityDate ? new Date(input.availabilityDate) : undefined,
        district:           input.district,
        village:            input.village,
        gpsLat:             input.gpsLat,
        gpsLng:             input.gpsLng,
        qualityDescription: input.qualityDescription,
        aiScore:            input.aiScore,
        aiDiseaseFlag:      input.aiDiseaseFlag ?? false,
        aiReport:           input.aiReport as any,
        source:             input.source,
        offlineId:          input.offlineId,
        status:             'PENDING_REVIEW',
      },
      include: { photos: true },
    })

  await prisma.listingStatusHistory.create({
      data: {
        listingId: listing.listingId,
        fromStatus: null,
        toStatus: 'PENDING_REVIEW',
        changedBy: farmerId,
        changedByRole: 'farmer',
        notes: `Listing created via ${input.source}`,
      },
    })

    return listing
  }

  // ── ATTACH PHOTOS ────────────────────────────────────────────────────────
  async attachPhotos(listingId: string, files: StoredFile[]) {
    const existingCount = await prisma.listingPhoto.count({ where: { listingId } })

    const photos = await prisma.$transaction(
      files.map((f, i) =>
        prisma.listingPhoto.create({
          data: {
            listingId,
            storageKey: f.storageKey,
            url:        f.url,
            fileSizeKb: f.sizeKb,
            isPrimary:  existingCount === 0 && i === 0,
            sortOrder:  existingCount + i,
          },
        }),
      ),
    )

    return photos
  }

  // ── GET BY ID ────────────────────────────────────────────────────────────
  async getById(listingId: string) {
    return prisma.produceListing.findUnique({
      where: { listingId },
      include: {
        photos: { orderBy: { sortOrder: 'asc' } },
        commodity: true,
        history: { orderBy: { createdAt: 'asc' } },
      },
    })
  }

  // ── LIST FOR A FARMER ────────────────────────────────────────────────────
  async listForFarmer(farmerId: string, query: ListQueryInput) {
    const where: any = { farmerId }
    if (query.status) where.status = query.status

    const [items, total] = await Promise.all([
      prisma.produceListing.findMany({
        where,
        include: { photos: { where: { isPrimary: true }, take: 1 }, commodity: true },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.produceListing.count({ where }),
    ])

    return { items, total, page: query.page, limit: query.limit }
  }

  // ── LIST FOR WAREHOUSE / ADMIN (all farmers, filterable) ────────────────
  async listAll(query: ListQueryInput & { district?: string; commodityId?: string }) {
    const where: any = {}
    if (query.status)      where.status = query.status
    if (query.district)    where.district = query.district
    if (query.commodityId) where.commodityId = query.commodityId

    const [items, total] = await Promise.all([
      prisma.produceListing.findMany({
        where,
        include: { photos: { where: { isPrimary: true }, take: 1 }, commodity: true },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.produceListing.count({ where }),
    ])

    return { items, total, page: query.page, limit: query.limit }
  }

  // ── UPDATE STATUS (the core lifecycle transition) ────────────────────────
  async updateStatus(
    listingId: string,
    input: UpdateListingStatusInput,
    actor: { userId: string; role: string },
  ) {
    const listing = await prisma.produceListing.findUnique({ where: { listingId } })
    if (!listing) throw new Error('LISTING_NOT_FOUND')

    const allowed = FORWARD_TRANSITIONS[listing.status] ?? []
    const isForceableByStaff = ['admin', 'warehouse'].includes(actor.role)
      && ['REJECTED', 'CANCELLED'].includes(input.status)

    if (!allowed.includes(input.status) && !isForceableByStaff) {
      throw new Error(
        `INVALID_TRANSITION:${listing.status}->${input.status}`,
      )
    }

    const data: any = {
      status: input.status,
    }

    if (input.rejectionReason) data.rejectionReason = input.rejectionReason
    if (input.notes)           data.warehouseNotes = input.notes

    // When the warehouse confirms collection, lock in pricing & commission.
    if (input.status === 'COLLECTED') {
      const pricePerUnit = input.finalPricePerUnit ?? Number(listing.askingPricePerUnit ?? 0)
      const total        = pricePerUnit * Number(listing.quantity)
      const commission   = Math.round(total * (PLATFORM_COMMISSION_PCT / 100))

      data.finalPricePerUnit = pricePerUnit
      data.totalAmount       = total
      data.commissionAmount  = commission
      data.netAmount         = total - commission
    }

    const updated = await prisma.produceListing.update({
      where: { listingId },
      data,
      include: { photos: true, commodity: true },
    })

    await prisma.listingStatusHistory.create({
      data: {
        listingId,
        fromStatus: listing.status,
        toStatus: input.status,
        changedBy: actor.userId,
        changedByRole: actor.role,
        notes: input.notes ?? input.rejectionReason,
      },
    })

    // Notify the farmer of the status change (best-effort, non-blocking)
    await this.notifyFarmerOfStatusChange(updated)

    return updated
  }

/** Sends a push + SMS to the farmer when their listing's status changes */
  private async notifyFarmerOfStatusChange(listing: {
    farmerId: string
    status: string
    quantity: any
    unit: string
    commodity: { nameEn: string }
  }) {
    const copy = STATUS_MESSAGES[listing.status]
    if (!copy) return // not every status has farmer-facing copy (e.g. DRAFT, EXPIRED)

    const farmer = await prisma.user.findUnique({ where: { userId: listing.farmerId } })
    if (!farmer) return

    const ctx = {
      commodityName: listing.commodity.nameEn,
      quantity: Number(listing.quantity),
      unit: listing.unit,
    }

    // SMS only for the most critical milestones — keeps SMS costs down while
    // every status change still appears in-app + push.
    const SMS_WORTHY = ['ACTIVE', 'ORDER_CONFIRMED', 'COLLECTED', 'PAID', 'REJECTED']
    const channels: NotificationChannel[] = SMS_WORTHY.includes(listing.status)
      ? ['PUSH', 'SMS', 'IN_APP']
      : ['PUSH', 'IN_APP']

    await notify({
      userId: listing.farmerId,
      phone: farmer.phone,
      title: copy.title,
      message: copy.message(ctx),
      data: { type: 'LISTING_STATUS', status: listing.status },
      channels,
    })
  }

  // ── DELETE (only DRAFT/PENDING_REVIEW, owner only — enforced in controller) ─
  async delete(listingId: string) {
    await prisma.produceListing.delete({ where: { listingId } })
  }
}

export const listingService = new ListingService()