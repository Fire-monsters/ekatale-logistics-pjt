// backend/all-services/listing-service/src/prices/price.service.ts
import { prisma } from '../lib/prisma'

export class PriceService {

  /**
   * Get current price guidance.
   * Falls back to 'national' region if no district-specific price is set.
   */
  async getPrices(commodityIds?: string[], regionId?: string) {
    const where: any = {}
    if (commodityIds?.length) where.commodityId = { in: commodityIds }

    // Try region-specific first
    if (regionId && regionId !== 'national') {
      const regional = await prisma.priceGuidance.findMany({
        where: { ...where, regionId },
        include: { commodity: true },
      })
      if (regional.length > 0) return this.fillNationalGaps(regional, commodityIds)
    }

    const national = await prisma.priceGuidance.findMany({
      where: { ...where, regionId: 'national' },
      include: { commodity: true },
    })
    return national
  }

  /** If some commodities have no national/regional price row, just omit them */
  private async fillNationalGaps(regional: any[], commodityIds?: string[]) {
    if (!commodityIds) return regional
    const have = new Set(regional.map((r) => r.commodityId))
    const missing = commodityIds.filter((c) => !have.has(c))
    if (missing.length === 0) return regional

    const national = await prisma.priceGuidance.findMany({
      where: { commodityId: { in: missing }, regionId: 'national' },
      include: { commodity: true },
    })
    return [...regional, ...national]
  }

  /**
   * 14-day forecast — currently a deterministic projection off the current
   * price + trend. Replace with a real model later; the shape stays the same.
   */
  async getForecast(commodityId: string, regionId: string) {
    const [price] = await this.getPrices([commodityId], regionId)
    if (!price) throw new Error('PRICE_NOT_FOUND')

    const current = Number(price.currentPrice)
    const dailyDrift = price.trend === 'RISING'
      ? current * 0.004
      : price.trend === 'FALLING'
        ? -current * 0.003
        : 0

    const forecast14d = Array.from({ length: 14 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i + 1)
      // small deterministic wave so the chart isn't a flat line
      const wave = Math.sin(i / 2) * current * 0.01
      return {
        date: date.toISOString().split('T')[0],
        price: Math.max(0, Math.round(current + dailyDrift * (i + 1) + wave)),
      }
    })

    return { commodityId, regionId, currentPrice: current, forecast14d }
  }

  /** List all commodities (taxonomy) — used by ListProduce screen + USSD-style menus */
  async listCommodities() {
    return prisma.commodity.findMany({
      where: { isActive: true },
      orderBy: { nameEn: 'asc' },
    })
  }
}

export const priceService = new PriceService()