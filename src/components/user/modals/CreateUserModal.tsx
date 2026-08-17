"use client";
import React, { useState, useEffect } from "react";
import { X, Loader2, Save, Building2 } from "lucide-react";
import { postBulkRegister } from "@/lib/users/api";
import { mapFrontendRoleToBackend, mapFrontendTeamToBackend, mapFrontendTypeToBackend } from "@/lib/users/auth";
import { fetchRoles, Role } from "@/lib/admin/rolesApi";
import { organizationService } from "@/services/organizationService";
import { fetchPublicTeams, fetchPublicTypes, Team as APITeam, UserTypeOption } from "@/lib/admin/teamsTypesApi";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export default function CreateUserModal({ open, onClose, onUserCreated }: CreateUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [team, setTeam] = useState("RESEARCH");
  const [type, setType] = useState("CLC");
  const [role, setRole] = useState("ROLE_USER");
  const [organization, setOrganization] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [availableTeams, setAvailableTeams] = useState<APITeam[]>([
    { id: 1, code: "RESEARCH", name: "Research" },
    { id: 2, code: "ENGINEER", name: "Engineer" },
    { id: 3, code: "EVENT", name: "Event" },
    { id: 4, code: "MEDIA", name: "Media" }
  ]);
  const [availableTypes, setAvailableTypes] = useState<UserTypeOption[]>([
    { id: 1, code: "CLC", name: "CLC" },
    { id: 2, code: "DT", name: "DT" },
    { id: 3, code: "TN", name: "TN" }
  ]);

  useEffect(() => {
    if (open) {
      // Fetch roles
      fetchRoles()
        .then(setRoles)
        .catch(err => console.error("Failed to fetch roles:", err));

      // Fetch organizations
      organizationService.list({ limit: 100 })
        .then(res => setOrganizations(res.items || []))
        .catch(err => console.error("Failed to fetch organizations:", err));

      // Fetch teams & types
      fetchPublicTeams()
        .then(data => { if (data && data.length > 0) setAvailableTeams(data); })
        .catch(err => console.error("Failed to fetch teams:", err));

      fetchPublicTypes()
        .then(data => { if (data && data.length > 0) setAvailableTypes(data); })
        .catch(err => console.error("Failed to fetch types:", err));

      // Reset form
      setName("");
      setEmail("");
      setCode("");
      setTeam("RESEARCH");
      setType("CLC");
      setRole("ROLE_USER");
      setOrganization("");
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !code.trim()) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = [{
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: mapFrontendRoleToBackend(role, roles),
        team: mapFrontendTeamToBackend(team),
        code: code.trim(),
        type: mapFrontendTypeToBackend(type),
        organization: organization.trim(),
      }];

      const res = await postBulkRegister(payload);
      if (!res) {
        throw new Error("Không thể tạo người dùng mới.");
      }

      setSuccess(true);
      onUserCreated();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Tạo người dùng thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Thêm Người Dùng
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">
                <strong>Lỗi:</strong> {error}
              </p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Thêm người dùng thành công!
              </p>
            </div>
          )}

          {/* Name & Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Tên *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Mã số (Code) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="2310000"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
            />
          </div>

          {/* Team & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Team
              </label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
              >
                {availableTeams.map((t) => (
                  <option key={t.code} value={t.code}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Loại (Type)
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
              >
                {availableTypes.map((t) => (
                  <option key={t.code} value={t.code}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Vai Trò (System Role)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.name}>{r.displayName}</option>
              ))}
            </select>
          </div>

          {/* Organization Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Tổ chức (Organization)
            </label>
            <div className="flex gap-2">
              <select
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
              >
                <option value="">-- Chọn tổ chức (Không bắt buộc) --</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.name}>{org.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Hoặc tự nhập tên..."
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all font-medium text-sm active:scale-95 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Save size={16} />
                Lưu lại
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
