"use client";

import { MessageSquare, Megaphone } from "lucide-react";
import type { ContentFormProps } from "@/types";

/**
 * ForumAnnouncementContentForm
 *
 * Forum and Announcement content types don't need file uploads or
 * complex settings — they're purely structural nodes. This form renders
 * an info card explaining what will be created.
 */
export function ForumAnnouncementContentForm({ formData }: ContentFormProps) {
  const isForum = formData.type === "FORUM";

  return (
    <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
        {isForum
          ? <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          : <Megaphone    className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
          {isForum ? "Diễn đàn thảo luận" : "Thông báo khóa học"}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 leading-relaxed">
          {isForum
            ? "Tạo một không gian thảo luận cho học viên. Học viên có thể đặt câu hỏi, chia sẻ kiến thức và bình luận dưới bài học."
            : "Gửi một thông báo đến tất cả học viên đã đăng ký khóa học. Thông báo sẽ hiển thị nổi bật trong giao diện học tập."}
        </p>
        <p className="text-xs text-blue-500 dark:text-blue-500 mt-2">
          Nhập tiêu đề và mô tả ở trên để hoàn tất.
        </p>
      </div>
    </div>
  );
}
