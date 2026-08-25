"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media-url";
import type { CSSProperties } from "react";

type UserAvatarProps = {
  name?: string | null;
  src?: string | null;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
  style?: CSSProperties;
  title?: string;
};

function initial(name?: string | null) {
  const firstWord = name?.trim().split(/\s+/).find(Boolean);
  return firstWord?.charAt(0).toLocaleUpperCase() || "U";
}

/** Displays the user's uploaded photo, with a local text fallback and no network-generated avatar. */
export function UserAvatar({ name, src, className, fallbackClassName, alt, style, title }: UserAvatarProps) {
  // Legacy rows may store "uploads/..." (no leading slash) or absolute URLs
  // to internal hosts - normalise so every surface resolves the same file.
  const imageSrc = resolveMediaUrl(src);
  return (
    <Avatar className={cn("shrink-0 overflow-hidden", className)} style={style} title={title}>
      {imageSrc ? <AvatarImage src={imageSrc} alt={alt || name || "User"} className="object-cover" /> : null}
      <AvatarFallback
        className={cn(
          "bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300",
          fallbackClassName,
        )}
      >
        {initial(name)}
      </AvatarFallback>
    </Avatar>
  );
}
