"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Users,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  RefreshCcw,
  X,
  Sparkles,
  Search,
  Check,
  AlertTriangle,
  FileText
} from "lucide-react";
import {
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  fetchTypes,
  createType,
  updateType,
  deleteType,
  Team,
  UserTypeOption
} from "@/lib/admin/teamsTypesApi";

const DEFAULT_SYSTEM_TEAMS = ["RESEARCH", "ENGINEER", "EVENT", "MEDIA"];
const DEFAULT_SYSTEM_TYPES = ["CLC", "TN", "DT"];

export default function TeamsTypesManager() {
  const [activeTab, setActiveTab] = useState<"teams" | "types">("teams");
  const [teams, setTeams] = useState<Team[]>([]);
  const [types, setTypes] = useState<UserTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete">("add");
  const [selectedItem, setSelectedItem] = useState<Team | UserTypeOption | null>(null);

  // Form states
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [teamsData, typesData] = await Promise.all([
        fetchTeams(),
        fetchTypes()
      ]);
      setTeams(teamsData);
      setTypes(typesData);
    } catch (err: any) {
      setError(err.message || "Không thể tải cấu hình dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedItem(null);
    setFormCode("");
    setFormName("");
    setFormDesc("");
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Team | UserTypeOption) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormCode(item.code);
    setFormName(item.name);
    setFormDesc(item.description || "");
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item: Team | UserTypeOption) => {
    setModalMode("delete");
    setSelectedItem(item);
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "delete") return;

    if (modalMode === "add" && !formCode.trim()) {
      setFormError("Mã định danh không được để trống.");
      return;
    }
    if (!formName.trim()) {
      setFormError("Tên hiển thị không được để trống.");
      return;
    }

    setFormSaving(true);
    setFormError(null);

    try {
      if (activeTab === "teams") {
        if (modalMode === "add") {
          // Check for duplicate locally first
          if (teams.some(t => t.code.toUpperCase() === formCode.trim().toUpperCase())) {
            throw new Error("Mã nhóm đã tồn tại.");
          }
          await createTeam({
            code: formCode.trim().toUpperCase(),
            name: formName.trim(),
            description: formDesc.trim() || undefined
          });
          setFormSuccess("Tạo nhóm mới thành công!");
        } else if (modalMode === "edit" && selectedItem) {
          await updateTeam(selectedItem.id, {
            name: formName.trim(),
            description: formDesc.trim() || undefined
          });
          setFormSuccess("Cập nhật nhóm thành công!");
        }
      } else {
        if (modalMode === "add") {
          if (types.some(t => t.code.toUpperCase() === formCode.trim().toUpperCase())) {
            throw new Error("Mã hệ đào tạo đã tồn tại.");
          }
          await createType({
            code: formCode.trim().toUpperCase(),
            name: formName.trim(),
            description: formDesc.trim() || undefined
          });
          setFormSuccess("Tạo hệ đào tạo mới thành công!");
        } else if (modalMode === "edit" && selectedItem) {
          await updateType(selectedItem.id, {
            name: formName.trim(),
            description: formDesc.trim() || undefined
          });
          setFormSuccess("Cập nhật hệ đào tạo thành công!");
        }
      }

      await loadData();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "Đã xảy ra lỗi khi lưu.");
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setFormSaving(true);
    setFormError(null);

    try {
      if (activeTab === "teams") {
        await deleteTeam(selectedItem.id);
        setFormSuccess("Xóa nhóm thành công!");
      } else {
        await deleteType(selectedItem.id);
        setFormSuccess("Xóa hệ đào tạo thành công!");
      }

      await loadData();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "Xóa thất bại. Giá trị có thể đang được sử dụng.");
    } finally {
      setFormSaving(false);
    }
  };

  // Filtered lists
  const filteredTeams = teams.filter(
    t =>
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTypes = types.filter(
    t =>
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isSystemCode = (code: string) => {
    const codeUpper = code.toUpperCase();
    return activeTab === "teams"
      ? DEFAULT_SYSTEM_TEAMS.includes(codeUpper)
      : DEFAULT_SYSTEM_TYPES.includes(codeUpper);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Control Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Phân loại thành viên</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-emerald-500" />
            Teams & Types
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý các ban hoạt động và hệ đào tạo thành viên trong cơ sở dữ liệu.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="relative z-10 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-600/10 active:scale-95 text-sm shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          {activeTab === "teams" ? "Thêm Ban Mới" : "Thêm Hệ Đào Tạo"}
        </button>

        {/* Background Decorative Gradient */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-44 w-44 rounded-full bg-emerald-50/40 dark:bg-emerald-950/10 blur-3xl pointer-events-none" />
      </div>

      {/* ─── Tabs & Filters ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Tab Switcher */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto shadow-sm">
          <button
            onClick={() => {
              setActiveTab("teams");
              setSearchQuery("");
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 w-1/2 sm:w-auto ${
              activeTab === "teams"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Teams (Ban hoạt động)
          </button>
          <button
            onClick={() => {
              setActiveTab("types");
              setSearchQuery("");
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 w-1/2 sm:w-auto ${
              activeTab === "types"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Types (Hệ đào tạo)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Tìm kiếm ${activeTab === "teams" ? "ban..." : "hệ đào tạo..."}`}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-800/50 flex items-center justify-between shadow-sm">
          <p className="text-sm font-medium"><strong>Lỗi:</strong> {error}</p>
          <button
            onClick={loadData}
            className="p-2 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 dark:hover:bg-red-800 rounded-xl transition-colors shrink-0"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Lists ──────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {activeTab === "teams" ? (
            filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {team.code}
                      </span>
                      {DEFAULT_SYSTEM_TEAMS.includes(team.code) && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/40 rounded-md">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        {team.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed min-h-[32px] line-clamp-2">
                        {team.description || <span className="italic text-slate-400">Không có mô tả.</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 mt-4 pt-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>ID: {team.id}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(team)}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-all"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(team)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                        title="Xóa nhóm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Không tìm thấy ban nào.</p>
                <p className="text-xs text-slate-400">Thử tìm kiếm với từ khóa khác hoặc tạo mới.</p>
              </div>
            )
          ) : (
            filteredTypes.length > 0 ? (
              filteredTypes.map((type) => (
                <div
                  key={type.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {type.code}
                      </span>
                      {DEFAULT_SYSTEM_TYPES.includes(type.code) && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/40 rounded-md">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        {type.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed min-h-[32px] line-clamp-2">
                        {type.description || <span className="italic text-slate-400">Không có mô tả.</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 mt-4 pt-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>ID: {type.id}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(type)}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-all"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(type)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                        title="Xóa hệ đào tạo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <GraduationCap className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Không tìm thấy hệ đào tạo nào.</p>
                <p className="text-xs text-slate-400">Thử tìm kiếm với từ khóa khác hoặc tạo mới.</p>
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>

      {/* ─── Form / Delete Action Modals ───────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !formSaving && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  {modalMode === "add" && <Plus className="w-5 h-5 text-emerald-500" />}
                  {modalMode === "edit" && <Edit2 className="w-5 h-5 text-blue-500" />}
                  {modalMode === "delete" && <Trash2 className="w-5 h-5 text-red-500" />}
                  {modalMode === "add" && `Thêm ${activeTab === "teams" ? "Ban" : "Hệ đào tạo"}`}
                  {modalMode === "edit" && `Sửa ${activeTab === "teams" ? "Ban" : "Hệ đào tạo"}`}
                  {modalMode === "delete" && `Xóa ${activeTab === "teams" ? "Ban" : "Hệ đào tạo"}`}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSaving}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status alerts */}
              <div className="px-6 pt-4">
                {formError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{formError}</p>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formSuccess}</p>
                  </div>
                )}
              </div>

              {/* Body */}
              {modalMode === "delete" ? (
                /* Delete Form */
                <div className="p-6 space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Bạn có chắc chắn muốn xóa {activeTab === "teams" ? "Ban" : "Hệ đào tạo"} {" "}
                    <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                      {selectedItem?.code}
                    </span>{" "}
                    ? Hành động này không thể hoàn tác.
                  </p>

                  {selectedItem && isSystemCode(selectedItem.code) && (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                        <strong>Chú ý:</strong> Đây là phân loại mặc định của hệ thống. Xóa phân loại này có thể ảnh hưởng lớn đến việc đăng ký thành viên hoặc hiển thị thông tin các tài khoản hiện tại có dữ liệu này.
                      </div>
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      disabled={formSaving}
                      className="px-4 py-2 border border-slate-350 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={formSaving}
                      className="px-5 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                    >
                      {formSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang xóa...
                        </>
                      ) : (
                        "Đồng Ý Xóa"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Add/Edit Form */
                <form onSubmit={handleSave} className="p-6 space-y-4">
                  {/* Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Mã định danh (Code)
                    </label>
                    <input
                      type="text"
                      disabled={modalMode === "edit"}
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      placeholder="E.g. RESEARCH"
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 disabled:cursor-not-allowed font-mono transition-all"
                      required
                    />
                    {modalMode === "add" && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Mã định danh viết hoa không dấu, không khoảng cách.
                      </p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={activeTab === "teams" ? "E.g. Ban Nghiên cứu" : "E.g. Chất lượng cao"}
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500/50 transition-all"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Mô tả chi tiết (Tùy chọn)
                    </label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Mô tả tóm tắt về vai trò hoặc đặc trưng..."
                      rows={3}
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500/50 transition-all resize-none"
                    />
                  </div>

                  {modalMode === "edit" && selectedItem && isSystemCode(selectedItem.code) && (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/30 rounded-xl flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                        Bạn đang chỉnh sửa một phân loại mặc định. Vui lòng giữ tên hiển thị dễ hiểu để tránh nhầm lẫn cho thành viên.
                      </div>
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={formSaving}
                      className="px-4 py-2 border border-slate-350 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={formSaving}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-md shadow-emerald-600/10"
                    >
                      {formSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu Lại"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
