import { ArrowLeft, Award, Bell, BookOpen, ChevronRight, FileText, Home, Layers, LogOut, Smartphone, User, X, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Chapter, Subject } from '../types.ts';

interface MobileAppFrameProps {
  subjects: Subject[];
  onOpenSection: (name: string, subjectId?: string) => void;
  onOpenLogin: () => void;
  onCloseSimulator: () => void;
}

export const MobileAppFrame: React.FC<MobileAppFrameProps> = ({
  subjects,
  onOpenSection,
  onOpenLogin,
  onCloseSimulator,
}) => {
  const { user, logout } = useAuth();
  const [mobileTab, setMobileTab] = useState<'HOME' | 'PRACTICE' | 'PAPERS' | 'ACCOUNT'>('HOME');

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Phone container */}
      <div className="relative w-full max-w-[395px] h-[780px] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-gray-800 flex flex-col overflow-hidden">
        {/* Top Speaker / Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center">
          <div className="w-12 h-1 bg-gray-800 rounded-full" />
        </div>

        {/* Exit Simulator Button on Top Corner */}
        <button
          onClick={onCloseSimulator}
          className="absolute top-5 right-5 z-40 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full p-1 cursor-pointer"
          title="Close Mobile View"
        >
          <X size={16} />
        </button>

        {/* Inner Phone Screen */}
        <div className="w-full h-full bg-[#f5f8fc] rounded-[38px] flex flex-col overflow-hidden text-gray-900 relative">
          {/* Mobile Status Bar */}
          <div className="pt-3 px-6 pb-1 flex justify-between items-center text-[10px] font-bold text-gray-600 bg-white">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-4 h-2 border border-gray-600 rounded-xs p-0.5 flex">
                <div className="bg-gray-600 w-full h-full rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Mobile App Header */}
          <div className="bg-gradient-to-r from-[#082f73] via-[#0b3d91] to-[#1467d5] text-white p-4 text-center">
            <h1 className="text-base font-extrabold m-0">AIR PRACTICE INSTITUTE 🇮🇳</h1>
            <p className="text-[11px] text-cyan-200 m-0 mt-0.5">12th State Board &amp; MHT-CET</p>
          </div>

          {/* Mobile Screen Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mobileTab === 'HOME' && (
              <>
                <div className="text-center">
                  <h2 className="text-base font-black text-gray-900 m-0">Home Dashboard</h2>
                  <p className="text-[11px] text-gray-500 m-0 mt-0.5">
                    Learn → Practice → Improve
                  </p>
                </div>

                {/* Mobile Cards Stack */}
                <div className="space-y-2.5">
                  <div
                    onClick={() => onOpenSection('Textbook')}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📚</span>
                      <div>
                        <b className="text-xs text-gray-900 block font-bold">Textbook</b>
                        <span className="text-[10px] text-gray-500">12th State Board Content</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>

                  <div
                    onClick={() => onOpenSection('Short Notes')}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📝</span>
                      <div>
                        <b className="text-xs text-gray-900 block font-bold">Short Notes</b>
                        <span className="text-[10px] text-gray-500">Formulas &amp; Rapid Revision</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>

                  <div
                    onClick={() => onOpenSection('Textbook Questions')}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">❓</span>
                      <div>
                        <b className="text-xs text-gray-900 block font-bold">Q&amp;A Practice</b>
                        <span className="text-[10px] text-gray-500">Chapter-wise Question sets</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>

                  <div
                    onClick={() => onOpenSection('State Board PYQ Papers')}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <b className="text-xs text-gray-900 block font-bold">State Board PYQ</b>
                        <span className="text-[10px] text-gray-500">2021-2024 Past Papers</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>

                  <div
                    onClick={() => onOpenSection('Topic-Wise MHT-CET Practice')}
                    className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚡</span>
                      <div>
                        <b className="text-xs text-[#1261c9] block font-bold">Topic-Wise MHT-CET</b>
                        <span className="text-[10px] text-gray-500">20 Timed Questions Test</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#1261c9]" />
                  </div>
                </div>

                {/* Mobile Start Practice Button */}
                <button
                  onClick={() => onOpenSection('Topic-Wise MHT-CET Practice')}
                  className="w-full py-3.5 bg-[#1261c9] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  START PRACTICE NOW
                </button>
              </>
            )}

            {mobileTab === 'PRACTICE' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Select Subject to Practice
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {subjects.map(s => (
                    <div
                      key={s.id}
                      onClick={() => onOpenSection('Topic-Wise MHT-CET Practice', s.id)}
                      className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs text-center cursor-pointer active:scale-95 transition-transform"
                    >
                      <span className="text-2xl block mb-1">{s.icon}</span>
                      <b className="text-xs font-bold text-gray-900 block">{s.name}</b>
                      <span className="text-[10px] text-blue-600 font-semibold">Start →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mobileTab === 'PAPERS' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  PYQ &amp; Mock Papers
                </h3>
                <div
                  onClick={() => onOpenSection('State Board PYQ Papers')}
                  className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs cursor-pointer"
                >
                  <b className="text-xs font-bold block text-gray-900">12th State Board PYQs</b>
                  <p className="text-[10px] text-gray-500 m-0">2024, 2023, 2022 board papers with solutions</p>
                </div>
                <div
                  onClick={() => onOpenSection('MHT-CET PYQ Papers')}
                  className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs cursor-pointer"
                >
                  <b className="text-xs font-bold block text-gray-900">MHT-CET Entrance Papers</b>
                  <p className="text-[10px] text-gray-500 m-0">Official shift-wise previous papers</p>
                </div>
              </div>
            )}

            {mobileTab === 'ACCOUNT' && (
              <div className="space-y-3 text-center pt-4">
                {user ? (
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                    <div className="w-14 h-14 bg-blue-100 text-[#1261c9] rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <b className="text-sm font-bold block text-gray-900">{user.name}</b>
                    <span className="text-xs text-blue-600 font-mono block mb-1">ID: {user.loginId}</span>
                    <span className="text-[10px] text-gray-400 block mb-4">{user.email}</span>
                    <button
                      onClick={logout}
                      className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                    <User className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <b className="text-xs font-bold block text-gray-900 mb-1">Student Account</b>
                    <p className="text-[11px] text-gray-500 mb-4">Log in to track your test scores and emails.</p>
                    <button
                      onClick={onOpenLogin}
                      className="w-full py-2.5 bg-[#1261c9] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Login to Account
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Native Tab Bar */}
          <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-around text-[10px] font-semibold text-gray-500">
            <button
              onClick={() => setMobileTab('HOME')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                mobileTab === 'HOME' ? 'text-[#1261c9] font-bold' : ''
              }`}
            >
              <Home size={18} />
              <span>Home</span>
            </button>
            <button
              onClick={() => setMobileTab('PRACTICE')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                mobileTab === 'PRACTICE' ? 'text-[#1261c9] font-bold' : ''
              }`}
            >
              <Zap size={18} />
              <span>Practice</span>
            </button>
            <button
              onClick={() => setMobileTab('PAPERS')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                mobileTab === 'PAPERS' ? 'text-[#1261c9] font-bold' : ''
              }`}
            >
              <FileText size={18} />
              <span>Papers</span>
            </button>
            <button
              onClick={() => setMobileTab('ACCOUNT')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                mobileTab === 'ACCOUNT' ? 'text-[#1261c9] font-bold' : ''
              }`}
            >
              <User size={18} />
              <span>Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
