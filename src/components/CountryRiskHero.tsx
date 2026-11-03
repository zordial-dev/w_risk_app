import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CountryRiskRecord, BAND_COLORS, COP_DESCRIPTIONS, CDA_DESCRIPTIONS } from '../types/risk';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Building2, 
  Edit3, 
  Check, 
  Loader2, 
  Power, 
  X,
  Compass,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateCountryInFirestore, toggleCountryDisabled } from '../lib/countryService';

interface CountryRiskHeroProps {
  data: CountryRiskRecord[];
  selectedCountry: CountryRiskRecord;
  onSelectCountry: (country: CountryRiskRecord) => void;
}

export const CountryRiskHero: React.FC<CountryRiskHeroProps> = ({
  data,
  selectedCountry,
  onSelectCountry,
}) => {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('All');
  const [isEditing, setIsEditing] = useState(false);
  const [editCop, setEditCop] = useState(selectedCountry.cop);
  const [editCda, setEditCda] = useState(selectedCountry.cda);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingDisabled, setIsTogglingDisabled] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditCop(selectedCountry.cop);
    setEditCda(selectedCountry.cda);
    setIsEditing(false);
  }, [selectedCountry]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const regions = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.region))).sort();
  }, [data]);

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = search.toLowerCase().trim();
    return data.filter((item) => {
      const matchRegion = selectedRegionFilter === 'All' || item.region === selectedRegionFilter;
      const matchQuery = !q || item.country.toLowerCase().includes(q) || item.region.toLowerCase().includes(q);
      return matchRegion && matchQuery;
    });
  }, [data, search, selectedRegionFilter]);

  // Stepper previous / next country navigation
  const currentIndex = useMemo(() => {
    return data.findIndex((c) => c.id === selectedCountry.id);
  }, [data, selectedCountry.id]);

  const handlePrev = () => {
    if (data.length === 0) return;
    const prevIdx = (currentIndex - 1 + data.length) % data.length;
    onSelectCountry(data[prevIdx]);
  };

  const handleNext = () => {
    if (data.length === 0) return;
    const nextIdx = (currentIndex + 1) % data.length;
    onSelectCountry(data[nextIdx]);
  };

  const band = BAND_COLORS[selectedCountry.band];
  const barPercent = Math.max(10, (selectedCountry.score / 10) * 100);

  return (
    <div className="bg-white dark:bg-[#0E274A] rounded-xl border border-black/[0.08] dark:border-blue-900/40 p-4 sm:p-6 shadow-xs transition-colors space-y-4">
      {/* 1. TOP HEADER: TITLE & JURISDICTION COUNTER */}
      <div className="flex items-center justify-between pb-2.5 sm:pb-3.5 border-b border-black/[0.06] dark:border-blue-900/30 gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] sm:text-[19px] font-semibold text-[#1D1D1F] dark:text-white tracking-tight truncate">
              Fire Safety Assessment
            </h2>
            {selectedCountry.disabled && (
              <span className="text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-full bg-[#FF9500]/10 text-[#FF9500] font-semibold shrink-0">
                Disabled
              </span>
            )}
          </div>
          <p className="text-[12px] text-[#86868B] dark:text-[#94A8C4] mt-0.5 truncate hidden sm:block">
            Dual-factor risk rating based on Code of Practice (COP) & Civil Defence (CDA)
          </p>
          <p className="text-[11px] text-[#86868B] dark:text-[#94A8C4] mt-0.5 truncate sm:hidden">
            Dual-factor risk rating
          </p>
        </div>

        {/* Stepper Navigation: Never wraps, strictly single-line */}
        <div className="flex items-center shrink-0 bg-black/[0.03] dark:bg-white/[0.05] p-0.5 rounded-lg border border-black/[0.04] dark:border-blue-900/30 whitespace-nowrap">
          <button
            onClick={handlePrev}
            title="Previous Country"
            className="p-1 rounded-md text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-white dark:hover:bg-[#15345F] transition shadow-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-semibold tabular-nums text-[#1D1D1F] dark:text-white px-1.5 whitespace-nowrap">
            {currentIndex + 1} <span className="text-[#86868B] dark:text-[#94A8C4] font-normal">/ {data.length}</span>
          </span>
          <button
            onClick={handleNext}
            title="Next Country"
            className="p-1 rounded-md text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-white dark:hover:bg-[#15345F] transition shadow-xs"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. REVOLUTIONARY QUICK FINDER & SELECTION BAR */}
      <div ref={searchContainerRef} className="relative z-20 space-y-2">
        {/* Spotlight-Style Search Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search countries (e.g. France, Kenya, Bahrain)..."
            value={search}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsSearchFocused(true);
            }}
            className="w-full bg-[#FAFBFD] dark:bg-[#122C50] border border-black/[0.08] dark:border-blue-900/40 rounded-xl pl-10 pr-9 py-2.5 text-[13px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] transition shadow-xs"
          />
          {search ? (
            <button
              onClick={() => {
                setSearch('');
                setIsSearchFocused(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-[11px] text-[#86868B]">
              <Compass className="w-3.5 h-3.5 text-[#0076CE] dark:text-[#389BF2]" />
              <ChevronDown className="w-3 h-3 text-[#86868B]" />
            </div>
          )}
        </div>

        {/* Region Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
          {['All', ...regions].map((r) => {
            const isSelected = selectedRegionFilter === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setSelectedRegionFilter(r);
                  setIsSearchFocused(true);
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#0076CE] text-white shadow-xs font-semibold'
                    : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#86868B] dark:text-[#94A8C4] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* Floating Apple-Style Results List */}
        {isSearchFocused && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#0E274A] border border-black/[0.08] dark:border-blue-900/40 rounded-xl shadow-2xl overflow-hidden divide-y divide-black/[0.04] dark:divide-blue-900/30 max-h-72 overflow-y-auto animate-fade-in">
            {searchResults.length === 0 ? (
              <div className="py-6 text-center text-[12px] text-[#86868B]">
                No jurisdictions matching "{search}"
              </div>
            ) : (
              searchResults.map((item) => {
                const isItemActive = item.id === selectedCountry.id;
                const bStyle = BAND_COLORS[item.band];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectCountry(item);
                      setIsSearchFocused(false);
                      setSearch('');
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-[13px] flex items-center justify-between transition ${
                      isItemActive
                        ? 'bg-[#0076CE]/[0.08] dark:bg-[#0076CE]/[0.18] text-[#0076CE] dark:text-[#389BF2] font-semibold'
                        : 'hover:bg-black/[0.025] dark:hover:bg-white/[0.04] text-[#1D1D1F] dark:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="font-semibold truncate flex items-center gap-2">
                        <span>{item.country}</span>
                        {item.disabled && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF9500]/10 text-[#FF9500]">
                            Disabled
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#86868B] dark:text-[#98989D] mt-0.5">
                        {item.region} • COP: {item.cop}/5 • CDA: {item.cda}/5
                      </div>
                    </div>

                    <span
                      className="font-semibold text-[11px] px-2.5 py-1 rounded-md border tabular-nums shrink-0"
                      style={{
                        backgroundColor: bStyle.bg,
                        color: bStyle.text,
                        borderColor: bStyle.border,
                      }}
                    >
                      {item.score}/10 {bStyle.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 3. ACTIVE JURISDICTION HERO & METER */}
      <div className="pt-2">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <span className="text-[12px] text-[#86868B] dark:text-[#98989D] block font-medium uppercase tracking-wider">
              {selectedCountry.region}
            </span>
            <div className="flex items-baseline gap-2.5 mt-0.5">
              <h1 className="text-[26px] sm:text-[34px] font-semibold text-[#1D1D1F] dark:text-white tracking-tight leading-tight truncate">
                {selectedCountry.country}
              </h1>
            </div>
          </div>

          <span
            className="px-3 py-1 rounded-full text-[12px] font-semibold border shrink-0 tracking-wide mt-1 shadow-2xs"
            style={{
              backgroundColor: band.bg,
              color: band.text,
              borderColor: band.border,
            }}
          >
            {selectedCountry.band} Risk
          </span>
        </div>

        {/* Deactivated Jurisdiction Notice Banner */}
        {selectedCountry.disabled && (
          <div className="my-3 p-3.5 rounded-xl bg-[#FF9500]/10 border border-[#FF9500]/25 flex items-start gap-2.5 text-[#FF9500]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-[12px] leading-relaxed">
              <span className="font-semibold">Deactivated Jurisdiction:</span> This country is marked as disabled by corporate risk administration. Risk assessment ratings are temporarily inactive for this territory.
            </div>
          </div>
        )}

        {/* Score Number Display */}
        <div className="flex items-baseline gap-1.5 my-1.5">
          <span className="text-[40px] sm:text-[48px] font-semibold text-[#1D1D1F] dark:text-white tabular-nums tracking-tight leading-none">
            {selectedCountry.score}
          </span>
          <span className="text-[15px] sm:text-[16px] text-[#86868B] dark:text-[#98989D] tabular-nums font-normal">/ 10</span>
        </div>

        {/* Apple Dynamic Gradient/Meter Bar */}
        <div className="w-full bg-black/[0.05] dark:bg-white/[0.08] h-2 rounded-full overflow-hidden my-3">
          <div
            className="h-full rounded-full transition-all duration-400 ease-out"
            style={{
              width: `${barPercent}%`,
              backgroundColor: band.accent,
            }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-[#86868B] dark:text-[#98989D] font-normal mb-5">
          <span>Low (1–3)</span>
          <span>Low-Med (4)</span>
          <span>Medium (5–7)</span>
          <span>High-Med (8)</span>
          <span>High (9–10)</span>
        </div>

        {/* 4. DUAL-FACTOR SUB-SCORES & ADMIN LIVE EDITOR */}
        <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[11px] font-semibold text-[#86868B] dark:text-[#8E8E93] uppercase tracking-[0.05em]">
              Assessment Dynamics
            </div>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-[11px] font-medium text-[#0076CE] dark:text-[#389BF2] hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" strokeWidth={1.75} />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Scores (Admin)'}</span>
              </button>
            )}
          </div>

          {isEditing && currentUser?.role === 'admin' ? (
            <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-3 mb-2 animate-fade-in">
              {/* COP Edit */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] font-medium text-[#1D1D1F] dark:text-white">Local Code of Practice (COP)</span>
                  <span className="text-[12px] font-semibold tabular-nums text-[#0076CE] dark:text-[#389BF2]">{editCop} / 5</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setEditCop(val)}
                      className={`py-1.5 rounded-md text-[12px] font-semibold transition ${
                        editCop === val
                          ? 'bg-[#0076CE] text-white shadow-xs font-semibold'
                          : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#86868B] dark:text-[#94A8C4] hover:text-[#1D1D1F] dark:hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-[#86868B] dark:text-[#94A8C4] mt-1">
                  {COP_DESCRIPTIONS[editCop]}
                </div>
              </div>

              {/* CDA Edit */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] font-medium text-[#1D1D1F] dark:text-white">Civil Defence Authority (CDA)</span>
                  <span className="text-[12px] font-semibold tabular-nums text-[#0076CE] dark:text-[#389BF2]">{editCda} / 5</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setEditCda(val)}
                      className={`py-1.5 rounded-md text-[12px] font-semibold transition ${
                        editCda === val
                          ? 'bg-[#0076CE] text-white shadow-xs font-semibold'
                          : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#86868B] dark:text-[#94A8C4] hover:text-[#1D1D1F] dark:hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-[#86868B] dark:text-[#94A8C4] mt-1">
                  {CDA_DESCRIPTIONS[editCda]}
                </div>
              </div>

              {/* Edit Bottom Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-black/[0.04] dark:border-blue-900/40">
                <button
                  type="button"
                  disabled={isTogglingDisabled}
                  onClick={async () => {
                    setIsTogglingDisabled(true);
                    const nextState = !selectedCountry.disabled;
                    const success = await toggleCountryDisabled(selectedCountry.id, nextState);
                    setIsTogglingDisabled(false);
                    if (success) {
                      setIsEditing(false);
                    } else {
                      alert('Unable to update jurisdiction status. Please check your network and permissions.');
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 disabled:opacity-50 ${
                    selectedCountry.disabled
                      ? 'bg-[#34C759]/10 text-[#248A3D] dark:text-[#30D158] hover:bg-[#34C759]/20'
                      : 'bg-[#FF9500]/10 text-[#FF9500] hover:bg-[#FF9500]/20'
                  }`}
                >
                  {isTogglingDisabled ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Power className="w-3 h-3" strokeWidth={2} />
                  )}
                  <span>{selectedCountry.disabled ? 'Enable Jurisdiction' : 'Disable Jurisdiction'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-md text-[12px] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={async () => {
                      if (editCop < 1 || editCop > 5 || editCda < 1 || editCda > 5) {
                        alert('COP and CDA scores must be valid values between 1 and 5.');
                        return;
                      }
                      setIsSaving(true);
                      const success = await updateCountryInFirestore(selectedCountry.id, editCop, editCda);
                      setIsSaving(false);
                      if (success) {
                        setIsEditing(false);
                      } else {
                        alert('Unable to save changes. Please check your network and permissions.');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-md text-[12px] font-semibold bg-[#0076CE] hover:bg-[#0067B8] text-white transition flex items-center gap-1.5 shadow-xs"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06] rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] overflow-hidden">
              {/* Factor 1: Local Code of Practice */}
              <div className="p-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-medium text-[13px] text-[#1D1D1F] dark:text-white">
                    <BookOpen className="w-4 h-4 text-[#86868B] dark:text-[#8E8E93] shrink-0" strokeWidth={1.75} />
                    <span>Local Code (COP)</span>
                  </div>
                  <div className="text-[12px] text-[#86868B] dark:text-[#98989D] pl-6 mt-0.5 leading-snug">
                    {COP_DESCRIPTIONS[selectedCountry.cop]}
                  </div>
                </div>
                <div className="text-right shrink-0 pt-0.5">
                  <span className="font-semibold text-[14px] tabular-nums text-[#1D1D1F] dark:text-white">
                    {selectedCountry.cop}
                  </span>
                  <span className="text-[11px] text-[#86868B] dark:text-[#98989D]"> / 5</span>
                </div>
              </div>

              {/* Factor 2: Civil Defence Authority */}
              <div className="p-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-medium text-[13px] text-[#1D1D1F] dark:text-white">
                    <Building2 className="w-4 h-4 text-[#86868B] dark:text-[#8E8E93] shrink-0" strokeWidth={1.75} />
                    <span>Civil Defence (CDA)</span>
                  </div>
                  <div className="text-[12px] text-[#86868B] dark:text-[#98989D] pl-6 mt-0.5 leading-snug">
                    {CDA_DESCRIPTIONS[selectedCountry.cda]}
                  </div>
                </div>
                <div className="text-right shrink-0 pt-0.5">
                  <span className="font-semibold text-[14px] tabular-nums text-[#1D1D1F] dark:text-white">
                    {selectedCountry.cda}
                  </span>
                  <span className="text-[11px] text-[#86868B] dark:text-[#98989D]"> / 5</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
