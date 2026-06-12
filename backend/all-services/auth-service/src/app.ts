// services/auth-service/src/app.ts

import express      from 'express'
import authRoutes   from './auth/auth.routes'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_, res) => {
  res.json({
    status:  'ok',
    service: 'auth-service',
    time:    new Date().toISOString(),
  })
})

// Routes
app.use('/api/auth', authRoutes)

// 404 handler
app.use((_, res) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

export default app