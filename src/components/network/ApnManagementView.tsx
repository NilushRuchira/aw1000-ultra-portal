import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  Edit2,
  Save,
} from 'lucide-react';
import { useCellularStore } from '../../store/useCellularStore';
import type { ApnProfile } from '../../types/cellular';

export const ApnManagementView: React.FC = () => {
  const { apnProfiles, saveApn, deleteApn } = useCellularStore();

  const [editingApn, setEditingApn] = useState<ApnProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenAdd = () => {
    setEditingApn({
      id: `apn-${Date.now()}`,
      name: '',
      apn: '',
      pdpType: 'IPV4V6',
      authType: 'NONE',
      user: '',
      password: '',
      isDefault: false,
      mtu: 1500,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (apn: ApnProfile) => {
    setEditingApn({ ...apn });
    setModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApn || !editingApn.name || !editingApn.apn) return;
    await saveApn(editingApn);
    setModalOpen(false);
    setEditingApn(null);
  };

  const handleActivate = async (apn: ApnProfile) => {
    await saveApn({ ...apn, isDefault: true });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Cellular APN (Access Point Name) Profile Management
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure PDP context, dual-stack IPv4/IPv6 tunneling, and carrier authentication parameters
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New APN</span>
        </button>
      </div>

      {/* APN Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apnProfiles.map((apn) => (
          <div
            key={apn.id}
            className={`glass-panel rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
              apn.isDefault
                ? 'border-blue-500/40 bg-blue-500/5'
                : 'border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{apn.name}</span>
                  {apn.isDefault && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active APN
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(apn)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Edit APN"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {apnProfiles.length > 1 && (
                    <button
                      onClick={() => deleteApn(apn.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Delete APN"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* APN Details */}
              <div className="space-y-2 text-xs font-mono mb-4">
                <div className="glass-card rounded-xl p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">APN Address</span>
                  <span className="text-white font-bold text-xs truncate block mt-0.5">{apn.apn}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="glass-card rounded-xl p-2 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">PDP Protocol</span>
                    <span className="text-purple-300 font-semibold">{apn.pdpType}</span>
                  </div>

                  <div className="glass-card rounded-xl p-2 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">Auth Type</span>
                    <span className="text-slate-300 font-semibold">{apn.authType}</span>
                  </div>
                </div>

                {apn.user && (
                  <div className="glass-card rounded-xl p-2 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans">Username</span>
                    <span className="text-slate-300">{apn.user}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">MTU: {apn.mtu || 1500}</span>
              {!apn.isDefault && (
                <button
                  onClick={() => handleActivate(apn)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold transition-colors"
                >
                  Set as Active
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit APN Modal */}
      {modalOpen && editingApn && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-5 sm:p-6 border border-slate-700/80 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  {editingApn.id.startsWith('apn-') && !editingApn.name ? 'New APN Profile' : 'Edit APN Profile'}
                </h3>
                <p className="text-xs text-slate-400">Configure cellular PDP context parameters</p>
              </div>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Profile Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T-Mobile High Speed 5G"
                  value={editingApn.name}
                  onChange={(e) => setEditingApn({ ...editingApn, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">APN String (Host)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. fast.t-mobile.com or internet"
                  value={editingApn.apn}
                  onChange={(e) => setEditingApn({ ...editingApn, apn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">PDP Context Type</label>
                  <select
                    value={editingApn.pdpType}
                    onChange={(e) => setEditingApn({ ...editingApn, pdpType: e.target.value as ApnProfile['pdpType'] })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  >
                    <option value="IPV4V6">IPv4 / IPv6 (Dual Stack)</option>
                    <option value="IP">IPv4 Only</option>
                    <option value="IPV6">IPv6 Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Authentication</label>
                  <select
                    value={editingApn.authType}
                    onChange={(e) => setEditingApn({ ...editingApn, authType: e.target.value as ApnProfile['authType'] })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  >
                    <option value="NONE">None (Default)</option>
                    <option value="PAP">PAP</option>
                    <option value="CHAP">CHAP</option>
                  </select>
                </div>
              </div>

              {editingApn.authType !== 'NONE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">APN Username</label>
                    <input
                      type="text"
                      value={editingApn.user || ''}
                      onChange={(e) => setEditingApn({ ...editingApn, user: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">APN Password</label>
                    <input
                      type="password"
                      value={editingApn.password || ''}
                      onChange={(e) => setEditingApn({ ...editingApn, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-300 font-medium block mb-1">MTU Size</label>
                <input
                  type="number"
                  value={editingApn.mtu || 1500}
                  onChange={(e) => setEditingApn({ ...editingApn, mtu: parseInt(e.target.value) || 1500 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingApn.isDefault}
                  onChange={(e) => setEditingApn({ ...editingApn, isDefault: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Set as active default profile immediately</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save APN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
