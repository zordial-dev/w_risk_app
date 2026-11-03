import React from 'react';

export const AppSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#081830] text-[#1D1D1F] dark:text-[#F0F6FC] flex flex-col font-sans animate-pulse">
      {/* Skeleton Top Navbar */}
      <header className="sticky top-0 z-40 h-12 bg-white/80 dark:bg-[#0A1F3B]/80 backdrop-blur-md border-t-2 border-[#0076CE] border-b border-black/[0.06] dark:border-blue-900/40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-28 h-6 rounded-md bg-black/[0.08] dark:bg-white/[0.1]" />
          <div className="h-4 w-px bg-black/10 dark:bg-white/15 hidden xs:block" />
          <div className="w-24 h-3 bg-black/[0.04] dark:bg-white/[0.06] rounded-md hidden xs:block" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-14 h-5 rounded bg-[#0076CE]/10" />
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex w-full">
        {/* Skeleton Left Navigation Sidebar (Desktop) */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-black/[0.08] dark:border-blue-900/40 p-4 space-y-2.5 shrink-0">
          <div className="w-full h-9 rounded-xl bg-black/[0.08] dark:bg-white/[0.1]" />
          <div className="w-full h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]" />
          <div className="w-full h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]" />
          <div className="w-full h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]" />
          <div className="pt-6 mt-auto">
            <div className="w-full h-16 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-blue-900/30" />
          </div>
        </aside>

        {/* Skeleton Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 w-full px-4 sm:px-8 lg:px-10 py-4 sm:py-6 space-y-4 max-w-7xl">
            {/* Search Bar & Region Filter Pills Skeleton */}
            <div className="bg-white dark:bg-[#0E274A] border border-black/[0.06] dark:border-blue-900/40 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="w-full sm:flex-1 h-10 rounded-xl bg-black/[0.05] dark:bg-white/[0.08]" />
                <div className="w-24 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] shrink-0 hidden sm:block" />
              </div>
              <div className="flex items-center gap-2 overflow-hidden pt-1">
                {[72, 88, 120, 100, 94, 80].map((width, i) => (
                  <div
                    key={i}
                    style={{ width: `${width}px` }}
                    className="h-7 rounded-full bg-black/[0.04] dark:bg-white/[0.06] shrink-0"
                  />
                ))}
              </div>
            </div>

            {/* Country Risk Card Skeleton */}
            <div className="bg-white dark:bg-[#0E274A] border border-black/[0.06] dark:border-blue-900/40 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
                <div className="space-y-2">
                  <div className="w-56 h-8 rounded-lg bg-black/[0.08] dark:bg-white/[0.1]" />
                  <div className="w-32 h-4 rounded-md bg-black/[0.04] dark:bg-white/[0.06]" />
                </div>
                <div className="w-36 h-9 rounded-full bg-black/[0.06] dark:bg-white/[0.08] shrink-0" />
              </div>

              {/* 3 Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((card) => (
                  <div
                    key={card}
                    className="h-28 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] p-4 flex flex-col justify-between"
                  >
                    <div className="w-20 h-3 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
                    <div className="w-32 h-8 rounded-lg bg-black/[0.08] dark:bg-white/[0.1]" />
                    <div className="w-24 h-2.5 rounded bg-black/[0.04] dark:bg-white/[0.06]" />
                  </div>
                ))}
              </div>

              {/* Advisory Details Block */}
              <div className="space-y-3 pt-2">
                <div className="w-40 h-4 rounded bg-black/[0.06] dark:bg-white/[0.08]" />
                <div className="w-full h-16 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06]" />
              </div>
            </div>
          </main>

          {/* Minimal Skeleton Footer */}
          <footer className="py-6 text-center text-[11px] text-[#86868B] space-y-1">
            <div className="w-64 h-3 bg-black/[0.05] dark:bg-white/[0.08] rounded mx-auto" />
          </footer>
        </div>
      </div>
    </div>
  );
};
