import { ArrowLeft, CheckCircle2, Clock, Code, Eye, Mail, RefreshCw, Send, ShieldCheck, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { SentEmailLog } from '../types.ts';

interface EmailLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailLogViewer: React.FC<EmailLogViewerProps> = ({ isOpen, onClose }) => {
  const [emails, setEmails] = useState<SentEmailLog[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SentEmailLog | null>(null);
  const [viewFormat, setViewFormat] = useState<'HTML' | 'TEXT'>('HTML');
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await api.getRecentSentEmails();
      if (res.success) {
        setEmails(res.emails);
        if (res.emails.length > 0) {
          // If none selected or current not in list, pick first
          setSelectedEmail((prev) => (prev ? res.emails.find(e => e.id === prev.id) || res.emails[0] : res.emails[0]));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-[24px] shadow-2xl border border-gray-100 p-5 sm:p-6 text-[#17233c] overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1467d5] flex items-center justify-center">
              <Mail size={22} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#082f73] m-0">
                Email Dispatch Outbox &amp; Activity
              </h2>
              <p className="text-xs text-gray-500 m-0">
                Live transactional onboarding emails &amp; test performance reports sent to students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchEmails}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Refresh inbox"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-[#1467d5]' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 flex-1 overflow-hidden">
          {/* List (md:col-span-5) */}
          <div className="md:col-span-5 border-r border-gray-100 overflow-y-auto pr-2 space-y-2">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
              Sent Messages ({emails.length})
            </div>
            {emails.length === 0 ? (
              <div className="text-center py-12 px-4 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Mail size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="font-bold text-gray-600 m-0">No emails dispatched yet</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Complete a new student signup to dispatch the welcome onboarding packet!
                </p>
              </div>
            ) : (
              emails.map((em) => {
                const isSelected = selectedEmail?.id === em.id;
                const isWelcome = em.subject.toLowerCase().includes('welcome');
                return (
                  <div
                    key={em.id}
                    onClick={() => {
                      setSelectedEmail(em);
                      if (em.bodyHtml) setViewFormat('HTML');
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/90 border-[#1261c9] shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold text-[#082f73] truncate max-w-[150px]">
                        To: {em.to}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                          em.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {em.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-gray-900 leading-snug line-clamp-1 mb-1">
                      {isWelcome ? '🎓 ' : '📊 '}
                      {em.subject}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>{new Date(em.sentAt).toLocaleDateString()}</span>
                      <span>
                        {new Date(em.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Email Body Preview (md:col-span-7) */}
          <div className="md:col-span-7 flex flex-col h-full overflow-hidden pl-1">
            {selectedEmail ? (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs flex-1 flex flex-col overflow-hidden">
                {/* Meta details bar */}
                <div className="pb-3 mb-3 border-b border-gray-200 shrink-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-gray-900 m-0 mb-1 leading-snug">
                      {selectedEmail.subject}
                    </h3>

                    {/* View format toggle (HTML vs Plain Text) */}
                    {selectedEmail.bodyHtml && (
                      <div className="flex bg-white rounded-lg p-0.5 border border-gray-200 shrink-0">
                        <button
                          type="button"
                          onClick={() => setViewFormat('HTML')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                            viewFormat === 'HTML'
                              ? 'bg-[#082f73] text-white shadow-xs'
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          <Eye size={12} />
                          <span>HTML View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewFormat('TEXT')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                            viewFormat === 'TEXT'
                              ? 'bg-[#082f73] text-white shadow-xs'
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          <Code size={12} />
                          <span>Text View</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-gray-600 mt-2">
                    <div>
                      <b className="text-gray-800">Recipient:</b> {selectedEmail.to}
                    </div>
                    <div>
                      <b className="text-gray-800">Dispatch Time:</b>{' '}
                      {new Date(selectedEmail.sentAt).toLocaleString()}
                    </div>
                    <div>
                      <b className="text-gray-800">Service:</b>{' '}
                      <span className="text-emerald-700 font-bold">
                        {selectedEmail.status === 'DELIVERED'
                          ? 'Real SMTP Transport (Delivered)'
                          : 'Transactional Simulator (Verified)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Viewer Frame */}
                <div className="flex-1 overflow-hidden bg-white rounded-xl border border-gray-200 flex flex-col">
                  {viewFormat === 'HTML' && selectedEmail.bodyHtml ? (
                    <iframe
                      title="Email HTML Preview"
                      srcDoc={selectedEmail.bodyHtml}
                      className="w-full h-full border-0 rounded-xl"
                      sandbox="allow-same-origin"
                    />
                  ) : (
                    <div className="p-4 overflow-y-auto whitespace-pre-line text-xs font-mono text-gray-700 leading-relaxed bg-white">
                      {selectedEmail.bodyText}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-gray-400 flex flex-col items-center justify-center h-full">
                <Mail size={36} className="text-gray-300 mb-2" />
                <span>Select an email from the list on the left to preview its content.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
