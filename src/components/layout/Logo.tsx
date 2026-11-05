"use client"

import Link from "@/lib/tenant/Link";
import { BrandMark } from "./BrandMark";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
      <div className="w-20 h-20 rounded-lg flex items-center justify-center">
        <BrandMark size={80} />
      </div>
    </Link>
  );
}
