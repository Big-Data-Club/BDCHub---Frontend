"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatAvatarProps {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showPresence?: boolean;
}

const sizeClasses = { xs: "h-6 w-6 text-[9px]", sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-10 w-10 text-sm" };

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}` : parts[0]?.slice(0, 2) ?? "?").toUpperCase();
}

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return { background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${(hue + 38) % 360} 72% 38%))` };
}

export default function ChatAvatar({ name, src, size = "md", className, showPresence }: ChatAvatarProps) {
  return (
    <div className={cn("relative shrink-0", sizeClasses[size], className)}>
      <Avatar className={cn("h-full w-full ring-2 ring-white/80 dark:ring-slate-900 shadow-sm", sizeClasses[size])}>
        {src ? <AvatarImage src={src} alt={name} className="object-cover" /> : null}
        <AvatarFallback style={colorFor(name)} className="font-bold tracking-tight text-white select-none">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      {showPresence ? <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" aria-label="Đang hoạt động" /> : null}
    </div>
  );
}
