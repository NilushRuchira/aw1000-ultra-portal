import React, { useEffect, useState } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Delete,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useCellularServicesStore } from '../../store/useCellularServicesStore';

interface KeypadButton {
  digit: string;
  sub: string;
}

const KEYPAD_BUTTONS: KeypadButton[] = [
  { digit: '1', sub: ' ' },
  { digit: '2', sub: 'ABC' },
  { digit: '3', sub: 'DEF' },
  { digit: '4', sub: 'GHI' },
  { digit: '5', sub: 'JKL' },
  { digit: '6', sub: 'MNO' },
  { digit: '7', sub: 'PQRS' },
  { digit: '8', sub: 'TUV' },
  { digit: '9', sub: 'WXYZ' },
  { digit: '*', sub: ' ' },
  { digit: '0', sub: '+' },
  { digit: '#', sub: ' ' },
];

export const VoiceDialerView: React.FC = () => {
  const {
    dialerNumber,
    activeCall,
    callHistory,
    isMuted,
    isSpeaker,
    isDialing,
    callError,
    setDialerNumber,
    appendToDialer,
    backspaceDialer,
    startCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    fetchCallHistory,
  } = useCellularServicesStore();

  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    fetchCallHistory();
  }, [fetchCallHistory]);

  // Call timer effect
  useEffect(() => {
    if (!activeCall || activeCall.status !== 'connected') {
      return;
    }
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      setTimerSeconds(0);
    };
  }, [activeCall]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleDigitClick = (digit: string) => {
    appendToDialer(digit);
  };

  const handleCall = () => {
    if (!dialerNumber.trim()) return;
    startCall(dialerNumber);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Dialer & Active Call Pad (Left column) */}
      <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col items-center">
        {activeCall ? (
          // ACTIVE CALL SCREEN
          <div className="w-full flex flex-col items-center py-6 space-y-6 animate-in fade-in zoom-in-95">
            {/* Animated Glowing Ring */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center animate-pulse">
                <PhoneCall className="w-10 h-10 text-emerald-400" />
              </div>
              <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider">
                VoLTE HD
              </span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white tracking-wide">
                {activeCall.number}
              </h3>
              <p className="text-xs text-slate-400">{activeCall.name || 'Cellular Call'}</p>
              <div className="text-xl font-mono font-bold text-emerald-400 pt-1">
                {formatTimer(timerSeconds)}
              </div>
            </div>

            {/* In-Call Controls */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-xs pt-4">
              <button
                onClick={toggleMute}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all ${
                  isMuted
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5 mb-1" /> : <Mic className="w-5 h-5 mb-1" />}
                <span className="text-[10px] font-medium">{isMuted ? 'Muted' : 'Mute'}</span>
              </button>

              <button
                onClick={toggleSpeaker}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all ${
                  isSpeaker
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                }`}
              >
                {isSpeaker ? <Volume2 className="w-5 h-5 mb-1" /> : <VolumeX className="w-5 h-5 mb-1" />}
                <span className="text-[10px] font-medium">{isSpeaker ? 'Speaker On' : 'Speaker'}</span>
              </button>

              <button
                onClick={() => appendToDialer('#')}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
              >
                <span className="text-base font-bold mb-0.5">#</span>
                <span className="text-[10px] font-medium">Keypad</span>
              </button>
            </div>

            {/* End Call Button */}
            <div className="pt-2">
              <button
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform hover:scale-105 active:scale-95"
                title="End Call"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </div>
          </div>
        ) : (
          // DIALPAD INTERFACE
          <div className="w-full max-w-xs space-y-4">
            {callError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-[11px] leading-tight">{callError}</span>
              </div>
            )}

            {/* Number Input Screen */}
            <div className="relative w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between">
              <input
                type="text"
                placeholder="Dial phone number..."
                value={dialerNumber}
                onChange={(e) => setDialerNumber(e.target.value)}
                className="bg-transparent text-lg font-mono font-bold text-white focus:outline-none w-full pr-8 tracking-wider"
              />
              {dialerNumber && (
                <button
                  onClick={backspaceDialer}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Backspace"
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Keypad Matrix (3x4) */}
            <div className="grid grid-cols-3 gap-2.5">
              {KEYPAD_BUTTONS.map((item) => (
                <button
                  key={item.digit}
                  onClick={() => handleDigitClick(item.digit)}
                  className="flex flex-col items-center justify-center h-14 bg-slate-800/60 hover:bg-slate-700/70 active:bg-blue-600/20 border border-slate-700/50 hover:border-slate-600 rounded-2xl transition-all shadow-xs"
                >
                  <span className="text-xl font-bold text-white">{item.digit}</span>
                  <span className="text-[9px] font-medium text-slate-400 tracking-wider">
                    {item.sub}
                  </span>
                </button>
              ))}
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-center pt-2">
              <button
                onClick={handleCall}
                disabled={isDialing || !dialerNumber.trim()}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105 active:scale-95"
                title="Make Call"
              >
                <Phone className={`w-7 h-7 ${isDialing ? 'animate-bounce' : ''}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Call History & Carrier Voice Info (Right column) */}
      <div className="lg:col-span-7 space-y-4">
        {/* VoLTE Status Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">VoLTE & IMS Voice</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  Active (AMR-WB)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                High-definition voice calling over 5G/4G cellular network
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 sm:text-right">
            <div>MSISDN: <span className="text-slate-200 font-semibold">+94 77 123 4567</span></div>
            <div className="text-[10px] text-slate-400">Quectel RG500Q-EA Audio DSP</div>
          </div>
        </div>

        {/* Call Logs Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Call Logs ({callHistory.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Modem Call Log</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {callHistory.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No recent calls recorded.
              </div>
            ) : (
              callHistory.map((call) => {
                const isOutgoing = call.direction === 'outgoing';
                const isIncoming = call.direction === 'incoming';
                const isMissed = call.direction === 'missed';

                return (
                  <div
                    key={call.id}
                    className="p-3 bg-slate-950/60 hover:bg-slate-850 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl border ${
                          isOutgoing
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            : isIncoming
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isOutgoing && <PhoneOutgoing className="w-4 h-4" />}
                        {isIncoming && <PhoneIncoming className="w-4 h-4" />}
                        {isMissed && <PhoneMissed className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {call.name || call.number}
                          </span>
                          {call.volte && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 font-mono">
                              HD
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {call.number} • {call.timestamp}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <div className="text-[11px] font-mono text-slate-300">
                          {call.durationSeconds > 0
                            ? `${Math.floor(call.durationSeconds / 60)}m ${call.durationSeconds % 60}s`
                            : '0s'}
                        </div>
                        <span className="text-[9px] text-slate-400 capitalize">{call.direction}</span>
                      </div>

                      <button
                        onClick={() => {
                          setDialerNumber(call.number);
                          startCall(call.number);
                        }}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-colors"
                        title="Redial this number"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
