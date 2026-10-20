import React, { useEffect } from 'react';
import {
  ScrollText,
  Activity,
  BarChart3,
} from 'lucide-react';
import { useLogsStore, type LogsSubTab } from '../../store/useLogsStore';
import { LogViewerTable } from './LogViewerTable';
import { LogAnalyticsView } from './LogAnalyticsView';
import { VnStatTrafficView } from './VnStatTrafficView';

export const LogsTab: React.FC = () => {
  const {
    subTab,
    setSubTab,
    fetchLogs,
    fetchVnStat,
    isAutoRefresh,
    refreshIntervalMs,
    totalLogs,
    vnstatData,
  } = useLogsStore();

  useEffect(() => {
    fetchLogs();
    fetchVnStat();
  }, [fetchLogs, fetchVnStat]);

  // Periodic polling when auto-refresh is active
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
      if (subTab === 'vnstat') {
        fetchVnStat();
      }
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshIntervalMs, subTab, fetchLogs, fetchVnStat]);

  const tabs = [
    {
      id: 'viewer' as LogsSubTab,
      label: 'Log Stream & Console',
      icon: ScrollText,
      badge: `${totalLogs} entries`,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'analytics' as LogsSubTab,
      label: 'Log Analytics & Frequency Graphs',
      icon: Activity,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'vnstat' as LogsSubTab,
      label: 'vnStat Bandwidth Monitor & History',
      icon: BarChart3,
      badge: vnstatData?.installed ? 'Active' : 'Not Installed',
      badgeColor: vnstatData?.installed
        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
  ];

  const renderSubTab = () => {
    switch (subTab) {
      case 'viewer':
        return <LogViewerTable />;
      case 'analytics':
        return <LogAnalyticsView />;
      case 'vnstat':
        return <VnStatTrafficView />;
      default:
        return <LogViewerTable />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none border-b border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${tab.badgeColor || 'bg-blue-500/20 text-blue-300'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* View Output */}
      {renderSubTab()}
    </div>
  );
};
