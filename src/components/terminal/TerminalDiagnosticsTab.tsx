import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import {
  Terminal as TerminalIcon,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Activity,
  Radio,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useProfileStore } from '../../store/useProfileStore';
import { routerApi, isTauri } from '../../services/tauriBridge';

export const TerminalDiagnosticsTab: React.FC = () => {
  const { activeProfile } = useProfileStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const [isRunningDiag, setIsRunningDiag] = useState(false);
  const [activeDiagName, setActiveDiagName] = useState<string | null>(null);
  const [diagOutput, setDiagOutput] = useState<string | null>(null);
  const [copiedDiag, setCopiedDiag] = useState(false);
  const [isTerminalConnected, setIsTerminalConnected] = useState(false);

  // Mock shell for browser preview/testing
  const setupMockShell = (term: Terminal) => {
    setIsTerminalConnected(true);
    let currentInput = '';
    const prompt = '\x1b[1;32mroot@OpenWrt-AW1000\x1b[0m:\x1b[1;34m~#\x1b[0m ';
    term.write(prompt);

    term.onData((data) => {
      if (data === '\r') {
        // Enter pressed
        term.write('\r\n');
        const trimmed = currentInput.trim();
        if (trimmed === 'clear') {
          term.clear();
        } else if (trimmed === 'help') {
          term.writeln('Arcadyan AW1000 CLI Commands Available:');
          term.writeln('  iwinfo         - View wireless interface stats & PHY modes');
          term.writeln('  dmesg          - View kernel boot ring buffer');
          term.writeln('  logread        - View system & hostapd logs');
          term.writeln('  cat /proc/cpuinfo - MediaTek Filogic 830 quad-core specs');
          term.writeln('  thermal        - Multi-zone SoC thermal readings');
          term.writeln('  uptime         - Router uptime & 1m/5m/15m load averages');
        } else if (trimmed === 'iwinfo') {
          term.writeln('phy0-ap0  ESSID: "Arcadyan_Ultra_2.4G"  Tx-Power: 23 dBm  Mode: Master');
          term.writeln('phy1-ap0  ESSID: "Arcadyan_Ultra_5G"    Tx-Power: 26 dBm  Mode: Master (160MHz)');
          term.writeln('phy2-ap0  ESSID: "Arcadyan_Ultra_6G"    Tx-Power: 24 dBm  Mode: Master (Wi-Fi 6E)');
        } else if (trimmed === 'uptime') {
          term.writeln(' 19:24:00 up 3 days, 23:14,  load average: 0.28, 0.35, 0.42');
        } else if (trimmed === 'thermal') {
          term.writeln('zone0 (CPU): 47°C  zone1 (2.4G): 49°C  zone2 (5G): 52°C  zone3 (6G): 54°C');
        } else if (trimmed.length > 0) {
          term.writeln(`Executing: ${trimmed}`);
          term.writeln(`Exit 0`);
        }
        currentInput = '';
        term.write(prompt);
      } else if (data === '\u007F') {
        // Backspace
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1);
          term.write('\b \b');
        }
      } else if (data >= ' ' || data === '\t') {
        currentInput += data;
        term.write(data);
      }
    });
  };

  // Initialize xterm.js
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
      fontSize: 13,
      theme: {
        background: '#090d16',
        foreground: '#e2e8f0',
        cursor: '#38bdf8',
        selectionBackground: 'rgba(56, 189, 248, 0.3)',
        black: '#0f172a',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#38bdf8',
        white: '#f1f5f9',
      },
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;
    fitAddonRef.current = fitAddon;

    let unlistenData: (() => void) | null = null;
    let unlistenExit: (() => void) | null = null;

    const startSession = async () => {
      term.writeln('\x1b[1;36m=== Arcadyan AW1000_Ultra OpenWrt SSH Console ===\x1b[0m');
      term.writeln(`Connecting to \x1b[1;33m${activeProfile.username}@${activeProfile.host}:${activeProfile.sshPort}\x1b[0m...\n`);

      if (isTauri()) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          const { listen } = await import('@tauri-apps/api/event');

          const sid = await invoke<string>('start_ssh_session', {
            profile: activeProfile,
            cols: term.cols,
            rows: term.rows,
          });

          sessionIdRef.current = sid;
          setIsTerminalConnected(true);

          unlistenData = await listen<string>(`ssh-data-${sid}`, (event) => {
            term.write(event.payload);
          });

          unlistenExit = await listen(`ssh-exit-${sid}`, () => {
            term.writeln('\n\x1b[1;31m[SSH session closed by host]\x1b[0m');
            setIsTerminalConnected(false);
          });

          term.onData(async (data) => {
            if (sessionIdRef.current) {
              await invoke('send_ssh_input', {
                sessionId: sessionIdRef.current,
                data,
              });
            }
          });
        } catch (err: unknown) {
          term.writeln(`\x1b[1;31mConnection error: ${String(err)}\x1b[0m`);
          term.writeln('\x1b[90mEntering local simulation shell for testing...\x1b[0m\n');
          setupMockShell(term);
        }
      } else {
        term.writeln('\x1b[32m[Connected via Simulated OpenWrt PTY Shell]\x1b[0m');
        term.writeln('\x1b[90mType "help", "iwinfo", "dmesg", "logread", or any command below.\x1b[0m\n');
        setupMockShell(term);
      }
    };

    startSession();

    const handleResize = () => {
      try {
        fitAddon.fit();
        if (isTauri() && sessionIdRef.current) {
          import('@tauri-apps/api/core').then(({ invoke }) => {
            invoke('resize_ssh_session', {
              sessionId: sessionIdRef.current,
              cols: term.cols,
              rows: term.rows,
            });
          });
        }
      } catch {
        // resize error handled
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (unlistenData) unlistenData();
      if (unlistenExit) unlistenExit();
      if (isTauri() && sessionIdRef.current) {
        import('@tauri-apps/api/core').then(({ invoke }) => {
          invoke('close_ssh_session', { sessionId: sessionIdRef.current });
        });
      }
      term.dispose();
    };
  }, [activeProfile]);

  // Diagnostic tool action buttons
  const diagnosticTools = [
    {
      id: 'ping',
      name: 'Ping Cloudflare DNS',
      desc: 'ping -c 4 1.1.1.1',
      cmd: 'ping -c 4 1.1.1.1',
      icon: Activity,
    },
    {
      id: 'traceroute',
      name: 'WAN Traceroute',
      desc: 'traceroute -m 8 1.1.1.1',
      cmd: 'traceroute -m 8 1.1.1.1',
      icon: Zap,
    },
    {
      id: 'logread',
      name: 'System Logs (last 50)',
      desc: 'logread -l 50',
      cmd: 'logread -l 50',
      icon: FileText,
    },
    {
      id: 'dmesg',
      name: 'Kernel Ring Buffer',
      desc: 'dmesg | tail -n 50',
      cmd: 'dmesg | tail -n 50',
      icon: AlertCircle,
    },
    {
      id: 'iwinfo',
      name: 'Wireless PHY Status',
      desc: 'iwinfo',
      cmd: 'iwinfo',
      icon: Radio,
    },
    {
      id: 'thermal',
      name: 'Thermal Telemetry Zones',
      desc: 'cat /sys/class/thermal/thermal_zone*/temp',
      cmd: 'for z in /sys/class/thermal/thermal_zone*; do echo "$(cat $z/type): $(( $(cat $z/temp) / 1000 ))°C"; done',
      icon: Activity,
    },
  ];

  const runDiagnostic = async (tool: (typeof diagnosticTools)[0]) => {
    setIsRunningDiag(true);
    setActiveDiagName(tool.name);
    setDiagOutput(null);

    try {
      const res = await routerApi.execSsh(activeProfile, tool.cmd);
      setDiagOutput(res.stdout || res.stderr || 'Command executed with no output.');
    } catch (err: unknown) {
      setDiagOutput(`Execution error: ${String(err)}`);
    } finally {
      setIsRunningDiag(false);
    }
  };

  const copyDiagOutput = () => {
    if (!diagOutput) return;
    navigator.clipboard.writeText(diagOutput);
    setCopiedDiag(true);
    setTimeout(() => setCopiedDiag(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Interactive SSH Terminal Card */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5 ml-2">
              <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
              {activeProfile.username}@{activeProfile.host}:{activeProfile.sshPort} (VT100 / Xterm PTY)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                isTerminalConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isTerminalConnected ? 'Session Active' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Xterm.js mount container */}
        <div
          ref={terminalRef}
          className="terminal-container h-[420px] w-full bg-[#090d16] p-2"
        />
      </div>

      {/* Quick Diagnostic Suite */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              One-Click Router Diagnostic Actions
            </h3>
            <p className="text-xs text-slate-400">
              Direct OpenWrt diagnostic commands executed via dropbear SSH runner
            </p>
          </div>
        </div>

        {/* Diagnostic Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {diagnosticTools.map((tool) => {
            const Icon = tool.icon;
            const isCurrent = activeDiagName === tool.name && isRunningDiag;
            return (
              <button
                key={tool.id}
                onClick={() => runDiagnostic(tool)}
                disabled={isRunningDiag}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                  {isCurrent ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white">{tool.name}</div>
                  <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    `{tool.desc}`
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Diagnostic Output Viewer */}
        {diagOutput && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-400">
                Diagnostic Output: {activeDiagName}
              </span>
              <button
                onClick={copyDiagOutput}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
              >
                {copiedDiag ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Output
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap">
              {diagOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
