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
        const lower = trimmed.toLowerCase();

        if (lower === 'clear') {
          term.clear();
        } else if (lower === 'help') {
          term.writeln('\x1b[1;36m=== Arcadyan AW1000_Ultra OpenWrt CLI Help ===\x1b[0m');
          term.writeln('Standard Commands:');
          term.writeln('  ll / ls -la    - List directory contents in long format');
          term.writeln('  iwinfo         - View wireless interface stats & PHY modes');
          term.writeln('  dmesg          - View kernel boot ring buffer');
          term.writeln('  logread        - View system, cellular & hostapd logs');
          term.writeln('  uptime         - Router uptime & load averages');
          term.writeln('  thermal        - Multi-zone SoC thermal readings');
          term.writeln('  ifconfig / ip a - Network interface IP and MAC configurations');
          term.writeln('  cat /etc/banner - OpenWrt ASCII release banner');
          term.writeln('  df -h / free -m - Storage and RAM utilization');
        } else if (lower === 'll' || lower === 'ls -l' || lower === 'ls -la' || lower === 'ls -al' || lower === 'ls') {
          term.writeln('drwxr-xr-x    1 root     root             0 Oct 20 22:30 \x1b[1;34m.\x1b[0m');
          term.writeln('drwxr-xr-x    1 root     root             0 Oct 20 22:25 \x1b[1;34m..\x1b[0m');
          term.writeln('-rw-r--r--    1 root     root          1204 Oct 20 22:15 .profile');
          term.writeln('drwxr-xr-x    2 root     root             0 Oct 20 22:00 \x1b[1;34mbin\x1b[0m');
          term.writeln('drwxr-xr-x    8 root     root             0 Oct 20 22:00 \x1b[1;34metc\x1b[0m');
          term.writeln('drwxr-xr-x    1 root     root             0 Oct 20 22:00 \x1b[1;34mlib\x1b[0m');
          term.writeln('drwxr-xr-x    2 root     root             0 Oct 20 22:00 \x1b[1;34moverlay\x1b[0m');
          term.writeln('dr-xr-xr-x  142 root     root             0 Jan  1  1970 \x1b[1;34mproc\x1b[0m');
          term.writeln('drwxr-xr-x    1 root     root             0 Oct 20 22:00 \x1b[1;34mrom\x1b[0m');
          term.writeln('drwxr-xr-x    2 root     root             0 Oct 20 22:00 \x1b[1;34msbin\x1b[0m');
          term.writeln('dr-xr-xr-x   12 root     root             0 Jan  1  1970 \x1b[1;34msys\x1b[0m');
          term.writeln('drwxrwxrwt   18 root     root           740 Oct 20 22:32 \x1b[1;34mtmp\x1b[0m');
          term.writeln('drwxr-xr-x    7 root     root             0 Oct 20 22:00 \x1b[1;34musr\x1b[0m');
          term.writeln('drwxr-xr-x    1 root     root             0 Oct 20 22:00 \x1b[1;34mwww\x1b[0m');
        } else if (lower === 'pwd') {
          term.writeln('/root');
        } else if (lower === 'whoami') {
          term.writeln('root');
        } else if (lower === 'uname -a' || lower === 'uname') {
          term.writeln('Linux OpenWrt-AW1000 6.6.35 #0 SMP PREEMPT Oct 20 2026 armv8l GNU/Linux');
        } else if (lower.includes('openwrt_release') || lower === 'cat /etc/openwrt_release') {
          term.writeln('DISTRIB_ID=\'OpenWrt\'');
          term.writeln('DISTRIB_RELEASE=\'23.05.4\'');
          term.writeln('DISTRIB_REVISION=\'r24012-d8dd03c461\'');
          term.writeln('DISTRIB_TARGET=\'qualcommax/ipq807x\'');
          term.writeln('DISTRIB_ARCH=\'aarch64_cortex-a53\'');
          term.writeln('DISTRIB_DESCRIPTION=\'OpenWrt 23.05.4 Arcadyan AW1000 Ultra\'');
        } else if (lower === 'cat /etc/banner') {
          term.writeln('  _______                     ________        __');
          term.writeln(' |       |.-----.-----.-----.|  |  |  |.----.|  |_');
          term.writeln(' |   -   ||  _  |  -__|     ||  |  |  ||   _||   _|');
          term.writeln(' |_______||   __|_____|__|__||________||__|  |____|');
          term.writeln('          |__| W I R E L E S S   F R E E D O M');
          term.writeln(' -----------------------------------------------------');
          term.writeln(' OpenWrt 23.05.4, r24012-d8dd03c461 (Arcadyan AW1000)');
          term.writeln(' -----------------------------------------------------');
        } else if (lower === 'free' || lower === 'free -m') {
          term.writeln('               total        used        free      shared  buff/cache   available');
          term.writeln('Mem:         1048576      412850      435726       12048      200000      635726');
          term.writeln('Swap:              0           0           0');
        } else if (lower === 'df' || lower === 'df -h') {
          term.writeln('Filesystem                Size      Used Available Use% Mounted on');
          term.writeln('/dev/root               256.0M    142.5M    113.5M  56% /rom');
          term.writeln('tmpfs                   512.0M      2.4M    509.6M   1% /tmp');
          term.writeln('/dev/mtdblock6          768.0M    185.0M    583.0M  24% /overlay');
          term.writeln('overlayfs:/overlay      768.0M    185.0M    583.0M  24% /');
        } else if (lower === 'ifconfig' || lower === 'ip a') {
          term.writeln('br-lan    Link encap:Ethernet  HWaddr 00:1A:2B:3C:4D:5E');
          term.writeln('          inet addr:192.168.1.1  Bcast:192.168.1.255  Mask:255.255.255.0');
          term.writeln('          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1');
          term.writeln('wwan0     Link encap:Point-Point  HWaddr 00:00:00:00:00:00');
          term.writeln('          inet addr:100.74.19.82  P-t-P:100.74.19.82  Mask:255.255.255.255');
          term.writeln('          UP POINTOPOINT RUNNING NOARP MULTICAST  MTU:1500 (Dialog 5G SA)');
        } else if (lower === 'iwinfo') {
          term.writeln('phy0-ap0  ESSID: "Arcadyan_Ultra_2.4G"  Tx-Power: 23 dBm  Mode: Master  Channel: 6 (2.437 GHz)');
          term.writeln('phy1-ap0  ESSID: "Arcadyan_Ultra_5G"    Tx-Power: 26 dBm  Mode: Master  Channel: 36 (5.180 GHz, 160MHz)');
          term.writeln('phy2-ap0  ESSID: "Arcadyan_Ultra_6G"    Tx-Power: 24 dBm  Mode: Master  Channel: 69 (6.295 GHz, Wi-Fi 6E)');
        } else if (lower === 'uptime') {
          term.writeln(' 22:34:00 up 3 days, 23:24,  load average: 0.18, 0.25, 0.31');
        } else if (lower === 'thermal') {
          term.writeln('zone0 (CPU IPQ8072): 47.0°C  zone1 (2.4G PHY): 48.0°C  zone2 (5G PHY): 51.2°C  zone3 (6G PHY): 53.8°C');
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
      id: 'ls_la',
      name: 'List Directory (ll / ls -la)',
      desc: 'ls -la',
      cmd: 'ls -la',
      icon: TerminalIcon,
    },
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
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-[11px] sm:text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5 truncate">
              <TerminalIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{activeProfile.username}@{activeProfile.host}:{activeProfile.sshPort}</span>
              <span className="hidden sm:inline text-slate-500">(VT100)</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                isTerminalConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isTerminalConnected ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Xterm.js mount container */}
        <div
          ref={terminalRef}
          className="terminal-container h-[280px] sm:h-[400px] w-full bg-[#090d16] p-1.5 sm:p-2"
        />

        {/* Terminal Info Footer */}
        <div className="px-3.5 sm:px-5 py-2 bg-slate-950/80 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
            <span>BusyBox <code className="text-blue-300 font-mono">ash</code> shell. Command <code className="text-emerald-300 font-mono font-bold">ll</code> is auto-aliased to <code className="text-emerald-300 font-mono">ls -la</code>.</span>
          </div>
          <div className="font-mono text-[10px] text-slate-500 hidden sm:block">
            UTF-8 • VT100 / xterm-256color • PTY
          </div>
        </div>
      </div>

      {/* Quick Diagnostic Suite */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80">
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
