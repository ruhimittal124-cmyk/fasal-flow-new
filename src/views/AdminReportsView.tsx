import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Flag, 
  Ban, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw,
  ExternalLink,
  Phone,
  Calendar,
  Send,
  Bell,
  Eye,
  X
} from 'lucide-react';
import { UserReport, ReportStatus, ReportReason } from '../types';
import { 
  getAllReports, 
  updateReportStatus, 
  adminTakeAction 
} from '../utils/moderation';
import { useApp } from '../context/AppContext';

interface AdminReportsViewProps {
  setCurrentTab?: (tab: string) => void;
}

export const AdminReportsView: React.FC<AdminReportsViewProps> = ({ setCurrentTab }) => {
  const { addToast } = useApp();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  const loadReports = () => {
    const list = getAllReports();
    setReports(list);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpdateStatus = (reportId: string, status: ReportStatus, actionText?: string) => {
    const updated = updateReportStatus(reportId, status, actionText);
    if (updated) {
      loadReports();
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(updated);
      }
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Report ${reportId} marked as ${status.toUpperCase()}.`,
      });
    }
  };

  const handleAdminAction = (
    userId: string,
    userName: string,
    action: 'warn' | 'suspend_7d' | 'ban' | 'clear_warnings'
  ) => {
    const res = adminTakeAction(userId, userName, action);
    if (res.success) {
      loadReports();
      addToast({
        type: action === 'ban' ? 'error' : action === 'clear_warnings' ? 'success' : 'warning',
        title: 'Moderation Action Applied',
        message: `${res.message} ${res.notificationMessage}`,
      });
      if (selectedReport) {
        handleUpdateStatus(selectedReport.id, 'resolved', res.message);
      }
    }
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (selectedReason !== 'all' && r.reason !== selectedReason) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.reportedUserName.toLowerCase().includes(q);
      const matchReporter = r.reporterName.toLowerCase().includes(q);
      const matchDesc = r.description?.toLowerCase().includes(q) || false;
      const matchReason = r.reason.toLowerCase().includes(q);
      if (!matchName && !matchReporter && !matchDesc && !matchReason) return false;
    }
    return true;
  });

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-red-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Trust & Safety Moderation Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              User Reports & Dispute Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Review flagged chat messages, inspect harassment/fraud submissions, and issue warnings or automated suspensions across the mandi ecosystem.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadReports}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Reports</span>
            </button>
            {setCurrentTab && (
              <button
                onClick={() => setCurrentTab('chat')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Go to Live Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/10">
            <span className="text-[11px] text-slate-400 uppercase font-bold block">Total Reports</span>
            <span className="text-2xl font-black text-white">{reports.length}</span>
          </div>
          <div className="bg-amber-500/10 rounded-2xl p-3 sm:p-4 border border-amber-500/20">
            <span className="text-[11px] text-amber-300 uppercase font-bold block">Pending Review</span>
            <span className="text-2xl font-black text-amber-400">{pendingCount}</span>
          </div>
          <div className="bg-emerald-500/10 rounded-2xl p-3 sm:p-4 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-300 uppercase font-bold block">Resolved / Actioned</span>
            <span className="text-2xl font-black text-emerald-400">{resolvedCount}</span>
          </div>
          <div className="bg-rose-500/10 rounded-2xl p-3 sm:p-4 border border-rose-500/20">
            <span className="text-[11px] text-rose-300 uppercase font-bold block">Auto-Block Policy</span>
            <span className="text-xs font-bold text-rose-300 block mt-1">5+ Reports = Auto-Ban</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user, reporter, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold ml-2">
            <span>Reason:</span>
          </div>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 bg-white"
          >
            <option value="all">All Reasons</option>
            <option value="Spam">Spam</option>
            <option value="Harassment">Harassment</option>
            <option value="Fraud">Fraud</option>
            <option value="Inappropriate Language">Inappropriate Language</option>
            <option value="Fake Profile">Fake Profile</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Main Reports List / Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Reports Table / List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">All Clear</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active reports match the selected filters. All community flagged disputes are currently in good order.
              </p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const isSelected = selectedReport?.id === report.id;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-500 ring-2 ring-rose-100 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          report.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : report.status === 'reviewed'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : report.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {report.status}
                        </span>

                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          {report.reason}
                        </span>

                        <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{report.timestamp}</span>
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 pt-1">
                        Reported: <span className="text-rose-950 font-black">{report.reportedUserName}</span>
                      </h3>

                      <p className="text-xs text-slate-500">
                        Filed by: <strong className="text-slate-700">{report.reporterName}</strong>
                        {report.reportedUserPhone && ` • Phone: ${report.reportedUserPhone}`}
                      </p>
                    </div>

                    {report.screenshotUrl && (
                      <div className="shrink-0">
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded-lg flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>Proof</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {report.description && (
                    <p className="text-xs text-slate-600 mt-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2 italic">
                      "{report.description}"
                    </p>
                  )}

                  {report.adminActionTaken && (
                    <div className="mt-2.5 text-[11px] text-emerald-700 font-semibold flex items-center space-x-1 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Resolution: {report.adminActionTaken}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right column: Action & Review Details Panel */}
        <div className="lg:col-span-5">
          {selectedReport ? (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-5 sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Report Investigation
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">#{selectedReport.id.slice(0, 10)}</span>
              </div>

              {/* Reported User Profile Card */}
              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                  Reported Account Details
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black text-slate-900">{selectedReport.reportedUserName}</h4>
                    <p className="text-xs text-slate-500 font-medium">User ID: {selectedReport.reportedUserId}</p>
                    {selectedReport.reportedUserPhone && (
                      <p className="text-xs text-slate-600 font-mono mt-0.5">{selectedReport.reportedUserPhone}</p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 font-black text-base flex items-center justify-center">
                    {selectedReport.reportedUserName.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Dispute Particulars */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Allegation Reason:</span>
                  <span className="font-bold text-rose-700">{selectedReport.reason}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Reporter:</span>
                  <span className="font-semibold text-slate-900">{selectedReport.reporterName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-700">{selectedReport.timestamp}</span>
                </div>
              </div>

              {/* Description text */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Issue Narrative:</span>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                  {selectedReport.description || 'No additional narrative provided by reporter.'}
                </div>
              </div>

              {/* Screenshot Preview */}
              {selectedReport.screenshotUrl && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Attached Screenshot Evidence:</span>
                  <div 
                    onClick={() => setPreviewScreenshot(selectedReport.screenshotUrl || null)}
                    className="relative rounded-xl overflow-hidden border border-slate-200 cursor-pointer group"
                  >
                    <img
                      src={selectedReport.screenshotUrl}
                      alt="Dispute evidence"
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>Click to Enlarge Evidence</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Moderator Actions Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Enforce Disciplinary Actions
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdminAction(selectedReport.reportedUserId, selectedReport.reportedUserName, 'warn')}
                    className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Issue Warning (+1 Strike)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAdminAction(selectedReport.reportedUserId, selectedReport.reportedUserName, 'suspend_7d')}
                    className="p-2.5 rounded-xl border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-900 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Suspend 7 Days</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAdminAction(selectedReport.reportedUserId, selectedReport.reportedUserName, 'ban')}
                    className="p-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Ban className="w-4 h-4 text-rose-600" />
                    <span>Permanent Ban</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAdminAction(selectedReport.reportedUserId, selectedReport.reportedUserName, 'clear_warnings')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Clear Strikes</span>
                  </button>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReport.id, 'reviewed')}
                    className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Mark Reviewed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolved', 'Resolved by Moderator')}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed', 'Dismissed: Insufficient evidence')}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-8 text-center border border-dashed border-slate-300 text-slate-400 space-y-2">
              <ShieldAlert className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Select a report on the left to view evidence, inspect chat logs, and issue moderation warnings.</p>
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Zoom Modal */}
      {previewScreenshot && (
        <div 
          onClick={() => setPreviewScreenshot(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setPreviewScreenshot(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewScreenshot}
              alt="Evidence preview"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
