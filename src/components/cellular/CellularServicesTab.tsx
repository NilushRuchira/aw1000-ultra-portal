import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Phone,
  Hash,
  Settings2,
  Radio,
  PhoneCall,
  HardDrive,
} from 'lucide-react';
import { SmsView } from './SmsView';
import { VoiceDialerView } from './VoiceDialerView';
import { UssdRunnerView } from './UssdRunnerView';
import { SimVoiceSettingsView } from './SimVoiceSettingsView';
import { useCellularServicesStore } from '../../store/useCellularServicesStore';

type CellularSubTab = 'messages' | 'dialer' | 'ussd' | 'settings';

export const CellularServicesTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<CellularSubTab>('messages');
  const {
    messages,
    simStorage,
    activeCall,
    fetchMessages,
    fetchVoiceStatus,
    setDialerNumber,
    startCall,
  } = useCellularServicesStore();

  useEffect(() => {
    fetchMessages();
    fetchVoiceStatus();
  }, [fetchMessages, fetchVoiceStatus]);

  const handleStartCallWithNumber = (number: string) => {
    setDialerNumber(number);
    setActiveSubTab('dialer');
    startCall(number);
  };

  const unreadCount = messages.filter((m) => !m.read && m.type === 'inbox').length;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                <PhoneCall className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Cellular Services
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SIM Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Native SMS Messaging, Voice / VoLTE calling, interactive USSD execution, and cellular SIM management on Arcadyan AW1000_Ultra.
            </p>
          </div>

          {/* Quick Carrier & Status Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-300 font-medium">Dialog 5G SA</span>
              <span className="text-[10px] text-slate-400 font-mono">41302</span>
            </div>

            <div className="px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200 font-mono font-medium">+94 77 123 4567</span>
            </div>

            <div className="px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400 text-[11px]">
                SMS: <strong className="text-slate-200">{simStorage.used}/{simStorage.total}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Sub-tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('messages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubTab === 'messages'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>SMS Messages</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('dialer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubTab === 'dialer'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Voice & VoLTE Dialer</span>
          {activeCall && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('ussd')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubTab === 'ussd'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <Hash className="w-4 h-4" />
          <span>USSD Codes & Balance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubTab === 'settings'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>SIM & Voice Settings</span>
        </button>
      </div>

      {/* Active Tab View */}
      <div>
        {activeSubTab === 'messages' && (
          <SmsView onStartCallWithNumber={handleStartCallWithNumber} />
        )}
        {activeSubTab === 'dialer' && <VoiceDialerView />}
        {activeSubTab === 'ussd' && <UssdRunnerView />}
        {activeSubTab === 'settings' && <SimVoiceSettingsView />}
      </div>
    </div>
  );
};
