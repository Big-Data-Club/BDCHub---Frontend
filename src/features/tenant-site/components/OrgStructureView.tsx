"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Mail,
  Phone,
  Globe,
  Search,
  ShieldCheck,
  Building2,
  LayoutGrid,
  FileText,
  Network,
  ExternalLink,
} from "lucide-react";
import type { OrgChartData, OrgMember, OrgGroup } from "../helpers";

interface Props {
  data: OrgChartData;
}

export function OrgStructureView({ data }: Props) {
  const [viewMode, setViewMode] = useState<"tree" | "grid" | "text">("tree");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return data.allMembers;
    const term = searchTerm.toLowerCase();
    return data.allMembers.filter(
      m =>
        m.name.toLowerCase().includes(term) ||
        m.role.toLowerCase().includes(term) ||
        (m.email && m.email.toLowerCase().includes(term)) ||
        (m.other && m.other.toLowerCase().includes(term))
    );
  }, [data.allMembers, searchTerm]);

  // Filter groups according to search
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return data.groups;
    const term = searchTerm.toLowerCase();
    return data.groups
      .map(group => ({
        ...group,
        members: group.members.filter(
          m =>
            m.name.toLowerCase().includes(term) ||
            m.role.toLowerCase().includes(term) ||
            (m.email && m.email.toLowerCase().includes(term)) ||
            (m.other && m.other.toLowerCase().includes(term))
        ),
      }))
      .filter(group => group.members.length > 0);
  }, [data.groups, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Intro text (if admin wrote text above the org chart) */}
      {data.introText && (
        <div className="prose max-w-none text-slate-700 dark:prose-invert dark:text-slate-300">
          <p className="whitespace-pre-line leading-relaxed">{data.introText}</p>
        </div>
      )}

      {/* Search & View Switcher Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Sơ đồ tổ chức</span>
            <span className="ml-2 inline-flex items-center rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {filteredMembers.length} thành viên · {filteredGroups.length} bộ phận
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
              <span>Bảng chi tiết</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: DYNAMIC TREE VIEW */}
      {viewMode === "tree" && (
        <div className="relative overflow-x-auto rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white/80 p-6 backdrop-blur-md dark:border-slate-800 dark:from-slate-900/40 dark:to-slate-900/80 md:p-10">
          <div className="min-w-[640px] space-y-8">
            {filteredGroups.map((group, gIdx) => (
              <div key={group.id} className="space-y-4">
                {/* Group Title Badge - Dynamically defined by Admin! */}
                <div className="text-center">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-xs ${
                      group.isRoot
                        ? "border border-[var(--tenant-primary)]/30 bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)]"
                        : "border border-slate-300/80 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {group.isRoot ? (
                      <ShieldCheck className="h-3.5 w-3.5 text-[var(--tenant-primary)]" />
                    ) : (
                      <Building2 className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span>{group.title}</span>
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold dark:bg-white/10">
                      {group.members.length}
                    </span>
                  </div>
                </div>

                {/* Group Members Grid */}
                <div
                  className={`grid gap-6 ${
                    group.isRoot
                      ? "flex flex-wrap justify-center"
                      : group.members.length === 1
                      ? "mx-auto max-w-sm"
                      : group.members.length === 2
                      ? "mx-auto max-w-2xl sm:grid-cols-2"
                      : "sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {group.members.map(member => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      isLeader={group.isRoot}
                    />
                  ))}
                </div>

                {/* Branch connector line to the next group */}
                {gIdx < filteredGroups.length - 1 && (
                  <div className="flex flex-col items-center pt-2">
                    <div className="h-8 w-0.5 bg-gradient-to-b from-[var(--tenant-primary)]/60 to-slate-300 dark:to-slate-700" />
                    <div className="h-2 w-2 rounded-full bg-[var(--tenant-primary)] shadow-[0_0_8px_var(--tenant-primary)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CARDS GRID */}
      {viewMode === "grid" && (
        <div className="space-y-10">
          {filteredGroups.map(group => (
            <div key={group.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{group.title}</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {group.members.length}
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.members.map(member => (
                  <MemberCard key={member.id} member={member} isLeader={group.isRoot} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 3: TEXT DETAIL TABLE */}
      {viewMode === "text" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-3.5">Họ và tên</th>
                  <th className="px-6 py-3.5">Chức vụ</th>
                  <th className="px-6 py-3.5">Bộ phận / Nhóm</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Điện thoại</th>
                  <th className="px-6 py-3.5">Website / Khác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredGroups.flatMap(group =>
                  group.members.map(member => (
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
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {group.title}
                      </td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Outro text (if admin wrote text below the org chart) */}
      {data.outroText && (
        <div className="prose max-w-none text-slate-700 dark:prose-invert dark:text-slate-300">
          <p className="whitespace-pre-line leading-relaxed">{data.outroText}</p>
        </div>
      )}
    </div>
  );
}

function MemberCard({ member, isLeader = false }: { member: OrgMember; isLeader?: boolean }) {
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
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {member.role}
            </span>
          </div>
          <h4 className="truncate text-base font-bold text-slate-900 dark:text-white md:text-lg">
            {member.name}
          </h4>
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
