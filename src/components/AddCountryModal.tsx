import React, { useState } from 'react';
import { X, Plus, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { BAND_COLORS, COP_DESCRIPTIONS, CDA_DESCRIPTIONS } from '../types/risk';
import { calculateRiskBand, addCountryToFirestore } from '../lib/countryService';

interface AddCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingRegions: string[];
  onSuccess: () => void;
}

export const AddCountryModal: React.FC<AddCountryModalProps> = ({
  isOpen,
  onClose,
  existingRegions,
  onSuccess,
}) => {
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState(existingRegions[0] || 'Middle East');
  const [customRegion, setCustomRegion] = useState('');
  const [isCustomRegion, setIsCustomRegion] = useState(false);
  const [cop, setCop] = useState(2);
  const [cda, setCda] = useState(2);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalScore = cop + cda;
  const band = calculateRiskBand(totalScore);
  const bandStyle = BAND_COLORS[band];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const finalRegion = isCustomRegion ? customRegion.trim() : region.trim();
    const finalCountry = country.trim();

    if (!finalCountry || finalCountry.length < 2) {
      setError('Please provide a valid country name (at least 2 characters).');
      return;
    }
    if (!finalRegion || finalRegion.length < 2) {
      setError('Please select or specify a valid region (at least 2 characters).');
      return;
    }

    setIsSaving(true);
    const res = await addCountryToFirestore({
      country: finalCountry,
      region: finalRegion,
      cop,
      cda,
    });
    setIsSaving(false);

    if (res.success) {
      setCountry('');
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to save jurisdiction record. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0E274A] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-black/[0.08] dark:border-blue-900/40 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06] dark:border-blue-900/30">
          <div>
            <h3 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-white">
              Add New Jurisdiction
            </h3>
            <p className="text-[12px] text-[#86868B] dark:text-[#94A8C4]">
              Record new fire safety risk assessment
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {/* Country Name */}
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] dark:text-[#94A8C4] uppercase tracking-wider mb-1">
              Country Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Netherlands"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-[#F5F5F7] dark:bg-[#15345F] rounded-lg px-3 py-2 text-[13px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] dark:placeholder-[#94A8C4] focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/40 transition"
            />
          </div>

          {/* Region Selection */}
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] dark:text-[#94A8C4] uppercase tracking-wider mb-1">
              Region
            </label>
            {!isCustomRegion ? (
              <div className="relative">
                <select
                  value={region}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomRegion(true);
                    } else {
                      setRegion(e.target.value);
                    }
                  }}
                  className="w-full appearance-none bg-[#F5F5F7] dark:bg-[#15345F] rounded-lg pl-3 pr-9 py-2 text-[13px] text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/40 cursor-pointer transition"
                >
                  {existingRegions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="__custom__">+ Enter Custom Region...</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#86868B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.75} />
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom region..."
                  value={customRegion}
                  onChange={(e) => setCustomRegion(e.target.value)}
                  className="flex-1 bg-[#F5F5F7] dark:bg-[#15345F] rounded-lg px-3 py-2 text-[13px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] dark:placeholder-[#94A8C4] focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] border border-black/[0.06] dark:border-blue-900/40 transition"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomRegion(false)}
                  className="px-2.5 py-1.5 text-[11px] text-[#86868B] hover:text-[#1D1D1F]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Code of Practice (1-5) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[12px] font-medium text-[#1D1D1F] dark:text-white">Local Code of Practice (COP)</span>
              <span className="text-[12px] font-semibold tabular-nums text-[#0076CE] dark:text-[#389BF2]">{cop} / 5</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCop(val)}
                  className={`py-1.5 rounded-md text-[12px] font-semibold transition ${
                    cop === val
                      ? 'bg-[#0076CE] text-white shadow-xs font-semibold'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#86868B] dark:text-[#94A8C4] hover:text-[#1D1D1F] dark:hover:text-white'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-[#86868B] dark:text-[#94A8C4] mt-1">
              {COP_DESCRIPTIONS[cop]}
            </div>
          </div>

          {/* Civil Defence Authority (1-5) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[12px] font-medium text-[#1D1D1F] dark:text-white">Civil Defence Authority (CDA)</span>
              <span className="text-[12px] font-semibold tabular-nums text-[#0076CE] dark:text-[#389BF2]">{cda} / 5</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCda(val)}
                  className={`py-1.5 rounded-md text-[12px] font-semibold transition ${
                    cda === val
                      ? 'bg-[#0076CE] text-white shadow-xs font-semibold'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#86868B] dark:text-[#94A8C4] hover:text-[#1D1D1F] dark:hover:text-white'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-[#86868B] dark:text-[#98989D] mt-1">
              {CDA_DESCRIPTIONS[cda]}
            </div>
          </div>

          {/* Live Calculated Score & Band Preview */}
          <div className="p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#86868B]">Calculated Risk Rating:</span>
              <div className="text-[18px] font-semibold tabular-nums text-[#1D1D1F] dark:text-white">
                {totalScore} <span className="text-[12px] font-normal text-[#86868B]">/ 10</span>
              </div>
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-[12px] font-medium"
              style={{
                backgroundColor: bandStyle.bg,
                color: bandStyle.text,
                border: `1px solid ${bandStyle.border}`,
              }}
            >
              {bandStyle.label} Risk
            </span>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center gap-2 text-[#FF3B30] text-[12px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-black/[0.06] dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-[#0076CE] hover:bg-[#0067B8] text-white text-[12px] font-semibold transition disabled:opacity-40 flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,118,206,0.25)] active:scale-[0.99]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Jurisdiction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
