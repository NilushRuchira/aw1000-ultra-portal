import React, { useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Copy,
  Check,
  Radio,
  Shield,
  Wifi,
  Terminal,
  Cpu,
  Layers,
  FileText,
} from 'lucide-react';
import { useLogsStore } from '../../store/useLogsStore';
import type { LogSeverity, LogSource } from '../../types/logs';

export const LogViewerTable: React.FC = () => {
  const {
    logs,
    totalLogs,
    rawLogs,
    isLoading,
    filters,
    setFilters,
    fetchLogs,
    exportLogs,
    isAutoRefresh,
    setAutoRefresh,
  } = useLogsStore();

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawLogs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (sev: LogSeverity) => {
    switch (sev) {
      case 'error':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30">
            ERROR
          </span>
        );
      case 'warn':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
            WARN
          </span>
        );
      case 'notice':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            NOTICE
          </span>
        );
      case 'debug':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-slate-500/15 text-slate-400 border border-slate-500/30">
            DEBUG
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            INFO
          </span>
        );
    }
  };

  const getSourceIcon = (source: LogSource) => {
    switch (source) {
      case 'cellular':
        return <Radio className="w-3.5 h-3.5 text-blue-400" />;
      case 'kernel':
        return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
      case 'firewall':
        return <Shield className="w-3.5 h-3.5 text-rose-400" />;
      case 'dhcp_wifi':
        return <Wifi className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800/80 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs by keyword, IP address, daemon, or message..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Live Poll Toggle */}
            <button
              onClick={() => setAutoRefresh(!isAutoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isAutoRefresh
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAutoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isAutoRefresh ? 'Live Polling' : 'Paused'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchLogs()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* Copy Raw */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Export Dropdown */}
            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
              <button
                onClick={() => exportLogs('txt')}
                className="px-2.5 py-2 hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition-colors"
                title="Download as .log file"
              >
                <Download className="w-3 h-3 text-blue-400" />
                <span>.log</span>
              </button>
              <span className="w-px h-4 bg-slate-800" />
              <button
                onClick={() => exportLogs('json')}
                className="px-2.5 py-2 hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition-colors"
                title="Download as JSON"
              >
                <span>.json</span>
              </button>
            </div>
          </div>
        </div>

        {/* Source and Severity Filters */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1 text-slate-400 mr-1 font-semibold">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Facility:</span>
          </div>

          {[
            { id: 'all' as LogSource, label: 'All Facilities', icon: Layers },
            { id: 'cellular' as LogSource, label: 'Cellular 5G/LTE', icon: Radio },
            { id: 'system' as LogSource, label: 'System (logread)', icon: Terminal },
            { id: 'kernel' as LogSource, label: 'Kernel (dmesg)', icon: Cpu },
            { id: 'firewall' as LogSource, label: 'Firewall', icon: Shield },
            { id: 'dhcp_wifi' as LogSource, label: 'DHCP & Wi-Fi', icon: Wifi },
          ].map((item) => {
            const isSelected = filters.source === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setFilters({ source: item.id })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Severity selector */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-slate-400 font-semibold mr-1">Level:</span>
            {(['all', 'error', 'warn', 'notice', 'info'] as const).map((sev) => {
              const isSelected = filters.severity === sev;
              return (
                <button
                  key={sev}
                  onClick={() => setFilters({ severity: sev })}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition-colors ${
                    isSelected
                      ? sev === 'error'
                        ? 'bg-rose-500 text-white font-bold'
                        : sev === 'warn'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : sev === 'notice'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  {sev}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Log Stream Output Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="p-3.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400">Total Entries:</span>
            <span className="font-bold text-white">{totalLogs}</span>
            {filters.search && (
              <span className="text-blue-400 text-[11px]">
                (Filtered by "{filters.search}")
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Buffer: Circular FIFO in-memory</span>
            <span className="font-mono text-slate-500">
              Limit: {filters.limit} lines
            </span>
          </div>
        </div>

        <div className="max-h-[580px] overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-400 font-sans">No log messages found matching current filters.</p>
              <button
                onClick={() => setFilters({ search: '', severity: 'all', source: 'all' })}
                className="text-xs text-blue-400 hover:underline font-sans"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 sm:px-4 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 group"
              >
                {/* Timestamp */}
                <div className="text-[11px] text-slate-500 whitespace-nowrap shrink-0 sm:w-28 pt-0.5">
                  {log.timestamp}
                </div>

                {/* Severity Badge */}
                <div className="shrink-0 pt-0.5">
                  {getSeverityBadge(log.severity)}
                </div>

                {/* Daemon / Facility Tag */}
                <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-semibold max-w-[140px] truncate">
                  {getSourceIcon(log.facility as LogSource)}
                  <span className="truncate">{log.daemon}</span>
                </div>

                {/* Log Content */}
                <div className="flex-1 text-slate-200 text-xs break-all leading-relaxed pt-0.5 select-text font-sans sm:font-mono">
                  {log.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
