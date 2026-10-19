import { CheckCircle2, Download, QrCode, Share, Smartphone, X } from 'lucide-react';
import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already running standalone, hide
  if (isInstalled) {
    return null;
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-wwcuzr5nclfklfautq6msx-901441151472.asia-east1.run.app';

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleButtonClick}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          title="Install AIR Practice Mobile App on Android / iOS"
        >
          <Download size={14} />
          <span>📱 Install Mobile App</span>
        </button>
      )}

      {variant === 'banner' && (
        <button
          onClick={handleButtonClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-xl text-xs md:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download size={16} />
          <span>INSTALL MOBILE ANDROID &amp; IPHONE APP</span>
        </button>
      )}

      {/* Install & Mobile Guide Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 text-gray-900 text-left">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#082f73] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                AIR
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#082f73] m-0">
                  Install AIR Practice Mobile App
                </h3>
                <p className="text-xs text-gray-500 m-0">
                  12th State Board &amp; MHT-CET Mobile Edition
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-700">
              {/* Android Instructions */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <b className="text-blue-900 font-bold block mb-1.5 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-blue-700" />
                  For Android Users (Chrome / Edge / Samsung Internet):
                </b>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>
                    Tap the <strong>three dots (⋮)</strong> menu in the top right of your browser.
                  </li>
                  <li>
                    Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </li>
                  <li>
                    Tap <strong>"Install"</strong> — the app will appear on your app drawer and home screen as a native Android app!
                  </li>
                </ol>
              </div>

              {/* iPhone / iOS Instructions */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                <b className="text-gray-900 font-bold block mb-1.5 flex items-center gap-1.5">
                  <Share size={14} className="text-[#1467d5]" />
                  For iPhone / iPad Users (Safari):
                </b>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>
                    Open this URL in <strong>Safari</strong> on your iPhone.
                  </li>
                  <li>
                    Tap the <strong>Share</strong> button (box with an arrow pointing up) at the bottom.
                  </li>
                  <li>
                    Scroll down and tap <strong>"Add to Home Screen"</strong>.
                  </li>
                  <li>
                    Tap <strong>"Add"</strong> in the top right corner.
                  </li>
                </ol>
              </div>

              {/* Direct Link copy */}
              <div className="bg-gray-100 p-2.5 rounded-lg border border-gray-200 text-[11px] break-all">
                <b className="block text-gray-600 mb-0.5">Public Mobile Access Link:</b>
                <span className="font-mono text-[#082f73] font-bold select-all">{currentOrigin}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowModal(false);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
                >
                  Prompt Install Now
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
