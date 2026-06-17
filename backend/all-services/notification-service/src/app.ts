// backend/all-services/notification-service/src/app.ts
import express from 'express'
import notificationRoutes from './notifications/notification.routes'

const app = express()

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'notification-service', time: new Date().toISOString() })
})

app.use('/api', notificationRoutes)

app.use((_, res) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

export default app