import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { AuthenticatedRequest, authMiddleware, generateToken } from '../authMiddleware.ts';
import { dbService } from '../db.ts';
import { emailService } from '../emailService.ts';

const router = Router();

// POST /api/auth/signup - Restricted: Student accounts must be created by Admin
router.post('/signup', (_req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    message: 'Student self-registration is closed. Student accounts are created and issued exclusively by the Institute Administrator. Please contact the administrator to receive your credentials.',
  });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both Login ID and Password.' });
    }

    const user = dbService.findUserByLoginIdOrEmailOrMobile(loginId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Login ID or Password.' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid Login ID or Password.' });
    }

    // SINGLE DEVICE ENFORCEMENT:
    // Generate new unique sessionId and persist it.
    // This immediately supersedes and invalidates any previous session on another phone, laptop, or tablet.
    const userAgent = req.headers['user-agent'] || '';
    let deviceType = 'Desktop / Laptop';
    if (/mobile/i.test(userAgent)) deviceType = 'Mobile Phone';
    else if (/tablet|ipad/i.test(userAgent)) deviceType = 'Tablet';

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const updatedUser = dbService.updateUserSession(user.id, sessionId, deviceType) || user;

    const token = generateToken(updatedUser, sessionId);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      sessionId,
      user: {
        id: updatedUser.id,
        loginId: updatedUser.loginId,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        targetExam: updatedUser.targetExam,
        role: updatedUser.role,
        currentSessionId: sessionId,
        lastLoginDevice: deviceType,
        lastLoginAt: updatedUser.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('[Login] Server error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// GET /api/auth/session-check - Heartbeat to verify this device is still the sole active session
router.get('/session-check', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    success: true,
    active: true,
    sessionId: user.currentSessionId,
    device: user.lastLoginDevice || 'Active Device',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    success: true,
    user: {
      id: user.id,
      loginId: user.loginId,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      targetExam: user.targetExam,
      role: user.role,
      currentSessionId: user.currentSessionId,
      lastLoginDevice: user.lastLoginDevice,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    },
  });
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
