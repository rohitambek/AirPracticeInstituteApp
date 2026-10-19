import React, { useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AdminMaterialsPanelModal } from './components/AdminMaterialsPanelModal.tsx';
import { DashboardCore } from './components/DashboardCore.tsx';
import { EmailLogViewer } from './components/EmailLogViewer.tsx';
import { Footer } from './components/Footer.tsx';
import { Header } from './components/Header.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { MobileAppFrame } from './components/MobileAppFrame.tsx';
import { PracticeSelectorModal } from './components/PracticeSelectorModal.tsx';
import { PracticeSession } from './components/PracticeSession.tsx';
import { PYQPapersViewer } from './components/PYQPapersViewer.tsx';
import { SessionTerminatedModal } from './components/SessionTerminatedModal.tsx';
import { ShortNotesViewer } from './components/ShortNotesViewer.tsx';
import { TextbookViewer } from './components/TextbookViewer.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { api } from './services/api.ts';
import { Chapter, Question, Subject } from './types.ts';

function MainApp() {
  const { user, sessionNotice, dismissSessionNotice } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEmailLogsOpen, setIsEmailLogsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);

  // Practice Wizard & Active Test state
  const [isPracticeWizardOpen, setIsPracticeWizardOpen] = useState(false);
  const [wizardSectionTitle, setWizardSectionTitle] = useState('Topic-Wise MHT-CET Practice');
  const [wizardSubjectId, setWizardSubjectId] = useState<string | undefined>(undefined);

  const [activePracticeSession, setActivePracticeSession] = useState<{
    sectionTitle: string;
    subject: Subject;
    chapter: Chapter;
    questions: Question[];
  } | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await api.getSubjects();
        if (res.success) {
          setSubjects(res.subjects);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    }
    loadInitialData();
  }, []);

  // When an admin user logs in, automatically open their dedicated Admin Dashboard
  useEffect(() => {
    if (user?.role === 'ADMIN' && currentTab === 'dashboard') {
      setCurrentTab('admin');
    }
  }, [user]);

  const handleOpenSection = (sectionName: string, subjectId?: string) => {
    if (sectionName === 'Textbook') {
      setCurrentTab('textbook');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionName === 'Short Notes') {
      setCurrentTab('shortnotes');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionName === 'State Board PYQ Papers' || sectionName === 'MHT-CET PYQ Papers') {
      setCurrentTab('pyq');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionName === 'Topic-Wise MHT-CET Practice' || sectionName === 'Textbook Questions' || sectionName === 'Question Papers') {
      setWizardSectionTitle(sectionName);
      setWizardSubjectId(subjectId);
      setIsPracticeWizardOpen(true);
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleLaunchPractice = (
    sectionTitle: string,
    subject: Subject,
    chapter: Chapter,
    questions: Question[]
  ) => {
    setActivePracticeSession({
      sectionTitle,
      subject,
      chapter,
      questions,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f8fc] text-[#14213d] font-sans">
      {/* Header matching Reference */}
      <Header
        currentTab={activePracticeSession ? 'practice' : currentTab}
        onNavigate={tab => {
          setActivePracticeSession(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        isMobileSimulator={isMobileSimulator}
        onToggleMobileSimulator={() => setIsMobileSimulator(!isMobileSimulator)}
        onOpenEmails={() => setIsEmailLogsOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePracticeSession ? (
          <PracticeSession
            sectionTitle={activePracticeSession.sectionTitle}
            subject={activePracticeSession.subject}
            chapter={activePracticeSession.chapter}
            questions={activePracticeSession.questions}
            onBack={() => setActivePracticeSession(null)}
            onRetake={() => {
              // Reshuffle or restart
              const copy = { ...activePracticeSession };
              setActivePracticeSession(null);
              setTimeout(() => setActivePracticeSession(copy), 50);
            }}
          />
        ) : currentTab === 'admin' ? (
          <AdminDashboard
            subjects={subjects}
            onSwitchToStudentView={() => setCurrentTab('dashboard')}
          />
        ) : currentTab === 'textbook' ? (
          <TextbookViewer
            subjects={subjects}
            onStartChapterPractice={(subj, chap) => {
              setWizardSectionTitle('Chapter MCQs');
              setWizardSubjectId(subj.id);
              setIsPracticeWizardOpen(true);
            }}
            onBackToDashboard={() => setCurrentTab('dashboard')}
          />
        ) : currentTab === 'shortnotes' ? (
          <ShortNotesViewer
            subjects={subjects}
            onBackToDashboard={() => setCurrentTab('dashboard')}
            onStartPractice={(subj, chap) => {
              setWizardSectionTitle('Short Notes Practice');
              setWizardSubjectId(subj.id);
              setIsPracticeWizardOpen(true);
            }}
          />
        ) : currentTab === 'pyq' ? (
          <PYQPapersViewer onBackToDashboard={() => setCurrentTab('dashboard')} />
        ) : currentTab === 'practice' ? (
          <div className="max-w-[1050px] mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#e6edf6]">
              <div className="text-4xl mb-2">⚡</div>
              <h2 className="text-2xl font-black text-[#14213d] mb-2">
                Topic-Wise MHT-CET &amp; Board Practice
              </h2>
              <p className="text-sm text-gray-500 max-w-lg mx-auto mb-6">
                Choose any PCMB topic to solve 20 timed questions with instant score analysis and model solutions.
              </p>
              <button
                onClick={() => {
                  setWizardSectionTitle('Topic-Wise MHT-CET Practice');
                  setIsPracticeWizardOpen(true);
                }}
                className="bg-[#1261c9] hover:bg-[#0e4e9f] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md cursor-pointer transition-all"
              >
                SELECT TOPIC &amp; START TEST
              </button>
            </div>
          </div>
        ) : (
          <DashboardCore
            subjects={subjects}
            onOpenSection={handleOpenSection}
            onStartPracticeWizard={() => {
              setWizardSectionTitle('Topic-Wise MHT-CET Practice');
              setIsPracticeWizardOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer matching reference */}
      <Footer />

      {/* Practice Setup Wizard Modal */}
      {isPracticeWizardOpen && (
        <PracticeSelectorModal
          isOpen={isPracticeWizardOpen}
          onClose={() => setIsPracticeWizardOpen(false)}
          subjects={subjects}
          initialSectionTitle={wizardSectionTitle}
          initialSubjectId={wizardSubjectId}
          onLaunchPractice={handleLaunchPractice}
        />
      )}

      {/* Account Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoginModalOpen(false);
        }}
      />

      {/* Single-Device Policy Session Terminated Notification Modal */}
      <SessionTerminatedModal
        isOpen={!!sessionNotice?.show}
        onClose={dismissSessionNotice}
        onReLogin={() => {
          dismissSessionNotice();
          setIsLoginModalOpen(true);
        }}
        deviceInfo={sessionNotice?.deviceInfo}
        timestamp={sessionNotice?.timestamp}
        message={sessionNotice?.message}
      />

      {/* Sent Emails Outbox Viewer Modal */}
      <EmailLogViewer
        isOpen={isEmailLogsOpen}
        onClose={() => setIsEmailLogsOpen(false)}
      />

      {/* Admin PDF Materials Management Center Modal */}
      <AdminMaterialsPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />

      {/* Mobile Native App Simulator Overlay */}
      {isMobileSimulator && (
        <MobileAppFrame
          subjects={subjects}
          onOpenSection={(sectionName, subjectId) => {
            setIsMobileSimulator(false);
            handleOpenSection(sectionName, subjectId);
          }}
          onOpenLogin={() => {
            setIsMobileSimulator(false);
            setIsLoginModalOpen(true);
          }}
          onCloseSimulator={() => setIsMobileSimulator(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
