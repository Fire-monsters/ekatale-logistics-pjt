// services/auth-service/src/app.ts

import express    from 'express'
import path       from 'path'
import authRoutes from './auth/auth.routes'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded profile photos as static files
const uploadDir =
  process.env.PROFILE_UPLOAD_DIR ??
  path.join(process.cwd(), 'uploads', 'profiles')
app.use('/uploads/profiles', express.static(uploadDir))

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'auth-service', time: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)

app.use((_, res) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

export default app