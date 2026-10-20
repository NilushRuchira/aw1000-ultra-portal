import React, { useState } from 'react';
import {
  Server,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Key,
  Lock,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { useProfileStore } from '../../store/useProfileStore';
import { routerApi } from '../../services/tauriBridge';
import type { RouterProfile } from '../../types/router';

export const SettingsTab: React.FC = () => {
  const {
    profiles,
    activeProfile,
    setActiveProfile,
    saveProfile,
    deleteProfile,
    protocolStatus,
    isTesting,
    testCurrentConnection,
  } = useProfileStore();

  const [editingProfile, setEditingProfile] = useState<RouterProfile>({ ...activeProfile });
  const [testResult, setTestResult] = useState<typeof protocolStatus>(protocolStatus);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installOutput, setInstallOutput] = useState<string | null>(null);

  const handleSelectProfile = (p: RouterProfile) => {
    setActiveProfile(p);
    setEditingProfile({ ...p });
    setTestResult(null);
  };

  const handleNewProfile = () => {
    const newP: RouterProfile = {
      id: `profile-${Date.now()}`,
      name: 'New Router Profile',
      host: '192.168.1.1',
      httpPort: 80,
      sshPort: 22,
      username: 'root',
      authType: 'password',
      password: '',
      useHttps: false,
      autoConnect: false,
    };
    setEditingProfile(newP);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile(editingProfile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this router profile?')) {
      await deleteProfile(id);
      setEditingProfile({ ...useProfileStore.getState().activeProfile });
    }
  };

  const handleRunTest = async () => {
    const res = await testCurrentConnection();
    setTestResult(res);
  };

  const handleAutoInstallUbus = async () => {
    setIsInstalling(true);
    setInstallOutput(null);
    try {
      const res = await routerApi.installUbusPackages(editingProfile);
      setInstallOutput(res.stdout || 'Packages successfully installed!');
      await handleRunTest();
    } catch (e: unknown) {
      setInstallOutput(`Install failed: ${String(e)}`);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-400" />
          Router Connection & Profile Configuration
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure uBus JSON-RPC credentials and Dropbear SSH keys with dual-protocol verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile List Column */}
        <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saved Profiles
            </span>
            <button
              onClick={handleNewProfile}
              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          <div className="space-y-2">
            {profiles.map((p) => {
              const isActive = p.id === activeProfile.id;
              const isSelected = p.id === editingProfile.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProfile(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white truncate">{p.name}</span>
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>{p.host}:{p.httpPort}</span>
                    <span className="text-slate-500">SSH: {p.sshPort}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Editor Form */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Profile Details</h3>
                <p className="text-xs text-slate-400">Target Arcadyan AW1000 parameters</p>
              </div>

              <div className="flex items-center gap-2">
                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingProfile.id)}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saveSuccess ? 'Saved!' : 'Save Profile'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Name */}
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Gateway IP */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Router IP / Gateway Host
                </label>
                <input
                  type="text"
                  value={editingProfile.host}
                  onChange={(e) => setEditingProfile({ ...editingProfile, host: e.target.value })}
                  required
                  placeholder="192.168.1.1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Username */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Username (default: root)
                </label>
                <input
                  type="text"
                  value={editingProfile.username}
                  onChange={(e) => setEditingProfile({ ...editingProfile, username: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* HTTP/HTTPS Port */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  HTTP / HTTPS Port
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editingProfile.httpPort}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, httpPort: parseInt(e.target.value) || 80 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={editingProfile.useHttps}
                      onChange={(e) =>
                        setEditingProfile({
                          ...editingProfile,
                          useHttps: e.target.checked,
                          httpPort: e.target.checked ? 443 : 80,
                        })
                      }
                      className="rounded bg-slate-800 border-slate-700"
                    />
                    Use HTTPS
                  </label>
                </div>
              </div>

              {/* SSH Port */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  SSH Port (Dropbear)
                </label>
                <input
                  type="number"
                  value={editingProfile.sshPort}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, sshPort: parseInt(e.target.value) || 22 })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Authentication Type */}
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Authentication Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setEditingProfile({ ...editingProfile, authType: 'password' })}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      editingProfile.authType === 'password'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-blue-400" />
                    <span>Password Auth</span>
                  </label>

                  <label
                    onClick={() => setEditingProfile({ ...editingProfile, authType: 'privateKey' })}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      editingProfile.authType === 'privateKey'
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Key className="w-4 h-4 text-indigo-400" />
                    <span>SSH Private Key</span>
                  </label>
                </div>
              </div>

              {/* Password Input or Key Path */}
              {editingProfile.authType === 'password' ? (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Router Root Password
                  </label>
                  <input
                    type="password"
                    value={editingProfile.password || ''}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, password: e.target.value })
                    }
                    placeholder="Enter password configured in LuCI / OpenWrt"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    SSH Private Key File Path
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingProfile.privateKey || ''}
                      onChange={(e) =>
                        setEditingProfile({ ...editingProfile, privateKey: e.target.value })
                      }
                      placeholder="e.g. C:\Users\user\.ssh\id_rsa or /home/user/.ssh/id_ed25519"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Dual Protocol Verification Section */}
          <div className="border-t border-slate-800/80 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Dual-Protocol Connectivity Verification
                </h4>
                <p className="text-xs text-slate-400">
                  Validates uBus JSON-RPC (`/ubus`) and Dropbear SSH socket handshake
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Testing Protocols...' : 'Verify Dual Protocol'}
              </button>
            </div>

            {testResult && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* uBus check */}
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                      testResult.ubusAvailable
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.ubusAvailable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">uBus JSON-RPC (`/ubus`)</div>
                      <div className="text-[11px] mt-0.5 text-slate-300">
                        {testResult.ubusAvailable
                          ? 'HTTP/HTTPS session authenticated successfully'
                          : testResult.ubusError || 'Failed to connect to /ubus'}
                      </div>
                    </div>
                  </div>

                  {/* SSH check */}
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                      testResult.sshAvailable
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.sshAvailable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">SSH Handshake & Shell</div>
                      <div className="text-[11px] mt-0.5 text-slate-300">
                        {testResult.sshAvailable
                          ? 'TCP socket opened & credentials verified'
                          : testResult.sshError || 'Failed to authenticate over SSH'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* If missing rpcd-mod-rpcsys prompt auto install */}
                {testResult.missingPackages && (
                  <div className="glass-card rounded-xl p-4 border border-amber-500/30 bg-amber-500/5 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      uBus Daemon Packages Missing in OpenWrt
                    </div>
                    <p className="text-slate-300">
                      OpenWrt router requires `rpcd-mod-rpcsys` and `uhttpd-mod-ubus` for JSON-RPC access.
                      You can auto-install them now using SSH:
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={handleAutoInstallUbus}
                        disabled={isInstalling}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
                      >
                        {isInstalling ? 'Running opkg over SSH...' : 'Auto-Install via SSH'}
                      </button>
                      <code className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        opkg update & opkg install rpcd-mod-rpcsys uhttpd-mod-ubus
                      </code>
                    </div>

                    {installOutput && (
                      <pre className="mt-2 p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto">
                        {installOutput}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
