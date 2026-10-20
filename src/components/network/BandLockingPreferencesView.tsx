import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { useCellularStore } from '../../store/useCellularStore';
import type { BandLockConfig } from '../../types/cellular';

const ALL_5G_BANDS = [
  { id: 'n1', name: 'n1 (2100 MHz FDD)' },
  { id: 'n2', name: 'n2 (1900 MHz PCS)' },
  { id: 'n3', name: 'n3 (1800 MHz DCS)' },
  { id: 'n5', name: 'n5 (850 MHz CLR)' },
  { id: 'n7', name: 'n7 (2600 MHz IMT-E)' },
  { id: 'n8', name: 'n8 (900 MHz GSM)' },
  { id: 'n20', name: 'n20 (800 MHz EU Digital)' },
  { id: 'n28', name: 'n28 (700 MHz APT)' },
  { id: 'n38', name: 'n38 (2600 MHz TDD)' },
  { id: 'n40', name: 'n40 (2300 MHz TDD)' },
  { id: 'n41', name: 'n41 (2500 MHz BRS/EBS)' },
  { id: 'n66', name: 'n66 (AWS-3 Ext)' },
  { id: 'n71', name: 'n71 (600 MHz US Low)' },
  { id: 'n77', name: 'n77 (3700 MHz C-Band)' },
  { id: 'n78', name: 'n78 (3500 MHz Global)' },
  { id: 'n79', name: 'n79 (4700 MHz High)' },
];

const ALL_LTE_BANDS = [
  { id: 'B1', name: 'B1 (2100 MHz)' },
  { id: 'B2', name: 'B2 (1900 MHz)' },
  { id: 'B3', name: 'B3 (1800 MHz)' },
  { id: 'B4', name: 'B4 (AWS 1700/2100)' },
  { id: 'B5', name: 'B5 (850 MHz)' },
  { id: 'B7', name: 'B7 (2600 MHz)' },
  { id: 'B8', name: 'B8 (900 MHz)' },
  { id: 'B12', name: 'B12 (700 MHz a/b/c)' },
  { id: 'B13', name: 'B13 (700 MHz Upper C)' },
  { id: 'B14', name: 'B14 (FirstNet 700)' },
  { id: 'B17', name: 'B17 (700 MHz b/c)' },
  { id: 'B20', name: 'B20 (800 MHz EU)' },
  { id: 'B25', name: 'B25 (1900 MHz Ext)' },
  { id: 'B26', name: 'B26 (850 MHz Ext)' },
  { id: 'B28', name: 'B28 (700 MHz APT)' },
  { id: 'B38', name: 'B38 (2600 MHz TDD)' },
  { id: 'B40', name: 'B40 (2300 MHz TDD)' },
  { id: 'B41', name: 'B41 (2500 MHz TDD)' },
  { id: 'B66', name: 'B66 (AWS-1/3)' },
  { id: 'B71', name: 'B71 (600 MHz US)' },
];

export const BandLockingPreferencesView: React.FC = () => {
  const { bandLock, applyBandLock, isLoading } = useCellularStore();

  const [modePreference, setModePreference] = useState<BandLockConfig['modePreference']>(
    bandLock.modePreference
  );
  const [selectedLte, setSelectedLte] = useState<string[]>([...bandLock.lockedLteBands]);
  const [selectedNr, setSelectedNr] = useState<string[]>([...bandLock.lockedNrBands]);
  const [applyResult, setApplyResult] = useState<string | null>(null);

  const [prevBandLock, setPrevBandLock] = useState(bandLock);
  if (prevBandLock !== bandLock) {
    setPrevBandLock(bandLock);
    setModePreference(bandLock.modePreference);
    setSelectedLte([...bandLock.lockedLteBands]);
    setSelectedNr([...bandLock.lockedNrBands]);
  }

  const toggleLteBand = (id: string) => {
    setSelectedLte((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const toggleNrBand = (id: string) => {
    setSelectedNr((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const selectAllLte = () => setSelectedLte(ALL_LTE_BANDS.map((b) => b.id));
  const clearAllLte = () => setSelectedLte([]);

  const selectAllNr = () => setSelectedNr(ALL_5G_BANDS.map((b) => b.id));
  const clearAllNr = () => setSelectedNr([]);

  const handleResetDefaults = () => {
    setModePreference('AUTO');
    setSelectedLte(['B1', 'B3', 'B7', 'B20', 'B28']);
    setSelectedNr(['n1', 'n28', 'n41', 'n78']);
  };

  const handleSaveBandConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyResult(null);

    const config: BandLockConfig = {
      modePreference,
      lockedLteBands: selectedLte,
      lockedNrBands: selectedNr,
    };

    const ok = await applyBandLock(config);
    if (ok) {
      setApplyResult('Band locking preferences committed and modem RF stack updated.');
      setTimeout(() => setApplyResult(null), 3000);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <form onSubmit={handleSaveBandConfig} className="space-y-4 sm:space-y-6">
        {/* Network Mode Preference Selection */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                Network Mode & Core Preferences
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Forces the modem registration mode on cellular towers
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'AUTO' as const,
                title: '5G / 4G Auto (Recommended)',
                desc: 'Intelligent multi-mode handover between 5G SA, NSA, and LTE-A.',
                color: 'border-blue-500 bg-blue-500/10 text-blue-400',
              },
              {
                id: '5G_SA' as const,
                title: '5G SA Only (Standalone)',
                desc: 'Pure 5G Next-Gen Core. Lowest latency (10-15ms), requires native 5G sim.',
                color: 'border-purple-500 bg-purple-500/10 text-purple-400',
              },
              {
                id: '5G_NSA' as const,
                title: '5G NSA Only (Non-Standalone)',
                desc: 'LTE Anchor + 5G NR data carrier. Dual-connectivity ENDC active.',
                color: 'border-cyan-500 bg-cyan-500/10 text-cyan-400',
              },
              {
                id: 'LTE_ONLY' as const,
                title: '4G LTE Only',
                desc: 'Forces LTE-Advanced carrier aggregation without connecting to 5G NR.',
                color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
              },
            ].map((mode) => {
              const isSelected = modePreference === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => setModePreference(mode.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? mode.color
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-white">{mode.title}</span>
                    <input
                      type="radio"
                      name="modePreference"
                      checked={isSelected}
                      onChange={() => setModePreference(mode.id)}
                      className="accent-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{mode.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5G NR Bands Selection Matrix */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold font-mono">
                  5G NR Bands
                </span>
                <h3 className="text-base font-bold text-white">
                  5G Sub-6 GHz Band Locking Matrix
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Enabled bands ({selectedNr.length} / {ALL_5G_BANDS.length} selected). Unchecked bands are excluded from radio scanning.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllNr}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAllNr}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {ALL_5G_BANDS.map((b) => {
              const isChecked = selectedNr.includes(b.id);
              return (
                <label
                  key={b.id}
                  onClick={() => toggleNrBand(b.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs font-mono transition-all ${
                    isChecked
                      ? 'border-purple-500/40 bg-purple-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent onClick
                    className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                  />
                  <span className="truncate">{b.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 4G LTE Bands Selection Matrix */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold font-mono">
                  4G LTE Bands
                </span>
                <h3 className="text-base font-bold text-white">
                  LTE-Advanced Carrier Band Locking Matrix
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Enabled bands ({selectedLte.length} / {ALL_LTE_BANDS.length} selected)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllLte}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAllLte}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {ALL_LTE_BANDS.map((b) => {
              const isChecked = selectedLte.includes(b.id);
              return (
                <label
                  key={b.id}
                  onClick={() => toggleLteBand(b.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs font-mono transition-all ${
                    isChecked
                      ? 'border-blue-500/40 bg-blue-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="truncate">{b.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Results Notification */}
        {applyResult && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{applyResult}</span>
          </div>
        )}

        {/* Bottom Apply Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || (selectedLte.length === 0 && selectedNr.length === 0)}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Applying Band Lock...' : 'Save & Lock Bands'}
          </button>
        </div>
      </form>
    </div>
  );
};
