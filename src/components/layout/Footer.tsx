"use client";

import Link from "next/link";
import { FaFacebook, FaGithub, FaGlobe } from "react-icons/fa";
import bdc from "@/assets/bdclogo.png";
import SafeImage from "../common/SafeImage";

const SOCIALS = [
  { Icon: FaFacebook, href: "https://facebook.com/BDCofHCMUT", label: "Facebook" },
  { Icon: FaGithub,  href: "https://github.com/Big-Data-Club", label: "Github"  },
  { Icon: FaGlobe,   href: "https://bdc.hpcc.vn",              label: "BDC Web" },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white/80 dark:bg-[#070E1C]/85 backdrop-blur-xl
                       border-t border-slate-200 dark:border-blue-500/8
                       w-full flex-shrink-0">
      {/* Cosmic glow line - dark mode only */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 dark:via-cyan-400/15 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          <Link href="/" className="flex items-center gap-2.5 group order-1">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden
                            border border-slate-200 dark:border-blue-500/20
                            group-hover:shadow-sm transition-shadow">
              <SafeImage src={bdc} alt="Big Data Club" fill sizes="28px" className="object-cover" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100
                             group-hover:text-blue-600 dark:group-hover:text-cyan-400
                             transition-colors">
              BDC System
            </span>
          </Link>

          <span className="text-xs text-slate-400 dark:text-slate-500 order-3 sm:order-2 text-center">
            © 2025–{currentYear} Big Data Club. All rights reserved.
          </span>

          <div className="flex items-center gap-4 order-2 sm:order-3">
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-slate-400 dark:text-slate-500
                           hover:text-blue-600 dark:hover:text-cyan-400
                           hover:-translate-y-0.5 transition-all duration-200"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;