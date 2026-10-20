import React, { useState } from 'react';
import {
  Laptop2,
  Search,
  Copy,
  Check,
  Signal,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { useRouterStore } from '../../store/useRouterStore';
import { routerApi } from '../../services/tauriBridge';
import { useProfileStore } from '../../store/useProfileStore';
import type { ConnectedDevice } from '../../types/router';

export const ConnectedDevicesTab: React.FC = () => {
  const { connectedDevices, fetchRouterData } = useRouterStore();
  const { activeProfile } = useProfileStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [bandFilter, setBandFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof ConnectedDevice>('ip');
  const [sortAsc, setSortAsc] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ ip: string; output: string } | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePing = async (ip: string) => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await routerApi.execSsh(activeProfile, `ping -c 3 -W 2 ${ip}`);
      setPingResult({ ip, output: res.stdout || res.stderr });
    } catch (e: unknown) {
      setPingResult({ ip, output: `Ping failed: ${String(e)}` });
    } finally {
      setIsPinging(false);
    }
  };

  const filteredDevices = connectedDevices.filter((dev) => {
    const matchesQuery =
      dev.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.ip.includes(searchQuery) ||
      dev.mac.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dev.vendor && dev.vendor.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBand =
      bandFilter === 'ALL' ||
      (bandFilter === '2.4' && dev.band.includes('2.4')) ||
      (bandFilter === '5' && dev.band.includes('5')) ||
      (bandFilter === '6' && dev.band.includes('6')) ||
      (bandFilter === 'ETH' && dev.band === 'Ethernet');

    return matchesQuery && matchesBand;
  });

  const sortedDevices = [...filteredDevices].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const toggleSort = (field: keyof ConnectedDevice) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getSignalBadge = (rssi?: number) => {
    if (rssi === undefined) return <span className="text-slate-500 font-mono text-xs">Wired</span>;
    let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    let quality = 'Excellent';
    if (rssi < -70) {
      color = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      quality = 'Weak';
    } else if (rssi < -60) {
      color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      quality = 'Good';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${color}`}>
        <Signal className="w-3 h-3" />
        {rssi} dBm ({quality})
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filter, Refresh */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Hostname, IP, MAC address, or vendor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Band Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Band:
          </span>
          {(['ALL', '2.4', '5', '6', 'ETH'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBandFilter(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                bandFilter === b
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {b === 'ALL' ? 'All Clients' : b === 'ETH' ? 'Ethernet' : `${b} GHz`}
            </button>
          ))}

          <button
            onClick={() => fetchRouterData()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 ml-2"
            title="Refresh Client Table"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ping Results Card (if active) */}
      {pingResult && (
        <div className="glass-panel rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 font-mono">
              <Terminal className="w-4 h-4" />
              ICMP Ping Diagnostic: {pingResult.ip}
            </span>
            <button
              onClick={() => setPingResult(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <pre className="text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-slate-300 whitespace-pre-wrap">
            {pingResult.output}
          </pre>
        </div>
      )}

      {/* Client Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th
                  onClick={() => toggleSort('hostname')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    Hostname / Device
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('ip')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    IP Address
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">MAC Address</th>
                <th className="py-3.5 px-4">Band / Interface</th>
                <th
                  onClick={() => toggleSort('signalDbm')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    Signal (RSSI)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Link Rate</th>
                <th className="py-3.5 px-4">Lease Remaining</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {sortedDevices.map((dev) => (
                <tr
                  key={dev.mac}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Hostname & Vendor */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Laptop2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{dev.hostname}</div>
                        <div className="text-[10px] text-slate-400">{dev.vendor || 'Unknown Vendor'}</div>
                      </div>
                    </div>
                  </td>

                  {/* IP Address */}
                  <td className="py-3 px-4 font-mono font-medium text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span>{dev.ip}</span>
                      <button
                        onClick={() => copyToClipboard(dev.ip)}
                        title="Copy IP"
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {copiedText === dev.ip ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* MAC Address */}
                  <td className="py-3 px-4 font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span>{dev.mac}</span>
                      <button
                        onClick={() => copyToClipboard(dev.mac)}
                        title="Copy MAC"
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {copiedText === dev.mac ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Band / Interface */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                        dev.band === '6 GHz'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : dev.band === '5 GHz'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : dev.band === '2.4 GHz'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {dev.band}
                    </span>
                  </td>

                  {/* Signal Strength */}
                  <td className="py-3 px-4">{getSignalBadge(dev.signalDbm)}</td>

                  {/* Link Rate */}
                  <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                    {dev.txRateMbps ? `${dev.txRateMbps} Mbps` : '1000 Mbps'}
                  </td>

                  {/* Lease Expiry */}
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {dev.leaseExpires || 'Active'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handlePing(dev.ip)}
                      disabled={isPinging}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                    >
                      Ping
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedDevices.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            No devices found matching filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
