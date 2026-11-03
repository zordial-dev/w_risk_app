import React from 'react';

export const MethodologySection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#0E274A] rounded-xl border border-black/[0.06] dark:border-blue-900/40 p-4 sm:p-6 shadow-apple-card space-y-5 text-[13px] transition-colors">
      {/* Table 1: Risk rating reference */}
      <div>
        <div className="text-[11px] font-semibold text-[#86868B] dark:text-[#94A8C4] uppercase tracking-[0.05em] mb-2.5">
          Risk Rating Brackets & System Thresholds
        </div>
        <div className="overflow-x-auto rounded-lg border border-black/[0.06] dark:border-blue-900/40 overflow-hidden">
          <table className="w-full text-center border-collapse text-[12px]">
            <thead>
              <tr className="text-white font-medium">
                <th className="bg-[#0076CE] p-3 text-left font-semibold w-28">Rating</th>
                <th className="bg-[#FF3B30] p-3 font-semibold">High</th>
                <th className="bg-[#FF6420] p-3 font-semibold">High Med</th>
                <th className="bg-[#FF9500] p-3 font-semibold">Medium</th>
                <th className="bg-[#30B0C7] p-3 font-semibold">Low Med</th>
                <th className="bg-[#34C759] p-3 font-semibold">Low</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-[#F5F5F7] dark:bg-[#122C50] font-medium text-[#1D1D1F] dark:text-white">
                <td className="bg-black/[0.04] dark:bg-white/[0.06] p-3 text-left font-semibold text-[#48484A] dark:text-[#AEAEB2]">Score</td>
                <td className="p-3 text-[#FF3B30] dark:text-[#FF453A] font-semibold tabular-nums">9–10</td>
                <td className="p-3 text-[#FF6420] dark:text-[#FF7A45] font-semibold tabular-nums">8</td>
                <td className="p-3 text-[#FF9500] dark:text-[#FF9F0A] font-semibold tabular-nums">5–7</td>
                <td className="p-3 text-[#30B0C7] dark:text-[#64D2FF] font-semibold tabular-nums">4</td>
                <td className="p-3 text-[#34C759] dark:text-[#30D158] font-semibold tabular-nums">1–3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Sub-factor dynamics on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Table 2: COP Dynamics */}
        <div>
          <div className="text-[11px] font-semibold text-[#86868B] dark:text-[#94A8C4] uppercase tracking-[0.05em] mb-2.5">
            Local Code of Practice (COP, 1–5)
          </div>
          <div className="overflow-x-auto rounded-lg border border-black/[0.06] dark:border-blue-900/40 overflow-hidden">
            <table className="w-full text-center border-collapse text-[12px]">
              <thead>
                <tr className="bg-[#F5F5F7] dark:bg-[#122C50] text-[#86868B] dark:text-[#94A8C4] font-semibold border-b border-black/[0.06] dark:border-blue-900/30">
                  <th className="p-3 text-left">Jurisdiction Condition</th>
                  <th className="p-3 w-16">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-blue-900/30 text-left text-[#333336] dark:text-[#E5E5EA]">
                <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"><td className="p-3">Available – up to date (&lt; 4 yrs)</td><td className="p-3 text-center tabular-nums font-semibold text-[#34C759] dark:text-[#30D158]">1</td></tr>
                <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"><td className="p-3">Available – code 4–9 years old</td><td className="p-3 text-center tabular-nums font-semibold text-[#30B0C7] dark:text-[#64D2FF]">2</td></tr>
                <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"><td className="p-3">Available – legacy (10+ years old)</td><td className="p-3 text-center tabular-nums font-semibold text-[#FF9500] dark:text-[#FF9F0A]">3</td></tr>
                <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"><td className="p-3">Not aware / Unverified</td><td className="p-3 text-center tabular-nums font-semibold text-[#FF6420] dark:text-[#FF7A45]">4</td></tr>
                <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"><td className="p-3">No code available</td><td className="p-3 text-center tabular-nums font-semibold text-[#FF3B30] dark:text-[#FF453A]">5</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: CDA Dynamics */}
        <div>
          <div className="text-[11px] font-semibold text-[#86868B] dark:text-[#94A8C4] uppercase tracking-[0.05em] mb-2.5">
            Civil Defence Authority (CDA, 1–5)
          </div>
          <div className="overflow-x-auto rounded-lg border border-black/[0.06] dark:border-blue-900/40 overflow-hidden">
            <table className="w-full text-center border-collapse text-[12px]">
              <thead>
                <tr className="bg-[#F5F5F7] dark:bg-[#122C50] text-[#86868B] dark:text-[#94A8C4] font-semibold border-b border-black/[0.06] dark:border-blue-900/30">
                  <th className="p-3 text-left">Authority Enforcement</th>
                  <th className="p-3 w-16">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05] text-left text-[#333336] dark:text-[#E5E5EA]">
                <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"><td className="p-3">Available (procedures enforced)</td><td className="p-3 text-center tabular-nums font-semibold text-[#34C759] dark:text-[#30D158]">1</td></tr>
                <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"><td className="p-3">Available – partial enforcement</td><td className="p-3 text-center tabular-nums font-semibold text-[#30B0C7] dark:text-[#64D2FF]">2</td></tr>
                <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"><td className="p-3">Available but not followed</td><td className="p-3 text-center tabular-nums font-semibold text-[#FF9500] dark:text-[#FF9F0A]">3</td></tr>
                <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"><td className="p-3">Not aware / Unverified</td><td className="p-3 text-center tabular-nums font-semibold text-[#FF6420] dark:text-[#FF7A45]">4</td></tr>
                <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"><td className="p-3">No authority framework</td><td className="p-3 text-center tabular-nums font-semibold text-[#FF3B30] dark:text-[#FF453A]">5</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
