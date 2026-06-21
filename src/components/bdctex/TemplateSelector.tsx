import React, { useEffect, useState } from "react";
import { Check, BookOpen, Presentation, GraduationCap, FileText } from "lucide-react";
import { latexService } from "@/services/latexService";
import type { LatexTemplate } from "@/types";

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelect: (id: string | null) => void;
}

export function TemplateSelector({ selectedTemplateId, onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<LatexTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await latexService.getTemplates();
        if (res.success && res.data) {
          setTemplates(res.data);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case "beamer":
        return <Presentation size={20} />;
      case "bdc-thesis":
        return <GraduationCap size={20} />;
      case "report":
        return <BookOpen size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <span className="text-slate-500 text-sm">Đang tải danh sách template...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-900 dark:text-slate-200">
        Chọn Template (Tùy chọn)
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
        {/* Blank Template Option */}
        <div
          onClick={() => onSelect(null)}
          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
            selectedTemplateId === null
              ? "border-blue-600 dark:border-blue-500 bg-blue-50/30 dark:bg-blue-950/10 ring-2 ring-blue-500/10"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
          }`}
        >
          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-400">
            <FileText size={20} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-50">Dự án trống</h4>
              {selectedTemplateId === null && <Check size={16} className="text-blue-600" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Khởi tạo dự án LaTeX trắng chỉ với một file main.tex cơ bản.
            </p>
          </div>
        </div>

        {/* Dynamic Templates */}
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => onSelect(tpl.id)}
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
              selectedTemplateId === tpl.id
                ? "border-blue-600 dark:border-blue-500 bg-blue-50/30 dark:bg-blue-950/10 ring-2 ring-blue-500/10"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
            }`}
          >
            <div className="bg-blue-50 dark:bg-blue-950/40 p-2 rounded-lg text-blue-600 dark:text-blue-400">
              {getTemplateIcon(tpl.id)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-50">{tpl.name}</h4>
                {selectedTemplateId === tpl.id && <Check size={16} className="text-blue-600" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {tpl.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
