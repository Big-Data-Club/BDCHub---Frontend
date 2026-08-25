"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, ExternalLink, FileText } from "lucide-react";
import { MentorItem } from "./MentorCard";

export interface PublicationItem {
  id: string;
  title: string;
  authors: string;
  publisher: string;
  year: number;
  url?: string;
  doi?: string;
}

interface MentorModalProps {
  mentor: MentorItem | null;
  publications: PublicationItem[];
  onClose: () => void;
}

export default function MentorModal({ mentor, publications, onClose }: MentorModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (mentor) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mentor]);

  if (!mentor || !mounted) return null;

  // Lọc chính xác danh sách bài báo của từng Thầy/Cô
  const filteredPubs = publications.filter((pub) => {
    const authorsLower = pub.authors.toLowerCase();
    
    // PGS.TS Thoại Nam -> "Nam Thoai" hoặc "Thoai Nam"
    if (mentor.id === "m1" || mentor.name.includes("Thoại Nam")) {
      return authorsLower.includes("nam thoai") || authorsLower.includes("thoai nam");
    }
    
    // ThS. Diệp Thanh Đăng -> "Thanh-Dang Diep" hoặc "Diep"
    if (mentor.id === "m2" || mentor.name.includes("Diệp Thanh Đăng")) {
      return authorsLower.includes("thanh-dang diep") || authorsLower.includes("diep");
    }
    
    // ThS. Hoàng Lê Hải Thanh -> "Thanh Hoang Le Hai" hoặc "Le Hai"
    if (mentor.id === "m3" || mentor.name.includes("Hoàng Lê Hải Thanh")) {
      return authorsLower.includes("thanh hoang le hai") || authorsLower.includes("le hai");
    }

    return false;
  });

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
        {/* Backdrop click close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0F1E35] rounded-2xl border border-slate-200 dark:border-blue-500/30 shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Hồ Sơ Nghiên Cứu Khoa Học
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Mentor Info Header */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#070E1C] border border-slate-200/60 dark:border-blue-500/20 mb-6">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{mentor.name}</h4>
                <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 mt-0.5">{mentor.role}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{mentor.desc}</p>
                
                {mentor.tags && mentor.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {mentor.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-800 dark:text-cyan-300">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Publications List */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Các Công Trình Nghiên Cứu Nổi Bật ({filteredPubs.length})
              </h5>

              {filteredPubs.length > 0 ? (
                filteredPubs.map((pub) => (
                  <div
                    key={pub.id}
                    className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h6 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                        {pub.title}
                      </h6>
                      <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-950 text-blue-600 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-800/40">
                        {pub.year}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Tác giả:</span> {pub.authors}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                      {pub.publisher}
                    </p>
                    {pub.url && (
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline mt-2.5"
                      >
                        Xem chi tiết bài báo <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                  Đang cập nhật các công trình nghiên cứu khoa học mở rộng...
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
