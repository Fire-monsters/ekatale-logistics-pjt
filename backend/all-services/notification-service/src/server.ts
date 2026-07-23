// backend/all-services/notification-service/src/server.ts
// Provide a minimal console declaration to satisfy TypeScript when lib settings
// don't include the standard library definitions that declare `console`.
declare const console: { log: (...args: any[]) => void }

import app from './app'

const PORT = process.env.PORT ?? 3003

app.listen(PORT, () => {
  console.log(`🚀 Notification service running on port ${PORT}`)
  console.log('   Using Firebase (FCM push + Firestore real-time store)')
})