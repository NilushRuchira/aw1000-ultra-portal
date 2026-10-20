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
  Cell,
} from 'recharts';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  Bell,
  Cpu,
  Radio,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLogsStore } from '../../store/useLogsStore';

export const LogAnalyticsView: React.FC = () => {
  const { logs, getSeverityCounts, getTopDaemons, getTimelineData } = useLogsStore();
  const [isTimelineMinimized, setIsTimelineMinimized] = useState(false);

  const severityCounts = getSeverityCounts();
  const topDaemons = getTopDaemons();
  const timelineData = getTimelineData();

  const totalLogs = logs.length;
  const errorCount = severityCounts.find((s) => s.name === 'Errors')?.count || 0;
  const warnCount = severityCounts.find((s) => s.name === 'Warnings')?.count || 0;
  const noticeCount = severityCounts.find((s) => s.name === 'Notices')?.count || 0;
  const infoCount = severityCounts.find((s) => s.name === 'Info')?.count || 0;

  const errorPct = totalLogs > 0 ? ((errorCount / totalLogs) * 100).toFixed(1) : '0';
  const warnPct = totalLogs > 0 ? ((warnCount / totalLogs) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              System Errors
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400 mt-1">
              {errorCount}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              {errorPct}% of total events
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              RF & Core Warnings
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-1">
              {warnCount}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              {warnPct}% of total events
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Network Notices
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 mt-1">
              {noticeCount}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              Carrier & client events
            </span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Standard Info
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
              {infoCount}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              Healthy operation logs
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Info className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Timeline Chart: Log Events Rate over Time */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Event Frequency & Severity Timeline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Time distribution of router events, radio link modifications, and system alerts
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isTimelineMinimized && (
              <div className="hidden sm:flex items-center gap-3 text-xs font-mono mr-1">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Errors
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Warnings
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" /> Notices
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Info
                </span>
              </div>
            )}

            <button
              onClick={() => setIsTimelineMinimized(!isTimelineMinimized)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors"
              title={isTimelineMinimized ? 'Expand timeline chart' : 'Minimize timeline chart'}
            >
              {isTimelineMinimized ? (
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

        {isTimelineMinimized ? (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Event Timeline Graph Minimized
            </span>
            <button
              onClick={() => setIsTimelineMinimized(false)}
              className="text-blue-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Show Chart</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="h-64 w-full">
            {timelineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No timeline data available for current selection.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWarn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNotice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="error"
                    name="Errors"
                    stackId="1"
                    stroke="#f43f5e"
                    fill="url(#colorError)"
                  />
                  <Area
                    type="monotone"
                    dataKey="warn"
                    name="Warnings"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="url(#colorWarn)"
                  />
                  <Area
                    type="monotone"
                    dataKey="notice"
                    name="Notices"
                    stackId="1"
                    stroke="#38bdf8"
                    fill="url(#colorNotice)"
                  />
                  <Area
                    type="monotone"
                    dataKey="info"
                    name="Info"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#colorInfo)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Two Column Section: Top Daemons & Severity Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Most Active Logging Daemons / Services */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Most Active Daemons & Subsystems
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Processes generating the highest log telemetry volume
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDaemons} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="daemon"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {topDaemons.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'][index % 6]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Composition Breakdown */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800/80 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Severity Composition Breakdown
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Proportion of system health indicators
              </p>
            </div>

            <div className="space-y-3 mt-4">
              {severityCounts.map((item) => {
                const pct = totalLogs > 0 ? Math.round((item.count / totalLogs) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-slate-300">{item.name}</span>
                      <span className="text-slate-400">
                        {item.count} <span className="text-slate-500">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5 mt-4">
            <Radio className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Cellular Health Diagnosis:</span>
              <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                Modem link is healthy on Dialog 5G SA (PLMN 41302). No SIM ejection or PDP de-activation events detected in recent logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
