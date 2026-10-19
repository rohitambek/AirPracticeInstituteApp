import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Download, Eye, FileText, Filter } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { PYQPaper } from '../types.ts';
import { PdfMaterialsSection } from './PdfMaterialsSection.tsx';

interface PYQPapersViewerProps {
  initialExam?: string;
  onBackToDashboard: () => void;
}

export const PYQPapersViewer: React.FC<PYQPapersViewerProps> = ({
  initialExam,
  onBackToDashboard,
}) => {
  const [papers, setPapers] = useState<PYQPaper[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>(initialExam || 'ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [activePaper, setActivePaper] = useState<PYQPaper | null>(null);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPapers() {
      try {
        setLoading(true);
        const res = await api.getPapers();
        if (res.success) {
          setPapers(res.papers);
          if (res.papers.length > 0) {
            setActivePaper(res.papers[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPapers();
  }, []);

  const toggleSolution = (qNum: number) => {
    setRevealedSolutions(prev => ({ ...prev, [qNum]: !prev[qNum] }));
  };

  const filteredPapers = papers.filter(p => {
    if (selectedExam !== 'ALL' && p.exam !== selectedExam) return false;
    if (selectedSubject !== 'ALL' && !p.subject.toLowerCase().includes(selectedSubject.toLowerCase())) return false;
    return true;
  });

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
            <FileText className="text-[#1261c9]" /> Previous Year Question Papers (PYQ)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Maharashtra State Board HSC (2021-2024) &amp; MHT-CET with official model solutions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedExam}
            onChange={e => {
              setSelectedExam(e.target.value);
              const matched = papers.find(p => e.target.value === 'ALL' || p.exam === e.target.value);
              if (matched) setActivePaper(matched);
            }}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white"
          >
            <option value="ALL">All Examinations</option>
            <option value="12th Maharashtra State Board">12th State Board (HSC)</option>
            <option value="MHT-CET">MHT-CET Entrance</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Papers List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6edf6]">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3 px-1">
              Available PYQ Papers ({filteredPapers.length})
            </span>

            <div className="space-y-2">
              {filteredPapers.map(paper => {
                const isSelected = activePaper?.id === paper.id;
                return (
                  <div
                    key={paper.id}
                    onClick={() => {
                      setActivePaper(paper);
                      setRevealedSolutions({});
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#1261c9] shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-extrabold text-[#1261c9]">{paper.exam}</span>
                      <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                        {paper.year}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-gray-900 leading-snug">
                      {paper.subject}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-2">
                      <span>Marks: {paper.totalMarks}</span>
                      <span>•</span>
                      <span>Time: {paper.durationMinutes} mins</span>
                      <span>•</span>
                      <span>{paper.questions.length} Questions</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Paper Detail & Questions Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e6edf6]">
          {activePaper ? (
            <div>
              {/* Paper Title Banner */}
              <div className="pb-4 mb-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black uppercase text-[#1261c9] bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {activePaper.exam} • {activePaper.year}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">
                      Max Marks: {activePaper.totalMarks}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#14213d] m-0">
                    {activePaper.title}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    const allTrue: Record<number, boolean> = {};
                    activePaper.questions.forEach(q => (allTrue[q.questionNumber] = true));
                    setRevealedSolutions(allTrue);
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-[#1261c9] text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Reveal All Solutions
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {activePaper.questions.map(q => {
                  const isSolutionOpen = revealedSolutions[q.questionNumber];

                  return (
                    <div
                      key={q.questionNumber}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 text-xs text-gray-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-[#082f73]">
                          Q.{q.questionNumber} [{q.section}]
                        </span>
                        <span className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                          {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                        </span>
                      </div>

                      <p className="font-semibold text-gray-900 text-sm leading-relaxed mb-3">
                        {q.questionText}
                      </p>

                      {/* Options if available */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className="bg-white border border-gray-200 p-2.5 rounded-lg text-xs text-gray-700"
                            >
                              <span className="font-bold text-gray-400 mr-1.5">
                                ({String.fromCharCode(65 + oIdx)})
                              </span>
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Solution Toggle Button */}
                      <button
                        onClick={() => toggleSolution(q.questionNumber)}
                        className="mt-1 text-xs font-bold text-[#1261c9] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {isSolutionOpen ? (
                          <>
                            <ChevronUp size={14} /> Hide Model Solution
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} /> View Official Model Answer &amp; Working
                          </>
                        )}
                      </button>

                      {/* Model Solution Box */}
                      {isSolutionOpen && (
                        <div className="mt-3 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl animate-in fade-in duration-150">
                          <div className="flex items-center gap-1 text-emerald-800 font-bold mb-1 text-xs">
                            <CheckCircle2 size={14} />
                            <span>Correct Answer: {q.correctAnswer}</span>
                          </div>
                          <div className="text-gray-700 leading-relaxed font-sans text-xs">
                            <b className="block text-gray-900 mb-0.5">Model Solution &amp; Marks Scheme:</b>
                            {q.modelSolution}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">
              Select a question paper from the left to view questions and solutions.
            </div>
          )}
        </div>
      </div>

      {/* Official State Board / CET Downloadable PDF Papers */}
      <PdfMaterialsSection
        sectionTitle={
          initialExam?.includes('CET') || initialExam?.includes('NEET') || initialExam?.includes('Entrance')
            ? 'MHT-CET PYQ Papers'
            : 'State Board PYQ Papers'
        }
        currentSubject={selectedSubject === 'ALL' ? 'All' : selectedSubject}
      />
    </div>
  );
};
