import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { WifiManagementTab } from './components/wifi/WifiManagementTab';
import { ConnectedDevicesTab } from './components/devices/ConnectedDevicesTab';
import { TerminalDiagnosticsTab } from './components/terminal/TerminalDiagnosticsTab';
import { SettingsTab } from './components/setup/SettingsTab';
import { useRouterStore } from './store/useRouterStore';
import { useProfileStore } from './store/useProfileStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouterPortalApp: React.FC = () => {
  const { activeTab, setActiveTab, fetchRouterData } = useRouterStore();
  const { loadProfiles, activeProfile } = useProfileStore();

  useEffect(() => {
    loadProfiles();
    fetchRouterData();
  }, [loadProfiles, fetchRouterData]);

  // Periodic live telemetry polling (every 3.5 seconds)
  useQuery({
    queryKey: ['routerTelemetry', activeProfile.id],
    queryFn: async () => {
      await fetchRouterData();
      return true;
    },
    refetchInterval: 3500,
    refetchIntervalInBackground: false,
  });

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'wifi':
        return <WifiManagementTab />;
      case 'devices':
        return <ConnectedDevicesTab />;
      case 'terminal':
        return <TerminalDiagnosticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <Navbar onOpenSettings={() => setActiveTab('settings')} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterPortalApp />
    </QueryClientProvider>
  );
}
