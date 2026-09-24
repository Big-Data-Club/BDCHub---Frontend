"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  ShieldCheck,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Pause,
  Play,
  Lock,
  User,
  Sparkles,
} from "lucide-react";
import { UserResponse } from "@/services/auth/userService";
import { dutylogService } from "@/services/dutylog";

interface QrCheckinTabProps {
  fullUserData: UserResponse | null;
}

const QR_ROTATION_INTERVAL_MS = 9000;
const INITIAL_COUNTDOWN_SECONDS = 10;

export default function QrCheckinTab({ fullUserData }: QrCheckinTabProps) {
  // Use MSSV (code) as primary student ID
  const initialStudentId = fullUserData?.code || "";
  const initialStudentName = fullUserData?.name || "";

  const [studentId, setStudentId] = useState(initialStudentId);
  const [studentName, setStudentName] = useState(initialStudentName);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Sync state if fullUserData loads asynchronously
  useEffect(() => {
    if (fullUserData?.code && !studentId) {
      setStudentId(fullUserData.code);
    }
    if (fullUserData?.name && !studentName) {
      setStudentName(fullUserData.name);
    }
  }, [fullUserData, studentId, studentName]);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    countdownTimerRef.current = null;
    refreshTimerRef.current = null;
  }, []);

  const fetchNewToken = useCallback(
    async (showLoading = false) => {
      const activeId = studentId.trim();
      const activeName = studentName.trim() || fullUserData?.name || "Student";

      if (!activeId) {
        setError("Chưa có Mã số sinh viên (MSSV). Vui lòng cập nhật MSSV để tạo mã QR điểm danh.");
        return;
      }

      if (showLoading) setLoading(true);
      setError(null);

      try {
        const res = await dutylogService.generateQRToken(activeId, activeName);
        setQrToken(res.payload);
        setCountdown(INITIAL_COUNTDOWN_SECONDS);
        setLastRefreshedAt(new Date());
      } catch (err: any) {
        console.error("Failed to generate QR token:", err);
        setError(err.message || "Không thể tải mã QR điểm danh từ server.");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [studentId, studentName, fullUserData?.name]
  );

  // Starts the countdown & periodic refresh loop
  const startRotation = useCallback(() => {
    clearAllTimers();
    fetchNewToken(true);

    // Countdown tick every 1000ms
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? INITIAL_COUNTDOWN_SECONDS : prev - 1));
    }, 1000);

    // Refresh token slightly before the 10s server TTL expires (every 9s)
    refreshTimerRef.current = setInterval(() => {
      fetchNewToken(false);
    }, QR_ROTATION_INTERVAL_MS);
  }, [clearAllTimers, fetchNewToken]);

  // Trigger token generation when student ID is ready and not paused
  useEffect(() => {
    if (studentId.trim() && !isPaused) {
      startRotation();
    } else {
      clearAllTimers();
    }

    return () => clearAllTimers();
  }, [studentId, isPaused, startRotation, clearAllTimers]);

  const handleManualRefresh = () => {
    startRotation();
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const hasMssv = Boolean(fullUserData?.code && fullUserData.code.trim().length > 0);

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 transition-colors"
      id="myaccount-qr-checkin-tab"
    >
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <QrCode className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                Mã QR Điểm Danh Cá Nhân
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  DutyLog Encrypted
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Dùng để quét điểm danh tại các phòng trực BDC (Campus 1 & Campus 2)
              </p>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isPaused
                ? "bg-amber-400"
                : qrToken
                ? "bg-emerald-500 animate-pulse"
                : "bg-slate-400"
            }`}
          />
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            {isPaused ? "Đang tạm dừng" : qrToken ? "Sẵn sàng quét" : "Chờ kích hoạt"}
          </span>
        </div>
      </div>

      {/* Warning if MSSV is missing in database profile */}
      {!hasMssv && (
        <div className="my-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Tài khoản chưa cập nhật MSSV (Mã số sinh viên)</p>
              <p className="text-xs text-amber-700 dark:text-amber-400/90 mt-0.5">
                DutyLog đối soát quyền ra vào và ca trực bằng MSSV (giống quét barcode trên thẻ sinh viên).
                Vui lòng nhập MSSV bên dưới hoặc liên hệ Quản trị viên để cập nhật.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Nhập MSSV (VD: 2112345)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.trim())}
              className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-mono w-full sm:w-44 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              onClick={() => startRotation()}
              disabled={!studentId.trim()}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium text-xs hover:bg-amber-700 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: Left = Student Card & Controls, Right = QR Visual Frame */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-start">
        {/* Left info column (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          {/* Identity Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                Thông tin nhận diện
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                {fullUserData?.team || "BDC Member"}
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Họ và tên</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {studentName || fullUserData?.name || "Thành viên BDC"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mã số sinh viên (MSSV)</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono text-sm font-bold tracking-wider">
                    {studentId || "Chưa thiết lập"}
                  </span>
                  {hasMssv && (
                    <span className="inline-flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã xác thực
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Email hệ thống</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
                  {fullUserData?.email || "Chưa có email"}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleManualRefresh}
              disabled={loading || !studentId.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Làm mới mã ngay
            </button>

            <button
              onClick={handleTogglePause}
              disabled={!studentId.trim()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm transition-all disabled:opacity-50 active:scale-95"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 text-emerald-600" />
                  Tiếp tục phát mã
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 text-amber-600" />
                  Tạm dừng
                </>
              )}
            </button>
          </div>

          {/* Anti-fraud technical info summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Lock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Cơ chế bảo mật chống giả mạo
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed">
              <li>
                <span className="font-medium text-slate-700 dark:text-slate-300">Chữ ký HMAC SHA-256</span>: Ký số trực tiếp từ server, chống can thiệp dữ liệu MSSV.
              </li>
              <li>
                <span className="font-medium text-slate-700 dark:text-slate-300">Token 1 lần (Single-use)</span>: Tự hủy ngay trên Redis sau khi DutyLog quét thành công.
              </li>
              <li>
                <span className="font-medium text-slate-700 dark:text-slate-300">Thời hạn 10 giây</span>: Chụp ảnh màn hình gửi người khác điểm danh hộ sẽ vô hiệu.
              </li>
            </ul>
          </div>
        </div>

        {/* Right QR Display column (7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-sm flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-xl border border-slate-800 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Badge top */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                DYNAMIC ATTENDANCE QR
              </span>
            </div>

            {/* QR Viewport Box with Futuristic Viewfinder Reticles */}
            <div className="relative p-4 bg-white rounded-2xl shadow-2xl flex items-center justify-center min-w-[240px] min-h-[240px]">
              {loading && !qrToken ? (
                <div className="flex flex-col items-center justify-center p-8 gap-3">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-xs text-slate-600 font-medium">Đang ký số HMAC & tạo mã QR...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-4 text-center max-w-[220px]">
                  <AlertTriangle className="w-8 h-8 text-rose-500 mb-2" />
                  <p className="text-xs font-semibold text-rose-700">{error}</p>
                  <button
                    onClick={handleManualRefresh}
                    className="mt-3 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Thử lại
                  </button>
                </div>
              ) : qrToken ? (
                <div className="relative">
                  <QRCodeSVG
                    value={qrToken}
                    size={220}
                    level="H"
                    includeMargin={false}
                    fgColor="#0F172A"
                    bgColor="#FFFFFF"
                  />
                  {/* Viewfinder corner brackets for high-tech aesthetic */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500 pointer-events-none" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500 pointer-events-none" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500 pointer-events-none" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500 pointer-events-none" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-slate-500 text-center">
                  <QrCode className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="text-xs">Chưa có mã QR. Vui lòng kiểm tra MSSV và bấm Làm mới.</p>
                </div>
              )}
            </div>

            {/* Countdown timer & progress meter */}
            {qrToken && !error && (
              <div className="w-full mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Tự động đổi mã sau:
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                      countdown <= 3
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    }`}
                  >
                    {countdown}s
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                      countdown <= 3 ? "bg-rose-500" : "bg-gradient-to-r from-blue-500 to-cyan-400"
                    }`}
                    style={{ width: `${(countdown / INITIAL_COUNTDOWN_SECONDS) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span className="truncate">
                    Sinh viên: <strong className="text-slate-200">{studentName}</strong>
                  </span>
                  <span className="font-mono text-cyan-300">MSSV: {studentId}</span>
                </div>
                {lastRefreshedAt && (
                  <div className="text-[10px] text-slate-500 text-center pt-0.5 font-mono">
                    Lần tạo mới gần nhất: {lastRefreshedAt.toLocaleTimeString("vi-VN")}
                  </div>
                )}
              </div>
            )}

            {/* Instruction footnote */}
            <p className="text-[11px] text-slate-400 text-center mt-4 leading-relaxed">
              Đưa màn hình có mã QR này vào trước camera máy quét của trạm trực DutyLog tại phòng để điểm danh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
