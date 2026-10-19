import { AlertCircle, CheckCircle2, FileText, Link as LinkIcon, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { PdfMaterial } from '../types.ts';

interface AdminPdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSection?: string;
  defaultSubject?: string;
  onMaterialAdded: (newMaterial: PdfMaterial) => void;
}

export const AdminPdfUploadModal: React.FC<AdminPdfUploadModalProps> = ({
  isOpen,
  onClose,
  defaultSection = 'Short Notes',
  defaultSubject = 'Physics',
  onMaterialAdded,
}) => {
  const [title, setTitle] = useState('');
  const [section, setSection] = useState(defaultSection);
  const [subject, setSubject] = useState(defaultSubject);
  const [chapterTitle, setChapterTitle] = useState('');
  const [year, setYear] = useState<number | ''>(2024);
  const [description, setDescription] = useState('');

  // Upload source mode: 'FILE' or 'URL'
  const [uploadSource, setUploadSource] = useState<'FILE' | 'URL'>('FILE');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file (*.pdf).');
      return;
    }

    // Check size (max 20MB for direct base64)
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Selected file exceeds 20MB limit. For larger files, please provide a direct PDF link.');
      return;
    }

    setErrorMsg('');
    setFileName(file.name);
    // Format file size
    const mb = file.size / (1024 * 1024);
    setFileSize(mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`);

    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFileUrl(result);
      setIsReadingFile(false);
      if (!title) {
        // Auto suggest title from file name without extension
        const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
        setTitle(cleanName);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the local file. Please try again or provide a direct link.');
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a descriptive title for this PDF.');
      return;
    }
    if (!fileUrl.trim()) {
      setErrorMsg('Please select a PDF file or enter a valid PDF URL.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.addPdfMaterial({
        title: title.trim(),
        section,
        subject,
        chapterTitle: chapterTitle.trim() || undefined,
        year: year ? Number(year) : undefined,
        description: description.trim() || undefined,
        fileUrl: fileUrl.trim(),
        fileName: fileName.trim() || `${title.trim().replace(/\s+/g, '_')}.pdf`,
        fileSize: fileSize || 'PDF Document',
      });

      setSuccessMsg(`PDF successfully published to ${section}!`);
      onMaterialAdded(res.material);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload PDF material. Make sure you are logged in as Admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 text-gray-900 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#082f73] m-0">
                Admin: Attach PDF Note / Question Paper
              </h3>
              <p className="text-xs text-gray-500 m-0">
                Upload official PDFs accessible to students across devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-3.5 pr-1 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section & Subject Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Target Section *</label>
              <select
                value={section}
                onChange={e => setSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5] font-semibold"
              >
                <option value="Short Notes">Short Notes (Revision PDFs)</option>
                <option value="Question Papers">Question Papers (Chapter Tests)</option>
                <option value="State Board PYQ Papers">12th State Board PYQ Papers</option>
                <option value="MHT-CET PYQ Papers">MHT-CET / NEET PYQ Papers</option>
                <option value="Textbook">Textbook (Full PDF)</option>
                <option value="Textbook Questions">Textbook Questions &amp; Answers</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Subject *</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5] font-semibold"
              >
                <option value="Physics">Physics ⚡</option>
                <option value="Chemistry">Chemistry 🧪</option>
                <option value="Mathematics">Mathematics 📐</option>
                <option value="Biology">Biology 🧬</option>
                <option value="All">All Subjects (General / Full Mock)</option>
              </select>
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Document Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Rotational Dynamics Hand-Written Formulae & Revision PDF"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5]"
            />
          </div>

          {/* Chapter / Topic & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Chapter / Topic (Optional)</label>
              <input
                type="text"
                value={chapterTitle}
                onChange={e => setChapterTitle(e.target.value)}
                placeholder="e.g. Rotational Dynamics"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1467d5]/30"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Exam Year (Optional)</label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(e.target.value ? Number(e.target.value) : '')}
                placeholder="2024"
                min={2018}
                max={2030}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1467d5]/30"
              />
            </div>
          </div>

          {/* Brief Description */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Notes / Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Includes model marking scheme and derivations"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1467d5]/30"
            />
          </div>

          {/* Upload Method Tabs */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">PDF Source *</label>
            <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50 mb-2">
              <button
                type="button"
                onClick={() => setUploadSource('FILE')}
                className={`flex-1 py-1.5 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  uploadSource === 'FILE' ? 'bg-white shadow-xs text-[#082f73]' : 'text-gray-500'
                }`}
              >
                <Upload size={13} />
                <span>Upload Local PDF File</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadSource('URL')}
                className={`flex-1 py-1.5 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  uploadSource === 'URL' ? 'bg-white shadow-xs text-[#082f73]' : 'text-gray-500'
                }`}
              >
                <LinkIcon size={13} />
                <span>Direct PDF Link / URL</span>
              </button>
            </div>

            {uploadSource === 'FILE' ? (
              <div className="border-2 border-dashed border-gray-300 hover:border-[#1467d5] rounded-xl p-4 text-center bg-gray-50/50 transition-colors">
                <input
                  type="file"
                  id="pdfFileInput"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="pdfFileInput"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1467d5] flex items-center justify-center">
                    <Upload size={18} />
                  </div>
                  <span className="font-bold text-[#1467d5]">
                    {isReadingFile ? 'Reading PDF file...' : fileName || 'Click to browse PDF file from your device'}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {fileSize ? `Selected: ${fileSize}` : 'Supports any .pdf document up to 20MB'}
                  </span>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  value={fileUrl}
                  onChange={e => {
                    setFileUrl(e.target.value);
                    if (!fileName) setFileName('Document.pdf');
                  }}
                  placeholder="https://example.com/papers/HSC_Physics_Paper.pdf"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={fileName}
                    onChange={e => setFileName(e.target.value)}
                    placeholder="File Name (e.g. physics_paper.pdf)"
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={fileSize}
                    onChange={e => setFileSize(e.target.value)}
                    placeholder="File Size (e.g. 3.5 MB)"
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-gray-100 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || isReadingFile}
              className="flex-1 py-3 bg-[#1261c9] hover:bg-[#0d4ea5] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Upload size={15} />
              <span>{isSubmitting ? 'Uploading PDF...' : 'UPLOAD & PUBLISH PDF TO SECTION'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
