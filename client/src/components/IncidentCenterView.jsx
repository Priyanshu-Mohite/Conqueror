import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  Clock,
  Wrench,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import api from '../api/client';

export default function IncidentCenterView() {
  const { incidents, resources, resolveIncident, refreshData, currentUser } = useDemo();

  const [resolutionNotes, setResolutionNotes] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  // Quick report incident modal state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportResourceId, setReportResourceId] = useState(resources[0]?._id || '');
  const [reportType, setReportType] = useState('DAMAGE');
  const [reportSeverity, setReportSeverity] = useState('MEDIUM');
  const [reportDesc, setReportDesc] = useState('');

  const openIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const resolvedIncidents = incidents.filter((i) => i.status === 'RESOLVED');

  const handleResolve = async (incidentId, restore = true) => {
    setSubmittingId(incidentId);
    const notes = resolutionNotes[incidentId] || 'Repairs completed and hardware recalibrated by lab staff.';
    try {
      await resolveIncident(incidentId, notes, restore);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReportIncident = async (e) => {
    e.preventDefault();
    const targetResource = resources.find((r) => r._id === reportResourceId);
    try {
      await api.post('/incidents', {
        resourceId: reportResourceId,
        resourceName: targetResource?.name || 'Lab Resource',
        reportedBy: currentUser?.name || 'Campus Builder',
        type: reportType,
        severity: reportSeverity,
        description: reportDesc,
      });
      setShowReportForm(false);
      setReportDesc('');
      await refreshData(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400 mb-1">
            <AlertOctagon className="w-4 h-4" />
            Step 9: Incidents, Maintenance Holds & Human Oversight
          </div>
          <h2 className="text-2xl font-bold text-white font-['Outfit']">
            Safety, Damage & Conflict Resolution Center
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Verifiable physical damage audits and conflict reports. All AI diff analyses are paired with mandatory Human-in-the-Loop manager oversight.
          </p>
        </div>

        <button
          onClick={() => setShowReportForm(!showReportForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 text-xs font-semibold shadow-md transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-rose-400" />
          <span>Report Safety Incident / Delay</span>
        </button>
      </div>

      {/* Manual Report Incident Dropdown Form */}
      {showReportForm && (
        <form
          onSubmit={handleReportIncident}
          className="bg-slate-900/90 border border-rose-500/30 p-5 rounded-2xl shadow-2xl space-y-3 animate-fade-in"
        >
          <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            File Fast Safety / Equipment Damage Report:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-300">Target Resource</label>
              <select
                value={reportResourceId}
                onChange={(e) => setReportResourceId(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {resources.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300">Incident Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="DAMAGE">DAMAGE (Hardware / Mechanical)</option>
                <option value="LATE_RETURN">LATE_RETURN (Overdue lockup)</option>
                <option value="SCHEDULING_CONFLICT">SCHEDULING_CONFLICT (Slot double-book)</option>
                <option value="SAFETY_ISSUE">SAFETY_ISSUE (Protocol violation)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300">Severity</label>
              <select
                value={reportSeverity}
                onChange={(e) => setReportSeverity(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="LOW">LOW — Minor calibration</option>
                <option value="MEDIUM">MEDIUM — Wear or delay</option>
                <option value="CRITICAL">CRITICAL — Maintenance hold required</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300">Description of Issue</label>
            <textarea
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              placeholder="Provide exact details of physical condition, affected workpieces, or safety breaches..."
              rows={2}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowReportForm(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md"
            >
              Submit Report
            </button>
          </div>
        </form>
      )}

      {/* Active Incidents & Maintenance Holds */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
          <span>Active Safety Incidents & Maintenance Holds ({openIncidents.length})</span>
          {openIncidents.length > 0 && (
            <span className="text-[11px] font-mono text-rose-400">Action Required</span>
          )}
        </h3>

        {openIncidents.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <span>All shared resources are operational. Zero unresolved safety holds!</span>
            <span className="text-[11px] text-slate-500">
              Tip: Test this flow by reporting damage during return inspection in Tab 2.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {openIncidents.map((incident) => (
              <div
                key={incident._id}
                className="bg-slate-900/90 border border-rose-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="font-extrabold text-white text-base font-['Outfit']">
                      {incident.resourceName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                      {incident.type} • {incident.severity}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    Reported by <strong className="text-slate-200">{incident.reportedBy}</strong> • {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="text-xs text-slate-300">
                  <strong className="text-slate-400">Report Summary:</strong> {incident.description}
                </div>

                {/* AI Condition Diff Advisory Box (Rule 12 Compliant) */}
                <div className="bg-slate-950/90 rounded-xl p-4 border border-cyan-500/30 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      AI Condition Diff & Repair Recommendation:
                    </span>
                    {/* Mandatory Rule 12 Human-in-the-Loop badge */}
                    <span className="text-[9px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                      AI Advisory Only — Final Decision Requires Authorized Human Manager Approval
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic">
                    "{incident.aiAdvisorySummary || 'Mechanical stress flagged at checkout. Before: GOOD vs After: DAMAGED. Inspect optical mirrors and spindle alignment.'}"
                  </p>

                  {incident.affectedBookingsCount > 0 && (
                    <div className="text-[11px] text-amber-300 flex items-center gap-1 font-mono pt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{incident.affectedBookingsCount} downstream bookings are affected by this hold.</span>
                    </div>
                  )}
                </div>

                {/* Resolution Controls */}
                <div className="pt-2 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Manager resolution notes (e.g. Lens replaced, aligned & verified)..."
                    value={resolutionNotes[incident._id] || ''}
                    onChange={(e) =>
                      setResolutionNotes({ ...resolutionNotes, [incident._id]: e.target.value })
                    }
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolve(incident._id, true)}
                      disabled={submittingId === incident._id}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Clear Hold & Restore Resource</span>
                    </button>

                    <button
                      onClick={() => handleResolve(incident._id, false)}
                      disabled={submittingId === incident._id}
                      className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 whitespace-nowrap"
                    >
                      Resolve (Keep Hold)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved History */}
      {resolvedIncidents.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Resolved Incident History ({resolvedIncidents.length})
          </h4>
          <div className="space-y-2">
            {resolvedIncidents.map((ri) => (
              <div
                key={ri._id}
                className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between text-slate-400"
              >
                <div>
                  <span className="font-semibold text-slate-300">{ri.resourceName}</span> • {ri.type} ({ri.severity})
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Resolution: "{ri.managerResolutionNotes}" by {ri.resolvedBy}
                  </div>
                </div>
                <span className="text-emerald-400 font-mono text-[11px]">✓ RESOLVED</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
