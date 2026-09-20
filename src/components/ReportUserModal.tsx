import React, { useState } from 'react';
import { 
  X, 
  Flag, 
  AlertTriangle, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert,
  Paperclip,
  Clock
} from 'lucide-react';
import { ReportReason } from '../types';
import { submitUserReport } from '../utils/moderation';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUser: {
    id: string;
    name: string;
    role?: string;
    phone?: string;
  };
  reporter: {
    id: string;
    name: string;
    phone?: string;
  };
  onReportSubmitted?: (autoBlocked: boolean) => void;
}

const REPORT_REASONS: ReportReason[] = [
  'Spam',
  'Harassment',
  'Fraud',
  'Inappropriate Language',
  'Fake Profile',
  'Other',
];

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  reportedUser,
  reporter,
  onReportSubmitted,
}) => {
  const [reason, setReason] = useState<ReportReason>('Spam');
  const [description, setDescription] = useState<string>('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [wasAutoBlocked, setWasAutoBlocked] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const result = submitUserReport({
        reportedUserId: reportedUser.id,
        reportedUserName: reportedUser.name,
        reportedUserPhone: reportedUser.phone,
        reporterId: reporter.id,
        reporterName: reporter.name,
        reporterPhone: reporter.phone,
        reason,
        description: description.trim() || undefined,
        screenshotUrl: screenshotPreview || undefined,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      setWasAutoBlocked(result.autoBlocked);

      if (onReportSubmitted) {
        onReportSubmitted(result.autoBlocked);
      }
    }, 500);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setDescription('');
    setScreenshotPreview(null);
    setScreenshotName('');
    setReason('Spam');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="report-user-modal"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 to-red-950 text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-rose-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Flag className="w-4 h-4 text-rose-400" />
            <span>Community Trust & Safety</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Report User
          </h2>

          <p className="text-xs text-rose-100/80 mt-1">
            Reporting <span className="font-bold text-white">{reportedUser.name}</span>
            {reportedUser.role && ` (${reportedUser.role})`}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Report Submitted</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Report submitted. Our team will review within 24 hours.
                </p>
              </div>

              {wasAutoBlocked && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-left flex items-start space-x-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 leading-snug">
                    <strong>Auto-Action Taken:</strong> This user has accumulated 5 or more reports across the platform and has been automatically suspended pending review.
                  </p>
                </div>
              )}

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Close & Return to Chat
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Reason selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Reporting <span className="text-rose-600">*</span>
                </label>
                <select
                  id="report-reason-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white text-slate-800 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Describe the Issue <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                </label>
                <textarea
                  id="report-description-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue, suspicious demands, fraud attempt, or inappropriate remarks..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                />
              </div>

              {/* Screenshot Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Attach Screenshots <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                </label>

                {screenshotPreview ? (
                  <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot evidence"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{screenshotName || 'screenshot.png'}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Image Attached</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      id="report-screenshot-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="report-screenshot-file"
                      className="w-full py-2.5 px-3 border-2 border-dashed border-slate-200 hover:border-rose-300 rounded-xl bg-slate-50/60 hover:bg-rose-50/30 flex items-center justify-center space-x-2 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4 text-slate-400" />
                      <span>Click to upload evidence screenshot</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Policy note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed flex items-start space-x-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Reports are handled confidentially by Mandi Compliance officers. Repeat offenders are penalized with platform strikes and automated suspension.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="report-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-300 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Flag className="w-4 h-4" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
