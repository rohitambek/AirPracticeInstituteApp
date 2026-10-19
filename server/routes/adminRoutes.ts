import { Response, Router } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../authMiddleware.ts';
import { dbService } from '../db.ts';
import { emailService } from '../emailService.ts';

const router = Router();

// Middleware to ensure user is an Admin
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: () => void) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required.',
    });
  }
  next();
};

// Apply auth + admin guard to all /api/admin routes
router.use(authMiddleware, requireAdmin);

// GET /api/admin/metrics - High level executive metrics
router.get('/metrics', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = dbService.getAdminMetrics();
    const recentEmails = emailService.getRecentEmails();
    const deliveredCount = recentEmails.filter(e => e.status === 'DELIVERED').length;

    return res.json({
      success: true,
      metrics: {
        ...stats,
        totalEmailsSent: recentEmails.length,
        deliveredEmails: deliveredCount,
        smtpConfigured: true,
        smtpSender: 'airpracticeinstitute@gmail.com',
        serverUptime: process.uptime(),
        databaseType: 'JSON Flat-File Engine',
      },
    });
  } catch (error) {
    console.error('[Admin] Error fetching metrics:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin metrics.' });
  }
});

// GET /api/admin/users - List all registered user signups with metadata
router.get('/users', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const allUsers = dbService.getAllUsers();
    const allSubmissions = dbService.getAllSubmissions();

    // Map each user with their test attempts count
    const usersWithStats = allUsers.map(user => {
      const userTests = allSubmissions.filter(s => s.userId === user.id);
      return {
        ...user,
        testAttemptsCount: userTests.length,
        lastTestDate: userTests.length > 0 ? userTests[0].submittedAt : null,
      };
    });

    return res.json({
      success: true,
      users: usersWithStats,
      count: usersWithStats.length,
    });
  } catch (error) {
    console.error('[Admin] Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
});

// GET /api/admin/activity - System activity logs (test submissions, signups, emails)
router.get('/activity', (_req: AuthenticatedRequest, res: Response) => {
  try {
    const submissions = dbService.getAllSubmissions();
    const emails = emailService.getRecentEmails().slice(0, 20);
    const users = dbService.getAllUsers().slice(0, 10);

    return res.json({
      success: true,
      recentSubmissions: submissions,
      recentEmails: emails,
      recentSignups: users,
    });
  } catch (error) {
    console.error('[Admin] Error fetching system activity:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve activity logs.' });
  }
});

// POST /api/admin/broadcast - Broadcast notice or system alert to all students
router.post('/broadcast', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !title.trim() || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Title and message are required for broadcast.' });
    }

    const notif = dbService.createNotification('ALL', title.trim(), message.trim(), type || 'SYSTEM');

    return res.status(201).json({
      success: true,
      message: 'Announcement broadcasted successfully to all students.',
      notification: notif,
    });
  } catch (error) {
    console.error('[Admin] Error broadcasting announcement:', error);
    return res.status(500).json({ success: false, message: 'Failed to broadcast announcement.' });
  }
});

// POST /api/admin/resend-welcome - Resend welcome onboarding email to student
router.post('/resend-welcome', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { studentEmail, studentName, studentId } = req.body;
    if (!studentEmail || !studentId) {
      return res.status(400).json({ success: false, message: 'Student email and ID are required.' });
    }

    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const portalUrl = `${protocol}://${host}`;

    const emailResult = await emailService.sendWelcomeEmail(
      studentEmail.trim(),
      studentName || 'Student',
      studentId,
      '12th Maharashtra State Board & MHT-CET',
      portalUrl
    );

    return res.json({
      success: true,
      message: `Welcome onboarding email successfully sent to ${studentEmail}.`,
      status: emailResult.status,
    });
  } catch (error) {
    console.error('[Admin] Error resending welcome email:', error);
    return res.status(500).json({ success: false, message: 'Failed to dispatch welcome email.' });
  }
});

// POST /api/admin/students - Admin creates a new student account
router.post('/students', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, mobile, password, targetExam, sendEmail } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Student full name is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Student email is required for credentials dispatch.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!emailService.isValidEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid student email address format.' });
    }

    // Check duplicate email
    const existing = dbService.findUserByLoginIdOrEmailOrMobile(cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: `An account with email "${cleanEmail}" already exists (ID: ${existing.loginId}).` });
    }

    if (mobile && mobile.trim() && !/^\d{10}$/.test(mobile.trim())) {
      return res.status(400).json({ success: false, message: 'Mobile number must be a valid 10-digit number.' });
    }

    // Determine password: use admin provided or generate secure one
    let finalPassword = password && password.trim().length >= 6 ? password.trim() : null;
    if (!finalPassword) {
      const randomLetters = Math.random().toString(36).substring(2, 6);
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      finalPassword = `Air#${randomDigits}${randomLetters}`;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newStudent = dbService.createUser({
      name: name.trim(),
      email: cleanEmail,
      mobile: mobile && mobile.trim() ? mobile.trim() : '98' + randomSuffix + '1234',
      passwordPlain: finalPassword,
      targetExam: targetExam || '12th Maharashtra State Board & MHT-CET',
    });

    let emailStatus = 'NOT_SENT';
    if (sendEmail !== false) {
      try {
        const protocol = req.protocol || 'http';
        const host = req.get('host') || 'localhost:3000';
        const portalUrl = `${protocol}://${host}`;
        const emailRes = await emailService.sendWelcomeEmail(
          newStudent.email,
          newStudent.name,
          newStudent.loginId,
          newStudent.targetExam,
          portalUrl
        );
        emailStatus = emailRes.status;
      } catch (err) {
        console.error('[Admin] Error sending onboarding email to new student:', err);
      }
    }

    return res.status(201).json({
      success: true,
      message: `Student account created successfully! Student ID: ${newStudent.loginId}`,
      student: {
        id: newStudent.id,
        loginId: newStudent.loginId,
        name: newStudent.name,
        email: newStudent.email,
        mobile: newStudent.mobile,
        targetExam: newStudent.targetExam,
        role: newStudent.role,
        createdAt: newStudent.createdAt,
        testAttemptsCount: 0,
        lastTestDate: null,
      },
      credentials: {
        loginId: newStudent.loginId,
        password: finalPassword,
      },
      emailStatus,
    });
  } catch (error) {
    console.error('[Admin] Error creating student:', error);
    return res.status(500).json({ success: false, message: 'Failed to create student account.' });
  }
});

// DELETE /api/admin/students/:id - Remove a student account
router.delete('/students/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = dbService.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Student account not found or cannot be deleted.' });
    }
    return res.json({ success: true, message: 'Student account successfully deleted from database.' });
  } catch (error) {
    console.error('[Admin] Error deleting student:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete student account.' });
  }
});

// POST /api/admin/students/:id/reset-password - Reset student password
router.post('/students/:id/reset-password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword, sendEmail } = req.body;

    const user = dbService.findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    let finalPassword = newPassword && newPassword.trim().length >= 6 ? newPassword.trim() : null;
    if (!finalPassword) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      finalPassword = `Pass#${randomDigits}`;
    }

    dbService.updateUserPassword(id, finalPassword);

    let emailSent = false;
    if (sendEmail) {
      try {
        const protocol = req.protocol || 'http';
        const host = req.get('host') || 'localhost:3000';
        const portalUrl = `${protocol}://${host}`;
        await emailService.sendWelcomeEmail(
          user.email,
          user.name,
          user.loginId,
          user.targetExam,
          portalUrl
        );
        emailSent = true;
      } catch (e) {
        console.error('[Admin] Error sending password notification email:', e);
      }
    }

    return res.json({
      success: true,
      message: `Password updated for ${user.name} (${user.loginId}).`,
      loginId: user.loginId,
      newPassword: finalPassword,
      emailSent,
    });
  } catch (error) {
    console.error('[Admin] Error resetting student password:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

export default router;
