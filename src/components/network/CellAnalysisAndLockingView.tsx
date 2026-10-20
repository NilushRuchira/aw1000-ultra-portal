import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Radio,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  RefreshCw,
} from 'lucide-react';
import { useCellularStore } from '../../store/useCellularStore';
import type { NeighborCell } from '../../types/cellular';

export const CellAnalysisAndLockingView: React.FC = () => {
  const { neighbors, cellLock, analysis, lockCell, isLoading, fetchCellularData } = useCellularStore();

  const [manualTech, setManualTech] = useState<'LTE' | 'NR5G'>('NR5G');
  const [manualEarfcn, setManualEarfcn] = useState<string>('');
  const [manualPci, setManualPci] = useState<string>('');
  const [manualBand, setManualBand] = useState<string>('n78');
  const [confirmLockCell, setConfirmLockCell] = useState<NeighborCell | null>(null);

  const handleLockNeighbor = async (cell: NeighborCell) => {
    await lockCell(cell.type, cell.earfcn, cell.pci, cell.band, true);
    setConfirmLockCell(null);
  };

  const handleUnlock = async () => {
    if (confirm('Release cell lock and return to automatic best-cell handover?')) {
      await lockCell('NR5G', 0, 0, '', false);
    }
  };

  const handleManualLock = async (e: React.FormEvent) => {
    e.preventDefault();
    const earfcn = parseInt(manualEarfcn);
    const pci = parseInt(manualPci);
    if (isNaN(earfcn) || isNaN(pci)) return;

    await lockCell(manualTech, earfcn, pci, manualBand, true);
    setManualEarfcn('');
    setManualPci('');
  };

  const getInterferenceBadge = (level: 'LOW' | 'MODERATE' | 'HIGH') => {
    switch (level) {
      case 'LOW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Low Interference (Clean RF)
          </span>
        );
      case 'MODERATE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Moderate Co-Channel Interference
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            High Sector Interference
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Active Cell Lock Status Banner */}
      <div className={`glass-panel rounded-2xl p-4 sm:p-6 border transition-all ${
        cellLock.enabled
          ? 'border-amber-500/40 bg-amber-500/5'
          : 'border-slate-800/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              cellLock.enabled
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              {cellLock.enabled ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {cellLock.enabled ? 'Neighbor Cell Lock Active' : 'Automatic Cell Selection (Handover Enabled)'}
                </h3>
                {cellLock.enabled && (
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px] uppercase font-mono">
                    Locked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {cellLock.enabled
                  ? `Locked to ${cellLock.technology} Band ${cellLock.band || ''} (EARFCN: ${cellLock.earfcn}, PCI: ${cellLock.pci}). Handover to other sectors is disabled.`
                  : 'Modem automatically evaluates and roams to the highest RSRP/SINR tower sector available.'}
              </p>
            </div>
          </div>

          {cellLock.enabled ? (
            <button
              onClick={handleUnlock}
              disabled={isLoading}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Unlock className="w-3.5 h-3.5 text-amber-400" />
              Release Cell Lock
            </button>
          ) : (
            <span className="text-xs text-slate-500 font-mono hidden sm:block">
              Auto Handover Active
            </span>
          )}
        </div>
      </div>

      {/* Cell Analysis Card */}
      {analysis && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Serving Cell RF Quality & Interference Analysis
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated RF diagnosis of the current anchor tower sector
              </p>
            </div>

            <div className="flex items-center gap-3">
              {getInterferenceBadge(analysis.interferenceLevel)}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">Quality Score:</span>
                <span className={`font-bold ${analysis.servingQualityScore >= 80 ? 'text-emerald-400' : analysis.servingQualityScore >= 60 ? 'text-blue-400' : 'text-amber-400'}`}>
                  {analysis.servingQualityScore} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Actionable Engineering Recommendation */}
          <div className="glass-card rounded-xl p-3.5 border border-slate-800 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Engineering Recommendation:</span>
              <p className="text-slate-300 mt-0.5 leading-relaxed">{analysis.recommendation}</p>
            </div>
          </div>

          {/* Metrics Analysis Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">RF Parameter</th>
                  <th className="py-2.5 px-3">Measured Value</th>
                  <th className="py-2.5 px-3">Benchmark Ideal</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3">Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {analysis.metrics.map((m) => (
                  <tr key={m.name} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-sans font-semibold text-white">{m.name}</td>
                    <td className="py-2.5 px-3 font-bold text-cyan-300">{m.servingValue}</td>
                    <td className="py-2.5 px-3 text-slate-400">{m.idealRange}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.rating === 'EXCELLENT'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : m.rating === 'GOOD'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {m.rating}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[11px] text-slate-400">{m.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Neighbor Cells Table & Direct Locking Facility */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              Detected Neighbor Cell Towers & Locking Facility
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Available cell sectors detected by the modem receiver. Lock to a neighbor to bypass congested cells.
            </p>
          </div>

          <button
            onClick={() => fetchCellularData()}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rescan Cells</span>
          </button>
        </div>

        {/* Neighbor Cells Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/40">
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Tech & Band</th>
                <th className="py-3 px-3">EARFCN / ARFCN</th>
                <th className="py-3 px-3">Physical Cell ID (PCI)</th>
                <th className="py-3 px-3">Signal (RSRP)</th>
                <th className="py-3 px-3">Quality (RSRQ)</th>
                <th className="py-3 px-3">SINR</th>
                <th className="py-3 px-3 text-right">Lock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {neighbors.map((cell) => (
                <tr key={cell.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3">
                    {cell.isServing ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Serving (PCC)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        Neighbor
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white">
                    {cell.type} • Band {cell.band}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{cell.earfcn}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-400">{cell.pci}</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-semibold">{cell.rsrp} dBm</td>
                  <td className="py-2.5 px-3 text-slate-300">{cell.rsrq} dB</td>
                  <td className="py-2.5 px-3 text-slate-300">{cell.sinr ? `${cell.sinr} dB` : '-'}</td>
                  <td className="py-2.5 px-3 text-right">
                    {cell.isLocked ? (
                      <button
                        onClick={handleUnlock}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-sans font-semibold transition-colors"
                      >
                        Unlock
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmLockCell(cell)}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-sans font-semibold flex items-center gap-1 ml-auto transition-colors"
                      >
                        <Crosshair className="w-3 h-3" />
                        Lock Cell
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Manual Cell Lock Drawer Form */}
        <div className="pt-4 border-t border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Manual EARFCN & PCI Target Entry
          </h4>
          <form onSubmit={handleManualLock} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Radio Tech</label>
              <select
                value={manualTech}
                onChange={(e) => setManualTech(e.target.value as 'LTE' | 'NR5G')}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              >
                <option value="NR5G">5G NR (NR5G)</option>
                <option value="LTE">4G LTE</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Band</label>
              <input
                type="text"
                placeholder="e.g. n78 or B3"
                value={manualBand}
                onChange={(e) => setManualBand(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">EARFCN / ARFCN</label>
              <input
                type="number"
                placeholder="e.g. 627340"
                value={manualEarfcn}
                onChange={(e) => setManualEarfcn(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target PCI (0-1007)</label>
              <input
                type="number"
                placeholder="e.g. 384"
                value={manualPci}
                onChange={(e) => setManualPci(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                <Lock className="w-3.5 h-3.5" />
                Apply Cell Lock
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal for Locking */}
      {confirmLockCell && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-5 sm:p-6 border border-slate-700/80 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Confirm Cell Lock</h3>
                <p className="text-xs text-slate-400">Lock Arcadyan AW1000 modem to specific sector</p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Technology:</span>
                <span className="text-white font-bold">{confirmLockCell.type}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Band:</span>
                <span className="text-white font-bold">{confirmLockCell.band}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Channel (EARFCN):</span>
                <span className="text-cyan-300 font-bold">{confirmLockCell.earfcn}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Physical Cell ID (PCI):</span>
                <span className="text-blue-400 font-bold">{confirmLockCell.pci}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Measured RSRP:</span>
                <span className="text-slate-200">{confirmLockCell.rsrp} dBm</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800 leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline mr-1" />
              Cell locking prevents the router from roaming to other base stations even if this sector degrades or undergoes maintenance. You can unlock at any time.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmLockCell(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLockNeighbor(confirmLockCell)}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all font-sans"
              >
                {isLoading ? 'Locking Sector...' : 'Lock to This Cell'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
