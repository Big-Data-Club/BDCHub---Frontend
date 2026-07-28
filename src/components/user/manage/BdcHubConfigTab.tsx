"use client";

import React, { useState, useEffect } from "react";
import {
  userProfileHubService,
  PublicUserProfile,
  ProfileSection,
  ProfileItem,
} from "@/services/userProfileHubService";
import {
  Globe,
  Lock,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Eye,
  Save,
  Loader2,
  Sparkles,
  Layers,
} from "lucide-react";

export default function BdcHubConfigTab() {
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [aliasInput, setAliasInput] = useState("");
  const [aliasStatus, setAliasStatus] = useState<{ available?: boolean; message?: string } | null>(null);
  const [checkingAlias, setCheckingAlias] = useState(false);

  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [published, setPublished] = useState(false);
  const [allowDirectChat, setAllowDirectChat] = useState(true);

  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadProfileConfig();
  }, []);

  const loadProfileConfig = async () => {
    try {
      setLoading(true);
      const res = await userProfileHubService.getMyProfileConfig();
      setProfile(res);
      setAliasInput(res.alias || "");
      setTitle(res.title || "");
      setBio(res.bio || "");
      setPublished(Boolean(res.published));
      setAllowDirectChat(res.allowDirectChat !== false);
      setSections(res.sections || []);
    } catch (err: any) {
      console.error("Failed to load profile config:", err);
      setMessage({ type: "error", text: "Không thể tải thông tin cấu hình BDC Hub" });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAlias = async () => {
    if (!aliasInput.trim()) return;
    try {
      setCheckingAlias(true);
      const res = await userProfileHubService.checkAlias(aliasInput.trim());
      setAliasStatus({ available: res.available, message: res.reason });
    } catch (err: any) {
      setAliasStatus({ available: false, message: "Lỗi kiểm tra alias" });
    } finally {
      setCheckingAlias(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const res = await userProfileHubService.updateMyProfileConfig({
        alias: aliasInput.trim(),
        published,
        title,
        bio,
        sectionsJson: JSON.stringify(sections),
        allowDirectChat,
      });

      setProfile(res);
      setMessage({ type: "success", text: "Đã cập nhật cấu hình BDC Hub thành công!" });
    } catch (err: any) {
      console.error("Save profile failed:", err);
      setMessage({ type: "error", text: err.message || "Lỗi cập nhật cấu hình BDC Hub" });
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    const newSec: ProfileSection = {
      id: "sec_" + Date.now(),
      type: "CUSTOM",
      title: "Mục mới (" + (sections.length + 1) + ")",
      visible: true,
      order: sections.length,
      items: [],
    };
    setSections([...sections, newSec]);
  };

  const removeSection = (secId: string) => {
    setSections(sections.filter((s) => s.id !== secId));
  };

  const updateSectionTitle = (secId: string, newTitle: string) => {
    setSections(sections.map((s) => (s.id === secId ? { ...s, title: newTitle } : s)));
  };

  const toggleSectionVisible = (secId: string) => {
    setSections(sections.map((s) => (s.id === secId ? { ...s, visible: !s.visible } : s)));
  };

  const addItemToSection = (secId: string) => {
    const newItem: ProfileItem = {
      id: "field_" + Date.now(),
      label: "Tên thuộc tính",
      type: "TEXT",
      value: "Nội dung giá trị",
    };
    setSections(
      sections.map((s) => (s.id === secId ? { ...s, items: [...(s.items || []), newItem] } : s))
    );
  };

  const removeItemFromSection = (secId: string, itemId: string) => {
    setSections(
      sections.map((s) =>
        s.id === secId ? { ...s, items: (s.items || []).filter((i) => i.id !== itemId) } : s
      )
    );
  };

  const updateItem = (secId: string, itemId: string, field: keyof ProfileItem, val: any) => {
    setSections(
      sections.map((s) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          items: (s.items || []).map((item) => (item.id === itemId ? { ...item, [field]: val } : item)),
        };
      })
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">Đang tải cấu hình BDC Hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-100">
      {message && (
        <div
          className={`p-4 rounded-xl text-sm border font-medium flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* PUBLISH TOGGLE & PREVIEW BANNER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl border ${published ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"}`}>
            {published ? <Globe className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">
              Trạng thái Trang cá nhân: {published ? <span className="text-emerald-400">Công khai (Public)</span> : <span className="text-amber-400">Bảo vệ (Private)</span>}
            </h3>
            <p className="text-xs text-slate-400">
              {published
                ? "Bất kỳ ai có đường dẫn bdc.hpcc.vn/bdc-hub/" + (aliasInput || profile?.userId) + " đều có thể xem hồ sơ của bạn."
                : "Người khác truy cập đường dẫn sẽ thấy thông báo bảo vệ thông tin."}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setPublished(!published)}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-md ${
              published
                ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
            }`}
          >
            {published ? "Tắt công khai" : "Bật công khai Hồ sơ"}
          </button>

          <a
            href={`/bdc-hub/${aliasInput || profile?.userId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-xl border border-slate-700 inline-flex items-center gap-1.5 transition"
          >
            <Eye className="w-4 h-4" />
            <span>Xem trước</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* CORE PROFILE CONFIG */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg">
        <h3 className="font-bold text-base text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>Thông tin cơ bản & Định danh Alias</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Custom Alias */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Tùy chỉnh Đường dẫn Alias (/bdc-hub/...)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={aliasInput}
                onChange={(e) => {
                  setAliasInput(e.target.value.toLowerCase());
                  setAliasStatus(null);
                }}
                placeholder="phuc-nhan"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleCheckAlias}
                disabled={checkingAlias}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl border border-slate-700 transition"
              >
                {checkingAlias ? "..." : "Kiểm tra"}
              </button>
            </div>
            {aliasStatus && (
              <p className={`text-xs flex items-center gap-1 ${aliasStatus.available ? "text-emerald-400" : "text-rose-400"}`}>
                {aliasStatus.available ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {aliasStatus.message}
              </p>
            )}
          </div>

          {/* Professional Title */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Chức danh / Tiêu đề chính
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: AI & Data Engineering Student"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Tiểu sử / Giới thiệu bản thân (Bio)
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Viết một đoạn giới thiệu ngắn về kỹ năng, mục tiêu và định hướng của bạn..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-y"
          ></textarea>
        </div>

        {/* Allow Direct Chat Checkbox */}
        <div className="flex items-center space-x-3 pt-2">
          <input
            type="checkbox"
            id="allowDirectChat"
            checked={allowDirectChat}
            onChange={(e) => setAllowDirectChat(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="allowDirectChat" className="text-sm font-medium text-slate-300 cursor-pointer">
            Cho phép nút &quot;Gửi tin nhắn trực tiếp&quot; trên trang BDC Hub cá nhân
          </label>
        </div>
      </div>

      {/* DYNAMIC SECTIONS & FIELD BUILDER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Tùy chỉnh Các Mục (Sections) & Thuộc tính (Fields)</span>
          </h3>

          <button
            type="button"
            onClick={addSection}
            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs rounded-xl border border-indigo-500/30 inline-flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mục mới</span>
          </button>
        </div>

        <div className="space-y-6">
          {sections.map((section, secIdx) => (
            <div
              key={section.id}
              className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4 relative"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-xs font-bold text-slate-500">#{secIdx + 1}</span>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                    className="font-semibold text-sm bg-transparent border border-transparent hover:border-slate-800 focus:border-indigo-500 rounded-lg px-2 py-1 text-slate-100 focus:outline-none"
                  />
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {section.type}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleSectionVisible(section.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-medium ${
                      section.visible !== false
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}
                  >
                    {section.visible !== false ? "Hiển thị" : "Đã ẩn"}
                  </button>

                  <button
                    type="button"
                    onClick={() => addItemToSection(section.id)}
                    className="px-2.5 py-1 text-xs bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/20 font-medium inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Field</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                    title="Xóa section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 pl-2">
                {section.items && section.items.length > 0 ? (
                  section.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800/60"
                    >
                      {/* Label */}
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => updateItem(section.id, item.id, "label", e.target.value)}
                          placeholder="Tên nhãn (Label)"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Field Type */}
                      <div className="sm:col-span-3">
                        <select
                          value={item.type}
                          onChange={(e) => updateItem(section.id, item.id, "type", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="TEXT">Văn bản (TEXT)</option>
                          <option value="MARKDOWN">Đoạn văn (MARKDOWN)</option>
                          <option value="LINK">Đường dẫn (LINK)</option>
                          <option value="DATE">Ngày tháng (DATE)</option>
                          <option value="DATE_RANGE">Khoảng thời gian (DATE RANGE)</option>
                          <option value="KEY_VALUE">Key-Value (KEY VALUE)</option>
                          <option value="TAG_LIST">Thẻ danh sách (TAG LIST)</option>
                        </select>
                      </div>

                      {/* Value Input */}
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          value={
                            typeof item.value === "object" ? JSON.stringify(item.value) : String(item.value || "")
                          }
                          onChange={(e) => updateItem(section.id, item.id, "value", e.target.value)}
                          placeholder="Giá trị nhập..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Delete item button */}
                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => removeItemFromSection(section.id, item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic py-1">Chưa có field nào trong mục này.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{saving ? "Đang lưu..." : "Lưu cấu hình BDC Hub"}</span>
        </button>
      </div>
    </div>
  );
}
