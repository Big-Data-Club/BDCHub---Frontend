"use client";
import React, { useState, useEffect } from "react";
import { User } from "@/types";
import Avatar from "./Avatar";
import { X, Pencil, Save, Loader2, Mail, Hash, Shield, Users, GraduationCap, Star, Calendar, Activity, Building2, Plus, Trash2 } from "lucide-react";
import { updateUser, updateUserRole } from "@/lib/users/api";
import { mapFrontendTeamToBackend, mapFrontendTypeToBackend } from "@/lib/users/auth";
import { fetchRoles, Role } from "@/lib/admin/rolesApi";
import LmsUserRoleManager from "../admin/LmsUserRoleManager";
import { fetchPublicTeams, fetchPublicTypes, Team as APITeam, UserTypeOption } from "@/lib/admin/teamsTypesApi";
import { organizationService } from "@/services/organizationService";

interface DetailModalProps {
  user: User | null;
  onClose: () => void;
  isAdmin?: boolean;
  onUserUpdated?: () => void;
}



/* ── Helpers ──────────────────────────────────────────────────────── */
function displayRole(role: string): string {
  const map: Record<string, string> = {
    ROLE_ADMIN: "Admin",
    ROLE_MANAGER: "Manager",
    ROLE_USER: "Member",
    ROLE_ALUMNI: "Alumni",
  };
  return map[role] || role;
}

function roleBadgeColor(role: string): string {
  switch (role) {
    case "ROLE_ADMIN":
      return "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50";
    case "ROLE_MANAGER":
      return "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
    case "ROLE_ALUMNI":
      return "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/50";
    default:
      return "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
  }
}


export default function DetailModal({ user, onClose, isAdmin = false, onUserUpdated }: DetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTeam, setEditTeam] = useState("");
  const [editType, setEditType] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editOrganization, setEditOrganization] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgToAdd, setSelectedOrgToAdd] = useState("");

  const getOrgIdByName = (name: string): number | undefined => {
    const found = organizations.find(o => o.name === name);
    return found ? found.id : undefined;
  };

  const handleRemoveOrg = async (orgName: string) => {
    if (!user) return;
    const orgId = getOrgIdByName(orgName);
    if (!orgId) return;
    if (!confirm(`Bạn có chắc muốn xóa người dùng khỏi tổ chức "${orgName}"?`)) return;
    try {
      await organizationService.removeMember(orgId, Number(user.id));
      onUserUpdated?.();
    } catch (e: any) {
      console.error("Failed to remove member:", e);
      alert(e?.message ?? "Xóa thất bại");
    }
  };

  const handleAddOrg = async () => {
    if (!user || !selectedOrgToAdd) return;
    const orgId = getOrgIdByName(selectedOrgToAdd);
    if (!orgId) return;
    try {
      await organizationService.addMember(orgId, {
        user_id: Number(user.id),
        org_role: "MEMBER"
      });
      setSelectedOrgToAdd("");
      onUserUpdated?.();
    } catch (e: any) {
      console.error("Failed to add member:", e);
      alert(e?.message ?? "Thêm thất bại");
    }
  };

  // Dynamic teams & types
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
    fetchPublicTeams()
      .then(data => {
        if (data && data.length > 0) setAvailableTeams(data);
      })
      .catch(err => console.error("Failed to fetch dynamic teams:", err));

    fetchPublicTypes()
      .then(data => {
        if (data && data.length > 0) setAvailableTypes(data);
      })
      .catch(err => console.error("Failed to fetch dynamic types:", err));

    organizationService.list({ limit: 100 })
      .then(res => setOrganizations(res.items || []))
      .catch(err => console.error("Failed to fetch organizations:", err));
  }, []);

  const getTeamDisplayName = (teamCode: string) => {
    if (!teamCode) return "";
    const found = availableTeams.find(t => t.code.toUpperCase() === teamCode.toUpperCase());
    return found ? found.name : teamCode;
  };

  const getTypeDisplayName = (typeCode: string) => {
    if (!typeCode) return "";
    const found = availableTypes.find(t => t.code.toUpperCase() === typeCode.toUpperCase());
    return found ? found.name : typeCode;
  };

  // Reset form state when user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditTeam(user.team as string);
      setEditType(user.type as string);
      setEditRole(user.role as string);
      setEditOrganization(user.organization || "");
      setIsEditing(false);
      setSaveError(null);
      setSaveSuccess(false);

      if (isAdmin && roles.length === 0) {
        fetchRoles()
          .then((data) => setRoles(data))
          .catch((err) => console.error("Failed to fetch roles:", err));
      }
    }
  }, [user, isAdmin, roles.length]);

  if (!user) return null;

  const handleStartEdit = () => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditTeam(user.team as string);
    setEditType(user.type as string);
    setEditRole(user.role as string);
    setEditOrganization(user.organization || "");
    setSaveError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      setSaveError("Tên và email không được để trống.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      if (editRole !== user.role && isAdmin) {
        await updateUserRole(user.id, editRole);
      }

      await updateUser(user.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        team: mapFrontendTeamToBackend(editTeam),
        type: mapFrontendTypeToBackend(editType),
        organization: editOrganization.trim(),
      });

      setSaveSuccess(true);
      setIsEditing(false);
      onUserUpdated?.();

      // Auto-dismiss success after 2s
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      console.error("Update user failed:", err);
      setSaveError(err?.message ?? "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* ── Header - Profile Card ── */}
        <div className="relative p-6 pb-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          {/* Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            {isAdmin && !isEditing && (
              <button
                onClick={handleStartEdit}
                className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 
                           hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-all duration-200"
                title="Chỉnh sửa thông tin user"
              >
                <Pencil size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 
                         hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar code={user.code} size={56} />
              {/* Status dot */}
              <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                user.status ? "bg-green-500" : "bg-slate-400"
              }`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 truncate">
                {isEditing ? "Chỉnh sửa thông tin" : user.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                {isEditing ? user.name : user.email}
              </p>
              {!isEditing && (
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${roleBadgeColor(user.role as string)}`}>
                    <Shield className="w-3 h-3" />
                    {displayRole(user.role as string)}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {user.status ? "Active" : "Inactive"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {(saveError || saveSuccess) && (
          <div className="px-6 pt-4 flex-shrink-0">
            {saveError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>Lỗi:</strong> {saveError}
                </p>
              </div>
            )}
            {saveSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ Cập nhật thành công!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Content - Scrollable ── */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {isEditing ? (
            /* ── Edit Mode ────────────────────────────── */
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Tên
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 
                             bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 
                             placeholder-slate-400 dark:placeholder-slate-600 
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                             transition-all duration-200"
                  placeholder="Nhập tên..."
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 
                             bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 
                             placeholder-slate-400 dark:placeholder-slate-600 
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                             transition-all duration-200"
                  placeholder="Nhập email..."
                />
              </div>

              {/* Team & Type row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Team */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Team
                  </label>
                  <select
                    value={editTeam}
                    onChange={(e) => setEditTeam(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 
                               bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 
                               focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                               transition-all duration-200"
                  >
                    {availableTeams.map((t) => (
                      <option key={t.code} value={t.code}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Loại
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 
                               bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 
                               focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                               transition-all duration-200"
                  >
                    {availableTypes.map((t) => (
                      <option key={t.code} value={t.code}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Tổ chức (Organization)
                </label>
                <div className="flex gap-2">
                  <select
                    value={editOrganization}
                    onChange={(e) => setEditOrganization(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 
                               bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 
                               focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                               transition-all duration-200 text-sm"
                  >
                    <option value="">-- Chọn tổ chức --</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.name}>{org.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Hoặc tự nhập..."
                    value={editOrganization}
                    onChange={(e) => setEditOrganization(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 
                               bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 
                               focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                               transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Manage Member Organizations */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Danh sách tổ chức thành viên (Member Organizations)
                </label>
                
                {/* List current orgs */}
                <div className="space-y-2 mb-3">
                  {user.organizations && user.organizations.length > 0 ? (
                    user.organizations.map((orgName) => (
                      <div
                        key={orgName}
                        className="flex items-center justify-between px-3.5 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 rounded-xl text-sm"
                      >
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{orgName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOrg(orgName)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors duration-150"
                          title={`Xóa khỏi ${orgName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Chưa thuộc tổ chức nào</p>
                  )}
                </div>

                {/* Add new org */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedOrgToAdd}
                    onChange={(e) => setSelectedOrgToAdd(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 
                               bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 
                               focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                               transition-all duration-200 text-sm"
                  >
                    <option value="">-- Chọn tổ chức để thêm --</option>
                    {organizations
                      .filter(org => !user.organizations?.includes(org.name))
                      .map((org) => (
                        <option key={org.id} value={org.name}>{org.name}</option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddOrg}
                    disabled={!selectedOrgToAdd}
                    className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-1.5 transition-all duration-200 active:scale-95 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Thêm
                  </button>
                </div>
              </div>

              {/* Read-only fields in edit mode */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Code
                  </label>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {user.code}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  {isAdmin ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 
                                 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                                 transition-all duration-200"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.name}>{r.displayName}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {displayRole(user.role as string)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── View Mode ────────────────────────────── */
            <>
              {/* Info Grid - Icon-labeled fields */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Code */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                    <Hash className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Code</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{user.code}</p>
                  </div>
                </div>

                {/* Team */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                    <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Team</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{getTeamDisplayName(user.team as string)}</p>
                  </div>
                </div>

                {/* Type */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                    <GraduationCap className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Loại</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{getTypeDisplayName(user.type as string)}</p>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg shrink-0">
                    <Star className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Điểm</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{user.score ?? 0}</p>
                  </div>
                </div>

                {/* Date Added */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                    <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ngày thêm</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {user.dateAdded
                        ? new Date(user.dateAdded).toLocaleDateString("vi-VN")
                        : "Chưa xác định"}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${user.status ? "bg-green-50 dark:bg-green-950/40" : "bg-slate-100 dark:bg-slate-800"}`}>
                    <Activity className={`w-4 h-4 ${user.status ? "text-green-500 dark:text-green-400" : "text-slate-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trạng thái</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block h-2 w-2 rounded-full ${user.status ? "bg-green-500" : "bg-slate-400"}`} />
                      <p className={`text-sm font-semibold ${user.status ? "text-green-600 dark:text-green-400" : "text-slate-500"}`}>
                        {user.status ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Organization */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                    <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tổ chức</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate" title={user.organizations?.join(", ") || user.organization}>
                      {user.organizations && user.organizations.length > 0
                        ? user.organizations.join(", ")
                        : (user.organization || "Chưa tham gia")}
                    </p>
                  </div>
                </div>
              </div>

              {/* LMS Access (Admin Only) */}
              {isAdmin && (
                <div className="pt-5 border-t border-slate-200 dark:border-slate-800">
                  <LmsUserRoleManager userId={user.id} />
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end gap-3 p-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 
                           text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900
                           hover:bg-slate-50 dark:hover:bg-slate-800 font-medium 
                           transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                           shadow-sm transition-all duration-200 active:scale-95 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                         transition-colors duration-200 active:scale-95"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
