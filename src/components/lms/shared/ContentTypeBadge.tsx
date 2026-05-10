"use client";

import { ReactNode } from "react";
import {
  Play, FileText, Image as ImageIcon,
  HelpCircle, MessageSquare, Megaphone, File
} from "lucide-react";
import { Badge, BadgeVariant } from "./Badge";

const CONTENT_META: Record<string, { icon: ReactNode; label: string; variant: BadgeVariant }> = {
  VIDEO:        { icon: <Play className="w-3.5 h-3.5" />,        label: "Video",      variant: "blue"   },
  DOCUMENT:     { icon: <FileText className="w-3.5 h-3.5" />,    label: "Tài liệu",   variant: "gray"   },
  IMAGE:        { icon: <ImageIcon className="w-3.5 h-3.5" />,   label: "Hình ảnh",   variant: "purple" },
  TEXT:         { icon: <FileText className="w-3.5 h-3.5" />,    label: "Bài đọc",    variant: "gray"   },
  QUIZ:         { icon: <HelpCircle className="w-3.5 h-3.5" />,  label: "Quiz",       variant: "yellow" },
  FORUM:        { icon: <MessageSquare className="w-3.5 h-3.5"/>, label: "Thảo luận", variant: "purple" },
  ANNOUNCEMENT: { icon: <Megaphone className="w-3.5 h-3.5" />,   label: "Thông báo",  variant: "yellow" },
};

export function ContentTypeBadge({ type }: { type: string }) {
  const meta = CONTENT_META[type] ?? { icon: <File className="w-3.5 h-3.5" />, label: type, variant: "gray" as BadgeVariant };
  return (
    <Badge variant={meta.variant as BadgeVariant}>
      <span className="flex items-center gap-1">{meta.icon}{meta.label}</span>
    </Badge>
  );
}