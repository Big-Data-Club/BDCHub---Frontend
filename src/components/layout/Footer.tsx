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
    <footer className="relative bg-white/90 dark:bg-[#070E1C]/90 backdrop-blur-xl border-t border-slate-200 dark:border-blue-500/15 w-full flex-shrink-0">
      {/* Top Subtle Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 dark:via-cyan-400/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Left Brand Identifier */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-slate-200 dark:border-blue-500/20 shadow-sm group-hover:scale-105 transition-transform duration-200">
                <SafeImage src={bdc} alt="Big Data Club" fill sizes="32px" className="object-cover" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors block leading-tight">
                  Big Data Club
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                  HCMUT • Computer Science & Engineering
                </span>
              </div>
            </Link>
          </div>

          {/* Center Copyright & Affiliation Text */}
          <div className="text-center text-xs text-slate-600 dark:text-slate-400 font-medium space-y-1">
            <p>© 2021–{currentYear} Big Data Club HCMUT. Under guidance of HPC Lab.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Think Big • Speak Data</p>
          </div>

          {/* Right Social & Web Links */}
          <div className="flex items-center gap-4">
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#0F1E35] text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-slate-950 hover:bg-blue-600 dark:hover:bg-cyan-400 border border-slate-200/60 dark:border-blue-500/15 hover:scale-105 transition-all duration-200"
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