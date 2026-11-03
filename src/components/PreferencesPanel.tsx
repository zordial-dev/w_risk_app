import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeMode } from '../types/risk';
import { Sun, Moon, Laptop, Compass, ListFilter, BookOpen, X, Shield, LogOut, Users } from 'lucide-react';

export type ActiveTab = 'lookup' | 'directory' | 'users' | 'reference';

interface NavigationSidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpen: boolean; // For mobile drawer
  onClose: () => void;
  countryCount: number;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  countryCount,
}) => {
  const { currentUser, logout, preferences, updatePreferences } = useAuth();

  const navItems = [
    {
      id: 'lookup' as ActiveTab,
      label: 'Risk Lookup',
      desc: 'Dual-factor score & meter',
      icon: <Compass className="w-4 h-4 shrink-0" strokeWidth={1.75} />,
    },
    {
      id: 'directory' as ActiveTab,
      label: 'All Countries',
      desc: `${countryCount} jurisdictions`,
      icon: <ListFilter className="w-4 h-4 shrink-0" strokeWidth={1.75} />,
    },
    ...(currentUser?.role === 'admin'
      ? [
          {
            id: 'users' as ActiveTab,
            label: 'User Management',
            desc: 'Accounts & access',
            icon: <Users className="w-4 h-4 shrink-0" strokeWidth={1.75} />,
          },
        ]
      : []),
    {
      id: 'reference' as ActiveTab,
      label: 'Reference Guide',
      desc: 'COP & CDA scoring dynamics',
      icon: <BookOpen className="w-4 h-4 shrink-0" strokeWidth={1.75} />,
    },
  ];

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" strokeWidth={1.75} /> },
    { id: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" strokeWidth={1.75} /> },
    { id: 'system', label: 'Auto', icon: <Laptop className="w-3.5 h-3.5" strokeWidth={1.75} /> },
  ];

  const sidebarBody = (
    <div className="flex flex-col h-full bg-[#FFFFFF] dark:bg-[#0A1F3B] text-[#1D1D1F] dark:text-[#F0F6FC] select-none">
      {/* Mobile Drawer Close Bar */}
      <div className="md:hidden p-3 border-b border-black/[0.06] dark:border-blue-900/40 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-[#1D1D1F] dark:text-white">Navigation</span>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          aria-label="Close"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <div className="px-2.5 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-[#86868B] dark:text-[#94A8C4]">
          Views
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onClose();
              }}
              className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center gap-2.5 ${
                isActive
                  ? 'bg-[#0076CE]/[0.12] dark:bg-[#0076CE]/[0.22] text-[#0076CE] dark:text-[#389BF2] font-semibold'
                  : 'text-[#48484A] dark:text-[#94A8C4] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              {/* Clean icon with Wyndham blue on active */}
              <span className={isActive ? 'text-[#0076CE] dark:text-[#389BF2]' : 'text-[#86868B] dark:text-[#8E8E93]'}>
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] leading-tight truncate">{item.label}</div>
                <div className={`text-[11px] leading-tight truncate mt-0.5 ${isActive ? 'text-[#0076CE]/80 dark:text-[#389BF2]/80' : 'text-[#86868B] dark:text-[#8E8E93]'}`}>
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Minimal Footer: Theme Switcher & User Monogram */}
      <div className="p-3 border-t border-black/[0.06] dark:border-blue-900/40 space-y-2.5 bg-[#FAFBFD] dark:bg-[#081830]">
        {/* Apple-style Theme Switcher */}
        <div>
          <div className="px-1 mb-1.5 flex items-center justify-between text-[10px] font-medium text-[#86868B] dark:text-[#8E8E93] uppercase tracking-wider">
            <span>Appearance</span>
            <span className="capitalize text-[#1D1D1F] dark:text-white">{preferences.theme}</span>
          </div>
          <div className="bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded-lg flex items-center gap-0.5 border border-black/[0.03] dark:border-white/[0.04]">
            {themes.map((t) => {
              const isSelected = preferences.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => updatePreferences({ theme: t.id })}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium transition flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-white dark:bg-[#15345F] text-[#1D1D1F] dark:text-white shadow-xs font-semibold'
                      : 'text-[#86868B] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white'
                  }`}
                  title={`${t.label} mode`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current user badge */}
        <div className="px-1 flex items-center justify-between text-[11px] text-[#86868B] dark:text-[#8E8E93]">
          <div className="flex items-center gap-1.5 truncate">
            <Shield className="w-3.5 h-3.5 text-[#86868B] dark:text-[#8E8E93] shrink-0" strokeWidth={1.75} />
            <span className="truncate max-w-[130px] font-medium text-[#1D1D1F] dark:text-white">{currentUser?.email}</span>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-[#1D1D1F] dark:text-white">
            {currentUser?.role}
          </span>
        </div>

        {/* Sign Out Button in Side Panel */}
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full mt-1 px-2.5 py-2 rounded-lg text-left text-[12px] font-medium text-[#FF3B30] dark:text-[#FF453A] hover:bg-[#FF3B30]/[0.08] dark:hover:bg-[#FF453A]/[0.12] transition flex items-center gap-2"
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP: ALWAYS-ON MINIMAL LEFT NAVIGATION SIDEBAR */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 border-r border-black/[0.07] dark:border-white/[0.07] shrink-0 sticky top-12 h-[calc(100vh-3rem)]">
        {sidebarBody}
      </aside>

      {/* 2. MOBILE: DRAWER WHEN OPENED (SLIDES IN FROM RIGHT ON PHONE) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 max-w-[270px] w-full z-50 animate-slide-in-right shadow-2xl border-l border-black/[0.08] dark:border-white/[0.08]">
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
};
