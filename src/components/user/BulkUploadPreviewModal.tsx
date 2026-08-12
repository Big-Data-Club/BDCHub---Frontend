"use client";
import React, { useState, useEffect, useMemo } from "react";
import { X, Trash2, Plus, Loader2, Check, AlertCircle, Building2 } from "lucide-react";
import { postBulkRegister } from "@/lib/users/api";
import { mapFrontendTeamToBackend, mapFrontendTypeToBackend } from "@/lib/users/auth";
import { fetchRoles, Role } from "@/lib/admin/rolesApi";
import { organizationService } from "@/services/organizationService";

interface BulkUser {
  id: string;
  name: string;
  email: string;
  code: string;
  roles: string;
  team: string;
  type: string;
  organizations: string;
}

interface BulkUploadPreviewModalProps {
  open: boolean;
  onClose: () => void;
  parsedUsers: any[];
  onImportSuccess: () => void;
}

export default function BulkUploadPreviewModal({ open, onClose, parsedUsers, onImportSuccess }: BulkUploadPreviewModalProps) {
  const [users, setUsers] = useState<BulkUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      // Map incoming raw rows
      const mapped = parsedUsers.map((u, i) => ({
        id: `row-${i}-${Date.now()}`,
        name: u.name || "",
        email: u.email || "",
        code: u.code || "",
        roles: u.roles || u.role || "ROLE_USER",
        team: u.team || "RESEARCH",
        type: u.type || "CLC",
        organizations: u.organizations || u.organization || "",
      }));
      setUsers(mapped);
      setError(null);
      setSuccess(false);

      // Load roles & organizations
      fetchRoles()
        .then(setRoles)
        .catch(err => console.error("Failed to load roles:", err));

      organizationService.list({ limit: 100 })
        .then(res => setOrganizations(res.items || []))
        .catch(err => console.error("Failed to load organizations:", err));
    }
  }, [open, parsedUsers]);

  const handleUpdateField = (id: string, field: keyof BulkUser, value: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const handleRemoveUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleAddRow = () => {
    setUsers(prev => [
      ...prev,
      {
        id: `row-added-${Date.now()}`,
        name: "",
        email: "",
        code: "",
        roles: "ROLE_USER",
        team: "RESEARCH",
        type: "CLC",
        organizations: "",
      }
    ]);
  };

  const validationErrors = useMemo(() => {
    const result: Record<string, string[]> = {};
    const seenEmails = new Set<string>();
    const seenCodes = new Set<string>();
    const validRoles = new Set(roles.map(role => role.name.toUpperCase()));
    const validOrganizations = new Set(organizations.flatMap(org => [org.slug.toLowerCase(), org.name.toLowerCase()]));
    const validOrgRoles = new Set(["MEMBER", "ADMIN", "OWNER"]);

    users.forEach(user => {
      const errors: string[] = [];
      const email = user.email.trim().toLowerCase();
      const code = user.code.trim();
      if (!user.name.trim()) errors.push("Thiếu họ tên");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push("Email không hợp lệ");
      if (!code) errors.push("Thiếu mã số");
      if (seenEmails.has(email)) errors.push("Trùng email trong file");
      if (seenCodes.has(code)) errors.push("Trùng mã số trong file");
      seenEmails.add(email);
      seenCodes.add(code);

      const rowRoles = user.roles.split(";").map(value => value.trim().toUpperCase()).filter(Boolean);
      if (!rowRoles.length) errors.push("Thiếu role");
      rowRoles.forEach(role => {
        const normalized = role.startsWith("ROLE_") ? role : `ROLE_${role}`;
        if (validRoles.size && !validRoles.has(normalized)) errors.push(`Role không tồn tại: ${role}`);
      });

      user.organizations.split(";").map(value => value.trim()).filter(Boolean).forEach(token => {
        const [identifier, rawOrgRole = "MEMBER"] = token.split(":", 2);
        if (validOrganizations.size && !validOrganizations.has(identifier.trim().toLowerCase())) {
          errors.push(`Tổ chức không tồn tại: ${identifier}`);
        }
        if (!validOrgRoles.has(rawOrgRole.trim().toUpperCase())) errors.push(`Org-role không hợp lệ: ${rawOrgRole}`);
      });
      if (errors.length) result[user.id] = errors;
    });
    return result;
  }, [organizations, roles, users]);

  if (!open) return null;

  const handleConfirmImport = async () => {
    if (users.length === 0) {
      setError("Không có dữ liệu người dùng để import.");
      return;
    }

    // Basic validation
    if (Object.keys(validationErrors).length > 0) {
      setError(`Còn ${Object.keys(validationErrors).length} dòng chưa hợp lệ. Di chuột vào cảnh báo ở từng dòng để xem chi tiết.`);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = users.map(u => ({
        name: u.name.trim(),
        email: u.email.trim().toLowerCase(),
        role: u.roles.split(";").map(value => value.trim()).filter(Boolean)[0],
        roles: u.roles.split(";").map(value => {
          const normalized = value.trim().toUpperCase();
          return normalized.startsWith("ROLE_") ? normalized : `ROLE_${normalized}`;
        }).filter(Boolean),
        team: mapFrontendTeamToBackend(u.team),
        code: u.code.trim(),
        type: mapFrontendTypeToBackend(u.type),
        organization: u.organizations.trim(),
        organizations: u.organizations.split(";").map(value => value.trim()).filter(Boolean).map(token => {
          const [identifier, orgRole = "MEMBER"] = token.split(":", 2);
          return { identifier: identifier.trim(), orgRole: orgRole.trim().toUpperCase() as "MEMBER" | "ADMIN" | "OWNER" };
        }),
      }));

      const res = await postBulkRegister(payload);
      if (!res) {
        throw new Error("Không thể import người dùng.");
      }

      setSuccess(true);
      onImportSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Import thất bại. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Xem Trước & Chỉnh Sửa Danh Sách Import
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Phát hiện {users.length} dòng dữ liệu từ file. Vui lòng rà soát lại thông tin trước khi lưu.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form / Grid */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="p-4 mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">Lỗi Import</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="p-4 mb-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl flex gap-3 items-center">
              <Check className="w-5 h-5 text-green-500" />
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">Import thành công! Đang đồng bộ...</p>
            </div>
          )}

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 font-semibold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Tên *</th>
                  <th className="px-4 py-3">Email *</th>
                  <th className="px-4 py-3">Mã số *</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Tổ chức</th>
                  <th className="px-4 py-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        required
                        value={u.name}
                        onChange={(e) => handleUpdateField(u.id, "name", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm dark:text-slate-100"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="email"
                        required
                        value={u.email}
                        onChange={(e) => handleUpdateField(u.id, "email", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm dark:text-slate-100"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        required
                        value={u.code}
                        onChange={(e) => handleUpdateField(u.id, "code", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm dark:text-slate-100"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={u.team}
                        onChange={(e) => handleUpdateField(u.id, "team", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:border-blue-500 outline-none text-sm dark:text-slate-100 dark:bg-slate-900"
                      >
                        <option value="RESEARCH">Research</option>
                        <option value="ENGINEER">Engineer</option>
                        <option value="EVENT">Event</option>
                        <option value="MEDIA">Media</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={u.type}
                        onChange={(e) => handleUpdateField(u.id, "type", e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:border-blue-500 outline-none text-sm dark:text-slate-100 dark:bg-slate-900"
                      >
                        <option value="CLC">CLC</option>
                        <option value="DT">DT</option>
                        <option value="TN">TN</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={u.roles}
                        onChange={(e) => handleUpdateField(u.id, "roles", e.target.value)}
                        placeholder="ROLE_MANAGER;ROLE_USER"
                        title={`Phân cách nhiều role bằng dấu ;. Hợp lệ: ${roles.map(role => role.name).join(", ")}`}
                        className="min-w-[210px] w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:border-blue-500 outline-none text-xs dark:text-slate-100"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        placeholder="bdc:MEMBER;hpc:ADMIN"
                        value={u.organizations}
                        onChange={(e) => handleUpdateField(u.id, "organizations", e.target.value)}
                        title="Dùng slug:MEMBER|ADMIN|OWNER; phân cách nhiều tổ chức bằng dấu ;"
                        className="min-w-[220px] w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg focus:border-blue-500 outline-none text-xs dark:text-slate-100"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      {validationErrors[u.id] && (
                        <AlertCircle
                          size={16}
                          className="mx-auto mb-1 text-amber-500"
                          aria-label={validationErrors[u.id].join("; ")}
                        />
                      )}
                      <button
                        onClick={() => handleRemoveUser(u.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors active:scale-95"
                        title={validationErrors[u.id]?.join("; ") || "Xóa dòng"}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleAddRow}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-xl text-sm font-medium transition-all active:scale-95 w-full justify-center"
          >
            <Plus size={16} /> Thêm Dòng Mới
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all font-medium text-sm active:scale-95 disabled:opacity-50"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={saving || users.length === 0}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check size={16} />
                Xác Nhận Import ({users.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
