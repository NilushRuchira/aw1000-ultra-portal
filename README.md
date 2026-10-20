# Arcadyan AW1000_Ultra OpenWrt Router Manager

A high-performance, modern cross-platform desktop application built with **Tauri v2**, **Rust**, **React 19**, **TypeScript**, and **Tailwind CSS v4** to monitor, configure, and manage the **Arcadyan AW1000_Ultra** router running **OpenWrt** (MediaTek MT7986A Filogic 830).

---

## 🌟 Key Features

### 1. Dual-Protocol OpenWrt Communication Adapter
- **uBus JSON-RPC (`http(s)://<router_ip>/ubus`)**:
  - `session.login`: Authenticates user credentials and acquires session tokens.
  - `system.info` & `system.board`: Reads multi-core load averages, uptime, RAM breakdown, and Filogic hardware release data.
  - `network.interface.wan`: Retrieves real-time WAN IP, default gateway, DNS servers, and uplink bandwidth stats.
  - `uci.get` & `uci.set`: Reads and commits atomic OpenWrt UCI configuration directives.
  - Automatic detection if `rpcd-mod-rpcsys` is missing with a 1-click SSH auto-installer.
- **Native Rust SSH Engine (`ssh2` + PTY channel streaming)**:
  - Dropbear handshake, password auth, and private key authentication.
  - Full bidirectional VT100 / Xterm PTY shell streaming directly to `xterm.js` via Tauri IPC events.
  - Direct kernel hardware sensor queries (`/sys/class/thermal/thermal_zone*`, `iwinfo`, `iw dev station dump`).

### 2. Modern Sleek Customer-Facing Dashboard
- **Overview Dashboard**:
  - System Telemetry Banner: Model name (`Arcadyan AW1000_Ultra`), OpenWrt firmware release, kernel version, router local time, and formatted uptime.
  - Live Resource Gauges: Multi-core CPU load average (1m, 5m, 15m), RAM utilization (used, cached, total), and eMMC flash storage breakdown.
  - Live Recharts Charts: Real-time CPU scheduler pressure and WAN Bandwidth RX/TX throughput.
  - Arcadyan Multi-Zone Thermal Telemetry: Monitors CPU SoC and Wi-Fi RF frontend temperatures.
- **Network & Tri-Band Wi-Fi Management**:
  - 2.4 GHz, 5 GHz, and 6 GHz (Wi-Fi 6E) radio controller overview.
  - SSID Cards displaying channel, channel width (20/40/80/160 MHz), transmit power (dBm & mW), encryption type (WPA2-PSK, WPA3-SAE, Mixed), and hidden status.
  - Wi-Fi Configuration Modal: Live SSID name and WPA2/WPA3 passphrase updates with atomic `uci commit wireless && wifi reload`.
- **Connected Clients (DHCP / ARP / Wireless Clients)**:
  - Searchable, sortable client table with hostname, IP, MAC, Band (2.4G, 5G, 6G, Ethernet), link rates, and lease remaining.
  - Visual RSSI signal strength bars and 1-click device ICMP ping diagnostics.
- **Built-in SSH Shell & Diagnostic Suite**:
  - Full VT100/Xterm.js interactive terminal with auto-fit resizing.
  - 1-Click diagnostic tools: `ping 1.1.1.1`, `traceroute`, `logread -l 50`, `dmesg | tail -n 50`, `iwinfo`, and thermal zones.
  - Router Power Actions with modal safety confirmation: Soft Reboot (`reboot`), Network restart (`/etc/init.d/network restart`), and web server restart (`/etc/init.d/uhttpd restart`).
- **Profile Manager & Dual-Protocol Tester**:
  - Save, edit, and switch between router profiles with local encrypted persistence.
  - Dual-Protocol connection verification testing both uBus HTTP/S and SSH socket handshakes.

---

## 🛠️ Tech Stack

- **Desktop Backend**: Tauri v2, Rust 2021, `ssh2`, `reqwest`, `tokio`, `serde`, `serde_json`, `parking_lot`.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, Zustand, TanStack Query.
- **Terminal Emulator**: `@xterm/xterm` + `@xterm/addon-fit`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on v22)
- Rust toolchain (Rust 1.80+ or latest stable with MSVC or GNU toolchain)

### Installation
```bash
# Clone the repository and install frontend dependencies
npm install
```

### Development Mode

#### 1. Web Preview Mode (Interactive Mock Engine & Shell)
Run the Vite development server to test the UI, live polling, and simulated SSH console in your browser:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

#### 2. Tauri Desktop Application Mode
Run the native desktop app with live Rust compilation and Tauri IPC bridge:
```bash
npx tauri dev
```

### Production Build

Build the production web assets and native cross-platform desktop installer (`.msi`, `.exe`, `.deb`, `.app`):
```bash
# 1. Build frontend distribution
npm run build

# 2. Package native Tauri desktop application
npx tauri build
```
The compiled binaries will be output to `src-tauri/target/release/bundle/`.

---

## 📡 OpenWrt Router Prerequisites (Arcadyan AW1000)

For full dual-protocol functionality, ensure your OpenWrt installation on the Arcadyan AW1000 has the uBus and SSH daemons running:
```sh
opkg update
opkg install rpcd-mod-rpcsys rpcd-mod-file uhttpd-mod-ubus dropbear
/etc/init.d/uhttpd restart
/etc/init.d/rpcd restart
```
*Note: If these packages are missing, the application automatically detects it during connection verification and provides a 1-click SSH auto-install button.*
