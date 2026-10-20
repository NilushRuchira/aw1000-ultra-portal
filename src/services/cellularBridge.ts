import type {
  CellularStatus,
  NeighborCell,
  CellLockConfig,
  ApnProfile,
  BandLockConfig,
  AvailableOperator,
  CellAnalysis,
} from '../types/cellular';
import type { RouterProfile } from '../types/router';
import { isTauri } from './tauriBridge';

// Safe wrapper for Tauri invoke
async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<T>(cmd, args);
    } catch (err: unknown) {
      console.warn(`[Tauri cellular: ${cmd}] native error:`, err);
      throw err;
    }
  }
  throw new Error('Not running inside Tauri desktop environment');
}

// Sri Lanka & International default APN profiles
export const DEFAULT_APN_PROFILES: ApnProfile[] = [
  {
    id: 'apn-dialog-bb',
    name: 'Dialog Home Broadband (Sri Lanka)',
    apn: 'dialogbb',
    pdpType: 'IPV4V6',
    authType: 'NONE',
    isDefault: true,
    mtu: 1500,
  },
  {
    id: 'apn-mobitel',
    name: 'SLTMobitel Broadband (Sri Lanka)',
    apn: 'mobitel3g',
    pdpType: 'IPV4V6',
    authType: 'NONE',
    isDefault: false,
    mtu: 1500,
  },
  {
    id: 'apn-airtel',
    name: 'Airtel Sri Lanka',
    apn: 'airtellive',
    pdpType: 'IPV4V6',
    authType: 'NONE',
    isDefault: false,
    mtu: 1500,
  },
  {
    id: 'apn-hutch',
    name: 'Hutch Sri Lanka Broadband',
    apn: 'hutch3g',
    pdpType: 'IPV4V6',
    authType: 'NONE',
    isDefault: false,
    mtu: 1500,
  },
  {
    id: 'apn-generic',
    name: 'Generic Global Internet',
    apn: 'internet',
    pdpType: 'IPV4V6',
    authType: 'NONE',
    isDefault: false,
    mtu: 1420,
  },
];

class MockCellularEngine {
  private cellLock: CellLockConfig = {
    enabled: false,
    technology: 'NR5G',
  };

  private bandLock: BandLockConfig = {
    modePreference: 'AUTO',
    lockedLteBands: ['B1', 'B3', 'B8', 'B40'],
    lockedNrBands: ['n78', 'n41'],
  };

  private apnProfiles: ApnProfile[] = [...DEFAULT_APN_PROFILES];

  // Active registered carrier
  private currentOperator: AvailableOperator = {
    name: 'Dialog 5G (Sri Lanka)',
    plmn: '41302',
    technology: '5G SA / 5G NSA / LTE-A',
    status: 'CURRENT',
  };

  private neighborCells: NeighborCell[] = [
    {
      id: 'cell-pcc',
      type: 'NR5G',
      band: 'n78',
      earfcn: 627340,
      pci: 384,
      rsrp: -78,
      rsrq: -9,
      sinr: 24.5,
      isServing: true,
      isLocked: false,
    },
    {
      id: 'cell-nbr-1',
      type: 'NR5G',
      band: 'n78',
      earfcn: 627340,
      pci: 385,
      rsrp: -86,
      rsrq: -11,
      sinr: 16.0,
      isServing: false,
      isLocked: false,
    },
    {
      id: 'cell-nbr-2',
      type: 'LTE',
      band: 'B3',
      earfcn: 1650,
      pci: 112,
      rsrp: -89,
      rsrq: -12,
      sinr: 13.5,
      isServing: false,
      isLocked: false,
    },
    {
      id: 'cell-nbr-3',
      type: 'LTE',
      band: 'B40',
      earfcn: 39150,
      pci: 218,
      rsrp: -84,
      rsrq: -10,
      sinr: 19.2,
      isServing: false,
      isLocked: false,
    },
    {
      id: 'cell-nbr-4',
      type: 'NR5G',
      band: 'n41',
      earfcn: 504990,
      pci: 104,
      rsrp: -91,
      rsrq: -13,
      sinr: 11.0,
      isServing: false,
      isLocked: false,
    },
  ];

  public getStatus(): CellularStatus {
    // Jitter slightly for realism
    const sinrJitter = +((Math.random() - 0.5) * 1.5).toFixed(1);
    const rsrpJitter = Math.floor((Math.random() - 0.5) * 3);

    const isMobitel = this.currentOperator.plmn === '41301';
    const isAirtel = this.currentOperator.plmn === '41305';
    const isHutch = this.currentOperator.plmn === '41308';

    const opName = isMobitel
      ? 'SLTMobitel 5G'
      : isAirtel
      ? 'Airtel Sri Lanka'
      : isHutch
      ? 'Hutch Sri Lanka'
      : 'Dialog 5G (Sri Lanka)';

    const plmnCode = this.currentOperator.plmn;
    const mncCode = plmnCode.substring(3);

    return {
      connected: true,
      operator: {
        name: opName,
        plmn: plmnCode,
        mcc: '413',
        mnc: mncCode,
        spn: opName.split(' ')[0],
        roaming: false,
      },
      sim: {
        status: 'READY',
        iccid: '89940207823901928471',
        imsi: `${plmnCode}192847192`,
        pinRequired: false,
        slot: 1,
      },
      technology: this.cellLock.enabled
        ? (this.cellLock.technology === 'NR5G' ? '5G SA' : 'LTE-A')
        : (this.bandLock.modePreference === 'LTE_ONLY' ? 'LTE-A' : this.bandLock.modePreference === '5G_NSA' ? '5G NSA' : '5G SA'),
      signal: {
        rsrp: -78 + rsrpJitter,
        rsrq: -9,
        rssi: -58 + rsrpJitter,
        sinr: +(24.5 + sinrJitter).toFixed(1),
        cqi: 14,
        bars: 5,
      },
      pcc: {
        band: this.cellLock.enabled
          ? (this.cellLock.band || (this.cellLock.technology === 'NR5G' ? 'n78' : 'B3'))
          : (this.bandLock.modePreference === 'LTE_ONLY' ? (this.bandLock.lockedLteBands[0] || 'B40') : 'n78'),
        bandName: this.cellLock.enabled
          ? `${this.cellLock.band || (this.cellLock.technology === 'NR5G' ? 'n78' : 'B3')} (Locked Primary Cell)`
          : (this.bandLock.modePreference === 'LTE_ONLY' ? '2300 MHz (TDD LTE-A)' : '3500 MHz (C-Band High Capacity)'),
        earfcn: this.cellLock.enabled
          ? (this.cellLock.earfcn || (this.cellLock.technology === 'NR5G' ? 627340 : 1650))
          : (this.bandLock.modePreference === 'LTE_ONLY' ? 39150 : 627340),
        bandwidthMhz: this.cellLock.enabled
          ? (this.cellLock.band?.startsWith('n') ? 100 : 20)
          : (this.bandLock.modePreference === 'LTE_ONLY' ? 20 : 100),
        pci: this.cellLock.enabled ? (this.cellLock.pci || 384) : 384,
        cellId: '0x4A82F1',
        tac: '0x19B4',
        rsrp: -78 + rsrpJitter,
        sinr: +(24.5 + sinrJitter).toFixed(1),
      },
      scc: [
        {
          id: 1,
          band: 'B40',
          earfcn: 39150,
          bandwidthMhz: 20,
          pci: 218,
          rsrp: -84 + rsrpJitter,
          sinr: 19.2,
          active: true,
        },
        {
          id: 2,
          band: 'B3',
          earfcn: 1650,
          bandwidthMhz: 20,
          pci: 112,
          rsrp: -89 + rsrpJitter,
          sinr: 13.5,
          active: true,
        },
      ],
      mimo: {
        layers: 4,
        config: '4x4 MIMO DL / 2x2 MIMO UL',
        rankIndicator: 4,
        transmissionMode: 'TM4 (Closed-loop Spatial Multiplexing)',
      },
      carrierAggregation: {
        active: true,
        mode: (this.cellLock.enabled && this.cellLock.technology === 'LTE') || this.bandLock.modePreference === 'LTE_ONLY'
          ? '2CA (B40 [20M] + B3 [20M])'
          : '3CA (n78 [100M] + B40 [20M] + B3 [20M])',
        totalBandwidthMhz: (this.cellLock.enabled && this.cellLock.technology === 'LTE') || this.bandLock.modePreference === 'LTE_ONLY'
          ? 40
          : 140,
      },
    };
  }

  public getNeighborCells(): NeighborCell[] {
    const isLocked = this.cellLock.enabled;
    const targetEarfcn = this.cellLock.earfcn;
    const targetPci = this.cellLock.pci;

    const cells: NeighborCell[] = this.neighborCells.map((c) => {
      const match = isLocked && c.pci === targetPci && c.earfcn === targetEarfcn;
      return {
        ...c,
        isServing: isLocked ? match : c.id === 'cell-pcc',
        isLocked: match,
      };
    });

    if (isLocked && targetPci && targetEarfcn && !cells.some((c) => c.isLocked)) {
      cells.unshift({
        id: `cell-custom-${targetPci}-${targetEarfcn}`,
        type: this.cellLock.technology || 'NR5G',
        band: this.cellLock.band || 'n78',
        earfcn: targetEarfcn,
        pci: targetPci,
        rsrp: -79,
        rsrq: -8,
        sinr: 22.0,
        isServing: true,
        isLocked: true,
      });
    }

    return cells;
  }

  public setCellLock(technology: 'LTE' | 'NR5G', earfcn: number, pci: number, band: string, enable: boolean): CellLockConfig {
    if (enable) {
      this.cellLock = {
        enabled: true,
        technology,
        earfcn,
        pci,
        band,
        appliedAt: new Date().toLocaleTimeString(),
      };
    } else {
      this.cellLock = {
        enabled: false,
        technology: 'NR5G',
      };
    }
    return this.cellLock;
  }

  public getCellLock(): CellLockConfig {
    return this.cellLock;
  }

  public setBandLock(config: BandLockConfig): BandLockConfig {
    this.bandLock = { ...config };
    return this.bandLock;
  }

  public getBandLock(): BandLockConfig {
    return this.bandLock;
  }

  public getApnProfiles(): ApnProfile[] {
    return this.apnProfiles;
  }

  public saveApnProfile(profile: ApnProfile): ApnProfile[] {
    const idx = this.apnProfiles.findIndex((p) => p.id === profile.id);
    if (profile.isDefault) {
      this.apnProfiles = this.apnProfiles.map((p) => ({ ...p, isDefault: false }));
    }
    if (idx >= 0) {
      this.apnProfiles[idx] = profile;
    } else {
      this.apnProfiles.push(profile);
    }
    return this.apnProfiles;
  }

  public deleteApnProfile(id: string): ApnProfile[] {
    this.apnProfiles = this.apnProfiles.filter((p) => p.id !== id);
    if (!this.apnProfiles.some((p) => p.isDefault) && this.apnProfiles.length > 0) {
      this.apnProfiles[0].isDefault = true;
    }
    return this.apnProfiles;
  }

  public setRegisteredOperator(plmn: string) {
    const opMap: Record<string, string> = {
      '41302': 'Dialog 5G (Sri Lanka)',
      '41301': 'SLTMobitel 5G (Sri Lanka)',
      '41305': 'Airtel Sri Lanka',
      '41308': 'Hutch Sri Lanka',
    };
    this.currentOperator = {
      name: opMap[plmn] || `Operator (${plmn})`,
      plmn,
      technology: '5G / 4G LTE',
      status: 'CURRENT',
    };
  }

  public analyzeServingCell(status: CellularStatus, neighbors: NeighborCell[]): CellAnalysis {
    const rsrp = status.signal.rsrp;
    const sinr = status.signal.sinr;
    const rsrq = status.signal.rsrq;

    // Calculate quality score (0-100)
    let score = 50;
    if (rsrp >= -80) score += 25;
    else if (rsrp >= -95) score += 15;
    else if (rsrp >= -105) score += 5;
    else score -= 20;

    if (sinr >= 20) score += 25;
    else if (sinr >= 13) score += 15;
    else if (sinr >= 5) score += 5;
    else score -= 15;

    score = Math.max(10, Math.min(99, score));

    // Check interference & PCI collision
    const sameEarfcnNbrs = neighbors.filter(
      (n) => !n.isServing && n.earfcn === status.pcc.earfcn && Math.abs(n.rsrp - rsrp) < 6
    );
    const pciCollision = neighbors.some(
      (n) => !n.isServing && n.pci === status.pcc.pci && n.earfcn === status.pcc.earfcn
    );

    let interferenceLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
    if (sameEarfcnNbrs.length >= 2 || sinr < 8) {
      interferenceLevel = 'HIGH';
    } else if (sameEarfcnNbrs.length === 1 || sinr < 15) {
      interferenceLevel = 'MODERATE';
    }

    let recommendation =
      'Serving cell RF conditions are optimal on Dialog 5G network. 4x4 MIMO and 3CA carrier aggregation are fully engaged.';
    if (interferenceLevel === 'HIGH') {
      recommendation =
        'High co-channel sector interference detected from adjacent tower PCI 385. Consider locking to n78 PCI 384 or testing band lock on B40 / B3.';
    } else if (score < 60) {
      recommendation =
        'Serving cell signal is degraded. Try reorienting external directional antennas or locking to an alternate neighbor cell with higher RSRP.';
    }

    return {
      servingQualityScore: score,
      interferenceLevel,
      pciConflictDetected: pciCollision,
      recommendation,
      metrics: [
        {
          name: 'RSRP (Reference Signal Received Power)',
          servingValue: `${rsrp} dBm`,
          idealRange: '> -80 dBm (Excellent)',
          rating: rsrp >= -80 ? 'EXCELLENT' : rsrp >= -95 ? 'GOOD' : rsrp >= -105 ? 'FAIR' : 'POOR',
          explanation: 'Measures overall signal power of the LTE/5G pilot channel. Key indicator of cell coverage.',
        },
        {
          name: 'SINR (Signal-to-Interference-plus-Noise)',
          servingValue: `${sinr} dB`,
          idealRange: '> 20 dB (Optimal throughput)',
          rating: sinr >= 20 ? 'EXCELLENT' : sinr >= 13 ? 'GOOD' : sinr >= 5 ? 'FAIR' : 'POOR',
          explanation: 'Signal purity ratio. Critical for achieving 256-QAM modulation and multi-gigabit download speeds.',
        },
        {
          name: 'RSRQ (Reference Signal Received Quality)',
          servingValue: `${rsrq} dB`,
          idealRange: '-10 to -3 dB',
          rating: rsrq >= -10 ? 'EXCELLENT' : rsrq >= -15 ? 'GOOD' : 'FAIR',
          explanation: 'Indicates channel quality and cell loading. Lower values mean higher tower congestion.',
        },
        {
          name: 'CQI (Channel Quality Indicator)',
          servingValue: `${status.signal.cqi} / 15`,
          idealRange: '12 - 15 (Max 256-QAM)',
          rating: status.signal.cqi >= 13 ? 'EXCELLENT' : status.signal.cqi >= 10 ? 'GOOD' : 'FAIR',
          explanation: 'Feedback sent to base station indicating the highest modulation scheme the modem can decode.',
        },
        {
          name: 'MIMO Rank Indicator (RI)',
          servingValue: `RI = ${status.mimo.rankIndicator} (4 Layers)`,
          idealRange: 'RI = 4 (4x4 Spatial Streams)',
          rating: status.mimo.rankIndicator === 4 ? 'EXCELLENT' : 'GOOD',
          explanation: 'Number of independent spatial data streams transmitted simultaneously over the air.',
        },
      ],
    };
  }
}

export const mockCellular = new MockCellularEngine();

export const cellularApi = {
  async getStatus(profile: RouterProfile): Promise<CellularStatus> {
    if (isTauri()) {
      try {
        return await safeInvoke<CellularStatus>('get_cellular_status', { profile });
      } catch (e) {
        console.warn('Native get_cellular_status failed, using fallback:', e);
      }
    }
    return mockCellular.getStatus();
  },

  async getNeighborCells(profile: RouterProfile): Promise<NeighborCell[]> {
    if (isTauri()) {
      try {
        return await safeInvoke<NeighborCell[]>('get_neighbor_cells', { profile });
      } catch (e) {
        console.warn('Native get_neighbor_cells failed, using fallback:', e);
      }
    }
    return mockCellular.getNeighborCells();
  },

  async getCellLock(profile: RouterProfile): Promise<CellLockConfig> {
    if (isTauri()) {
      try {
        return await safeInvoke<CellLockConfig>('get_cell_lock', { profile });
      } catch (e) {
        console.warn('Native get_cell_lock failed, using fallback:', e);
      }
    }
    return mockCellular.getCellLock();
  },

  async getBandLock(profile: RouterProfile): Promise<BandLockConfig> {
    if (isTauri()) {
      try {
        return await safeInvoke<BandLockConfig>('get_band_lock', { profile });
      } catch (e) {
        console.warn('Native get_band_lock failed, using fallback:', e);
      }
    }
    return mockCellular.getBandLock();
  },

  async setCellLock(
    profile: RouterProfile,
    technology: 'LTE' | 'NR5G',
    earfcn: number,
    pci: number,
    band: string,
    enable: boolean
  ): Promise<{ success: boolean; message: string }> {
    if (isTauri()) {
      try {
        return await safeInvoke('set_cell_lock', {
          profile,
          technology,
          earfcn,
          pci,
          band,
          enable,
        });
      } catch (e) {
        console.warn('Native set_cell_lock failed, using mock:', e);
      }
    }
    mockCellular.setCellLock(technology, earfcn, pci, band, enable);
    return {
      success: true,
      message: enable
        ? `Successfully locked to ${technology} Band ${band} (EARFCN: ${earfcn}, PCI: ${pci}). Modem radio frontend refreshed.`
        : 'Cell lock released. Modem returned to automatic best-cell handover.',
    };
  },

  async setBandLock(
    profile: RouterProfile,
    config: BandLockConfig
  ): Promise<{ success: boolean; message: string }> {
    if (isTauri()) {
      try {
        return await safeInvoke('set_band_lock', {
          profile,
          modePreference: config.modePreference,
          lockedLteBands: config.lockedLteBands,
          lockedNrBands: config.lockedNrBands,
        });
      } catch (e) {
        console.warn('Native set_band_lock failed, using mock:', e);
      }
    }
    mockCellular.setBandLock(config);
    return {
      success: true,
      message: `Band preference [${config.modePreference}] & ${config.lockedLteBands.length} LTE + ${config.lockedNrBands.length} NR bands committed.`,
    };
  },

  async scanOperators(profile: RouterProfile): Promise<AvailableOperator[]> {
    if (isTauri()) {
      try {
        const ops = await safeInvoke<AvailableOperator[]>('scan_operators', { profile });
        if (ops && ops.length > 0) return ops;
      } catch (e) {
        console.warn('Native scan_operators failed, using mock:', e);
      }
    }
    await new Promise((r) => setTimeout(r, 1200));

    // Sri Lanka cellular operators (MCC 413)
    return [
      {
        name: 'Dialog Axiata (Dialog 5G / 4G)',
        plmn: '41302',
        technology: '5G SA / 5G NSA / LTE-A',
        status: 'CURRENT',
      },
      {
        name: 'SLTMobitel (Mobitel 5G / 4G)',
        plmn: '41301',
        technology: '5G NSA / 4G LTE-A',
        status: 'AVAILABLE',
      },
      {
        name: 'Airtel Sri Lanka',
        plmn: '41305',
        technology: '4G LTE-A (B3/B8/B1)',
        status: 'AVAILABLE',
      },
      {
        name: 'Hutch Sri Lanka (Hutch 4G)',
        plmn: '41308',
        technology: '4G LTE (B3/B8)',
        status: 'AVAILABLE',
      },
    ];
  },

  async setOperatorMode(
    profile: RouterProfile,
    mode: 'AUTO' | 'MANUAL',
    plmn?: string
  ): Promise<{ success: boolean; message: string }> {
    if (isTauri()) {
      try {
        return await safeInvoke('set_operator_mode', { profile, mode, plmn });
      } catch (e) {
        console.warn('Native set_operator_mode failed, using mock:', e);
      }
    }
    if (plmn) {
      mockCellular.setRegisteredOperator(plmn);
    }
    return {
      success: true,
      message: mode === 'AUTO' ? 'Automatic operator selection enabled.' : `Manual registration requested for PLMN ${plmn}.`,
    };
  },

  async getApnProfiles(): Promise<ApnProfile[]> {
    return mockCellular.getApnProfiles();
  },

  async saveApnProfile(profile: RouterProfile, apn: ApnProfile): Promise<ApnProfile[]> {
    if (isTauri() && apn.isDefault) {
      try {
        await safeInvoke('manage_apn', {
          profile,
          action: 'apply',
          apnName: apn.apn,
          pdpType: apn.pdpType,
          authType: apn.authType,
          user: apn.user,
          password: apn.password,
        });
      } catch (e) {
        console.warn('Native manage_apn error:', e);
      }
    }
    return mockCellular.saveApnProfile(apn);
  },

  async deleteApnProfile(id: string): Promise<ApnProfile[]> {
    return mockCellular.deleteApnProfile(id);
  },

  getCellAnalysis(status: CellularStatus, neighbors: NeighborCell[]): CellAnalysis {
    return mockCellular.analyzeServingCell(status, neighbors);
  },
};
