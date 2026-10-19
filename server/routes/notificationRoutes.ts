import { Response, Router } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../authMiddleware.ts';
import { dbService } from '../db.ts';
import { emailService } from '../emailService.ts';

const router = Router();

// GET /api/notifications
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notifications = dbService.getNotifications(user.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  return res.json({
    success: true,
    unreadCount,
    notifications,
  });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const updated = dbService.markNotificationAsRead(id, user.id);

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  return res.json({ success: true, message: 'Notification marked as read.' });
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const count = dbService.markAllNotificationsAsRead(user.id);

  return res.json({
    success: true,
    message: `${count} notifications marked as read.`,
  });
});

// GET /api/emails/recent
router.get('/emails/recent', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const logs = emailService.getRecentEmails(user.email);
  return res.json({ success: true, emails: logs });
});

export default router;
