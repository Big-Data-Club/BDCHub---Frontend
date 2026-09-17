"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Trash2, Settings2, Loader2, DoorOpen,
  ChevronDown, ChevronRight, Users, MapPin, Building2,
  ArrowLeft, Search
} from "lucide-react";

export interface DutyOrg {
  id: number;
  slug: string;
  name: string;
  description?: string;
  is_active: boolean;
  room_count?: number;
}

export interface DutyRoom {
  id: string;
  campus: string;
  building: string;
  room_number: string;
  name: string;
  capacity: number;
  is_active: boolean;
  current_occupancy: number;
}

interface RoomRowProps {
  room: DutyRoom;
  onDeleted: (id: string) => void;
  onUpdated: (room: DutyRoom) => void;
}

const CAMPUS_COLORS: Record<string, string> = {
  "Campus 1": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Campus 2": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

function RoomRow({ room, onDeleted, onUpdated }: RoomRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState(room.name);
  const [capacity, setCapacity] = useState(String(room.capacity));
  const [isActive, setIsActive] = useState(room.is_active);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/dutylog/rooms/${room.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          capacity: parseInt(capacity) || room.capacity,
          is_active: isActive,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || (await res.text()) || "Cập nhật thất bại");
      }
      onUpdated({ ...room, name, capacity: parseInt(capacity) || room.capacity, is_active: isActive });
      setEditing(false);
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Vô hiệu hoá phòng "${room.name}" (${room.id})?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/dutylog/rooms/${room.id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || (await res.text()) || "Xoá phòng thất bại");
      }
      onDeleted(room.id);
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const campusColor = CAMPUS_COLORS[room.campus] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600">
      {/* Row header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded
          ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
          : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
        <DoorOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{room.name}</p>
          <p className="text-xs text-slate-400 truncate font-mono">{room.id} — {room.campus}, {room.building}-{room.room_number}</p>
        </div>
        {/* Occupancy badge */}
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
          room.current_occupancy > 0
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
        }`}>
          <Users className="h-3 w-3" />
          {room.current_occupancy}/{room.capacity}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(true); setExpanded(true); }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
          title="Chỉnh sửa"
        >
          <Settings2 className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          disabled={deleting}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          title="Vô hiệu hoá"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-850 p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-mono bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md">
              ID: {room.id}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${campusColor}`}>
              <MapPin className="h-3 w-3 inline mr-1" />{room.campus}
            </span>
            <span className="text-xs bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md">
              Toà {room.building} — Phòng {room.room_number}
            </span>
            <span className="text-xs bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md">
              Sức chứa: {room.capacity}
            </span>
          </div>

          {editing && (
            <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Chỉnh sửa phòng</h4>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Tên phòng</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Sức chứa</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                Phòng đang hoạt động
              </label>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Lưu
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Huỷ
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DutyLogRoomsPage() {
  const [organizations, setOrganizations] = useState<DutyOrg[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<DutyOrg | null>(null);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [orgSearch, setOrgSearch] = useState("");

  const [rooms, setRooms] = useState<DutyRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    id: "",
    campus: "",
    building: "",
    room_number: "",
    name: "",
    capacity: "30",
  });

  // Tải danh sách các tổ chức
  const loadOrganizations = useCallback(async () => {
    setLoadingOrgs(true);
    try {
      const res = await fetch("/api/dutylog/organizations");
      if (res.ok) {
        const data = await res.json();
        const orgList: DutyOrg[] = data.organizations || [];
        setOrganizations(orgList);
      }
    } catch (err) {
      console.error("Failed to load organizations:", err);
    } finally {
      setLoadingOrgs(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  // Tải danh sách phòng khi chọn organization
  const loadRoomsForOrg = useCallback(async (orgId: number) => {
    setLoadingRooms(true);
    try {
      const res = await fetch(`/api/dutylog/rooms?org_id=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      } else {
        setRooms([]);
      }
    } catch (err) {
      console.error("Failed to load rooms for org:", err);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  const handleSelectOrg = (org: DutyOrg) => {
    setSelectedOrg(org);
    setShowForm(false);
    setForm({ id: "", campus: "", building: "", room_number: "", name: "", capacity: "30" });
    loadRoomsForOrg(org.id);
  };

  const handleBackToOrgs = () => {
    setSelectedOrg(null);
    setShowForm(false);
    loadOrganizations();
  };

  // Tự động sinh ID phòng gợi ý khi nhập campus, building, room_number
  const autoGenerateRoomId = (campus: string, building: string, roomNumber: string) => {
    let prefix = "CS1";
    if (campus.toLowerCase().includes("2")) prefix = "CS2";
    const b = building.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const r = roomNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (b && r) {
      return `${prefix}-${r}-${b}`;
    }
    return "";
  };

  const handleCreate = async () => {
    if (!selectedOrg) return;
    if (!form.id || !form.name || !form.campus || !form.building || !form.room_number) {
      alert("Vui lòng nhập đầy đủ các trường bắt buộc");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`/api/dutylog/rooms?org_id=${selectedOrg.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: parseInt(form.capacity) || 30,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || (await res.text()) || "Tạo phòng thất bại");
      }

      // Refresh lại danh sách phòng
      await loadRoomsForOrg(selectedOrg.id);
      // Cập nhật số phòng trên org
      setOrganizations(prev => prev.map(o => o.id === selectedOrg.id ? { ...o, room_count: (o.room_count || 0) + 1 } : o));
      setForm({ id: "", campus: "", building: "", room_number: "", name: "", capacity: "30" });
      setShowForm(false);
    } catch (e: any) {
      alert("Lỗi tạo phòng: " + e.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredOrgs = organizations.filter(o => 
    o.name.toLowerCase().includes(orgSearch.toLowerCase()) || 
    o.slug.toLowerCase().includes(orgSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* View 1: Danh sách Organization (khi chưa chọn org) */}
      {!selectedOrg ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                <Building2 className="h-7 w-7 text-blue-600" />
                DutyLog Rooms - Chọn Tổ chức
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Chọn một tổ chức / đơn vị bên dưới để quản lý và tạo phòng trực
              </p>
            </div>
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                placeholder="Tìm tổ chức..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>

          {loadingOrgs ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
              <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Không tìm thấy tổ chức</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Chưa có tổ chức nào hoặc không khớp với từ khóa tìm kiếm.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrgs.map((org) => (
                <div
                  key={org.id}
                  onClick={() => handleSelectOrg(org)}
                  className="group relative p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {org.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          slug: {org.slug} • ID: {org.id}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <DoorOpen className="h-3.5 w-3.5 text-blue-500" />
                      {org.room_count ?? 0} phòng
                    </span>
                  </div>

                  {org.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
                      {org.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-medium text-blue-600 dark:text-blue-400">
                    <span>Quản lý phòng</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* View 2: Danh sách Phòng của Org đã chọn */
        <div className="space-y-6">
          {/* Back & Org Header */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToOrgs}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Tất cả tổ chức
              </button>

              {/* Selector chuyển nhanh tổ chức */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Đổi tổ chức:</span>
                <select
                  value={selectedOrg.id}
                  onChange={(e) => {
                    const target = organizations.find(o => o.id === Number(e.target.value));
                    if (target) handleSelectOrg(target);
                  }}
                  className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {selectedOrg.name}
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold">
                    org_id: {selectedOrg.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Danh sách các phòng thuộc tổ chức này phục vụ chấm công DutyLog
                </p>
              </div>

              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                {showForm ? "Đóng form" : "Thêm phòng mới"}
              </button>
            </div>
          </div>

          {/* Form thêm phòng mới */}
          {showForm && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-blue-500" />
                  Tạo phòng mới cho {selectedOrg.name}
                </h3>
                <span className="text-xs text-slate-400">
                  organization_id: <b>{selectedOrg.id}</b>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                    Cơ sở (Campus) <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.campus}
                    onChange={(e) => {
                      const campus = e.target.value;
                      const genId = autoGenerateRoomId(campus, form.building, form.room_number);
                      setForm({ ...form, campus, id: genId || form.id });
                    }}
                    placeholder="VD: Campus 1 hoặc Campus 2"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                    Toà nhà (Building) <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.building}
                    onChange={(e) => {
                      const building = e.target.value;
                      const genId = autoGenerateRoomId(form.campus, building, form.room_number);
                      setForm({ ...form, building, id: genId || form.id });
                    }}
                    placeholder="VD: C6, B9, H6..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                    Số phòng (Room Number) <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.room_number}
                    onChange={(e) => {
                      const room_number = e.target.value;
                      const genId = autoGenerateRoomId(form.campus, form.building, room_number);
                      setForm({ ...form, room_number, id: genId || form.id });
                    }}
                    placeholder="VD: 605, 303..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                    Room ID (Mã duy nhất) <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") })}
                    placeholder="VD: CS1-605-C6"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                    Tên phòng hiển thị <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Phòng Lab HPC 605"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                    Sức chứa (Capacity)
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={!form.id || !form.name || !form.campus || !form.building || !form.room_number || creating}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium"
                >
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Tạo phòng
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Huỷ
                </button>
              </div>
            </div>
          )}

          {/* Danh sách các phòng */}
          {loadingRooms ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 space-y-3">
              <DoorOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="font-semibold text-slate-700 dark:text-slate-200">
                Chưa có phòng nào trong tổ chức {selectedOrg.name}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Bấm nút &quot;Thêm phòng mới&quot; phía trên để tạo phòng trực đầu tiên cho tổ chức này.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm phòng ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  {rooms.length} phòng đang quản lý
                </p>
              </div>

              {rooms.map((r) => (
                <RoomRow
                  key={r.id}
                  room={r}
                  onDeleted={(id) => setRooms((prev) => prev.filter((room) => room.id !== id))}
                  onUpdated={(updated) =>
                    setRooms((prev) => prev.map((room) => (room.id === updated.id ? updated : room)))
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
