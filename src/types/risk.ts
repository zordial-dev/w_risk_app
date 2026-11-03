export type RiskBand = 'Low' | 'Low-Medium' | 'Medium' | 'High-Medium' | 'High';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface CountryRiskRecord {
  id: string;
  region: string;
  country: string;
  cop: number;    // Local Code of Practice (1-5)
  cda: number;    // Civil Defence Authority (1-5)
  score: number;  // Total Risk Score (1-10)
  band: RiskBand;
  disabled?: boolean; // Admin can disable/deactivate a country
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  isActive: boolean;
  password?: string;
}

export interface UserPreferences {
  theme: ThemeMode;
  defaultRegion: string;
  defaultTab: 'lookup' | 'directory' | 'users' | 'reference';
  compactMode: boolean;
}

export interface BandStyle {
  bg: string;
  text: string;
  border: string;
  accent: string;
  label: string;
  darkBg: string;
  darkText: string;
  darkBorder: string;
}

export const BAND_COLORS: Record<RiskBand, BandStyle> = {
  'Low': {
    bg: '#EBF9EE',
    text: '#1A7B36',
    border: '#C6F0CD',
    accent: '#34C759',
    label: 'Low',
    darkBg: 'rgba(52, 199, 89, 0.16)',
    darkText: '#30D158',
    darkBorder: 'rgba(52, 199, 89, 0.32)'
  },
  'Low-Medium': {
    bg: '#EAF7F8',
    text: '#0B7C8C',
    border: '#C2ECEF',
    accent: '#30B0C7',
    label: 'Low–Med',
    darkBg: 'rgba(48, 176, 199, 0.16)',
    darkText: '#64D2FF',
    darkBorder: 'rgba(48, 176, 199, 0.32)'
  },
  'Medium': {
    bg: '#FFF6E8',
    text: '#A85B00',
    border: '#FFE3B8',
    accent: '#FF9500',
    label: 'Medium',
    darkBg: 'rgba(255, 149, 0, 0.16)',
    darkText: '#FF9F0A',
    darkBorder: 'rgba(255, 149, 0, 0.32)'
  },
  'High-Medium': {
    bg: '#FFF1EB',
    text: '#B8430A',
    border: '#FFD6C2',
    accent: '#FF6420',
    label: 'High–Med',
    darkBg: 'rgba(255, 100, 32, 0.18)',
    darkText: '#FF7A45',
    darkBorder: 'rgba(255, 100, 32, 0.35)'
  },
  'High': {
    bg: '#FEECEB',
    text: '#C9251E',
    border: '#FFCCCC',
    accent: '#FF3B30',
    label: 'High',
    darkBg: 'rgba(255, 59, 48, 0.18)',
    darkText: '#FF453A',
    darkBorder: 'rgba(255, 59, 48, 0.35)'
  },
};

export const COP_DESCRIPTIONS: Record<number, string> = {
  1: 'Up to date (< 4 years)',
  2: 'Moderate revision (4–9 years)',
  3: 'Legacy standard (10+ years)',
  4: 'Unverified / Unknown',
  5: 'No formal code available'
};

export const CDA_DESCRIPTIONS: Record<number, string> = {
  1: 'Active procedure & enforced',
  2: 'Partial enforcement',
  3: 'Available, not actively followed',
  4: 'Unverified authority status',
  5: 'No civil defence framework'
};
