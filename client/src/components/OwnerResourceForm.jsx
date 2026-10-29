import React, { useState } from 'react';
import { X, PlusCircle, ShieldAlert, Layers } from 'lucide-react';
import { useDemo } from '../context/DemoContext';

export default function OwnerResourceForm({ onClose }) {
  const { listResource } = useDemo();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Fabrication');
  const [location, setLocation] = useState('');
  const [riskTier, setRiskTier] = useState(2);
  const [requiredBadgesInput, setRequiredBadgesInput] = useState('MAKER_BASIC');
  const [requiresSupervision, setRequiresSupervision] = useState(false);
  const [securityDeposit, setSecurityDeposit] = useState(0);
  const [maxHoursPerBooking, setMaxHoursPerBooking] = useState(3);
  const [maxWeeklyHoursPerUser, setMaxWeeklyHoursPerUser] = useState(6);
  const [usageRules, setUsageRules] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const badges = requiredBadgesInput
      .split(',')
      .map((b) => b.trim().toUpperCase())
      .filter((b) => b.length > 0);

    const success = await listResource({
      name,
      code: code || `RES-${Math.floor(100 + Math.random() * 900)}`,
      category,
      location,
      riskTier: Number(riskTier),
      requiredBadges: badges,
      requiresSupervision,
      securityDeposit: Number(securityDeposit),
      maxHoursPerBooking: Number(maxHoursPerBooking),
      maxWeeklyHoursPerUser: Number(maxWeeklyHoursPerUser),
      usageRules: usageRules || 'Standard laboratory operation guidelines apply.',
    });

    setSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
          <PlusCircle className="w-4 h-4" />
          Step 1: Resource Onboarding & Governance
        </div>

        <h3 className="text-xl font-bold text-white font-['Outfit'] mb-1">
          List Institutional Resource
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Add campus equipment or shared workspace with risk tiers and access rules.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-300">Resource Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Stratasys F370 3D Printer"
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-300">Inventory Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. FAB-STRAT-01"
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 uppercase"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Fabrication">Fabrication</option>
                <option value="Lab Equipment">Lab Equipment</option>
                <option value="Media Gear">Media Gear</option>
                <option value="Space">Space</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-300">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Makerspace Bay C, Room 104"
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-300">Risk Tier</label>
              <select
                value={riskTier}
                onChange={(e) => setRiskTier(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={1}>Tier 1 (Low Risk - Auto-Verifiable)</option>
                <option value={2}>Tier 2 (Moderate Risk - Safety Badge Required)</option>
                <option value={3}>Tier 3 (High Risk - Supervised / High Voltage)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-300">Security Deposit (₹)</label>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300">Required Safety Badges (comma-separated)</label>
            <input
              type="text"
              value={requiredBadgesInput}
              onChange={(e) => setRequiredBadgesInput(e.target.value)}
              placeholder="e.g. 3D_PRINT_PRO, LASER_SAFETY"
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-300">Max Hours / Booking</label>
              <input
                type="number"
                value={maxHoursPerBooking}
                onChange={(e) => setMaxHoursPerBooking(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                min={1}
                max={12}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-300">Max Weekly Hours / User</label>
              <input
                type="number"
                value={maxWeeklyHoursPerUser}
                onChange={(e) => setMaxWeeklyHoursPerUser(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                min={1}
                max={20}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="supervisionCheck"
              checked={requiresSupervision}
              onChange={(e) => setRequiresSupervision(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
            />
            <label htmlFor="supervisionCheck" className="text-xs text-slate-300">
              Requires Staff Supervision during operation
            </label>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300">Usage Rules & Safety Protocols</label>
            <textarea
              value={usageRules}
              onChange={(e) => setUsageRules(e.target.value)}
              placeholder="e.g. Wear protective goggles. Perform dry run before starting spindle."
              rows={2}
              className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

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
              {submitting ? 'Listing...' : 'List Resource in Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
