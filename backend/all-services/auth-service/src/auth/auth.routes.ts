// services/auth-service/src/auth/auth.routes.ts

import { Router }        from 'express'
import { authController } from './auth.controller'
import { authenticate }   from '../middleware/rbac.middleware'

const router = Router()

// ── Public routes (no token required) ────────────────────────────────────────
router.post('/otp/request',   authController.requestOtp.bind(authController))
router.post('/otp/verify',    authController.verifyOtp.bind(authController))
router.post('/register',      authController.register.bind(authController))
router.post('/login',         authController.login.bind(authController))
router.post('/token/refresh', authController.refreshToken.bind(authController))

// ── Protected routes (token required) ────────────────────────────────────────
router.post('/logout', authenticate, authController.logout.bind(authController))
router.get('/me',      authenticate, authController.getProfile.bind(authController))

export default router