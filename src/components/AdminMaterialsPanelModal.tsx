import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  FolderPlus,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { PdfMaterial } from '../types.ts';
import { PdfViewerModal } from './PdfViewerModal.tsx';

interface AdminMaterialsPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHAPTER_PRESETS: Record<string, string[]> = {
  Physics: [
    'Rotational Dynamics',
    'Mechanical Properties of Fluids',
    'Kinetic Theory of Gases & Radiation',
    'Thermodynamics',
    'Oscillations & Wave Optics',
    'Electrostatics & Current Electricity',
    'Magnetic Effects of Electric Current',
    'Modern Physics & Semiconductors',
  ],
  Chemistry: [
    'Solid State',
    'Solutions',
    'Ionic Equilibria',
    'Chemical Thermodynamics',
    'Electrochemistry & Chemical Kinetics',
    'Transition & Inner Transition Elements',
    'Halogen Derivatives & Alcohols',
    'Aldehydes, Ketones & Carboxylic Acids',
  ],
  Mathematics: [
    'Mathematical Logic',
    'Matrices',
    'Trigonometric Functions',
    'Pair of Straight Lines & Vectors',
    'Differentiation & Applications',
    'Indefinite & Definite Integration',
    'Differential Equations & Probability',
    'Linear Programming & Binomial Distribution',
  ],
  Biology: [
    'Reproduction in Lower and Higher Plants',
    'Reproduction in Lower and Higher Animals',
    'Inheritance and Variation',
    'Molecular Basis of Inheritance',
    'Origin and Evolution of Life',
    'Plant Water Relations & Plant Growth',
    'Respiration and Circulation',
    'Control and Co-ordination',
  ],
  All: ['Full Syllabus Mock', 'Complete PCMB Combined', 'General Formula Sheet'],
};

export const AdminMaterialsPanelModal: React.FC<AdminMaterialsPanelModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Navigation tab inside admin panel
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'LIBRARY'>('UPLOAD');

  // Materials list & search states
  const [materials, setMaterials] = useState<PdfMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState<PdfMaterial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Upload & Metadata Tagging State
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');

  // Metadata tags
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'All'>('Physics');
  const [chapterTitle, setChapterTitle] = useState('Rotational Dynamics');
  const [customChapter, setCustomChapter] = useState('');
  const [section, setSection] = useState<
    'Short Notes' | 'Question Papers' | 'State Board PYQ Papers' | 'MHT-CET PYQ Papers' | 'Textbook' | 'Textbook Questions'
  >('Short Notes');
  const [year, setYear] = useState<number | ''>(2024);
  const [description, setDescription] = useState('');

  // Submission feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchAllMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.getPdfMaterials();
      if (res.success) {
        setMaterials(res.materials);
      }
    } catch (e) {
      console.error('Error fetching materials:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllMaterials();
    }
  }, [isOpen]);

  // When subject changes, auto-update the default chapter preset
  const handleSubjectChange = (newSubject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'All') => {
    setSubject(newSubject);
    const presets = CHAPTER_PRESETS[newSubject] || [];
    if (presets.length > 0) {
      setChapterTitle(presets[0]);
    } else {
      setChapterTitle('');
    }
  };

  // Handle PDF file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setFormError('Invalid file type: Please select a valid PDF file (.pdf).');
      return;
    }

    if (selectedFile.size > 28 * 1024 * 1024) {
      setFormError('File too large: Selected PDF exceeds the 28MB limit.');
      return;
    }

    setFormError('');
    setFile(selectedFile);
    setFileName(selectedFile.name);

    // Format file size
    const mb = selectedFile.size / (1024 * 1024);
    const formattedSize = mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(selectedFile.size / 1024)} KB`;
    setFileSize(formattedSize);

    // Auto-populate title if empty or default
    if (!title) {
      const cleanName = selectedFile.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
      setTitle(cleanName);
    }
  };

  // Submit and save tagged PDF to database as a FormData multipart request
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!file) {
      setFormError('Please select a PDF file (.pdf) to upload.');
      return;
    }

    const finalChapter = chapterTitle === 'CUSTOM' ? customChapter.trim() : (customChapter.trim() || chapterTitle.trim());
    if (!finalChapter) {
      setFormError('Please select or specify a target Chapter metadata tag.');
      return;
    }

    if (!title.trim()) {
      setFormError('Please enter a document title.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create multi-part FormData instance
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', subject);
      formData.append('chapterTitle', finalChapter);
      formData.append('section', section);
      formData.append('title', title.trim());
      if (year) formData.append('year', String(year));
      if (description.trim()) formData.append('description', description.trim());

      const res = await api.uploadPdfMaterialFormData(formData);

      if (res.success) {
        setFormSuccess(`Successfully uploaded and stored "${res.material.title}" in the database under ${subject} • ${finalChapter}!`);
        setMaterials((prev) => [res.material, ...prev]);

        // Reset file field
        setFile(null);
        setFileName('');
        setFileSize('');
        setTitle('');
        setDescription('');
        setCustomChapter('');

        // Switch to library view after 1.2s to show newly stored document
        setTimeout(() => {
          setActiveTab('LIBRARY');
          setFormSuccess('');
        }, 1200);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to upload PDF material via FormData.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete document from database
  const handleDelete = async (id: string, itemTitle: string) => {
    if (!window.confirm(`Admin Action: Are you sure you want to delete "${itemTitle}" from the database?`)) {
      return;
    }
    try {
      setDeletingId(id);
      const res = await api.deletePdfMaterial(id);
      if (res.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete material from database.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const sectionsList = [
    'All',
    'Short Notes',
    'Question Papers',
    'State Board PYQ Papers',
    'MHT-CET PYQ Papers',
    'Textbook',
    'Textbook Questions',
  ];

  const filteredMaterials = materials.filter((m) => {
    const matchesSection = selectedSectionFilter === 'All' || m.section === selectedSectionFilter;
    const matchesSearch =
      searchQuery === '' ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.chapterTitle && m.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden text-gray-900">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#082f73] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-gray-900 flex items-center justify-center font-black shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white m-0">
                  Admin Document Management Center
                </h3>
                <span className="px-2 py-0.5 bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[10px] font-bold rounded-md uppercase">
                  Admin Portal
                </span>
              </div>
              <p className="text-xs text-blue-200 m-0">
                Upload PDF files and tag them with Subject &amp; Chapter metadata for database storage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-6 pt-3 pb-0 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('UPLOAD')}
              className={`pb-3 px-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'UPLOAD'
                  ? 'border-[#082f73] text-[#082f73]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <FolderPlus size={15} />
              <span>Upload &amp; Tag New PDF</span>
            </button>
            <button
              onClick={() => setActiveTab('LIBRARY')}
              className={`pb-3 px-3.5 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'LIBRARY'
                  ? 'border-[#082f73] text-[#082f73]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Layers size={15} />
              <span>Database Document Library ({materials.length})</span>
            </button>
          </div>

          <div className="pb-2 text-[11px] text-gray-500 font-medium hidden sm:block">
            Storage Engine: <b className="text-gray-700">Flat-File JSON Database</b>
          </div>
        </div>

        {/* Tab 1: Upload & Tag PDF Field & Form */}
        {activeTab === 'UPLOAD' ? (
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <div className="max-w-2xl mx-auto">
              <div className="mb-4">
                <h4 className="text-sm font-black text-[#082f73] m-0 flex items-center gap-2">
                  <Upload size={17} className="text-[#1467d5]" />
                  <span>Upload PDF File &amp; Assign Subject/Chapter Metadata</span>
                </h4>
                <p className="text-xs text-gray-500 m-0 mt-0.5">
                  Select a `.pdf` file from your computer or phone. It will be encoded and stored in the database with rich curriculum metadata.
                </p>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form
                encType="multipart/form-data"
                onSubmit={handleUploadSubmit}
                className="space-y-4 text-xs"
              >
                {/* 1. PDF File Upload Field (Required) */}
                <div>
                  <label htmlFor="adminPdfInput" className="block font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                    <span>1. PDF Document File *</span>
                    <span className="text-[11px] font-normal text-gray-400">Accepts .pdf (up to 28MB)</span>
                  </label>

                  <div className="relative border-2 border-dashed border-gray-300 hover:border-[#1467d5] rounded-xl p-5 text-center bg-gray-50/70 hover:bg-blue-50/20 transition-all cursor-pointer">
                    <input
                      type="file"
                      id="adminPdfInput"
                      name="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required
                    />

                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-blue-100/70 text-[#1467d5] flex items-center justify-center shadow-xs">
                        {file ? <FileCheck size={24} className="text-emerald-600" /> : <Upload size={22} />}
                      </div>

                      {file ? (
                        <div>
                          <p className="font-extrabold text-[#082f73] text-sm m-0">
                            {fileName}
                          </p>
                          <p className="text-[11px] text-emerald-700 font-semibold m-0 mt-0.5 flex items-center justify-center gap-1">
                            <CheckCircle2 size={12} />
                            <span>PDF Attached for FormData Upload ({fileSize})</span>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-[#1467d5] text-xs m-0">
                            Click to select or drag &amp; drop a .pdf file here
                          </p>
                          <p className="text-[11px] text-gray-400 m-0 mt-0.5">
                            Upload 12th Board Textbooks, Handwritten Formula Notes, Exercise Solutions, or PYQ Papers
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accessible file picker input */}
                  <div className="mt-2 flex items-center gap-2">
                    <label htmlFor="adminPdfInputDirect" className="text-[11px] text-gray-500 font-medium shrink-0">
                      Or browse file directly:
                    </label>
                    <input
                      type="file"
                      id="adminPdfInputDirect"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="text-xs text-gray-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1467d5] hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                </div>

                {/* 2. Metadata: Target Subject & Chapter Dropdowns (Core requirement) */}
                <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag size={15} className="text-[#082f73]" />
                    <h5 className="font-extrabold text-[#082f73] text-xs m-0">
                      2. Metadata Tagging (Target Subject &amp; Chapter)
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Target Subject Dropdown */}
                    <div>
                      <label htmlFor="targetSubjectSelect" className="block font-bold text-gray-700 mb-1">
                        Target Subject *
                      </label>
                      <select
                        id="targetSubjectSelect"
                        name="subject"
                        value={subject}
                        onChange={(e) => handleSubjectChange(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5] font-semibold text-xs"
                        required
                      >
                        <option value="Physics">Physics ⚡</option>
                        <option value="Chemistry">Chemistry 🧪</option>
                        <option value="Mathematics">Mathematics 📐</option>
                        <option value="Biology">Biology 🧬</option>
                        <option value="All">All Subjects (Combined Mock / General Guide)</option>
                      </select>
                    </div>

                    {/* Target Chapter Dropdown */}
                    <div>
                      <label htmlFor="targetChapterSelect" className="block font-bold text-gray-700 mb-1">
                        Target Chapter *
                      </label>
                      <select
                        id="targetChapterSelect"
                        name="chapterTitle"
                        value={chapterTitle}
                        onChange={(e) => {
                          setChapterTitle(e.target.value);
                          setCustomChapter('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5] font-semibold text-xs truncate"
                        required
                      >
                        {(CHAPTER_PRESETS[subject] || []).map((ch) => (
                          <option key={ch} value={ch}>
                            {ch}
                          </option>
                        ))}
                        <option value="CUSTOM">➕ Other / Custom Chapter Topic...</option>
                      </select>
                    </div>
                  </div>

                  {/* Or Custom Chapter Tag */}
                  {(chapterTitle === 'CUSTOM' || customChapter) && (
                    <div>
                      <label className="block font-semibold text-gray-600 mb-1">
                        Custom Chapter / Topic Name *
                      </label>
                      <input
                        type="text"
                        name="customChapter"
                        value={customChapter}
                        onChange={(e) => setCustomChapter(e.target.value)}
                        placeholder="Enter specific chapter or topic title..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1467d5]/30 text-xs font-semibold"
                        required={chapterTitle === 'CUSTOM'}
                      />
                    </div>
                  )}
                </div>

                {/* 3. Section Tag & Exam Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Target Section Tag *</label>
                    <select
                      name="section"
                      value={section}
                      onChange={(e) => setSection(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1467d5]/30 font-semibold text-xs"
                      required
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
                    <label className="block font-bold text-gray-700 mb-1">Exam Year Tag (Optional)</label>
                    <input
                      type="number"
                      name="year"
                      value={year}
                      onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                      placeholder="2024"
                      min={2018}
                      max={2030}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1467d5]/30 text-xs"
                    />
                  </div>
                </div>

                {/* Document Title */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Document Display Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Rotational Dynamics Hand-Written Formulae &amp; Revision PDF"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1467d5]/30 text-xs font-semibold"
                  />
                </div>

                {/* Description / Marking Scheme Notes */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Description / Notes (Optional)</label>
                  <textarea
                    rows={2}
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Includes step-by-step marking scheme, derivations, and exam shortcuts."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1467d5]/30 text-xs"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !file}
                    className="w-full py-3.5 bg-[#1261c9] hover:bg-[#0d4ea5] disabled:bg-gray-300 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Uploading FormData &amp; Storing in Database...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>UPLOAD MULTIPART FORMDATA &amp; STORE IN DATABASE</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-gray-400 mt-2">
                    Dispatched as a multipart/form-data request with attached PDF file and Subject/Chapter metadata.
                  </p>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Tab 2: Document Library with Search & Filtering */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar: Search and Filter */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, subject, chapter..."
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#1467d5]/30 focus:border-[#1467d5]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                <span className="text-xs font-bold text-gray-500 shrink-0">Section:</span>
                {sectionsList.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSectionFilter(sec)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                      selectedSectionFilter === sec
                        ? 'bg-[#082f73] text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Materials List */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {loading ? (
                <div className="py-16 text-center text-xs text-gray-500">
                  <RefreshCw size={24} className="animate-spin mx-auto text-blue-500 mb-2" />
                  <span>Loading database documents...</span>
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="py-16 text-center text-gray-500">
                  <FileText size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-bold text-gray-700">No documents found matching filters</p>
                  <button
                    onClick={() => setActiveTab('UPLOAD')}
                    className="mt-3 py-2 px-4 bg-[#1467d5] hover:bg-[#0f52b0] text-white text-xs font-bold rounded-xl shadow cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Upload New PDF Document</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      className="bg-white border border-gray-200 hover:border-[#1467d5] rounded-xl p-3.5 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0 border border-red-100">
                          <FileText size={20} />
                        </div>
                        <div>
                          {/* Metadata Tags Row */}
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="px-2 py-0.5 bg-blue-50 text-[#1467d5] font-extrabold text-[10px] rounded-md border border-blue-200">
                              {mat.section}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-extrabold text-[10px] rounded-md border border-emerald-200">
                              Subject: {mat.subject}
                            </span>
                            {mat.chapterTitle && (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-800 font-bold text-[10px] rounded-md border border-purple-200">
                                Chapter: {mat.chapterTitle}
                              </span>
                            )}
                            {mat.year && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold text-[10px] rounded-md border border-amber-200 flex items-center gap-1">
                                <Calendar size={10} />
                                Year: {mat.year}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 font-medium">
                              {mat.fileSize || 'PDF'}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 m-0">
                            {mat.title}
                          </h4>

                          {mat.description && (
                            <p className="text-[11px] text-gray-500 m-0 mt-0.5 line-clamp-1">
                              {mat.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => setPreviewMaterial(mat)}
                          className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-[#1467d5] font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Preview in app"
                        >
                          <Eye size={13} />
                          <span>Preview</span>
                        </button>
                        <a
                          href={mat.fileUrl}
                          download={mat.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="py-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Download PDF"
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </a>
                        <button
                          onClick={() => handleDelete(mat.id, mat.title)}
                          disabled={deletingId === mat.id}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Admin: Delete from database"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between shrink-0">
          <span>
            Database Documents: <b>{materials.length}</b> total ({filteredMaterials.length} filtered)
          </span>
          <div className="flex items-center gap-3">
            {activeTab === 'LIBRARY' && (
              <button
                onClick={() => setActiveTab('UPLOAD')}
                className="text-[#1467d5] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Upload New PDF</span>
              </button>
            )}
            <span className="font-bold text-[#082f73]">AIR Practice Institute Admin</span>
          </div>
        </div>
      </div>

      {/* In-Modal PDF Document Preview */}
      {previewMaterial && (
        <PdfViewerModal
          material={previewMaterial}
          onClose={() => setPreviewMaterial(null)}
        />
      )}
    </div>
  );
};
