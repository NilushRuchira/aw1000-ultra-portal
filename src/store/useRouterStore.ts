import { create } from 'zustand';
import type { SystemInfo, WanInfo, WifiSSID, ConnectedDevice } from '../types/router';
import { routerApi, mockRouter } from '../services/tauriBridge';
import { useProfileStore } from './useProfileStore';

export type NavigationTab = 'overview' | 'wifi' | 'devices' | 'terminal' | 'diagnostics' | 'settings';

export interface TelemetryPoint {
  time: string;
  cpu1m: number;
  cpu5m: number;
  cpu15m: number;
  ramUsedPct: number;
  rxRateKbps: number;
  txRateKbps: number;
}

interface RouterState {
  activeTab: NavigationTab;
  systemInfo: SystemInfo | null;
  wanInfo: WanInfo | null;
  wifiSSIDs: WifiSSID[];
  connectedDevices: ConnectedDevice[];
  telemetryHistory: TelemetryPoint[];
  isLoading: boolean;
  isFallbackSsh: boolean;
  lastUpdated: number;
  editingWifi: WifiSSID | null;
  mobileMenuOpen: boolean;

  setActiveTab: (tab: NavigationTab) => void;
  setEditingWifi: (wifi: WifiSSID | null) => void;
  setMobileMenuOpen: (open: boolean) => void;
  fetchRouterData: () => Promise<void>;
  updateWifiSetting: (device: string, ifname: string, newSsid: string, newKey?: string) => Promise<boolean>;
}

export const useRouterStore = create<RouterState>((set, get) => ({
  activeTab: 'overview',
  systemInfo: null,
  wanInfo: null,
  wifiSSIDs: [],
  connectedDevices: [],
  telemetryHistory: [],
  isLoading: false,
  isFallbackSsh: false,
  lastUpdated: 0,
  editingWifi: null,
  mobileMenuOpen: false,

  setActiveTab: (tab: NavigationTab) => set({ activeTab: tab, mobileMenuOpen: false }),
  setEditingWifi: (wifi: WifiSSID | null) => set({ editingWifi: wifi }),
  setMobileMenuOpen: (open: boolean) => set({ mobileMenuOpen: open }),

  fetchRouterData: async () => {
    const profile = useProfileStore.getState().activeProfile;
    try {
      // 1. Try ubus for system info or fallback to SSH/mock
      let sys: SystemInfo;
      let wan: WanInfo;
      let wifis: WifiSSID[];
      let devs: ConnectedDevice[];
      let fallback = false;

      try {
        sys = await routerApi.ubusCall<SystemInfo>(profile, 'system', 'info');
        wan = await routerApi.ubusCall<WanInfo>(profile, 'network.interface.wan', 'status');
      } catch {
        fallback = true;
        sys = mockRouter.getSystemInfo();
        wan = mockRouter.getWanInfo();
      }

      wifis = mockRouter.getWifiSSIDs();
      devs = mockRouter.getConnectedDevices();

      // Compute ram percent
      const ramUsedPct = sys.memory.total
        ? Math.round(((sys.memory.total - sys.memory.free) / sys.memory.total) * 100)
        : 45;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const newPoint: TelemetryPoint = {
        time: timeStr,
        cpu1m: sys.load[0],
        cpu5m: sys.load[1],
        cpu15m: sys.load[2],
        ramUsedPct,
        rxRateKbps: wan.rxRateKbps || Math.round((wan.rxBytes % 1000000) / 50),
        txRateKbps: wan.txRateKbps || Math.round((wan.txBytes % 500000) / 40),
      };

      const updatedHistory = [...get().telemetryHistory, newPoint].slice(-24);

      set({
        systemInfo: sys,
        wanInfo: wan,
        wifiSSIDs: wifis,
        connectedDevices: devs,
        telemetryHistory: updatedHistory,
        isFallbackSsh: fallback,
        lastUpdated: Date.now(),
      });
    } catch (e) {
      console.error('Failed to fetch router telemetry:', e);
    }
  },

  updateWifiSetting: async (device: string, ifname: string, newSsid: string, newKey?: string) => {
    const profile = useProfileStore.getState().activeProfile;
    const res = await routerApi.updateWifi(profile, device, ifname, newSsid, newKey);
    if (res.success) {
      set((state) => ({
        wifiSSIDs: state.wifiSSIDs.map((w) =>
          w.ifname === ifname ? { ...w, ssid: newSsid } : w
        ),
      }));
      return true;
    }
    return false;
  },
}));
