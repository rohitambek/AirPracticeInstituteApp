import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  Lock,
  User,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login } = useAuth();

  // Clean empty state — no credentials exposed or pre-filled
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginId.trim() || !password) {
      setErrorMsg('Please enter both Login ID and Password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(loginId.trim(), password);
      setSuccessMsg('Authenticated successfully! Redirecting...');
      setTimeout(() => {
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid Login ID or Password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl border border-gray-100 p-6 sm:p-7 text-[#17233c] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#082f73] to-[#1467d5] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <GraduationCap size={26} />
          </div>
          <h2 className="text-xl font-black text-[#082f73] m-0">AIR PRACTICE INSTITUTE 🇮🇳</h2>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Sign in to access your study materials &amp; mock tests
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200 animate-in fade-in duration-150">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-200 animate-in fade-in duration-150">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Unified Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Login ID / Registered Email
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter Login ID or Email"
                required
                autoComplete="username"
                className="w-full pl-10 pr-3.5 py-2.5 border border-[#d8e1ee] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5] transition-all bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 border border-[#d8e1ee] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5] transition-all bg-gray-50/50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#1467d5] hover:bg-[#0f52b0] text-white font-extrabold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 tracking-wide"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'LOGIN'}</span>
          </button>
        </form>

        {/* Security / Single-Device Notice */}
        <div className="mt-5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2 text-[11px] text-gray-600">
          <Info size={15} className="text-[#1467d5] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-[#082f73] block mb-0.5">Institute Access Policy:</span>
            Student accounts are registered and issued exclusively by the Institute Administrator.
            Active sessions are restricted to a single device at a time.
          </div>
        </div>
      </div>
    </div>
  );
};
