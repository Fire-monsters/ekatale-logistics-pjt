import { prisma } from '../lib/prisma'
import type { CreateConsumerOrderInput, OrderQueryInput, ProductQueryInput } from './consumer.validation'

const makeOrderNumber = () => `CO-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`

export class ConsumerService {
  async listProducts(query: ProductQueryInput) {
    const where: any = { isActive: true }
    if (query.category) where.category = { equals: query.category }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.consumerProduct.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.consumerProduct.count({ where }),
    ])

    return { items, total, page: query.page, limit: query.limit }
  }

  async getProductById(productId: string) {
    return prisma.consumerProduct.findUnique({
      where: { id: productId },
    })
  }

  async listBanners() {
    const now = new Date()
    return prisma.consumerBanner.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })
  }

  async createOrder(customerId: string | null, input: CreateConsumerOrderInput) {
    const items = await Promise.all(
      input.items.map(async (item) => {
        if (!item.productId) return item
        const product = await prisma.consumerProduct.findUnique({ where: { id: item.productId } })
        if (!product) throw new Error('PRODUCT_NOT_FOUND')
        return {
          ...item,
          productName: product.name,
          unitPriceUgx: Number(product.priceUgx),
          productId: product.id,
        }
      }),
    )

    const subtotalUgx = items.reduce((sum, item) => sum + item.quantity * item.unitPriceUgx, 0)
    const totalUgx = subtotalUgx + input.deliveryFeeUgx

    const order = await prisma.consumerOrder.create({
      data: {
        orderNumber: makeOrderNumber(),
        customerId: customerId ?? undefined,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        deliveryAddress: input.deliveryAddress,
        subtotalUgx,
        deliveryFeeUgx: input.deliveryFeeUgx,
        totalUgx,
        notes: input.notes,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPriceUgx: item.unitPriceUgx,
            subtotalUgx: item.quantity * item.unitPriceUgx,
          })),
        },
      },
      include: { items: true },
    })

    return order
  }

  async listOrders(customerId: string, query: OrderQueryInput) {
    const [items, total] = await Promise.all([
      prisma.consumerOrder.findMany({
        where: { customerId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.consumerOrder.count({ where: { customerId } }),
    ])

    return { items, total, page: query.page, limit: query.limit }
  }

  async getOrderById(customerId: string, orderId: string) {
    return prisma.consumerOrder.findFirst({
      where: { id: orderId, customerId },
      include: { items: true },
    })
  }
}

export const consumerService = new ConsumerService()
