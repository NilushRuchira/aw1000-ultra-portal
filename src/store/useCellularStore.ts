import { create } from 'zustand';
import type {
  CellularStatus,
  NeighborCell,
  CellLockConfig,
  ApnProfile,
  BandLockConfig,
  AvailableOperator,
  CellAnalysis,
} from '../types/cellular';
import { cellularApi, mockCellular, DEFAULT_APN_PROFILES } from '../services/cellularBridge';
import { useProfileStore } from './useProfileStore';

export type CellularSubTab = 'status' | 'cell_lock' | 'band_lock' | 'apn' | 'operators';

interface CellularState {
  subTab: CellularSubTab;
  status: CellularStatus | null;
  neighbors: NeighborCell[];
  cellLock: CellLockConfig;
  bandLock: BandLockConfig;
  apnProfiles: ApnProfile[];
  operators: AvailableOperator[];
  analysis: CellAnalysis | null;
  isLoading: boolean;
  isScanningOperators: boolean;
  actionMessage: { text: string; type: 'success' | 'error' } | null;

  setSubTab: (tab: CellularSubTab) => void;
  fetchCellularData: () => Promise<void>;
  lockCell: (tech: 'LTE' | 'NR5G', earfcn: number, pci: number, band: string, enable: boolean) => Promise<boolean>;
  applyBandLock: (config: BandLockConfig) => Promise<boolean>;
  saveApn: (apn: ApnProfile) => Promise<void>;
  deleteApn: (id: string) => Promise<void>;
  scanAvailableOperators: () => Promise<void>;
  setOperatorSelection: (mode: 'AUTO' | 'MANUAL', plmn?: string) => Promise<boolean>;
  clearMessage: () => void;
}

export const useCellularStore = create<CellularState>((set, get) => ({
  subTab: 'status',
  status: null,
  neighbors: [],
  cellLock: mockCellular.getCellLock(),
  bandLock: mockCellular.getBandLock(),
  apnProfiles: [...DEFAULT_APN_PROFILES],
  operators: [],
  analysis: null,
  isLoading: false,
  isScanningOperators: false,
  actionMessage: null,

  setSubTab: (tab: CellularSubTab) => set({ subTab: tab }),

  clearMessage: () => set({ actionMessage: null }),

  fetchCellularData: async () => {
    const profile = useProfileStore.getState().activeProfile;
    try {
      const status = await cellularApi.getStatus(profile);
      const neighbors = await cellularApi.getNeighborCells(profile);
      const analysis = cellularApi.getCellAnalysis(status, neighbors);
      const apns = await cellularApi.getApnProfiles();
      const cellLock = await cellularApi.getCellLock(profile);
      const bandLock = await cellularApi.getBandLock(profile);

      set({
        status,
        neighbors,
        analysis,
        apnProfiles: apns,
        cellLock,
        bandLock,
      });
    } catch (e) {
      console.error('Failed to fetch cellular metrics:', e);
    }
  },

  lockCell: async (tech: 'LTE' | 'NR5G', earfcn: number, pci: number, band: string, enable: boolean) => {
    const profile = useProfileStore.getState().activeProfile;
    set({ isLoading: true });
    try {
      const res = await cellularApi.setCellLock(profile, tech, earfcn, pci, band, enable);
      const cellLock = await cellularApi.getCellLock(profile);
      set({
        actionMessage: { text: res.message, type: 'success' },
        cellLock,
        isLoading: false,
      });
      await get().fetchCellularData();
      return true;
    } catch (e: unknown) {
      set({
        actionMessage: { text: `Cell Lock failed: ${String(e)}`, type: 'error' },
        isLoading: false,
      });
      return false;
    }
  },

  applyBandLock: async (config: BandLockConfig) => {
    const profile = useProfileStore.getState().activeProfile;
    set({ isLoading: true });
    try {
      const res = await cellularApi.setBandLock(profile, config);
      const bandLock = await cellularApi.getBandLock(profile);
      set({
        actionMessage: { text: res.message, type: 'success' },
        bandLock,
        isLoading: false,
      });
      await get().fetchCellularData();
      return true;
    } catch (e: unknown) {
      set({
        actionMessage: { text: `Band Lock failed: ${String(e)}`, type: 'error' },
        isLoading: false,
      });
      return false;
    }
  },

  saveApn: async (apn: ApnProfile) => {
    const profile = useProfileStore.getState().activeProfile;
    const list = await cellularApi.saveApnProfile(profile, apn);
    set({
      apnProfiles: list,
      actionMessage: { text: `APN '${apn.name}' saved and set as active PDP context.`, type: 'success' },
    });
  },

  deleteApn: async (id: string) => {
    const list = await cellularApi.deleteApnProfile(id);
    set({
      apnProfiles: list,
      actionMessage: { text: 'APN profile removed.', type: 'success' },
    });
  },

  scanAvailableOperators: async () => {
    const profile = useProfileStore.getState().activeProfile;
    set({ isScanningOperators: true });
    try {
      const ops = await cellularApi.scanOperators(profile);
      set({ operators: ops, isScanningOperators: false });
    } catch (e: unknown) {
      set({
        actionMessage: { text: `Operator scan failed: ${String(e)}`, type: 'error' },
        isScanningOperators: false,
      });
    }
  },

  setOperatorSelection: async (mode: 'AUTO' | 'MANUAL', plmn?: string) => {
    const profile = useProfileStore.getState().activeProfile;
    set({ isLoading: true });
    try {
      const res = await cellularApi.setOperatorMode(profile, mode, plmn);
      set({
        actionMessage: { text: res.message, type: 'success' },
        isLoading: false,
      });
      await get().fetchCellularData();
      return true;
    } catch (e: unknown) {
      set({
        actionMessage: { text: `Failed to set operator: ${String(e)}`, type: 'error' },
        isLoading: false,
      });
      return false;
    }
  },
}));
