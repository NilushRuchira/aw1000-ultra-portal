import React, { useState } from 'react';
import {
  Radio,
  Search,
  RefreshCw,
  Globe,
  MapPin,
  CheckCircle2,
  Crosshair,
} from 'lucide-react';
import { useCellularStore } from '../../store/useCellularStore';

// Sri Lanka Mobile Network Operators (MCC 413)
const SRI_LANKA_OPERATORS = [
  {
    name: 'Dialog Axiata (Dialog 5G / 4G)',
    plmn: '41302',
    mcc: '413',
    mnc: '02',
    technology: '5G SA / 5G NSA / LTE-A (B3/B8/B40/n78)',
    frequencyBands: 'Band 3 (1800MHz), Band 40 (2300MHz), n78 (3500MHz)',
    apn: 'dialogbb',
  },
  {
    name: 'SLTMobitel (Mobitel 5G / 4G)',
    plmn: '41301',
    mcc: '413',
    mnc: '01',
    technology: '5G NSA / 4G LTE-A (B1/B3/B8/n78)',
    frequencyBands: 'Band 1 (2100MHz), Band 3 (1800MHz), Band 8 (900MHz)',
    apn: 'mobitel3g',
  },
  {
    name: 'Airtel Sri Lanka',
    plmn: '41305',
    mcc: '413',
    mnc: '05',
    technology: '4G LTE-A (B1/B3/B8)',
    frequencyBands: 'Band 1 (2100MHz), Band 3 (1800MHz)',
    apn: 'airtellive',
  },
  {
    name: 'Hutch Sri Lanka (Hutch 4G)',
    plmn: '41308',
    mcc: '413',
    mnc: '08',
    technology: '4G LTE (B3/B8)',
    frequencyBands: 'Band 3 (1800MHz), Band 8 (900MHz)',
    apn: 'hutch3g',
  },
];

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
  const [customPlmn, setCustomPlmn] = useState<string>('');

  const handleScan = async () => {
    await scanAvailableOperators();
  };

  const handleApplyOperator = async (plmn?: string, modeOverride?: 'AUTO' | 'MANUAL') => {
    const mode = modeOverride || selectionMode;
    const target = plmn || selectedPlmn || customPlmn;
    if (mode === 'MANUAL' && !target) {
      alert('Please select or enter an operator PLMN.');
      return;
    }
    await setOperatorSelection(mode, mode === 'MANUAL' ? target : undefined);
  };

  const activePlmn = status?.operator.plmn || '41302';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner with Region Badge */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Region: Sri Lanka (MCC: 413)
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            Cellular Network Provider & PLMN Management
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Control base station attachment for Dialog, SLTMobitel, Airtel, and Hutch telecommunications networks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Current PLMN: <span className="font-bold text-emerald-400">{activePlmn}</span>
          </span>
        </div>
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
              Automatic Mode (AT+COPS=0)
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
              Manual PLMN Select (AT+COPS=1)
            </button>
          </div>
        </div>

        {/* Current Provider Info */}
        <div className="glass-card rounded-xl p-3.5 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Active Registered Network</span>
            <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {status?.operator.name || 'Dialog 5G (Sri Lanka)'}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              PLMN: <span className="text-slate-200">{activePlmn}</span> • MCC: 413 • MNC: {status?.operator.mnc || '02'}
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1 justify-end">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Attached & Active
            </span>
            <div className="text-[11px] text-slate-400 mt-0.5">PS/CS Domain: Attached</div>
          </div>
        </div>
      </div>

      {/* Sri Lanka Telecommunications Providers Directory */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Sri Lanka Mobile Network Providers (MCC 413)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Pre-configured cellular carriers in Sri Lanka. Select an operator to force manual registration.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {SRI_LANKA_OPERATORS.map((op) => {
            const isCurrent = activePlmn === op.plmn;
            return (
              <div
                key={op.plmn}
                className={`glass-card rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-emerald-500/50 bg-emerald-500/5 shadow-md shadow-emerald-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        {op.name}
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                            Connected
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        PLMN: <span className="text-white font-semibold">{op.plmn}</span> (MCC: {op.mcc}, MNC: {op.mnc})
                      </div>
                    </div>

                    <div className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-300 font-mono">
                      APN: {op.apn}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                    <div className="text-[11px]">
                      <span className="text-slate-500">Tech:</span> <span className="text-purple-300">{op.technology}</span>
                    </div>
                    <div className="text-[11px] truncate">
                      <span className="text-slate-500">Bands:</span> <span className="text-slate-300">{op.frequencyBands}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end">
                  {isCurrent ? (
                    <span className="text-xs text-emerald-400 font-medium font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Provider
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectionMode('MANUAL');
                        setSelectedPlmn(op.plmn);
                        handleApplyOperator(op.plmn, 'MANUAL');
                      }}
                      disabled={isLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Attach to {op.name.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Over-the-Air Live Cellular Airwave Scan */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-400" />
              Live 3GPP Airwave Frequency Scan
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Probes local cellular towers using modem hardware command (`AT+COPS=?`)
            </p>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanningOperators}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanningOperators ? 'animate-spin' : ''}`} />
            <span>{isScanningOperators ? 'Scanning Airwaves (30s)...' : 'Scan Live Airwaves'}</span>
          </button>
        </div>

        {/* Live Scanned Operator Results */}
        {operators.length > 0 && (
          <div className="space-y-2.5">
            {operators.map((op) => {
              const isCurrent = activePlmn === op.plmn;
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
        )}

        {/* Manual PLMN Entry Drawer */}
        {selectionMode === 'MANUAL' && (
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs">
            <span className="text-slate-400 text-xs shrink-0 font-medium">Or enter custom PLMN:</span>
            <input
              type="text"
              placeholder="e.g. 41302 or 41301"
              value={customPlmn}
              onChange={(e) => setCustomPlmn(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
            />
            <button
              onClick={() => handleApplyOperator(customPlmn)}
              disabled={isLoading || !customPlmn.trim()}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50"
            >
              Attach to Custom PLMN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
