import React, { useState } from 'react';
import {
  PhoneCall,
  Mail,
  CheckCircle2,
  Save,
  X,
} from 'lucide-react';

export const SimVoiceSettingsView: React.FC = () => {
  const [smsc, setSmsc] = useState('+9477000003');
  const [volteEnabled, setVolteEnabled] = useState(true);
  const [vonrEnabled, setVonrEnabled] = useState(true);
  const [smsStorage, setSmsStorage] = useState<'SIM' | 'ME'>('SIM');
  const [callWaiting, setCallWaiting] = useState(true);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3500);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {savedNotification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Cellular voice & SMS configurations saved and committed to UCI modem subsystem.</span>
          </div>
          <button onClick={() => setSavedNotification(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* VoLTE & Voice over 5G Section */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">VoLTE & VoNR (5G Voice) Subsystem</h3>
              <p className="text-[11px] text-slate-400">
                Configure IP Multimedia Subsystem (IMS) voice calling protocols
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">VoLTE (Voice over LTE)</span>
                <span className="text-[11px] text-slate-400">Enable 4G HD Voice calling</span>
              </div>
              <button
                type="button"
                onClick={() => setVolteEnabled(!volteEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  volteEnabled ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    volteEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">VoNR (Voice over 5G NR)</span>
                <span className="text-[11px] text-slate-400">Native 5G Standalone voice calls</span>
              </div>
              <button
                type="button"
                onClick={() => setVonrEnabled(!vonrEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  vonrEnabled ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    vonrEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">Call Waiting Service</span>
                <span className="text-[11px] text-slate-400">Notify of incoming calls during active session</span>
              </div>
              <button
                type="button"
                onClick={() => setCallWaiting(!callWaiting)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  callWaiting ? 'bg-blue-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    callWaiting ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">IMS Registration Status</span>
                <span className="text-[11px] text-slate-400">Audio Codec: AMR-WB 23.85kbps</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                Registered
              </span>
            </div>
          </div>
        </div>

        {/* SMS Configuration Section */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Mail className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">SMS Service Center & Storage</h3>
              <p className="text-[11px] text-slate-400">
                Configure SMSC gateway number and persistent message memory
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                SMS Service Center (SMSC) Number
              </label>
              <input
                type="text"
                value={smsc}
                onChange={(e) => setSmsc(e.target.value)}
                placeholder="+9477000003"
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Dialog: +9477000003 | SLTMobitel: +9471000003 | Airtel: +9475000003
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred SMS Storage Memory
              </label>
              <select
                value={smsStorage}
                onChange={(e) => setSmsStorage(e.target.value as 'SIM' | 'ME')}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500"
              >
                <option value="SIM">SIM Card Memory (SM - 50 message slots)</option>
                <option value="ME">Modem Flash NVRAM (ME - 250 message slots)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Where incoming SMS messages are indexed by OpenWrt modem
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
