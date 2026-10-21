import React, { useState } from 'react';
import {
  Mail,
  Send,
  Trash2,
  RefreshCw,
  Search,
  Plus,
  Phone,
  HardDrive,
  Reply,
  X,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useCellularServicesStore } from '../../store/useCellularServicesStore';
import type { SmsMessage } from '../../types/cellularServices';

interface SmsViewProps {
  onStartCallWithNumber: (number: string) => void;
}

export const SmsView: React.FC<SmsViewProps> = ({ onStartCallWithNumber }) => {
  const {
    messages,
    activeSmsFilter,
    selectedMessage,
    composeOpen,
    composeRecipient,
    composeText,
    simStorage,
    isLoadingSms,
    isSendingSms,
    smsSearchQuery,
    smsError,
    setActiveSmsFilter,
    setSelectedMessage,
    setComposeOpen,
    setComposeRecipient,
    setComposeText,
    setSmsSearchQuery,
    fetchMessages,
    sendMessage,
    deleteMessage,
  } = useCellularServicesStore();

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeRecipient.trim() || !composeText.trim()) return;
    const ok = await sendMessage(composeRecipient, composeText);
    if (ok) {
      showNotification('SMS message dispatched successfully to network.');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteMessage(id);
    if (ok) {
      showNotification('SMS deleted from storage.');
    }
  };

  const handleReply = (msg: SmsMessage) => {
    const target = msg.type === 'sent' && msg.recipient ? msg.recipient : msg.sender;
    setComposeRecipient(target);
    setComposeOpen(true);
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (activeSmsFilter === 'inbox' && m.type !== 'inbox') return false;
    if (activeSmsFilter === 'sent' && m.type !== 'sent') return false;
    if (activeSmsFilter === 'unread' && (m.read || m.type !== 'inbox')) return false;

    if (smsSearchQuery.trim()) {
      const q = smsSearchQuery.toLowerCase();
      const matchSender = m.sender.toLowerCase().includes(q);
      const matchContent = m.content.toLowerCase().includes(q);
      const matchRecipient = m.recipient?.toLowerCase().includes(q);
      return matchSender || matchContent || matchRecipient;
    }
    return true;
  });

  const charCount = composeText.length;
  const maxSingleSms = 160;
  const segments = Math.max(1, Math.ceil(charCount / maxSingleSms));

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Router Error Banner */}
      {smsError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{smsError}</span>
          </div>
          <button
            onClick={() => fetchMessages()}
            className="text-[11px] underline text-rose-300 hover:text-white shrink-0 ml-3"
          >
            Retry Router Query
          </button>
        </div>
      )}

      {/* Top SMS Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveSmsFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSmsFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({messages.length})
            </button>
            <button
              onClick={() => setActiveSmsFilter('inbox')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSmsFilter === 'inbox'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inbox ({messages.filter((m) => m.type === 'inbox').length})
            </button>
            <button
              onClick={() => setActiveSmsFilter('sent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSmsFilter === 'sent'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sent ({messages.filter((m) => m.type === 'sent').length})
            </button>
            <button
              onClick={() => setActiveSmsFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSmsFilter === 'unread'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Unread ({messages.filter((m) => !m.read && m.type === 'inbox').length})
            </button>
          </div>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SMS..."
              value={smsSearchQuery}
              onChange={(e) => setSmsSearchQuery(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500/60"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {/* Storage Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>
              SIM: <span className="text-slate-200 font-mono font-medium">{simStorage.used}/{simStorage.total}</span>
            </span>
          </div>

          <button
            onClick={() => fetchMessages()}
            disabled={isLoadingSms}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition-colors"
            title="Refresh SMS Inbox"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingSms ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={() => {
              setComposeRecipient('');
              setComposeText('');
              setComposeOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New SMS</span>
          </button>
        </div>
      </div>

      {/* Main SMS Interface: Master-Detail List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Messages List (Left column) */}
        <div className="lg:col-span-5 space-y-2 max-h-[560px] overflow-y-auto pr-1">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 text-slate-400 space-y-2">
              <Mail className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No SMS messages found</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              const isUnread = !msg.read && msg.type === 'inbox';
              return (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/50 shadow-xs shadow-blue-500/10'
                      : isUnread
                      ? 'bg-slate-900/90 border-blue-500/30 hover:border-slate-700'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      )}
                      <span className={`text-xs font-semibold ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                        {msg.type === 'sent' ? `To: ${msg.recipient || 'Unknown'}` : msg.sender}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                          msg.type === 'sent'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {msg.type.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {msg.timestamp.split(' ')[1] || msg.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Message Viewer / Preview (Right column) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col min-h-[400px]">
          {selectedMessage ? (
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {selectedMessage.type === 'sent' ? `Sent To: ${selectedMessage.recipient}` : selectedMessage.sender}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        Stored in {selectedMessage.storage}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Date & Time: <span className="text-slate-300 font-mono">{selectedMessage.timestamp}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReply(selectedMessage)}
                      className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reply</span>
                    </button>
                    <button
                      onClick={() => {
                        const num = selectedMessage.type === 'sent' && selectedMessage.recipient ? selectedMessage.recipient : selectedMessage.sender;
                        onStartCallWithNumber(num);
                      }}
                      className="p-2 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                      title="Call this number via VoLTE"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Call</span>
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors"
                      title="Delete SMS"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content Box */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap selection:bg-blue-500/30">
                  {selectedMessage.content}
                </div>
              </div>

              {/* Quick Reply Bar */}
              <div className="border-t border-slate-800/80 pt-3">
                <button
                  onClick={() => handleReply(selectedMessage)}
                  className="w-full py-2.5 px-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  <span>Send Quick Reply to {selectedMessage.type === 'sent' && selectedMessage.recipient ? selectedMessage.recipient : selectedMessage.sender}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <Mail className="w-12 h-12 text-slate-700" />
              <div>
                <p className="text-sm font-medium text-slate-300">Select an SMS message to read</p>
                <p className="text-xs text-slate-400 mt-1">
                  You can inspect verification codes, carrier alerts, and send replies.
                </p>
              </div>
              <button
                onClick={() => {
                  setComposeRecipient('');
                  setComposeText('');
                  setComposeOpen(true);
                }}
                className="mt-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors"
              >
                Compose New SMS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compose SMS Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Compose SMS Message</h3>
                  <p className="text-[11px] text-slate-400">Transmit via Quectel / OpenWrt Cellular Modem</p>
                </div>
              </div>
              <button
                onClick={() => setComposeOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Recipient Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +94771234567 or 0771234567"
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Message Content
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {charCount}/{maxSingleSms} ({segments} {segments === 1 ? 'part' : 'parts'})
                  </span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Type your message here..."
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Encoded in GSM-7 Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setComposeOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingSms || !composeRecipient.trim() || !composeText.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSendingSms ? 'animate-spin' : ''}`} />
                    <span>{isSendingSms ? 'Sending...' : 'Send SMS'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
