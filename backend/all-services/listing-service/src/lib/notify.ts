// backend/all-services/listing-service/src/lib/notify.ts

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003'
const INTERNAL_SERVICE_KEY     = process.env.INTERNAL_SERVICE_KEY || ''

export type NotificationChannel = 'PUSH' | 'SMS' | 'IN_APP'

export interface NotifyInput {
  userId:   string
  phone?:   string
  title:    string
  message:  string
  data?:    Record<string, unknown>
  channels: NotificationChannel[]
}

/**
 * Fire-and-forget call to notification-service.
 * Failures are logged but never block the listing status update —
 * a notification failure should not roll back a successful business
 * transaction (e.g. a warehouse marking produce as collected).
 */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    const res = await fetch(`${NOTIFICATION_SERVICE_URL}/api/internal/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': INTERNAL_SERVICE_KEY,
      },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      console.error('Notification send failed:', res.status, await res.text())
    }
  } catch (err) {
    console.error('Notification service unreachable:', err)
  }
}

/** Human-readable copy for each listing status — used for push/SMS bodies */
export const STATUS_MESSAGES: Record<string, { title: string; message: (ctx: { commodityName: string; quantity: number; unit: string }) => string }> = {
  ACTIVE: {
    title: '✅ Listing approved',
    message: (c) => `Your listing of ${c.quantity}${c.unit} ${c.commodityName} is now live and visible to buyers.`,
  },
  REJECTED: {
    title: '❌ Listing rejected',
    message: (c) => `Your listing of ${c.quantity}${c.unit} ${c.commodityName} was rejected. Tap to see why and re-list.`,
  },
  ORDER_CONFIRMED: {
    title: '📋 Order confirmed',
    message: (c) => `A buyer confirmed an order for your ${c.quantity}${c.unit} ${c.commodityName}. A truck will be arranged soon.`,
  },
  COLLECTED: {
    title: '🌾 Produce collected',
    message: (c) => `Your ${c.quantity}${c.unit} ${c.commodityName} has been collected. Pricing has been finalized.`,
  },
  DISPATCHED: {
    title: '🚚 Truck dispatched',
    message: (c) => `A truck is on its way to collect your ${c.commodityName}.`,
  },
  DELIVERED: {
    title: '🏭 Delivered to warehouse',
    message: (c) => `Your ${c.commodityName} has arrived at the warehouse. Payment is being processed.`,
  },
  PAID: {
    title: '💰 Payment sent',
    message: (c) => `Payment for your ${c.commodityName} has been sent to your Mobile Money.`,
  },
}