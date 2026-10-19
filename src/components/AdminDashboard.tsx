import {
  Activity,
  AlertCircle,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  FolderPlus,
  GraduationCap,
  Key,
  Layers,
  Lock,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { PdfMaterial, Subject, User } from '../types.ts';
import { PdfViewerModal } from './PdfViewerModal.tsx';

interface AdminDashboardProps {
  subjects: Subject[];
  onSwitchToStudentView: () => void;
}

const CHAPTER_PRESETS: Record<string, string[]> = {
  Physics: [
    'Rotational Dynamics',
    'Mechanical Properties of Fluids',
    'Kinetic Theory of Gases & Radiation',
    'Thermodynamics',
    'Oscillations & Wave Optics',
    'Electrostatics & Current Electricity',
    'Magnetic Effects of Electric Current',
    'Modern Physics & Semiconductors',
  ],
  Chemistry: [
    'Solid State',
    'Solutions',
    'Ionic Equilibria',
    'Chemical Thermodynamics',
    'Electrochemistry & Chemical Kinetics',
    'Transition & Inner Transition Elements',
    'Halogen Derivatives & Alcohols',
    'Aldehydes, Ketones & Carboxylic Acids',
  ],
  Mathematics: [
    'Mathematical Logic',
    'Matrices',
    'Trigonometric Functions',
    'Pair of Straight Lines & Vectors',
    'Differentiation & Applications',
    'Indefinite & Definite Integration',
    'Differential Equations & Probability',
    'Linear Programming & Binomial Distribution',
  ],
  Biology: [
    'Reproduction in Lower and Higher Plants',
    'Reproduction in Lower and Higher Animals',
    'Inheritance and Variation',
    'Molecular Basis of Inheritance',
    'Origin and Evolution of Life',
    'Plant Water Relations & Plant Growth',
    'Respiration and Circulation',
    'Control and Co-ordination',
  ],
  All: ['Full Syllabus Mock', 'Complete PCMB Combined', 'General Formula Sheet'],
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ subjects, onSwitchToStudentView }) => {
  const { user, logout } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CONTENT' | 'STUDENTS' | 'ACTIVITY'>('OVERVIEW');

  // Core data states
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<Array<User & { testAttemptsCount: number; lastTestDate: string | null }>>([]);
  const [materials, setMaterials] = useState<PdfMaterial[]>([]);
  const [recentActivity, setRecentActivity] = useState<{
    recentSubmissions: any[];
    recentEmails: any[];
    recentSignups: any[];
  }>({ recentSubmissions: [], recentEmails: [], recentSignups: [] });

  // Filtering states
  const [studentSearch, setStudentSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('All');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Preview & Action states
  const [previewMaterial, setPreviewMaterial] = useState<PdfMaterial | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);

  // Broadcast Announcement Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Content Upload Form State
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'All'>('Physics');
  const [uploadChapter, setUploadChapter] = useState('Rotational Dynamics');
  const [uploadCustomChapter, setUploadCustomChapter] = useState('');
  const [uploadSection, setUploadSection] = useState<
    'Short Notes' | 'Question Papers' | 'State Board PYQ Papers' | 'MHT-CET PYQ Papers' | 'Textbook' | 'Textbook Questions'
  >('Short Notes');
  const [uploadYear, setUploadYear] = useState<number | ''>(2024);
  const [uploadDescription, setUploadDescription] = useState('');
  const [isSubmittingContent, setIsSubmittingContent] = useState(false);
  // Student Account Registration Modal State
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentMobile, setNewStudentMobile] = useState('');
  const [newStudentTargetExam, setNewStudentTargetExam] = useState('12th Maharashtra State Board & MHT-CET');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentSendEmail, setNewStudentSendEmail] = useState(true);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [createdCredentialsNotice, setCreatedCredentialsNotice] = useState<{
    loginId: string;
    password: string;
    name: string;
    email: string;
  } | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string; loginId: string } | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; title: string } | null>(null);
  const [resettingStudent, setResettingStudent] = useState<any | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchAllAdminData = async () => {
    try {
      setLoading(true);
      const [metricsRes, usersRes, materialsRes, activityRes] = await Promise.all([
        api.getAdminMetrics().catch(() => ({ success: false, metrics: null })),
        api.getAdminUsers().catch(() => ({ success: false, users: [] })),
        api.getPdfMaterials().catch(() => ({ success: false, materials: [] })),
        api.getAdminActivity().catch(() => ({
          success: false,
          recentSubmissions: [],
          recentEmails: [],
          recentSignups: [],
        })),
      ]);

      if (metricsRes.success) setMetrics(metricsRes.metrics);
      if (usersRes.success) setUsersList(usersRes.users);
      if (materialsRes.success) setMaterials(materialsRes.materials);
      if (activityRes.success) {
        setRecentActivity({
          recentSubmissions: activityRes.recentSubmissions || [],
          recentEmails: activityRes.recentEmails || [],
          recentSignups: activityRes.recentSignups || [],
        });
      }
    } catch (err) {
      console.error('Failed to load admin console data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  // Handle PDF file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setActionError('Invalid file type: Please select a valid .pdf file.');
      return;
    }

    if (selectedFile.size > 28 * 1024 * 1024) {
      setActionError('File exceeds 28MB limit.');
      return;
    }

    setActionError('');
    setFile(selectedFile);
    setFileName(selectedFile.name);

    const mb = selectedFile.size / (1024 * 1024);
    setFileSize(mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(selectedFile.size / 1024)} KB`);

    if (!uploadTitle) {
      const cleanName = selectedFile.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
      setUploadTitle(cleanName);
    }
  };

  // Upload Content Form Handler
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (!file) {
      setActionError('Please select a PDF file (.pdf) to upload.');
      return;
    }

    const finalChapter =
      uploadChapter === 'CUSTOM' ? uploadCustomChapter.trim() : (uploadCustomChapter.trim() || uploadChapter.trim());
    if (!finalChapter) {
      setActionError('Please specify a target Chapter metadata tag.');
      return;
    }

    if (!uploadTitle.trim()) {
      setActionError('Please enter a document display title.');
      return;
    }

    try {
      setIsSubmittingContent(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', uploadSubject);
      formData.append('chapterTitle', finalChapter);
      formData.append('section', uploadSection);
      formData.append('title', uploadTitle.trim());
      if (uploadYear) formData.append('year', String(uploadYear));
      if (uploadDescription.trim()) formData.append('description', uploadDescription.trim());

      const res = await api.uploadPdfMaterialFormData(formData);
      if (res.success) {
        setActionSuccess(`Document "${res.material.title}" published & saved under ${uploadSubject} • ${finalChapter}!`);
        setMaterials((prev) => [res.material, ...prev]);

        // Reset upload fields
        setFile(null);
        setFileName('');
        setFileSize('');
        setUploadTitle('');
        setUploadDescription('');
        setUploadCustomChapter('');

        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to upload document.');
    } finally {
      setIsSubmittingContent(false);
    }
  };

  // Delete Document Handler with in-app confirmation modal
  const handleDeleteDocument = (id: string, title: string) => {
    setDocumentToDelete({ id, title });
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;
    try {
      setDeletingId(documentToDelete.id);
      const res = await api.deletePdfMaterial(documentToDelete.id);
      if (res.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== documentToDelete.id));
        setActionSuccess(`Document "${documentToDelete.title}" removed from database.`);
        setDocumentToDelete(null);
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete material.');
    } finally {
      setDeletingId(null);
    }
  };

  // Resend Welcome Email to Student Handler
  const handleResendWelcome = async (student: User) => {
    try {
      setResendingEmailId(student.id);
      setActionError('');
      const res = await api.resendWelcomeEmail({
        studentEmail: student.email,
        studentName: student.name,
        studentId: student.loginId,
      });

      if (res.success) {
        setActionSuccess(`Welcome onboarding email successfully resent to ${student.email}!`);
        setTimeout(() => setActionSuccess(''), 4000);
        // Refresh activity logs
        const actRes = await api.getAdminActivity();
        if (actRes.success) {
          setRecentActivity((prev) => ({
            ...prev,
            recentEmails: actRes.recentEmails || [],
          }));
        }
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to resend welcome email.');
    } finally {
      setResendingEmailId(null);
    }
  };

  const handleAutoGeneratePassword = () => {
    const letters = Math.random().toString(36).substring(2, 6);
    const digits = Math.floor(1000 + Math.random() * 9000);
    setNewStudentPassword(`Air#${digits}${letters}`);
  };

  const handleCreateStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (!newStudentName.trim()) {
      setActionError('Student full name is required.');
      return;
    }
    if (!newStudentEmail.trim()) {
      setActionError('Student email address is required.');
      return;
    }

    try {
      setIsCreatingStudent(true);
      const res = await api.createStudentByAdmin({
        name: newStudentName.trim(),
        email: newStudentEmail.trim(),
        mobile: newStudentMobile.trim() || undefined,
        password: newStudentPassword.trim() || undefined,
        targetExam: newStudentTargetExam,
        sendEmail: newStudentSendEmail,
      });

      if (res.success) {
        setUsersList((prev) => [res.student, ...prev]);
        setCreatedCredentialsNotice({
          loginId: res.credentials.loginId,
          password: res.credentials.password,
          name: res.student.name,
          email: res.student.email,
        });
        setActionSuccess(`Student account created! Student ID: ${res.credentials.loginId}. Welcome email sent: ${res.emailStatus}.`);
        setIsCreateStudentOpen(false);
        setNewStudentName('');
        setNewStudentEmail('');
        setNewStudentMobile('');
        setNewStudentPassword('');
        // Refresh metrics
        const met = await api.getAdminMetrics();
        if (met.success) setMetrics(met.metrics);
        setTimeout(() => setActionSuccess(''), 5000);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to create student account.');
    } finally {
      setIsCreatingStudent(false);
    }
  };

  const handleDeleteStudent = (student: any) => {
    setStudentToDelete({ id: student.id, name: student.name, loginId: student.loginId });
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      setDeletingStudentId(studentToDelete.id);
      const res = await api.deleteStudentByAdmin(studentToDelete.id);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => u.id !== studentToDelete.id));
        setActionSuccess(`Student account "${studentToDelete.name}" (${studentToDelete.loginId}) removed from directory.`);
        setMetrics((prev: any) =>
          prev
            ? {
                ...prev,
                totalStudents: Math.max(0, prev.totalStudents - 1),
                totalUsers: Math.max(0, prev.totalUsers - 1),
              }
            : prev
        );
        setStudentToDelete(null);
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete student.');
    } finally {
      setDeletingStudentId(null);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingStudent) return;
    try {
      setIsResettingPassword(true);
      const res = await api.resetStudentPasswordByAdmin(resettingStudent.id, {
        newPassword: newPasswordVal.trim() || undefined,
        sendEmail: true,
      });
      if (res.success) {
        setActionSuccess(
          `Password for ${resettingStudent.name} (${resettingStudent.loginId}) updated to: ${res.newPassword}. Welcome email dispatched to ${resettingStudent.email}.`
        );
        setResettingStudent(null);
        setNewPasswordVal('');
        setTimeout(() => setActionSuccess(''), 6000);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to reset password.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Broadcast Announcement to all students
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    try {
      setIsBroadcasting(true);
      const res = await api.broadcastAnnouncement({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        type: 'SYSTEM',
      });

      if (res.success) {
        setActionSuccess('Announcement broadcasted to all registered students!');
        setIsBroadcastOpen(false);
        setBroadcastTitle('');
        setBroadcastMessage('');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to broadcast announcement.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Filtered lists
  const filteredUsers = usersList.filter((u) => {
    if (u.role === 'ADMIN') return false; // Show students in student directory
    const query = studentSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.loginId.toLowerCase().includes(query) ||
      (u.mobile && u.mobile.includes(query)) ||
      (u.targetExam && u.targetExam.toLowerCase().includes(query))
    );
  });

  const filteredMaterials = materials.filter((m) => {
    const matchesSec = selectedSectionFilter === 'All' || m.section === selectedSectionFilter;
    const matchesSubj = selectedSubjectFilter === 'All' || m.subject === selectedSubjectFilter;
    const matchesQuery =
      materialSearch === '' ||
      m.title.toLowerCase().includes(materialSearch.toLowerCase()) ||
      (m.chapterTitle && m.chapterTitle.toLowerCase().includes(materialSearch.toLowerCase()));
    return matchesSec && matchesSubj && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-gray-900 pb-16 font-sans">
      {/* 1. Admin Top Executive Bar */}
      <div className="bg-[#082f73] text-white border-b border-[#0d3b8e] shadow-md sticky top-0 z-30">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-gray-950 flex items-center justify-center font-black shadow-sm shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white m-0">
                  AIR Practice Institute &bull; Administrator Console
                </h1>
                <span className="px-2 py-0.5 bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[10px] font-extrabold rounded-md uppercase">
                  Admin Authority
                </span>
              </div>
              <p className="text-xs text-blue-200 m-0">
                Logged in as <b>{user?.name || 'Administrator'}</b> ({user?.loginId}) &bull; Live Institutional Management &amp; Content Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Switch to Student View Toggle */}
            <button
              onClick={onSwitchToStudentView}
              className="py-2 px-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Preview institute portal as student"
            >
              <Eye size={15} className="text-amber-300" />
              <span>Switch to Student View</span>
            </button>

            {/* Broadcast Notice Button */}
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="py-2 px-3.5 bg-amber-400 hover:bg-amber-500 text-gray-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Bell size={15} />
              <span>Broadcast Notice</span>
            </button>

            {/* Refresh Data */}
            <button
              onClick={fetchAllAdminData}
              disabled={loading}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Refresh console data"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* 2. Admin Navigation Tabs */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none pt-1">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'OVERVIEW'
                ? 'border-amber-400 text-amber-300 bg-white/5 rounded-t-lg'
                : 'border-transparent text-blue-200 hover:text-white'
            }`}
          >
            <Activity size={15} />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('CONTENT')}
            className={`px-4 py-2.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'CONTENT'
                ? 'border-amber-400 text-amber-300 bg-white/5 rounded-t-lg'
                : 'border-transparent text-blue-200 hover:text-white'
            }`}
          >
            <FolderPlus size={15} />
            <span>Curriculum &amp; PDF Content ({materials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`px-4 py-2.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'STUDENTS'
                ? 'border-amber-400 text-amber-300 bg-white/5 rounded-t-lg'
                : 'border-transparent text-blue-200 hover:text-white'
            }`}
          >
            <Users size={15} />
            <span>Student Signups &amp; Directory ({filteredUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ACTIVITY')}
            className={`px-4 py-2.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'ACTIVITY'
                ? 'border-amber-400 text-amber-300 bg-white/5 rounded-t-lg'
                : 'border-transparent text-blue-200 hover:text-white'
            }`}
          >
            <Server size={15} />
            <span>System Activity &amp; Live Monitoring</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-6">
        {/* Alerts & Notifications */}
        {actionSuccess && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* 3. Top Executive KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4.5 border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1467d5] flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Registered Students
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#082f73]">
                {metrics?.totalStudents || usersList.filter((u) => u.role === 'STUDENT').length}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Verified Active Accounts</span>
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4.5 border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Curriculum Documents
              </span>
              <div className="text-xl sm:text-2xl font-black text-purple-900">
                {materials.length}
              </div>
              <span className="text-[10px] text-gray-500 font-semibold">
                Textbooks, Notes &amp; PYQs
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4.5 border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Tests Taken &amp; Accuracy
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-900">
                {metrics?.totalSubmissions || 0}{' '}
                <span className="text-xs font-bold text-amber-700">({metrics?.avgAccuracy || 74}% Avg)</span>
              </div>
              <span className="text-[10px] text-gray-500 font-semibold">
                Across PCMB Question Banks
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4.5 border border-gray-200 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Gmail SMTP Service
              </span>
              <div className="text-sm font-black text-emerald-800 flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Connected</span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono truncate max-w-[140px] block" title="airpracticeinstitute@gmail.com">
                airpracticeinstitute@gmail.com
              </span>
            </div>
          </div>
        </div>

        {/* 4. TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Quick Actions & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Navigation Cards */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
                  <h3 className="text-sm font-black text-[#082f73] mb-3 flex items-center gap-2">
                    <Sparkles size={17} className="text-amber-500" />
                    <span>Administrator Operational Command Center</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setActiveTab('CONTENT')}
                      className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#1467d5] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Upload size={18} />
                      </div>
                      <h4 className="text-xs font-bold text-[#082f73] m-0">Publish PDF Document</h4>
                      <p className="text-[11px] text-gray-500 mt-1 m-0">
                        Upload &amp; tag textbooks, formulas, or PYQ papers with Subject/Chapter
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('STUDENTS')}
                      className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Users size={18} />
                      </div>
                      <h4 className="text-xs font-bold text-emerald-900 m-0">Inspect Student Signups</h4>
                      <p className="text-[11px] text-gray-500 mt-1 m-0">
                        View accounts, test submissions, and resend welcome onboarding emails
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('ACTIVITY')}
                      className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Activity size={18} />
                      </div>
                      <h4 className="text-xs font-bold text-purple-900 m-0">Monitor Live Activity</h4>
                      <p className="text-[11px] text-gray-500 mt-1 m-0">
                        Real-time student test attempts, SMTP email dispatch logs, and analytics
                      </p>
                    </button>
                  </div>
                </div>

                {/* PCMB Subject Distribution Summary */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
                  <h3 className="text-sm font-black text-[#082f73] mb-3 flex items-center justify-between">
                    <span>Curriculum Subject Coverage (12th Board &amp; MHT-CET)</span>
                    <span className="text-xs font-bold text-gray-400">4 Subjects Active</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {subjects.map((subj) => {
                      const subjDocs = materials.filter((m) => m.subject === subj.name);
                      return (
                        <div
                          key={subj.id}
                          className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 text-center"
                        >
                          <div className="text-2xl mb-1">{subj.icon}</div>
                          <h4 className="text-xs font-extrabold text-gray-900 m-0">{subj.name}</h4>
                          <span className="text-[11px] text-gray-500 font-semibold block mt-0.5">
                            {subj.totalChapters} Chapters
                          </span>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-[#1467d5] text-[10px] font-bold rounded-md">
                            {subjDocs.length} PDF Materials
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* System Diagnostics & Status */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
                  <h3 className="text-sm font-black text-[#082f73] mb-3 flex items-center gap-2">
                    <Server size={17} className="text-emerald-600" />
                    <span>System Health &amp; Infrastructure</span>
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-gray-700">API Server:</span>
                      <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Node Express (Port 3000)
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-gray-700">Database Engine:</span>
                      <span className="font-extrabold text-blue-700">JSON Flat-File Persisted</span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-gray-700">Gmail SMTP Gateway:</span>
                      <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        Connected (465 SSL)
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-gray-700">Dispatched Emails:</span>
                      <span className="font-extrabold text-gray-900">
                        {recentActivity.recentEmails.length} logged
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setIsBroadcastOpen(true)}
                      className="w-full py-2.5 bg-[#082f73] hover:bg-[#0b3d91] text-white font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Bell size={14} />
                      <span>Send Institute-Wide Announcement</span>
                    </button>
                  </div>
                </div>

                {/* Quick Recent Signups Snapshot */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black text-[#082f73] m-0">Recent Signups</h3>
                    <button
                      onClick={() => setActiveTab('STUDENTS')}
                      className="text-xs font-bold text-[#1467d5] hover:underline cursor-pointer"
                    >
                      View All &rarr;
                    </button>
                  </div>

                  <div className="space-y-2">
                    {filteredUsers.slice(0, 4).map((st) => (
                      <div
                        key={st.id}
                        className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-extrabold text-gray-900">{st.name}</div>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {st.loginId} &bull; {st.email}
                          </span>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-[#082f73] font-bold px-2 py-0.5 rounded-full">
                          {st.testAttemptsCount} tests
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. TAB 2: CONTENT & CURRICULUM MANAGEMENT */}
        {activeTab === 'CONTENT' && (
          <div className="space-y-6">
            {/* Direct Upload Multi-part Form */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
              <div className="mb-4">
                <h3 className="text-sm font-black text-[#082f73] m-0 flex items-center gap-2">
                  <Upload size={17} className="text-[#1467d5]" />
                  <span>Upload &amp; Attach Official PDF Material to Curriculum</span>
                </h3>
                <p className="text-xs text-gray-500 m-0 mt-0.5">
                  Multi-part FormData upload with curriculum Subject &amp; Chapter metadata tagging for database storage.
                </p>
              </div>

              <form
                encType="multipart/form-data"
                onSubmit={handleUploadSubmit}
                className="space-y-4 text-xs"
              >
                {/* PDF File Picker */}
                <div>
                  <label htmlFor="adminContentPdfInput" className="block font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                    <span>1. PDF Document File *</span>
                    <span className="text-[11px] font-normal text-gray-400">Accepts .pdf (up to 28MB)</span>
                  </label>

                  <div className="relative border-2 border-dashed border-gray-300 hover:border-[#1467d5] rounded-xl p-5 text-center bg-gray-50/70 hover:bg-blue-50/20 transition-all cursor-pointer">
                    <input
                      type="file"
                      id="adminContentPdfInput"
                      name="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required
                    />

                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-blue-100/70 text-[#1467d5] flex items-center justify-center shadow-xs">
                        {file ? <FileCheck size={24} className="text-emerald-600" /> : <Upload size={22} />}
                      </div>

                      {file ? (
                        <div>
                          <p className="font-extrabold text-[#082f73] text-sm m-0">{fileName}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold m-0 mt-0.5 flex items-center justify-center gap-1">
                            <CheckCircle2 size={12} />
                            <span>PDF Attached ({fileSize})</span>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-[#1467d5] text-xs m-0">
                            Click to select or drag &amp; drop a .pdf file here
                          </p>
                          <p className="text-[11px] text-gray-400 m-0 mt-0.5">
                            Maharashtra State Board Textbooks, Chapter Notes, Formula Booklets, or PYQs
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metadata: Subject & Chapter Tagging */}
                <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag size={15} className="text-[#082f73]" />
                    <h5 className="font-extrabold text-[#082f73] text-xs m-0">
                      2. Metadata Tagging (Target Subject &amp; Chapter)
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="adminTargetSubject" className="block font-bold text-gray-700 mb-1">
                        Target Subject *
                      </label>
                      <select
                        id="adminTargetSubject"
                        name="subject"
                        value={uploadSubject}
                        onChange={(e) => {
                          const subj = e.target.value as any;
                          setUploadSubject(subj);
                          const presets = CHAPTER_PRESETS[subj] || [];
                          setUploadChapter(presets[0] || '');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5] font-semibold text-xs"
                        required
                      >
                        <option value="Physics">Physics ⚡</option>
                        <option value="Chemistry">Chemistry 🧪</option>
                        <option value="Mathematics">Mathematics 📐</option>
                        <option value="Biology">Biology 🧬</option>
                        <option value="All">All Subjects (Combined Mock / General Guide)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="adminTargetChapter" className="block font-bold text-gray-700 mb-1">
                        Target Chapter *
                      </label>
                      <select
                        id="adminTargetChapter"
                        name="chapterTitle"
                        value={uploadChapter}
                        onChange={(e) => {
                          setUploadChapter(e.target.value);
                          setUploadCustomChapter('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5] font-semibold text-xs truncate"
                        required
                      >
                        {(CHAPTER_PRESETS[uploadSubject] || []).map((ch) => (
                          <option key={ch} value={ch}>
                            {ch}
                          </option>
                        ))}
                        <option value="CUSTOM">➕ Other / Custom Chapter Topic...</option>
                      </select>
                    </div>
                  </div>

                  {(uploadChapter === 'CUSTOM' || uploadCustomChapter) && (
                    <div>
                      <label className="block font-semibold text-gray-600 mb-1">
                        Custom Chapter / Topic Title *
                      </label>
                      <input
                        type="text"
                        value={uploadCustomChapter}
                        onChange={(e) => setUploadCustomChapter(e.target.value)}
                        placeholder="Enter specific chapter or topic title..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs font-semibold"
                        required={uploadChapter === 'CUSTOM'}
                      />
                    </div>
                  )}
                </div>

                {/* Section, Year, Title, Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Target Curriculum Section *</label>
                    <select
                      value={uploadSection}
                      onChange={(e) => setUploadSection(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-semibold text-xs"
                      required
                    >
                      <option value="Short Notes">Short Notes (Revision PDFs)</option>
                      <option value="Question Papers">Question Papers (Chapter Tests)</option>
                      <option value="State Board PYQ Papers">12th State Board PYQ Papers</option>
                      <option value="MHT-CET PYQ Papers">MHT-CET / NEET PYQ Papers</option>
                      <option value="Textbook">Textbook (Full PDF)</option>
                      <option value="Textbook Questions">Textbook Questions &amp; Answers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Exam Year Tag (Optional)</label>
                    <input
                      type="number"
                      value={uploadYear}
                      onChange={(e) => setUploadYear(e.target.value ? Number(e.target.value) : '')}
                      placeholder="2024"
                      min={2018}
                      max={2030}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Document Display Title *</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Rotational Dynamics Handwritten Formulae &amp; Derivations PDF"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Description / Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="e.g. Includes step-by-step marking scheme, derivations, and board tips."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingContent || !file}
                  className="w-full py-3 bg-[#1261c9] hover:bg-[#0d4ea5] disabled:bg-gray-300 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmittingContent ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Saving PDF to Database...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>UPLOAD MULTIPART FORMDATA &amp; STORE IN DATABASE</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Document Library Table */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-black text-[#082f73] m-0">
                    Existing Curriculum Materials Library ({filteredMaterials.length})
                  </h3>
                  <p className="text-xs text-gray-500 m-0">
                    Official PDFs accessible by students across all institute devices
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Search */}
                  <div className="relative w-full sm:w-60">
                    <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={materialSearch}
                      onChange={(e) => setMaterialSearch(e.target.value)}
                      placeholder="Search title, chapter..."
                      className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  {/* Subject filter */}
                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold bg-white"
                  >
                    <option value="All">All Subjects</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>

                  {/* Section filter */}
                  <select
                    value={selectedSectionFilter}
                    onChange={(e) => setSelectedSectionFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold bg-white"
                  >
                    <option value="All">All Sections</option>
                    <option value="Short Notes">Short Notes</option>
                    <option value="Question Papers">Question Papers</option>
                    <option value="State Board PYQ Papers">State Board PYQs</option>
                    <option value="MHT-CET PYQ Papers">MHT-CET PYQs</option>
                    <option value="Textbook">Textbooks</option>
                    <option value="Textbook Questions">Textbook Q&amp;A</option>
                  </select>
                </div>
              </div>

              {filteredMaterials.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  No materials found matching your filters.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0 border border-red-100">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="px-2 py-0.5 bg-blue-50 text-[#1467d5] font-extrabold text-[10px] rounded-md border border-blue-200">
                              {mat.section}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-extrabold text-[10px] rounded-md border border-emerald-200">
                              {mat.subject}
                            </span>
                            {mat.chapterTitle && (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-800 font-bold text-[10px] rounded-md border border-purple-200">
                                {mat.chapterTitle}
                              </span>
                            )}
                            {mat.year && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold text-[10px] rounded-md">
                                Year: {mat.year}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 font-medium">{mat.fileSize || 'PDF'}</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 m-0">{mat.title}</h4>
                          {mat.description && (
                            <p className="text-[11px] text-gray-500 m-0 mt-0.5 line-clamp-1">{mat.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => setPreviewMaterial(mat)}
                          className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-[#1467d5] font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Preview</span>
                        </button>
                        <a
                          href={mat.fileUrl}
                          download={mat.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="py-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(mat.id, mat.title)}
                          disabled={deletingId === mat.id}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Admin: Delete document"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. TAB 3: STUDENT SIGNUPS & DIRECTORY */}
        {activeTab === 'STUDENTS' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-sm font-black text-[#082f73] m-0">
                    Registered Students Directory ({filteredUsers.length})
                  </h3>
                  <p className="text-xs text-gray-500 m-0">
                    Student accounts are issued exclusively by Admin &amp; receive welcome onboarding emails
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="relative w-full sm:w-64">
                    <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search name, email, ID..."
                      className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>

                  <button
                    onClick={() => setIsCreateStudentOpen(true)}
                    className="py-1.5 px-3 bg-[#1261c9] hover:bg-[#0f52b0] text-white font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <UserPlus size={14} />
                    <span>+ Register New Student</span>
                  </button>
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400">
                  No students found matching "{studentSearch}".
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="pb-3 pr-4">Student ID &amp; Name</th>
                        <th className="pb-3 px-3">Registered Email</th>
                        <th className="pb-3 px-3">Mobile</th>
                        <th className="pb-3 px-3">Target Exam</th>
                        <th className="pb-3 px-3">Practice Tests</th>
                        <th className="pb-3 px-3">Joined Date</th>
                        <th className="pb-3 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((st) => (
                        <tr key={st.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 pr-4 font-bold text-gray-900">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1467d5] flex items-center justify-center font-bold text-xs shrink-0">
                                {st.name.charAt(0)}
                              </div>
                              <div>
                                <div>{st.name}</div>
                                <span className="text-[10px] text-gray-500 font-mono font-bold block">
                                  {st.loginId}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-gray-600">
                            {st.email}
                          </td>

                          <td className="py-3.5 px-3 font-mono text-gray-500">
                            {st.mobile || '—'}
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 bg-blue-50 text-[#1467d5] font-bold text-[10px] rounded-md border border-blue-200 whitespace-nowrap">
                              {st.targetExam || '12th Board'}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="font-extrabold text-[#082f73]">
                              {st.testAttemptsCount} attempts
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                            {new Date(st.createdAt || Date.now()).toLocaleDateString()}
                          </td>

                          <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleResendWelcome(st)}
                                disabled={resendingEmailId === st.id}
                                className="py-1 px-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-[11px] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                                title="Resend welcome onboarding email from airpracticeinstitute@gmail.com"
                              >
                                <Mail size={12} className={resendingEmailId === st.id ? 'animate-spin' : ''} />
                                <span>{resendingEmailId === st.id ? 'Sending...' : 'Email'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setResettingStudent(st);
                                  const digits = Math.floor(1000 + Math.random() * 9000);
                                  setNewPasswordVal(`Air#${digits}`);
                                }}
                                className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1261c9] font-bold text-[11px] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                                title="Reset Student Password & Dispatch New Credentials via Email"
                              >
                                <Key size={12} />
                                <span>Reset Pass</span>
                              </button>

                              {st.role !== 'ADMIN' && (
                                <button
                                  onClick={() => handleDeleteStudent(st)}
                                  disabled={deletingStudentId === st.id}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Admin: Delete Student Account"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. TAB 4: SYSTEM ACTIVITY & LIVE MONITORING */}
        {activeTab === 'ACTIVITY' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Test Practice Activity Stream */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
              <h3 className="text-sm font-black text-[#082f73] mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity size={17} className="text-amber-600" />
                  <span>Student Test Submissions Activity</span>
                </span>
                <span className="text-[11px] font-bold text-gray-400">Live Feed</span>
              </h3>

              {recentActivity.recentSubmissions.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400">
                  No practice test submissions recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.recentSubmissions.slice(0, 10).map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl border border-gray-100 bg-gray-50/70 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-extrabold text-gray-900 flex items-center gap-2">
                          <span>{sub.subject}</span>
                          <span className="text-[10px] text-gray-500 font-normal">&bull; {sub.section}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Score: <b>{sub.score}/{sub.totalPossibleScore}</b> &bull; Accuracy:{' '}
                          <span className={sub.accuracyPercentage >= 70 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                            {sub.accuracyPercentage}%
                          </span>{' '}
                          &bull; Time: {sub.timeSpent}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Gmail SMTP Dispatch Stream */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
              <h3 className="text-sm font-black text-[#082f73] mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mail size={17} className="text-emerald-600" />
                  <span>Dispatched Emails Stream (SMTP)</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  airpracticeinstitute@gmail.com
                </span>
              </h3>

              {recentActivity.recentEmails.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400">
                  No emails logged in recent dispatch session.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.recentEmails.slice(0, 10).map((em) => (
                    <div
                      key={em.id}
                      className="p-3 rounded-xl border border-gray-100 bg-gray-50/70 text-xs flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-extrabold text-gray-900 truncate">{em.subject}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          To: <span className="font-mono">{em.to}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                            em.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {em.status}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {new Date(em.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 text-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#082f73]" />
                <h3 className="text-sm font-extrabold text-[#082f73] m-0">
                  Broadcast Announcement to All Students
                </h3>
              </div>
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Maharashtra Board March 2026 Timetable Released"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notice Message *</label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter notice details that all students will see on their dashboard notification inbox..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={isBroadcasting}
                className="w-full py-2.5 bg-[#082f73] hover:bg-[#0b3d91] text-white font-extrabold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isBroadcasting ? 'Broadcasting...' : 'SEND ANNOUNCEMENT TO ALL STUDENTS'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* In-Modal PDF Document Preview */}
      {previewMaterial && (
        <PdfViewerModal
          material={previewMaterial}
          onClose={() => setPreviewMaterial(null)}
        />
      )}

      {/* Modal: Register New Student (Admin Only) */}
      {isCreateStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 text-gray-900 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1261c9] flex items-center justify-center font-bold">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#082f73] m-0">
                    Register New Student Account
                  </h3>
                  <p className="text-[10px] text-gray-500 m-0">Admin Enrolment &amp; Credentials Dispatch</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateStudentOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStudentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Sahil Shinde"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Student Email Address *</span>
                  <span className="text-[10px] text-[#1261c9] font-normal">Receives welcome &amp; login packet</span>
                </label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="e.g. sahil.student@gmail.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Number (Optional)</label>
                <input
                  type="tel"
                  value={newStudentMobile}
                  onChange={(e) => setNewStudentMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Exam Curriculum</label>
                <select
                  value={newStudentTargetExam}
                  onChange={(e) => setNewStudentTargetExam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold bg-white"
                >
                  <option value="12th Maharashtra State Board & MHT-CET">
                    12th Maharashtra State Board &amp; MHT-CET (PCM/PCB)
                  </option>
                  <option value="MHT-CET (PCM)">MHT-CET (Engineering / PCM)</option>
                  <option value="NEET-UG & 12th Board">NEET-UG &amp; 12th Board (PCB)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">Account Password</label>
                  <button
                    type="button"
                    onClick={handleAutoGeneratePassword}
                    className="text-[11px] font-bold text-[#1261c9] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles size={12} />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  placeholder="Leave empty to auto-generate secure password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input
                    type="checkbox"
                    checked={newStudentSendEmail}
                    onChange={(e) => setNewStudentSendEmail(e.target.checked)}
                    className="rounded border-gray-300 text-[#1261c9] focus:ring-[#1261c9]"
                  />
                  <span className="font-medium text-[11px]">
                    Dispatch welcome email with Student ID &amp; Password immediately via SMTP
                  </span>
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateStudentOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingStudent}
                  className="flex-1 py-2.5 bg-[#1261c9] hover:bg-[#0f52b0] text-white font-extrabold rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isCreatingStudent ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    <span>Create &amp; Dispatch</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Created Credentials Display Card */}
      {createdCredentialsNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-emerald-300 p-6 text-gray-900 overflow-hidden text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} />
            </div>

            <h3 className="text-base font-black text-[#082f73] m-0">Student Account Created!</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Credentials dispatched to <b>{createdCredentialsNotice.email}</b>
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-3 mb-5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-500 block text-[10px] font-medium">Student Name:</span>
                  <b className="text-gray-900">{createdCredentialsNotice.name}</b>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div>
                  <span className="text-gray-500 block text-[10px] font-medium">Student Login ID:</span>
                  <span className="font-mono text-sm font-extrabold text-[#082f73]">
                    {createdCredentialsNotice.loginId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdCredentialsNotice.loginId);
                    setCopiedField('id');
                    setTimeout(() => setCopiedField(null), 2000);
                  }}
                  className="py-1 px-2.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'id' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedField === 'id' ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div>
                  <span className="text-gray-500 block text-[10px] font-medium">Student Password:</span>
                  <span className="font-mono text-sm font-extrabold text-emerald-800">
                    {createdCredentialsNotice.password}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdCredentialsNotice.password);
                    setCopiedField('pass');
                    setTimeout(() => setCopiedField(null), 2000);
                  }}
                  className="py-1 px-2.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'pass' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copiedField === 'pass' ? 'Copied' : 'Copy Pass'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setCreatedCredentialsNotice(null)}
              className="w-full py-2.5 bg-[#082f73] hover:bg-[#0b3d91] text-white font-extrabold rounded-xl shadow cursor-pointer text-xs"
            >
              Done &amp; Return to Directory
            </button>
          </div>
        </div>
      )}

      {/* Modal: Reset Student Password */}
      {resettingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 text-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-[#1261c9]" />
                <h3 className="text-sm font-black text-[#082f73] m-0">Reset Password</h3>
              </div>
              <button
                onClick={() => setResettingStudent(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
              <p className="text-gray-600 m-0 leading-relaxed">
                Resetting password for <b>{resettingStudent.name}</b> (ID: <code>{resettingStudent.loginId}</code>).
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">New Password *</label>
                <input
                  type="text"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs font-bold"
                />
              </div>

              <p className="text-[11px] text-gray-500 m-0">
                A welcome update email will be dispatched to <b>{resettingStudent.email}</b>.
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setResettingStudent(null)}
                  className="flex-1 py-2 border border-gray-300 rounded-xl font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="flex-1 py-2 bg-[#1261c9] hover:bg-[#0f52b0] text-white font-extrabold rounded-xl shadow disabled:opacity-50"
                >
                  {isResettingPassword ? 'Updating...' : 'Update & Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Student Account */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border-2 border-red-200 p-6 text-gray-900 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-black text-gray-900 m-0 mb-1">Delete Student Account?</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Are you sure you want to permanently delete <b>{studentToDelete.name}</b> (ID:{' '}
              <span className="font-mono font-bold text-red-700">{studentToDelete.loginId}</span>)? This will erase their
              account registration, test history, and access.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                disabled={deletingStudentId === studentToDelete.id}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deletingStudentId === studentToDelete.id ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Curriculum Document */}
      {documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-red-200 p-6 text-gray-900 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-black text-gray-900 m-0 mb-1">Delete Curriculum PDF?</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Are you sure you want to permanently delete "<b>{documentToDelete.title}</b>"? It will no longer be available to
              students.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDocumentToDelete(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteDocument}
                disabled={deletingId === documentToDelete.id}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deletingId === documentToDelete.id ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete PDF</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
