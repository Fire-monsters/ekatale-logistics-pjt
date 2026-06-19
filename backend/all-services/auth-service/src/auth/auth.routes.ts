// services/auth-service/src/auth/auth.routes.ts

import { Router } from 'express'
import multer     from 'multer'
import { authController } from './auth.controller'
import { authenticate }   from '../middleware/rbac.middleware'

const router = Router()

// multer — memory storage, 8 MB limit (matches listing-service)
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 8 * 1024 * 1024 },
})

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/otp/request',    authController.requestOtp.bind(authController))
router.post('/otp/verify',     authController.verifyOtp.bind(authController))
router.post('/register',       authController.register.bind(authController))
router.post('/login',          authController.login.bind(authController))
router.post('/login/password', authController.loginWithPassword.bind(authController))
router.post('/token/refresh',  authController.refreshToken.bind(authController))

// ── Protected routes ──────────────────────────────────────────────────────────
router.post('/logout',   authenticate, authController.logout.bind(authController))
router.get('/me',        authenticate, authController.getProfile.bind(authController))

// Profile photo upload (authenticated, single file, field name "photo")
router.post(
  '/me/photo',
  authenticate,
  upload.single('photo'),
  authController.uploadProfilePhoto.bind(authController),
)

export default router