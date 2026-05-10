"use client";
import React from "react";
import SafeImage from "../common/SafeImage";

export default function Avatar({ code, size = 44 }: { code: string; size?: number }) {
  const src = `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(code)}`;
  return (
    <SafeImage
      src={src}
      alt={code}
      width={size}
      height={size}
      unoptimized
      className="rounded-full"
      style={{ width: size, height: size }}
    />
  );
}
