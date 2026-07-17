import { Router } from 'express'
import { consumerController } from './consumer.controller'

const router = Router()

router.post('/google', consumerController.google.bind(consumerController))
router.post('/phone', consumerController.phone.bind(consumerController))

export default router
