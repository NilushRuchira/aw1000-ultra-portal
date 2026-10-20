export type LogSeverity = 'error' | 'warn' | 'notice' | 'info' | 'debug';

export type LogSource = 'all' | 'system' | 'kernel' | 'cellular' | 'firewall' | 'dhcp_wifi';

export interface LogEntry {
  id: string;
  timestamp: string;
  rawTimestamp?: string;
  severity: LogSeverity;
  facility: string;
  daemon: string;
  message: string;
}

export interface LogFilterOptions {
  source: LogSource;
  severity: 'all' | LogSeverity;
  search: string;
  limit: number;
}

export interface LogTimelinePoint {
  time: string;
  error: number;
  warn: number;
  notice: number;
  info: number;
  total: number;
}

export interface DaemonCount {
  daemon: string;
  count: number;
}

export interface VnStatHourlyPoint {
  time: string; // e.g. "20:00"
  rx: number; // bytes
  tx: number; // bytes
  rxMb: number;
  txMb: number;
  totalMb: number;
}

export interface VnStatDailyPoint {
  date: string; // e.g. "10/20"
  fullDate: string;
  rx: number;
  tx: number;
  rxGb: number;
  txGb: number;
  totalGb: number;
}

export interface VnStatMonthlyPoint {
  month: string; // e.g. "Oct 2026"
  rx: number;
  tx: number;
  rxGb: number;
  txGb: number;
  totalGb: number;
}

export interface VnStatInterface {
  name: string;
  alias: string;
  total: {
    rx: number;
    tx: number;
    total: number;
  };
  today: {
    rx: number;
    tx: number;
    total: number;
  };
  thisMonth: {
    rx: number;
    tx: number;
    total: number;
  };
  hourly: VnStatHourlyPoint[];
  daily: VnStatDailyPoint[];
  monthly: VnStatMonthlyPoint[];
}

export interface VnStatResult {
  installed: boolean;
  version?: string;
  message?: string;
  interfaces: VnStatInterface[];
  activeInterface: string;
  lastUpdated: string;
}
