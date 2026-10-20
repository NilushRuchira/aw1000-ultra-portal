import type { RouterProfile, SystemInfo, WanInfo, WifiSSID, ConnectedDevice } from '../types/router';

// Check if running inside Tauri desktop environment
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
};

// Safe wrapper for Tauri invoke
export async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<T>(cmd, args);
    } catch (err: unknown) {
      console.warn(`[Tauri invoke: ${cmd}] native error:`, err);
      throw err;
    }
  }
  throw new Error('Not running inside Tauri desktop environment');
}

// Default profile preset for Arcadyan AW1000_Ultra
export const DEFAULT_PROFILE: RouterProfile = {
  id: 'arcadyan-aw1000-default',
  name: 'Arcadyan AW1000_Ultra (Primary)',
  host: '192.168.1.1',
  httpPort: 80,
  sshPort: 22,
  username: 'root',
  authType: 'password',
  password: '',
  useHttps: false,
  autoConnect: true,
};

// Mock data generator for browser testing or offline demonstration
class MockRouterState {
  private uptimeSeconds = 342910;
  private rxBytes = 4125892019;
  private txBytes = 1948301948;
  private loadHistory: [number, number, number] = [0.28, 0.35, 0.42];

  public getSystemInfo(): SystemInfo {
    this.uptimeSeconds += 2;
    // Jitter CPU load slightly
    const jitter = (Math.random() - 0.5) * 0.08;
    this.loadHistory = [
      Math.max(0.05, Math.min(2.5, +(this.loadHistory[0] + jitter).toFixed(2))),
      Math.max(0.1, +(this.loadHistory[1] + jitter * 0.5).toFixed(2)),
      0.38,
    ];

    const totalMem = 1048576; // 1 GB DDR4 RAM
    const freeMem = 482910 + Math.floor((Math.random() - 0.5) * 20480);
    const buffered = 64120;
    const cached = 210450;

    return {
      hostname: 'OpenWrt-AW1000',
      model: 'Arcadyan AW1000_Ultra (MediaTek MT7986A Filogic 830)',
      release: {
        description: 'OpenWrt 23.05.3 r23809-234f1a2',
        version: '23.05.3',
        target: 'mediatek/filogic',
      },
      kernel: '5.15.150',
      localtime: Math.floor(Date.now() / 1000),
      uptime: this.uptimeSeconds,
      memory: {
        total: totalMem,
        free: freeMem,
        shared: 4096,
        buffered: buffered,
        cached: cached,
      },
      load: this.loadHistory,
      rootfs: {
        total: 1048576, // 1 GB eMMC storage
        free: 891280,
        used: 157296,
      },
      thermal: {
        cpu: +(46.5 + (Math.random() - 0.5) * 1.5).toFixed(1),
        wifi24: +(48.0 + (Math.random() - 0.5) * 1.2).toFixed(1),
        wifi5: +(51.2 + (Math.random() - 0.5) * 2.0).toFixed(1),
        wifi6: +(53.8 + (Math.random() - 0.5) * 2.5).toFixed(1),
      },
    };
  }

  public getWanInfo(): WanInfo {
    this.rxBytes += Math.floor(Math.random() * 250000 + 50000);
    this.txBytes += Math.floor(Math.random() * 90000 + 15000);
    return {
      interface: 'wan',
      proto: 'dhcp',
      up: true,
      ip: '198.51.100.42',
      netmask: '255.255.255.0',
      gateway: '198.51.100.1',
      dns: ['1.1.1.1', '1.0.0.1', '8.8.8.8'],
      uptime: this.uptimeSeconds - 12000,
      rxBytes: this.rxBytes,
      txBytes: this.txBytes,
      rxRateKbps: Math.floor(Math.random() * 24000 + 8000),
      txRateKbps: Math.floor(Math.random() * 7500 + 2000),
    };
  }

  public getWifiSSIDs(): WifiSSID[] {
    return [
      {
        ifname: 'phy0-ap0',
        device: 'phy0',
        band: '2.4GHz',
        ssid: 'Arcadyan_Ultra_2.4G',
        bssid: '98:97:CC:34:88:1A',
        mode: 'Master (Access Point)',
        channel: 6,
        channelWidth: '40MHz',
        txPower: 23,
        encryption: 'psk2+ccmp',
        encryptionDisplay: 'WPA2-PSK (AES)',
        hidden: false,
        activeClientsCount: 4,
        disabled: false,
      },
      {
        ifname: 'phy1-ap0',
        device: 'phy1',
        band: '5GHz',
        ssid: 'Arcadyan_Ultra_5G',
        bssid: '98:97:CC:34:88:1B',
        mode: 'Master (Access Point)',
        channel: 36,
        channelWidth: '160MHz',
        txPower: 26,
        encryption: 'sae-mixed',
        encryptionDisplay: 'WPA2/WPA3 Mixed (Personal)',
        hidden: false,
        activeClientsCount: 7,
        disabled: false,
      },
      {
        ifname: 'phy2-ap0',
        device: 'phy2',
        band: '6GHz',
        ssid: 'Arcadyan_Ultra_6G_Pro',
        bssid: '98:97:CC:34:88:1C',
        mode: 'Master (Wi-Fi 6E)',
        channel: 69,
        channelWidth: '160MHz',
        txPower: 24,
        encryption: 'sae',
        encryptionDisplay: 'WPA3-SAE Only',
        hidden: false,
        activeClientsCount: 3,
        disabled: false,
      },
    ];
  }

  public getConnectedDevices(): ConnectedDevice[] {
    return [
      {
        mac: '3C:22:FB:41:A9:12',
        ip: '192.168.1.102',
        hostname: 'MacBook-Pro-M3',
        vendor: 'Apple, Inc.',
        interface: 'phy1-ap0',
        band: '5 GHz',
        signalDbm: -48,
        txRateMbps: 1201,
        rxRateMbps: 1080,
        leaseExpires: '18h 42m',
        isOnline: true,
        lastSeen: 'Just now',
      },
      {
        mac: 'E4:5F:01:8A:2B:99',
        ip: '192.168.1.115',
        hostname: 'iPhone-16-ProMax',
        vendor: 'Apple, Inc.',
        interface: 'phy2-ap0',
        band: '6 GHz',
        signalDbm: -42,
        txRateMbps: 2402,
        rxRateMbps: 1800,
        leaseExpires: '21h 10m',
        isOnline: true,
        lastSeen: 'Just now',
      },
      {
        mac: '80:6D:97:54:C1:77',
        ip: '192.168.1.120',
        hostname: 'Desktop-Workstation',
        vendor: 'Intel Corporate',
        interface: 'eth1',
        band: 'Ethernet',
        txRateMbps: 2500,
        rxRateMbps: 2500,
        leaseExpires: '14h 05m',
        isOnline: true,
        lastSeen: 'Just now',
      },
      {
        mac: '48:E7:29:B3:01:8C',
        ip: '192.168.1.134',
        hostname: 'Samsung-Galaxy-S24',
        vendor: 'Samsung Electronics',
        interface: 'phy1-ap0',
        band: '5 GHz',
        signalDbm: -56,
        txRateMbps: 866,
        rxRateMbps: 866,
        leaseExpires: '11h 20m',
        isOnline: true,
        lastSeen: '1m ago',
      },
      {
        mac: 'D8:EC:5E:77:22:10',
        ip: '192.168.1.145',
        hostname: 'LG-OLED-65-C3',
        vendor: 'LG Electronics',
        interface: 'phy0-ap0',
        band: '2.4 GHz',
        signalDbm: -63,
        txRateMbps: 144,
        rxRateMbps: 144,
        leaseExpires: '8h 30m',
        isOnline: true,
        lastSeen: 'Just now',
      },
      {
        mac: '60:01:94:11:8A:44',
        ip: '192.168.1.189',
        hostname: 'Espressif-SmartPlug-01',
        vendor: 'Espressif Inc.',
        interface: 'phy0-ap0',
        band: '2.4 GHz',
        signalDbm: -71,
        txRateMbps: 72,
        rxRateMbps: 72,
        leaseExpires: '22h 15m',
        isOnline: true,
        lastSeen: '3m ago',
      },
      {
        mac: 'B0:4E:26:FA:9C:12',
        ip: '192.168.1.205',
        hostname: 'PlayStation-5',
        vendor: 'Sony Interactive Ent.',
        interface: 'eth2',
        band: 'Ethernet',
        txRateMbps: 1000,
        rxRateMbps: 1000,
        leaseExpires: '23h 59m',
        isOnline: true,
        lastSeen: 'Just now',
      },
    ];
  }
}

export const mockRouter = new MockRouterState();

// Core API Bridge functions
export const routerApi = {
  // Test connection to both uBus and SSH
  async testConnection(profile: RouterProfile): Promise<{
    ubusAvailable: boolean;
    sshAvailable: boolean;
    ubusError?: string;
    sshError?: string;
    missingPackages?: string[];
  }> {
    if (isTauri()) {
      try {
        return await safeInvoke('test_connection', { profile });
      } catch (err: unknown) {
        return {
          ubusAvailable: false,
          sshAvailable: false,
          ubusError: String(err),
          sshError: String(err),
        };
      }
    }

    // Mock verification for browser preview
    await new Promise((r) => setTimeout(r, 650));
    return {
      ubusAvailable: true,
      sshAvailable: true,
    };
  },

  // Execute one-off SSH command
  async execSsh(profile: RouterProfile, command: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    if (isTauri()) {
      return await safeInvoke('exec_ssh_command', { profile, command });
    }

    // Simulated CLI execution for preview
    await new Promise((r) => setTimeout(r, 350));
    if (command.includes('ping')) {
      return {
        stdout: `PING 1.1.1.1 (1.1.1.1): 56 data bytes\n64 bytes from 1.1.1.1: seq=0 ttl=58 time=7.412 ms\n64 bytes from 1.1.1.1: seq=1 ttl=58 time=6.820 ms\n64 bytes from 1.1.1.1: seq=2 ttl=58 time=7.114 ms\n64 bytes from 1.1.1.1: seq=3 ttl=58 time=6.945 ms\n\n--- 1.1.1.1 ping statistics ---\n4 packets transmitted, 4 packets received, 0% packet loss\nround-trip min/avg/max = 6.820/7.072/7.412 ms`,
        stderr: '',
        exitCode: 0,
      };
    }
    if (command.includes('traceroute')) {
      return {
        stdout: `traceroute to 1.1.1.1 (1.1.1.1), 8 hops max, 38 byte packets\n 1  198.51.100.1 (198.51.100.1)  1.214 ms  0.982 ms  0.891 ms\n 2  10.240.0.1 (10.240.0.1)  4.112 ms  3.890 ms  4.015 ms\n 3  172.16.88.1 (172.16.88.1)  5.420 ms  5.110 ms  5.234 ms\n 4  one.one.one.one (1.1.1.1)  6.912 ms  6.815 ms  6.904 ms`,
        stderr: '',
        exitCode: 0,
      };
    }
    if (command.includes('logread')) {
      return {
        stdout: `Sun Oct 20 18:45:10 2026 daemon.info hostapd: phy1-ap0: STA e4:5f:01:8a:2b:99 WPA: pairwise key handshake completed (RSN)\nSun Oct 20 18:48:22 2026 daemon.info dnsmasq-dhcp[1]: DHCPACK(br-lan) 192.168.1.102 3c:22:fb:41:a9:12 MacBook-Pro-M3\nSun Oct 20 18:50:00 2026 user.notice firewall: Reloading firewall rules for wan zone\nSun Oct 20 19:12:44 2026 daemon.info hostapd: phy0-ap0: STA d8:ec:5e:77:22:10 IEEE 802.11: associated\nSun Oct 20 19:15:33 2026 daemon.notice netifd: Network device 'eth0' link is up\nSun Oct 20 19:20:01 2026 cron.info crond[1204]: USER root pid 4821 cmd /sbin/fan_control.sh`,
        stderr: '',
        exitCode: 0,
      };
    }
    if (command.includes('dmesg')) {
      return {
        stdout: `[    0.000000] Linux version 5.15.150 (builder@openwrt) (gcc version 12.3.0) #0 SMP Mon Sep 30 2026\n[    0.000000] Machine model: Arcadyan AW1000_Ultra (Filogic 830 MT7986A)\n[    1.421098] mt7986-wmac 18000000.wifi: HW/SW Version: 0x8a108a10, Build Time: 20260912\n[    2.109844] mt7986-wmac 18000000.wifi: firmware mt7986_wa.bin loaded successfully\n[    3.402190] 8021q: 802.1Q VLAN Support v1.8\n[    4.119280] br-lan: port 1(eth1) entered forwarding state\n[    4.120194] br-lan: port 2(eth2) entered forwarding state\n[    5.001928] IPv6: ADDRCONF(NETDEV_CHANGE): wan: link becomes ready`,
        stderr: '',
        exitCode: 0,
      };
    }
    if (command.includes('iwinfo')) {
      return {
        stdout: `phy0-ap0  ESSID: "Arcadyan_Ultra_2.4G"\n          Access Point: 98:97:CC:34:88:1A\n          Mode: Master  Channel: 6 (2.437 GHz)\n          Tx-Power: 23 dBm  Link Quality: 70/70\n          Signal: -30 dBm  Noise: -95 dBm\n          Bit Rate: 300.0 MBit/s\n          Encryption: WPA2 PSK (CCMP)\n          Type: nl80211  HW Mode(s): 802.11b/g/n/ax\n\nphy1-ap0  ESSID: "Arcadyan_Ultra_5G"\n          Access Point: 98:97:CC:34:88:1B\n          Mode: Master  Channel: 36 (5.180 GHz)\n          Tx-Power: 26 dBm  Link Quality: 70/70\n          Signal: -34 dBm  Noise: -92 dBm\n          Bit Rate: 1201.0 MBit/s\n          Encryption: WPA2/WPA3 Mixed\n          Type: nl80211  HW Mode(s): 802.11a/n/ac/ax`,
        stderr: '',
        exitCode: 0,
      };
    }
    if (command.includes('thermal')) {
      return {
        stdout: `zone0 (CPU): 47°C\nzone1 (MT7975_2G): 49°C\nzone2 (MT7976_5G): 52°C\nzone3 (MT7977_6G): 54°C`,
        stderr: '',
        exitCode: 0,
      };
    }
    return {
      stdout: `Command output from '${command}' [simulated]\nExit 0`,
      stderr: '',
      exitCode: 0,
    };
  },

  // Perform uBus call or fallback
  async ubusCall<T>(
    profile: RouterProfile,
    path: string,
    method: string,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    if (isTauri()) {
      return await safeInvoke<T>('ubus_call', { profile, path, method, params });
    }

    // Mock data handling for ubus
    if (path === 'system' && method === 'info') {
      return mockRouter.getSystemInfo() as unknown as T;
    }
    if (path === 'network.interface.wan' && method === 'status') {
      return mockRouter.getWanInfo() as unknown as T;
    }
    return {} as T;
  },

  // Update Wi-Fi SSID / Key
  async updateWifi(
    profile: RouterProfile,
    device: string,
    ifname: string,
    newSsid: string,
    newKey?: string,
    encryption?: string
  ): Promise<{ success: boolean; message: string }> {
    if (isTauri()) {
      return await safeInvoke('update_wifi_uci', {
        profile,
        device,
        ifname,
        newSsid,
        newKey,
        encryption,
      });
    }

    // Mock UCI commit
    await new Promise((r) => setTimeout(r, 800));
    return {
      success: true,
      message: `UCI wireless settings committed and 'wifi reload' completed successfully for ${ifname}.`,
    };
  },

  // Power actions (Reboot / Restart Services)
  async executePowerAction(profile: RouterProfile, action: 'reboot' | 'restart_network' | 'restart_uhttpd'): Promise<string> {
    const cmdMap: Record<string, string> = {
      reboot: 'reboot',
      restart_network: '/etc/init.d/network restart',
      restart_uhttpd: '/etc/init.d/uhttpd restart',
    };
    const res = await this.execSsh(profile, cmdMap[action] || 'uptime');
    return res.stdout || 'Action triggered successfully.';
  },

  // Install ubus packages over SSH if missing
  async installUbusPackages(profile: RouterProfile): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const cmd = 'opkg update && opkg install rpcd-mod-rpcsys rpcd-mod-file uhttpd-mod-ubus && /etc/init.d/uhttpd restart && /etc/init.d/rpcd restart';
    return await this.execSsh(profile, cmd);
  },

  // Profile persistence (LocalStorage + Tauri filesystem)
  async getProfiles(): Promise<RouterProfile[]> {
    if (isTauri()) {
      try {
        const profiles = await safeInvoke<RouterProfile[]>('get_profiles');
        if (profiles && profiles.length > 0) return profiles;
      } catch {
        // Fall back to localStorage
      }
    }

    try {
      const stored = localStorage.getItem('aw1000_router_profiles');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored profiles', e);
    }
    return [DEFAULT_PROFILE];
  },

  async saveProfile(profile: RouterProfile): Promise<RouterProfile[]> {
    let list = await this.getProfiles();
    const idx = list.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      list[idx] = profile;
    } else {
      list.push(profile);
    }

    localStorage.setItem('aw1000_router_profiles', JSON.stringify(list));

    if (isTauri()) {
      try {
        await safeInvoke('save_profile', { profile });
      } catch (err) {
        console.warn('Could not persist profile natively:', err);
      }
    }
    return list;
  },

  async deleteProfile(id: string): Promise<RouterProfile[]> {
    let list = await this.getProfiles();
    list = list.filter((p) => p.id !== id);
    if (list.length === 0) {
      list = [DEFAULT_PROFILE];
    }
    localStorage.setItem('aw1000_router_profiles', JSON.stringify(list));

    if (isTauri()) {
      try {
        await safeInvoke('delete_profile', { id });
      } catch (err) {
        console.warn('Could not delete profile natively:', err);
      }
    }
    return list;
  },
};
