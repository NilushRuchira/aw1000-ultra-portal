import React, { useState } from 'react';
import {
  Signal,
  Radio,
  Cpu,
  HelpCircle,
  Share2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { CellularStatus } from '../../types/cellular';

interface CellularStatusViewProps {
  status: CellularStatus;
}

export const CellularStatusView: React.FC<CellularStatusViewProps> = ({ status }) => {
  const [showGlossary, setShowGlossary] = useState(false);

  const getSignalQualityRating = (sinr: number, rsrp: number) => {
    if (sinr >= 20 && rsrp >= -80) {
      return { text: 'Excellent', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
    if (sinr >= 13 && rsrp >= -95) {
      return { text: 'Good', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    }
    if (sinr >= 5 && rsrp >= -105) {
      return { text: 'Fair', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    }
    return { text: 'Poor', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const signalQuality = getSignalQualityRating(status.signal.sinr, status.signal.rsrp);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Cards: Operator, SIM, Mode, Overall Signal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Operator Card */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-slate-200">
                <Radio className="w-4 h-4 text-blue-400" />
                Network Provider
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                {status.operator.roaming ? 'Roaming' : 'Home Network'}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              {status.operator.name}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              PLMN: <span className="text-slate-200 font-semibold">{status.operator.plmn}</span> (MCC: {status.operator.mcc}, MNC: {status.operator.mnc})
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>SPN Broadcast:</span>
            <span className="font-mono text-slate-300">{status.operator.spn || status.operator.name}</span>
          </div>
        </div>

        {/* SIM Card Status */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                USIM Card Status
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                {status.sim.status}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white tracking-tight">
              Slot {status.sim.slot} Active
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 truncate" title={status.sim.iccid}>
              ICCID: <span className="text-slate-300">{status.sim.iccid}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>IMSI:</span>
            <span className="font-mono text-slate-300 truncate max-w-[140px]">{status.sim.imsi}</span>
          </div>
        </div>

        {/* Radio Technology & CA */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-slate-200">
                <Zap className="w-4 h-4 text-purple-400" />
                Radio Access Tech
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold font-mono">
                {status.technology}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white tracking-tight">
              {status.carrierAggregation.mode}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Combined Aggregation: <span className="text-purple-300 font-bold">{status.carrierAggregation.totalBandwidthMhz} MHz</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Spatial MIMO:</span>
            <span className="font-mono text-slate-300">{status.mimo.config}</span>
          </div>
        </div>

        {/* Signal Quality Card */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-slate-200">
                <Signal className="w-4 h-4 text-cyan-400" />
                RF Signal Quality
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${signalQuality.color}`}>
                {signalQuality.text}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {status.signal.sinr}
              </span>
              <span className="text-xs text-slate-400 font-mono">dB SINR</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              RSRP: <span className="text-cyan-300 font-semibold">{status.signal.rsrp} dBm</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Signal Bars:</span>
            <span className="font-mono text-emerald-400 font-bold">{status.signal.bars} / 5</span>
          </div>
        </div>
      </div>

      {/* Primary Component Carrier (PCC) Detailed View */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-mono font-bold">
                PCC (Anchor Carrier)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Band {status.pcc.band} • {status.pcc.bandName || 'High Capacity 5G NR'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Primary serving cell component carrier providing network signaling & anchor sync
            </p>
          </div>

          <button
            onClick={() => setShowGlossary(!showGlossary)}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1.5 rounded-xl border border-blue-500/20 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showGlossary ? 'Hide RF Guide' : 'Explain RF Metrics'}</span>
          </button>
        </div>

        {/* PCC Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 text-xs">
          <div className="glass-card rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Channel / ARFCN</span>
            <span className="text-sm font-bold font-mono text-white">{status.pcc.earfcn}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">NR-ARFCN</span>
          </div>

          <div className="glass-card rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Channel Bandwidth</span>
            <span className="text-sm font-bold font-mono text-purple-400">{status.pcc.bandwidthMhz} MHz</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Subcarrier 30 kHz</span>
          </div>

          <div className="glass-card rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Physical Cell ID (PCI)</span>
            <span className="text-sm font-bold font-mono text-blue-400">{status.pcc.pci}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Tower Sector</span>
          </div>

          <div className="glass-card rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Cell Identity (NCI)</span>
            <span className="text-sm font-bold font-mono text-emerald-400 truncate block">{status.pcc.cellId}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Global Cell ID</span>
          </div>

          <div className="glass-card rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Tracking Area (TAC)</span>
            <span className="text-sm font-bold font-mono text-amber-400">{status.pcc.tac}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Registration Zone</span>
          </div>

          <div className="glass-card rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">CQI / Modulation</span>
            <span className="text-sm font-bold font-mono text-cyan-400">{status.signal.cqi} / 15</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">256-QAM Active</span>
          </div>
        </div>

        {/* Secondary Component Carriers (SCC) */}
        {status.scc.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              Active Secondary Component Carriers (Carrier Aggregation)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {status.scc.map((scc, idx) => (
                <div
                  key={scc.id}
                  className="glass-card rounded-xl p-3.5 border border-purple-500/20 bg-purple-500/5 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-purple-300">
                        SCC #{idx + 1}: Band {scc.band}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                        {scc.bandwidthMhz} MHz
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      ARFCN: <span className="text-slate-200">{scc.earfcn}</span> • PCI: <span className="text-slate-200">{scc.pci}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <div className="text-cyan-300 font-semibold">{scc.rsrp} dBm</div>
                    <div className="text-[11px] text-slate-400">{scc.sinr} dB SINR</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spatial MIMO Configuration */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">MIMO Spatial Multiplexing</div>
              <div className="text-[11px] text-slate-400">{status.mimo.transmissionMode}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300 font-bold">
              Rank Indicator: {status.mimo.rankIndicator} (4 Streams)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
              {status.mimo.config}
            </span>
          </div>
        </div>
      </div>

      {/* RF Metrics Glossary / Explanations Drawer */}
      {showGlossary && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-blue-500/30 bg-blue-500/5 space-y-3 text-xs">
          <div className="flex items-center justify-between text-blue-300 font-bold">
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              Cellular RF Metrics & Engineering Guide
            </span>
            <button onClick={() => setShowGlossary(false)} className="text-slate-400 hover:text-white">
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            <div className="glass-card rounded-xl p-3 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">RSRP (Reference Signal Received Power)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Primary indicator of coverage signal level. Higher is better.
                <br />
                <span className="text-emerald-400">&gt; -80 dBm: Excellent</span> | <span className="text-amber-400">-90 to -100 dBm: Fair</span> | <span className="text-rose-400">&lt; -110 dBm: Poor</span>
              </p>
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">SINR (Signal-to-Interference-plus-Noise)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Measures signal purity over ambient noise and neighbor tower interference. Directly controls download speed and 256-QAM capability.
                <br />
                <span className="text-emerald-400">&gt; 20 dB: Maximum throughput</span>
              </p>
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">RSRQ (Reference Signal Received Quality)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Reflects channel loading and background noise across carrier bandwidth. Ranges from -3 dB (empty tower) to -20 dB (heavy congestion).
              </p>
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">PCC vs. SCC (Carrier Aggregation)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                <strong>PCC</strong> is the Primary Component Carrier used for control and signaling. <strong>SCC</strong>s are additional secondary carrier frequencies bonded together to multiply data bandwidth.
              </p>
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">MIMO (Multiple-Input Multiple-Output)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Uses multiple physical antennas on the router and base station to transmit multiple independent data streams simultaneously over the same frequency.
              </p>
            </div>

            <div className="glass-card rounded-xl p-3 border border-slate-800 space-y-1">
              <span className="font-bold text-white block">PCI (Physical Cell Identifier)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                A number (0-1007) that uniquely identifies a specific antenna sector on a cellular mast. Used for neighbor cell locking.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
