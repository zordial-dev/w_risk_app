import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, SlidersHorizontal } from 'lucide-react';

interface NavbarProps {
  onOpenPreferences: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPreferences }) => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-white/80 dark:bg-[#0A1F3B]/80 backdrop-blur-xl border-t-2 border-[#0076CE] border-b border-black/[0.06] dark:border-blue-900/40 sticky top-0 z-30 transition-colors">
      <div className="w-full px-4 sm:px-6 h-12 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img
            src="/wyndham-logo.png"
            alt="Wyndham Hotels & Resorts"
            className="h-6 sm:h-7 w-auto object-contain dark:brightness-0 dark:invert transition-all"
          />
          <div className="h-4 w-px bg-black/10 dark:bg-white/15 hidden xs:block" />
          <span className="text-[12px] text-[#86868B] dark:text-[#98989D] font-medium hidden xs:inline tracking-tight">
            Country Risk Rating
          </span>
        </div>

        {/* User, Settings & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[12px]">
          <span className="hidden sm:inline-block text-[#86868B] dark:text-[#98989D] truncate max-w-xs font-normal">
            {currentUser?.email}
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#0076CE]/10 text-[#0076CE] dark:text-[#389BF2] border border-[#0076CE]/20">
            {currentUser?.role === 'admin' ? 'Admin' : 'User'}
          </span>

          {/* Preferences / Menu Button (opens right side panel on phone) */}
          <button
            onClick={onOpenPreferences}
            className="md:hidden p-2 rounded-lg text-[#86868B] hover:text-[#1D1D1F] dark:text-[#98989D] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
            title="Menu & Navigation"
            aria-label="Menu & Navigation"
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.75} />
          </button>

          {/* Logout Button (desktop navbar; on phone it is in the right-side panel) */}
          <button
            onClick={logout}
            className="hidden sm:inline-flex p-1.5 rounded-lg text-[#86868B] hover:text-[#FF3B30] dark:text-[#98989D] dark:hover:text-[#FF453A] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
};
