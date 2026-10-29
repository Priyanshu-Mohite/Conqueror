import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';

export default function ManagerQueueView() {
  const { bookings, decideBooking, currentUser } = useDemo();

  const [decisionNotes, setDecisionNotes] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  // Group pending bookings
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');

  // Identify competing requests (same resource and overlapping time)
  const competingGroups = [];
  const processedIds = new Set();

  pendingBookings.forEach((b1) => {
    if (processedIds.has(b1._id)) return;
    const group = [b1];

    pendingBookings.forEach((b2) => {
      if (b1._id !== b2._id && b1.resourceId === b2.resourceId) {
        const s1 = new Date(b1.startTime);
        const e1 = new Date(b1.endTime);
        const s2 = new Date(b2.startTime);
        const e2 = new Date(b2.endTime);

        if (s1 < e2 && e1 > s2) {
          group.push(b2);
          processedIds.add(b2._id);
        }
      }
    });

    if (group.length > 1) {
      processedIds.add(b1._id);
      // Sort group descending by priorityScore
      group.sort((a, b) => b.priorityScore - a.priorityScore);
      competingGroups.push(group);
    }
  });

  // Non-competing pending bookings
  const standalonePending = pendingBookings.filter((b) => !processedIds.has(b._id));

  const handleDecision = async (booking, decision) => {
    setSubmittingId(booking._id);
    const customReason = decisionNotes[booking._id];
    let defaultReason = '';

    if (decision === 'APPROVED') {
      defaultReason = `Approved based on superior Fair-Share Priority Score (${booking.priorityScore} pts) and verified safety credentials.`;
    } else if (decision === 'WAITLISTED') {
      defaultReason = `Placed on priority waitlist. Higher priority applicant allocated primary slot.`;
    } else {
      defaultReason = `Declined due to schedule conflict or fair-usage quota limit.`;
    }

    try {
      await decideBooking(booking._id, decision, customReason || defaultReason);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <CheckSquare className="w-4 h-4" />
            Step 5 & 6: Manager Queue & Anti-Monopolisation Fair-Allocation
          </div>
          <h2 className="text-2xl font-bold text-white font-['Outfit']">
            Manager Review & Competing Slot Arbiter
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Resolve simultaneous requests with explainable algorithmic priority scoring. Anti-monopolisation penalties automatically deprioritize heavy users in favor of first-time student builders.
          </p>
        </div>

        <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Pending Decisions: <strong className="text-white">{pendingBookings.length}</strong></span>
        </div>
      </div>

      {/* Competing Requests Comparison Section */}
      {competingGroups.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Competing Requests Detected for Prime Slot (Instant Arbitration Demo):
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Auto-Waitlist Rule Active
            </span>
          </div>

          {competingGroups.map((group, gIdx) => (
            <div
              key={gIdx}
              className="bg-slate-900/90 border-2 border-amber-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-extrabold text-white font-['Outfit']">
                    Slot Contestation on: {group[0].resourceName}
                  </span>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {new Date(group[0].startTime).toLocaleDateString()} • {new Date(group[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(group[0].endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 font-semibold">
                  {group.length} Builders Competing
                </div>
              </div>

              {/* Side-by-Side Cards Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.map((booking, bIdx) => {
                  const isTopScore = bIdx === 0;
                  return (
                    <div
                      key={booking._id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        isTopScore
                          ? 'bg-cyan-950/30 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <div>
                        {/* Header: User & Priority Score */}
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              <User className="w-4 h-4 text-slate-400" />
                              {booking.userName}
                            </div>
                            <span className="text-[11px] text-slate-400 capitalize">
                              {booking.userDepartment}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className={`text-base font-extrabold px-2.5 py-0.5 rounded-lg border font-mono ${
                              isTopScore
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {booking.priorityScore} pts
                            </span>
                            <div className="text-[9px] text-slate-400 mt-0.5">
                              {isTopScore ? '★ Recommended Allocatee' : 'Lower Fair-Usage Score'}
                            </div>
                          </div>
                        </div>

                        {/* Explainable Score Breakdown */}
                        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-300 mb-3">
                          {booking.priorityBreakdown}
                        </div>

                        {/* Project Purpose */}
                        <div className="text-xs text-slate-300 mb-3">
                          <strong className="text-slate-400">Purpose:</strong> "{booking.purpose}"
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {booking.projectType}
                          </span>
                        </div>

                        {/* Verification Badges */}
                        <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center font-medium mb-4">
                          <span className={`px-2 py-1 rounded border ${
                            booking.verificationSummary?.hasRequiredBadges
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}>
                            {booking.verificationSummary?.hasRequiredBadges ? '✓ Badges OK' : '✗ Missing Badge'}
                          </span>

                          <span className={`px-2 py-1 rounded border ${
                            booking.verificationSummary?.withinQuota
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}>
                            {booking.verificationSummary?.withinQuota ? '✓ In Quota' : '⚠ Near Quota'}
                          </span>

                          <span className="px-2 py-1 rounded border bg-amber-500/10 text-amber-300 border-amber-500/30">
                            ⚠ Overlap Confirmed
                          </span>
                        </div>
                      </div>

                      {/* Decision Controls */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <input
                          type="text"
                          placeholder="Custom manager reasoning (optional)..."
                          value={decisionNotes[booking._id] || ''}
                          onChange={(e) =>
                            setDecisionNotes({ ...decisionNotes, [booking._id]: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleDecision(booking, 'APPROVED')}
                            disabled={submittingId === booking._id}
                            className="py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => handleDecision(booking, 'WAITLISTED')}
                            disabled={submittingId === booking._id}
                            className="py-1.5 rounded-lg text-xs font-semibold bg-purple-600/80 hover:bg-purple-600 text-white shadow-md transition-all flex items-center justify-center gap-1"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Waitlist</span>
                          </button>

                          <button
                            onClick={() => handleDecision(booking, 'REJECTED')}
                            disabled={submittingId === booking._id}
                            className="py-1.5 rounded-lg text-xs font-semibold bg-rose-600/80 hover:bg-rose-600 text-white shadow-md transition-all flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standalone Pending Requests */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Other Pending Booking Requests ({standalonePending.length})</span>
        </h3>

        {standalonePending.length === 0 && competingGroups.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No pending requests in queue! All campus reservations are currently arbitrated.
          </div>
        ) : (
          <div className="space-y-3">
            {standalonePending.map((booking) => (
              <div
                key={booking._id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{booking.resourceName}</span>
                    <span className="text-xs text-slate-400">by {booking.userName}</span>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {booking.priorityScore} pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 italic">"{booking.purpose}"</p>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                    <span>{new Date(booking.startTime).toLocaleDateString()} • {booking.durationHours} hrs</span>
                    <span className="text-slate-500 font-mono">{booking.priorityBreakdown}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecision(booking, 'APPROVED')}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(booking, 'REJECTED')}
                    className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-rose-300 border border-slate-800 hover:bg-slate-800"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
