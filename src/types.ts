export interface User {
  id: string;
  loginId: string;
  name: string;
  email: string;
  mobile: string;
  targetExam: string;
  role: 'STUDENT' | 'ADMIN';
  currentSessionId?: string;
  lastLoginDevice?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface Subject {
  id: string;
  name: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';
  icon: string;
  tagline: string;
  totalChapters: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  chapterNumber: number;
  title: string;
  description: string;
  weightage: string;
}

export interface TextbookContent {
  id: string;
  chapterId: string;
  subjectId: string;
  title: string;
  sections: {
    heading: string;
    content: string;
    keyPoints?: string[];
    formula?: string;
  }[];
}

export interface ShortNote {
  id: string;
  chapterId: string;
  subjectId: string;
  title: string;
  summary: string;
  formulas: { name: string; formula: string; note?: string }[];
  keyReactionsOrLaws: string[];
  tips: string[];
}

export interface Question {
  id: string;
  subjectId: string;
  chapterId: string;
  type: 'MCQ' | 'NUMERICAL' | 'THEORY';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  solution: string;
  marks: number;
  examTag?: string;
}

export interface PYQPaper {
  id: string;
  exam: string;
  year: number;
  subject: string;
  title: string;
  totalMarks: number;
  durationMinutes: number;
  questions: {
    questionNumber: number;
    section: string;
    marks: number;
    questionText: string;
    options?: string[];
    correctAnswer: string;
    modelSolution: string;
  }[];
}

export interface PracticeSubmission {
  id: string;
  userId: string;
  section: string;
  subject: string;
  chapterTitle?: string;
  totalQuestions: number;
  attempted: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  totalPossibleScore: number;
  accuracyPercentage: number;
  timeSpentSeconds: number;
  submittedAt: string;
  answers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    correctOptionId?: string;
    solution?: string;
  }[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'WELCOME' | 'PRACTICE' | 'EXAM_UPDATE' | 'EMAIL_SENT' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

export interface SentEmailLog {
  id: string;
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  sentAt: string;
  status: 'DELIVERED' | 'SIMULATED';
}

export interface PdfMaterial {
  id: string;
  title: string;
  section: 'Textbook' | 'Short Notes' | 'Textbook Questions' | 'State Board PYQ Papers' | 'Question Papers' | 'MHT-CET PYQ Papers';
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'All';
  chapterTitle?: string;
  year?: number;
  description?: string;
  fileUrl: string; // Base64 Data URL, uploaded path, or direct PDF link
  fileName: string;
  fileSize?: string;
  uploadedBy: string;
  uploadedAt: string;
}

