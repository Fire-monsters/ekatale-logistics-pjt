// backend/all-services/notification-service/src/notifications/notification.controller.ts
import { Request, Response } from 'express'
import { notificationService } from './notification.service'
import { SendNotificationSchema, RegisterPushTokenSchema } from './notification.validation'

const handleError = (error: unknown, res: Response) => {
  const message = error instanceof Error ? error.message : 'INTERNAL_ERROR'
  const statusMap: Record<string, number> = { NOTIFICATION_NOT_FOUND: 404 }
  res.status(statusMap[message] ?? 500).json({ success: false, error: message })
}

export class NotificationController {

  // POST /internal/notifications/send  (service-to-service, x-service-key)
  async send(req: Request, res: Response) {
    try {
      const input = SendNotificationSchema.parse(req.body)
      const result = await notificationService.send(input)
      res.status(201).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  // POST /notifications/push-token  (user)
  async registerPushToken(req: Request, res: Response) {
    try {
      const input = RegisterPushTokenSchema.parse(req.body)
      const result = await notificationService.registerPushToken(req.user!.userId, input.token, input.platform)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  // GET /notifications  (user) — REST fallback; app primarily uses Firestore SDK directly
  async list(req: Request, res: Response) {
    try {
      const items = await notificationService.list(req.user!.userId)
      res.status(200).json({ success: true, data: items })
    } catch (error) {
      handleError(error, res)
    }
  }

  // PATCH /notifications/:id/read  (user)
  async markRead(req: Request, res: Response) {
    try {
      const result = await notificationService.markRead(req.user!.userId, req.params.id)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  // PATCH /notifications/read-all  (user)
  async markAllRead(req: Request, res: Response) {
    try {
      const result = await notificationService.markAllRead(req.user!.userId)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }
}

export const notificationController = new NotificationController()