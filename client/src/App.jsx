import React from 'react';
import { DemoProvider, useDemo } from './context/DemoContext';
import JudgeTopBar from './components/JudgeTopBar';
import CatalogView from './components/CatalogView';
import MyBookingsView from './components/MyBookingsView';
import ManagerQueueView from './components/ManagerQueueView';
import IncidentCenterView from './components/IncidentCenterView';
import AuditTrailView from './components/AuditTrailView';
import {
  Compass,
  CalendarCheck,
  CheckSquare,
  AlertOctagon,
  FileText,
} from 'lucide-react';

function MainAppShell() {
  const { activeTab, setActiveTab, currentUser, incidents, bookings } = useDemo();

  // Pending counts for dynamic badges
  const pendingApprovalsCount = bookings.filter((b) => b.status === 'PENDING').length;
  const activeIncidentsCount = incidents.filter((i) => i.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Inter',sans-serif]">
      {/* Sticky Persistent Judge-First Top Bar */}
      <JudgeTopBar />

      {/* Primary Navigation Sub-Bar (5 Core Tabs) */}
      <nav className="bg-slate-900/60 border-b border-slate-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 py-2">
            <button
              id="tab-catalog"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-slate-800 text-cyan-400 font-semibold shadow-inner border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>1. Explore & Eligibility</span>
            </button>

            <button
              id="tab-my-bookings"
              onClick={() => setActiveTab('my-bookings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'my-bookings'
                  ? 'bg-slate-800 text-cyan-400 font-semibold shadow-inner border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>2. My Bookings & Check-In</span>
            </button>

            <button
              id="tab-manager-queue"
              onClick={() => setActiveTab('manager-queue')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'manager-queue'
                  ? 'bg-slate-800 text-cyan-400 font-semibold shadow-inner border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <span>3. Manager Queue & Fair-Share</span>
              {pendingApprovalsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            <button
              id="tab-incidents"
              onClick={() => setActiveTab('incidents')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'incidents'
                  ? 'bg-slate-800 text-cyan-400 font-semibold shadow-inner border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>4. Incident & Hold Center</span>
              {activeIncidentsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {activeIncidentsCount}
                </span>
              )}
            </button>

            <button
              id="tab-audit"
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'audit'
                  ? 'bg-slate-800 text-cyan-400 font-semibold shadow-inner border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>5. Immutable Audit Trail</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden md:block">
            Logged In: <span className="text-cyan-300 font-medium">{currentUser?.name}</span> ({currentUser?.role})
          </div>
        </div>
      </nav>

      {/* Main Tab View Rendering Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div id="tab-content-area" className="animate-fade-in">
          {activeTab === 'catalog' && <CatalogView />}
          {activeTab === 'my-bookings' && <MyBookingsView />}
          {activeTab === 'manager-queue' && <ManagerQueueView />}
          {activeTab === 'incidents' && <IncidentCenterView />}
          {activeTab === 'audit' && <AuditTrailView />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between px-6 max-w-7xl mx-auto w-full gap-2">
        <span>CampusVault • 10-Step Lifecycle MERN Hackathon Platform</span>
        <span className="font-mono text-[11px] text-slate-400">
          Rule 12 Compliant • Zero Dead Buttons • Complete Audit Trail
        </span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <DemoProvider>
      <MainAppShell />
    </DemoProvider>
  );
}
