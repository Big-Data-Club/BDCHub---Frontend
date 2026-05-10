"use client";

import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import bdc from "@/assets/bdclogo.png";
import SafeImage from "../common/SafeImage";

const SOCIALS = [
  { Icon: FaFacebook, href: "https://facebook.com/BDCofHCMUT", label: "Facebook" },
  { Icon: FaTwitter,  href: "https://twitter.com",             label: "Twitter"  },
  { Icon: FaInstagram,href: "https://instagram.com",           label: "Instagram"},
  { Icon: FaLinkedin, href: "https://linkedin.com",            label: "LinkedIn" },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900
                       border-t border-slate-200 dark:border-slate-800
                       w-full flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          <Link href="/" className="flex items-center gap-2.5 group order-1">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden
                            border border-slate-200 dark:border-slate-700
                            group-hover:shadow-sm transition-shadow">
              <SafeImage src={bdc} alt="Big Data Club" fill sizes="28px" className="object-cover" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-50
                             group-hover:text-blue-600 dark:group-hover:text-blue-400
                             transition-colors">
              BDC System
            </span>
          </Link>

          <span className="text-xs text-slate-400 dark:text-white-600 order-3 sm:order-2 text-center">
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
                className="text-slate-400 dark:text-white-600
                           hover:text-blue-600 dark:hover:text-blue-400
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