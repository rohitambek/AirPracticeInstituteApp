import { Response, Router } from 'express';
import { AuthenticatedRequest, authMiddleware, optionalAuthMiddleware } from '../authMiddleware.ts';
import { dbService } from '../db.ts';
import { PracticeSubmission } from '../types.ts';

const router = Router();

// GET /api/dashboard
router.get('/', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const subjects = dbService.getSubjects();
  const pyqPapers = dbService.getPYQPapers();
  let submissionsCount = 0;
  let recentSubmissions: PracticeSubmission[] = [];
  let unreadNotificationsCount = 0;

  if (req.user) {
    const userSubmissions = dbService.getUserSubmissions(req.user.id);
    submissionsCount = userSubmissions.length;
    recentSubmissions = userSubmissions.slice(0, 5);
    const notifications = dbService.getNotifications(req.user.id);
    unreadNotificationsCount = notifications.filter(n => !n.read).length;
  }

  return res.json({
    success: true,
    data: {
      instituteName: 'AIR PRACTICE INSTITUTE 🇮🇳',
      curriculum: '12th Maharashtra State Board & MHT-CET',
      journeySteps: [
        { step: 1, title: 'TEXTBOOK', icon: '📚', description: 'Complete State Board Textbook Content', link: 'Textbook' },
        { step: 2, title: 'SHORT NOTES', icon: '📝', description: 'Quick Revision & Important Short Notes', link: 'Short Notes' },
        { step: 3, title: 'QUESTIONS & ANSWERS', icon: '❓', description: 'Topic-wise Questions with Detailed Answers', link: 'Textbook Questions' },
        { step: 4, title: '12th STATE BOARD PYQ PAPERS', icon: '📄', description: 'Previous Year Question Papers with Solutions', link: 'State Board PYQ Papers' },
        { step: 5, title: 'QUESTION PAPERS', icon: '📋', description: 'Chapter-wise & Full-Length Practice Question Papers', link: 'Question Papers' },
        { step: 6, title: 'NEET • JEE • MHT-CET QUESTION PAPERS', icon: '🎯', description: 'Previous Year & Practice Question Papers for Entrance Exams', link: 'MHT-CET PYQ Papers' },
      ],
      coreSections: [
        { id: 'sec-textbook', title: 'Textbook', icon: '📚', description: 'Complete 12th State Board Textbook Content', link: 'Textbook' },
        { id: 'sec-questions', title: 'Textbook Questions', icon: '📝', description: 'Practice textbook-based questions', link: 'Textbook Questions' },
        { id: 'sec-pyq', title: 'State Board PYQ Papers', icon: '📄', description: 'Previous Year Question Papers with solutions', link: 'State Board PYQ Papers' },
        { id: 'sec-cet-pyq', title: 'MHT-CET PYQ Papers', icon: '🎯', description: 'Previous Year MHT-CET Question Papers', link: 'MHT-CET PYQ Papers' },
        { id: 'sec-topic-cet', title: 'Topic-Wise MHT-CET Practice', icon: '⚡', description: 'Select a topic and solve 20 timed questions', link: 'Topic-Wise MHT-CET Practice' },
      ],
      subjects,
      totalPYQPapers: pyqPapers.length,
      userMetrics: {
        testsAttempted: submissionsCount,
        unreadNotifications: unreadNotificationsCount,
        recentSubmissions,
      },
    },
  });
});

// GET /api/student/me
router.get('/student/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const submissions = dbService.getUserSubmissions(user.id);
  const totalScore = submissions.reduce((acc, curr) => acc + curr.score, 0);
  const totalPossible = submissions.reduce((acc, curr) => acc + curr.totalPossibleScore, 0);
  const avgAccuracy =
    submissions.length > 0
      ? Math.round(submissions.reduce((acc, curr) => acc + curr.accuracyPercentage, 0) / submissions.length)
      : 0;

  return res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        targetExam: user.targetExam,
        role: user.role,
        createdAt: user.createdAt,
      },
      stats: {
        testsCompleted: submissions.length,
        totalScoreEarned: totalScore,
        totalPossibleScore: totalPossible,
        averageAccuracy: avgAccuracy,
      },
      recentSubmissions: submissions.slice(0, 10),
    },
  });
});

export default router;
