// backend/all-services/listing-service/src/prices/price.controller.ts
import { Request, Response } from 'express'
import { priceService } from './price.service'

const handleError = (error: unknown, res: Response) => {
  const message = error instanceof Error ? error.message : 'INTERNAL_ERROR'
  const statusMap: Record<string, number> = { PRICE_NOT_FOUND: 404 }
  res.status(statusMap[message] ?? 500).json({ success: false, error: message })
}

export class PriceController {

  // GET /prices?commodities=maize,beans&region=Mukono
  async getPrices(req: Request, res: Response) {
    try {
      const commodities = (req.query.commodities as string | undefined)?.split(',').filter(Boolean)
      const region = req.query.region as string | undefined
      const prices = await priceService.getPrices(commodities, region)
      res.status(200).json({ success: true, data: prices })
    } catch (error) {
      handleError(error, res)
    }
  }

  // GET /prices/forecast?commodity=maize&region=national
  async getForecast(req: Request, res: Response) {
    try {
      const commodity = req.query.commodity as string
      const region = (req.query.region as string) || 'national'
      if (!commodity) {
        return res.status(400).json({ success: false, error: 'COMMODITY_REQUIRED' })
      }
      const forecast = await priceService.getForecast(commodity, region)
      res.status(200).json({ success: true, data: forecast })
    } catch (error) {
      handleError(error, res)
    }
  }

  // GET /commodities
  async listCommodities(req: Request, res: Response) {
    try {
      const commodities = await priceService.listCommodities()
      res.status(200).json({ success: true, data: commodities })
    } catch (error) {
      handleError(error, res)
    }
  }
}

export const priceController = new PriceController()