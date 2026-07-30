"use client";
import Link from "next/link";
import { Briefcase, BookOpen, ArrowRight } from "lucide-react";
import clubData from "@/data/clubData.json";
import SectionHeader from "../common/SectionHeader";

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
        <div>
          <SectionHeader icon={Briefcase} title="Dự Án Nổi Bật" />
          
          <div className="space-y-4">
            {clubData.projects.slice(0, 6).map((project) => (
              <div key={project.id}>
                <Link
                  href={project.projectShowcaseUrl}
                  className="p-5 rounded-2xl cursor-pointer group block
                             bg-white dark:bg-[#0F1E35]
                             border border-slate-200 dark:border-blue-500/20
                             shadow-md dark:shadow-[0_4px_20px_rgba(7,14,28,0.4)]
                             hover:-translate-y-1
                             hover:shadow-xl hover:shadow-blue-500/10
                             dark:hover:shadow-[0_8px_30px_rgba(34,211,238,0.12)]
                             hover:border-blue-400/60 dark:hover:border-cyan-400/40
                             transition-transform transition-shadow transition-colors duration-300"
                >
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-between group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                    {project.projectName}
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all duration-300" />
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{project.desc}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader icon={BookOpen} title="Công Bố Khoa Học" />
          
          <div className="space-y-6">
            {clubData.publications.map((pub) => (
              <div
                key={pub.id} 
                className="pl-4 border-l-2 border-blue-600 dark:border-cyan-400
                                             hover:pl-5 hover:border-l-4
                                             transition-all duration-300 group"
              >
                <h4 className="font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-300">{pub.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{pub.authors}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">{pub.publisher} ({pub.year})</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
