import { Request, Response } from 'express'
import { consumerService } from './consumer.service'
import {
  CreateConsumerOrderSchema,
  OrderQuerySchema,
  ProductQuerySchema,
} from './consumer.validation'

const handleError = (error: unknown, res: Response) => {
  const message = error instanceof Error ? error.message : 'INTERNAL_ERROR'
  const statusMap: Record<string, number> = {
    PRODUCT_NOT_FOUND: 404,
    ORDER_NOT_FOUND: 404,
  }
  res.status(statusMap[message] ?? 500).json({ success: false, error: message })
}

export class ConsumerController {
  async listProducts(req: Request, res: Response) {
    try {
      const query = ProductQuerySchema.parse(req.query)
      const result = await consumerService.listProducts(query)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const product = await consumerService.getProductById(id)
      if (!product) return res.status(404).json({ success: false, error: 'PRODUCT_NOT_FOUND' })
      res.status(200).json({ success: true, data: product })
    } catch (error) {
      handleError(error, res)
    }
  }

  async listBanners(req: Request, res: Response) {
    try {
      const banners = await consumerService.listBanners()
      res.status(200).json({ success: true, data: banners })
    } catch (error) {
      handleError(error, res)
    }
  }

  async createOrder(req: Request, res: Response) {
    try {
      const input = CreateConsumerOrderSchema.parse(req.body)
      const order = await consumerService.createOrder(req.user?.userId ?? null, input)
      res.status(201).json({ success: true, data: order })
    } catch (error) {
      handleError(error, res)
    }
  }

  async listOrders(req: Request, res: Response) {
    try {
      const query = OrderQuerySchema.parse(req.query)
      const result = await consumerService.listOrders(req.user!.userId, query)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const order = await consumerService.getOrderById(req.user!.userId, id)
      if (!order) return res.status(404).json({ success: false, error: 'ORDER_NOT_FOUND' })
      res.status(200).json({ success: true, data: order })
    } catch (error) {
      handleError(error, res)
    }
  }
}

export const consumerController = new ConsumerController()
