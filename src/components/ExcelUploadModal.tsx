import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2, Download } from 'lucide-react';
import { parseExcelFile, downloadExcelTemplate, ParsedExcelResult } from '../lib/excelService';
import { bulkUpsertCountries } from '../lib/countryService';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedExcelResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setError(null);
    setSuccessCount(null);
    setFile(selectedFile);
    setIsParsing(true);

    try {
      const result = await parseExcelFile(selectedFile);
      setParsed(result);
      if (result.records.length === 0) {
        setError('No valid country risk records found in the spreadsheet.');
      }
    } catch (err: any) {
      setError(err?.message || 'Could not parse the selected spreadsheet.');
      setParsed(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUpdate = async () => {
    if (!parsed || parsed.records.length === 0) return;
    setIsUploading(true);
    setError(null);

    const res = await bulkUpsertCountries(parsed.records);
    setIsUploading(false);

    if (res.success) {
      setSuccessCount(res.count);
      onSuccess();
    } else {
      setError(res.error || 'Failed to update records. Please try again.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsed(null);
    setError(null);
    setSuccessCount(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0E274A] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-black/[0.08] dark:border-blue-900/40 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#34C759]/10 text-[#34C759]">
              <FileSpreadsheet className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-white">
                Upload Excel Spreadsheet
              </h3>
              <p className="text-[12px] text-[#86868B] dark:text-[#94A8C4]">
                Entirely replaces & updates jurisdiction records from spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1 rounded-md text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4">
          {successCount !== null ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#34C759]/10 text-[#34C759] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
              </div>
              <h4 className="text-[17px] font-semibold text-[#1D1D1F] dark:text-white">
                Registry Updated & Overlapped!
              </h4>
              <p className="text-[13px] text-[#86868B] dark:text-[#94A8C4] max-w-sm mx-auto">
                <strong className="text-[#1D1D1F] dark:text-white">{successCount}</strong> jurisdictions are now live in the registry. Previous data was completely replaced.
              </p>
              <button
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="mt-3 px-5 py-2 rounded-lg bg-[#0076CE] hover:bg-[#0067B8] text-white text-[13px] font-semibold transition active:scale-[0.99] shadow-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Dropzone */}
              {!file ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-black/10 dark:border-white/15 hover:border-[#0076CE] dark:hover:border-[#389BF2] rounded-xl p-8 text-center cursor-pointer transition bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <Upload className="w-8 h-8 text-[#86868B] mx-auto mb-2" strokeWidth={1.5} />
                  <div className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                    Click to browse or drop spreadsheet here
                  </div>
                  <div className="text-[11px] text-[#86868B] dark:text-[#98989D] mt-1">
                    Supports .xlsx, .xls, and .csv files
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadExcelTemplate();
                    }}
                    className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[11px] font-semibold text-[#0076CE] dark:text-[#389BF2] transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Blank Template (.xlsx)</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06]">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileSpreadsheet className="w-4 h-4 text-[#34C759] shrink-0" />
                      <div className="truncate">
                        <div className="text-[13px] font-medium text-[#1D1D1F] dark:text-white truncate">
                          {file.name}
                        </div>
                        <div className="text-[11px] text-[#86868B] dark:text-[#98989D]">
                          {(file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="text-[11px] text-[#FF3B30] hover:underline"
                    >
                      Change File
                    </button>
                  </div>

                  {/* Parsing State */}
                  {isParsing && (
                    <div className="flex items-center justify-center py-4 gap-2 text-[12px] text-[#86868B]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#0076CE]" />
                      <span>Analyzing spreadsheet structure...</span>
                    </div>
                  )}

                  {/* Parsed Preview */}
                  {parsed && parsed.records.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-[#86868B] dark:text-[#98989D]">Detected records:</span>
                        <span className="font-semibold text-[#1D1D1F] dark:text-white">
                          {parsed.records.length} Jurisdictions
                        </span>
                      </div>

                      {/* Small preview table */}
                      <div className="max-h-36 overflow-y-auto rounded-lg border border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.04] dark:divide-white/[0.06] text-[11px]">
                        {parsed.records.slice(0, 5).map((r) => (
                          <div key={r.id} className="p-2 flex items-center justify-between">
                            <span className="font-medium text-[#1D1D1F] dark:text-white truncate max-w-[180px]">
                              {r.country}
                            </span>
                            <span className="text-[#86868B]">{r.region}</span>
                            <span className="tabular-nums font-semibold text-[#0076CE] dark:text-[#389BF2]">
                              COP: {r.cop} | CDA: {r.cda} | Score: {r.score}
                            </span>
                          </div>
                        ))}
                        {parsed.records.length > 5 && (
                          <div className="p-1.5 text-center text-[#86868B] text-[10px] bg-black/[0.01] dark:bg-white/[0.01]">
                            + {parsed.records.length - 5} more records
                          </div>
                        )}
                      </div>

                      {/* Formatting & Deduplication Notices */}
                      {parsed.errors && parsed.errors.length > 0 && (
                        <div className="p-3 rounded-lg bg-[#FF9500]/10 border border-[#FF9500]/25 space-y-1.5 text-[11px]">
                          <div className="font-semibold text-[#FF9500] flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Formatting & Deduplication Notices ({parsed.errors.length})</span>
                          </div>
                          <div className="max-h-24 overflow-y-auto space-y-1 pl-1 text-[#9F580A] dark:text-[#FFB340] leading-snug">
                            {parsed.errors.map((msg, i) => (
                              <div key={i}>• {msg}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Error Callout */}
              {error && (
                <div className="p-2.5 rounded-lg bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-start gap-2 text-[#FF3B30] text-[12px]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {successCount === null && (
          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!parsed || parsed.records.length === 0 || isUploading}
              onClick={handleApplyUpdate}
              className="px-4 py-2 rounded-lg bg-[#0076CE] hover:bg-[#0067B8] text-white text-[12px] font-semibold transition disabled:opacity-40 flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,118,206,0.25)] active:scale-[0.99]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving updates...</span>
                </>
              ) : (
                <span>Apply {parsed?.records.length || 0} Updates</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
