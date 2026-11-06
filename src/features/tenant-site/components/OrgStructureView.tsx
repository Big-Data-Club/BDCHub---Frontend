"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Mail,
  Phone,
  Globe,
  Search,
  Sparkles,
  ShieldCheck,
  Building2,
  LayoutGrid,
  FileText,
  Network,
  ExternalLink,
} from "lucide-react";
import type { PersonnelMember } from "../helpers";

interface Props {
  members: PersonnelMember[];
  introText?: string;
  primaryColor?: string;
}

export function OrgStructureView({ members, introText, primaryColor }: Props) {
  const [viewMode, setViewMode] = useState<"tree" | "grid" | "text">("tree");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    const term = searchTerm.toLowerCase();
    return members.filter(
      m =>
        m.name.toLowerCase().includes(term) ||
        m.role.toLowerCase().includes(term) ||
        (m.email && m.email.toLowerCase().includes(term)) ||
        (m.other && m.other.toLowerCase().includes(term))
    );
  }, [members, searchTerm]);

  // Group by tier
  const tier1 = useMemo(() => filteredMembers.filter(m => m.tier === 1), [filteredMembers]);
  const tier2 = useMemo(() => filteredMembers.filter(m => m.tier === 2), [filteredMembers]);
  const tier3 = useMemo(() => filteredMembers.filter(m => m.tier === 3 || m.tier === 4), [filteredMembers]);

  return (
    <div className="space-y-8">
      {/* Search & View Switcher Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Tổ chức nhân sự</span>
            <span className="ml-2 inline-flex items-center rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {filteredMembers.length} thành viên
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative min-w-48 flex-1 sm:w-64 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm cán bộ..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--tenant-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--tenant-primary)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          {/* View Mode Pills */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "tree"
                  ? "bg-[var(--tenant-primary)] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              <span>Sơ đồ cây</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-[var(--tenant-primary)] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Danh thiếp</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("text")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "text"
                  ? "bg-[var(--tenant-primary)] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Chi tiết</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: TREE VIEW */}
      {viewMode === "tree" && (
        <div className="relative overflow-x-auto rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white/80 p-6 backdrop-blur-md dark:border-slate-800 dark:from-slate-900/40 dark:to-slate-900/80 md:p-10">
          <div className="min-w-[640px] space-y-8">
            {/* TIER 1: LEADERSHIP / DIRECTOR */}
            {tier1.length > 0 && (
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tenant-primary)]/20 bg-[var(--tenant-primary)]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--tenant-primary)]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Ban Lãnh đạo</span>
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                  {tier1.map(member => (
                    <MemberCard key={member.id} member={member} isLeader />
                  ))}
                </div>
              </div>
            )}

            {/* Tree Branch Connector: Tier 1 to Tier 2 */}
            {tier1.length > 0 && (tier2.length > 0 || tier3.length > 0) && (
              <div className="flex flex-col items-center">
                <div className="h-8 w-0.5 bg-gradient-to-b from-[var(--tenant-primary)] to-slate-300 dark:to-slate-700" />
                <div className="h-2 w-2 rounded-full bg-[var(--tenant-primary)] shadow-[0_0_8px_var(--tenant-primary)]" />
              </div>
            )}

            {/* TIER 2: DEPUTY DIRECTORS */}
            {tier2.length > 0 && (
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Ban Phó Giám đốc</span>
                </div>
                {/* Horizontal branch line connecting columns */}
                <div className="relative pt-2">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {tier2.map(member => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tree Branch Connector: Tier 2 to Tier 3 */}
            {tier2.length > 0 && tier3.length > 0 && (
              <div className="flex flex-col items-center">
                <div className="h-8 w-0.5 bg-slate-300 dark:bg-slate-700" />
                <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600" />
              </div>
            )}

            {/* TIER 3: DEPARTMENTS & SPECIALISTS */}
            {tier3.length > 0 && (
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Bộ phận Chuyên môn & Kế toán</span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {tier3.map(member => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CARDS GRID */}
      {viewMode === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map(member => (
            <MemberCard key={member.id} member={member} isLeader={member.tier === 1} />
          ))}
        </div>
      )}

      {/* VIEW MODE 3: TEXT DETAIL */}
      {viewMode === "text" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-3.5">Họ và tên</th>
                  <th className="px-6 py-3.5">Chức vụ</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Điện thoại</th>
                  <th className="px-6 py-3.5">Website / Khác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredMembers.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--tenant-primary)]/10 text-xs font-bold text-[var(--tenant-primary)]">
                          {member.initials}
                        </span>
                        <span>{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--tenant-primary)]">{member.role}</td>
                    <td className="px-6 py-4">
                      {member.email ? (
                        <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline dark:text-blue-400">
                          {member.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4">{member.phone || "—"}</td>
                    <td className="px-6 py-4">
                      {member.website ? (
                        <a
                          href={member.website.startsWith("http") ? member.website : `https://${member.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-600 hover:underline dark:text-slate-300"
                        >
                          <span>{member.website.replace(/^https?:\/\//, "")}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        member.other || "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MemberCard({ member, isLeader = false }: { member: PersonnelMember; isLeader?: boolean }) {
  const websiteUrl = member.website
    ? member.website.startsWith("http")
      ? member.website
      : `https://${member.website}`
    : "";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isLeader
          ? "border-[var(--tenant-primary)]/40 bg-gradient-to-b from-white to-slate-50 shadow-md ring-2 ring-[var(--tenant-primary)]/20 hover:shadow-xl dark:from-slate-900 dark:to-slate-900/90"
          : "border-slate-200/80 bg-white shadow-xs hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700"
      } p-6 text-left`}
    >
      {/* Ambient gradient glow on leader card */}
      {isLeader && (
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--tenant-primary)]/10 blur-2xl" />
      )}

      <div className="flex items-start gap-4">
        {/* Avatar badge */}
        <div
          className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold shadow-xs transition-transform duration-300 group-hover:scale-105 ${
            isLeader
              ? "bg-gradient-to-br from-[var(--tenant-primary)] to-blue-600 text-white"
              : member.tier === 2
              ? "bg-gradient-to-br from-indigo-500 to-sky-500 text-white"
              : "bg-slate-100 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          }`}
        >
          {member.initials}
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${
                isLeader
                  ? "bg-[var(--tenant-primary)]/15 text-[var(--tenant-primary)]"
                  : member.tier === 2
                  ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {member.role}
            </span>
          </div>
          <h3 className="truncate text-base font-bold text-slate-900 dark:text-white md:text-lg">
            {member.name}
          </h3>
          {member.other && (
            <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {member.other}
            </p>
          )}
        </div>
      </div>

      {/* Contact actions */}
      {(member.email || member.phone || websiteUrl) && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800/80">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              title={`Gửi email: ${member.email}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-blue-950 dark:hover:text-blue-300"
            >
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate max-w-[140px]">{member.email}</span>
            </a>
          )}
          {member.phone && (
            <a
              href={`tel:${member.phone.replace(/[^+0-9]/g, "")}`}
              title={`Gọi điện: ${member.phone}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>{member.phone}</span>
            </a>
          )}
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Truy cập website: ${websiteUrl}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-purple-950 dark:hover:text-purple-300"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Website</span>
            </a>
          )}
        </div>
      )}
    </article>
  );
}
