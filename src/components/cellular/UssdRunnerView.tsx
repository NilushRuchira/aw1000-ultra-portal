import React, { useState } from 'react';
import {
  Hash,
  Play,
  RotateCcw,
  Sparkles,
  Send,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useCellularServicesStore } from '../../store/useCellularServicesStore';
import { toast } from '../../store/useToastStore';
import { USSD_SHORTCUTS } from '../../services/cellularServicesBridge';
import type { UssdShortcut } from '../../types/cellularServices';

export const UssdRunnerView: React.FC = () => {
  const {
    ussdInput,
    ussdHistory,
    activeUssdSession,
    isRunningUssd,
    ussdError,
    setUssdInput,
    runUssd,
    clearUssdSession,
  } = useCellularServicesStore();

  const [replyInput, setReplyInput] = useState('');

  const handleExecute = async (codeToRun?: string) => {
    const code = codeToRun || ussdInput;
    if (!code.trim()) return;
    await runUssd(code);
    const err = useCellularServicesStore.getState().ussdError;
    if (err) {
      toast.error('USSD Failed', err);
    } else {
      toast.success('USSD Received', `Response received for code ${code}`);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    const sent = replyInput;
    setReplyInput('');
    await runUssd(sent);
    const err = useCellularServicesStore.getState().ussdError;
    if (err) {
      toast.error('USSD Reply Failed', err);
    }
  };

  const handleShortcutClick = (shortcut: UssdShortcut) => {
    setUssdInput(shortcut.code);
    handleExecute(shortcut.code);
  };

  return (
    <div className="space-y-5">
      {/* USSD Input Console */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">USSD Interactive Runner</h3>
              <p className="text-[11px] text-slate-400">
                Execute GSM Unstructured Supplementary Service Data codes (Balance, Bundles & VAS)
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
            3GPP TS 22.090
          </span>
        </div>

        {/* Command bar */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
              &gt;
            </span>
            <input
              type="text"
              placeholder="Enter USSD code (e.g. *100#, *456#, *132#)..."
              value={ussdInput}
              onChange={(e) => setUssdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExecute();
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-xs sm:text-sm rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-blue-500 tracking-wider"
            />
          </div>

          <button
            onClick={() => handleExecute()}
            disabled={isRunningUssd || !ussdInput.trim()}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs shadow-blue-500/20 transition-all shrink-0"
          >
            <Play className={`w-4 h-4 fill-current ${isRunningUssd ? 'animate-spin' : ''}`} />
            <span>{isRunningUssd ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Router USSD Error Banner */}
      {ussdError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{ussdError}</span>
          </div>
          <span className="text-[10px] text-rose-400 font-mono">Modem / Network Error</span>
        </div>
      )}

      {/* Active USSD Session Window */}
      {activeUssdSession && (
        <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
              <span className="text-xs font-bold text-white font-mono">
                USSD Session [{activeUssdSession.code}]
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeUssdSession.timestamp}
              </span>
            </div>

            <button
              onClick={clearUssdSession}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Dismiss</span>
            </button>
          </div>

          {/* Response Text Box */}
          <div className="bg-[#0b101b] border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/30">
            {activeUssdSession.response}
          </div>

          {/* Multi-step prompt responder */}
          {activeUssdSession.actionRequired && (
            <form onSubmit={handleReply} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Enter option number or reply (e.g. 1, 2, 3)..."
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                autoFocus
                className="flex-1 bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!replyInput.trim() || isRunningUssd}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reply</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Quick Carrier Shortcuts Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Quick Operator USSD Shortcuts (Sri Lanka & Global)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {USSD_SHORTCUTS.map((item) => (
            <div
              key={item.id}
              onClick={() => handleShortcutClick(item)}
              className="p-3.5 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl cursor-pointer transition-all group flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                    {item.code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span>{item.carrier}</span>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                  Run <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past USSD History */}
      {ussdHistory.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Recent USSD Queries ({ussdHistory.length})
            </h4>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {ussdHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono font-bold text-blue-400">{item.code}</span>
                  <span className="font-mono">{item.timestamp}</span>
                </div>
                <p className="font-mono text-slate-300 whitespace-pre-wrap text-[11px] line-clamp-2">
                  {item.response}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
