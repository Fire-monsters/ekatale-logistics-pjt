// backend/all-services/listing-service/src/app.ts
import express from 'express'
import path from 'path'
import listingRoutes from './listings/listing.routes'
import priceRoutes from './prices/price.routes'

const app = express()

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded photos locally in dev (swap for CDN/S3 in production)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'listing-service', time: new Date().toISOString() })
})

// Routes
app.use('/api', listingRoutes)
app.use('/api', priceRoutes)

// 404 handler
app.use((_, res) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

export default app