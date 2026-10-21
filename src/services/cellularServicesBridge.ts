import type {
  SmsMessage,
  UssdSession,
  UssdShortcut,
  VoiceCall,
  CellularVoiceStatus,
} from '../types/cellularServices';
import type { RouterProfile } from '../types/router';
import { isTauri } from './tauriBridge';

async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<T>(cmd, args);
    } catch (err: unknown) {
      console.warn(`[Tauri CellularServices: ${cmd}] native error:`, err);
      throw err;
    }
  }
  throw new Error('Not running inside Tauri desktop environment');
}

// Sri Lanka & Global USSD Shortcuts
export const USSD_SHORTCUTS: UssdShortcut[] = [
  {
    id: 'ussd-dialog-bal',
    title: 'Check Main Balance',
    code: '*100#',
    category: 'balance',
    description: 'Account balance, validity & credit limit (Dialog / Mobitel)',
    carrier: 'Dialog / Mobitel',
  },
  {
    id: 'ussd-dialog-data',
    title: 'Check Data Quota',
    code: '*456#',
    category: 'data',
    description: 'Active 5G/4G anytime and nighttime quota balances',
    carrier: 'Dialog',
  },
  {
    id: 'ussd-sim-number',
    title: 'My Phone Number',
    code: '*132#',
    category: 'info',
    description: 'Retrieve MSISDN phone number and SIM profile info',
    carrier: 'All Carriers',
  },
  {
    id: 'ussd-loan',
    title: 'Emergency Credit Loan',
    code: '*544#',
    category: 'services',
    description: 'Request instant emergency credit top-up',
    carrier: 'Dialog / Mobitel',
  },
  {
    id: 'ussd-mobitel-bal',
    title: 'Mobitel Account Balance',
    code: '*123#',
    category: 'balance',
    description: 'SLTMobitel account balance & validity inquiry',
    carrier: 'SLTMobitel',
  },
  {
    id: 'ussd-airtel-bal',
    title: 'Airtel Balance & Offers',
    code: '*555#',
    category: 'balance',
    description: 'Airtel Sri Lanka account balance & unlimited bundles',
    carrier: 'Airtel',
  },
  {
    id: 'ussd-hutch-bal',
    title: 'Hutch Account & Data',
    code: '*344#',
    category: 'balance',
    description: 'Hutch Sri Lanka balance & data bundle inquiry',
    carrier: 'Hutch',
  },
  {
    id: 'ussd-vas',
    title: 'Value Added Services',
    code: '*678#',
    category: 'services',
    description: 'Manage active subscriptions and caller tunes',
    carrier: 'Dialog',
  },
];

class MockCellularServicesEngine {
  private voiceStatus: CellularVoiceStatus = {
    inCall: false,
    volteRegistered: false,
    imsRegistered: false,
    codec: 'Idle',
    emergencyCallsOnly: false,
    msisdn: undefined,
    smsCenter: undefined,
    simStorage: {
      used: 0,
      total: 50,
      preferred: 'SIM',
    },
  };

  public getMessages(): { messages: SmsMessage[]; storage: CellularVoiceStatus['simStorage'] } {
    return {
      messages: [],
      storage: {
        used: 0,
        total: 50,
        preferred: 'SIM',
      },
    };
  }

  public sendMessage(_recipient: string, _text: string): SmsMessage {
    throw new Error('Router disconnected: Cannot send SMS. Please connect to your OpenWrt router.');
  }

  public deleteMessage(_id: string): boolean {
    return true;
  }

  public markAsRead(_id: string): void {}

  public executeUssd(code: string): UssdSession {
    throw new Error(`Router disconnected: Cannot run USSD [${code}]. Please connect to your OpenWrt router.`);
  }

  public initiateCall(number: string): VoiceCall {
    throw new Error(`Router disconnected: Cannot dial ${number}. Please connect to your OpenWrt router.`);
  }

  public hangupCall(): boolean {
    return true;
  }

  public getCallHistory(): VoiceCall[] {
    return [];
  }

  public getVoiceStatus(): CellularVoiceStatus {
    return { ...this.voiceStatus };
  }
}

export const mockCellularServices = new MockCellularServicesEngine();

export const cellularServicesApi = {
  getSmsMessages: async (
    profile: RouterProfile
  ): Promise<{ messages: SmsMessage[]; storage: CellularVoiceStatus['simStorage'] }> => {
    if (isTauri()) {
      return await safeInvoke<{
        messages: SmsMessage[];
        storage: CellularVoiceStatus['simStorage'];
      }>('get_sms_messages', { profile });
    }
    return mockCellularServices.getMessages();
  },

  sendSmsMessage: async (
    profile: RouterProfile,
    number: string,
    text: string
  ): Promise<{ success: boolean; message: string; sms?: SmsMessage }> => {
    if (isTauri()) {
      return await safeInvoke<{
        success: boolean;
        message: string;
        sms?: SmsMessage;
      }>('send_sms_message', { profile, number, text });
    }
    const sms = mockCellularServices.sendMessage(number, text);
    return { success: true, message: 'SMS sent via cellular network', sms };
  },

  deleteSmsMessage: async (
    profile: RouterProfile,
    messageId: string
  ): Promise<{ success: boolean; message: string }> => {
    if (isTauri()) {
      return await safeInvoke<{ success: boolean; message: string }>('delete_sms_message', {
        profile,
        messageId,
      });
    }
    mockCellularServices.deleteMessage(messageId);
    return { success: true, message: 'SMS message deleted' };
  },

  executeUssdCode: async (profile: RouterProfile, code: string): Promise<UssdSession> => {
    if (isTauri()) {
      return await safeInvoke<UssdSession>('execute_ussd_code', { profile, code });
    }
    return mockCellularServices.executeUssd(code);
  },

  initiateVoiceCall: async (
    profile: RouterProfile,
    number: string
  ): Promise<{ success: boolean; callId: string; number: string; status: string; message?: string }> => {
    if (isTauri()) {
      return await safeInvoke<{
        success: boolean;
        callId: string;
        number: string;
        status: string;
        message?: string;
      }>('initiate_voice_call', { profile, number });
    }
    const call = mockCellularServices.initiateCall(number);
    return { success: true, callId: call.id, number: call.number, status: call.status };
  },

  hangupVoiceCall: async (
    profile: RouterProfile,
    callId?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (isTauri()) {
      return await safeInvoke<{ success: boolean; message: string }>('hangup_voice_call', {
        profile,
        callId,
      });
    }
    mockCellularServices.hangupCall();
    return { success: true, message: 'Call terminated' };
  },

  getVoiceCallStatus: async (profile: RouterProfile): Promise<CellularVoiceStatus> => {
    if (isTauri()) {
      return await safeInvoke<CellularVoiceStatus>('get_voice_call_status', { profile });
    }
    return mockCellularServices.getVoiceStatus();
  },

  getCallHistory: async (): Promise<VoiceCall[]> => {
    return mockCellularServices.getCallHistory();
  },
};
