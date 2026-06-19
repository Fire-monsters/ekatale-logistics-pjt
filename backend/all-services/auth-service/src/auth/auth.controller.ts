// auth-service/src/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express'
import { authService }                     from './auth.service'
import {
  RequestOtpSchema,
  VerifyOtpSchema,
  CompleteRegistrationSchema,
  LoginWithPasswordSchema,
  RefreshTokenSchema,
} from './auth.validation'
import { prisma } from '../lib/prisma'

const handleError = (error: unknown, res: Response) => {
  const message = error instanceof Error ? error.message : 'INTERNAL_ERROR'
  const statusMap: Record<string, number> = {
    PHONE_ALREADY_REGISTERED: 409,
    USER_NOT_FOUND:           404,
    ACCOUNT_SUSPENDED:        403,
    INVALID_OR_EXPIRED_OTP:   401,
    INVALID_CREDENTIALS:      401,
    PHONE_NOT_VERIFIED:       401,
    INVALID_REFRESH_TOKEN:    401,
    REFRESH_TOKEN_REVOKED:    401,
    REFRESH_TOKEN_EXPIRED:    401,
    NO_FILE_PROVIDED:         400,
  }
  const status = statusMap[message] ?? 500
  res.status(status).json({ success: false, error: message })
}

export class AuthController {

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.userId
      const user   = await prisma.user.findUnique({
        where:   { userId },
        include: { farmerProfile: true, agentProfile: true },
      })
      if (!user) {
        return res.status(404).json({ success: false, error: 'USER_NOT_FOUND' })
      }
      const { passwordHash: _, ...safeUser } = user as any
      res.status(200).json({ success: true, data: safeUser })
    } catch (error) {
      handleError(error, res)
    }
  }

  async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const input  = RequestOtpSchema.parse(req.body)
      const result = await authService.requestOtp(input)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const input  = VerifyOtpSchema.parse(req.body)
      const result = await authService.verifyOtp(input)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input  = CompleteRegistrationSchema.parse(req.body)
      const result = await authService.register(input)
      res.status(201).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  async loginWithPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input  = LoginWithPasswordSchema.parse(req.body)
      const result = await authService.loginWithPassword(input)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body as { phone: string }
      if (!phone) {
        return res.status(400).json({ success: false, error: 'PHONE_REQUIRED' })
      }
      const result = await authService.login(phone, {
        userAgent: req.headers['user-agent'],
        ip:        req.ip,
      })
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = RefreshTokenSchema.parse(req.body)
      const result = await authService.refreshToken(refreshToken)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = RefreshTokenSchema.parse(req.body)
      const userId = req.user!.userId
      const result = await authService.logout(userId, refreshToken)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }

  /**
   * POST /auth/me/photo
   * Accepts a single multipart "photo" field, saves it, and updates
   * profilePhotoUrl on the User row.
   */
  async uploadProfilePhoto(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: 'NO_FILE_PROVIDED' })
      }
      const userId = req.user!.userId
      const result = await authService.uploadProfilePhoto(userId, req.file)
      res.status(200).json({ success: true, data: result })
    } catch (error) {
      handleError(error, res)
    }
  }
}

export const authController = new AuthController()