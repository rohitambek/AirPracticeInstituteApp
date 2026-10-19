import { Download, ExternalLink, FileText, X } from 'lucide-react';
import React from 'react';
import { PdfMaterial } from '../types.ts';

interface PdfViewerModalProps {
  material: PdfMaterial | null;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ material, onClose }) => {
  if (!material) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden text-gray-900">
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-[#082f73] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <FileText size={20} className="text-cyan-300" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-white truncate m-0">{material.title}</h3>
              <p className="text-[11px] text-cyan-200/80 m-0 truncate">
                {material.section} • {material.subject} {material.year ? `(${material.year})` : ''} • {material.fileSize || 'PDF Document'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={material.fileUrl}
              download={material.fileName || 'Document.pdf'}
              target="_blank"
              rel="noreferrer"
              className="py-1.5 px-3 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download PDF"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </a>
            <a
              href={material.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="py-1.5 px-3 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Open full page in new tab"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">New Tab</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="flex-1 bg-gray-100 relative">
          <object
            data={material.fileUrl}
            type="application/pdf"
            className="w-full h-full"
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <FileText size={48} className="text-[#082f73] mb-3 opacity-60" />
              <h4 className="text-base font-bold text-gray-800 mb-1">
                PDF Preview Not Embedded by Browser
              </h4>
              <p className="text-xs text-gray-500 max-w-md mb-4">
                Your browser does not support in-app embedded PDF rendering, or the document requires direct download.
              </p>
              <div className="flex gap-3">
                <a
                  href={material.fileUrl}
                  download={material.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-[#1261c9] hover:bg-[#0d4ea5] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Download size={15} />
                  <span>Download PDF Directly ({material.fileSize || 'PDF'})</span>
                </a>
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink size={15} />
                  <span>Open in External Tab</span>
                </a>
              </div>
            </div>
          </object>
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between shrink-0">
          <span>Uploaded by: <b className="text-gray-700">{material.uploadedBy}</b> on {new Date(material.uploadedAt).toLocaleDateString()}</span>
          {material.description && <span className="italic text-gray-600 truncate max-w-md">{material.description}</span>}
        </div>
      </div>
    </div>
  );
};
