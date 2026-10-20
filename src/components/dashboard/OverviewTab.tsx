import React from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Globe,
  Clock,
  Thermometer,
  ArrowDownRight,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useRouterStore } from '../../store/useRouterStore';

export const OverviewTab: React.FC = () => {
  const { systemInfo, wanInfo, telemetryHistory } = useRouterStore();

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return parts.join(' ');
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatKbps = (kbps: number) => {
    if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(1)} Mbps`;
    }
    return `${kbps} Kbps`;
  };

  // RAM calculations
  const totalMemMb = systemInfo ? Math.round(systemInfo.memory.total / 1024) : 1024;
  const freeMemMb = systemInfo ? Math.round(systemInfo.memory.free / 1024) : 480;
  const cachedMemMb = systemInfo ? Math.round((systemInfo.memory.cached || 0) / 1024) : 200;
  const usedMemMb = Math.max(0, totalMemMb - freeMemMb);
  const ramPercent = totalMemMb ? Math.round((usedMemMb / totalMemMb) * 100) : 45;

  // Flash calculations
  const totalFlashMb = systemInfo?.rootfs ? Math.round(systemInfo.rootfs.total / 1024) : 1024;
  const usedFlashMb = systemInfo?.rootfs ? Math.round(systemInfo.rootfs.used / 1024) : 160;
  const flashPercent = totalFlashMb ? Math.round((usedFlashMb / totalFlashMb) * 100) : 15;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner: Router Hardware & OpenWrt Release */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-600/10 via-cyan-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                MediaTek MT7986A Filogic 830
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Wi-Fi 6E Tri-Band
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {systemInfo?.model || 'Arcadyan AW1000_Ultra'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-mono">{systemInfo?.release?.description || 'OpenWrt 23.05.3'}</span>
              <span>•</span>
              <span className="font-mono">Linux {systemInfo?.kernel || '5.15.150'}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Host: <span className="font-mono text-slate-300">{systemInfo?.hostname || 'OpenWrt'}</span></span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-4">
            <div className="glass-card rounded-xl p-3 border border-slate-700/60 min-w-[120px] sm:min-w-[140px]">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Uptime
              </div>
              <div className="text-sm sm:text-base font-bold font-mono text-white truncate">
                {systemInfo ? formatUptime(systemInfo.uptime) : '3d 23h 11m'}
              </div>
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-700/60 min-w-[120px] sm:min-w-[140px]">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                WAN IP
              </div>
              <div className="text-sm sm:text-base font-bold font-mono text-emerald-300 truncate">
                {wanInfo?.ip || '198.51.100.42'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Resource Gauges (CPU, RAM, Flash, Thermals) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Load Gauge */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold flex items-center gap-2 text-slate-200">
                <Cpu className="w-4 h-4 text-blue-400" />
                CPU Load Average
              </span>
              <span className="text-xs font-mono font-bold text-blue-400">
                {systemInfo?.load[0].toFixed(2) || '0.24'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Quad-Core ARM Cortex-A53 @ 2.0GHz</p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">1 MIN</span>
              <span className="font-semibold text-slate-200">{systemInfo?.load[0].toFixed(2) || '0.24'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">5 MIN</span>
              <span className="font-semibold text-slate-200">{systemInfo?.load[1].toFixed(2) || '0.31'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">15 MIN</span>
              <span className="font-semibold text-slate-200">{systemInfo?.load[2].toFixed(2) || '0.38'}</span>
            </div>
          </div>
        </div>

        {/* RAM Utilization Gauge */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold flex items-center gap-2 text-slate-200">
                <Activity className="w-4 h-4 text-emerald-400" />
                RAM Utilization
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">{ramPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${ramPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">USED</span>
              <span className="font-semibold text-slate-200">{usedMemMb} MB</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">CACHED</span>
              <span className="font-semibold text-slate-200">{cachedMemMb} MB</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">TOTAL</span>
              <span className="font-semibold text-slate-200">{totalMemMb} MB</span>
            </div>
          </div>
        </div>

        {/* Flash / eMMC Storage */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold flex items-center gap-2 text-slate-200">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                Flash Storage (eMMC)
              </span>
              <span className="text-xs font-mono font-bold text-indigo-400">{flashPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${flashPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">USED</span>
              <span className="font-semibold text-slate-200">{usedFlashMb} MB</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">FREE</span>
              <span className="font-semibold text-slate-200">{totalFlashMb - usedFlashMb} MB</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">TOTAL</span>
              <span className="font-semibold text-slate-200">{totalFlashMb} MB</span>
            </div>
          </div>
        </div>

        {/* Thermal Sensors */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold flex items-center gap-2 text-slate-200">
                <Thermometer className="w-4 h-4 text-amber-400" />
                Thermal Telemetry
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {systemInfo?.thermal?.cpu || 47.0}°C
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Arcadyan Multi-Zone Monitor</p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs font-mono text-center">
            <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/60">
              <span className="text-[9px] text-slate-500 block">2.4G PHY</span>
              <span className="font-semibold text-amber-300">{systemInfo?.thermal?.wifi24 || 48.0}°C</span>
            </div>
            <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/60">
              <span className="text-[9px] text-slate-500 block">5G PHY</span>
              <span className="font-semibold text-amber-300">{systemInfo?.thermal?.wifi5 || 51.2}°C</span>
            </div>
            <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/60">
              <span className="text-[9px] text-slate-500 block">6G PHY</span>
              <span className="font-semibold text-rose-300">{systemInfo?.thermal?.wifi6 || 53.8}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Recharts Section: CPU Load & WAN Bandwidth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time CPU Load Area Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                CPU Load History (1m / 5m / 15m)
              </h3>
              <p className="text-xs text-slate-400">Live multi-core scheduler pressure</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 1m
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> 5m
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> 15m
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="cpu5mGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu1m"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cpuGradient)"
                  name="1m Load"
                />
                <Area
                  type="monotone"
                  dataKey="cpu5m"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#cpu5mGradient)"
                  name="5m Load"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Bandwidth RX/TX Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                WAN Bandwidth Telemetry
              </h3>
              <p className="text-xs text-slate-400">Live RX (Download) & TX (Upload) throughput</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <ArrowDownRight className="w-3.5 h-3.5" />
                RX: {formatKbps(wanInfo?.rxRateKbps || 12400)}
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                TX: {formatKbps(wanInfo?.txRateKbps || 3800)}
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rxGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val > 1000 ? (val / 1000).toFixed(0) + 'M' : val + 'K'}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                  formatter={(val: unknown) => [formatKbps(Number(val) || 0), 'Rate']}
                />
                <Area
                  type="monotone"
                  dataKey="rxRateKbps"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#rxGradient)"
                  name="Download (RX)"
                />
                <Area
                  type="monotone"
                  dataKey="txRateKbps"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#txGradient)"
                  name="Upload (TX)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* WAN Details Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          WAN Uplink Configuration & Interface Status
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          <div className="glass-card rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Interface Protocol
            </span>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 uppercase font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {wanInfo?.proto || 'DHCP Client'}
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Gateway Address
            </span>
            <div className="text-sm font-bold font-mono text-slate-200">
              {wanInfo?.gateway || '198.51.100.1'}
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Primary & Secondary DNS
            </span>
            <div className="text-xs font-bold font-mono text-slate-200 truncate">
              {wanInfo?.dns?.join(', ') || '1.1.1.1, 1.0.0.1'}
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Total Ingress (RX)
            </span>
            <div className="text-sm font-bold font-mono text-cyan-300">
              {formatBytes(wanInfo?.rxBytes || 4125892019)}
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Total Egress (TX)
            </span>
            <div className="text-sm font-bold font-mono text-purple-300">
              {formatBytes(wanInfo?.txBytes || 1948301948)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
