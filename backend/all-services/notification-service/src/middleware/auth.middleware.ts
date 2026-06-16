// backend/all-services/notification-service/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string
const SERVICE_KEY   = process.env.INTERNAL_SERVICE_KEY as string

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

/** Verifies a user JWT (same secret as auth-service) — for /notifications/* user routes */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'MISSING_TOKEN' })
    return
  }
  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, ACCESS_SECRET) as TokenPayload
    next()
  } catch {
    res.status(401).json({ success: false, error: 'TOKEN_INVALID' })
  }
}

/**
 * Verifies the shared internal service key — for server-to-server calls
 * (e.g. listing-service notifying a farmer their listing was approved).
 * Pass header: x-service-key: <INTERNAL_SERVICE_KEY>
 */
export const authenticateService = (req: Request, res: Response, next: NextFunction): void => {
  const key = req.headers['x-service-key']
  if (!SERVICE_KEY || key !== SERVICE_KEY) {
    res.status(401).json({ success: false, error: 'INVALID_SERVICE_KEY' })
    return
  }
  next()
}