import { AlertCircle, Calendar, Download, Eye, FileText, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { PdfMaterial } from '../types.ts';
import { AdminPdfUploadModal } from './AdminPdfUploadModal.tsx';
import { PdfViewerModal } from './PdfViewerModal.tsx';

interface PdfMaterialsSectionProps {
  sectionTitle: string; // e.g. "Short Notes", "Textbook", "State Board PYQ Papers", "Question Papers", "MHT-CET PYQ Papers"
  currentSubject?: string;
  onMaterialCountChange?: (count: number) => void;
}

export const PdfMaterialsSection: React.FC<PdfMaterialsSectionProps> = ({
  sectionTitle,
  currentSubject = 'All',
  onMaterialCountChange,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [materials, setMaterials] = useState<PdfMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>(currentSubject);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState<PdfMaterial | null>(null);
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.getPdfMaterials({
        section: sectionTitle,
        subject: selectedSubject === 'All' ? undefined : selectedSubject,
      });
      if (res.success) {
        setMaterials(res.materials);
        if (onMaterialCountChange) {
          onMaterialCountChange(res.materials.length);
        }
      }
    } catch (err) {
      console.error('Failed to load PDF materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [sectionTitle, selectedSubject]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    try {
      setDeletingId(id);
      const res = await api.deletePdfMaterial(id);
      if (res.success) {
        setMaterials(prev => prev.filter(m => m.id !== id));
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete PDF material.');
    } finally {
      setDeletingId(null);
    }
  };

  const subjectBadges = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'];

  return (
    <div className="mt-8 pt-6 border-t border-gray-200/80">
      {/* Header with Admin Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-[#082f73] m-0 flex items-center gap-2">
              <FileText className="text-red-600" size={20} />
              <span>Official PDF Notes &amp; Question Papers</span>
            </h3>
            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[11px] font-bold rounded-full">
              {materials.length} {materials.length === 1 ? 'PDF' : 'PDFs'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Downloadable hand-written short notes, board papers, and question sheets for {sectionTitle}.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin ? (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="py-2 px-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus size={15} />
              <span>+ Admin: Add PDF to {sectionTitle}</span>
              <ShieldCheck size={14} className="ml-1 text-amber-200" />
            </button>
          ) : (
            <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
              Official Verified PDFs
            </span>
          )}
        </div>
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <span className="text-xs font-bold text-gray-500 mr-1 shrink-0">Subject:</span>
        {subjectBadges.map(sub => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              selectedSubject === sub
                ? 'bg-[#082f73] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Material Cards */}
      {loading ? (
        <div className="py-10 text-center text-xs text-gray-500">
          Loading attached PDF notes and question papers...
        </div>
      ) : materials.length === 0 ? (
        <div className="py-8 px-4 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
          <FileText size={32} className="mx-auto text-gray-400 mb-2" />
          <h4 className="text-sm font-bold text-gray-700 mb-1">
            No PDF documents currently attached for {selectedSubject !== 'All' ? selectedSubject : sectionTitle}
          </h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-3">
            {isAdmin
              ? 'As an Admin user, you can click the button below to upload official PDF notes, study materials, or question papers directly into this section.'
              : 'Our academic staff is uploading verified PDF revision notes and past question papers for this section. Check back shortly!'}
          </p>
          {isAdmin && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="py-2 px-4 bg-[#1261c9] hover:bg-[#0d4ea5] text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all inline-flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Attach First PDF File Now</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {materials.map(mat => (
            <div
              key={mat.id}
              className="bg-white border border-[#d8e1ee] hover:border-[#1467d5] rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-blue-50 text-[#1467d5] font-bold text-[10px] rounded-md border border-blue-200">
                      {mat.subject}
                    </span>
                    {mat.year && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold text-[10px] rounded-md border border-amber-200 flex items-center gap-1">
                        <Calendar size={10} />
                        {mat.year}
                      </span>
                    )}
                    {mat.chapterTitle && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded-md truncate max-w-[140px]">
                        {mat.chapterTitle}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 shrink-0">
                    {mat.fileSize || 'PDF'}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-xs sm:text-sm font-extrabold text-[#082f73] line-clamp-2 mb-1 group-hover:text-[#1467d5] transition-colors">
                  {mat.title}
                </h4>

                {/* Description */}
                {mat.description && (
                  <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">
                    {mat.description}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                <span className="text-[10px] text-gray-400 truncate">
                  By {mat.uploadedBy}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setViewingMaterial(mat)}
                    className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-[#1467d5] font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Read PDF in app"
                  >
                    <Eye size={12} />
                    <span>View PDF</span>
                  </button>

                  <a
                    href={mat.fileUrl}
                    download={mat.fileName || 'Material.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Download file"
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </a>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(mat.id, mat.title)}
                      disabled={deletingId === mat.id}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
                      title="Admin: Delete this PDF"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Upload Modal */}
      {isUploadModalOpen && (
        <AdminPdfUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          defaultSection={sectionTitle}
          defaultSubject={selectedSubject === 'All' ? 'Physics' : selectedSubject}
          onMaterialAdded={newMat => {
            setMaterials(prev => [newMat, ...prev]);
            setIsUploadModalOpen(false);
          }}
        />
      )}

      {/* PDF Viewer Modal */}
      {viewingMaterial && (
        <PdfViewerModal
          material={viewingMaterial}
          onClose={() => setViewingMaterial(null)}
        />
      )}
    </div>
  );
};
