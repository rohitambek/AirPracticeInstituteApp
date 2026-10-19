import { Bell, BookOpen, FileText, Mail, ShieldCheck, Smartphone, UserCheck, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenLogin: () => void;
  isMobileSimulator: boolean;
  onToggleMobileSimulator: () => void;
  onOpenEmails: () => void;
  onOpenAdminPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenLogin,
  isMobileSimulator,
  onToggleMobileSimulator,
  onOpenEmails,
  onOpenAdminPanel,
}) => {
  const { user, logout, unreadCount, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  return (
    <>
      {/* Top Banner exactly from reference HTML: background:linear-gradient(135deg,#082f73,#1467d5); color:#fff; text-align:center; padding:28px 18px */}
      <header className="bg-gradient-to-r from-[#082f73] via-[#0b3d91] to-[#1467d5] text-white text-center py-6 px-4 shadow-md relative">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide m-0">
              AIR PRACTICE INSTITUTE 🇮🇳
            </h1>
            <p className="text-sm md:text-base opacity-90 mt-1 font-medium text-cyan-200">
              12th Maharashtra State Board &amp; MHT-CET
            </p>
          </div>

          {/* Quick status bar on right */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Install PWA / Mobile App Button */}
            <PWAInstallButton variant="header" />

            {/* View Mode Toggle */}
            <button
              onClick={onToggleMobileSimulator}
              title="Toggle Mobile Native App Simulator"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isMobileSimulator
                  ? 'bg-cyan-400 text-gray-950 font-bold shadow-sm'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Smartphone size={14} />
              {isMobileSimulator ? 'Mobile Simulator: ON' : '📱 Mobile App View'}
            </button>

            {/* Admin Management Button */}
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => onNavigate('admin')}
                title="Open Dedicated Administrator Dashboard"
                className={`font-black px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-amber-300 text-gray-950 ring-2 ring-white/50'
                    : 'bg-amber-400 hover:bg-amber-300 text-gray-950'
                }`}
              >
                <ShieldCheck size={15} className="text-gray-950" />
                <span>Admin Dashboard</span>
              </button>
            )}

            {/* Email Logs Button */}
            {user && (
              <button
                onClick={onOpenEmails}
                title="View Sent System Emails (Welcome & Test Reports)"
                className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 text-white cursor-pointer transition-colors"
              >
                <Mail size={14} />
                <span>Emails</span>
              </button>
            )}

            {/* Notifications Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-[#1467d5]" />
                        <span className="font-bold text-sm text-[#082f73]">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllNotificationsAsRead()}
                            className="text-xs text-[#1467d5] hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifDropdown(false)}
                          className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                            className={`p-3 transition-colors cursor-pointer text-xs ${
                              notif.read ? 'bg-white opacity-70' : 'bg-blue-50/60 font-medium'
                            } hover:bg-gray-100`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-gray-900">{notif.title}</span>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-[#1467d5]" />
                              )}
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-1">{notif.message}</p>
                            <span className="text-[10px] text-gray-400">
                              {new Date(notif.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth status */}
            {user ? (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 text-xs">
                <UserCheck size={15} className="text-emerald-300" />
                <div className="text-left leading-tight hidden sm:block">
                  <div className="font-bold text-white">{user.name}</div>
                  <div className="text-[10px] text-cyan-200">ID: {user.loginId}</div>
                </div>
                <button
                  onClick={logout}
                  className="ml-2 bg-white/20 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors"
                >
                  LOG OUT
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="bg-white text-[#082f73] hover:bg-cyan-50 font-bold px-5 py-1.5 rounded-lg text-xs md:text-sm shadow-sm cursor-pointer transition-all tracking-wide"
              >
                LOGIN
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Sub-Bar */}
      <nav className="bg-[#0b1530] text-white px-4 py-2.5 sticky top-0 z-40 shadow-sm border-b border-white/10 text-sm">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                currentTab === 'dashboard' ? 'text-cyan-400 bg-white/10' : 'text-gray-200 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('textbook')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                currentTab === 'textbook' ? 'text-cyan-400 bg-white/10' : 'text-gray-200 hover:text-white'
              }`}
            >
              <BookOpen size={14} />
              Textbook
            </button>
            <button
              onClick={() => onNavigate('shortnotes')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                currentTab === 'shortnotes' ? 'text-cyan-400 bg-white/10' : 'text-gray-200 hover:text-white'
              }`}
            >
              Short Notes
            </button>
            <button
              onClick={() => onNavigate('pyq')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                currentTab === 'pyq' ? 'text-cyan-400 bg-white/10' : 'text-gray-200 hover:text-white'
              }`}
            >
              <FileText size={14} />
              PYQ Papers
            </button>
            <button
              onClick={() => onNavigate('practice')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                currentTab === 'practice' ? 'text-cyan-400 bg-white/10' : 'text-gray-200 hover:text-white'
              }`}
            >
              Topic-Wise Practice
            </button>
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 rounded-md font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                  currentTab === 'admin'
                    ? 'text-amber-300 bg-amber-400/20 border-amber-400/50 shadow-xs'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-white/10 border-amber-400/30'
                }`}
              >
                <ShieldCheck size={14} className="text-amber-400" />
                <span>Admin Console</span>
              </button>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Learn → Practice → Improve
          </div>
        </div>
      </nav>
    </>
  );
};
