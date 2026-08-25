"use client";

import { motion } from "framer-motion";

export const aboutValues = [
  { 
    number: "01",
    title: "Học Hỏi Không Ngừng", 
    desc: "Trân trọng tiềm năng và phát triển kĩ năng chuyên môn cho từng cá nhân qua các bài giảng chuyên đề chọn lọc.", 
  },
  { 
    number: "02",
    title: "Dám Nghĩ Dám Làm", 
    desc: "Tư duy đổi mới sáng tạo, chủ động thử nghiệm các công nghệ dữ liệu và mô hình AI tiên tiến.", 
  },
  { 
    number: "03",
    title: "Chia Sẻ Cởi Mở", 
    desc: "Tinh thần Open Learning - Open Sharing cùng xây dựng cộng đồng học thuật vững mạnh.", 
  },
  { 
    number: "04",
    title: "Học Qua Dự Án", 
    desc: "Phương châm Learning by Doing - Trải nghiệm thực chiến qua các bài toán và sản phẩm thực tế.", 
  }
];

export function AboutValueGrid() {
  return (
    <div className="md:col-span-6 lg:col-span-7 divide-y divide-slate-200 dark:divide-slate-800/80 border-t border-b border-slate-200 dark:border-slate-800/80">
      {aboutValues.map((val, idx) => {
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: 0.06 * idx, ease: [0.16, 1, 0.3, 1] }}
            className="py-5 sm:py-6 group flex gap-5 sm:gap-6 items-start transition-colors duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 px-2 sm:px-4 -mx-2 sm:-mx-4 rounded-xl"
          >
            <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-200 pt-0.5">
              [{val.number}]
            </span>
            <div className="space-y-1 flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
                {val.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {val.desc}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

