// backend/all-services/notification-service/src/notifications/notification.validation.ts
import { z } from 'zod'

export const SendNotificationSchema = z.object({
  userId:   z.string().uuid(),
  phone:    z.string().optional(),
  title:    z.string().min(1).max(255),
  message:  z.string().min(1).max(1000),
  data:     z.record(z.unknown()).optional(),
  channels: z.array(z.enum(['PUSH', 'SMS', 'IN_APP'])).min(1).default(['PUSH', 'IN_APP']),
})

export const RegisterPushTokenSchema = z.object({
  token:    z.string().min(10),
  platform: z.enum(['android', 'ios']),
})

export type SendNotificationInput   = z.infer<typeof SendNotificationSchema>
export type RegisterPushTokenInput  = z.infer<typeof RegisterPushTokenSchema>