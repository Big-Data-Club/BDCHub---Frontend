"use client"

import Link from "next/link";
import { LogoIcon } from "@/constants";
import SafeImage from "../common/SafeImage";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
      <div className="w-20 h-20 rounded-lg flex items-center justify-center">
        <SafeImage
          src={LogoIcon}
          alt="Big Data Club"
          width={120}
          height={120}
          priority
        />
      </div>
    </Link>
  );
}