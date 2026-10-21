import { create } from 'zustand';
import type {
  SmsMessage,
  UssdSession,
  VoiceCall,
  CellularVoiceStatus,
} from '../types/cellularServices';
import { cellularServicesApi } from '../services/cellularServicesBridge';
import { useProfileStore } from './useProfileStore';

interface CellularServicesState {
  // SMS
  messages: SmsMessage[];
  activeSmsFilter: 'all' | 'inbox' | 'sent' | 'unread';
  selectedMessage: SmsMessage | null;
  composeOpen: boolean;
  composeRecipient: string;
  composeText: string;
  simStorage: CellularVoiceStatus['simStorage'];
  isLoadingSms: boolean;
  isSendingSms: boolean;
  smsSearchQuery: string;

  // USSD
  ussdInput: string;
  ussdHistory: UssdSession[];
  activeUssdSession: UssdSession | null;
  isRunningUssd: boolean;

  // Calls
  dialerNumber: string;
  activeCall: VoiceCall | null;
  callDuration: number;
  callHistory: VoiceCall[];
  isMuted: boolean;
  isSpeaker: boolean;
  isDialing: boolean;
  voiceStatus: CellularVoiceStatus | null;

  // Actions
  setActiveSmsFilter: (filter: 'all' | 'inbox' | 'sent' | 'unread') => void;
  setSelectedMessage: (msg: SmsMessage | null) => void;
  setComposeOpen: (open: boolean) => void;
  setComposeRecipient: (recipient: string) => void;
  setComposeText: (text: string) => void;
  setSmsSearchQuery: (q: string) => void;
  fetchMessages: () => Promise<void>;
  sendMessage: (recipient: string, text: string) => Promise<boolean>;
  deleteMessage: (id: string) => Promise<boolean>;

  setUssdInput: (code: string) => void;
  runUssd: (code: string) => Promise<void>;
  clearUssdSession: () => void;

  setDialerNumber: (num: string) => void;
  appendToDialer: (digit: string) => void;
  backspaceDialer: () => void;
  startCall: (number: string) => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  fetchCallHistory: () => Promise<void>;
  fetchVoiceStatus: () => Promise<void>;
}

export const useCellularServicesStore = create<CellularServicesState>((set, get) => ({
  // SMS default state
  messages: [],
  activeSmsFilter: 'all',
  selectedMessage: null,
  composeOpen: false,
  composeRecipient: '',
  composeText: '',
  simStorage: {
    used: 5,
    total: 50,
    preferred: 'SIM',
  },
  isLoadingSms: false,
  isSendingSms: false,
  smsSearchQuery: '',

  // USSD default state
  ussdInput: '*100#',
  ussdHistory: [],
  activeUssdSession: null,
  isRunningUssd: false,

  // Calls default state
  dialerNumber: '',
  activeCall: null,
  callDuration: 0,
  callHistory: [],
  isMuted: false,
  isSpeaker: false,
  isDialing: false,
  voiceStatus: null,

  // SMS Actions
  setActiveSmsFilter: (filter) => set({ activeSmsFilter: filter }),
  setSelectedMessage: (msg) => set({ selectedMessage: msg }),
  setComposeOpen: (open) => set({ composeOpen: open }),
  setComposeRecipient: (recipient) => set({ composeRecipient: recipient }),
  setComposeText: (text) => set({ composeText: text }),
  setSmsSearchQuery: (q) => set({ smsSearchQuery: q }),

  fetchMessages: async () => {
    set({ isLoadingSms: true });
    try {
      const profile = useProfileStore.getState().activeProfile;
      const data = await cellularServicesApi.getSmsMessages(profile);
      set({
        messages: data.messages,
        simStorage: data.storage,
        isLoadingSms: false,
      });
    } catch {
      set({ isLoadingSms: false });
    }
  },

  sendMessage: async (recipient: string, text: string) => {
    if (!recipient.trim() || !text.trim()) return false;
    set({ isSendingSms: true });
    try {
      const profile = useProfileStore.getState().activeProfile;
      const res = await cellularServicesApi.sendSmsMessage(profile, recipient, text);
      if (res.success && res.sms) {
        set((state) => ({
          messages: [res.sms!, ...state.messages],
          composeOpen: false,
          composeRecipient: '',
          composeText: '',
          isSendingSms: false,
        }));
        return true;
      }
      set({ isSendingSms: false });
      return false;
    } catch {
      set({ isSendingSms: false });
      return false;
    }
  },

  deleteMessage: async (id: string) => {
    try {
      const profile = useProfileStore.getState().activeProfile;
      await cellularServicesApi.deleteSmsMessage(profile, id);
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== id),
        selectedMessage: state.selectedMessage?.id === id ? null : state.selectedMessage,
      }));
      return true;
    } catch {
      return false;
    }
  },

  // USSD Actions
  setUssdInput: (code: string) => set({ ussdInput: code }),

  runUssd: async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    set({ isRunningUssd: true });
    try {
      const profile = useProfileStore.getState().activeProfile;
      const session = await cellularServicesApi.executeUssdCode(profile, trimmed);
      set((state) => ({
        activeUssdSession: session,
        ussdHistory: [session, ...state.ussdHistory.slice(0, 19)],
        isRunningUssd: false,
        ussdInput: session.actionRequired ? '' : state.ussdInput,
      }));
    } catch {
      set({ isRunningUssd: false });
    }
  },

  clearUssdSession: () => set({ activeUssdSession: null }),

  // Dialer & Call Actions
  setDialerNumber: (num: string) => set({ dialerNumber: num }),

  appendToDialer: (digit: string) =>
    set((state) => ({ dialerNumber: state.dialerNumber + digit })),

  backspaceDialer: () =>
    set((state) => ({ dialerNumber: state.dialerNumber.slice(0, -1) })),

  startCall: async (number: string) => {
    const clean = number.trim();
    if (!clean) return;
    set({ isDialing: true });
    try {
      const profile = useProfileStore.getState().activeProfile;
      const res = await cellularServicesApi.initiateVoiceCall(profile, clean);
      const call: VoiceCall = {
        id: res.callId,
        number: clean,
        name: clean === '+94777890123' ? 'Network Operations Tech' : 'Outgoing VoLTE Call',
        direction: 'outgoing',
        durationSeconds: 0,
        timestamp: new Date().toLocaleTimeString(),
        status: 'connected',
        volte: true,
      };
      set({
        activeCall: call,
        callDuration: 0,
        isDialing: false,
        dialerNumber: '',
      });
    } catch {
      set({ isDialing: false });
    }
  },

  endCall: async () => {
    const { activeCall, callHistory, callDuration } = get();
    if (!activeCall) return;
    try {
      const profile = useProfileStore.getState().activeProfile;
      await cellularServicesApi.hangupVoiceCall(profile, activeCall.id);
    } catch {
      // Ignore
    }
    const finishedCall: VoiceCall = {
      ...activeCall,
      durationSeconds: callDuration,
      status: 'ended',
    };
    set({
      activeCall: null,
      callDuration: 0,
      callHistory: [finishedCall, ...callHistory],
      isMuted: false,
      isSpeaker: false,
    });
  },

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleSpeaker: () => set((state) => ({ isSpeaker: !state.isSpeaker })),

  fetchCallHistory: async () => {
    const history = await cellularServicesApi.getCallHistory();
    set({ callHistory: history });
  },

  fetchVoiceStatus: async () => {
    try {
      const profile = useProfileStore.getState().activeProfile;
      const status = await cellularServicesApi.getVoiceCallStatus(profile);
      set({ voiceStatus: status });
    } catch {
      // Ignore
    }
  },
}));
