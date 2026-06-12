// services/auth-service/src/middleware/rbac.middleware.ts

import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken }               from '../lib/jwt'

// ── Types ─────────────────────────────────────────────────────────────────────

export type AppRole =
  | 'farmer'
  | 'village_agent'
  | 'warehouse'
  | 'sme'
  | 'grocery'
  | 'consumer'
  | 'transport'
  | 'admin'

// Augment Express Request so downstream handlers can read req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        role:   string
        phone:  string
      }
    }
  }
}

// ── authenticate ──────────────────────────────────────────────────────────────
// Verifies the JWT on every protected request.
// Attaches the decoded payload to req.user.

export const authenticate = (
  req:  Request,
  res:  Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error:   'MISSING_TOKEN',
      message: 'Authorization header is required',
    })
    return
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({
      success: false,
      error:   'MISSING_TOKEN',
    })
    return
  }

  try {
    const payload  = verifyAccessToken(token)
    req.user       = payload
    next()
  } catch (err: any) {
    const isExpired = err.name === 'TokenExpiredError'
    res.status(401).json({
      success: false,
      error:   isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      message: isExpired
        ? 'Your session has expired. Please log in again.'
        : 'Invalid token.',
    })
  }
}

// ── requireRole ───────────────────────────────────────────────────────────────
// Use after authenticate. Restricts a route to specific roles.
//
// Usage:
//   router.get('/warehouse/listings',
//     authenticate,
//     requireRole('warehouse', 'admin'),
//     controller.getListings
//   )

export const requireRole = (...allowedRoles: AppRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error:   'UNAUTHENTICATED',
      })
      return
    }

    const userRole = req.user.role.toLowerCase() as AppRole

    if (!allowedRoles.includes(userRole)) {
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

// ── requireOwnership ──────────────────────────────────────────────────────────
// Ensures a user can only access their own resources.
// Pass the request param name that holds the target userId.
//
// Usage:
//   router.get('/farmers/:farmerId/listings',
//     authenticate,
//     requireOwnership('farmerId'),
//     controller.getListings
//   )

export const requireOwnership = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'UNAUTHENTICATED' })
      return
    }

    const targetId = req.params[paramName]
    const isOwner  = req.user.userId === targetId
    const isAdmin  = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error:   'FORBIDDEN',
        message: 'You can only access your own resources.',
      })
      return
    }

    next()
  }
}

// ── optionalAuth ──────────────────────────────────────────────────────────────
// For public routes that behave differently when a user is logged in.
// Does NOT reject unauthenticated requests — just attaches user if token exists.

export const optionalAuth = (
  req:  Request,
  res:  Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      req.user = verifyAccessToken(token)
    } catch {
      // Silently ignore invalid tokens on optional routes
    }
  }

  next()
}