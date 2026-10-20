import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  BarChart3,
  Download,
  Upload,
  Calendar,
  Clock,
  HardDrive,
  RefreshCw,
  Package,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
} from 'lucide-react';
import { useLogsStore, type VnStatTimeframe } from '../../store/useLogsStore';

export const VnStatTrafficView: React.FC = () => {
  const {
    vnstatData,
    activeInterface,
    setActiveInterface,
    vnstatTimeframe,
    setVnStatTimeframe,
    fetchVnStat,
    installVnStat,
    isInstallingVnstat,
    isLoadingVnstat,
    actionMessage,
  } = useLogsStore();

  const [isGraphMinimized, setIsGraphMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aw1000_vnstat_graph_minimized') === 'true';
    } catch {
      return false;
    }
  });

  const [hourlyChartType, setHourlyChartType] = useState<'area' | 'bar'>('area');

  const toggleMinimizeGraph = () => {
    setIsGraphMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aw1000_vnstat_graph_minimized', String(next));
      } catch {
        // Ignore localStorage quota errors
      }
      return next;
    });
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (!vnstatData) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        <RefreshCw className="w-6 h-6 text-slate-500 animate-spin mx-auto mb-2" />
        Checking vnStat network monitor daemon on OpenWrt...
      </div>
    );
  }

  // If vnStat is NOT installed on router
  if (!vnstatData.installed) {
    return (
      <div className="space-y-6">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-amber-500/30 bg-amber-500/5 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              vnStat Traffic Monitor is Not Installed
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-lg mx-auto">
              vnStat is the standard OpenWrt package that records persistent hourly, daily, and monthly network bandwidth utilization for cellular and Ethernet interfaces without kernel overhead.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => installVnStat()}
              disabled={isInstallingVnstat}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
              {isInstallingVnstat ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Installing vnstat via opkg...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>1-Click Install vnStat (opkg install vnstat)</span>
                </>
              )}
            </button>
          </div>

          {actionMessage && (
            <div className={`p-3 rounded-xl text-xs font-mono border ${
              actionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {actionMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-amber-500/20 text-left text-xs font-sans">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-white block">Hourly Telemetry</span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">Tracks peak usage hours</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-white block">Daily History</span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">30 days of cellular quota</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-white block">Billing Cycles</span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">Monthly data accounting</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active interface object
  const currentIface =
    vnstatData.interfaces.find((i) => i.name === activeInterface) ||
    vnstatData.interfaces[0];

  const totalRx = currentIface ? currentIface.total.rx : 0;
  const totalTx = currentIface ? currentIface.total.tx : 0;
  const todayTotal = currentIface ? currentIface.today.total : 0;
  const monthTotal = currentIface ? currentIface.thisMonth.total : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Controls: Interface Selector & Timeframe Buttons */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                vnStat v{vnstatData.version || '2.10'} Active
              </span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Bandwidth & Traffic Consumption History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Persistent byte-level network accounting logged by the OpenWrt router daemon
            </p>
          </div>

          <button
            onClick={() => fetchVnStat()}
            disabled={isLoadingVnstat}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingVnstat ? 'animate-spin text-blue-400' : ''}`} />
            <span>Update vnStat</span>
          </button>
        </div>

        {/* Interface Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 mr-1">Interface:</span>
            {vnstatData.interfaces.map((iface) => {
              const isSelected = activeInterface === iface.name;
              return (
                <button
                  key={iface.name}
                  onClick={() => setActiveInterface(iface.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>{iface.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({iface.alias})</span>
                </button>
              );
            })}
          </div>

          {/* Timeframe Selector (Hourly, Daily, Monthly) */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
            {[
              { id: 'hourly' as VnStatTimeframe, label: 'Hourly (24h)', icon: Clock },
              { id: 'daily' as VnStatTimeframe, label: 'Daily (30d)', icon: Calendar },
              { id: 'monthly' as VnStatTimeframe, label: 'Monthly (12m)', icon: BarChart3 },
            ].map((tf) => {
              const isSelected = vnstatTimeframe === tf.id;
              const Icon = tf.icon;
              return (
                <button
                  key={tf.id}
                  onClick={() => setVnStatTimeframe(tf.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tf.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Downloaded</span>
            <Download className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 mt-1">
            {formatBytes(totalRx)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            Interface: {currentIface?.name}
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Uploaded</span>
            <Upload className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300 mt-1">
            {formatBytes(totalTx)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            Outbound Traffic
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Today's Traffic</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-300 mt-1">
            {formatBytes(todayTotal)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            RX + TX within 24h
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">This Month Total</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-blue-300 mt-1">
            {formatBytes(monthTotal)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
            Billing Cycle Usage
          </span>
        </div>
      </div>

      {/* Main Interactive Recharts Section (Collapsible & Minimisable) */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>
                  {vnstatTimeframe === 'hourly'
                    ? 'Hourly Traffic Profile (Past 24 Hours in MB)'
                    : vnstatTimeframe === 'daily'
                    ? 'Daily Data Volume (Past 30 Days in GB)'
                    : 'Monthly Bandwidth Consumption (Past 12 Months in GB)'}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Interface: <span className="text-slate-200 font-mono font-semibold">{currentIface?.name}</span> ({currentIface?.alias})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
            {!isGraphMinimized && (
              <div className="flex items-center gap-3 text-xs font-mono mr-2">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Download (RX)
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2.5 h-2.5 rounded bg-purple-400" /> Upload (TX)
                </span>
              </div>
            )}

            {/* Toggle Area vs Bar in Hourly */}
            {!isGraphMinimized && vnstatTimeframe === 'hourly' && (
              <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-mono mr-1">
                <button
                  onClick={() => setHourlyChartType('area')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                    hourlyChartType === 'area'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  <span>Area</span>
                </button>
                <button
                  onClick={() => setHourlyChartType('bar')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                    hourlyChartType === 'bar'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Bar</span>
                </button>
              </div>
            )}

            {/* Minimize / Expand Graph Toggle Button */}
            <button
              onClick={toggleMinimizeGraph}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors shadow-sm"
              title={isGraphMinimized ? 'Expand full graphical charts' : 'Minimize graph view'}
            >
              {isGraphMinimized ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                  <span>Expand Graph</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  <span>Minimize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* The Graphs Content (or Collapsed Minimized Strip) */}
        {isGraphMinimized ? (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-semibold text-white">Graphical Visualizer Minimized</span>
              <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                • {vnstatTimeframe === 'hourly' ? '24 Hours Hourly Curve' : vnstatTimeframe === 'daily' ? '30 Days Daily Data' : '12 Months Historical Consumption'}
              </span>
            </div>

            <button
              onClick={toggleMinimizeGraph}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              <span>Expand Interactive Visualizer</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="h-72 w-full transition-all">
            {vnstatTimeframe === 'hourly' && currentIface && hourlyChartType === 'area' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentIface.hourly}>
                  <defs>
                    <linearGradient id="vnRxGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="vnTxGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} unit=" MB" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="rxMb" name="Download (MB)" stroke="#06b6d4" fill="url(#vnRxGradient)" />
                  <Area type="monotone" dataKey="txMb" name="Upload (MB)" stroke="#a855f7" fill="url(#vnTxGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {vnstatTimeframe === 'hourly' && currentIface && hourlyChartType === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentIface.hourly}>
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} unit=" MB" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="rxMb" name="Download (MB)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="txMb" name="Upload (MB)" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {vnstatTimeframe === 'daily' && currentIface && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentIface.daily}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} unit=" GB" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="rxGb" name="Download (GB)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="txGb" name="Upload (GB)" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {vnstatTimeframe === 'monthly' && currentIface && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentIface.monthly}>
                  <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} unit=" GB" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="rxGb" name="Download (GB)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="txGb" name="Upload (GB)" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Historical Summary Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="p-3.5 bg-slate-950/60 border-b border-slate-800/80 text-xs font-bold text-white flex items-center justify-between">
          <span>Telemetry Breakdown Table ({currentIface?.name})</span>
          <span className="font-mono text-[11px] text-slate-400">
            Units: {vnstatTimeframe === 'hourly' ? 'Megabytes (MB)' : 'Gigabytes (GB)'}
          </span>
        </div>

        <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
          <div className="grid grid-cols-4 p-2.5 bg-slate-900/50 text-[11px] font-semibold text-slate-400">
            <div>Period</div>
            <div className="text-right text-cyan-400">Download (RX)</div>
            <div className="text-right text-purple-400">Upload (TX)</div>
            <div className="text-right text-white">Total Volume</div>
          </div>

          {vnstatTimeframe === 'hourly' &&
            currentIface?.hourly.slice(-12).reverse().map((h) => (
              <div key={h.time} className="grid grid-cols-4 p-2.5 hover:bg-slate-800/30">
                <div className="text-slate-300 font-sans">{h.time}</div>
                <div className="text-right text-cyan-300">{h.rxMb} MB</div>
                <div className="text-right text-purple-300">{h.txMb} MB</div>
                <div className="text-right text-white font-bold">{h.totalMb} MB</div>
              </div>
            ))}

          {vnstatTimeframe === 'daily' &&
            currentIface?.daily.slice(-10).reverse().map((d) => (
              <div key={d.date} className="grid grid-cols-4 p-2.5 hover:bg-slate-800/30">
                <div className="text-slate-300 font-sans">{d.fullDate} ({d.date})</div>
                <div className="text-right text-cyan-300">{d.rxGb} GB</div>
                <div className="text-right text-purple-300">{d.txGb} GB</div>
                <div className="text-right text-white font-bold">{d.totalGb} GB</div>
              </div>
            ))}

          {vnstatTimeframe === 'monthly' &&
            currentIface?.monthly.map((m) => (
              <div key={m.month} className="grid grid-cols-4 p-2.5 hover:bg-slate-800/30">
                <div className="text-slate-300 font-sans">{m.month}</div>
                <div className="text-right text-cyan-300">{m.rxGb} GB</div>
                <div className="text-right text-purple-300">{m.txGb} GB</div>
                <div className="text-right text-white font-bold">{m.totalGb} GB</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
