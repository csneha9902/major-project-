import React, { useState } from 'react';
import { Mail, X, Send, FileText, CheckCircle2, AlertCircle, Sparkles, Building2 } from 'lucide-react';
import GlowButton from './ui/GlowButton';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function EmailReportModal({
  isOpen,
  onClose,
  uploadId,
  filename = "EEG_Session_Recording.edf",
  defaultRecipientEmail = "",
  defaultRecipientName = ""
}) {
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipientEmail);
  const [recipientName, setRecipientName] = useState(defaultRecipientName);
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const { getAuthHeaders } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientEmail) {
      setError("Please enter a valid recipient email.");
      return;
    }
    if (!uploadId) {
      setError("No active file analysis ID found. Please upload or select a recording first.");
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/api/mail/send-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          upload_id: uploadId,
          recipient_email: recipientEmail,
          recipient_name: recipientName || "Patient / Healthcare Provider",
          notes: notes || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to dispatch email report.");
      }

      setSuccess(`Diagnostic report successfully dispatched to ${recipientEmail}!`);
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2500);
    } catch (err) {
      setError(err.message || "Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[var(--border-glass)] relative animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={sending}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            <Mail size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-900">
              Dispatch Clinical PDF Report
            </h3>
            <p className="text-xs text-slate-500">
              Deliver SNN wave decomposition and diagnostic findings directly via email.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Recipient Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="doctor@hospital.org or patient@email.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Recipient Full Name
            </label>
            <input
              type="text"
              placeholder="Dr. Sarah Jenkins or Eleanor Vance"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium text-slate-800"
            />
          </div>

          {/* Attached Document Summary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <FileText size={16} className="text-blue-600" />
              <span className="font-mono text-blue-800 truncate max-w-[240px]">
                {filename}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              PDF Attached
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Doctor Notes / Instructions (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add clinical observations, recommended break intervals, or prescription notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium text-slate-800 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <GlowButton variant="ghost" onClick={onClose} disabled={sending} type="button">
              Cancel
            </GlowButton>
            <GlowButton variant="cyan" type="submit" disabled={sending} className="inline-flex items-center gap-2">
              <Send size={15} />
              <span>{sending ? "Dispatching..." : "Send Email Report"}</span>
            </GlowButton>
          </div>
        </form>
      </div>
    </div>
  );
}
