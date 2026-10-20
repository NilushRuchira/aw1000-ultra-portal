import { create } from 'zustand';
import type {
  LogEntry,
  LogFilterOptions,
  LogTimelinePoint,
  DaemonCount,
  VnStatResult,
} from '../types/logs';
import { logsApi } from '../services/logsBridge';
import { useProfileStore } from './useProfileStore';

export type LogsSubTab = 'viewer' | 'analytics' | 'vnstat';
export type VnStatTimeframe = 'hourly' | 'daily' | 'monthly';

interface LogsState {
  subTab: LogsSubTab;
  logs: LogEntry[];
  totalLogs: number;
  rawLogs: string;
  isLoading: boolean;
  isAutoRefresh: boolean;
  refreshIntervalMs: number;
  filters: LogFilterOptions;
  actionMessage: { text: string; type: 'success' | 'error' } | null;

  // vnStat State
  vnstatData: VnStatResult | null;
  activeInterface: string;
  vnstatTimeframe: VnStatTimeframe;
  isInstallingVnstat: boolean;
  isLoadingVnstat: boolean;

  // Actions
  setSubTab: (tab: LogsSubTab) => void;
  setFilters: (partial: Partial<LogFilterOptions>) => void;
  setAutoRefresh: (enable: boolean) => void;
  setActiveInterface: (iface: string) => void;
  setVnStatTimeframe: (tf: VnStatTimeframe) => void;
  fetchLogs: () => Promise<void>;
  fetchVnStat: () => Promise<void>;
  installVnStat: () => Promise<boolean>;
  exportLogs: (format: 'txt' | 'json') => void;
  clearActionMessage: () => void;

  // Analytics Selectors
  getSeverityCounts: () => { name: string; count: number; color: string }[];
  getTopDaemons: () => DaemonCount[];
  getTimelineData: () => LogTimelinePoint[];
}

export const useLogsStore = create<LogsState>((set, get) => ({
  subTab: 'viewer',
  logs: [],
  totalLogs: 0,
  rawLogs: '',
  isLoading: false,
  isAutoRefresh: true,
  refreshIntervalMs: 5000,
  filters: {
    source: 'all',
    severity: 'all',
    search: '',
    limit: 100,
  },
  actionMessage: null,

  vnstatData: null,
  activeInterface: 'wwan0',
  vnstatTimeframe: 'daily',
  isInstallingVnstat: false,
  isLoadingVnstat: false,

  setSubTab: (tab) => set({ subTab: tab }),

  setFilters: (partial) => {
    set((state) => ({
      filters: { ...state.filters, ...partial },
    }));
    get().fetchLogs();
  },

  setAutoRefresh: (enable) => set({ isAutoRefresh: enable }),

  setActiveInterface: (iface) => set({ activeInterface: iface }),

  setVnStatTimeframe: (tf) => set({ vnstatTimeframe: tf }),

  clearActionMessage: () => set({ actionMessage: null }),

  fetchLogs: async () => {
    const profile = useProfileStore.getState().activeProfile;
    const { filters } = get();
    set({ isLoading: true });
    try {
      const res = await logsApi.getLogs(profile, filters);
      set({
        logs: res.items,
        totalLogs: res.total,
        rawLogs: res.raw,
        isLoading: false,
      });
    } catch (e: unknown) {
      console.error('Failed to retrieve logs:', e);
      set({ isLoading: false });
    }
  },

  fetchVnStat: async () => {
    const profile = useProfileStore.getState().activeProfile;
    set({ isLoadingVnstat: true });
    try {
      const data = await logsApi.getVnStat(profile);
      set({
        vnstatData: data,
        activeInterface: data.interfaces[0]?.name || get().activeInterface,
        isLoadingVnstat: false,
      });
    } catch (e: unknown) {
      console.error('Failed to retrieve vnStat traffic:', e);
      set({ isLoadingVnstat: false });
    }
  },

  installVnStat: async () => {
    const profile = useProfileStore.getState().activeProfile;
    set({ isInstallingVnstat: true });
    try {
      const res = await logsApi.installVnStat(profile);
      set({
        isInstallingVnstat: false,
        actionMessage: {
          text: res.message,
          type: res.success ? 'success' : 'error',
        },
      });
      if (res.success) {
        await get().fetchVnStat();
      }
      return res.success;
    } catch (e: unknown) {
      set({
        isInstallingVnstat: false,
        actionMessage: {
          text: `vnStat install failed: ${String(e)}`,
          type: 'error',
        },
      });
      return false;
    }
  },

  exportLogs: (format: 'txt' | 'json') => {
    const { logs, rawLogs } = get();
    let content = rawLogs;
    let mimeType = 'text/plain';
    let filename = `openwrt-logs-${new Date().toISOString().slice(0, 10)}.log`;

    if (format === 'json') {
      content = JSON.stringify(logs, null, 2);
      mimeType = 'application/json';
      filename = `openwrt-logs-${new Date().toISOString().slice(0, 10)}.json`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  getSeverityCounts: () => {
    const { logs } = get();
    const counts = {
      error: 0,
      warn: 0,
      notice: 0,
      info: 0,
      debug: 0,
    };

    for (const log of logs) {
      if (counts[log.severity] !== undefined) {
        counts[log.severity]++;
      }
    }

    return [
      { name: 'Errors', count: counts.error, color: '#f43f5e' },
      { name: 'Warnings', count: counts.warn, color: '#f59e0b' },
      { name: 'Notices', count: counts.notice, color: '#38bdf8' },
      { name: 'Info', count: counts.info, color: '#10b981' },
      { name: 'Debug', count: counts.debug, color: '#94a3b8' },
    ].filter((item) => item.count > 0 || item.name !== 'Debug');
  },

  getTopDaemons: () => {
    const { logs } = get();
    const map: Record<string, number> = {};
    for (const log of logs) {
      const d = log.daemon || 'system';
      map[d] = (map[d] || 0) + 1;
    }

    return Object.entries(map)
      .map(([daemon, count]) => ({ daemon, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  },

  getTimelineData: () => {
    const { logs } = get();
    if (logs.length === 0) return [];

    // Group logs into 6-10 time buckets based on order
    const bucketCount = Math.min(10, Math.max(4, Math.floor(logs.length / 5)));
    const bucketSize = Math.ceil(logs.length / bucketCount);

    const buckets: LogTimelinePoint[] = [];

    // Process from oldest to newest
    const reversed = [...logs].reverse();

    for (let i = 0; i < reversed.length; i += bucketSize) {
      const slice = reversed.slice(i, i + bucketSize);
      const label = slice[0]?.timestamp || `T-${i}`;

      let error = 0;
      let warn = 0;
      let notice = 0;
      let info = 0;

      for (const item of slice) {
        if (item.severity === 'error') error++;
        else if (item.severity === 'warn') warn++;
        else if (item.severity === 'notice') notice++;
        else info++;
      }

      buckets.push({
        time: label,
        error,
        warn,
        notice,
        info,
        total: slice.length,
      });
    }

    return buckets;
  },
}));
