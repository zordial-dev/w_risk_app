import * as XLSX from 'xlsx';
import { CountryRiskRecord } from '../types/risk';
import { calculateRiskBand, slugify } from './countryService';

export interface ParsedExcelResult {
  records: CountryRiskRecord[];
  totalRows: number;
  errors: string[];
}

/**
 * Flexible column header detector
 */
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function toTitleCase(str: string): string {
  return str
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const parseExcelFile = async (file: File): Promise<ParsedExcelResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          return resolve({ records: [], totalRows: 0, errors: ['The uploaded file contains no readable sheets.'] });
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          return resolve({ records: [], totalRows: 0, errors: ['The worksheet is empty.'] });
        }

        const recordMap = new Map<string, CountryRiskRecord>();
        const errors: string[] = [];

        rawJson.forEach((row, index) => {
          let rawRegion = '';
          let rawCountry = '';
          let cop: number | null = null;
          let cda: number | null = null;
          let explicitScore: number | null = null;
          let disabled = false;

          for (const [key, value] of Object.entries(row)) {
            const normKey = normalizeKey(key);
            const strVal = String(value).trim();

            if (/region|continent|territory/.test(normKey)) {
              rawRegion = strVal;
            } else if (/country|jurisdiction|nation/.test(normKey)) {
              rawCountry = strVal;
            } else if (/cop|codeofpractice|localcode/.test(normKey)) {
              const num = parseInt(strVal, 10);
              if (!isNaN(num)) {
                if (num >= 1 && num <= 5) {
                  cop = num;
                } else {
                  cop = Math.min(Math.max(num, 1), 5);
                  errors.push(`Row ${index + 2}: COP score "${strVal}" was out of range (1–5) and clamped to ${cop}.`);
                }
              }
            } else if (/cda|civildefence|civildefense|authority|submission/.test(normKey)) {
              const num = parseInt(strVal, 10);
              if (!isNaN(num)) {
                if (num >= 1 && num <= 5) {
                  cda = num;
                } else {
                  cda = Math.min(Math.max(num, 1), 5);
                  errors.push(`Row ${index + 2}: CDA score "${strVal}" was out of range (1–5) and clamped to ${cda}.`);
                }
              }
            } else if (/score|riskrating|rating|total/.test(normKey)) {
              const num = parseInt(strVal, 10);
              if (!isNaN(num) && num >= 1 && num <= 10) explicitScore = num;
            } else if (/status|state|active|disabled/.test(normKey)) {
              if (/disabl|inactiv|false|0|no/i.test(strVal)) {
                disabled = true;
              }
            }
          }

          if (!rawCountry) {
            errors.push(`Row ${index + 2}: Skipped because Country/Jurisdiction name is missing.`);
            return;
          }

          const country = toTitleCase(rawCountry);
          const region = rawRegion ? toTitleCase(rawRegion) : 'General';

          const finalCop = cop !== null ? cop : 2;
          const finalCda = cda !== null ? cda : 2;
          const score = explicitScore !== null ? explicitScore : finalCop + finalCda;
          const band = calculateRiskBand(score);
          const id = `${slugify(region)}-${slugify(country)}`;

          if (recordMap.has(id)) {
            errors.push(`Row ${index + 2}: Duplicate entry for "${country}" (${region}). Updated with latest values.`);
          }

          recordMap.set(id, {
            id,
            region,
            country,
            cop: finalCop,
            cda: finalCda,
            score,
            band,
            disabled,
          });
        });

        resolve({
          records: Array.from(recordMap.values()),
          totalRows: rawJson.length,
          errors,
        });
      } catch (err: any) {
        console.error('Error parsing Excel:', err);
        reject(new Error(err?.message || 'Failed to parse Excel file.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Export country data back to Excel (.xlsx)
 */
export const exportCountriesToExcel = (countries: CountryRiskRecord[], filename = 'Wyndham_Country_Risk_Ratings.xlsx') => {
  const exportData = countries.map((c) => ({
    'Region': c.region,
    'Country': c.country,
    'Local Code of Practice (COP)': c.cop,
    'Civil Defence Authority (CDA)': c.cda,
    'Risk Rating': c.score,
    'Risk Band': c.band,
    'Status': c.disabled ? 'Disabled' : 'Active',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Country Ratings');

  XLSX.writeFile(workbook, filename);
};

/**
 * Download a blank / sample template matching the exact import/export structure
 */
export const downloadExcelTemplate = (filename = 'Wyndham_Country_Risk_Template.xlsx') => {
  const sampleData = [
    {
      'Region': 'Middle East',
      'Country': 'United Arab Emirates',
      'Local Code of Practice (COP)': 1,
      'Civil Defence Authority (CDA)': 1,
      'Risk Rating': 2,
      'Risk Band': 'Low',
      'Status': 'Active',
    },
    {
      'Region': 'Europe',
      'Country': 'France',
      'Local Code of Practice (COP)': 1,
      'Civil Defence Authority (CDA)': 2,
      'Risk Rating': 3,
      'Risk Band': 'Low',
      'Status': 'Active',
    },
    {
      'Region': 'Asia Pacific',
      'Country': 'Singapore',
      'Local Code of Practice (COP)': 1,
      'Civil Defence Authority (CDA)': 1,
      'Risk Rating': 2,
      'Risk Band': 'Low',
      'Status': 'Active',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

  XLSX.writeFile(workbook, filename);
};
