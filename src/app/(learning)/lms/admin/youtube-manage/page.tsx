"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Youtube, CheckCircle, XCircle, RefreshCw, Trash2, AlertCircle } from "lucide-react";

interface YouTubeStatus {
  connected: boolean;
  channel_name?: string;
  channel_id?: string;
  connected_at?: string;
  expires_at?: string;
}

export default function YouTubeManagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<YouTubeStatus | null>(null);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Check admin role
    const selectedRole = sessionStorage.getItem("lms_selected_role");
    if (selectedRole !== "ADMIN") {
      router.push("/lms");
      return;
    }

    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('youtube_auth');
    const code = params.get('code');
    const message = params.get('message');

    if (authStatus === 'success' && code) {
      handleAuthCallback(code);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (authStatus === 'error') {
      setError(message || 'YouTube authorization failed');
      setLoading(false);
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      loadYouTubeStatus();
    }
  }, [router]);

  const loadYouTubeStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/youtube/status');
      const data = await response.json();
      
      setStatus(data);
      setError("");
    } catch (err: any) {
      console.error("Error loading YouTube status:", err);
      setError(err.message || "Failed to load YouTube status");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const response = await fetch('/api/youtube/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      }
    } catch (err: any) {
      setError('Failed to initiate YouTube authorization');
      console.error(err);
      setConnecting(false);
    }
  };

  const handleAuthCallback = async (code: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/youtube/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to connect YouTube');
      }

      await loadYouTubeStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to complete YouTube authorization');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Bạn có chắc muốn ngắt kết nối YouTube? Điều này sẽ vô hiệu hóa tính năng upload video lên YouTube cho toàn hệ thống.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/youtube/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect YouTube');
      }

      await loadYouTubeStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect YouTube');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/youtube/refresh', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh YouTube connection');
      }

      await loadYouTubeStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to refresh YouTube connection');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Youtube className="w-10 h-10 text-red-600" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Quản lý YouTube</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Kết nối YouTube để cho phép giảng viên upload video lên YouTube
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Lỗi</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Trạng thái kết nối</h2>
        
        {status?.connected ? (
          <div className="space-y-4">
            {/* Connected Status */}
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-green-800">✓ Đã kết nối YouTube</p>
                <p className="text-sm text-green-700">
                  Hệ thống đã được kết nối với YouTube và sẵn sàng upload video
                </p>
              </div>
            </div>

            {/* Channel Info */}
            {status.channel_name && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Kênh YouTube</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{status.channel_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Channel ID</p>
                    <p className="font-mono text-sm text-slate-800 dark:text-slate-200">{status.channel_id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Connection Details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Kết nối lúc</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200">
                    {status.connected_at ? new Date(status.connected_at).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Token hết hạn</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200">
                    {status.expires_at ? new Date(status.expires_at).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleRefresh}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Làm mới kết nối
              </Button>
              <Button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Ngắt kết nối
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Not Connected Status */}
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <XCircle className="w-6 h-6 text-yellow-600" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-800">⚠ Chưa kết nối YouTube</p>
                <p className="text-sm text-yellow-700">
                  Giảng viên chưa thể upload video lên YouTube
                </p>
              </div>
            </div>

            {/* Connect Instructions */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-800 mb-2">📋 Hướng dẫn kết nối</p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Click nút Kết nối YouTube bên dưới</li>
                <li>Đăng nhập vào tài khoản Google có kênh YouTube</li>
                <li>Cho phép ứng dụng truy cập YouTube</li>
                <li>Hệ thống sẽ lưu kết nối và cho phép upload video</li>
              </ol>
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Youtube className="w-5 h-5" />
              {connecting ? "Đang kết nối..." : "Kết nối YouTube"}
            </Button>
          </div>
        )}
      </div>

      {/* Info Boxes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Features */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <span>✨</span>
            <span>Tính năng</span>
          </h3>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span>Upload video không giới hạn dung lượng server</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span>Streaming video chất lượng cao từ YouTube</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span>Tự động tạo nhiều độ phân giải</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span>Hỗ trợ phụ đề và tốc độ phát</span>
            </li>
          </ul>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <span>🔒</span>
            <span>Bảo mật</span>
          </h3>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Chỉ admin có quyền kết nối YouTube</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Tokens được mã hóa và lưu an toàn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Tự động làm mới token khi hết hạn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Có thể ngắt kết nối bất cứ lúc nào</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6 text-center">
        <Button
          onClick={() => router.push("/lms/admin")}
          className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline hover:no-underline transition-colors"
        >
          ← Quay lại Dashboard
        </Button>
      </div>
    </div>
  );
}