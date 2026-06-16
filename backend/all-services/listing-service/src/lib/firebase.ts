// backend/all-services/notification-service/src/lib/firebase.ts
import admin from 'firebase-admin'

/**
 * Firebase Admin SDK — used for two things:
 *  1. FCM (Firebase Cloud Messaging) — sends push notifications to the app
 *  2. Firestore — real-time "notifications" collection the app subscribes to,
 *     so the bell icon / notification list update live without polling.
 *
 * Credentials: set FIREBASE_SERVICE_ACCOUNT_JSON to the *stringified* JSON
 * of your service account key (Firebase Console → Project Settings →
 * Service Accounts → Generate new private key). In dev, paste the whole
 * JSON on one line into .env.
 */
function loadServiceAccount(): admin.ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON is not set. ' +
      'Paste your Firebase service account JSON (one line) into .env',
    )
  }
  return JSON.parse(raw)
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(loadServiceAccount()),
  })
}

export const firebaseAdmin = admin
export const messaging = admin.messaging()
export const firestore = admin.firestore()

// Firestore collections used by this service
export const COLLECTIONS = {
  NOTIFICATIONS: 'notifications', // /notifications/{notificationId}
  PUSH_TOKENS:   'pushTokens',     // /pushTokens/{userId} -> { tokens: string[] }
} as const