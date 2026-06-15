"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, Settings2, Loader2, Hash, Lock,
  ChevronDown, ChevronRight, Users, Shield
} from "lucide-react";
import {
  adminListChannels,
  adminCreateChannel,
  adminUpdateChannel,
  adminDeleteChannel,
  getChannelRoles,
  setChannelRoles,
  getChannelUsers,
  setChannelUsers,
} from "@/services/chatService";
import { ChatChannel, ChannelRoleEntry } from "@/types/chat";
import { cn } from "@/lib/utils";

// All available roles in the system
const AVAILABLE_ROLES = ["ADMIN", "TEACHER", "STUDENT"];

interface ChannelRowProps {
  channel: ChatChannel;
  onDeleted: (id: number) => void;
  onUpdated: (ch: ChatChannel) => void;
}

function ChannelRow({ channel, onDeleted, onUpdated }: ChannelRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [roles, setRoles] = useState<ChannelRoleEntry[]>([]);
  const [whitelistIds, setWhitelistIds] = useState<number[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description);
  const [isPrivate, setIsPrivate] = useState(channel.isPrivate);

  const loadDetails = async () => {
    setRolesLoading(true);
    try {
      const [r, u] = await Promise.all([
        getChannelRoles(channel.id),
        getChannelUsers(channel.id),
      ]);
      setRoles(r.length > 0 ? r : AVAILABLE_ROLES.map((role) => ({
        roleName: role, canRead: true, canWrite: true,
      })));
      setWhitelistIds(u);
    } finally {
      setRolesLoading(false);
    }
  };

  const toggle = () => {
    if (!expanded) loadDetails();
    setExpanded(!expanded);
  };

  const handleRoleChange = (
    roleName: string,
    field: "canRead" | "canWrite",
    value: boolean
  ) => {
    setRoles((prev) => {
      const existing = prev.find((r) => r.roleName === roleName);
      if (existing) {
        return prev.map((r) =>
          r.roleName === roleName ? { ...r, [field]: value } : r
        );
      }
      return [...prev, { roleName, canRead: true, canWrite: true, [field]: value }];
    });
  };

  const handleAddRole = (roleName: string) => {
    if (!roles.find((r) => r.roleName === roleName)) {
      setRoles((prev) => [...prev, { roleName, canRead: true, canWrite: true }]);
    }
  };

  const handleRemoveRole = (roleName: string) => {
    setRoles((prev) => prev.filter((r) => r.roleName !== roleName));
  };

  const handleSaveRoles = async () => {
    setSaving(true);
    try {
      await setChannelRoles(channel.id, roles);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const updated = await adminUpdateChannel(channel.id, { name, description, isPrivate });
      onUpdated(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Xóa kênh "#${channel.slug}"? Tất cả tin nhắn sẽ bị xóa.`)) return;
    setDeleting(true);
    try {
      await adminDeleteChannel(channel.id);
      onDeleted(channel.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Row header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer
                   bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750
                   transition-colors"
        onClick={toggle}
      >
        {expanded
          ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
          : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
        }
        {channel.isPrivate
          ? <Lock className="h-4 w-4 text-slate-400 flex-shrink-0" />
          : <Hash className="h-4 w-4 text-slate-400 flex-shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{channel.name}</p>
          <p className="text-xs text-slate-400 truncate">{channel.slug}{channel.description ? ` — ${channel.description}` : ""}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(true); setExpanded(true); }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
        >
          <Settings2 className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          disabled={deleting}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 p-4 space-y-5">
          {/* Edit name/desc */}
          {editing && (
            <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Chỉnh sửa kênh</h4>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên kênh"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600
                           bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
                           focus:outline-none focus:border-blue-500"
              />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả (tuỳ chọn)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600
                           bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
                           focus:outline-none focus:border-blue-500"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded"
                />
                Kênh riêng tư
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Lưu
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600
                             text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Huỷ
                </button>
              </div>
            </div>
          )}

          {/* Role permissions */}
          {rolesLoading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Shield className="h-4 w-4" /> Quyền truy cập theo Role
                </h4>
                <div className="flex gap-1">
                  {AVAILABLE_ROLES.filter((r) => !roles.find((rr) => rr.roleName === r)).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleAddRole(r)}
                      className="px-2 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-700
                                 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                    >
                      + {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {roles.map((role) => (
                  <div key={role.roleName}
                    className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5
                               border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 w-24 flex-shrink-0">
                      {role.roleName}
                    </span>
                    <label className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={role.canRead}
                        onChange={(e) => handleRoleChange(role.roleName, "canRead", e.target.checked)}
                        className="rounded"
                      />
                      Đọc
                    </label>
                    <label className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={role.canWrite}
                        onChange={(e) => handleRoleChange(role.roleName, "canWrite", e.target.checked)}
                        className="rounded"
                      />
                      Ghi
                    </label>
                    <button
                      onClick={() => handleRemoveRole(role.roleName)}
                      className="ml-auto p-1 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveRoles}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg
                           hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Lưu quyền
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChatRolesSettingsPage() {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ slug: "", name: "", description: "", isPrivate: false });

  useEffect(() => {
    adminListChannels()
      .then(setChannels)
      .catch(() => setChannels([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.slug || !form.name) return;
    setCreating(true);
    try {
      const ch = await adminCreateChannel(form);
      setChannels((prev) => [...prev, ch]);
      setForm({ slug: "", name: "", description: "", isPrivate: false });
      setShowForm(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Chat Roles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý kênh chat và phân quyền truy cập theo role
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm
                     font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tạo kênh
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                        dark:border-slate-700 p-5 space-y-4 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Kênh mới</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                placeholder="vd: general"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600
                           bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
                           focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Tên kênh <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="vd: General"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600
                           bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
                           focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Mô tả kênh (tuỳ chọn)"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600
                       bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
                       focus:outline-none focus:border-blue-500"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.isPrivate}
              onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
              className="rounded"
            />
            Kênh riêng tư (chỉ người được whitelist mới thấy)
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!form.slug || !form.name || creating}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white text-sm
                         rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Tạo
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600
                         text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Channel list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Hash className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>Chưa có kênh nào. Tạo kênh đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {channels.length} kênh
          </p>
          {channels.map((ch) => (
            <ChannelRow
              key={ch.id}
              channel={ch}
              onDeleted={(id) => setChannels((prev) => prev.filter((c) => c.id !== id))}
              onUpdated={(updated) =>
                setChannels((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
