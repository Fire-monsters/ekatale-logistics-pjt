// backend/all-services/listing-service/src/prices/price.routes.ts
import { Router } from 'express'
import { priceController } from './price.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/prices',          authenticate, priceController.getPrices.bind(priceController))
router.get('/prices/forecast', authenticate, priceController.getForecast.bind(priceController))
router.get('/commodities',     authenticate, priceController.listCommodities.bind(priceController))

export default router