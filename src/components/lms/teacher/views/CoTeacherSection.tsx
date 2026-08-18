"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { UserPlus, Trash2, Shield, Search } from "lucide-react";
import lmsService from "@/services/lms/lmsService";
import { useAuth } from "@/hooks/auth/useAuth";
import { Badge, InteractiveGlowCard, Spinner } from "@/components/lms/shared";
import { Course } from "@/types";

interface CoTeacher {
  id: number;
  course_id: number;
  user_id: number;
  full_name: string;
  email: string;
  added_by: number;
  created_at: string;
}

export function CoTeacherSection({ course }: { course: Course }) {
  const { user, isAdmin } = useAuth();
  const [coTeachers, setCoTeachers] = useState<CoTeacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Co-teachers state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coTeachersRes = await lmsService.getCoTeachers(course.id);
      setCoTeachers(coTeachersRes ?? []);
    } catch {
      setError("Không thể tải danh sách đồng giáo viên.");
    } finally {
      setLoading(false);
    }
  }, [course.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search teacher API
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (selectedUser && searchQuery === `${selectedUser.full_name} (${selectedUser.email})`) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await lmsService.searchTeachers(searchQuery);
        setSearchResults(res ?? []);
        setShowDropdown(true);
      } catch {}
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedUser]);

  const handleInputChange = (val: string) => {
    setSearchQuery(val);
    if (selectedUser && val !== `${selectedUser.full_name} (${selectedUser.email})`) {
      setSelectedUser(null);
    }
  };

  const handleSelectUser = (u: any) => {
    setSelectedUser(u);
    setSearchQuery(`${u.full_name} (${u.email})`);
    setShowDropdown(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!selectedUser) {
      setError("Vui lòng chọn một giáo viên từ kết quả tìm kiếm.");
      return;
    }

    setSubmitting(true);
    try {
      await lmsService.addCoTeacher(course.id, selectedUser.id);
      setSuccessMsg(`Đã thêm đồng giáo viên ${selectedUser.full_name} thành công!`);
      setSelectedUser(null);
      setSearchQuery("");
      const coTeachersRes = await lmsService.getCoTeachers(course.id);
      setCoTeachers(coTeachersRes ?? []);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Không thể thêm đồng giáo viên.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (userId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đồng giáo viên này khỏi khóa học?")) {
      return;
    }

    setError(null);
    setSuccessMsg(null);
    try {
      await lmsService.removeCoTeacher(course.id, userId);
      setSuccessMsg("Đã xóa đồng giáo viên thành công!");
      setCoTeachers(prev => prev.filter(ct => ct.user_id !== userId));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Không thể xóa đồng giáo viên.";
      setError(msg);
    }
  };

  const isOwner = course.created_by === Number(user?.id);
  const canManage = isOwner || isAdmin;

  return (
    <InteractiveGlowCard
      interactive={false}
      showOffset={false}
      innerClassName="p-5 md:p-6 bg-white dark:bg-[#0F1E35] space-y-5"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/10 pb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-wide">
            <Shield className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            Đội ngũ Giảng dạy & Đồng giáo viên
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý các giáo viên cùng tham gia hỗ trợ biên soạn và giảng dạy khóa học.
          </p>
        </div>
        <Badge variant="blue">{coTeachers.length + 1} Giảng viên</Badge>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800/60">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 text-xs font-medium text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
          {successMsg}
        </div>
      )}

      {/* Primary owner teacher card */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Giáo viên chủ nhiệm (Owner)
        </span>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0D192E] border border-slate-200/80 dark:border-blue-500/15">
          <div className="w-9 h-9 rounded-full bg-blue-600 dark:bg-cyan-500 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
            {(course.creator_name || "T").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                {course.creator_name || "Giáo viên khởi tạo"}
              </p>
              <Badge variant="green">Chủ nhiệm</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Chủ sở hữu khóa học · Có toàn quyền quản trị
            </p>
          </div>
        </div>
      </div>

      {/* Co-teacher list */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Đồng giáo viên ({coTeachers.length})
          </span>
        </div>

        {loading ? (
          <div className="py-4 text-center text-xs text-slate-400">Đang tải danh sách đồng giáo viên...</div>
        ) : coTeachers.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-blue-500/15 text-center text-xs text-slate-500 dark:text-slate-400">
            Chưa có đồng giáo viên nào được thêm vào khóa học này.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-blue-500/10 rounded-xl border border-slate-200 dark:border-blue-500/15 overflow-hidden">
            {coTeachers.map(ct => (
              <div
                key={ct.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-[#0F1E35] hover:bg-slate-50 dark:hover:bg-[#162644] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-cyan-400 flex-shrink-0">
                    {(ct.full_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                      {ct.full_name || "Đồng giáo viên"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {ct.email}
                    </p>
                  </div>
                </div>

                {canManage && (
                  <button
                    onClick={() => handleRemove(ct.user_id)}
                    className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                    title="Xóa đồng giáo viên"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add co-teacher form */}
      {canManage && (
        <form onSubmit={handleAdd} className="space-y-3 pt-3 border-t border-slate-100 dark:border-blue-500/10">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Thêm đồng giáo viên mới
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1" ref={dropdownRef}>
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleInputChange(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                placeholder="Nhập tên hoặc email giáo viên..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-blue-500/20 bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                disabled={submitting}
              />

              {showDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto z-50 bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/20 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-blue-500/10">
                  {searchResults.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUser(u)}
                      className="w-full flex flex-col items-start px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#162644] text-left transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {u.full_name || "Chưa cập nhật tên"}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {u.email}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedUser}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold text-xs rounded-xl active:scale-95 transition-all shadow-xs flex-shrink-0"
            >
              {submitting ? (
                <Spinner className="w-3.5 h-3.5 border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </InteractiveGlowCard>
  );
}
