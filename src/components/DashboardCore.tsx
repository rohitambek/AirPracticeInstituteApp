import { ArrowRight, Award, CheckCircle2, ChevronRight, Clock, HelpCircle, Layers, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { Subject } from '../types.ts';
import { PdfMaterialsSection } from './PdfMaterialsSection.tsx';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface DashboardCoreProps {
  subjects: Subject[];
  onOpenSection: (sectionName: string, subjectId?: string) => void;
  onStartPracticeWizard: () => void;
}

export const DashboardCore: React.FC<DashboardCoreProps> = ({
  subjects,
  onOpenSection,
  onStartPracticeWizard,
}) => {
  const [activeBoardView, setActiveBoardView] = useState<'SIX_STEPS' | 'FIVE_CARDS'>('SIX_STEPS');

  return (
    <div className="max-w-[1050px] mx-auto px-4 py-8">
      {/* View Switcher Banner */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 bg-white p-3 rounded-2xl border border-[#e6edf6] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dashboard Mode:</span>
          <span className="text-xs bg-blue-50 text-[#1261c9] px-2.5 py-0.5 rounded-full font-bold">
            {activeBoardView === 'SIX_STEPS' ? '6-Step Practice Journey' : 'Core Practice Board'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveBoardView('SIX_STEPS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeBoardView === 'SIX_STEPS'
                ? 'bg-[#1261c9] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            6-Step Journey View
          </button>
          <button
            onClick={() => setActiveBoardView('FIVE_CARDS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeBoardView === 'FIVE_CARDS'
                ? 'bg-[#1261c9] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            5-Card Board View
          </button>
        </div>
      </div>

      {/* Title section exactly from reference HTML */}
      <section className="text-center mb-8">
        <div className="font-extrabold text-[#1261c9] tracking-wider text-xs md:text-sm uppercase mb-1 flex items-center justify-center gap-1.5">
          <span>AIR PRACTICE INSTITUTE 🇮🇳</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#14213d] m-0 mb-2">
          Home Dashboard
        </h2>
        <p className="text-sm md:text-base text-[#65748b] max-w-xl mx-auto">
          Choose your practice section and start improving — Learn → Practice → Improve
        </p>
      </section>

      {/* DASHBOARD CARDS: VIEW A - 6-Step Journey from Reference 2 */}
      {activeBoardView === 'SIX_STEPS' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {/* STEP 1 */}
          <div
            onClick={() => onOpenSection('Textbook')}
            className="group relative bg-white p-7 rounded-[18px] border border-[#e6edf6] shadow-[0_8px_25px_rgba(20,50,90,0.08)] hover:shadow-[0_14px_32px_rgba(20,50,90,0.15)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="inline-block bg-[#e9f9ff] text-[#087c9e] text-xs font-extrabold px-2.5 py-1 rounded-full mb-3">
                STEP 1
              </div>
              <div className="text-4xl mb-2">📚</div>
              <h3 className="text-lg font-black text-[#172033] mb-1.5">TEXTBOOK</h3>
              <p className="text-xs text-[#687386] leading-relaxed mb-4">
                Complete State Board Textbook Content with detailed concepts &amp; formulas.
              </p>
            </div>
            <span className="font-extrabold text-xs text-[#087c9e] group-hover:text-[#1261c9] flex items-center gap-1 transition-colors">
              Open Textbook →
            </span>
          </div>

          {/* STEP 2 */}
          <div
            onClick={() => onOpenSection('Short Notes')}
            className="group relative bg-white p-7 rounded-[18px] border border-[#e6edf6] shadow-[0_8px_25px_rgba(20,50,90,0.08)] hover:shadow-[0_14px_32px_rgba(20,50,90,0.15)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="inline-block bg-[#e9f9ff] text-[#087c9e] text-xs font-extrabold px-2.5 py-1 rounded-full mb-3">
                STEP 2
              </div>
              <div className="text-4xl mb-2">📝</div>
              <h3 className="text-lg font-black text-[#172033] mb-1.5">SHORT NOTES</h3>
              <p className="text-xs text-[#687386] leading-relaxed mb-4">
                Quick Revision, High-Yield Formula Sheets &amp; Important Exam Points.
              </p>
            </div>
            <span className="font-extrabold text-xs text-[#087c9e] group-hover:text-[#1261c9] flex items-center gap-1 transition-colors">
              View Notes →
            </span>
          </div>

          {/* STEP 3 */}
          <div
            onClick={() => onOpenSection('Textbook Questions')}
            className="group relative bg-white p-7 rounded-[18px] border border-[#e6edf6] shadow-[0_8px_25px_rgba(20,50,90,0.08)] hover:shadow-[0_14px_32px_rgba(20,50,90,0.15)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="inline-block bg-[#e9f9ff] text-[#087c9e] text-xs font-extrabold px-2.5 py-1 rounded-full mb-3">
                STEP 3
              </div>
              <div className="text-4xl mb-2">❓</div>
              <h3 className="text-lg font-black text-[#172033] mb-1.5">QUESTIONS &amp; ANSWERS</h3>
              <p className="text-xs text-[#687386] leading-relaxed mb-4">
                Topic-wise Questions with Detailed Answers and step-by-step solutions.
              </p>
            </div>
            <span className="font-extrabold text-xs text-[#087c9e] group-hover:text-[#1261c9] flex items-center gap-1 transition-colors">
              Practice Questions →
            </span>
          </div>

          {/* STEP 4 */}
          <div
            onClick={() => onOpenSection('State Board PYQ Papers')}
            className="group relative bg-white p-7 rounded-[18px] border border-[#e6edf6] shadow-[0_8px_25px_rgba(20,50,90,0.08)] hover:shadow-[0_14px_32px_rgba(20,50,90,0.15)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="inline-block bg-[#e9f9ff] text-[#087c9e] text-xs font-extrabold px-2.5 py-1 rounded-full mb-3">
                STEP 4
              </div>
              <div className="text-4xl mb-2">📄</div>
              <h3 className="text-lg font-black text-[#172033] mb-1.5">12th STATE BOARD PYQ</h3>
              <p className="text-xs text-[#687386] leading-relaxed mb-4">
                Previous Year Question Papers with verified Model Answers (2021-2024).
              </p>
            </div>
            <span className="font-extrabold text-xs text-[#087c9e] group-hover:text-[#1261c9] flex items-center gap-1 transition-colors">
              View PYQs →
            </span>
          </div>

          {/* STEP 5 */}
          <div
            onClick={() => onOpenSection('Question Papers')}
            className="group relative bg-white p-7 rounded-[18px] border border-[#e6edf6] shadow-[0_8px_25px_rgba(20,50,90,0.08)] hover:shadow-[0_14px_32px_rgba(20,50,90,0.15)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="inline-block bg-[#e9f9ff] text-[#087c9e] text-xs font-extrabold px-2.5 py-1 rounded-full mb-3">
                STEP 5
              </div>
              <div className="text-4xl mb-2">📋</div>
              <h3 className="text-lg font-black text-[#172033] mb-1.5">QUESTION PAPERS</h3>
              <p className="text-xs text-[#687386] leading-relaxed mb-4">
                Chapter-wise &amp; Full-Length Timed Practice Question Papers.
              </p>
            </div>
            <span className="font-extrabold text-xs text-[#087c9e] group-hover:text-[#1261c9] flex items-center gap-1 transition-colors">
              Start Test →
            </span>
          </div>

          {/* STEP 6 */}
          <div
            onClick={() => onOpenSection('MHT-CET PYQ Papers')}
            className="group relative bg-white p-7 rounded-[18px] border border-[#e6edf6] shadow-[0_8px_25px_rgba(20,50,90,0.08)] hover:shadow-[0_14px_32px_rgba(20,50,90,0.15)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="inline-block bg-[#e9f9ff] text-[#087c9e] text-xs font-extrabold px-2.5 py-1 rounded-full mb-3">
                STEP 6
              </div>
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-lg font-black text-[#172033] mb-1.5">NEET • JEE • MHT-CET</h3>
              <p className="text-xs text-[#687386] leading-relaxed mb-4">
                Entrance Exam Question Papers &amp; High-Yield Topic Practice sets.
              </p>
            </div>
            <span className="font-extrabold text-xs text-[#087c9e] group-hover:text-[#1261c9] flex items-center gap-1 transition-colors">
              Explore Papers →
            </span>
          </div>
        </section>
      )}

      {/* DASHBOARD CARDS: VIEW B - 5 Cards from Reference 1 & 4 */}
      {activeBoardView === 'FIVE_CARDS' && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <div
            onClick={() => onOpenSection('Textbook')}
            className="bg-white rounded-[18px] p-6 shadow-[0_8px_25px_rgba(20,50,90,0.09)] border border-[#e6edf6] cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(20,50,90,0.15)] transition-all duration-200"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-base font-bold text-[#14213d] mb-2">Textbook</h3>
            <p className="text-xs text-[#68768a] leading-relaxed">
              Complete 12th State Board Textbook Content
            </p>
          </div>

          <div
            onClick={() => onOpenSection('Textbook Questions')}
            className="bg-white rounded-[18px] p-6 shadow-[0_8px_25px_rgba(20,50,90,0.09)] border border-[#e6edf6] cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(20,50,90,0.15)] transition-all duration-200"
          >
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-base font-bold text-[#14213d] mb-2">Textbook Questions</h3>
            <p className="text-xs text-[#68768a] leading-relaxed">
              Practice textbook-based questions
            </p>
          </div>

          <div
            onClick={() => onOpenSection('State Board PYQ Papers')}
            className="bg-white rounded-[18px] p-6 shadow-[0_8px_25px_rgba(20,50,90,0.09)] border border-[#e6edf6] cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(20,50,90,0.15)] transition-all duration-200"
          >
            <div className="text-4xl mb-3">📄</div>
            <h3 className="text-base font-bold text-[#14213d] mb-2">State Board PYQ Papers</h3>
            <p className="text-xs text-[#68768a] leading-relaxed">
              Previous Year Question Papers with solutions
            </p>
          </div>

          <div
            onClick={() => onOpenSection('MHT-CET PYQ Papers')}
            className="bg-white rounded-[18px] p-6 shadow-[0_8px_25px_rgba(20,50,90,0.09)] border border-[#e6edf6] cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(20,50,90,0.15)] transition-all duration-200"
          >
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-base font-bold text-[#14213d] mb-2">MHT-CET PYQ Papers</h3>
            <p className="text-xs text-[#68768a] leading-relaxed">
              Previous Year MHT-CET Question Papers
            </p>
          </div>

          <div
            onClick={() => onOpenSection('Topic-Wise MHT-CET Practice')}
            className="bg-white rounded-[18px] p-6 shadow-[0_8px_25px_rgba(20,50,90,0.09)] border border-[#e6edf6] cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(20,50,90,0.15)] transition-all duration-200 sm:col-span-2 lg:col-span-1"
          >
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-base font-bold text-[#14213d] mb-2">Topic-Wise MHT-CET Practice</h3>
            <p className="text-xs text-[#68768a] leading-relaxed">
              Select a topic and solve 20 timed questions
            </p>
          </div>
        </section>
      )}

      {/* START PRACTICE BUTTON: class="start" max-width 360px */}
      <div className="text-center my-8 space-y-3">
        <button
          onClick={onStartPracticeWizard}
          className="w-full max-w-[360px] mx-auto py-4 px-6 bg-[#1261c9] hover:bg-[#0d4ea5] text-white text-base md:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
        >
          START PRACTICE
        </button>

        <div className="max-w-[360px] mx-auto">
          <PWAInstallButton variant="banner" />
        </div>
      </div>

      {/* FLOW SECTION from reference HTML: .flow { text-align:center; margin-top:30px; background:white; border-radius:18px; padding:22px; box-shadow:0 8px 25px rgba(20,50,90,.07) } */}
      <section className="bg-white rounded-[18px] p-6 shadow-[0_8px_25px_rgba(20,50,90,0.07)] border border-[#e6edf6] text-center my-8">
        <div className="text-base md:text-lg font-bold text-[#14213d] mb-2">
          <strong className="text-[#1261c9]">Learn</strong> → <strong className="text-[#1261c9]">Practice</strong> → <strong className="text-[#1261c9]">Improve</strong>
        </div>
        <p className="text-xs md:text-sm text-[#68768a] leading-relaxed mb-4">
          Start Practice → Select Subject → Select Chapter/Topic → Solve Questions → Check Your Score &amp; Analysis
        </p>

        {/* 6-step Journey pills row */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs font-semibold text-gray-700 pt-2">
          <div className="bg-[#f5f7fb] border border-[#e5eaf1] rounded-xl px-3 py-2 text-center min-w-[90px]">
            <span className="text-base">📚</span>
            <b className="block mt-1 font-bold text-gray-900">Textbook</b>
          </div>
          <span className="text-gray-400 font-bold">→</span>
          <div className="bg-[#f5f7fb] border border-[#e5eaf1] rounded-xl px-3 py-2 text-center min-w-[90px]">
            <span className="text-base">📝</span>
            <b className="block mt-1 font-bold text-gray-900">Short Notes</b>
          </div>
          <span className="text-gray-400 font-bold">→</span>
          <div className="bg-[#f5f7fb] border border-[#e5eaf1] rounded-xl px-3 py-2 text-center min-w-[90px]">
            <span className="text-base">❓</span>
            <b className="block mt-1 font-bold text-gray-900">Q&amp;A</b>
          </div>
          <span className="text-gray-400 font-bold">→</span>
          <div className="bg-[#f5f7fb] border border-[#e5eaf1] rounded-xl px-3 py-2 text-center min-w-[90px]">
            <span className="text-base">📄</span>
            <b className="block mt-1 font-bold text-gray-900">PYQ</b>
          </div>
          <span className="text-gray-400 font-bold">→</span>
          <div className="bg-[#f5f7fb] border border-[#e5eaf1] rounded-xl px-3 py-2 text-center min-w-[90px]">
            <span className="text-base">📋</span>
            <b className="block mt-1 font-bold text-gray-900">Tests</b>
          </div>
          <span className="text-gray-400 font-bold">→</span>
          <div className="bg-[#f5f7fb] border border-[#e5eaf1] rounded-xl px-3 py-2 text-center min-w-[90px]">
            <span className="text-base">🎯</span>
            <b className="block mt-1 font-bold text-[#087c9e]">NEET/CET</b>
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR SUBJECT (PCMB) from Reference HTML */}
      <section className="my-10">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-black text-[#14213d] m-0 mb-1">
            Choose Your Subject
          </h2>
          <p className="text-xs md:text-sm text-[#687386]">
            Practice chapter-by-chapter and topic-by-topic across PCMB.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map(subject => (
            <div
              key={subject.id}
              onClick={() => onOpenSection('Textbook Questions', subject.id)}
              className="bg-white p-5 rounded-[16px] shadow-[0_8px_25px_rgba(23,32,51,0.07)] border border-[#e8ebf1] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl mb-2">{subject.icon}</div>
                <h3 className="text-base font-bold text-[#172033] mb-1">{subject.name}</h3>
                <p className="text-xs text-[#687386] leading-relaxed mb-4">{subject.tagline}</p>
              </div>
              <span className="text-xs font-bold text-[#1261c9] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Practice →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AIR TEST SERIES FEATURES from Reference */}
      <section className="my-10">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-black text-[#14213d] m-0 mb-1">
            AIR Test Series
          </h2>
          <p className="text-xs md:text-sm text-[#687386]">
            Exam-style practice for stronger 12th Board &amp; MHT-CET preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border-l-4 border-cyan-400 shadow-sm">
            <b className="text-xs font-bold text-gray-900 block mb-1">🔥 Chapter Test</b>
            <p className="text-xs text-gray-500 m-0">Complete a chapter under authentic timed pressure.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-l-4 border-cyan-400 shadow-sm">
            <b className="text-xs font-bold text-gray-900 block mb-1">🎯 Important Questions</b>
            <p className="text-xs text-gray-500 m-0">Focus on high-priority board and CET practice items.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-l-4 border-cyan-400 shadow-sm">
            <b className="text-xs font-bold text-gray-900 block mb-1">📚 Previous Year Questions</b>
            <p className="text-xs text-gray-500 m-0">Practice past 4 years board and CET papers with answers.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-l-4 border-cyan-400 shadow-sm">
            <b className="text-xs font-bold text-gray-900 block mb-1">🏆 Full Syllabus Mock</b>
            <p className="text-xs text-gray-500 m-0">Experience full 3-hour exam simulation with scoring.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-l-4 border-cyan-400 shadow-sm">
            <b className="text-xs font-bold text-gray-900 block mb-1">📊 Performance Dashboard</b>
            <p className="text-xs text-gray-500 m-0">Track accuracy, attempts, score history and solutions.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-l-4 border-cyan-400 shadow-sm">
            <b className="text-xs font-bold text-gray-900 block mb-1">🔐 Student Login</b>
            <p className="text-xs text-gray-500 m-0">Secure personal account with verified email reports.</p>
          </div>
        </div>
      </section>

      {/* Official PDF Materials & Papers Section */}
      <PdfMaterialsSection
        sectionTitle="Short Notes"
        currentSubject="All"
      />
    </div>
  );
};
