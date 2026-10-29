import React from 'react';
import {
  Shield,
  UserCheck,
  RotateCcw,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';

export default function JudgeTopBar() {
  const {
    users,
    currentUser,
    switchUser,
    resetDemoData,
    activeTab,
    setActiveTab,
    loading,
    notifications,
    bookings,
  } = useDemo();

  // 10-Step Lifecycle Mapping to Tabs & Descriptions
  const lifecycleSteps = [
    { num: 1, label: 'List', tab: 'catalog', desc: 'Owner lists resource with risk tiers' },
    { num: 2, label: 'Discover', tab: 'catalog', desc: 'AI Natural-Language search & badges' },
    { num: 3, label: 'Request', tab: 'catalog', desc: 'User submits slot with purpose' },
    { num: 4, label: 'Verify', tab: 'catalog', desc: 'Automated safety badge & quota pre-check' },
    { num: 5, label: 'Review', tab: 'manager-queue', desc: 'Manager evaluates competing requests' },
    { num: 6, label: 'Allocate', tab: 'manager-queue', desc: 'Fair-share score & waitlist promotion' },
    { num: 7, label: 'Check-In', tab: 'my-bookings', desc: 'PIN verification & Before condition log' },
    { num: 8, label: 'Return', tab: 'my-bookings', desc: 'After condition check & quota update' },
    { num: 9, label: 'Incidents', tab: 'incidents', desc: 'Damage diff, AI Advisory & human review' },
    { num: 10, label: 'Audit', tab: 'audit', desc: 'Immutable tamper-evident activity ledger' },
  ];

  // Active step heuristic based on current tab
  const getIsActiveStep = (step) => step.tab === activeTab;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Strip: Brand + Judge Persona Switcher + Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-['Outfit']">
                CampusVault
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Judge Demo Sandbox
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Unlock Underused Equipment & Spaces
            </p>
          </div>
        </div>

        {/* Center: One-Click Judge Persona Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1 hidden md:flex">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Switch Persona:
          </span>

          {users.map((user) => {
            const isSelected = currentUser?._id === user._id;
            let badgeText = '';
            let roleColor = 'text-slate-300';

            if (user.role === 'student') {
              badgeText = 'Student (Score 90)';
              roleColor = isSelected ? 'bg-cyan-500 text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-slate-800';
            } else if (user.role === 'researcher') {
              badgeText = 'Heavy (Score 15)';
              roleColor = isSelected ? 'bg-amber-500 text-slate-950 font-semibold shadow-md' : 'text-slate-300 hover:bg-slate-800';
            } else if (user.role === 'manager') {
              badgeText = 'Manager';
              roleColor = isSelected ? 'bg-indigo-600 text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-slate-800';
            } else {
              badgeText = 'Admin';
              roleColor = isSelected ? 'bg-purple-600 text-white font-semibold shadow-md' : 'text-slate-300 hover:bg-slate-800';
            }

            return (
              <button
                key={user._id}
                onClick={() => switchUser(user)}
                title={`${user.name} • ${user.department} • ${user.weeklyHoursUsed}h used this week`}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 ${roleColor}`}
              >
                <span className="font-medium truncate max-w-[90px] sm:max-w-none">{user.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-80 hidden lg:inline">[{badgeText}]</span>
              </button>
            );
          })}
        </div>

        {/* Right: Reset Demo Data Button & Quota Meter */}
        <div className="flex items-center gap-2">
          {currentUser && (
            <div className="hidden xl:flex items-center gap-2 text-xs bg-slate-950/70 border border-slate-800 px-3 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Quota:</span>
              <span className="font-semibold text-slate-200">
                {currentUser.weeklyHoursUsed} / {currentUser.weeklyQuotaHours || 8}h
              </span>
              <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    currentUser.weeklyHoursUsed >= 7
                      ? 'bg-amber-400'
                      : 'bg-cyan-400'
                  }`}
                  style={{
                    width: `${Math.min(100, (currentUser.weeklyHoursUsed / (currentUser.weeklyQuotaHours || 8)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Reset Demo Data Button */}
          <button
            onClick={resetDemoData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
            title="Reset to clean 10-step demo seed data"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Bottom Strip: 10-Step Interactive Lifecycle Guide */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-1.5 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[780px] gap-1 text-[11px]">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1 pr-2 border-r border-slate-800">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            10-Step Flow:
          </span>

          {lifecycleSteps.map((step, idx) => {
            const isActive = getIsActiveStep(step);
            return (
              <React.Fragment key={step.num}>
                <button
                  onClick={() => setActiveTab(step.tab)}
                  title={step.desc}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {step.num}
                  </span>
                  <span>{step.label}</span>
                </button>
                {idx < lifecycleSteps.length - 1 && (
                  <span className="text-slate-700 font-mono text-[9px] select-none">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </header>
  );
}
