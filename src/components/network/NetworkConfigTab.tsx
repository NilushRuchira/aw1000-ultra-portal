import React, { useEffect } from 'react';
import {
  Signal,
  Lock,
  Sliders,
  Globe,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useCellularStore, type CellularSubTab } from '../../store/useCellularStore';
import { CellularStatusView } from './CellularStatusView';
import { CellAnalysisAndLockingView } from './CellAnalysisAndLockingView';
import { BandLockingPreferencesView } from './BandLockingPreferencesView';
import { ApnManagementView } from './ApnManagementView';
import { OperatorProviderView } from './OperatorProviderView';

export const NetworkConfigTab: React.FC = () => {
  const { subTab, setSubTab, status, cellLock, bandLock, fetchCellularData, actionMessage, clearMessage } = useCellularStore();

  useEffect(() => {
    fetchCellularData();
  }, [fetchCellularData]);

  const tabs = [
    {
      id: 'status' as CellularSubTab,
      label: 'Cellular Status & RF',
      icon: Signal,
      badge: status?.technology || '5G SA',
    },
    {
      id: 'cell_lock' as CellularSubTab,
      label: 'Cell Analysis & Locking',
      icon: Lock,
      badge: cellLock.enabled ? 'LOCKED' : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'band_lock' as CellularSubTab,
      label: 'Band Locking & Modes',
      icon: Sliders,
      badge: bandLock.modePreference !== 'AUTO' ? bandLock.modePreference : null,
      badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    },
    {
      id: 'apn' as CellularSubTab,
      label: 'APN Profiles',
      icon: Globe,
      badge: null,
    },
    {
      id: 'operators' as CellularSubTab,
      label: 'Network Providers',
      icon: Search,
      badge: null,
    },
  ];

  const renderSubTab = () => {
    if (!status) {
      return (
        <div className="py-16 text-center text-slate-400 text-xs">
          Loading cellular modem parameters...
        </div>
      );
    }

    switch (subTab) {
      case 'status':
        return <CellularStatusView status={status} />;
      case 'cell_lock':
        return <CellAnalysisAndLockingView />;
      case 'band_lock':
        return <BandLockingPreferencesView />;
      case 'apn':
        return <ApnManagementView />;
      case 'operators':
        return <OperatorProviderView />;
      default:
        return <CellularStatusView status={status} />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={clearMessage} className="text-slate-400 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
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

      {/* Render Active View */}
      {renderSubTab()}
    </div>
  );
};
