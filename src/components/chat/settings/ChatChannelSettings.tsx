"use client";
import { Plus, Trash2, Settings2, Loader2, Hash, Lock, ChevronDown, ChevronRight, Users, Shield, Search, X, UserPlus } from "lucide-react";
import { UserAvatar } from "@/components/user/UserAvatar";
import { useAuth } from "@/hooks/auth/useAuth";
import { useChatChannelRow, AVAILABLE_ROLES, type ChannelRowProps } from "@/hooks/chat/useChatChannelRow";
import { useChatChannelSettings } from "@/hooks/chat/useChatChannelSettings";
function ChannelRow(props: ChannelRowProps) {
  const { channel } = props;
  const { notice, detailsLoaded, expanded, roles, pendingUsers, rolesLoading, saving, savingWhitelist, deleting, editing, name, description, isPrivate, userQuery, searchResults, searchLoading, showDropdown, setShowDropdown, searchRef, dropdownRef, setEditing, setExpanded, setName, setDescription, setIsPrivate, setUserQuery, loadDetails, toggle, handleAddUser, handleRemoveUser, handleSaveWhitelist, handleRoleChange, handleAddRole, handleRemoveRole, handleSaveRoles, handleUpdate, handleDelete } = useChatChannelRow(props);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {notice && <p role="status" className="border-b border-border bg-muted/50 px-4 py-3 text-sm text-foreground">{notice}</p>}
      {/* Row header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer
                   bg-card hover:bg-slate-50 dark:hover:bg-muted
                   transition-colors"
        onClick={toggle} role="button" tabIndex={0} aria-expanded={expanded}
        onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); toggle(); } }}
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
          <p className="font-medium text-sm text-foreground">{channel.name}</p>
          <p className="text-xs text-slate-400 truncate">{channel.slug}{channel.description ? ` - ${channel.description}` : ""}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); if (!expanded) void loadDetails(); setEditing(true); setExpanded(true); }} aria-label={`Chỉnh sửa kênh ${channel.name}`}
          className="p-1.5 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
        >
          <Settings2 className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); void handleDelete(); }} aria-label={`Xóa kênh ${channel.name}`}
          disabled={deleting}
          className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border bg-muted/40 p-4 space-y-5">
          {/* Edit name/desc */}
          {editing && (
            <div className="space-y-3 bg-card p-4 rounded-xl border border-border">
              <h4 className="text-sm font-semibold text-foreground">Chỉnh sửa kênh</h4>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên kênh"
                className="w-full px-3 py-2 text-sm rounded-xl border border-border
                           bg-card text-foreground
                           focus:outline-none focus:border-blue-500"
              />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả (tuỳ chọn)"
                className="w-full px-3 py-2 text-sm rounded-xl border border-border
                           bg-card text-foreground
                           focus:outline-none focus:border-blue-500"
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
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
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Lưu
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-1.5 text-sm rounded-xl border border-border
                             text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Huỷ
                </button>
              </div>
            </div>
          )}

          {rolesLoading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
            </div>
          ) : (
            <>
              {/* ── Role permissions ──────────────────────────────────────────── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Shield className="h-4 w-4" /> Quyền truy cập theo Role
                  </h4>
                  <div className="flex gap-1">
                    {AVAILABLE_ROLES.filter((r) => !roles.find((rr) => rr.roleName === r)).map((r) => (
                      <button
                        key={r}
                        onClick={() => handleAddRole(r)}
                        className="px-2 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-700
                                   text-muted-foreground hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                      >
                        + {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {roles.map((role) => (
                    <div key={role.roleName}
                      className="flex items-center gap-3 bg-card rounded-xl px-4 py-2.5
                                 border border-border">
                      <span className="text-sm font-medium text-foreground w-24 flex-shrink-0">
                        {role.roleName}
                      </span>
                      <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={role.canRead}
                          onChange={(e) => handleRoleChange(role.roleName, "canRead", e.target.checked)}
                          className="rounded"
                        />
                        Đọc
                      </label>
                      <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
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
                  disabled={saving || !detailsLoaded}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-xl
                             hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Lưu quyền
                </button>
              </div>

              {/* ── Whitelist thành viên ──────────────────────────────────────── */}
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Whitelist thành viên
                  <span className="ml-1 text-xs font-normal text-slate-400">({pendingUsers.length} người)</span>
                </h4>

                {/* Search input + dropdown */}
                <div className="relative">
                  <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl
                                  border border-border focus-within:border-blue-500 transition-colors">
                    <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <input
                      ref={searchRef}
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Tìm thêm thành viên..."
                      className="flex-1 bg-transparent text-sm text-foreground
                                 placeholder-slate-400 outline-none"
                    />
                    {searchLoading && <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />}
                    {userQuery && !searchLoading && (
                      <button onClick={() => { setUserQuery(""); setShowDropdown(false); }}>
                        <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown results */}
                  {showDropdown && searchResults.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-20 top-full mt-1 left-0 right-0 bg-card
                                 border border-border rounded-xl shadow-lg
                                 max-h-52 overflow-y-auto"
                    >
                      {searchResults.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handleAddUser(u)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left
                                     hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors group"
                        >
                          <UserAvatar name={u.fullName} src={u.profilePicture} className="h-7 w-7" fallbackClassName="text-[10px]" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {u.fullName}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{u.email}</p>
                          </div>
                          <UserPlus className="h-4 w-4 text-slate-300 group-hover:text-blue-500 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {showDropdown && !searchLoading && searchResults.length === 0 && userQuery.trim() && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-20 top-full mt-1 left-0 right-0 bg-card
                                 border border-border rounded-xl shadow-lg px-4 py-3
                                 text-sm text-slate-400 text-center"
                    >
                      Không tìm thấy người dùng nào
                    </div>
                  )}
                </div>

                {/* Current whitelist badges */}
                {pendingUsers.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Chưa có ai trong whitelist.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {pendingUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 bg-card
                                   border border-border rounded-full text-sm"
                      >
                        <UserAvatar name={u.fullName} src={u.profilePicture} className="h-5 w-5" fallbackClassName="text-[8px]" />
                        <span className="text-slate-700 dark:text-slate-300 max-w-[120px] truncate">{u.fullName}</span>
                        <button
                          onClick={() => handleRemoveUser(u.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleSaveWhitelist}
                  disabled={savingWhitelist || rolesLoading || !detailsLoaded}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white text-sm rounded-xl
                             hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                >
                  {savingWhitelist ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Users className="h-3.5 w-3.5" />}
                  Lưu whitelist
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}



export function ChatChannelSettings() {
  const { isAdmin } = useAuth();
  const { channels, setChannels, loading, creating, showForm, setShowForm, form, setForm, notice, query, setQuery, handleCreate } = useChatChannelSettings(isAdmin);
  if (!isAdmin) return <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Chỉ quản trị viên được quản lý kênh chat.</div>;
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {notice && <p role="status" className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground">{notice}</p>}
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cài đặt / Cộng đồng</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Không gian chat & phân quyền</h1>
          <p className="text-sm text-muted-foreground mt-1">
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

      <div className="grid gap-3 sm:grid-cols-3">{[
        ["Tổng số kênh", channels.length],
        ["Kênh cộng đồng", channels.filter((channel) => !channel.isPrivate).length],
        ["Kênh riêng tư", channels.filter((channel) => channel.isPrivate).length],
      ].map(([label, count]) => <div key={label} className="rounded-2xl border border-border bg-card px-5 py-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{count}</p></div>)}</div>
      <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3"><Search className="h-4 w-4 text-muted-foreground" /><input aria-label="Tìm kênh trong cài đặt" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kênh theo tên hoặc mô tả…" className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none" /></label>
      {/* Create form */}
      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
          <h3 className="font-semibold text-foreground">Kênh mới</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                placeholder="vd: general"
                className="w-full px-3 py-2 text-sm rounded-xl border border-border
                           bg-card text-foreground
                           focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Tên kênh <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="vd: General"
                className="w-full px-3 py-2 text-sm rounded-xl border border-border
                           bg-card text-foreground
                           focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Mô tả kênh (tuỳ chọn)"
            className="w-full px-3 py-2 text-sm rounded-xl border border-border
                       bg-card text-foreground
                       focus:outline-none focus:border-blue-500"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
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
              className="px-5 py-2 text-sm rounded-xl border border-border
                         text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-700"
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
          <p className="text-sm text-muted-foreground font-medium">
            {channels.length} kênh
          </p>
          {channels.filter((channel) => `${channel.name} ${channel.slug} ${channel.description}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))).map((ch) => (
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
