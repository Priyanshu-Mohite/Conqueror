import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { useDemo } from '../context/DemoContext';

export default function BookingModal({ resource, onClose }) {
  const { currentUser, createBooking } = useDemo();

  // Tomorrow 10:00 - 12:00 default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(tomorrowDateStr);
  const [startTimeStr, setStartTimeStr] = useState('10:00');
  const [endTimeStr, setEndTimeStr] = useState('12:00');
  const [purpose, setPurpose] = useState('');
  const [projectType, setProjectType] = useState('Academic');
  const [submitting, setSubmitting] = useState(false);

  // Compute live duration
  const startHours = parseInt(startTimeStr.split(':')[0], 10);
  const endHours = parseInt(endTimeStr.split(':')[0], 10);
  const duration = Math.max(1, endHours - startHours);

  // Live priority score preview
  const weeklyHours = currentUser?.weeklyHoursUsed || 0;
  let previewScore = 100;
  const breakdownParts = ['Base: 100'];

  if (weeklyHours > 0) {
    previewScore -= weeklyHours * 10;
    breakdownParts.push(`-${weeklyHours * 10} (${weeklyHours}h used)`);
  } else {
    previewScore += 15;
    breakdownParts.push('+15 (New User)');
  }

  if (currentUser?.lateReturnsCount > 0) {
    previewScore -= currentUser.lateReturnsCount * 25;
    breakdownParts.push(`-${currentUser.lateReturnsCount * 25} (Late Return Penalty)`);
  }

  if (projectType === 'Research' || projectType === 'CapStone') {
    previewScore += 10;
    breakdownParts.push(`+10 (${projectType} Priority)`);
  }

  previewScore = Math.max(5, Math.min(115, previewScore));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    setSubmitting(true);
    try {
      const startDateTime = new Date(`${date}T${startTimeStr}:00`);
      const endDateTime = new Date(`${date}T${endTimeStr}:00`);

      await createBooking({
        resourceId: resource._id,
        startTime: startDateTime,
        endTime: endDateTime,
        purpose,
        projectType,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
          <Calendar className="w-4 h-4" />
          Step 3 & 4: Request & Automated Verification
        </div>

        <h3 className="text-xl font-bold text-white font-['Outfit'] mb-1">
          Book {resource.name}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Location: {resource.location} • Risk Tier: {resource.riskTier} • Max {resource.maxHoursPerBooking}h/booking
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-medium text-slate-300">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-300">Start Time</label>
              <input
                type="time"
                value={startTimeStr}
                onChange={(e) => setStartTimeStr(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-300">End Time</label>
              <input
                type="time"
                value={endTimeStr}
                onChange={(e) => setEndTimeStr(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Project Type */}
          <div>
            <label className="text-[11px] font-medium text-slate-300">Project Category</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Academic">Academic Coursework (Standard)</option>
              <option value="Research">Research Lab Project (+10 Priority Bonus)</option>
              <option value="CapStone">Senior CapStone / Competition (+10 Priority Bonus)</option>
              <option value="Community">Student Club / Community</option>
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="text-[11px] font-medium text-slate-300">Project Purpose & Work Description</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="E.g. Milling lightweight structural bracket for Mars Rover prototype..."
              rows={3}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Live Fair-Share Score Preview Box */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-500/20 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Live Fair-Share Priority Preview
              </span>
              <span className="text-base font-extrabold text-white bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                {previewScore} pts
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {breakdownParts.join(' ')} = {previewScore} pts
            </p>
            <div className="mt-2 text-[10px] text-slate-500">
              * Competing requests for the same slot are allocated based on this score to eliminate tool hoarding.
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all"
            >
              {submitting ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
