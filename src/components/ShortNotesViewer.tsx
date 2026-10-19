import { ArrowLeft, BookOpen, CheckCircle, FileText, Lightbulb, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { Chapter, ShortNote, Subject } from '../types.ts';
import { PdfMaterialsSection } from './PdfMaterialsSection.tsx';

interface ShortNotesViewerProps {
  subjects: Subject[];
  initialSubjectId?: string;
  onBackToDashboard: () => void;
  onStartPractice: (subject: Subject, chapter: Chapter) => void;
}

export const ShortNotesViewer: React.FC<ShortNotesViewerProps> = ({
  subjects,
  initialSubjectId,
  onBackToDashboard,
  onStartPractice,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(
    subjects.find(s => s.id === initialSubjectId) || subjects[0]
  );
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [note, setNote] = useState<ShortNote | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadChapters() {
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

  useEffect(() => {
    async function loadNotes() {
      if (!selectedChapter) return;
      try {
        setLoading(true);
        const res = await api.getShortNotes(selectedChapter.id);
        setNote(res.shortNote);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, [selectedChapter]);

  return (
    <div className="max-w-[1050px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs text-[#1261c9] font-bold flex items-center gap-1 hover:underline mb-1 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h2 className="text-xl md:text-2xl font-black text-[#14213d] flex items-center gap-2 m-0">
            <FileText className="text-[#1261c9]" /> High-Yield Short Notes &amp; Formula Sheets
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Rapid revision, formula summaries, laws, and examination shortcuts.
          </p>
        </div>

        {/* Subject switch */}
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
        {/* Chapters list (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 shadow-sm border border-[#e6edf6] h-fit">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3 px-2">
            {selectedSubject.name} Chapters
          </span>

          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {chapters.map(ch => {
              const isSelected = selectedChapter?.id === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChapter(ch)}
                  className={`p-3 rounded-xl transition-all cursor-pointer text-left border ${
                    isSelected
                      ? 'bg-blue-50/80 border-[#1261c9] text-[#1261c9] font-bold shadow-xs'
                      : 'border-transparent hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mb-0.5">
                    <span>Chapter {ch.chapterNumber}</span>
                    <span>{ch.weightage}</span>
                  </div>
                  <div className="text-xs font-bold">{ch.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Short Notes Detail (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e6edf6]">
          {selectedChapter && (
            <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-extrabold text-[#1261c9] uppercase tracking-wider">
                  Quick Revision • {selectedChapter.weightage}
                </span>
                <h3 className="text-xl font-black text-[#14213d] m-0 mt-0.5">
                  {selectedChapter.title}
                </h3>
              </div>

              <button
                onClick={() => onStartPractice(selectedSubject, selectedChapter)}
                className="bg-[#1261c9] hover:bg-[#0e4e9f] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Practice Questions
              </button>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-xs">Loading notes...</div>
          ) : note ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 text-xs text-blue-950 leading-relaxed">
                <b className="block mb-1 text-[#082f73]">Chapter Essence:</b>
                {note.summary}
              </div>

              {/* Formulas Sheet */}
              {note.formulas && note.formulas.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Important Formulas &amp; Relations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {note.formulas.map((f, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <span className="text-[11px] font-bold text-gray-600 block">{f.name}</span>
                        <div className="font-mono text-sm font-black text-[#1261c9] my-1">
                          {f.formula}
                        </div>
                        {f.note && (
                          <span className="text-[10px] text-gray-400 block">{f.note}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Laws / Reactions */}
              {note.keyReactionsOrLaws && note.keyReactionsOrLaws.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Key Laws &amp; Definitions
                  </h4>
                  <div className="space-y-2">
                    {note.keyReactionsOrLaws.map((law, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 flex items-start gap-2 border border-gray-100">
                        <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{law}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Tips */}
              {note.tips && note.tips.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-950">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-800">
                    <Lightbulb size={16} /> Exam &amp; MHT-CET Tips:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-900/90 text-xs">
                    {note.tips.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs mb-3">Formula summaries for {selectedChapter?.title} are ready.</p>
              <button
                onClick={() => selectedChapter && onStartPractice(selectedSubject, selectedChapter)}
                className="bg-[#1261c9] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Practice Chapter Questions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Official PDF Notes & Question Papers for Short Notes */}
      <PdfMaterialsSection
        sectionTitle="Short Notes"
        currentSubject={selectedSubject.name}
      />
    </div>
  );
};
