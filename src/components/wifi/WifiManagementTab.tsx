import React, { useState } from 'react';
import {
  Wifi,
  Eye,
  EyeOff,
  Signal,
  CheckCircle2,
  Lock,
  Radio,
  Sliders,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useRouterStore } from '../../store/useRouterStore';
import type { WifiSSID } from '../../types/router';

export const WifiManagementTab: React.FC = () => {
  const { wifiSSIDs, updateWifiSetting } = useRouterStore();
  const [editingSsid, setEditingSsid] = useState<WifiSSID | null>(null);
  const [newSsidName, setNewSsidName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<string | null>(null);

  const openEditModal = (wifi: WifiSSID) => {
    setEditingSsid(wifi);
    setNewSsidName(wifi.ssid);
    setNewPassword('');
    setShowPassword(false);
    setApplyResult(null);
  };

  const handleSaveWifi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSsid || !newSsidName.trim()) return;

    setIsApplying(true);
    setApplyResult(null);

    try {
      const ok = await updateWifiSetting(
        editingSsid.device,
        editingSsid.ifname,
        newSsidName.trim(),
        newPassword.trim() ? newPassword.trim() : undefined
      );

      if (ok) {
        setApplyResult(`SSID successfully updated and 'wifi reload' completed!`);
        setTimeout(() => {
          setEditingSsid(null);
          setIsApplying(false);
          setApplyResult(null);
        }, 1800);
      } else {
        setApplyResult('Failed to apply wireless changes.');
        setIsApplying(false);
      }
    } catch (err: unknown) {
      setApplyResult(`Error: ${String(err)}`);
      setIsApplying(false);
    }
  };

  const getBandBadge = (band: string) => {
    switch (band) {
      case '6GHz':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            Wi-Fi 6E (6 GHz)
          </span>
        );
      case '5GHz':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            5 GHz High-Band
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            2.4 GHz Long-Range
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Radios Summary Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            Arcadyan AW1000 Tri-Band Wireless Controller
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            MediaTek MT7986A (Filogic 830) + MT7975/MT7976/MT7977 RF frontends (UCI managed)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Total Broadcast SSIDs: <span className="font-bold text-blue-400">{wifiSSIDs.length}</span>
          </span>
        </div>
      </div>

      {/* Grid of SSID Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {wifiSSIDs.map((wifi) => (
          <div
            key={wifi.ifname}
            className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-4">
                {getBandBadge(wifi.band)}
                <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {wifi.activeClientsCount} Clients
                </span>
              </div>

              {/* SSID Name & BSSID */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">{wifi.ssid}</span>
                </h3>
                <div className="text-[11px] font-mono text-slate-500 mt-1 flex items-center gap-2">
                  <span>Interface: {wifi.ifname}</span>
                  <span>•</span>
                  <span>BSSID: {wifi.bssid}</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                <div className="glass-card rounded-xl p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Channel</span>
                  <span className="font-mono font-bold text-slate-200">
                    Ch {wifi.channel} ({wifi.channelWidth})
                  </span>
                </div>

                <div className="glass-card rounded-xl p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Tx Power</span>
                  <span className="font-mono font-bold text-slate-200">
                    {wifi.txPower} dBm (~{Math.round(Math.pow(10, wifi.txPower / 10))} mW)
                  </span>
                </div>

                <div className="glass-card rounded-xl p-2.5 border border-slate-800 col-span-2">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Encryption Standard</span>
                  <div className="font-mono font-semibold text-slate-300 flex items-center gap-1.5 mt-0.5 truncate">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{wifi.encryptionDisplay}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5 text-blue-400" />
                {wifi.hidden ? 'Hidden SSID' : 'Broadcasting'}
              </span>

              <button
                onClick={() => openEditModal(wifi)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit SSID Modal */}
      {editingSsid && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-5 sm:p-6 border border-slate-700/80 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Configure Wi-Fi SSID</h3>
                <p className="text-xs text-slate-400">
                  Update {editingSsid.band} interface settings with atomic UCI commit
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveWifi} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Network Name (SSID)
                </label>
                <input
                  type="text"
                  value={newSsidName}
                  onChange={(e) => setNewSsidName(e.target.value)}
                  required
                  placeholder="e.g. Arcadyan_Ultra_WiFi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  WPA2 / WPA3 Passphrase (Pre-Shared Key)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep existing password"
                    minLength={8}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Minimum 8 characters. Leave empty to retain current key.</p>
              </div>

              <div className="glass-card rounded-xl p-3 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Radio Device:</span>
                  <span className="font-mono text-slate-200">{editingSsid.device}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Execution:</span>
                  <span className="font-mono text-blue-400">uci commit wireless & wifi reload</span>
                </div>
              </div>

              {applyResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    applyResult.includes('success')
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{applyResult}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSsid(null)}
                  disabled={isApplying}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isApplying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Applying UCI...
                    </>
                  ) : (
                    'Save & Reload Wi-Fi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
