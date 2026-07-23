import { Router } from 'express'
import { consumerController } from './consumer.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

router.get('/consumer/products', consumerController.listProducts.bind(consumerController))
router.get('/consumer/products/:id', consumerController.getProductById.bind(consumerController))
router.get('/consumer/banners', consumerController.listBanners.bind(consumerController))

router.post('/consumer/orders', authenticate, requireRole('consumer'), consumerController.createOrder.bind(consumerController))
router.get('/consumer/orders', authenticate, requireRole('consumer'), consumerController.listOrders.bind(consumerController))
router.get('/consumer/orders/:id', authenticate, requireRole('consumer'), consumerController.getOrderById.bind(consumerController))

export default router
