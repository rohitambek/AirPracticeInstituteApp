import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0b1530] text-gray-400 text-center py-8 px-4 text-xs border-t border-white/10 mt-12">
      <div className="max-w-[1050px] mx-auto space-y-2">
        <div className="font-bold text-white text-sm">
          AIR PRACTICE INSTITUTE 🇮🇳
        </div>
        <div className="text-gray-400">
          12th Maharashtra State Board • PCMB Practice Platform &amp; MHT-CET Series
        </div>
        <p className="text-gray-500 text-[11px] pt-2">
          © {new Date().getFullYear()} AIR Practice Institute. Learn → Practice → Improve. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
