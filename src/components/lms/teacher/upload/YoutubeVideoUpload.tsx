"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileInfo } from "@/types";
import { Youtube, CheckCircle, AlertCircle, XCircle } from "lucide-react";


interface YouTubeVideoUploadProps {
  onFileUploaded: (fileInfo: FileInfo) => void;
  disabled?: boolean;
}

export default function YouTubeVideoUpload({
  onFileUploaded,
  disabled = false,
}: YouTubeVideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [privacyStatus, setPrivacyStatus] = useState<'public' | 'private' | 'unlisted'>('unlisted');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkYouTubeConnection();
  }, []);

  const checkYouTubeConnection = async () => {
    try {
      setCheckingConnection(true);
      const response = await fetch('/api/youtube/status');
      const data = await response.json();
      
      setIsConnected(data.connected);
      setError("");
    } catch (err: any) {
      console.error("Error checking YouTube connection:", err);
      setIsConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Vui lòng chọn file video');
      return;
    }

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File quá lớn. Kích thước tối đa: 2GB');
      return;
    }

    if (!isConnected) {
      setError('YouTube chưa được kết nối. Vui lòng liên hệ admin để kết nối YouTube.');
      return;
    }

    setError("");
    setUploading(true);
    setProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", videoTitle || file.name);
      formData.append("description", videoDescription || "Uploaded from LMS");
      formData.append("privacyStatus", privacyStatus);

      // Simulate progress (YouTube upload doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 5;
        });
      }, 500);

      // Upload to YouTube via API (middleware handles auth)
      const response = await fetch('/api/youtube/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.data) {
        setProgress(100);
        onFileUploaded(result.data);
        
        // Reset form
        setVideoTitle("");
        setVideoDescription("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Lỗi khi upload video lên YouTube");
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (!isConnected) {
      alert('YouTube chưa được kết nối. Vui lòng liên hệ admin để kết nối YouTube.');
      return;
    }
    fileInputRef.current?.click();
  };

  if (checkingConnection) {
    return (
      <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600">Đang kiểm tra kết nối YouTube...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Connection Status */}
      <div className={`p-4 rounded-lg border-2 ${
        isConnected 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-green-800">✓ YouTube đã kết nối</p>
                <p className="text-sm text-green-600">Sẵn sàng upload video lên YouTube</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <p className="font-semibold text-red-800">✗ YouTube chưa kết nối</p>
                <p className="text-sm text-red-600">Vui lòng liên hệ admin để kết nối YouTube</p>
              </div>
              <Button
                onClick={checkYouTubeConnection}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Kiểm tra lại
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Video Metadata Form (only show if connected) */}
      {isConnected && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề video *</label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Nhập tiêu đề video..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              placeholder="Mô tả video (tùy chọn)..."
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quyền riêng tư</label>
            <select
              value={privacyStatus}
              onChange={(e) => setPrivacyStatus(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            >
              <option value="private">Riêng tư</option>
              <option value="unlisted">Không công khai (khuyến nghị)</option>
              <option value="public">Công khai</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {privacyStatus === 'private' && '🔒 Chỉ bạn có thể xem'}
              {privacyStatus === 'unlisted' && '🔗 Ai có link đều xem được - Khuyến nghị cho khóa học'}
              {privacyStatus === 'public' && '🌍 Mọi người đều có thể tìm và xem'}
            </p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading || !isConnected}
      />

      <Button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled || uploading || !isConnected}
        className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Youtube className="w-5 h-5" />
        {uploading 
          ? `Đang upload... ${progress}%` 
          : isConnected
            ? "Chọn video để upload lên YouTube"
            : "YouTube chưa kết nối"
        }
      </Button>

      {/* Progress Bar */}
      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">
              {progress < 30 && "Đang chuẩn bị..."}
              {progress >= 30 && progress < 60 && "Đang upload..."}
              {progress >= 60 && progress < 90 && "Đang xử lý..."}
              {progress >= 90 && "Hoàn thành!"}
            </span>
            <span className="font-medium text-red-600">{progress}%</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Info */}
      {isConnected && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>📹 Định dạng: MP4, AVI, MOV, MKV, WEBM, v.v.</p>
          <p>📊 Kích thước tối đa: 2GB</p>
          <p>⏱ Thời gian upload phụ thuộc vào kích thước file và tốc độ mạng</p>
          <p className="text-blue-600 font-medium">
            ℹ️ Video sẽ được upload lên kênh YouTube của hệ thống
          </p>
        </div>
      )}
    </div>
  );
}