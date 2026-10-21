export interface SmsMessage {
  id: string;
  sender: string;
  recipient?: string;
  timestamp: string;
  content: string;
  type: 'inbox' | 'sent' | 'draft';
  read: boolean;
  storage: 'SIM' | 'ME' | 'SM';
}

export interface UssdSession {
  code: string;
  response: string;
  actionRequired: boolean;
  timestamp: string;
}

export interface UssdShortcut {
  id: string;
  title: string;
  code: string;
  category: 'balance' | 'data' | 'services' | 'info';
  description: string;
  carrier?: string;
}

export interface VoiceCall {
  id: string;
  number: string;
  name?: string;
  direction: 'outgoing' | 'incoming' | 'missed';
  durationSeconds: number;
  timestamp: string;
  status: 'dialing' | 'connected' | 'ended' | 'missed' | 'failed';
  volte?: boolean;
}

export interface CellularVoiceStatus {
  inCall: boolean;
  activeCallNumber?: string;
  activeCallDuration?: number;
  volteRegistered: boolean;
  imsRegistered: boolean;
  codec: string;
  emergencyCallsOnly: boolean;
  msisdn?: string;
  smsCenter?: string;
  simStorage: {
    used: number;
    total: number;
    preferred: string;
  };
}
