// backend/all-services/notification-service/src/notifications/notification.routes.ts
import { Router } from 'express'
import { notificationController } from './notification.controller'
import { authenticate, authenticateService } from '../middleware/auth.middleware'

const router = Router()

// ── Internal (service-to-service) ───────────────────────────────────────────
// Called by listing-service etc. when a listing status changes.
router.post('/internal/notifications/send', authenticateService, notificationController.send.bind(notificationController))

// ── User-facing ──────────────────────────────────────────────────────────────
router.post('/notifications/push-token', authenticate, notificationController.registerPushToken.bind(notificationController))
router.get('/notifications',             authenticate, notificationController.list.bind(notificationController))
router.patch('/notifications/read-all',  authenticate, notificationController.markAllRead.bind(notificationController))
router.patch('/notifications/:id/read',  authenticate, notificationController.markRead.bind(notificationController))

export default router