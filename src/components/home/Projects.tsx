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
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Briefcase className="text-blue-600" /> Dự Án Nổi Bật
            </h2>
            <div className="w-12 h-1 bg-blue-600 mt-4 rounded-full"></div>
          </div>
          <div className="space-y-4">
            {clubData.projects.slice(0, 5).map((project) => (
              <div key={project.id} onClick={() => router.push(project.projectShowcaseUrl)} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                <h3 className="font-bold text-slate-900 flex items-center justify-between">
                  {project.projectName}
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </h3>
                <p className="text-sm text-slate-500 mt-2">{project.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <BookOpen className="text-blue-600" /> Công Bố Khoa Học
            </h2>
            <div className="w-12 h-1 bg-blue-600 mt-4 rounded-full"></div>
          </div>
          <div className="space-y-6">
            {clubData.publications.map((pub) => (
              <div key={pub.id} className="pl-4 border-l-2 border-blue-600">
                <h4 className="font-semibold text-slate-900 leading-snug">{pub.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{pub.authors}</p>
                <p className="text-xs text-slate-500 mt-1 italic">{pub.publisher} ({pub.year})</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}