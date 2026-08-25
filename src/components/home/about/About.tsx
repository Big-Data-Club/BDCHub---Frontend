"use client";

import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "../../common/SectionHeader";
import { AboutIntroCard } from "./AboutIntroCard";
import { AboutValueGrid } from "./AboutValueGrid";

export default function About() {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader icon={BookOpen} title="Về Câu Lạc Bộ" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-12 gap-8 items-stretch"
        >
          <AboutIntroCard />
          <AboutValueGrid />
        </motion.div>
      </div>
    </section>
  );
}
