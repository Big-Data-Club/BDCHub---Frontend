"use client";
import React from "react";
import { UserAvatar } from "./UserAvatar";

export default function Avatar({ code, name, src, size = 44 }: { code?: string; name?: string; src?: string | null; size?: number }) {
  return (
    <UserAvatar
      name={name || code}
      src={src}
      className="inline-flex"
      fallbackClassName="text-xs"
      style={{ width: size, height: size }}
    />
  );
}
