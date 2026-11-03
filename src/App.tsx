import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CountryRiskRecord } from './types/risk';
import { subscribeToCountryData, seedCountriesToFirestore } from './lib/countryService';
import { Navbar } from './components/Navbar';
import { CountryRiskHero } from './components/CountryRiskHero';
import { CountryDirectory } from './components/CountryDirectory';
import { MethodologySection } from './components/MethodologySection';
import { NavigationSidebar, ActiveTab } from './components/PreferencesPanel';
import { LoginModal } from './components/LoginModal';
import { UserManagementView } from './components/UserManagementView';
import { AppSkeleton } from './components/AppSkeleton';
import { ShieldAlert, RefreshCw } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { currentUser, preferences } = useAuth();
  const [countryData, setCountryData] = useState<CountryRiskRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(preferences.defaultTab || 'lookup');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryRiskRecord | null>(null);

  // Subscribe to real-time Firestore database updates
  useEffect(() => {
    setIsLoading(true);
    setDbError(null);

    const unsubscribe = subscribeToCountryData(
      (data) => {
        setCountryData(data);
        setIsLoading(false);
        setDbError(null);
      },
      (err) => {
        console.error('Firestore connection issue:', err);
        setDbError(err?.message || 'Unable to connect to Cloud Firestore. Please check permissions or network.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync selected country dynamically whenever countryData updates from Firestore
  useEffect(() => {
    if (countryData.length === 0) return;

    setSelectedCountry((prev) => {
      if (prev) {
        const match = countryData.find((c) => c.id === prev.id);
        if (match) return match;
      }
      const matchRegion = countryData.find((d) => d.region === preferences.defaultRegion);
      return matchRegion || countryData[0];
    });
  }, [countryData, preferences.defaultRegion]);

  if (!currentUser) {
    return <LoginModal />;
  }

  const handleSelectFromDirectory = (c: CountryRiskRecord) => {
    setSelectedCountry(c);
    setActiveTab('lookup');
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    const res = await seedCountriesToFirestore();
    setIsSeeding(false);
    if (res.success) {
      alert(`Successfully synchronized ${res.count} jurisdictions.`);
    } else {
      alert(`Synchronization failed: ${res.error || 'Please check your connection and permissions.'}`);
    }
  };

  // 1. Apple-style Skeleton Loading State
  if (isLoading && countryData.length === 0) {
    return <AppSkeleton />;
  }

  // 2. Connection Offline State
  if (dbError && countryData.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#081830] text-[#1D1D1F] dark:text-[#F0F6FC] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="max-w-md w-full bg-white dark:bg-[#0E274A] border border-black/[0.08] dark:border-blue-900/40 rounded-2xl p-6 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-[#FF9500]/10 text-[#FF9500] mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <h2 className="text-[18px] font-semibold text-[#1D1D1F] dark:text-white tracking-tight">
            Advisory Records Unavailable
          </h2>
          <p className="text-[13px] text-[#86868B] dark:text-[#94A8C4] mt-2 mb-4 leading-relaxed">
            Unable to establish a secure connection to the advisory registry. Please check your network connection and retry.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2 px-3 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] text-[13px] font-medium text-[#1D1D1F] dark:text-white hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#0076CE] hover:bg-[#0067B8] text-[13px] font-semibold text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isSeeding ? 'Syncing...' : 'Initialize Records'}</span>
                </button>
              )}
            </div>

            <button
              onClick={async () => {
                const { INITIAL_COUNTRY_DATA } = await import('./data/initialData');
                setCountryData(INITIAL_COUNTRY_DATA);
                setDbError(null);
                setIsLoading(false);
              }}
              className="w-full py-2 px-3 rounded-lg border border-black/[0.08] dark:border-white/[0.1] text-[12px] font-medium text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition"
            >
              Load Offline Registry &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#081830] text-[#1D1D1F] dark:text-[#F0F6FC] flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <Navbar onOpenPreferences={() => setIsSidebarOpen(true)} />

      {/* Main Workspace with Left Navigation Sidebar */}
      <div className="flex-1 flex w-full">
        {/* Left Navigation Sidebar (always visible on desktop, drawer on mobile) */}
        <NavigationSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          countryCount={countryData.length}
        />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 w-full px-4 sm:px-8 lg:px-10 py-4 sm:py-6 space-y-4">
            {/* Tab 1: Country Risk Lookup */}
            {activeTab === 'lookup' && selectedCountry && (
              <CountryRiskHero
                data={countryData}
                selectedCountry={selectedCountry}
                onSelectCountry={(c) => setSelectedCountry(c)}
              />
            )}

            {/* Tab 2: Country Directory */}
            {activeTab === 'directory' && (
              <CountryDirectory
                data={countryData}
                selectedCountryId={selectedCountry?.id || ''}
                onSelectCountry={handleSelectFromDirectory}
              />
            )}

            {/* Tab 3: User Management (Admin only) */}
            {activeTab === 'users' && currentUser?.role === 'admin' && (
              <UserManagementView />
            )}

            {/* Tab 4: Reference & Dynamics */}
            {activeTab === 'reference' && (
              <MethodologySection />
            )}
          </main>

          {/* Minimal Footer & Live Status */}
          <footer className="py-6 text-center text-[11px] text-[#86868B] space-y-1.5">
            <div>Wyndham Hotels & Resorts • Property Fire Safety Risk Advisory</div>
            <div className="flex items-center justify-center gap-1.5 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
              <span>Operational • {countryData.length} Jurisdictions</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
};

export default App;
