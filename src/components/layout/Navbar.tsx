import React, { useState } from 'react';
import {
  Router as RouterIcon,
  Wifi,
  Terminal,
  RefreshCw,
  Power,
  AlertTriangle,
  Server,
  Layers,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { useProfileStore } from '../../store/useProfileStore';
import { useRouterStore } from '../../store/useRouterStore';
import { routerApi } from '../../services/tauriBridge';

interface NavbarProps {
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  const { profiles, activeProfile, setActiveProfile, protocolStatus, isTesting, testCurrentConnection } =
    useProfileStore();
  const { systemInfo, fetchRouterData, isFallbackSsh } = useRouterStore();
  const [powerModalOpen, setPowerModalOpen] = useState(false);
  const [powerAction, setPowerAction] = useState<'reboot' | 'restart_network' | 'restart_uhttpd' | null>(null);
  const [powerExecuting, setPowerExecuting] = useState(false);
  const [powerResult, setPowerResult] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isInstallingUbus, setIsInstallingUbus] = useState(false);

  const handlePowerAction = async () => {
    if (!powerAction) return;
    setPowerExecuting(true);
    setPowerResult(null);
    try {
      const res = await routerApi.executePowerAction(activeProfile, powerAction);
      setPowerResult(res);
      setTimeout(() => {
        setPowerModalOpen(false);
        setPowerExecuting(false);
        setPowerResult(null);
        fetchRouterData();
      }, 3000);
    } catch (err: unknown) {
      setPowerResult(`Error: ${String(err)}`);
      setPowerExecuting(false);
    }
  };

  const handleInstallUbus = async () => {
    setIsInstallingUbus(true);
    try {
      await routerApi.installUbusPackages(activeProfile);
      await testCurrentConnection();
      await fetchRouterData();
    } catch (e) {
      alert(`Installation failed: ${String(e)}`);
    } finally {
      setIsInstallingUbus(false);
    }
  };

  const getStatusBadge = () => {
    if (isTesting) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Probing Router...
        </span>
      );
    }

    if (protocolStatus?.ubusAvailable && protocolStatus?.sshAvailable) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs shadow-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Dual-Protocol Active
        </span>
      );
    }

    if (isFallbackSsh || protocolStatus?.sshAvailable) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Terminal className="w-3 h-3" />
          SSH Active (uBus Fallback)
        </span>
      );
    }

    if (protocolStatus && !protocolStatus.ubusAvailable && !protocolStatus.sshAvailable) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertTriangle className="w-3 h-3" />
          Offline / Unreachable
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        Online (AW1000)
      </span>
    );
  };

  return (
    <>
      <header className="h-16 px-6 glass-panel border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Router Brand and Host Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <RouterIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Arcadyan AW1000_Ultra
                <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Filogic 830
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 font-mono">
              <span>{activeProfile.host}:{activeProfile.httpPort}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{systemInfo?.release?.version || 'OpenWrt 23.05'}</span>
            </p>
          </div>
        </div>

        {/* Center: Missing uBus Notice (if applicable) */}
        {protocolStatus?.missingPackages && protocolStatus.missingPackages.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>uBus missing `rpcd-mod-rpcsys`</span>
            <button
              onClick={handleInstallUbus}
              disabled={isInstallingUbus}
              className="ml-1 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              {isInstallingUbus ? 'Installing...' : '1-Click Fix'}
            </button>
          </div>
        )}

        {/* Right: Actions, Status & Profile Selector */}
        <div className="flex items-center gap-3">
          {getStatusBadge()}

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs text-slate-200 transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span className="max-w-[120px] truncate font-medium">{activeProfile.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl shadow-2xl p-1.5 z-50 border border-slate-700">
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Saved Profiles
                </div>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProfile(p);
                      setProfileDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      p.id === activeProfile.id
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate font-medium">{p.name}</div>
                    <span className="text-[10px] text-slate-500 font-mono">{p.host}</span>
                  </button>
                ))}
                <div className="mt-1 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full text-center px-3 py-1.5 rounded-lg text-xs text-blue-400 hover:bg-blue-500/10 font-medium transition-colors"
                  >
                    + Manage Profiles / Setup
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Refresh Polling Button */}
          <button
            onClick={() => fetchRouterData()}
            title="Refresh Router Metrics"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Power Actions Button */}
          <button
            onClick={() => setPowerModalOpen(true)}
            title="Router Power & Service Actions"
            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Power Confirmation Modal */}
      {powerModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700/80 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Power className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Router Power Actions</h3>
                <p className="text-xs text-slate-400">Perform maintenance commands on Arcadyan AW1000</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label
                onClick={() => setPowerAction('reboot')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  powerAction === 'reboot'
                    ? 'border-rose-500 bg-rose-500/10'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white">Soft Reboot (`reboot`)</div>
                  <div className="text-xs text-slate-400">Restarts OpenWrt OS cleanly. Will disconnect for ~60s.</div>
                </div>
              </label>

              <label
                onClick={() => setPowerAction('restart_network')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  powerAction === 'restart_network'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <Wifi className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white">Restart Network Daemon</div>
                  <div className="text-xs text-slate-400">`/etc/init.d/network restart` (reloads interfaces & Wi-Fi).</div>
                </div>
              </label>

              <label
                onClick={() => setPowerAction('restart_uhttpd')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  powerAction === 'restart_uhttpd'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white">Restart uhttpd & uBus</div>
                  <div className="text-xs text-slate-400">`/etc/init.d/uhttpd restart` (fixes HTTP JSON-RPC state).</div>
                </div>
              </label>
            </div>

            {powerResult && (
              <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
                {powerResult}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPowerModalOpen(false)}
                disabled={powerExecuting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePowerAction}
                disabled={!powerAction || powerExecuting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {powerExecuting ? 'Executing Command...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
