import { create } from 'zustand';
import type { RouterProfile, ProtocolStatus } from '../types/router';
import { routerApi, DEFAULT_PROFILE } from '../services/tauriBridge';

interface ProfileState {
  profiles: RouterProfile[];
  activeProfile: RouterProfile;
  protocolStatus: ProtocolStatus | null;
  isTesting: boolean;
  isConnected: boolean;
  loadProfiles: () => Promise<void>;
  setActiveProfile: (profile: RouterProfile) => void;
  saveProfile: (profile: RouterProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  testCurrentConnection: () => Promise<ProtocolStatus>;
  setConnected: (connected: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [DEFAULT_PROFILE],
  activeProfile: DEFAULT_PROFILE,
  protocolStatus: null,
  isTesting: false,
  isConnected: false,

  loadProfiles: async () => {
    try {
      const list = await routerApi.getProfiles();
      const active = list.find((p) => p.autoConnect) || list[0] || DEFAULT_PROFILE;
      set({ profiles: list, activeProfile: active });
    } catch (e) {
      console.error('Failed to load profiles:', e);
    }
  },

  setActiveProfile: (profile: RouterProfile) => {
    set({ activeProfile: profile, protocolStatus: null, isConnected: false });
  },

  saveProfile: async (profile: RouterProfile) => {
    const list = await routerApi.saveProfile(profile);
    set({ profiles: list, activeProfile: profile });
  },

  deleteProfile: async (id: string) => {
    const list = await routerApi.deleteProfile(id);
    const active = list.find((p) => p.id === get().activeProfile.id) || list[0];
    set({ profiles: list, activeProfile: active });
  },

  testCurrentConnection: async () => {
    set({ isTesting: true });
    try {
      const current = get().activeProfile;
      const result = await routerApi.testConnection(current);
      const status: ProtocolStatus = {
        ubusAvailable: result.ubusAvailable,
        sshAvailable: result.sshAvailable,
        ubusError: result.ubusError,
        sshError: result.sshError,
        missingPackages: result.missingPackages,
        lastChecked: Date.now(),
      };
      const connected = result.ubusAvailable || result.sshAvailable;
      set({ protocolStatus: status, isTesting: false, isConnected: connected });
      return status;
    } catch (err: unknown) {
      const status: ProtocolStatus = {
        ubusAvailable: false,
        sshAvailable: false,
        ubusError: String(err),
        sshError: String(err),
        lastChecked: Date.now(),
      };
      set({ protocolStatus: status, isTesting: false, isConnected: false });
      return status;
    }
  },

  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },
}));
