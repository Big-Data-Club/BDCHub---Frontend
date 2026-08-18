"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  userProfileHubService,
  PublicUserProfile,
  ProfileSection,
  ProfileItem,
} from "@/services/admin/userProfileHubService";
import {
  MessageSquare,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  ExternalLink,
  Calendar,
  UserCheck,
  Globe,
  Mail,
  Building,
  Sparkles,
} from "lucide-react";

export default function BdcHubUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const identifier = (params?.identifier as string) || "";

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!identifier) return;

    setLoading(true);
    setError(null);
    userProfileHubService
      .getPublicProfile(identifier)
      .then((res) => {
        setProfile(res);
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        setError("Không tìm thấy người dùng hoặc có lỗi hệ thống.");
      })
      .finally(() => setLoading(false));
  }, [identifier]);

  const handleStartChat = () => {
    if (profile?.userId) {
      router.push(`/chat?user_id=${profile.userId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm animate-pulse">Đang tải trang cá nhân BDC Hub...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center backdrop-blur-md shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Không tìm thấy thông tin</h2>
          <p className="text-slate-400 text-sm mb-6">{error || "Hồ sơ không tồn tại hoặc đã bị xóa."}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  // PROTECTED / UNPUBLISHED STATE
  if (!profile.published) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl"></div>
          
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-amber-400" />
          </div>

          <h2 className="text-2xl font-bold text-slate-100 mb-2">Trang cá nhân được bảo vệ</h2>
          <p className="text-amber-400/90 text-sm font-medium mb-4">{profile.message || "Người dùng đã bảo vệ thông tin cá nhân."}</p>
          
          <div className="p-4 bg-slate-850/60 rounded-xl border border-slate-800/80 mb-6 text-left space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg border border-indigo-500/30">
                {profile.fullName?.charAt(0) || "U"}
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">{profile.fullName || "BDC Member"}</h3>
                <p className="text-xs text-slate-400">@{profile.alias || profile.userId}</p>
              </div>
            </div>
          </div>

          {profile.allowDirectChat && (
            <button
              onClick={handleStartChat}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Gửi tin nhắn trực tiếp</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // PUBLIC PUBLISHED PROFILE
  const stats = profile.stats || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Decorator */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Banner Preview Note */}
        {profile.message && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-md">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {profile.message}
            </span>
            <button
              onClick={() => router.push("/myaccount")}
              className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-3 py-1 rounded-lg font-medium transition"
            >
              Chỉnh sửa trong MyAccount
            </button>
          </div>
        )}

        {/* HERO USER PROFILE HEADER */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 p-1 shadow-xl">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-extrabold text-indigo-400">
                      {profile.fullName?.charAt(0) || "B"}
                    </span>
                  )}
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-slate-900 rounded-full" title="Active Member"></span>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  {profile.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  @{profile.alias || profile.userId}
                </span>
                {profile.userType && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {profile.userType}
                  </span>
                )}
              </div>

              <p className="text-indigo-400 font-medium text-base sm:text-lg">
                {profile.title || "Thành viên BDC Core"}
              </p>

              {profile.bio && (
                <p className="text-slate-300 text-sm max-w-2xl leading-relaxed pt-1">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-2">
                {profile.organization && (
                  <div className="flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-slate-500" />
                    <span>{profile.organization}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>{profile.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {profile.allowDirectChat && (
              <div className="sm:self-start">
                <button
                  onClick={handleStartChat}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Gửi tin nhắn</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SYSTEM STATS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex items-center space-x-3 shadow-lg">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Môn đã đăng ký</p>
              <p className="text-xl font-bold text-slate-100">{stats.courses_enrolled ?? 0}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex items-center space-x-3 shadow-lg">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Môn hoàn thành</p>
              <p className="text-xl font-bold text-slate-100">{stats.courses_completed ?? 0}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex items-center space-x-3 shadow-lg">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Khóa học đã tạo</p>
              <p className="text-xl font-bold text-slate-100">{stats.courses_created ?? 0}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex items-center space-x-3 shadow-lg">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Thời gian học tập</p>
              <p className="text-xl font-bold text-slate-100">{stats.total_learning_hours ?? 0}h</p>
            </div>
          </div>
        </div>

        {/* CUSTOM SECTIONS RENDERER */}
        <div className="space-y-6">
          {profile.sections &&
            profile.sections
              .filter((sec) => sec.visible !== false)
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((section) => (
                <RenderProfileSection key={section.id} section={section} />
              ))}
        </div>
      </div>
    </div>
  );
}

function RenderProfileSection({ section }: { section: ProfileSection }) {
  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
        <div className="w-2.5 h-6 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full"></div>
        <h2 className="text-lg font-bold text-slate-100 tracking-wide">{section.title}</h2>
      </div>

      <div className="space-y-4 pt-1">
        {section.items && section.items.length > 0 ? (
          section.items.map((item) => <RenderProfileItem key={item.id} item={item} />)
        ) : (
          <p className="text-xs text-slate-500 italic">Chưa có thông tin cập nhật.</p>
        )}
      </div>
    </div>
  );
}

function RenderProfileItem({ item }: { item: ProfileItem }) {
  switch (item.type) {
    case "TEXT":
      return (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{item.label}</p>
          <p className="text-sm text-slate-200 font-medium">{String(item.value || "")}</p>
        </div>
      );

    case "MARKDOWN":
      return (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{item.label}</p>
          <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 whitespace-pre-wrap">
            {String(item.value || "")}
          </div>
        </div>
      );

    case "LINK": {
      const linkVal = typeof item.value === "object" ? item.value : { url: item.value, title: item.label };
      return (
        <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 hover:border-indigo-500/40 transition">
          <span className="text-sm font-medium text-slate-300">{item.label}</span>
          <a
            href={linkVal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition"
          >
            <span>{linkVal.title || "Truy cập liên kết"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      );
    }

    case "DATE":
    case "DATE_RANGE": {
      const dateVal = typeof item.value === "object" ? item.value : { start: item.value, end: "" };
      return (
        <div className="flex items-center space-x-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <div>
            <p className="text-xs font-medium text-slate-400">{item.label}</p>
            <p className="text-sm font-semibold text-slate-200">
              {dateVal.start} {dateVal.end ? `— ${dateVal.end}` : dateVal.is_present ? "— Hiện tại" : ""}
            </p>
          </div>
        </div>
      );
    }

    case "KEY_VALUE":
      return (
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
          <span className="text-sm font-medium text-slate-400">{item.label}</span>
          <span className="text-sm font-bold text-right text-indigo-400">{String(item.value || "")}</span>
        </div>
      );

    case "TAG_LIST": {
      const tags: string[] = Array.isArray(item.value) ? item.value : String(item.value || "").split(",");
      return (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{item.label}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-medium transition"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400">{item.label}</p>
          <p className="text-sm text-slate-300">{JSON.stringify(item.value)}</p>
        </div>
      );
  }
}
