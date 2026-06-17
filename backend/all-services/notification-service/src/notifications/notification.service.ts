// backend/all-services/notification-service/src/notifications/notification.service.ts
import { firestore, messaging, COLLECTIONS } from '../lib/firebase'
import { sendSms } from '../lib/sms'
import * as admin from 'firebase-admin'

export type NotificationChannel = 'PUSH' | 'SMS' | 'IN_APP'

export interface SendNotificationInput {
  userId:   string
  phone?:   string                 // required if 'SMS' channel is requested
  title:    string
  message:  string
  data?:    Record<string, unknown>
  channels: NotificationChannel[]
}

export class NotificationService {

  /**
   * Sends a notification across one or more channels and writes a record to
   * Firestore so the app's real-time listener (onSnapshot on
   * /notifications where userId == me) updates the bell icon instantly,
   * with no polling.
   */
  async send(input: SendNotificationInput) {
    const { userId, phone, title, message, data, channels } = input

    // 1. Always write to Firestore — this IS the in-app notification record,
    //    and the real-time source of truth for unread counts.
    const docRef = firestore.collection(COLLECTIONS.NOTIFICATIONS).doc()
    await docRef.set({
      notificationId: docRef.id,
      userId,
      title,
      message,
      data: data ?? {},
      channels,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // 2. PUSH via FCM (best-effort — missing/expired tokens are pruned)
    if (channels.includes('PUSH')) {
      await this.sendPush(userId, title, message, data)
    }

    // 3. SMS via Africa's Talking
    if (channels.includes('SMS')) {
      if (!phone) {
        console.warn(`SMS requested for user ${userId} but no phone provided — skipping`)
      } else {
        await sendSms(phone, `${title}: ${message}`)
      }
    }

    return { notificationId: docRef.id }
  }

  // ── Push token management ────────────────────────────────────────────────

  async registerPushToken(userId: string, token: string, platform: 'android' | 'ios') {
    const ref = firestore.collection(COLLECTIONS.PUSH_TOKENS).doc(userId)
    await ref.set(
      {
        userId,
        tokens: admin.firestore.FieldValue.arrayUnion({ token, platform, updatedAt: Date.now() }),
      },
      { merge: true },
    )
    return { message: 'Push token registered' }
  }

  private async sendPush(userId: string, title: string, body: string, data?: Record<string, unknown>) {
    const doc = await firestore.collection(COLLECTIONS.PUSH_TOKENS).doc(userId).get()
    if (!doc.exists) return

    const entries = (doc.data()?.tokens ?? []) as { token: string; platform: string }[]
    const tokens = entries.map((e) => e.token)
    if (tokens.length === 0) return

    // FCM data payloads must be string-only
    const stringData = Object.fromEntries(
      Object.entries(data ?? {}).map(([k, v]) => [k, String(v)]),
    )

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: stringData,
    })

    // Prune invalid/expired tokens so the array doesn't grow unbounded
    const invalid: string[] = []
    response.responses.forEach((r, i) => {
      if (!r.success) {
        const code = r.error?.code
        if (code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token') {
          invalid.push(tokens[i])
        }
      }
    })

    if (invalid.length > 0) {
      const remaining = entries.filter((e) => !invalid.includes(e.token))
      await firestore.collection(COLLECTIONS.PUSH_TOKENS).doc(userId).set(
        { tokens: remaining },
        { merge: false },
      )
    }
  }

  // ── Read / list (REST fallback — the app primarily uses the Firestore SDK
  //    directly for real-time updates, but this lets non-RN clients work too) ─

  async list(userId: string, limit = 50) {
    const snap = await firestore
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }

  async markRead(userId: string, notificationId: string) {
    const ref = firestore.collection(COLLECTIONS.NOTIFICATIONS).doc(notificationId)
    const doc = await ref.get()
    if (!doc.exists || doc.data()?.userId !== userId) {
      throw new Error('NOTIFICATION_NOT_FOUND')
    }
    await ref.update({ isRead: true, readAt: admin.firestore.FieldValue.serverTimestamp() })
    return { id: notificationId }
  }

  async markAllRead(userId: string) {
    const snap = await firestore
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where('userId', '==', userId)
      .where('isRead', '==', false)
      .get()

    const batch = firestore.batch()
    snap.docs.forEach((d) => batch.update(d.ref, { isRead: true, readAt: admin.firestore.FieldValue.serverTimestamp() }))
    await batch.commit()
    return { updated: snap.size }
  }
}

export const notificationService = new NotificationService()