export interface CellularStatus {
  connected: boolean;
  operator: {
    name: string;
    plmn: string;
    mcc: string;
    mnc: string;
    spn?: string;
    roaming: boolean;
  };
  sim: {
    status: 'READY' | 'LOCKED' | 'ABSENT' | 'ERROR';
    iccid: string;
    imsi: string;
    pinRequired: boolean;
    slot: number;
  };
  technology: '5G SA' | '5G NSA' | 'LTE-A' | 'LTE' | 'WCDMA';
  signal: {
    rsrp: number; // Reference Signal Received Power in dBm (-140 to -44)
    rsrq: number; // Reference Signal Received Quality in dB (-20 to -3)
    rssi: number; // Received Signal Strength Indicator in dBm
    sinr: number; // Signal to Interference plus Noise Ratio in dB (-20 to 30)
    cqi: number;  // Channel Quality Indicator (1-15)
    bars: number; // 0-5
  };
  pcc: {
    band: string;       // e.g. "n78" or "B3"
    bandName?: string;  // e.g. "3500 MHz (C-Band)"
    earfcn: number;     // e.g. 627340
    bandwidthMhz: number; // e.g. 100 or 20
    pci: number;        // Physical Cell ID (0-1007)
    cellId: string;     // E-UTRAN / NCI Cell Identity
    tac: string;        // Tracking Area Code
    rsrp: number;
    sinr: number;
  };
  scc: Array<{
    id: number;
    band: string;
    earfcn: number;
    bandwidthMhz: number;
    pci: number;
    rsrp: number;
    sinr: number;
    active: boolean;
  }>;
  mimo: {
    layers: number;    // e.g. 4
    config: string;    // e.g. "4x4 MIMO DL / 2x2 MIMO UL"
    rankIndicator: number; // RI (1-4)
    transmissionMode: string; // e.g. "TM4 (Closed-loop spatial multiplexing)"
  };
  carrierAggregation: {
    active: boolean;
    mode: string;       // e.g. "3CA (B3+B7+n78)"
    totalBandwidthMhz: number;
  };
}

export interface NeighborCell {
  id: string;
  type: 'LTE' | 'NR5G';
  band: string;
  earfcn: number;
  pci: number;
  rsrp: number;
  rsrq: number;
  sinr?: number;
  isServing: boolean;
  isLocked: boolean;
}

export interface CellLockConfig {
  enabled: boolean;
  technology: 'LTE' | 'NR5G';
  earfcn?: number;
  pci?: number;
  band?: string;
  appliedAt?: string;
}

export interface ApnProfile {
  id: string;
  name: string;
  apn: string;
  pdpType: 'IP' | 'IPV6' | 'IPV4V6';
  authType: 'NONE' | 'PAP' | 'CHAP';
  user?: string;
  password?: string;
  isDefault: boolean;
  mtu?: number;
}

export interface BandLockConfig {
  modePreference: 'AUTO' | '5G_PREF' | '5G_SA' | '5G_NSA' | 'LTE_ONLY';
  lockedLteBands: string[];
  lockedNrBands: string[];
}

export interface AvailableOperator {
  name: string;
  plmn: string;
  technology: string;
  status: 'CURRENT' | 'AVAILABLE' | 'FORBIDDEN';
}

export interface CellAnalysis {
  servingQualityScore: number; // 0 to 100
  interferenceLevel: 'LOW' | 'MODERATE' | 'HIGH';
  pciConflictDetected: boolean;
  recommendation: string;
  metrics: Array<{
    name: string;
    servingValue: string;
    idealRange: string;
    rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    explanation: string;
  }>;
}
