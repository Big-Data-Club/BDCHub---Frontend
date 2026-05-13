"use client";
import { useRouter } from "next/navigation";
import { Briefcase, BookOpen, ArrowRight } from "lucide-react";
import clubData from "@/data/clubData.json";
import { useScrollAnimation } from "@/hooks/animation/useScrollAnimation";

export default function Projects() {
  const router = useRouter();
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section id="projects" ref={ref} className={`py-24 px-4 sm:px-6 lg:px-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
        <div>
          {/* Section header — pipeline style */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-2">
              <Briefcase className="text-blue-600 dark:text-cyan-400 w-6 h-6 shrink-0" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Dự Án Nổi Bật</h2>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="w-12 h-1 bg-blue-600 dark:bg-cyan-400 rounded-full" />
              <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 dark:from-cyan-400/20 to-transparent" />
            </div>
          </div>
          <div className="space-y-4">
            {clubData.projects.slice(0, 6).map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(project.projectShowcaseUrl)}
                className="p-5 rounded-xl cursor-pointer group
                           bg-white dark:bg-[#0F1E35]
                           border border-slate-200 dark:border-blue-500/10
                           shadow-sm dark:shadow-none
                           hover:shadow-md dark:hover:border-blue-500/25
                           hover:border-blue-300
                           transition-all duration-300"
              >
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  {project.projectName}
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors" />
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{project.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* Section header — pipeline style */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-2">
              <BookOpen className="text-blue-600 dark:text-cyan-400 w-6 h-6 shrink-0" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Công Bố Khoa Học</h2>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="w-12 h-1 bg-blue-600 dark:bg-cyan-400 rounded-full" />
              <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 dark:from-cyan-400/20 to-transparent" />
            </div>
          </div>
          <div className="space-y-6">
            {clubData.publications.map((pub) => (
              <div key={pub.id} className="pl-4 border-l-2 border-blue-600 dark:border-cyan-400">
                <h4 className="font-semibold text-slate-900 dark:text-white leading-snug">{pub.title}</h4>
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