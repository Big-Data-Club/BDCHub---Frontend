"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, Settings2, Loader2, DoorOpen,
  ChevronDown, ChevronRight, Users, MapPin,
} from "lucide-react";

interface DutyRoom {
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
      if (!res.ok) throw new Error(await res.text());
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
      if (!res.ok) throw new Error(await res.text());
      onDeleted(room.id);
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const campusColor = CAMPUS_COLORS[room.campus] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Row header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded
          ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
          : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
        <DoorOpen className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{room.name}</p>
          <p className="text-xs text-slate-400 truncate">{room.id} — {room.campus}, {room.building}-{room.room_number}</p>
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
        >
          <Settings2 className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          disabled={deleting}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 p-4 space-y-4">
          {/* Info badges */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
              {room.id}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${campusColor}`}>
              <MapPin className="h-3 w-3 inline mr-1" />{room.campus}
            </span>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
              Toà {room.building} — Phòng {room.room_number}
            </span>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
              Sức chứa: {room.capacity}
            </span>
          </div>

          {/* Edit form */}
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
              <div className="flex gap-2">
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
  const [rooms, setRooms] = useState<DutyRoom[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetch("/api/dutylog/rooms?org_id=1")
      .then((r) => r.json())
      .then((data) => setRooms(data.rooms || []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.id || !form.name || !form.campus || !form.building || !form.room_number) return;
    setCreating(true);
    try {
      const res = await fetch("/api/dutylog/rooms?org_id=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: parseInt(form.capacity) || 30,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      // Refresh list
      const listRes = await fetch("/api/dutylog/rooms?org_id=1");
      const data = await listRes.json();
      setRooms(data.rooms || []);
      setForm({ id: "", campus: "", building: "", room_number: "", name: "", capacity: "30" });
      setShowForm(false);
    } catch (e: any) {
      alert("Lỗi tạo phòng: " + e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">DutyLog Rooms</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý phòng vật lý cho hệ thống chấm công DutyLog
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Thêm phòng
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Phòng mới</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Room ID <span className="text-red-500">*</span>
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
                Tên phòng <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Big Data Club Room 605"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Cơ sở <span className="text-red-500">*</span>
              </label>
              <input
                value={form.campus}
                onChange={(e) => setForm({ ...form, campus: e.target.value })}
                placeholder="VD: Campus 1"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Toà nhà <span className="text-red-500">*</span>
              </label>
              <input
                value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
                placeholder="VD: C6"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Số phòng <span className="text-red-500">*</span>
              </label>
              <input
                value={form.room_number}
                onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                placeholder="VD: 605"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Sức chứa</label>
              <input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!form.id || !form.name || !form.campus || !form.building || !form.room_number || creating}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
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

      {/* Room list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <DoorOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>Chưa có phòng nào. Thêm phòng đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {rooms.length} phòng
          </p>
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
  );
}
