import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { useToastStore, type ToastItem } from '../../store/useToastStore';

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-top-3 fade-in duration-200 ${
        isSuccess
          ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/30'
          : isError
          ? 'bg-slate-900/95 border-rose-500/40 text-rose-300 shadow-rose-950/30'
          : isWarning
          ? 'bg-slate-900/95 border-amber-500/40 text-amber-300 shadow-amber-950/30'
          : 'bg-slate-900/95 border-blue-500/40 text-blue-300 shadow-blue-950/30'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
        {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
        {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-blue-400" />}
      </div>

      <div className="flex-1 space-y-0.5 min-w-0">
        <h4 className="text-xs font-bold leading-snug break-words text-white">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-[11px] leading-relaxed text-slate-300 break-words font-mono">
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
