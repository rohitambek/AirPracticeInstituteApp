import { Request, Response, Router } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../authMiddleware.ts';
import { dbService } from '../db.ts';
import { emailService } from '../emailService.ts';

const router = Router();

// GET /api/subjects
router.get('/subjects', (_req: Request, res: Response) => {
  const subjects = dbService.getSubjects();
  return res.json({ success: true, subjects });
});

// GET /api/subjects/:id/chapters
router.get('/subjects/:id/chapters', (req: Request, res: Response) => {
  const { id } = req.params;
  const chapters = dbService.getChapters(id);
  return res.json({ success: true, chapters });
});

// GET /api/chapters/:id/content (Textbook)
router.get('/chapters/:id/content', (req: Request, res: Response) => {
  const { id } = req.params;
  const content = dbService.getTextbookContent(id);
  return res.json({ success: true, content: content[0] || null });
});

// GET /api/chapters/:id/shortnotes
router.get('/chapters/:id/shortnotes', (req: Request, res: Response) => {
  const { id } = req.params;
  const notes = dbService.getShortNotes(id);
  return res.json({ success: true, shortNote: notes[0] || null });
});

// GET /api/questions
router.get('/questions', (req: Request, res: Response) => {
  const { subjectId, chapterId, limit } = req.query;
  const questions = dbService.getQuestions({
    subjectId: subjectId as string,
    chapterId: chapterId as string,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  return res.json({
    success: true,
    total: questions.length,
    questions,
  });
});

// GET /api/papers
router.get('/papers', (req: Request, res: Response) => {
  const { exam, year, subject } = req.query;
  const papers = dbService.getPYQPapers(
    exam as string,
    year ? parseInt(year as string, 10) : undefined,
    subject as string
  );
  return res.json({ success: true, papers });
});

// GET /api/papers/:id
router.get('/papers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const paper = dbService.getPYQPaperById(id);
  if (!paper) {
    return res.status(404).json({ success: false, message: 'Question paper not found.' });
  }
  return res.json({ success: true, paper });
});

// POST /api/practice/submit and /api/submit
const handleSubmitHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { section, subject, chapterTitle, answers, timeSpentSeconds } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Invalid practice answers payload.' });
    }

    let correctCount = 0;
    let wrongCount = 0;
    let calculatedScore = 0;
    let totalPossibleScore = 0;

    const evaluatedAnswers = answers.map((ans: { questionId: string; selectedOptionId: string }) => {
      // Find question
      const allQ = dbService.getQuestions({});
      const q = allQ.find(item => item.id === ans.questionId);

      const markValue = q ? q.marks : 1;
      totalPossibleScore += markValue;

      let isCorrect = false;
      if (q && q.correctOptionId === ans.selectedOptionId) {
        isCorrect = true;
        correctCount++;
        calculatedScore += markValue;
      } else if (ans.selectedOptionId) {
        wrongCount++;
      }

      return {
        questionId: ans.questionId,
        selectedOptionId: ans.selectedOptionId,
        isCorrect,
        correctOptionId: q ? q.correctOptionId : '',
        solution: q ? q.solution : '',
      };
    });

    const attemptedCount = answers.filter((a: { selectedOptionId: string }) => Boolean(a.selectedOptionId)).length;
    const accuracyPercentage = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    // Save to database
    const submission = dbService.recordSubmission({
      userId: user.id,
      section: section || 'Topic-Wise Practice',
      subject: subject || 'Physics',
      chapterTitle: chapterTitle || '',
      totalQuestions: answers.length,
      attempted: attemptedCount,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      score: calculatedScore,
      totalPossibleScore: totalPossibleScore || answers.length,
      accuracyPercentage,
      timeSpentSeconds: timeSpentSeconds || 0,
      answers: evaluatedAnswers,
    });

    // Send email report via EmailService
    const minutes = Math.floor((timeSpentSeconds || 0) / 60);
    const seconds = (timeSpentSeconds || 0) % 60;
    const timeSpentFormatted = `${minutes}m ${seconds}s`;

    try {
      await emailService.sendPracticeReportEmail(user.email, user.name, {
        section: submission.section,
        subject: submission.subject,
        score: submission.score,
        total: submission.totalPossibleScore,
        accuracy: submission.accuracyPercentage,
        timeSpent: timeSpentFormatted,
      });
    } catch (err) {
      console.error('[Submit] Error sending email report:', err);
    }

    return res.json({
      success: true,
      message: 'Practice test submitted successfully!',
      submission,
      evaluation: evaluatedAnswers,
    });
  } catch (error) {
    console.error('[Submit] Server error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process practice submission.' });
  }
};

router.post('/practice/submit', authMiddleware, handleSubmitHandler);
router.post('/submit', authMiddleware, handleSubmitHandler);

export default router;
