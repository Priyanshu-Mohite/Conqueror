import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Camera,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';

export default function CheckInOutModal({ booking, mode = 'checkin', conditionLog, onClose }) {
  const { checkInBooking, checkOutBooking } = useDemo();

  const isCheckIn = mode === 'checkin';

  // Check-In State
  const [pin, setPin] = useState(booking.checkInPin || '4829');
  const [rating, setRating] = useState('GOOD');
  const [cleanliness, setCleanliness] = useState(true);
  const [calibration, setCalibration] = useState(true);
  const [accessories, setAccessories] = useState(true);
  const [notes, setNotes] = useState(
    isCheckIn
      ? 'Physical integrity verified. All optical/mechanical parts present.'
      : 'Completed fabrication run. Cleaned build plate and workpiece enclosure.'
  );
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
  );

  // Check-Out specific: Damage Flag
  const [damageFlagged, setDamageFlagged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isCheckIn) {
        await checkInBooking(booking._id, {
          pin,
          rating,
          checklist: {
            cleanliness,
            calibration,
            accessoriesComplete: accessories,
          },
          notes,
          photoUrl,
        });
      } else {
        await checkOutBooking(booking._id, {
          rating: damageFlagged ? 'DAMAGED' : rating,
          checklist: {
            cleanliness,
            calibration,
            accessoriesComplete: accessories,
          },
          notes,
          photoUrl,
          damageFlagged,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
          {isCheckIn ? <ShieldCheck className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
          {isCheckIn ? 'Step 7: Physical Check-In & Before Proof' : 'Step 8 & 9: Return Inspection & Condition Diff'}
        </div>

        <h3 className="text-xl font-bold text-white font-['Outfit'] mb-1">
          {isCheckIn ? `Check In: ${booking.resourceName}` : `Return & Inspect: ${booking.resourceName}`}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Booking #{booking._id.slice(-6)} • User: {booking.userName} • Duration: {booking.durationHours}h
        </p>

        {/* Side-by-Side Before Condition Proof on Checkout */}
        {!isCheckIn && conditionLog && (
          <div className="mb-4 p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Info className="w-3.5 h-3.5" /> Verifiable "Before Condition" Recorded at Check-In:
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                {conditionLog.checkInRating}
              </span>
            </div>
            <p className="text-xs text-slate-400 italic">"{conditionLog.checkInNotes}"</p>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-4">
              <span>Cleanliness: {conditionLog.checkInChecklist?.cleanliness ? '✓ Yes' : '✗ No'}</span>
              <span>Calibration: {conditionLog.checkInChecklist?.calibration ? '✓ Yes' : '✗ No'}</span>
              <span>Accessories: {conditionLog.checkInChecklist?.accessoriesComplete ? '✓ Yes' : '✗ No'}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN Verification on Check-In */}
          {isCheckIn && (
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
                <span>Enter 4-Digit Lab Access PIN:</span>
                <span className="text-[10px] text-cyan-400 font-mono">Assigned PIN: {booking.checkInPin || '4829'}</span>
              </label>
              <input
                type="text"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono tracking-widest text-center text-cyan-300 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          )}

          {/* Checkout Return Outcome Choice: Clean vs Damage */}
          {!isCheckIn && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDamageFlagged(false);
                  setRating('GOOD');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  !damageFlagged
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Clean Return (Operational)
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Resource restored to AVAILABLE immediately.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDamageFlagged(true);
                  setRating('DAMAGED');
                  setNotes('Hardware defect/breakage observed during post-use inspection.');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  damageFlagged
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Report Damage / Delay (Hold)
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Triggers Step 9: MAINTENANCE_HOLD & AI Advisory.
                </div>
              </button>
            </div>
          )}

          {/* 3-Toggle Checklist */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-300 mb-1">
              Physical Condition Verification Checklist:
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={cleanliness}
                onChange={(e) => setCleanliness(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-500"
              />
              <span>Physical Integrity Verified (no visible cracks, loose screws, or burns)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={calibration}
                onChange={(e) => setCalibration(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-500"
              />
              <span>Calibration & Safety Guards In Place</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={accessories}
                onChange={(e) => setAccessories(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-500"
              />
              <span>All Standard Accessories & Cables Present in Storage Case</span>
            </label>
          </div>

          {/* Condition Rating Selector */}
          <div>
            <label className="text-[11px] font-medium text-slate-300">Condition Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="MINT">MINT — Factory pristine condition</option>
              <option value="GOOD">GOOD — Normal operational wear</option>
              <option value="MINOR_WEAR">MINOR_WEAR — Cosmetic scratches / dust</option>
              <option value="DAMAGED">DAMAGED — Needs repairs / Maintenance Hold</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-medium text-slate-300">
              {isCheckIn ? 'Initial Check-in Notes' : 'Return Inspection Notes'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Photo URL / Sample Proof Selector */}
          <div>
            <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-cyan-400" /> Verifiable Photo Proof URL
              </span>
              <span className="text-[10px] text-slate-500">Sample photos enabled</span>
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Actions */}
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
              className={`px-5 py-2 rounded-lg text-xs font-semibold text-white shadow-lg transition-all ${
                damageFlagged
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
              }`}
            >
              {submitting
                ? 'Processing...'
                : isCheckIn
                ? 'Confirm Check-In (Set IN_USE)'
                : damageFlagged
                ? 'Submit Return with Incident Report'
                : 'Confirm Clean Return (Set AVAILABLE)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
