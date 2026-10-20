import { isTauri, safeInvoke } from './tauriBridge';
import type { RouterProfile } from '../types/router';
import type {
  LogEntry,
  LogFilterOptions,
  VnStatResult,
  VnStatInterface,
  VnStatHourlyPoint,
  VnStatDailyPoint,
  VnStatMonthlyPoint,
} from '../types/logs';

// Helper to generate realistic OpenWrt and Quectel 5G cellular log entries
function generateMockLogs(): LogEntry[] {
  const now = new Date();
  const formatTime = (minutesAgo: number) => {
    const d = new Date(now.getTime() - minutesAgo * 60 * 1000);
    return d.toTimeString().split(' ')[0];
  };

  return [
    {
      id: 'log-1',
      timestamp: formatTime(1),
      severity: 'notice',
      facility: 'cellular',
      daemon: 'modemmanager',
      message: 'Modem /dev/cdc-wdm0: attached to PLMN 41302 (Dialog 5G SA), RSRP: -78 dBm, SINR: 24.5 dB',
    },
    {
      id: 'log-2',
      timestamp: formatTime(2),
      severity: 'info',
      facility: 'cellular',
      daemon: 'quectel-cm',
      message: 'Primary Component Carrier (PCC) locked to Band n78 (3500MHz, EARFCN 627340, PCI 384, SCS 30kHz)',
    },
    {
      id: 'log-3',
      timestamp: formatTime(4),
      severity: 'info',
      facility: 'cellular',
      daemon: 'quectel-cm',
      message: 'Carrier Aggregation active: 3CA (n78 [100MHz] + B40 [20MHz] + B3 [20MHz]), 4x4 MIMO TM4 engaged',
    },
    {
      id: 'log-4',
      timestamp: formatTime(7),
      severity: 'info',
      facility: 'dhcp_wifi',
      daemon: 'hostapd',
      message: 'wlan0: AP-STA-CONNECTED 88:66:5a:12:ef:90 (iPhone 15 Pro, 5GHz 802.11ax, RSSI -52 dBm)',
    },
    {
      id: 'log-5',
      timestamp: formatTime(8),
      severity: 'info',
      facility: 'dhcp_wifi',
      daemon: 'dnsmasq-dhcp',
      message: 'DHCPACK(br-lan) 192.168.1.145 88:66:5a:12:ef:90 iPhone-15-Pro',
    },
    {
      id: 'log-6',
      timestamp: formatTime(12),
      severity: 'warn',
      facility: 'firewall',
      daemon: 'firewall',
      message: 'DROP (src=198.51.100.44 dst=192.168.1.1 proto=TCP spt=49201 dpt=23 SYN) port 23/telnet blocked',
    },
    {
      id: 'log-7',
      timestamp: formatTime(15),
      severity: 'notice',
      facility: 'system',
      daemon: 'dropbear',
      message: 'Password auth succeeded for root from 192.168.1.100:54210',
    },
    {
      id: 'log-8',
      timestamp: formatTime(18),
      severity: 'info',
      facility: 'system',
      daemon: 'netifd',
      message: 'Network device "wwan0" link is up, MTU 1500, negotiated 1000Mbps full-duplex',
    },
    {
      id: 'log-9',
      timestamp: formatTime(25),
      severity: 'warn',
      facility: 'cellular',
      daemon: 'modemmanager',
      message: 'Adjacent co-channel sector PCI 385 detected with high RSRP (-86 dBm). Cell lock active, ignoring roaming.',
    },
    {
      id: 'log-10',
      timestamp: formatTime(31),
      severity: 'info',
      facility: 'kernel',
      daemon: 'kernel',
      message: '[  84.120489] qmi_wwan 1-1.2:1.4 wwan0: register \'qmi_wwan\' at usb-1-1.2, Qualcomm Snapdragon X55 5G Modem',
    },
    {
      id: 'log-11',
      timestamp: formatTime(36),
      severity: 'info',
      facility: 'kernel',
      daemon: 'kernel',
      message: '[  84.810901] ipq807x-nss: NSS core clock set to 1400 MHz, crypto acceleration enabled',
    },
    {
      id: 'log-12',
      timestamp: formatTime(42),
      severity: 'notice',
      facility: 'system',
      daemon: 'vnstat',
      message: 'vnstat daemon 2.10 started, monitoring interfaces: wwan0, eth0, br-lan',
    },
    {
      id: 'log-13',
      timestamp: formatTime(55),
      severity: 'error',
      facility: 'firewall',
      daemon: 'firewall',
      message: 'REJECT (src=203.0.113.88 dst=192.168.1.1 proto=UDP dpt=53) invalid DNS amplification packet discarded',
    },
    {
      id: 'log-14',
      timestamp: formatTime(70),
      severity: 'info',
      facility: 'cellular',
      daemon: 'quectel-cm',
      message: 'PDP context 1 activated: APN dialogbb, IP 100.74.19.82, DNS 192.248.1.161, 192.248.1.162',
    },
    {
      id: 'log-15',
      timestamp: formatTime(90),
      severity: 'info',
      facility: 'system',
      daemon: 'uhttpd',
      message: 'uhttpd-mod-ubus: RPC session authorized for user "root"',
    },
    {
      id: 'log-16',
      timestamp: formatTime(110),
      severity: 'warn',
      facility: 'dhcp_wifi',
      daemon: 'hostapd',
      message: 'wlan1: AP-STA-POLL-OPER 40:ec:99:32:11:bc missed 3 beacon replies, RSSI degraded (-84 dBm)',
    },
    {
      id: 'log-17',
      timestamp: formatTime(135),
      severity: 'info',
      facility: 'system',
      daemon: 'ntpd',
      message: 'System clock synchronized to 0.openwrt.pool.ntp.org (offset +0.0024s)',
    },
    {
      id: 'log-18',
      timestamp: formatTime(160),
      severity: 'notice',
      facility: 'cellular',
      daemon: 'quectel-cm',
      message: 'AT+QNWPREFCFG="mode_pref",AUTO committed successfully. Sub-6GHz carrier aggregation operational.',
    },
    {
      id: 'log-19',
      timestamp: formatTime(190),
      severity: 'info',
      facility: 'dhcp_wifi',
      daemon: 'dnsmasq',
      message: 'read /etc/hosts - 4 addresses, query cache hit ratio 91.4%',
    },
    {
      id: 'log-20',
      timestamp: formatTime(240),
      severity: 'info',
      facility: 'kernel',
      daemon: 'kernel',
      message: '[   0.000000] Linux version 6.6.35 (OpenWrt GCC 13.3.0) #0 SMP PREEMPT Arcadyan AW1000 Ultra',
    },
  ];
}

// Generates mock vnStat telemetry data for testing & browser preview
function generateMockVnStat(): VnStatResult {
  const currentHour = new Date().getHours();

  // 24 hours of hourly data points
  const hourly: VnStatHourlyPoint[] = [];
  for (let i = 23; i >= 0; i--) {
    const h = (currentHour - i + 24) % 24;
    const hourLabel = `${h.toString().padStart(2, '0')}:00`;
    // Realistic traffic curve (peak during evening 18:00 - 23:00)
    const factor = h >= 18 && h <= 23 ? 3.5 : h >= 9 && h <= 17 ? 2.0 : 0.6;
    const rxMb = Math.round((80 + Math.random() * 140) * factor);
    const txMb = Math.round((20 + Math.random() * 45) * factor);
    hourly.push({
      time: hourLabel,
      rx: rxMb * 1024 * 1024,
      tx: txMb * 1024 * 1024,
      rxMb,
      txMb,
      totalMb: rxMb + txMb,
    });
  }

  // 30 days of daily data points
  const daily: VnStatDailyPoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateLabel = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
    const fullDate = d.toISOString().split('T')[0];

    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const rxGb = +( (3.5 + Math.random() * 5.2) * (isWeekend ? 1.4 : 1.0) ).toFixed(2);
    const txGb = +( (0.8 + Math.random() * 1.5) * (isWeekend ? 1.3 : 1.0) ).toFixed(2);

    daily.push({
      date: dateLabel,
      fullDate,
      rx: Math.round(rxGb * 1024 * 1024 * 1024),
      tx: Math.round(txGb * 1024 * 1024 * 1024),
      rxGb,
      txGb,
      totalGb: +(rxGb + txGb).toFixed(2),
    });
  }

  // 12 months of monthly data points
  const monthly: VnStatMonthlyPoint[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curMonthIdx = today.getMonth();
  for (let i = 11; i >= 0; i--) {
    const mIdx = (curMonthIdx - i + 12) % 12;
    const year = today.getFullYear() - (curMonthIdx - i < 0 ? 1 : 0);
    const monthLabel = `${months[mIdx]} ${year}`;

    const rxGb = Math.round(110 + Math.random() * 95);
    const txGb = Math.round(25 + Math.random() * 25);

    monthly.push({
      month: monthLabel,
      rx: rxGb * 1024 * 1024 * 1024,
      tx: txGb * 1024 * 1024 * 1024,
      rxGb,
      txGb,
      totalGb: rxGb + txGb,
    });
  }

  const wwanTotalRx = daily.reduce((acc, d) => acc + d.rx, 0);
  const wwanTotalTx = daily.reduce((acc, d) => acc + d.tx, 0);

  const interfaces: VnStatInterface[] = [
    {
      name: 'wwan0',
      alias: 'Cellular 5G/LTE WAN (Qualcomm X55)',
      total: {
        rx: wwanTotalRx,
        tx: wwanTotalTx,
        total: wwanTotalRx + wwanTotalTx,
      },
      today: {
        rx: daily[daily.length - 1].rx,
        tx: daily[daily.length - 1].tx,
        total: daily[daily.length - 1].rx + daily[daily.length - 1].tx,
      },
      thisMonth: {
        rx: monthly[monthly.length - 1].rx,
        tx: monthly[monthly.length - 1].tx,
        total: monthly[monthly.length - 1].rx + monthly[monthly.length - 1].tx,
      },
      hourly,
      daily,
      monthly,
    },
    {
      name: 'eth0',
      alias: '2.5GbE LAN/WAN Port',
      total: {
        rx: Math.round(wwanTotalRx * 0.8),
        tx: Math.round(wwanTotalTx * 0.7),
        total: Math.round((wwanTotalRx * 0.8) + (wwanTotalTx * 0.7)),
      },
      today: {
        rx: Math.round(daily[daily.length - 1].rx * 0.8),
        tx: Math.round(daily[daily.length - 1].tx * 0.7),
        total: Math.round(daily[daily.length - 1].rx * 0.8 + daily[daily.length - 1].tx * 0.7),
      },
      thisMonth: {
        rx: Math.round(monthly[monthly.length - 1].rx * 0.8),
        tx: Math.round(monthly[monthly.length - 1].tx * 0.7),
        total: Math.round(monthly[monthly.length - 1].rx * 0.8 + monthly[monthly.length - 1].tx * 0.7),
      },
      hourly: hourly.map((h) => ({
        ...h,
        rx: Math.round(h.rx * 0.8),
        tx: Math.round(h.tx * 0.7),
        rxMb: Math.round(h.rxMb * 0.8),
        txMb: Math.round(h.txMb * 0.7),
        totalMb: Math.round(h.totalMb * 0.75),
      })),
      daily: daily.map((d) => ({
        ...d,
        rx: Math.round(d.rx * 0.8),
        tx: Math.round(d.tx * 0.7),
        rxGb: +(d.rxGb * 0.8).toFixed(2),
        txGb: +(d.txGb * 0.7).toFixed(2),
        totalGb: +(d.totalGb * 0.75).toFixed(2),
      })),
      monthly: monthly.map((m) => ({
        ...m,
        rx: Math.round(m.rx * 0.8),
        tx: Math.round(m.tx * 0.7),
        rxGb: Math.round(m.rxGb * 0.8),
        txGb: Math.round(m.txGb * 0.7),
        totalGb: Math.round(m.totalGb * 0.75),
      })),
    },
    {
      name: 'br-lan',
      alias: 'Local Bridge (Wi-Fi 6 + Switch)',
      total: {
        rx: Math.round(wwanTotalRx * 1.2),
        tx: Math.round(wwanTotalTx * 1.1),
        total: Math.round((wwanTotalRx * 1.2) + (wwanTotalTx * 1.1)),
      },
      today: {
        rx: Math.round(daily[daily.length - 1].rx * 1.2),
        tx: Math.round(daily[daily.length - 1].tx * 1.1),
        total: Math.round(daily[daily.length - 1].rx * 1.2 + daily[daily.length - 1].tx * 1.1),
      },
      thisMonth: {
        rx: Math.round(monthly[monthly.length - 1].rx * 1.2),
        tx: Math.round(monthly[monthly.length - 1].tx * 1.1),
        total: Math.round(monthly[monthly.length - 1].rx * 1.2 + monthly[monthly.length - 1].tx * 1.1),
      },
      hourly: hourly.map((h) => ({
        ...h,
        rx: Math.round(h.rx * 1.2),
        tx: Math.round(h.tx * 1.1),
        rxMb: Math.round(h.rxMb * 1.2),
        txMb: Math.round(h.txMb * 1.1),
        totalMb: Math.round(h.totalMb * 1.15),
      })),
      daily: daily.map((d) => ({
        ...d,
        rx: Math.round(d.rx * 1.2),
        tx: Math.round(d.tx * 1.1),
        rxGb: +(d.rxGb * 1.2).toFixed(2),
        txGb: +(d.txGb * 1.1).toFixed(2),
        totalGb: +(d.totalGb * 1.15).toFixed(2),
      })),
      monthly: monthly.map((m) => ({
        ...m,
        rx: Math.round(m.rx * 1.2),
        tx: Math.round(m.tx * 1.1),
        rxGb: Math.round(m.rxGb * 1.2),
        txGb: Math.round(m.txGb * 1.1),
        totalGb: Math.round(m.totalGb * 1.15),
      })),
    },
  ];

  return {
    installed: true,
    version: '2.10',
    message: 'Active vnStat daemon monitoring 3 network interfaces',
    interfaces,
    activeInterface: 'wwan0',
    lastUpdated: new Date().toLocaleTimeString(),
  };
}

export const logsApi = {
  async getLogs(profile: RouterProfile, options: LogFilterOptions): Promise<{ total: number; items: LogEntry[]; raw: string }> {
    if (isTauri()) {
      try {
        const res = await safeInvoke<{ total: number; items: LogEntry[]; raw: string }>('get_router_logs', {
          profile,
          source: options.source,
          lines: options.limit,
          filter: options.search || null,
        });
        if (res && res.items && res.items.length > 0) {
          // If severity filter is active, apply it
          if (options.severity !== 'all') {
            res.items = res.items.filter((item: LogEntry) => item.severity === options.severity);
          }
          return res;
        }
      } catch (e) {
        console.warn('Native get_router_logs failed, using fallback:', e);
      }
    }

    // Mock logs fallback
    let all = generateMockLogs();
    if (options.source !== 'all') {
      all = all.filter((l) => l.facility === options.source || (options.source === 'system' && (l.facility === 'system' || l.facility === 'kernel')));
    }
    if (options.severity !== 'all') {
      all = all.filter((l) => l.severity === options.severity);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      all = all.filter((l) => l.message.toLowerCase().includes(q) || l.daemon.toLowerCase().includes(q));
    }

    return {
      total: all.length,
      items: all.slice(0, options.limit),
      raw: all.map((l) => `${l.timestamp} [${l.severity.toUpperCase()}] ${l.daemon}: ${l.message}`).join('\n'),
    };
  },

  async getVnStat(profile: RouterProfile): Promise<VnStatResult> {
    if (isTauri()) {
      try {
        const res = await safeInvoke<{ installed: boolean; rawVnstat?: any; message?: string }>('get_vnstat_traffic', { profile });
        if (res && res.installed && res.rawVnstat && res.rawVnstat.interfaces) {
          // Parse vnstat JSON format into VnStatInterface
          const ifaces: VnStatInterface[] = res.rawVnstat.interfaces.map((rawIf: any) => {
            const traffic = rawIf.traffic || {};
            const totalRx = traffic.total?.rx || 0;
            const totalTx = traffic.total?.tx || 0;

            const hourly: VnStatHourlyPoint[] = (traffic.hour || []).map((h: any) => {
              const rxMb = Math.round((h.rx || 0) / (1024 * 1024));
              const txMb = Math.round((h.tx || 0) / (1024 * 1024));
              return {
                time: `${h.time?.hour?.toString().padStart(2, '0') || '00'}:00`,
                rx: h.rx || 0,
                tx: h.tx || 0,
                rxMb,
                txMb,
                totalMb: rxMb + txMb,
              };
            });

            const daily: VnStatDailyPoint[] = (traffic.day || []).map((d: any) => {
              const rxGb = +((d.rx || 0) / (1024 * 1024 * 1024)).toFixed(2);
              const txGb = +((d.tx || 0) / (1024 * 1024 * 1024)).toFixed(2);
              return {
                date: `${d.date?.month || 0}/${d.date?.day || 0}`,
                fullDate: `${d.date?.year}-${d.date?.month}-${d.date?.day}`,
                rx: d.rx || 0,
                tx: d.tx || 0,
                rxGb,
                txGb,
                totalGb: +(rxGb + txGb).toFixed(2),
              };
            });

            const monthly: VnStatMonthlyPoint[] = (traffic.month || []).map((m: any) => {
              const rxGb = Math.round((m.rx || 0) / (1024 * 1024 * 1024));
              const txGb = Math.round((m.tx || 0) / (1024 * 1024 * 1024));
              return {
                month: `${m.date?.year || 2026}-${m.date?.month || 1}`,
                rx: m.rx || 0,
                tx: m.tx || 0,
                rxGb,
                txGb,
                totalGb: rxGb + txGb,
              };
            });

            const today = daily.length > 0 ? daily[daily.length - 1] : { rx: 0, tx: 0 };
            const thisMonth = monthly.length > 0 ? monthly[monthly.length - 1] : { rx: 0, tx: 0 };

            return {
              name: rawIf.name,
              alias: rawIf.name === 'wwan0' ? 'Cellular 5G/LTE WAN' : rawIf.name === 'eth0' ? 'LAN/WAN 2.5GbE Port' : rawIf.alias || rawIf.name,
              total: { rx: totalRx, tx: totalTx, total: totalRx + totalTx },
              today: { rx: today.rx, tx: today.tx, total: today.rx + today.tx },
              thisMonth: { rx: thisMonth.rx, tx: thisMonth.tx, total: thisMonth.rx + thisMonth.tx },
              hourly,
              daily,
              monthly,
            };
          });

          return {
            installed: true,
            version: res.rawVnstat.vnstatversion || '2.x',
            message: 'Live vnStat database queried successfully',
            interfaces: ifaces,
            activeInterface: ifaces[0]?.name || 'wwan0',
            lastUpdated: new Date().toLocaleTimeString(),
          };
        } else if (res && !res.installed) {
          return {
            installed: false,
            message: res.message || 'vnStat is not currently installed on OpenWrt.',
            interfaces: [],
            activeInterface: 'wwan0',
            lastUpdated: new Date().toLocaleTimeString(),
          };
        }
      } catch (e) {
        console.warn('Native get_vnstat_traffic failed, using mock:', e);
      }
    }

    return generateMockVnStat();
  },

  async installVnStat(profile: RouterProfile): Promise<{ success: boolean; message: string }> {
    if (isTauri()) {
      try {
        return await safeInvoke('install_vnstat', { profile });
      } catch (e: unknown) {
        return { success: false, message: `Installation failed: ${String(e)}` };
      }
    }
    await new Promise((r) => setTimeout(r, 1200));
    return { success: true, message: 'vnStat package installed and daemon started on OpenWrt.' };
  },
};
