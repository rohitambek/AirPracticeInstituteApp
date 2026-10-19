import {
  Chapter,
  NotificationItem,
  PdfMaterial,
  PracticeSubmission,
  PYQPaper,
  Question,
  SentEmailLog,
  ShortNote,
  Subject,
  TextbookContent,
  User,
} from '../types.ts';

const TOKEN_KEY = 'air_practice_jwt_token';
const USER_KEY = 'air_practice_user';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    if (data.code === 'SESSION_TERMINATED') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('air_session_terminated', { detail: data }));
      }
    }
    const err = new Error(data.message || `Request failed with status ${response.status}`);
    (err as any).code = data.code;
    (err as any).data = data;
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  async checkSession(): Promise<{ success: boolean; active: boolean; sessionId: string; device: string }> {
    return apiRequest('/api/auth/session-check');
  },

  async login(loginId: string, password: string): Promise<{ success: boolean; token: string; user: User }> {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ loginId, password }),
    });
  },

  async signup(payload: {
    name: string;
    email?: string;
    mobile?: string;
    password: string;
    confirmPassword: string;
    targetExam?: string;
  }): Promise<{ success: boolean; token: string; user: User; message: string }> {
    return apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    return apiRequest('/api/auth/me');
  },

  async logout(): Promise<{ success: boolean }> {
    return apiRequest('/api/auth/logout', { method: 'POST' });
  },

  // Dashboard
  async getDashboardData(): Promise<{ success: boolean; data: any }> {
    return apiRequest('/api/dashboard');
  },

  async getStudentStats(): Promise<{ success: boolean; data: any }> {
    return apiRequest('/api/dashboard/student/me');
  },

  // Subjects & Content
  async getSubjects(): Promise<{ success: boolean; subjects: Subject[] }> {
    return apiRequest('/api/subjects');
  },

  async getChapters(subjectId: string): Promise<{ success: boolean; chapters: Chapter[] }> {
    return apiRequest(`/api/subjects/${subjectId}/chapters`);
  },

  async getTextbookContent(chapterId: string): Promise<{ success: boolean; content: TextbookContent | null }> {
    return apiRequest(`/api/chapters/${chapterId}/content`);
  },

  async getShortNotes(chapterId: string): Promise<{ success: boolean; shortNote: ShortNote | null }> {
    return apiRequest(`/api/chapters/${chapterId}/shortnotes`);
  },

  async getQuestions(params: { subjectId?: string; chapterId?: string; limit?: number }): Promise<{
    success: boolean;
    total: number;
    questions: Question[];
  }> {
    const searchParams = new URLSearchParams();
    if (params.subjectId) searchParams.append('subjectId', params.subjectId);
    if (params.chapterId) searchParams.append('chapterId', params.chapterId);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    return apiRequest(`/api/questions?${searchParams.toString()}`);
  },

  async getPapers(params?: { exam?: string; year?: number; subject?: string }): Promise<{
    success: boolean;
    papers: PYQPaper[];
  }> {
    const searchParams = new URLSearchParams();
    if (params?.exam) searchParams.append('exam', params.exam);
    if (params?.year) searchParams.append('year', params.year.toString());
    if (params?.subject) searchParams.append('subject', params.subject);
    return apiRequest(`/api/papers?${searchParams.toString()}`);
  },

  async getPaperById(id: string): Promise<{ success: boolean; paper: PYQPaper }> {
    return apiRequest(`/api/papers/${id}`);
  },

  async submitPractice(payload: {
    section: string;
    subject: string;
    chapterTitle?: string;
    answers: { questionId: string; selectedOptionId: string }[];
    timeSpentSeconds: number;
  }): Promise<{
    success: boolean;
    submission: PracticeSubmission;
    evaluation: any[];
    message: string;
  }> {
    return apiRequest('/api/practice/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Notifications
  async getNotifications(): Promise<{
    success: boolean;
    unreadCount: number;
    notifications: NotificationItem[];
  }> {
    return apiRequest('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean; message: string }> {
    return apiRequest('/api/notifications/read-all', { method: 'PATCH' });
  },

  async getRecentSentEmails(): Promise<{ success: boolean; emails: SentEmailLog[] }> {
    return apiRequest('/api/notifications/emails/recent');
  },

  // PDF Materials (Notes & Question Papers)
  async getPdfMaterials(params?: { section?: string; subject?: string }): Promise<{
    success: boolean;
    materials: PdfMaterial[];
  }> {
    const searchParams = new URLSearchParams();
    if (params?.section) searchParams.append('section', params.section);
    if (params?.subject) searchParams.append('subject', params.subject);
    return apiRequest(`/api/materials?${searchParams.toString()}`);
  },

  async addPdfMaterial(payload: {
    title: string;
    section: string;
    subject: string;
    chapterTitle?: string;
    year?: number;
    description?: string;
    fileUrl: string;
    fileName: string;
    fileSize?: string;
  }): Promise<{
    success: boolean;
    message: string;
    material: PdfMaterial;
  }> {
    return apiRequest('/api/materials', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async uploadPdfMaterialFormData(formData: FormData): Promise<{
    success: boolean;
    message: string;
    material: PdfMaterial;
  }> {
    return apiRequest('/api/materials', {
      method: 'POST',
      body: formData,
    });
  },

  async deletePdfMaterial(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/api/materials/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Dedicated Admin Console Endpoints ---
  async getAdminMetrics(): Promise<{
    success: boolean;
    metrics: {
      totalUsers: number;
      totalStudents: number;
      totalAdmins: number;
      totalMaterials: number;
      totalQuestions: number;
      totalSubmissions: number;
      avgAccuracy: number;
      totalEmailsSent: number;
      deliveredEmails: number;
      smtpConfigured: boolean;
      smtpSender: string;
      serverUptime: number;
      databaseType: string;
    };
  }> {
    return apiRequest('/api/admin/metrics');
  },

  async getAdminUsers(): Promise<{
    success: boolean;
    users: Array<User & { testAttemptsCount: number; lastTestDate: string | null }>;
    count: number;
  }> {
    return apiRequest('/api/admin/users');
  },

  async getAdminActivity(): Promise<{
    success: boolean;
    recentSubmissions: any[];
    recentEmails: any[];
    recentSignups: any[];
  }> {
    return apiRequest('/api/admin/activity');
  },

  async broadcastAnnouncement(payload: {
    title: string;
    message: string;
    type?: string;
  }): Promise<{ success: boolean; message: string; notification: any }> {
    return apiRequest('/api/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async resendWelcomeEmail(payload: {
    studentEmail: string;
    studentName?: string;
    studentId: string;
  }): Promise<{ success: boolean; message: string; status: string }> {
    return apiRequest('/api/admin/resend-welcome', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createStudentByAdmin(payload: {
    name: string;
    email: string;
    mobile?: string;
    password?: string;
    targetExam?: string;
    sendEmail?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    student: any;
    credentials: { loginId: string; password: string };
    emailStatus: string;
  }> {
    return apiRequest('/api/admin/students', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteStudentByAdmin(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/api/admin/students/${id}`, {
      method: 'DELETE',
    });
  },

  async resetStudentPasswordByAdmin(
    id: string,
    payload: { newPassword?: string; sendEmail?: boolean }
  ): Promise<{ success: boolean; message: string; loginId: string; newPassword: string; emailSent: boolean }> {
    return apiRequest(`/api/admin/students/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
