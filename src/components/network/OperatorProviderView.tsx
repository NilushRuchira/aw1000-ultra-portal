import React, { useState } from 'react';
import {
  Radio,
  Search,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { useCellularStore } from '../../store/useCellularStore';

export const OperatorProviderView: React.FC = () => {
  const {
    status,
    operators,
    isScanningOperators,
    scanAvailableOperators,
    setOperatorSelection,
    isLoading,
  } = useCellularStore();

  const [selectionMode, setSelectionMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [selectedPlmn, setSelectedPlmn] = useState<string | null>(null);

  const handleScan = async () => {
    await scanAvailableOperators();
  };

  const handleApplyOperator = async (plmn?: string) => {
    const target = plmn || selectedPlmn;
    if (selectionMode === 'MANUAL' && !target) {
      alert('Please select an operator PLMN first.');
      return;
    }
    await setOperatorSelection(selectionMode, selectionMode === 'MANUAL' ? target || undefined : undefined);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-blue-400" />
          Mobile Network Operator & PLMN Selection
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Control network registration, perform live over-the-air base station scans, and switch between cellular providers
        </p>
      </div>

      {/* Operator Selection Mode Toggle */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white">Network Provider Selection Mode</h4>
            <p className="text-xs text-slate-400 mt-0.5">Choose between automatic SIM roaming or explicit manual carrier lock</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectionMode('AUTO');
                handleApplyOperator(undefined);
              }}
              disabled={isLoading}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectionMode === 'AUTO'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Automatic Mode
            </button>
            <button
              onClick={() => setSelectionMode('MANUAL')}
              disabled={isLoading}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectionMode === 'MANUAL'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Manual PLMN Select
            </button>
          </div>
        </div>

        {/* Current Provider Info */}
        <div className="glass-card rounded-xl p-3.5 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Active Registered Carrier</span>
            <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {status?.operator.name || 'T-Mobile 5G'} ({status?.operator.plmn || '310260'})
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-emerald-400 font-semibold">Registered & Attached</span>
            <div className="text-[11px] text-slate-400">MCC: {status?.operator.mcc} • MNC: {status?.operator.mnc}</div>
          </div>
        </div>
      </div>

      {/* Network Operator Scanner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-400" />
              Over-the-Air Operator Scan
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Scans 3GPP broadcast channels to detect all in-range cellular networks
            </p>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanningOperators}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanningOperators ? 'animate-spin' : ''}`} />
            <span>{isScanningOperators ? 'Scanning Cellular Airwaves...' : 'Scan Networks (AT+COPS=?)'}</span>
          </button>
        </div>

        {/* Operator Scan Results List */}
        {operators.length > 0 ? (
          <div className="space-y-2.5">
            {operators.map((op) => {
              const isCurrent = op.status === 'CURRENT';
              const isSelected = selectedPlmn === op.plmn;
              return (
                <div
                  key={op.plmn}
                  onClick={() => selectionMode === 'MANUAL' && setSelectedPlmn(op.plmn)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : isSelected
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  } ${selectionMode === 'MANUAL' ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-blue-400 shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{op.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Current
                          </span>
                        )}
                        {op.status === 'FORBIDDEN' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Forbidden (SIM)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        PLMN: <span className="text-slate-200">{op.plmn}</span> • Tech: <span className="text-purple-300">{op.technology}</span>
                      </div>
                    </div>
                  </div>

                  {selectionMode === 'MANUAL' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyOperator(op.plmn);
                        }}
                        disabled={isLoading || isCurrent}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-40 transition-colors"
                      >
                        {isCurrent ? 'Attached' : 'Register Here'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No scanned operators available yet. Click "Scan Networks" to probe all local cellular base stations.
          </div>
        )}
      </div>
    </div>
  );
};
