import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import BookingModal from './BookingModal';
import OwnerResourceForm from './OwnerResourceForm';
import api from '../api/client';

export default function CatalogView() {
  const { resources, currentUser, verifyBadge } = useDemo();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [onlyEligible, setOnlyEligible] = useState(false);

  // AI Matching Box State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  // Modals
  const [bookingResource, setBookingResource] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const samplePrompts = [
    'Fabricate carbon-fiber drone frame and test motor vibration',
    'High-resolution resin 3D print for miniature medical device',
    'Record 4K multi-camera seminar interview with wireless audio',
  ];

  const handleAiMatch = async (queryText) => {
    const q = queryText || aiPrompt;
    if (!q.trim()) return;

    setAiLoading(true);
    try {
      const res = await api.post('/ai/match', {
        query: q,
        userId: currentUser?._id,
      });
      if (res.data?.success) {
        setAiResults(res.data.result);
      }
    } catch (err) {
      console.error('AI match failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Filter resources
  const filteredResources = resources.filter((res) => {
    // Search query
    const matchQuery =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Category
    const matchCategory = selectedCategory === 'All' || res.category === selectedCategory;

    // Tier
    const matchTier = selectedTier === 'All' || res.riskTier.toString() === selectedTier;

    // Eligibility check
    const userBadges = currentUser?.badges || [];
    const missing = (res.requiredBadges || []).filter((b) => !userBadges.includes(b));
    const isEligible = missing.length === 0;
    const matchEligibility = !onlyEligible || isEligible;

    return matchQuery && matchCategory && matchTier && matchEligibility;
  });

  return (
    <div className="space-y-6">
      {/* Step 1 & 2 Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <Sparkles className="w-4 h-4" />
            Step 1 & 2: Resource Catalog & Smart Eligibility
          </div>
          <h2 className="text-2xl font-bold text-white font-['Outfit']">
            Explore Campus Labs & Makerspaces
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Browse shared fabrication, testing, and media equipment. Eligibility is dynamically verified against your active persona's safety badges and fair-usage quota.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold shadow-md transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-cyan-400" />
          <span>+ List New Resource (Step 1)</span>
        </button>
      </div>

      {/* AI Natural-Language Matcher Box */}
      <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Project-to-Resource Copilot
            </span>
          </div>
          {/* Rule 12 Mandatory Human-in-the-Loop Badge */}
          <span className="text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
            AI Advisory Only — Final Decision Requires Authorized Human Manager Approval
          </span>
        </div>

        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiMatch()}
            placeholder="Type what you want to build (e.g., 'Need to 3D print nylon gears and cut acrylic case')..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
          />
          <button
            onClick={() => handleAiMatch()}
            disabled={aiLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
            <span>{aiLoading ? 'Analyzing...' : 'Match Equipment'}</span>
          </button>
        </div>

        {/* 3 Sample Prompts */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-[11px] text-slate-400 font-medium">Quick Prompts:</span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAiPrompt(prompt);
                handleAiMatch(prompt);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* AI Recommendations Display */}
        {aiResults && (
          <div className="mt-4 pt-4 border-t border-slate-800 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-3">
              <span>Top AI Recommendations for "{aiResults.query}":</span>
              <button
                onClick={() => setAiResults(null)}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear Results
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiResults.matches?.map((match) => {
                const targetRes = resources.find((r) => r._id === match.resourceId);
                return (
                  <div
                    key={match.resourceId}
                    className="p-3.5 bg-slate-950/90 rounded-xl border border-cyan-500/20 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{match.name}</span>
                        <span className="text-xs font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                          {match.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mb-2">{match.matchReason}</p>
                      
                      {match.missingBadges?.length > 0 ? (
                        <div className="text-[10px] text-amber-300 flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 mb-2">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <span>Missing safety qualification: {match.missingBadges.join(', ')}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 mb-2">
                          <CheckCircle className="w-3 h-3" />
                          <span>You hold all required badges for this resource!</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => targetRes && setBookingResource(targetRes)}
                      className="mt-2 w-full py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Proceed to Request Slot (Step 3)</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment, labs, codes..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {['All', 'Fabrication', 'Lab Equipment', 'Media Gear', 'Space'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Risk Tier & Eligibility Toggles */}
        <div className="flex items-center gap-3 text-xs">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Risk Tiers</option>
            <option value="1">Tier 1 (Low)</option>
            <option value="2">Tier 2 (Moderate)</option>
            <option value="3">Tier 3 (High)</option>
          </select>

          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyEligible}
              onChange={(e) => setOnlyEligible(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-cyan-500"
            />
            <span>Eligible for Me</span>
          </label>
        </div>
      </div>

      {/* Resource Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((resource) => {
          const userBadges = currentUser?.badges || [];
          const missing = (resource.requiredBadges || []).filter((b) => !userBadges.includes(b));
          const isEligible = missing.length === 0;

          // Status colors
          let statusBadge = (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              AVAILABLE
            </span>
          );
          if (resource.status === 'IN_USE') {
            statusBadge = (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                IN USE
              </span>
            );
          } else if (resource.status === 'MAINTENANCE_HOLD') {
            statusBadge = (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                MAINTENANCE HOLD
              </span>
            );
          }

          return (
            <div
              key={resource._id}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
            >
              {/* Image banner or fallback header */}
              <div className="h-36 w-full relative bg-slate-950 overflow-hidden">
                <img
                  src={resource.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
                  alt={resource.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {statusBadge}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    resource.riskTier === 3
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : resource.riskTier === 2
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    Tier {resource.riskTier}
                  </span>
                </div>

                <div className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-800">
                  {resource.code}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors font-['Outfit']">
                    {resource.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span>{resource.location}</span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {resource.usageRules}
                  </p>

                  {/* Badges Required */}
                  <div className="mt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Required Safety Credentials:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {resource.requiredBadges?.length > 0 ? (
                        resource.requiredBadges.map((b) => (
                          <span
                            key={b}
                            className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                              userBadges.includes(b)
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {b} {userBadges.includes(b) ? '✓' : ''}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">None (Open access)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Eligibility Pill & Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  {/* Dynamic Eligibility Pill */}
                  {isEligible ? (
                    <div className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>✓ Eligible — All Badges Verified</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {missing.map((missingBadge) => (
                        <button
                          key={missingBadge}
                          onClick={() => verifyBadge(missingBadge)}
                          className="w-full text-[10px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/30 flex items-center justify-between transition-all"
                          title="Click to complete simulated instant safety quiz"
                        >
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Missing: {missingBadge}
                          </span>
                          <span className="underline font-sans">Verify Now →</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Booking Action Button */}
                  <button
                    onClick={() => setBookingResource(resource)}
                    disabled={resource.status === 'MAINTENANCE_HOLD'}
                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      resource.status === 'MAINTENANCE_HOLD'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
                    }`}
                  >
                    <span>
                      {resource.status === 'MAINTENANCE_HOLD'
                        ? 'Under Maintenance Hold'
                        : 'Request Booking (Step 3)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Drawer Modal */}
      {bookingResource && (
        <BookingModal
          resource={bookingResource}
          onClose={() => setBookingResource(null)}
        />
      )}

      {/* List New Resource Modal */}
      {showAddForm && <OwnerResourceForm onClose={() => setShowAddForm(false)} />}
    </div>
  );
}
