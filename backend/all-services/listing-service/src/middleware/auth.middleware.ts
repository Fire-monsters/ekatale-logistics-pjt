// backend/all-services/listing-service/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string

export interface TokenPayload {
  userId: string
  role:   string
  phone:  string
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

/**
 * Verifies the JWT issued by auth-service.
 * listing-service shares JWT_ACCESS_SECRET with auth-service (same .env value)
 * so tokens minted at login work here without a network round-trip.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'MISSING_TOKEN' })
    return
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    res.status(401).json({ success: false, error: 'MISSING_TOKEN' })
    return
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as TokenPayload
    req.user = payload
    next()
  } catch (err: any) {
    const isExpired = err.name === 'TokenExpiredError'
    res.status(401).json({
      success: false,
      error:   isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      message: isExpired ? 'Your session has expired. Please log in again.' : 'Invalid token.',
    })
  }
}

/** Restrict a route to specific roles (use after authenticate) */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'UNAUTHENTICATED' })
      return
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error:   'INSUFFICIENT_PERMISSIONS',
        message: `This action requires one of: ${allowedRoles.join(', ')}`,
      })
      return
    }
    next()
  }
}