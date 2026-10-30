import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Camera,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Video,
  Link as LinkIcon,
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

  // Photo Proof State
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
  );
  const [photoSource, setPhotoSource] = useState('preset'); // 'upload' | 'camera' | 'preset' | 'url'
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Check-Out specific: Damage Flag
  const [damageFlagged, setDamageFlagged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Cleanup camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError('');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    setIsCameraOpen(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Live webcam access failed or unavailable:', err);
      setCameraError('Camera permission denied or camera unavailable. You can click photo using your device camera below:');
      // Fallback: trigger native camera input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoUrl(dataUrl);
    setPhotoSource('camera');
    stopCamera();
  };

  const processImageFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1024;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoUrl(compressedBase64);
        setPhotoSource('upload');
        stopCamera();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

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
      stopCamera();
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
          onClick={() => {
            stopCamera();
            onClose();
          }}
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
                  setPhotoUrl('https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=600&q=80');
                  setPhotoSource('preset');
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

          {/* VERIFIABLE PHOTO PROOF: UPLOAD / CLICK / SAMPLE */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Verifiable Equipment Photo Proof</span>
              </label>
              {photoUrl && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  ✓ Photo Proof Attached
                </span>
              )}
            </div>

            {/* Hidden native inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processImageFile(e.target.files[0]);
                }
              }}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processImageFile(e.target.files[0]);
                }
              }}
            />

            {/* LIVE CAMERA VIEWFINDER */}
            {isCameraOpen ? (
              <div className="relative rounded-xl overflow-hidden bg-black border-2 border-cyan-500/50 p-2 space-y-2">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-h-56 rounded-lg object-cover bg-black"
                />
                <div className="flex items-center justify-between gap-2 px-1">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/30"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Click / Capture Snapshot</span>
                  </button>
                </div>
              </div>
            ) : photoUrl ? (
              /* PHOTO PREVIEW CARD */
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 group">
                  <img
                    src={photoUrl}
                    alt="Condition Proof Preview"
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end justify-between p-3">
                    <span className="text-[11px] font-medium text-white flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      {photoSource === 'upload'
                        ? 'Uploaded from Device'
                        : photoSource === 'camera'
                        ? 'Captured via Live Camera'
                        : photoSource === 'preset'
                        ? 'Verification Lab Preset'
                        : 'Web Evidence Proof'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl('');
                        setPhotoSource('');
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white text-xs transition-colors"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Change photo buttons */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-medium transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Retake / Click Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload Different Image</span>
                  </button>
                </div>
              </div>
            ) : (
              /* NO PHOTO: UPLOAD / CAMERA DROPZONE */
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-5 text-center bg-slate-900/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Attach Physical Condition Evidence</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Upload from file or take a live photo using your camera
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo (Camera)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Upload Photo File</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="text-[11px] text-amber-400 flex items-center justify-between p-2 rounded bg-amber-500/10 border border-amber-500/20">
                <span>{cameraError}</span>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="underline font-bold text-amber-300 ml-2"
                >
                  Open Device Camera
                </button>
              </div>
            )}

            {/* Quick Presets & URL Accordion */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Quick Demo Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80');
                    setPhotoSource('preset');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline text-[10px]"
                >
                  Clean Machine
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUrl('https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=600&q=80');
                    setPhotoSource('preset');
                  }}
                  className="text-rose-400 hover:text-rose-300 underline text-[10px]"
                >
                  Wear / Damaged
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showUrlInput ? 'Hide URL' : 'Enter URL'}</span>
              </button>
            </div>

            {showUrlInput && (
              <div className="pt-1 animate-fade-in">
                <input
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  value={photoUrl}
                  onChange={(e) => {
                    setPhotoUrl(e.target.value);
                    setPhotoSource('url');
                  }}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono text-[10px] focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
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
