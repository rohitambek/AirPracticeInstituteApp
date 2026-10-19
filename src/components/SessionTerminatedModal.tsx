import { AlertTriangle, Clock, LogIn, ShieldAlert, Smartphone, Tablet, X } from 'lucide-react';
import React from 'react';

interface SessionTerminatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReLogin: () => void;
  deviceInfo?: string;
  timestamp?: string;
  message?: string;
}

export const SessionTerminatedModal: React.FC<SessionTerminatedModalProps> = ({
  isOpen,
  onClose,
  onReLogin,
  deviceInfo = 'Another Device (Phone, Tablet, or Laptop)',
  timestamp,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[460px] bg-white rounded-[24px] shadow-2xl border-2 border-amber-300 p-6 sm:p-7 text-[#17233c] overflow-hidden text-center">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-sm animate-bounce">
          <ShieldAlert size={36} />
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-[#082f73] m-0 mb-2">
          Single-Device Policy Enforced
        </h2>
        <p className="text-xs text-amber-800 font-extrabold uppercase tracking-wider mb-3">
          Session Terminated on this Device
        </p>

        {/* Explanation message */}
        <p className="text-xs text-gray-600 mb-5 leading-relaxed">
          {message ||
            'Your AIR Practice Institute account was logged into from another device. To maintain single-device security and test integrity, your previous session has been automatically logged out.'}
        </p>

        {/* Device Information Card */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 mb-5 text-left text-xs">
          <div className="flex items-center gap-2 mb-2 font-bold text-amber-950">
            <Smartphone size={16} className="text-amber-700" />
            <span>Active Login Detected:</span>
          </div>
          <div className="space-y-1 text-[11px] text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">New Device:</span>
              <b className="text-gray-900">{deviceInfo}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Detected At:</span>
              <span className="font-mono text-gray-800">
                {timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-amber-200/60">
              <span className="text-gray-500 font-medium">Policy:</span>
              <span className="text-emerald-700 font-bold">1 Active Device per Student</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onReLogin();
            }}
            className="w-full py-3.5 bg-[#082f73] hover:bg-[#0b3d91] text-amber-300 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40"
          >
            <LogIn size={16} />
            <span>LOG IN ON THIS DEVICE INSTEAD</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-gray-500 hover:text-gray-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close &amp; Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
