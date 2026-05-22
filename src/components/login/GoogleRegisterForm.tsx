"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/icons/Icons";
import { fetchPublicTeams, fetchPublicTypes } from "@/lib/admin/teamsTypesApi";

const DEFAULT_TEAMS = [
  { value: "RESEARCH", label: "Research" },
  { value: "ENGINEER", label: "Engineer" },
  { value: "EVENT", label: "Event" },
  { value: "MEDIA", label: "Media" },
];

const DEFAULT_TYPES = [
  { value: "CLC", label: "CLC" },
  { value: "TN", label: "TN" },
  { value: "DT", label: "ĐT" },
];

interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  idToken: string;
}

export function GoogleRegisterForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [team, setTeam] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [teamsList, setTeamsList] = useState(DEFAULT_TEAMS);
  const [typesList, setTypesList] = useState(DEFAULT_TYPES);

  useEffect(() => {
    const stored = sessionStorage.getItem("googleProfile");
    if (!stored) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(stored) as GoogleProfile;
    setProfile(parsed);
    setName(parsed.name || "");

    // Fetch dynamic teams
    fetchPublicTeams()
      .then(data => {
        if (data && data.length > 0) {
          setTeamsList(data.map(t => ({ value: t.code, label: t.name })));
        }
      })
      .catch(err => console.error("Failed to load public teams dynamically:", err));

    // Fetch dynamic types
    fetchPublicTypes()
      .then(data => {
        if (data && data.length > 0) {
          setTypesList(data.map(t => ({ value: t.code, label: t.name })));
        }
      })
      .catch(err => console.error("Failed to load public types dynamically:", err));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) return setError("Vui lòng nhập MSSV/Mã thành viên.");
    if (!team) return setError("Vui lòng chọn ban.");
    if (!type) return setError("Vui lòng chọn hệ đào tạo.");
    if (!profile) return;

    setLoading(true);
    try {
      const res = await fetch("/apiv1/api/auth/google/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: profile.idToken,
          name: name.trim(),
          code: code.trim(),
          team,
          type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Đăng ký thất bại. Vui lòng thử lại.");
        return;
      }

      // Clear stored profile
      sessionStorage.removeItem("googleProfile");
      router.push("/pending");
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const inputClasses = "w-full rounded-xl px-4 py-3.5 bg-slate-50 dark:bg-[#0D192E] border border-slate-300 dark:border-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all duration-200";

  return (
    <div className="w-full max-w-md rounded-2xl p-8 mx-auto
                    bg-white/90 dark:bg-[#0F1E35]/80
                    backdrop-blur-xl
                    border border-slate-200 dark:border-blue-500/15
                    shadow-lg dark:shadow-[0_8px_40px_rgba(37,99,235,0.08)]
                    transition-all duration-300">
      {/* Google profile header */}
      <div className="text-center mb-6">
        {profile.picture && (
          <img
            src={profile.picture}
            alt={profile.name}
            className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-blue-100 dark:border-blue-500/30"
            referrerPolicy="no-referrer"
          />
        )}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hoàn tất đăng ký</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Bổ sung thông tin để tham gia Big Data Club
        </p>
      </div>

      {error && (
        <div className="mb-6 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/30 px-4 py-3 rounded-xl flex items-start gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email - readonly */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full rounded-xl px-4 py-3.5 bg-slate-100 dark:bg-[#0A1628] border border-slate-200 dark:border-blue-500/10 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          />
        </div>

        {/* Name - editable */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Họ và tên</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className={inputClasses}
            required
          />
        </div>

        {/* Student code */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            MSSV / Mã thành viên
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="2212345"
            className={inputClasses}
            required
          />
        </div>

        {/* Team */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ban</label>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className={inputClasses}
            required
          >
            <option value="" disabled>Chọn ban</option>
            {teamsList.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Hệ đào tạo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClasses}
            required
          >
            <option value="" disabled>Chọn hệ</option>
            {typesList.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3.5 shadow-sm dark:shadow-blue-900/30 transition-all duration-200 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <Spinner /> : "Đăng ký"}
        </button>

        <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-3">
          Tài khoản sẽ cần được admin duyệt trước khi sử dụng.
        </p>
      </form>
    </div>
  );
}
