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
  private messages: SmsMessage[] = [
    {
      id: 'sms-1',
      sender: 'Dialog5G',
      recipient: '+94771234567',
      timestamp: '2026-10-21 18:45:12',
      content: 'Welcome to Dialog 5G SA Ultra! Your SIM is provisioned for Gigabit Home Broadband on n78 band (3500 MHz). Dial *100# for balance.',
      type: 'inbox',
      read: true,
      storage: 'SIM',
    },
    {
      id: 'sms-2',
      sender: '+94777890123',
      recipient: '+94771234567',
      timestamp: '2026-10-21 16:30:00',
      content: 'Hey, is the router online? The 5G signal strength in Colombo 03 is looking solid today with 28 dB SINR.',
      type: 'inbox',
      read: true,
      storage: 'SIM',
    },
    {
      id: 'sms-3',
      sender: 'DialogNotify',
      recipient: '+94771234567',
      timestamp: '2026-10-21 14:15:22',
      content: 'Your 5G Unlimited Home Broadband Package has been automatically renewed. Enjoy uninterrupted high-speed internet.',
      type: 'inbox',
      read: false,
      storage: 'SIM',
    },
    {
      id: 'sms-4',
      sender: 'VerifyOtp',
      recipient: '+94771234567',
      timestamp: '2026-10-21 09:20:41',
      content: 'Your router admin security verification code is 849201. Valid for 10 minutes. Do not share this OTP with anyone.',
      type: 'inbox',
      read: true,
      storage: 'SIM',
    },
    {
      id: 'sms-5',
      sender: '+94771234567',
      recipient: '+94777890123',
      timestamp: '2026-10-20 22:11:05',
      content: 'Yes, SINR is at 28 dB and RSRP is -72 dBm. Running flawlessly on Arcadyan AW1000 with Quectel 5G modem.',
      type: 'sent',
      read: true,
      storage: 'ME',
    },
  ];

  private callHistory: VoiceCall[] = [
    {
      id: 'call-1',
      number: '+94777890123',
      name: 'Network Operations Tech',
      direction: 'outgoing',
      durationSeconds: 142,
      timestamp: '2026-10-21 17:15:00',
      status: 'ended',
      volte: true,
    },
    {
      id: 'call-2',
      number: '+94112678900',
      name: 'Dialog Broadband Hotline',
      direction: 'incoming',
      durationSeconds: 310,
      timestamp: '2026-10-20 15:40:22',
      status: 'ended',
      volte: true,
    },
    {
      id: 'call-3',
      number: '+94712345678',
      name: 'Unknown Caller',
      direction: 'missed',
      durationSeconds: 0,
      timestamp: '2026-10-19 11:05:14',
      status: 'missed',
      volte: true,
    },
  ];

  private activeCall: VoiceCall | null = null;
  private voiceStatus: CellularVoiceStatus = {
    inCall: false,
    volteRegistered: true,
    imsRegistered: true,
    codec: 'AMR-WB (VoLTE HD Voice)',
    emergencyCallsOnly: false,
    msisdn: '+94 77 123 4567',
    smsCenter: '+9477000003',
    simStorage: {
      used: 5,
      total: 50,
      preferred: 'SIM',
    },
  };

  public getMessages(): { messages: SmsMessage[]; storage: CellularVoiceStatus['simStorage'] } {
    return {
      messages: [...this.messages],
      storage: {
        used: this.messages.length,
        total: 50,
        preferred: 'SIM',
      },
    };
  }

  public sendMessage(recipient: string, text: string): SmsMessage {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newMsg: SmsMessage = {
      id: `sms-${Date.now()}`,
      sender: '+94771234567',
      recipient,
      timestamp: timeStr,
      content: text,
      type: 'sent',
      read: true,
      storage: 'ME',
    };

    this.messages.unshift(newMsg);
    return newMsg;
  }

  public deleteMessage(id: string): boolean {
    const idx = this.messages.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.messages.splice(idx, 1);
      return true;
    }
    return false;
  }

  public markAsRead(id: string): void {
    const msg = this.messages.find((m) => m.id === id);
    if (msg) {
      msg.read = true;
    }
  }

  public executeUssd(code: string): UssdSession {
    const trimmed = code.trim();
    let responseText = '';

    switch (trimmed) {
      case '*100#':
      case '*123#':
        responseText =
          'Dialog Mobile Account Summary:\n1. Main Balance: LKR 482.50\n2. 5G Home Broadband: Active\n3. Data Quota Remaining: 42.6 GB\n4. Outstanding: LKR 0.00\n5. My Account & Plans\nReply with option number to proceed.';
        break;
      case '*456#':
      case '*678#':
        responseText =
          'Active Internet Packages:\n- 5G Unlimited Home Pro (n78 Band, Speed: 1 Gbps)\n- Anytime Data: 42.6 GB / 50 GB remaining (Valid till 2026-11-15)\n- Night Bonus: 28.1 GB remaining\nReply 1 for Add-ons, 2 to Deactivate.';
        break;
      case '*132#':
      case '*131#':
        responseText =
          'SIM & Network Information:\nMSISDN: +94 77 123 4567\nOperator: Dialog 5G SA (PLMN 41302)\nIMSI: 413020084920194\nStatus: Pre-Activated High Priority Data SIM';
        break;
      case '*544#':
        responseText =
          'Emergency Loan & Credit:\nEligible Credit: LKR 100.00\n1. Activate LKR 100 Loan\n2. Activate LKR 50 Loan\n3. Check Loan History\nReply with option number.';
        break;
      case '1':
        responseText =
          'Option 1 Selected: Main Balance is LKR 482.50. Last recharge: LKR 1,000.00 on 2026-10-14. Thank you for using Dialog.';
        break;
      case '2':
        responseText =
          'Option 2 Selected: 5G Home Broadband is Active. Current Speed tier: Ultra High Speed (MediaTek Filogic + Qualcomm 5G RF).';
        break;
      case '3':
        responseText =
          'Option 3 Selected: Data Quota Remaining: 42.6 GB Anytime / 28.1 GB Night. Validity ends in 24 days.';
        break;
      default:
        responseText = `Operator USSD Response for [${trimmed}]:\nCommand completed successfully. Code 0: Service transaction acknowledged by network.`;
        break;
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const actionRequired = responseText.includes('Reply') || responseText.includes('Option');

    return {
      code: trimmed,
      response: responseText,
      actionRequired,
      timestamp: timeStr,
    };
  }

  public initiateCall(number: string): VoiceCall {
    const clean = number.trim();
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newCall: VoiceCall = {
      id: `call-${Date.now()}`,
      number: clean,
      name: clean === '+94777890123' ? 'Network Operations Tech' : 'Cellular Call',
      direction: 'outgoing',
      durationSeconds: 0,
      timestamp: timeStr,
      status: 'connected',
      volte: true,
    };

    this.activeCall = newCall;
    this.voiceStatus.inCall = true;
    this.voiceStatus.activeCallNumber = clean;
    return newCall;
  }

  public hangupCall(): boolean {
    if (this.activeCall) {
      this.activeCall.status = 'ended';
      this.callHistory.unshift(this.activeCall);
      this.activeCall = null;
    }
    this.voiceStatus.inCall = false;
    this.voiceStatus.activeCallNumber = undefined;
    return true;
  }

  public getCallHistory(): VoiceCall[] {
    return [...this.callHistory];
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
