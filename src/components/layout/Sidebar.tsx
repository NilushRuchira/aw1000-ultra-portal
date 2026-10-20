import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Wifi,
  Laptop2,
  Terminal,
  ScrollText,
  Settings,
  Cpu,
  X,
} from 'lucide-react';
import { useRouterStore, type NavigationTab } from '../../store/useRouterStore';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, systemInfo, connectedDevices, mobileMenuOpen, setMobileMenuOpen } = useRouterStore();

  const navItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'network' as NavigationTab,
      label: 'Cellular 5G / LTE',
      icon: Radio,
      badge: '5G SA',
    },
    {
      id: 'wifi' as NavigationTab,
      label: 'Wi-Fi Management',
      icon: Wifi,
      badge: '3 Bands',
    },
    {
      id: 'devices' as NavigationTab,
      label: 'Connected Devices',
      icon: Laptop2,
      badge: connectedDevices.length > 0 ? `${connectedDevices.length}` : null,
    },
    {
      id: 'terminal' as NavigationTab,
      label: 'Terminal & Diagnostics',
      icon: Terminal,
      badge: 'SSH PTY',
    },
    {
      id: 'logs' as NavigationTab,
      label: 'System & Traffic Logs',
      icon: ScrollText,
      badge: 'vnStat',
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Router Profiles',
      icon: Settings,
      badge: null,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-6">
        {/* Navigation links */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>Router Management</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-xs shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Hardware Snapshot */}
        <div className="glass-card rounded-xl p-3 border border-slate-800/90 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              SoC Architecture
            </span>
            <span className="text-[11px] font-mono text-slate-300">ARMv8 Cortex-A53</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium">Filogic MT7986A</span>
            <span className="text-[11px] font-mono text-emerald-400">Quad-Core 2.0 GHz</span>
          </div>
          {systemInfo?.thermal?.cpu && (
            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="font-medium">SoC Thermal</span>
              <span className="text-[11px] font-mono text-amber-400">{systemInfo.thermal.cpu}°C</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer System Specs */}
      <div className="glass-card rounded-xl p-3 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>Target</span>
          <span className="font-mono text-slate-300">mediatek/filogic</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Kernel</span>
          <span className="font-mono text-slate-300">{systemInfo?.kernel || '5.15.150'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Interface</span>
          <span className="font-mono text-blue-400">uBus + Dropbear</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 glass-panel border-r border-slate-800/80 flex-col shrink-0 h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] h-full bg-[#090d16] border-r border-slate-800 z-50 shadow-2xl flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
