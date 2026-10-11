"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { adminUpdateChannel, adminDeleteChannel, getChannelRoles, setChannelRoles, getChannelUsers, setChannelUsers, searchUsers } from "@/services/chat/chatService";
import type { ChatChannel, ChannelRoleEntry, ChatUser } from "@/types/chat/chat";
export const AVAILABLE_ROLES = ["ADMIN", "TEACHER", "STUDENT"];
export interface ChannelRowProps { channel: ChatChannel; onDeleted: (id: number) => void; onUpdated: (channel: ChatChannel) => void; }
export function useChatChannelRow({ channel, onDeleted, onUpdated }: ChannelRowProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [roles, setRoles] = useState<ChannelRoleEntry[]>([]);
  // pendingUsers: what will be saved - mutated locally on add/remove
  const [pendingUsers, setPendingUsers] = useState<ChatUser[]>([]);
  const [detailsLoaded, setDetailsLoaded] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingWhitelist, setSavingWhitelist] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description);
  const [isPrivate, setIsPrivate] = useState(channel.isPrivate);

  // User search state
  const [userQuery, setUserQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Load details once on first expand ────────────────────────────────────
  const loadDetails = async () => {
    setRolesLoading(true);
    setDetailsLoaded(false);
    try {
      // Parallel fetch - no serial waterfall
      const [r, u] = await Promise.all([
        getChannelRoles(channel.id),
        getChannelUsers(channel.id),  // returns ChatUser[] with full details
      ]);
      setRoles(r);
      setPendingUsers(u);
      setDetailsLoaded(true);
    } catch {
      setNotice("Không thể tải phân quyền. Hãy đóng và mở lại kênh để thử lại.");
    } finally {
      setRolesLoading(false);
    }
  };

  const toggle = () => {
    setNotice(null);
    if (!expanded) void loadDetails();
    setExpanded(!expanded);
  };

  // ── Debounced user search ─────────────────────────────────────────────────
  useEffect(() => {
    if (!userQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(userQuery);
        if (cancelled) return;
        // Exclude already-pending users
        const pendingIds = new Set(pendingUsers.map((u) => u.id));
        setSearchResults(results.filter((u) => !pendingIds.has(u.id)));
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 300);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [userQuery, pendingUsers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !searchRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Optimistic add/remove - pure local state mutations ───────────────────
  const handleAddUser = useCallback((user: ChatUser) => {
    setPendingUsers((prev) =>
      prev.find((u) => u.id === user.id) ? prev : [...prev, user]
    );
    setUserQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  }, []);

  const handleRemoveUser = useCallback((userId: number) => {
    setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  // ── Save whitelist - one PUT, response contains updated list ─────────────
  const handleSaveWhitelist = async () => {
    if (!detailsLoaded || rolesLoading) return;
    setSavingWhitelist(true);
    try {
      const ids = pendingUsers.map((u) => u.id);
      const updated = await setChannelUsers(channel.id, ids);
      // Replace from authoritative server response - no extra GET needed
      setPendingUsers(updated);
      setNotice("Đã lưu danh sách thành viên.");
    } catch (failure) {
      setNotice(failure instanceof Error ? failure.message : "Không thể lưu thay đổi. Hãy thử lại.");
    } finally {
      setSavingWhitelist(false);
    }
  };

  // ── Role handlers ─────────────────────────────────────────────────────────
  const handleRoleChange = (
    roleName: string,
    field: "canRead" | "canWrite",
    value: boolean
  ) => {
    setRoles((prev) => {
      const existing = prev.find((r) => r.roleName === roleName);
      if (existing) {
        return prev.map((r) =>
          r.roleName === roleName ? { ...r, [field]: value,
            ...(field === "canRead" && !value ? { canWrite: false } : {}),
            ...(field === "canWrite" && value ? { canRead: true } : {}),
          } : r
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
    if (!detailsLoaded || rolesLoading) return;
    setSaving(true);
    try {
      await setChannelRoles(channel.id, roles);
      setNotice("Đã lưu thay đổi.");
    } catch (failure) {
      setNotice(failure instanceof Error ? failure.message : "Không thể lưu thay đổi. Hãy thử lại.");
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
      setNotice("Đã lưu thay đổi.");
    } catch (failure) {
      setNotice(failure instanceof Error ? failure.message : "Không thể lưu thay đổi. Hãy thử lại.");
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
      setNotice("Đã xóa kênh.");
    } catch (failure) {
      setNotice(failure instanceof Error ? failure.message : "Không thể lưu thay đổi. Hãy thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  return { notice, detailsLoaded, expanded, roles, pendingUsers, rolesLoading, saving, savingWhitelist, deleting, editing, name, description, isPrivate, userQuery, searchResults, searchLoading, showDropdown, setShowDropdown, searchRef, dropdownRef, setEditing, setExpanded, setName, setDescription, setIsPrivate, setUserQuery, loadDetails, toggle, handleAddUser, handleRemoveUser, handleSaveWhitelist, handleRoleChange, handleAddRole, handleRemoveRole, handleSaveRoles, handleUpdate, handleDelete };
}
