export interface RouterProfile {
  id: string;
  name: string;
  host: string;
  httpPort: number;
  sshPort: number;
  username: string;
  authType: 'password' | 'privateKey';
  password?: string;
  privateKey?: string;
  useHttps: boolean;
  autoConnect?: boolean;
}

export interface SystemInfo {
  hostname: string;
  model: string;
  release: {
    description: string;
    version: string;
    target: string;
  };
  kernel: string;
  localtime: number;
  uptime: number;
  memory: {
    total: number;
    free: number;
    shared: number;
    buffered: number;
    cached: number;
  };
  load: [number, number, number]; // 1m, 5m, 15m
  rootfs?: {
    total: number;
    free: number;
    used: number;
  };
  thermal?: {
    cpu?: number;
    wifi24?: number;
    wifi5?: number;
    wifi6?: number;
  };
}

export interface WanInfo {
  interface: string;
  proto: string;
  up: boolean;
  ip: string;
  netmask: string;
  gateway: string;
  dns: string[];
  uptime: number;
  rxBytes: number;
  txBytes: number;
  rxRateKbps?: number;
  txRateKbps?: number;
}

export interface WifiSSID {
  ifname: string;
  device: string; // phy0, phy1, etc
  band: '2.4GHz' | '5GHz' | '6GHz';
  ssid: string;
  bssid: string;
  mode: string;
  channel: number;
  channelWidth: string; // '20MHz' | '40MHz' | '80MHz' | '160MHz'
  txPower: number; // dBm
  encryption: string; // 'psk2', 'sae', 'psk2+ccmp', etc
  encryptionDisplay: string;
  hidden: boolean;
  activeClientsCount: number;
  disabled: boolean;
}

export interface ConnectedDevice {
  mac: string;
  ip: string;
  hostname: string;
  vendor?: string;
  interface: string;
  band: '2.4 GHz' | '5 GHz' | '6 GHz' | 'Ethernet';
  signalDbm?: number;
  txRateMbps?: number;
  rxRateMbps?: number;
  leaseExpires?: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface DiagnosticResult {
  id: string;
  command: string;
  name: string;
  output: string;
  exitCode: number;
  timestamp: string;
  durationMs: number;
}

export interface ProtocolStatus {
  ubusAvailable: boolean;
  sshAvailable: boolean;
  ubusError?: string;
  sshError?: string;
  missingPackages?: string[];
  lastChecked: number;
}
