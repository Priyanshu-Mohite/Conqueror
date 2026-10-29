import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';

export default function AuditTrailView() {
  const { auditLogs, users, resources, bookings } = useDemo();

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  // Filter audit logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.reason.toLowerCase().includes(search.toLowerCase());

    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  // Calculate Fairness & Anti-Monopolisation Analytics
  const totalHoursUsed = users.reduce((acc, u) => acc + (u.weeklyHoursUsed || 0), 0);
  const waitlistPromotions = auditLogs.filter((l) => l.action === 'WAITLIST_AUTO_PROMOTED').length;
  const verifiedBookings = auditLogs.filter((l) => l.action === 'ELIGIBILITY_VERIFIED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/30 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
            <FileText className="w-4 h-4" />
            Step 10: Immutable Audit Ledger & Fair-Usage Compliance
          </div>
          <h2 className="text-2xl font-bold text-white font-['Outfit']">
            Tamper-Evident Governance Trail & Scorecard
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Every creation, automated pre-check, manager arbitration, check-in proof, and damage diff creates an immutable audit record for institutional compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-mono">Total Ledger Entries: <strong className="text-white">{auditLogs.length}</strong></span>
        </div>
      </div>

      {/* Fairness & Anti-Monopolisation Scorecard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Fair-Usage Allocation</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-['Outfit']">{totalHoursUsed} hrs</div>
          <p className="text-[11px] text-slate-400 mt-1">Aggregated active builder hours</p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Waitlist Auto-Promotions</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 font-['Outfit']">{waitlistPromotions}</div>
          <p className="text-[11px] text-slate-400 mt-1">Zero-downtime slot handovers</p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Automated Pre-Checks</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 font-['Outfit']">{verifiedBookings}</div>
          <p className="text-[11px] text-slate-400 mt-1">Safety credential checks executed</p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Resource Tiers</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-['Outfit']">{resources.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Governed across 3 risk levels</p>
        </div>
      </div>

      {/* Builder Quota Breakdown Visualizer */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Anti-Monopolisation Quota Meter Across Demo Personas:
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Rolling 7-day cap: 8 hrs</span>
        </div>

        <div className="space-y-3 pt-1">
          {users.filter(u => ['student', 'researcher'].includes(u.role)).map((u) => {
            const pct = Math.min(100, ((u.weeklyHoursUsed || 0) / (u.weeklyQuotaHours || 8)) * 100);
            const isNearCap = pct >= 80;

            return (
              <div key={u._id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    {u.name} <span className="text-slate-400 font-normal">({u.department})</span>
                  </span>
                  <span className={`font-mono font-bold ${isNearCap ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {u.weeklyHoursUsed} / {u.weeklyQuotaHours || 8} hrs {isNearCap ? '(Anti-Monopolisation Penalty Active)' : '(High Priority Score)'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isNearCap ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, actor, or reason..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 text-xs">
          {['ALL', 'RESOURCE_LISTED', 'BOOKING_REQUESTED', 'ELIGIBILITY_VERIFIED', 'BOOKING_APPROVED', 'USER_CHECKED_IN', 'RETURNED', 'WAITLIST_AUTO_PROMOTED'].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap font-mono text-[11px] ${
                actionFilter === act
                  ? 'bg-purple-600 text-white font-bold shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {act.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Audit Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Badge</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Explainable Reason & Decision Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLogs.map((log) => {
                // Color badges per action
                let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
                if (log.action.includes('APPROVED') || log.action.includes('PROMOTED')) {
                  badgeClass = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
                } else if (log.action.includes('REQUESTED')) {
                  badgeClass = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
                } else if (log.action.includes('CHECKED_IN')) {
                  badgeClass = 'bg-blue-500/10 text-blue-300 border-blue-500/30';
                } else if (log.action.includes('INCIDENT') || log.action.includes('REJECTED')) {
                  badgeClass = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
                } else if (log.action.includes('VERIFIED')) {
                  badgeClass = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
                }

                return (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      <div className="text-[10px] text-slate-500">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold border ${badgeClass}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{log.actorRole}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-medium text-xs text-slate-200">{log.reason}</div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-[10px] font-mono text-slate-500 mt-1 max-w-xl truncate">
                          Metadata: {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
