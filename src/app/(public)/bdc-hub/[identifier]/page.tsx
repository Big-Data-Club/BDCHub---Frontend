"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { userProfileHubService, PublicUserProfile, ProfileSection, ProfileItem } from "@/services/admin/userProfileHubService";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { resolveMediaUrl } from "@/lib/media-url";
import {
  ArrowLeft, CalendarDays, CheckCircle2, ChevronRight, ExternalLink, Globe2,
  Link2, LockKeyhole, MessageSquare, ShieldAlert, Sparkles, UserRoundCheck,
} from "lucide-react";

function initials(name?: string) {
  return (name || "BDC Member").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch { return null; }
}

function PortfolioShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#050b18] dark:text-slate-100">
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute left-[-14rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-blue-400/20 blur-3xl dark:bg-cyan-500/10" />
      <div className="absolute right-[-13rem] top-[18rem] h-[30rem] w-[30rem] rounded-full bg-violet-400/15 blur-3xl dark:bg-blue-600/10" />
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055] [background-image:linear-gradient(rgba(30,64,175,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,.55)_1px,transparent_1px)] [background-size:40px_40px]" />
    </div>
    {children}
  </div>;
}

function PublicHeader() {
  return <header className="relative z-10 border-b border-slate-200/80 bg-white/60 backdrop-blur-xl dark:border-blue-500/10 dark:bg-[#050b18]/65">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link href="/" className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-sm dark:from-cyan-400 dark:to-blue-600"><Globe2 className="h-4 w-4" /></span>
        <span><span className="block text-sm font-black tracking-tight text-slate-950 dark:text-white">BDC Hub</span><span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Public portfolio</span></span>
        <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
      </Link>
      <ThemeToggle size={16} className="border border-slate-200 bg-white/80 dark:border-blue-500/15 dark:bg-[#0f1e35]/80" />
    </div>
  </header>;
}

export default function BdcHubUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const identifier = (params?.identifier as string) || "";
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    if (!identifier) return;
    setLoading(true); setError(null);
    userProfileHubService.getPublicProfile(identifier).then(setProfile).catch(() => setError("Không tìm thấy người dùng hoặc có lỗi hệ thống.")).finally(() => setLoading(false));
  }, [identifier]);

  useEffect(() => setAvatarFailed(false), [profile?.avatarUrl]);

  const handleStartChat = () => { if (profile?.userId) router.push(`/chat?user_id=${profile.userId}`); };

  if (loading) return <PortfolioShell><div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 px-4"><div className="h-11 w-11 animate-spin rounded-full border-[3px] border-blue-500/20 border-t-cyan-500" /><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đang mở BDC Hub Portfolio…</p></div></PortfolioShell>;

  if (error || !profile) return <PortfolioShell><div className="relative z-10 mx-auto flex min-h-screen max-w-md items-center px-4 py-10"><div className="w-full rounded-3xl border border-slate-200 bg-white/85 p-8 text-center shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-blue-500/15 dark:bg-[#0f1e35]/90 dark:shadow-none"><ShieldAlert className="mx-auto mb-5 h-12 w-12 text-rose-500" /><h1 className="text-2xl font-extrabold tracking-tight">Không tìm thấy portfolio</h1><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{error || "Hồ sơ không tồn tại hoặc không thể xem công khai."}</p><button onClick={() => router.push("/")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"><ArrowLeft className="h-4 w-4" />Về BDC Hub</button></div></div></PortfolioShell>;

  if (!profile.published) return <PortfolioShell><PublicHeader /><div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center px-4 py-10"><div className="w-full rounded-3xl border border-slate-200 bg-white/85 p-8 text-center shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-blue-500/15 dark:bg-[#0f1e35]/90 dark:shadow-none"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-300"><LockKeyhole className="h-8 w-8" /></div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">Private portfolio</p><h1 className="mt-2 text-2xl font-extrabold tracking-tight">Trang cá nhân được bảo vệ</h1><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{profile.message || "Người dùng chưa chia sẻ portfolio này công khai."}</p>{profile.allowDirectChat && <button onClick={handleStartChat} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"><MessageSquare className="h-4 w-4" />Gửi tin nhắn</button>}</div></div></PortfolioShell>;

  const sections = (profile.sections || []).filter((section) => section.visible !== false).sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
  const avatarSrc = resolveMediaUrl(profile.avatarUrl);
  return <PortfolioShell><PublicHeader /><main className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-7 sm:px-6 lg:px-8">
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 shadow-xl shadow-slate-950/[0.06] backdrop-blur-xl dark:border-blue-500/15 dark:bg-[#0f1e35]/80 dark:shadow-none"><div className="h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 dark:from-cyan-400 dark:via-blue-500 dark:to-violet-500" /><div className="p-6 sm:p-8"><div className="flex flex-col gap-6 md:flex-row md:items-start">
      <div className="relative shrink-0 self-center md:self-start"><div className="rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-500 p-1 dark:from-cyan-400 dark:via-blue-500"><div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.3rem] bg-white text-2xl font-black text-blue-700 dark:bg-[#0b1730] dark:text-cyan-300 sm:h-32 sm:w-32">{avatarSrc && !avatarFailed ? <img src={avatarSrc} alt={profile.fullName || "BDC member"} className="h-full w-full object-cover" onError={() => setAvatarFailed(true)} /* eslint-disable-line @next/next/no-img-element -- avatar hosts are user-configured */ /> : initials(profile.fullName)}</div></div><span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white dark:border-[#0f1e35]" title="BDC member"><CheckCircle2 className="h-3.5 w-3.5" /></span></div>
      <div className="min-w-0 flex-1 text-center md:text-left"><div className="flex flex-wrap items-center justify-center gap-2 md:justify-start"><h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">{profile.fullName || "BDC Member"}</h1><span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-500/15 dark:text-cyan-300 dark:ring-cyan-400/20"><UserRoundCheck className="h-3.5 w-3.5" />@{profile.alias || profile.userId}</span></div><p className="mt-3 text-base font-bold text-blue-700 dark:text-cyan-300 sm:text-lg">{profile.title || "Thành viên Big Data Club"}</p>{profile.bio && <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:mx-0">{profile.bio}</p>}</div>
      {profile.allowDirectChat && <button onClick={handleStartChat} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-500 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"><MessageSquare className="h-4 w-4" />Gửi tin nhắn</button>}
    </div></div></section>
    {profile.message && <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" />{profile.message}</div>}
    {sections.length > 0 && <section className="mt-8 space-y-5" aria-label="Portfolio sections"><div className="flex items-center gap-3"><div className="h-px flex-1 bg-slate-200 dark:bg-blue-500/15" /><span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Portfolio</span><div className="h-px flex-1 bg-slate-200 dark:bg-blue-500/15" /></div>{sections.map((section) => <RenderProfileSection key={section.id} section={section} />)}</section>}
  </main></PortfolioShell>;
}

function RenderProfileSection({ section }: { section: ProfileSection }) {
  return <article className="rounded-3xl border border-slate-200 bg-white/75 p-5 shadow-sm backdrop-blur-xl dark:border-blue-500/15 dark:bg-[#0f1e35]/75 dark:shadow-none sm:p-6"><div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-blue-500/10"><span className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500" /><h2 className="text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">{section.title}</h2></div>{section.items?.length ? <div className="space-y-4">{section.items.map((item) => <RenderProfileItem key={item.id} item={item} />)}</div> : <p className="text-sm italic text-slate-500 dark:text-slate-400">Chưa có thông tin cập nhật.</p>}</article>;
}

function RenderProfileItem({ item }: { item: ProfileItem }) {
  const label = <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-blue-700 dark:text-cyan-300">{item.label}</p>;
  if (item.type === "TEXT") return <div className="space-y-1.5">{label}<p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-200">{String(item.value || "")}</p></div>;
  if (item.type === "MARKDOWN") return <div className="space-y-2">{label}<div className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-7 text-slate-700 dark:border-blue-500/10 dark:bg-[#09152b]/75 dark:text-slate-300">{String(item.value || "")}</div></div>;
  if (item.type === "LINK") {
    const link = typeof item.value === "object" && item.value ? item.value as { url?: unknown; title?: unknown } : { url: item.value, title: item.label };
    const href = safeExternalUrl(link.url);
    return <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/75 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-blue-500/10 dark:bg-[#09152b]/60"><div className="min-w-0"><div className="flex items-center gap-2">{label}<Link2 className="h-3.5 w-3.5 text-slate-400" /></div><p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">{typeof link.title === "string" ? link.title : "Liên kết bên ngoài"}</p></div>{href ? <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-500 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400">Mở liên kết<ExternalLink className="h-3.5 w-3.5" /></a> : <span className="text-xs font-semibold text-slate-400">Liên kết không hợp lệ</span>}</div>;
  }
  if (item.type === "DATE" || item.type === "DATE_RANGE") {
    const value: { start?: unknown; end?: unknown; is_present?: boolean } = typeof item.value === "object" && item.value ? item.value as { start?: unknown; end?: unknown; is_present?: boolean } : { start: item.value };
    return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/75 p-4 dark:border-blue-500/10 dark:bg-[#09152b]/60"><CalendarDays className="h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-300" /><div>{label}<p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{String(value.start || "")} {value.end ? `– ${String(value.end)}` : value.is_present ? "– Hiện tại" : ""}</p></div></div>;
  }
  if (item.type === "KEY_VALUE") return <div className="grid grid-cols-1 gap-1 rounded-2xl border border-slate-200 bg-slate-50/75 p-4 sm:grid-cols-2 sm:items-center dark:border-blue-500/10 dark:bg-[#09152b]/60">{label}<p className="text-sm font-bold text-slate-800 sm:text-right dark:text-cyan-200">{String(item.value || "")}</p></div>;
  if (item.type === "TAG_LIST") { const tags = Array.isArray(item.value) ? item.value : String(item.value || "").split(","); return <div className="space-y-2">{label}<div className="flex flex-wrap gap-2">{tags.filter(Boolean).map((tag, index) => <span key={`${String(tag)}-${index}`} className="rounded-full border border-blue-500/15 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:border-cyan-400/15 dark:bg-cyan-400/10 dark:text-cyan-200">{String(tag).trim()}</span>)}</div></div>; }
  return <div className="space-y-1.5">{label}<p className="text-sm text-slate-600 dark:text-slate-300">{typeof item.value === "string" ? item.value : JSON.stringify(item.value)}</p></div>;
}
