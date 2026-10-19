import { ArrowLeft, BookOpen, CheckCircle, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { Chapter, Subject, TextbookContent } from '../types.ts';
import { PdfMaterialsSection } from './PdfMaterialsSection.tsx';

interface TextbookViewerProps {
  subjects: Subject[];
  initialSubjectId?: string;
  onStartChapterPractice: (subject: Subject, chapter: Chapter) => void;
  onBackToDashboard: () => void;
}

export const TextbookViewer: React.FC<TextbookViewerProps> = ({
  subjects,
  initialSubjectId,
  onStartChapterPractice,
  onBackToDashboard,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(
    subjects.find(s => s.id === initialSubjectId) || subjects[0]
  );
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [content, setContent] = useState<TextbookContent | null>(null);
  const [loading, setLoading] = useState(false);

  // Load chapters when selected subject changes
  useEffect(() => {
    async function loadChapters() {
      try {
        setLoading(true);
        const res = await api.getChapters(selectedSubject.id);
        if (res.success) {
          setChapters(res.chapters);
          setSelectedChapter(res.chapters[0] || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadChapters();
  }, [selectedSubject]);

  // Load textbook content when selected chapter changes
  useEffect(() => {
    async function loadContent() {
      if (!selectedChapter) return;
      try {
        setLoading(true);
        const res = await api.getTextbookContent(selectedChapter.id);
        setContent(res.content);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [selectedChapter]);

  return (
    <div className="max-w-[1050px] mx-auto px-4 py-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs text-[#1261c9] font-bold flex items-center gap-1 hover:underline mb-1 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h2 className="text-xl md:text-2xl font-black text-[#14213d] flex items-center gap-2 m-0">
            <BookOpen className="text-[#1261c9]" /> 12th State Board Textbook
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Complete syllabus theory, fundamental laws, derivations, and formulas.
          </p>
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {subjects.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSubject(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSubject.id === s.id
                  ? 'bg-[#1261c9] text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chapters list sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 shadow-sm border border-[#e6edf6] h-fit">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {selectedSubject.name} Chapters ({chapters.length})
            </span>
          </div>

          <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
            {chapters.map(chap => {
              const isSelected = selectedChapter?.id === chap.id;
              return (
                <div
                  key={chap.id}
                  onClick={() => setSelectedChapter(chap)}
                  className={`p-3 rounded-xl transition-all cursor-pointer text-left border ${
                    isSelected
                      ? 'bg-blue-50/80 border-[#1261c9] text-[#1261c9] font-bold shadow-xs'
                      : 'border-transparent hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-extrabold text-gray-400">
                      Chapter {chap.chapterNumber}
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-semibold">
                      {chap.weightage}
                    </span>
                  </div>
                  <div className="text-xs font-bold leading-snug">{chap.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e6edf6]">
          {selectedChapter && (
            <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-extrabold text-[#1261c9] uppercase tracking-wider">
                  Chapter {selectedChapter.chapterNumber} • {selectedChapter.weightage}
                </span>
                <h3 className="text-xl font-black text-[#14213d] m-0 mt-0.5">
                  {selectedChapter.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{selectedChapter.description}</p>
              </div>

              <button
                onClick={() => onStartChapterPractice(selectedSubject, selectedChapter)}
                className="bg-[#1261c9] hover:bg-[#0e4e9f] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Practice MCQs</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              Loading textbook content...
            </div>
          ) : content ? (
            <div className="space-y-6">
              {content.sections.map((sec, idx) => (
                <div key={idx} className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-sm font-bold text-[#082f73] mb-2">{sec.heading}</h4>
                  <p className="text-xs text-gray-700 leading-relaxed mb-4">{sec.content}</p>

                  {sec.formula && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-xs font-mono text-blue-950 font-bold">
                      <span className="text-[10px] text-blue-600 block uppercase font-sans font-bold">
                        Key Formula:
                      </span>
                      {sec.formula}
                    </div>
                  )}

                  {sec.keyPoints && sec.keyPoints.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                        Core Concepts &amp; Board Derivations:
                      </span>
                      {sec.keyPoints.map((point, pIdx) => (
                        <div key={pIdx} className="text-xs text-gray-600 flex items-start gap-2">
                          <CheckCircle size={14} className="text-[#1261c9] shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm mb-3">
                Full syllabus chapters for {selectedChapter?.title} are ready for practice.
              </p>
              <button
                onClick={() => selectedChapter && onStartChapterPractice(selectedSubject, selectedChapter)}
                className="bg-[#1261c9] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Start Chapter Practice Questions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Official State Board Textbook PDF Downloads */}
      <PdfMaterialsSection
        sectionTitle="Textbook"
        currentSubject={selectedSubject.name}
      />
    </div>
  );
};
