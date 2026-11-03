import React, { useState, useMemo } from 'react';
import { CountryRiskRecord, BAND_COLORS } from '../types/risk';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Download, 
  Plus, 
  FileSpreadsheet, 
  Trash2, 
  Power, 
  ArrowUpDown,
  Loader2,
  Pencil
} from 'lucide-react';
import { toggleCountryDisabled, deleteCountryFromFirestore } from '../lib/countryService';
import { exportCountriesToExcel } from '../lib/excelService';
import { AddCountryModal } from './AddCountryModal';
import { EditCountryModal } from './EditCountryModal';
import { ExcelUploadModal } from './ExcelUploadModal';

interface CountryDirectoryProps {
  data: CountryRiskRecord[];
  onSelectCountry: (country: CountryRiskRecord) => void;
  selectedCountryId?: string;
  onRefreshData?: () => void;
}

type SortField = 'country' | 'region' | 'cop' | 'cda' | 'score';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'ALL' | 'ACTIVE' | 'DISABLED';

export const CountryDirectory: React.FC<CountryDirectoryProps> = ({
  data,
  onSelectCountry,
  selectedCountryId,
  onRefreshData,
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('country');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryRiskRecord | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const regions = useMemo(() => {
    return ['All', ...Array.from(new Set(data.map((d) => d.region))).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchRegion = selectedRegion === 'All' || item.region === selectedRegion;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && !item.disabled) ||
        (statusFilter === 'DISABLED' && Boolean(item.disabled));
      const matchSearch =
        search === '' ||
        item.country.toLowerCase().includes(search.toLowerCase()) ||
        item.region.toLowerCase().includes(search.toLowerCase());
      return matchRegion && matchSearch && matchStatus;
    });
  }, [data, selectedRegion, statusFilter, search]);

  const sortedData = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string') {
        const comp = valA.localeCompare(valB as string);
        return sortDirection === 'asc' ? comp : -comp;
      } else {
        const comp = (valA as number) - (valB as number);
        return sortDirection === 'asc' ? comp : -comp;
      }
    });
  }, [filtered, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleDisabled = async (e: React.MouseEvent, row: CountryRiskRecord) => {
    e.stopPropagation();
    setActionId(row.id);
    const success = await toggleCountryDisabled(row.id, !row.disabled);
    setActionId(null);
    if (!success) {
      alert('Unable to update jurisdiction status. Please verify permissions.');
    }
  };

  const handleDelete = async (e: React.MouseEvent, row: CountryRiskRecord) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove ${row.country} from the advisory registry?`)) {
      setActionId(row.id);
      await deleteCountryFromFirestore(row.id);
      setActionId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0E274A] rounded-xl border border-black/[0.06] dark:border-blue-900/40 p-4 sm:p-6 shadow-xs space-y-4 transition-colors">
      {/* Header & Admin Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-3.5 border-b border-black/[0.05] dark:border-blue-900/30 gap-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#1D1D1F] dark:text-white tracking-tight truncate">
            Country Directory ({sortedData.length})
          </h3>
          <p className="text-[12px] text-[#86868B] dark:text-[#94A8C4] font-normal truncate hidden sm:block">
            Select any jurisdiction to view dual-factor scoring breakdown
          </p>
          <p className="text-[11px] text-[#86868B] dark:text-[#94A8C4] font-normal truncate sm:hidden">
            Jurisdiction scoring & directory
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {isAdmin && (
            <>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-semibold bg-[#0076CE] hover:bg-[#0067B8] text-white transition shadow-xs whitespace-nowrap active:scale-[0.99]"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Add Country</span>
              </button>

              <button
                onClick={() => setIsExcelModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-medium bg-[#34C759]/10 text-[#248A3D] dark:text-[#30D158] hover:bg-[#34C759]/20 transition whitespace-nowrap"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Upload Excel</span>
              </button>
            </>
          )}

          <button
            onClick={() => exportCountriesToExcel(sortedData)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-medium bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.07] dark:hover:bg-white/[0.12] text-[#1D1D1F] dark:text-white transition whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Search Input, Status Filter & Region Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 sm:max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Search country or region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FAFBFD] dark:bg-[#122C50] border border-black/[0.08] dark:border-blue-900/40 rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-[#1D1D1F] dark:text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0076CE]/25 dark:focus:ring-[#0076CE]/35 focus:border-[#0076CE] transition"
            />
          </div>

          {/* Status Filter Segment (All / Active / Disabled) */}
          <div className="flex items-center gap-0.5 bg-black/[0.03] dark:bg-white/[0.05] p-0.5 rounded-lg border border-black/[0.04] dark:border-blue-900/30 text-[11px] shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2 py-1 rounded-md font-medium transition ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-[#15345F] text-[#1D1D1F] dark:text-white shadow-2xs font-semibold'
                  : 'text-[#86868B] dark:text-[#94A8C4] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              All ({data.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-2 py-1 rounded-md font-medium transition ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white dark:bg-[#15345F] text-[#248A3D] dark:text-[#30D158] shadow-2xs font-semibold'
                  : 'text-[#86868B] dark:text-[#94A8C4] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              Active ({data.filter((d) => !d.disabled).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('DISABLED')}
              className={`px-2 py-1 rounded-md font-medium transition ${
                statusFilter === 'DISABLED'
                  ? 'bg-white dark:bg-[#15345F] text-[#FF9500] shadow-2xs font-semibold'
                  : 'text-[#86868B] dark:text-[#94A8C4] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              Disabled ({data.filter((d) => d.disabled).length})
            </button>
          </div>
        </div>

        {/* Region Segment Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition whitespace-nowrap ${
                selectedRegion === reg
                  ? 'bg-[#0076CE] text-white shadow-xs font-semibold'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#86868B] dark:text-[#94A8C4] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Inset Table */}
      <div className="overflow-x-auto rounded-lg border border-black/[0.06] dark:border-blue-900/40">
        <table className="w-full text-left text-[12px] border-collapse">
          <thead>
            <tr className="bg-[#F5F5F7] dark:bg-[#122C50] text-[#86868B] dark:text-[#94A8C4] text-[11px] font-semibold uppercase tracking-[0.05em] border-b border-black/[0.06] dark:border-blue-900/30">
              <th
                onClick={() => handleSort('country')}
                className="py-3 px-4 cursor-pointer hover:text-[#1D1D1F] dark:hover:text-white select-none"
              >
                <div className="flex items-center gap-1.5">
                  Country <ArrowUpDown className="w-3 h-3" strokeWidth={1.75} />
                </div>
              </th>
              <th
                onClick={() => handleSort('region')}
                className="py-3 px-4 cursor-pointer hover:text-[#1D1D1F] dark:hover:text-white select-none"
              >
                <div className="flex items-center gap-1.5">
                  Region <ArrowUpDown className="w-3 h-3" strokeWidth={1.75} />
                </div>
              </th>
              <th className="py-3 px-3 text-center font-semibold">Local Code (1–5)</th>
              <th className="py-3 px-3 text-center font-semibold">Civil Defence (1–5)</th>
              <th
                onClick={() => handleSort('score')}
                className="py-3 px-3 cursor-pointer hover:text-[#1D1D1F] dark:hover:text-white select-none text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  Risk Score <ArrowUpDown className="w-3 h-3" strokeWidth={1.75} />
                </div>
              </th>
              <th className="py-3 px-3 text-center font-semibold">Category</th>
              {isAdmin && (
                <th className="py-3 px-3 text-right font-semibold">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.035] dark:divide-white/[0.04]">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-[#86868B] text-[13px]">
                  No matching countries found.
                </td>
              </tr>
            ) : (
              sortedData.map((row) => {
                const isSelected = row.id === selectedCountryId;
                const b = BAND_COLORS[row.band];
                const isBusy = actionId === row.id;

                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelectCountry(row)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#0076CE]/[0.08] dark:bg-[#0076CE]/[0.18] font-medium text-[#0076CE] dark:text-[#389BF2]'
                        : row.disabled
                        ? 'opacity-50 bg-black/[0.02] dark:bg-white/[0.02]'
                        : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03] text-[#333336] dark:text-[#E5E5EA]'
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-[#1D1D1F] dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{row.country}</span>
                        {row.disabled && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF9500]/10 text-[#FF9500] font-medium">
                            Disabled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#86868B] dark:text-[#98989D]">{row.region}</td>
                    <td className="py-3 px-3 text-center font-medium tabular-nums text-[#48484A] dark:text-[#AEAEB2]">
                      {row.cop} / 5
                    </td>
                    <td className="py-3 px-3 text-center font-medium tabular-nums text-[#48484A] dark:text-[#AEAEB2]">
                      {row.cda} / 5
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-semibold" style={{ color: b.text }}>
                      {row.score} / 10
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider inline-block border"
                        style={{
                          backgroundColor: b.bg,
                          color: b.text,
                          borderColor: b.border,
                        }}
                      >
                        {row.band}
                      </span>
                    </td>

                    {/* Admin Actions column */}
                    {isAdmin && (
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCountry(row);
                            }}
                            className="p-1.5 rounded-md text-[#86868B] dark:text-[#94A8C4] hover:text-[#0076CE] dark:hover:text-[#389BF2] hover:bg-[#0076CE]/10 transition"
                            title="Edit country details"
                          >
                            <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={(e) => handleToggleDisabled(e, row)}
                            className={`p-1.5 rounded-md transition ${
                              row.disabled
                                ? 'text-[#FF9500] hover:bg-[#FF9500]/10'
                                : 'text-[#34C759] hover:bg-[#34C759]/10'
                            }`}
                            title={row.disabled ? 'Enable country' : 'Disable country'}
                          >
                            {actionId === row.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Power className="w-3.5 h-3.5" strokeWidth={1.75} />
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={(e) => handleDelete(e, row)}
                            className="p-1.5 rounded-md text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition"
                            title="Delete country"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddCountryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        existingRegions={regions.filter((r) => r !== 'All')}
        onSuccess={() => onRefreshData && onRefreshData()}
      />

      <EditCountryModal
        isOpen={Boolean(editingCountry)}
        countryRecord={editingCountry}
        existingRegions={regions.filter((r) => r !== 'All')}
        onClose={() => setEditingCountry(null)}
        onSuccess={() => onRefreshData && onRefreshData()}
      />

      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={() => onRefreshData && onRefreshData()}
      />
    </div>
  );
};
