"use client";

import React, { useState } from "react";
import {
  X, Users, Link2, Copy, Check, Trash2, Plus,
  ChevronDown, Crown, Edit3, Eye, MessageSquare, Shield,
} from "lucide-react";
import type { Collaborator, ShareLink } from "@/types";
import { useCollaborators } from "@/hooks/useCollaborators";

interface ShareProjectModalProps {
  projectId: number;
  projectTitle: string;
  ownerEmail: string;
  userRole?: string;
  onClose: () => void;
}

type Role = "editor" | "reviewer" | "viewer";

const ROLE_CONFIG: Record<Role | "owner", { label: string; icon: React.ElementType; badge: string }> = {
  owner:    { label: "Chủ sở hữu", icon: Crown,          badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40" },
  editor:   { label: "Biên soạn",  icon: Edit3,          badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40" },
  reviewer: { label: "Nhận xét",   icon: MessageSquare,  badge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/40" },
  viewer:   { label: "Xem",        icon: Eye,            badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" },
};

function RoleBadge({ role }: { role: Role | "owner" }) {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${cfg.badge}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function Avatar({ email }: { email: string }) {
  const initial = email.charAt(0).toUpperCase();
  const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500", "bg-cyan-500"];
  const color = colors[email.charCodeAt(0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initial}
    </div>
  );
}

export function ShareProjectModal({ projectId, projectTitle, ownerEmail, userRole, onClose }: ShareProjectModalProps) {
  const {
    collaborators, shareLinks, loading,
    addCollaborator, removeCollaborator, updateRole,
    createShareLink, deactivateShareLink,
  } = useCollaborators(projectId, userRole);

  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<Role>("editor");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [linkRole, setLinkRole] = useState<Role>("viewer");
  const [linkLoading, setLinkLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [linksOpen, setLinksOpen] = useState(false);

  const isOwner = userRole === "owner";

  const handleAdd = async () => {
    if (!emailInput.trim()) return;
    setAddError("");
    setAddLoading(true);
    try {
      await addCollaborator(emailInput.trim(), roleInput);
      setEmailInput("");
    } catch (err: any) {
      setAddError(err.message || "Thêm thất bại");
    } finally {
      setAddLoading(false);
    }
  };

  const handleCopyLink = async (link: ShareLink) => {
    await navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateLink = async () => {
    setLinkLoading(true);
    try {
      await createShareLink(linkRole);
      setLinksOpen(true);
    } catch (err: any) {
      setAddError(err.message || "Tạo liên kết thất bại");
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">Chia sẻ dự án</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[260px]">{projectTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Add Collaborator (owner only) */}
          {isOwner && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Thêm cộng tác viên</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Nhập email..."
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setAddError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as Role)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="editor">Biên soạn</option>
                  <option value="reviewer">Nhận xét</option>
                  <option value="viewer">Xem</option>
                </select>
                <button
                  onClick={handleAdd}
                  disabled={addLoading || !emailInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl px-3 py-2 text-xs shadow-sm active:scale-95 transition-all duration-200 flex items-center gap-1"
                >
                  {addLoading ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Plus size={14} />}
                  Thêm
                </button>
              </div>
              {addError && (
                <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{addError}</p>
              )}
            </div>
          )}

          {/* Collaborator List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Thành viên <span className="font-normal text-slate-400">({collaborators.length + 1})</span>
            </h3>

            {/* Owner row */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <Avatar email={ownerEmail} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{ownerEmail}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Chủ sở hữu</p>
              </div>
              <RoleBadge role="owner" />
            </div>

            {/* Collaborator rows */}
            {collaborators.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 group">
                <Avatar email={c.user_email} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{c.user_email}</p>
                </div>
                {isOwner ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={c.role}
                      onChange={(e) => updateRole(c.user_id, e.target.value)}
                      className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 outline-none cursor-pointer"
                    >
                      <option value="editor">Biên soạn</option>
                      <option value="reviewer">Nhận xét</option>
                      <option value="viewer">Xem</option>
                    </select>
                    <button
                      onClick={() => removeCollaborator(c.user_id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg active:scale-95 transition-all duration-150"
                      title="Xóa cộng tác viên"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <RoleBadge role={c.role} />
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Share Links (owner/editor only) */}
          {(userRole === "owner" || userRole === "editor") && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setLinksOpen(!linksOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Link2 size={14} />
                  Liên kết chia sẻ
                  {shareLinks.filter((l) => l.active).length > 0 && (
                    <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {shareLinks.filter((l) => l.active).length}
                    </span>
                  )}
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${linksOpen ? "rotate-180" : ""}`} />
              </button>

              {linksOpen && (
                <div className="px-4 py-4 space-y-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Create link */}
                  <div className="flex gap-2">
                    <select
                      value={linkRole}
                      onChange={(e) => setLinkRole(e.target.value as Role)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
                    >
                      <option value="editor">Biên soạn</option>
                      <option value="reviewer">Nhận xét</option>
                      <option value="viewer">Xem</option>
                    </select>
                    <button
                      onClick={handleCreateLink}
                      disabled={linkLoading}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl px-4 py-2 text-xs active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
                    >
                      {linkLoading ? <div className="w-3 h-3 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" /> : <Plus size={13} />}
                      Tạo liên kết
                    </button>
                  </div>

                  {/* Link list */}
                  <div className="space-y-2">
                    {shareLinks.map((link) => (
                      <div key={link.id} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-opacity ${link.active ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" : "border-slate-100 dark:border-slate-800 opacity-50"}`}>
                        <RoleBadge role={link.role} />
                        <p className="flex-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{link.url}</p>
                        <button
                          onClick={() => handleCopyLink(link)}
                          disabled={!link.active}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg active:scale-95 transition-all duration-150 disabled:opacity-40"
                          title="Sao chép liên kết"
                        >
                          {copiedId === link.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>
                        {link.active && isOwner && (
                          <button
                            onClick={() => deactivateShareLink(link.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg active:scale-95 transition-all duration-150"
                            title="Vô hiệu hóa"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                    {shareLinks.length === 0 && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">Chưa có liên kết chia sẻ nào.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            <Shield size={12} />
            <span>Quyền truy cập được kiểm soát theo cấp độ vai trò. Chỉ chủ sở hữu mới có thể xóa dự án.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
