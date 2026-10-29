import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  Key,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import CheckInOutModal from './CheckInOutModal';

export default function MyBookingsView() {
  const { bookings, conditionLogs, currentUser, cancelBooking } = useDemo();

  const [activeModalBooking, setActiveModalBooking] = useState(null);
  const [modalMode, setModalMode] = useState('checkin');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter bookings for current active user
  const myBookings = bookings.filter((b) => b.userId === currentUser?._id);

  const displayedBookings = myBookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  const handleOpenCheckIn = (booking) => {
    setActiveModalBooking(booking);
    setModalMode('checkin');
  };

  const handleOpenReturn = (booking) => {
    setActiveModalBooking(booking);
    setModalMode('checkout');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            <CalendarCheck className="w-4 h-4" />
            Step 7 & 8: Active Bookings, Check-In & Physical Return
          </div>
          <h2 className="text-2xl font-bold text-white font-['Outfit']">
            My Reservation Lifecycle
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Track real-time status across approval, PIN check-in, and physical return condition audits for <strong className="text-white">{currentUser?.name}</strong>.
          </p>
        </div>

        {/* Quota Widget */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-4 text-xs">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Weekly Quota Meter</div>
            <div className="text-base font-extrabold text-white mt-0.5">
              {currentUser?.weeklyHoursUsed || 0} / {currentUser?.weeklyQuotaHours || 8} hrs
            </div>
          </div>
          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                (currentUser?.weeklyHoursUsed || 0) >= 7 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{
                width: `${Math.min(100, ((currentUser?.weeklyHoursUsed || 0) / (currentUser?.weeklyQuotaHours || 8)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {['ALL', 'APPROVED', 'CHECKED_IN', 'WAITLISTED', 'PENDING', 'RETURNED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              statusFilter === st
                ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {displayedBookings.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-xs">
          No bookings found in category "{statusFilter}". Switch tabs or personas to explore active lifecycle stages.
        </div>
      ) : (
        <div className="space-y-4">
          {displayedBookings.map((b) => {
            const relatedLog = conditionLogs.find((cl) => cl.bookingId === b._id);

            // Badges per status
            let statusPill = (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                PENDING REVIEW
              </span>
            );
            if (b.status === 'APPROVED') {
              statusPill = (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED • READY FOR CHECK-IN
                </span>
              );
            } else if (b.status === 'CHECKED_IN') {
              statusPill = (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" /> CHECKED IN • IN USE
                </span>
              );
            } else if (b.status === 'WAITLISTED') {
              statusPill = (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  WAITLISTED (PRIORITY QUEUE)
                </span>
              );
            } else if (b.status === 'RETURNED') {
              statusPill = (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  RETURNED (COMPLETED)
                </span>
              );
            }

            return (
              <div
                key={b._id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                {/* Left: Booking Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-base font-['Outfit']">
                      {b.resourceName}
                    </span>
                    {statusPill}
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      #{b._id.slice(-6)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic">
                    "{b.purpose}" ({b.projectType} Project)
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {new Date(b.startTime).toLocaleDateString()} • {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({b.durationHours} hrs)
                    </span>

                    {/* Check-In PIN Display */}
                    {b.checkInPin && ['APPROVED', 'CHECKED_IN'].includes(b.status) && (
                      <span className="flex items-center gap-1 bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-mono text-[11px] font-bold">
                        <Key className="w-3 h-3 text-cyan-400" /> PIN: {b.checkInPin}
                      </span>
                    )}

                    <span className="text-slate-500 font-mono text-[11px]">
                      Priority: {b.priorityScore} pts
                    </span>
                  </div>

                  {/* Decision Reason or Explainability Note */}
                  {b.decisionReason && (
                    <div className="text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>{b.decisionReason}</span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2 min-w-[170px]">
                  {/* Step 7 Check-In Action */}
                  {b.status === 'APPROVED' && (
                    <button
                      onClick={() => handleOpenCheckIn(b)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Check In (Step 7)</span>
                    </button>
                  )}

                  {/* Step 8 Return & Inspect Action */}
                  {b.status === 'CHECKED_IN' && (
                    <button
                      onClick={() => handleOpenReturn(b)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Return & Inspect (Step 8)</span>
                    </button>
                  )}

                  {/* Cancel Option for Pending or Approved/Waitlisted */}
                  {['PENDING', 'APPROVED', 'WAITLISTED'].includes(b.status) && (
                    <button
                      onClick={() => cancelBooking(b._id, 'Cancelled by user')}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all text-center"
                    >
                      Cancel Reservation
                    </button>
                  )}

                  {/* View Condition Proof on Returned */}
                  {b.status === 'RETURNED' && relatedLog && (
                    <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono text-center">
                      ✓ Before: {relatedLog.checkInRating} • After: {relatedLog.checkOutRating || 'GOOD'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Check In / Check Out Modal */}
      {activeModalBooking && (
        <CheckInOutModal
          booking={activeModalBooking}
          mode={modalMode}
          conditionLog={conditionLogs.find((cl) => cl.bookingId === activeModalBooking._id)}
          onClose={() => setActiveModalBooking(null)}
        />
      )}
    </div>
  );
}
