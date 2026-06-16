// backend/all-services/notification-service/src/server.ts
import app from './app'

const PORT = process.env.PORT ?? 3003

app.listen(PORT, () => {
  console.log(`🚀 Notification service running on port ${PORT}`)
  console.log('   Using Firebase (FCM push + Firestore real-time store)')
})