"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { User } from "@/types";
import { fetchUsers, updateUserStatus } from "@/lib/users/api";
import UserRow from "./table/UserRow";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/auth/useAuth";


// Lazy-load components to optimize initial bundle size and page load speed
const DetailModal = dynamic(() => import("./modals/DetailModal"), { ssr: false });
const CreateUserModal = dynamic(() => import("./modals/CreateUserModal"), { ssr: false });
const BulkUploadPreviewModal = dynamic(() => import("./modals/BulkUploadPreviewModal"), { ssr: false });
const PendingUsersSection = dynamic(() => import("./table/PendingUsersSection").then(m => m.PendingUsersSection), { ssr: false });

function UserRowSkeleton() {
  return (
    <>
      {/* Mobile skeleton */}
      <div className="sm:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-850 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-3/5" />
            <div className="h-3 bg-slate-200 dark:bg-slate-850 rounded w-2/5" />
            <div className="h-3 bg-slate-200 dark:bg-slate-850 rounded w-4/5" />
          </div>
        </div>
      </div>
      {/* Desktop skeleton */}
      <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 animate-pulse">
        <div className="grid grid-cols-12 gap-4 items-center min-w-[640px]">
          <div className="col-span-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-850" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-850 rounded w-1/2" />
            </div>
          </div>
          <div className="col-span-1"><div className="h-4 bg-slate-200 dark:bg-slate-850 rounded mx-auto w-2/3" /></div>
          <div className="col-span-1"><div className="h-4 bg-slate-200 dark:bg-slate-850 rounded mx-auto w-1/2" /></div>
          <div className="col-span-2"><div className="h-4 bg-slate-200 dark:bg-slate-850 rounded mx-auto w-3/4" /></div>
          <div className="col-span-1"><div className="h-4 bg-slate-200 dark:bg-slate-850 rounded mx-auto w-1/3" /></div>
          <div className="col-span-2"><div className="h-4 bg-slate-200 dark:bg-slate-850 rounded mx-auto w-1/2" /></div>
          <div className="col-span-2 flex justify-center gap-3">
            <div className="h-6 w-11 bg-slate-200 dark:bg-slate-850 rounded-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-12" />
          </div>
        </div>
      </div>
    </>
  );
}

export default function UserApp() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [detail, setDetail] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewUsers, setPreviewUsers] = useState<any[] | null>(null);

  const [sortKey, setSortKey] = useState<"name" | "role" | "team" | "score" | "dateAdded" | "status" | "organization" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

  // simple sort toggler
  function toggleSort(key: typeof sortKey) {
    if (sortKey !== key) { setSortKey(key); setSortDir("asc"); return; }
    if (sortDir === "asc") setSortDir("desc");
    else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
    else setSortDir("asc");
  }

  // Debounce search inputs to avoid keypress rendering lag
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Reset to page 1 when query/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, teamFilter, typeFilter, roleFilter, sortKey, sortDir]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sortField = sortKey === "score"
        ? "totalScore"
        : sortKey === "status"
          ? "active"
          : sortKey === "dateAdded" || !sortKey
            ? "id"
            : sortKey;
      const result = await fetchUsers({
        page: currentPage - 1,
        pageSize: 15,
        query: debouncedQuery,
        team: teamFilter,
        type: typeFilter,
        role: roleFilter,
        sortBy: sortField,
        sortDir: sortDir || "desc",
      });
      setUsers(result.items);
      setTotalUsers(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? String(err));
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedQuery, teamFilter, typeFilter, roleFilter, sortKey, sortDir]);

  useEffect(() => { load(); }, [load]);

  async function handleFilePicked(file?: File) {
    if (!file) return;
    try {
      const { parseFile } = await import("@/lib/users/fileParser");
      const rows = await parseFile(file);
      if (!rows || rows.length === 0) {
        alert("No valid rows found in file");
        return;
      }
      setPreviewUsers(rows);
    } catch (err: any) {
      console.error(err);
      alert("Upload failed: " + (err.message || err));
    } finally {
      // clear file input outside
      const fileInput = document.getElementById("user-file-input") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    }
  }

  async function handleDownloadTemplate() {
    try {
      const [{ downloadUserImportTemplate }, { fetchRoles }, { fetchPublicTeams, fetchPublicTypes }, { organizationService }] = await Promise.all([
        import("@/lib/users/fileParser"),
        import("@/lib/admin/rolesApi"),
        import("@/lib/admin/teamsTypesApi"),
        import("@/services/admin/organizationService"),
      ]);
      const [roles, teams, types, organizationPage] = await Promise.all([
        fetchRoles(),
        fetchPublicTeams(),
        fetchPublicTypes(),
        organizationService.list({ limit: 10000 }),
      ]);
      downloadUserImportTemplate(roles, teams, types, organizationPage.items);
    } catch (err: any) {
      alert(`Không thể tạo file mẫu: ${err?.message || err}`);
    }
  }

  async function toggleStatusLocal(id: string | number) {
    if (!isAdmin) {
      alert("Chỉ có Quản trị viên mới có thể thực hiện hành động này.");
      return;
    }

    try {
      await updateUserStatus(id);
      await load();
    } catch (err: any) {
      console.error(err);
      alert("Cập nhật trạng thái thất bại: " + (err.message || err));
    }
  }

  // Extract unique filter values dynamically from loaded users
  const uniqueTeams = useMemo(() => {
    return Array.from(new Set(users.map(u => u.team).filter(Boolean))).sort() as string[];
  }, [users]);
  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(users.map(u => u.type).filter(Boolean))).sort() as string[];
  }, [users]);
  const uniqueRoles = useMemo(() => {
    return Array.from(new Set(users.map(u => u.role).filter(Boolean))).sort() as string[];
  }, [users]);

  const ITEMS_PER_PAGE = 15;
  const paginatedUsers = users;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight mb-2">
              Users
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {totalUsers} total users
            </p>
            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3">
            {/* Row 1: Search (full width) */}
            <div className="w-full relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or code..."
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Row 2: Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="flex-1 min-w-[120px] px-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
              >
                <option value="">All teams</option>
                {uniqueTeams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 min-w-[120px] px-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
              >
                <option value="">All types</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-1 min-w-[120px] px-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
              >
                <option value="">All roles</option>
                {uniqueRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Row 3: Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Bulk Upload hidden input */}
              <input
                id="user-file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFilePicked(f);
                }}
              />
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm active:scale-95 transition-all duration-200 text-sm"
              >
                Add User
              </button>
              <button
                onClick={() => document.getElementById("user-file-input")?.click()}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all duration-200 active:scale-95 text-sm"
              >
                Bulk upload
              </button>
              <button
                onClick={handleDownloadTemplate}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-medium transition-all duration-200 active:scale-95 text-sm"
              >
                Tải file Excel mẫu
              </button>
              <button
                onClick={load}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all duration-200 active:scale-95 text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Pending Users (admin only) */}
        {isAdmin && <PendingUsersSection isAdmin={isAdmin} onApproved={load} />}

        {/* Table Header - hidden on mobile */}
        <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-t-xl border border-b-0 border-slate-200 dark:border-slate-800 overflow-x-auto">
          <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[640px]">
            <button
              onClick={() => toggleSort("name")}
              className="col-span-3 text-left flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
            >
              <span>Username</span>
              {sortKey === "name" && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {sortDir === "asc" ? "▲" : "▼"}
                </span>
              )}
            </button>
            <button
              onClick={() => toggleSort("role")}
              className="col-span-1 text-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
            >
              Role {sortKey === "role" && (sortDir === "asc" ? "▲" : "▼")}
            </button>
            <button
              onClick={() => toggleSort("team")}
              className="col-span-1 text-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
            >
              Team {sortKey === "team" && (sortDir === "asc" ? "▲" : "▼")}
            </button>
            <button
              onClick={() => toggleSort("organization")}
              className="col-span-2 text-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
            >
              Org {sortKey === "organization" && (sortDir === "asc" ? "▲" : "▼")}
            </button>
            <button
              onClick={() => toggleSort("score")}
              className="col-span-1 text-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
            >
              Score {sortKey === "score" && (sortDir === "asc" ? "▲" : "▼")}
            </button>
            <button
              onClick={() => toggleSort("dateAdded")}
              className="col-span-2 text-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
            >
              Date added {sortKey === "dateAdded" && (sortDir === "asc" ? "▲" : "▼")}
            </button>
            <button
              onClick={() => toggleSort("status")}
              className="col-span-2 text-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200"
            >
              Status {sortKey === "status" && (sortDir === "asc" ? "▲" : "▼")}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2 rounded-xl sm:rounded-t-none sm:rounded-b-xl bg-white dark:bg-slate-900 border sm:border-t-0 border-slate-200 dark:border-slate-800 p-2">
          {loading && (
            <div className="space-y-2">
              <UserRowSkeleton />
              <UserRowSkeleton />
              <UserRowSkeleton />
              <UserRowSkeleton />
              <UserRowSkeleton />
            </div>
          )}
          {!loading && paginatedUsers.length > 0 && paginatedUsers.map((u) => (
            <UserRow key={u.id} user={u} onClick={(user) => setDetail(user)} onToggleStatus={toggleStatusLocal} isAdmin={isAdmin} />
          ))}
          {!loading && users.length === 0 && (
            <div className="py-12 px-4 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No users found</p>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Hiển thị <span className="font-semibold text-slate-900 dark:text-slate-100">{totalUsers === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">{Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)}</span> trong{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">{totalUsers}</span> người dùng
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
              >
                Trước
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, array) => {
                    const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                    return (
                      <React.Fragment key={page}>
                        {showEllipsisBefore && (
                          <span className="px-2 text-slate-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 text-sm font-semibold rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
                            currentPage === page
                              ? "bg-blue-600 text-white shadow-sm"
                              : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {detail && (
        <DetailModal user={detail} onClose={() => setDetail(null)} isAdmin={isAdmin} onUserUpdated={load} />
      )}
      {showCreateModal && (
        <CreateUserModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onUserCreated={load} />
      )}
      {previewUsers !== null && (
        <BulkUploadPreviewModal open={previewUsers !== null} onClose={() => setPreviewUsers(null)} parsedUsers={previewUsers} onImportSuccess={load} />
      )}
    </div>
  );
}
