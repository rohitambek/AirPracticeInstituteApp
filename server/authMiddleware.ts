import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { dbService } from './db.ts';
import { User } from './types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'air-practice-institute-secure-jwt-key-2026-prod';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User, sessionId?: string): string {
  const activeSessionId = sessionId || user.currentSessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return jwt.sign(
    {
      id: user.id,
      loginId: user.loginId,
      name: user.name,
      role: user.role,
      sessionId: activeSessionId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; sessionId?: string };
    const user = dbService.findUserById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid or expired user session' });
      return;
    }

    // SINGLE DEVICE ENFORCEMENT:
    // If the account has a registered currentSessionId and this request's token has a different sessionId,
    // it means a newer login occurred on another device (phone, laptop, or tablet).
    // Invalidate this previous device immediately with code SESSION_TERMINATED.
    if (user.currentSessionId && decoded.sessionId && user.currentSessionId !== decoded.sessionId) {
      res.status(401).json({
        success: false,
        code: 'SESSION_TERMINATED',
        message: 'Logged out: Your account was logged into on another device (phone, laptop, or tablet). As per single-device policy, this session has been ended.',
        lastLoginDevice: user.lastLoginDevice || 'Another Device',
        lastLoginAt: user.lastLoginAt,
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Session expired or invalid token', error });
  }
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = dbService.findUserById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignore optional auth failures
    }
  }
  next();
}
