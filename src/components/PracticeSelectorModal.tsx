import { ArrowRight, BookOpen, Clock, Sparkles, X, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { Chapter, Question, Subject } from '../types.ts';

interface PracticeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialSectionTitle?: string;
  initialSubjectId?: string;
  onLaunchPractice: (sectionTitle: string, subject: Subject, chapter: Chapter, questions: Question[]) => void;
}

export const PracticeSelectorModal: React.FC<PracticeSelectorModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialSectionTitle,
  initialSubjectId,
  onLaunchPractice,
}) => {
  const [sectionTitle, setSectionTitle] = useState(initialSectionTitle || 'Topic-Wise MHT-CET Practice');
  const [selectedSubject, setSelectedSubject] = useState<Subject>(
    subjects.find(s => s.id === initialSubjectId) || subjects[0]
  );
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialSectionTitle) {
      setSectionTitle(initialSectionTitle);
    }
  }, [initialSectionTitle]);

  useEffect(() => {
    if (initialSubjectId) {
      const match = subjects.find(s => s.id === initialSubjectId);
      if (match) setSelectedSubject(match);
    }
  }, [initialSubjectId, subjects]);

  useEffect(() => {
    async function loadChapters() {
      if (!selectedSubject) return;
      try {
        const res = await api.getChapters(selectedSubject.id);
        if (res.success) {
          setChapters(res.chapters);
          setSelectedChapter(res.chapters[0] || null);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadChapters();
  }, [selectedSubject]);

  if (!isOpen) return null;

  const handleStart = async () => {
    if (!selectedChapter) {
      setErrorMsg('Please select a chapter to practice.');
      return;
    }
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await api.getQuestions({
        subjectId: selectedSubject.id,
        chapterId: selectedChapter.id,
        limit: questionCount,
      });

      // If chapter doesn't have enough specific questions, fallback to subject questions
      let loadedQuestions = res.questions;
      if (!loadedQuestions || loadedQuestions.length === 0) {
        const fallbackRes = await api.getQuestions({
          subjectId: selectedSubject.id,
          limit: questionCount,
        });
        loadedQuestions = fallbackRes.questions;
      }

      if (!loadedQuestions || loadedQuestions.length === 0) {
        // Fallback to all questions
        const allRes = await api.getQuestions({ limit: questionCount });
        loadedQuestions = allRes.questions;
      }

      onLaunchPractice(sectionTitle, selectedSubject, selectedChapter, loadedQuestions);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch practice questions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-[500px] bg-white rounded-[22px] shadow-2xl border border-gray-100 p-6 text-[#17233c] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1261c9] uppercase tracking-wider mb-1">
            <Zap size={15} />
            <span>Practice Setup Wizard</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#082f73] m-0">Start Practice Session</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure your topic, question count and time limit.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          {/* Step 1: Select Subject */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              1. Select Subject (PCMB)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {subjects.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSubject(s)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedSubject.id === s.id
                      ? 'border-[#1261c9] bg-blue-50/70 text-[#1261c9] shadow-xs'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Chapter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              2. Select Chapter / Topic
            </label>
            <select
              value={selectedChapter?.id || ''}
              onChange={e => {
                const found = chapters.find(c => c.id === e.target.value);
                if (found) setSelectedChapter(found);
              }}
              className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-white focus:ring-2 focus:ring-[#1261c9]/20"
            >
              {chapters.map(c => (
                <option key={c.id} value={c.id}>
                  Ch {c.chapterNumber}: {c.title} ({c.weightage})
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Question Count */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              3. Practice Mode &amp; Question Count
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 20].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    questionCount === cnt
                      ? 'border-[#1261c9] bg-[#1261c9] text-white shadow-xs'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-[#1261c9] hover:bg-[#0e4e9f] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              'Preparing Question Set...'
            ) : (
              <>
                <span>START {questionCount} QUESTIONS PRACTICE</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
