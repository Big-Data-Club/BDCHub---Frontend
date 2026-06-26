"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Plus,
  Search,
  Users,
  BookOpen,
  GraduationCap,
  Settings,
  Trash2,
  ChevronRight,
  Eye,
  EyeOff,
  MoreVertical,
  UserPlus,
  Shield,
} from "lucide-react";
import { organizationService } from "@/services/organizationService";
import type { Organization, OrgMember, OrgStats } from "@/types";
import { useAuth } from "@/hooks/useAuth";

// ── Helpers ────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  ADMIN: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  MEMBER: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

// ── Sub-components ─────────────────────────────────────────────────────────

interface OrgCardProps {
  org: Organization;
  onSelect: (org: Organization) => void;
  onDeactivate: (id: number) => void;
}

function OrgCard({ org, onSelect, onDeactivate }: OrgCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div
      className={`relative bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden
        ${org.is_active ? "border-slate-200 dark:border-slate-800" : "border-red-200 dark:border-red-900/40 opacity-70"}`}
    >
      {/* Header stripe */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl" />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm leading-tight truncate">
                {org.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                /{org.slug}
              </p>
            </div>
          </div>

          {/* Status badge + menu */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                org.is_active
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
              }`}
            >
              {org.is_active ? "Active" : "Inactive"}
            </span>
            <div className="relative">
              <button
                id={`org-menu-${org.id}`}
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
              >
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1">
                  <button
                    onClick={() => { onSelect(org); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" /> Manage
                  </button>
                  {org.is_active && (
                    <button
                      onClick={() => { onDeactivate(org.id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Deactivate
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {org.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
            {org.description}
          </p>
        )}

        {/* Visibility pill */}
        <div className="flex items-center gap-2 mb-4">
          {org.settings?.default_course_visibility === "PUBLIC" ? (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs text-emerald-700 dark:text-emerald-400">
              <Eye className="w-3 h-3" /> Public courses
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-400">
              <EyeOff className="w-3 h-3" /> Org-only courses
            </span>
          )}
        </div>

        {/* Manage button */}
        <button
          id={`org-manage-${org.id}`}
          onClick={() => onSelect(org)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200 active:scale-95"
        >
          <Settings className="w-3.5 h-3.5" /> Manage
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Org Detail Panel ────────────────────────────────────────────────────────

interface OrgDetailPanelProps {
  org: Organization;
  onBack: () => void;
  onRefresh: () => void;
}

function OrgDetailPanel({ org, onBack, onRefresh }: OrgDetailPanelProps) {
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [memberPage, setMemberPage] = useState(1);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addRole, setAddRole] = useState<"OWNER" | "ADMIN" | "MEMBER">(
    "MEMBER"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [singleInput, setSingleInput] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [bulkResult, setBulkResult] = useState<{ added: string[]; not_found: string[] } | null>(null);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      setStats(await organizationService.getStats(org.id));
    } catch {
      // stats not critical
    } finally {
      setLoadingStats(false);
    }
  }, [org.id]);

  const loadMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const res = await organizationService.listMembers(org.id, {
        page: memberPage,
        limit: 20,
      });
      setMembers(res.items ?? []);
      setTotalMembers(res.total ?? 0);
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }, [org.id, memberPage]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleExecuteAddMember = async () => {
    if (!singleInput.trim()) return;
    setSaving(true);
    setError("");
    setBulkResult(null);

    const isEmail = singleInput.includes("@");
    try {
      if (isEmail) {
        const res = await organizationService.bulkAddMembers(org.id, {
          emails: [singleInput.trim()],
          org_role: addRole,
        });
        const notFound = res.not_found || [];
        if (notFound.length > 0) {
          setError(`User with email "${singleInput}" was not found in the system.`);
        } else {
          setSingleInput("");
          setShowAddMember(false);
          await loadMembers();
          await loadStats();
        }
      } else {
        const userId = parseInt(singleInput);
        if (isNaN(userId)) {
          setError("Please enter a valid Email address or User ID.");
          setSaving(false);
          return;
        }
        await organizationService.addMember(org.id, {
          user_id: userId,
          org_role: addRole,
        });
        setSingleInput("");
        setShowAddMember(false);
        await loadMembers();
        await loadStats();
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteBulkAdd = async () => {
    if (parsedEmails.length === 0) return;
    setSaving(true);
    setError("");
    setBulkResult(null);
    try {
      const res = await organizationService.bulkAddMembers(org.id, {
        emails: parsedEmails,
        org_role: addRole,
      });
      setBulkInput("");
      setParsedEmails([]);
      setBulkResult(res);
      await loadMembers();
      await loadStats();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to import members");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setBulkInput(val);
    
    if (!val) {
      setParsedEmails([]);
      return;
    }
    const matches = val.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (!matches) {
      setParsedEmails([]);
      return;
    }
    const unique = Array.from(new Set(matches.map(email => email.trim().toLowerCase())));
    setParsedEmails(unique);
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm("Remove this member?")) return;
    try {
      await organizationService.removeMember(org.id, userId);
      await loadMembers();
      await loadStats();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Failed to remove member");
    }
  };

  const handleRoleChange = async (
    userId: number,
    newRole: "OWNER" | "ADMIN" | "MEMBER"
  ) => {
    try {
      await organizationService.updateMemberRole(org.id, userId, {
        org_role: newRole,
      });
      await loadMembers();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Failed to update role");
    }
  };

  const StatCard = ({
    icon,
    label,
    value,
    loading,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number | undefined;
    loading: boolean;
  }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600/10 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      {loading ? (
        <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {value ?? 0}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
        >
          <ChevronRight className="w-4 h-4 text-slate-500 rotate-180" />
        </button>
        <div>
          <h2 className="font-bold text-slate-900 dark:text-slate-50 text-lg">
            {org.name}
          </h2>
          <p className="text-xs text-slate-500 font-mono">/{org.slug}</p>
        </div>
        <span
          className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
            org.is_active
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
          }`}
        >
          {org.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Users className="w-3.5 h-3.5 text-blue-500" />}
          label="Members"
          value={stats?.member_count}
          loading={loadingStats}
        />
        <StatCard
          icon={<BookOpen className="w-3.5 h-3.5 text-indigo-500" />}
          label="Courses"
          value={stats?.course_count}
          loading={loadingStats}
        />
        <StatCard
          icon={<GraduationCap className="w-3.5 h-3.5 text-violet-500" />}
          label="Enrollments"
          value={stats?.enrolled_count}
          loading={loadingStats}
        />
      </div>

      {/* Members section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">
              Members
            </h3>
            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-500">
              {totalMembers}
            </span>
          </div>
          <button
            id="add-member-btn"
            onClick={() => setShowAddMember((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Member
          </button>
        </div>

        {/* Add member form */}
        {showAddMember && (
          <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            {error && (
              <div className="px-4 py-2 mb-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            {bulkResult && (
              <div className="p-4 mb-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                  Import completed successfully!
                </p>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p>• Added: <span className="font-semibold text-slate-800 dark:text-slate-200">{(bulkResult.added || []).length}</span> members.</p>
                  {(bulkResult.not_found || []).length > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl">
                      <p className="font-semibold text-amber-800 dark:text-amber-400 mb-1">
                        Not found in system ({(bulkResult.not_found || []).length}):
                      </p>
                      <p className="font-mono break-all text-amber-700 dark:text-amber-400">
                        {(bulkResult.not_found || []).join(", ")}
                      </p>
                      <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-500">
                        * Note: These users must be created or synced in the LMS database first.
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setBulkResult(null)}
                  className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Tab navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4 gap-4">
              <button
                type="button"
                onClick={() => { setAddMode("single"); setError(""); }}
                className={`pb-2 text-xs font-bold border-b-2 transition-all duration-200 active:scale-95 ${
                  addMode === "single"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Single Member
              </button>
              <button
                type="button"
                onClick={() => { setAddMode("bulk"); setError(""); }}
                className={`pb-2 text-xs font-bold border-b-2 transition-all duration-200 active:scale-95 ${
                  addMode === "bulk"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Bulk Import
              </button>
            </div>

            {addMode === "single" ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="add-member-single-input"
                  type="text"
                  placeholder="Email address or User ID"
                  value={singleInput}
                  onChange={(e) => setSingleInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                />
                <select
                  id="add-member-role"
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as "OWNER" | "ADMIN" | "MEMBER")}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="OWNER">Owner</option>
                </select>
                <button
                  id="confirm-add-member"
                  onClick={handleExecuteAddMember}
                  disabled={saving || !singleInput.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm"
                >
                  {saving ? "Adding…" : "Add Member"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  id="add-member-bulk-input"
                  rows={4}
                  placeholder="Paste email list here (supports space, comma, semicolon, newline, or general text with email addresses)..."
                  value={bulkInput}
                  onChange={handleBulkInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 resize-none"
                />
                
                {parsedEmails.length > 0 && (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Detected Emails ({parsedEmails.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {parsedEmails.map((email) => (
                        <span key={email} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-lg text-[10px] font-medium">
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-500">
                    {parsedEmails.length === 0 ? "No emails detected yet" : `${parsedEmails.length} unique email(s) detected`}
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      id="add-member-role-bulk"
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value as "OWNER" | "ADMIN" | "MEMBER")}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      <option value="OWNER">Owner</option>
                    </select>
                    <button
                      id="confirm-bulk-add-member"
                      onClick={handleExecuteBulkAdd}
                      disabled={saving || parsedEmails.length === 0}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm"
                    >
                      {saving ? "Importing…" : `Import ${parsedEmails.length} Member(s)`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Member list */}
        {loadingMembers ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No members yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {members.map((m) => (
              <div
                key={m.user_id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Avatar placeholder */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {m.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                    {m.full_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{m.email}</p>
                </div>
                {/* Role selector */}
                <select
                  value={m.org_role}
                  onChange={(e) =>
                    handleRoleChange(
                      m.user_id,
                      e.target.value as "OWNER" | "ADMIN" | "MEMBER"
                    )
                  }
                  className={`px-2 py-1 rounded-lg text-xs font-medium border-0 outline-none cursor-pointer ${ROLE_COLORS[m.org_role] ?? ROLE_COLORS.MEMBER}`}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="OWNER">Owner</option>
                </select>
                {/* Remove */}
                <button
                  onClick={() => handleRemoveMember(m.user_id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors active:scale-95"
                  title="Remove member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalMembers > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              Page {memberPage} of {Math.ceil(totalMembers / 20)}
            </p>
            <div className="flex gap-2">
              <button
                disabled={memberPage <= 1}
                onClick={() => setMemberPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95"
              >
                Prev
              </button>
              <button
                disabled={memberPage >= Math.ceil(totalMembers / 20)}
                onClick={() => setMemberPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create Org Modal ────────────────────────────────────────────────────────

interface CreateOrgModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function CreateOrgModal({ open, onClose, onCreated }: CreateOrgModalProps) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    visibility: "PUBLIC" as "PUBLIC" | "ORG_ONLY",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) return;
    setSaving(true);
    setError("");
    try {
      await organizationService.create({
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        settings: { default_course_visibility: form.visibility },
      });
      setForm({ name: "", slug: "", description: "", visibility: "PUBLIC" });
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to create organization");
    } finally {
      setSaving(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (v: string) => {
    const slug = v
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setForm((f) => ({ ...f, name: v, slug }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-slate-50">
              Create Organization
            </h2>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Organization Name *
            </label>
            <input
              id="org-name"
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Big Data Club"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Slug *{" "}
              <span className="font-normal text-slate-400">(URL identifier)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">/</span>
              <input
                id="org-slug"
                required
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, ""),
                  }))
                }
                placeholder="bdc"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              id="org-description"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Briefly describe this organization…"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Course Visibility
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, visibility: "PUBLIC" }))
                }
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 active:scale-95 ${
                  form.visibility === "PUBLIC"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <Eye className="w-4 h-4" /> Public
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, visibility: "ORG_ONLY" }))
                }
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 active:scale-95 ${
                  form.visibility === "ORG_ONLY"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <EyeOff className="w-4 h-4" /> Org Only
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              PUBLIC: anyone can enroll. Org Only: org members only (or Super
              Admin grants cross-org access).
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              id="submit-create-org"
              type="submit"
              disabled={saving || !form.name || !form.slug}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95"
            >
              {saving ? "Creating…" : "Create Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function OrganizationsPage() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await organizationService.list({
        page,
        limit: 12,
        search: search || undefined,
      });
      setOrgs(res.items ?? []);
      setTotalPages(res.total_pages ?? 1);
    } catch {
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeactivate = async (id: number) => {
    if (!confirm("Deactivate this organization?")) return;
    try {
      await organizationService.deactivate(id);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Failed to deactivate");
    }
  };

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  if (selectedOrg) {
    return (
      <OrgDetailPanel
        org={selectedOrg}
        onBack={() => setSelectedOrg(null)}
        onRefresh={load}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Organizations
            </h1>
            <p className="text-xs text-slate-500">
              Manage organizations and member access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="org-search"
              type="text"
              placeholder="Search organizations…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 w-48"
            />
          </div>

          {/* Create button */}
          <button
            id="create-org-btn"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Org
          </button>
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
        <Shield className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          <span className="font-semibold">Super Admin only.</span> Creating or
          deactivating organizations requires Super Admin privileges. PUBLIC
          courses can be enrolled by anyone. ORG_ONLY courses require org
          membership - cross-org access must be granted by Super Admin.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="py-20 text-center">
          <Building2 className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No organizations found</p>
          {search && (
            <p className="text-sm text-slate-400 mt-1">
              Try a different search term
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orgs.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              onSelect={setSelectedOrg}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Modal */}
      <CreateOrgModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
      />
    </div>
  );
}
