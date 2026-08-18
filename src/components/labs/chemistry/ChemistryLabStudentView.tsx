// frontend/src/components/labs/chemistry/ChemistryLabStudentView.tsx
"use client";

import { useState, useEffect } from "react";
import type { ChemistryLabSpec } from "@/types/labs/chemistry";
import { labService } from "@/services/labs/labService";
import { ChemistryCanvasStage } from "./ChemistryCanvasStage";
import { Loader2, FlaskConical, AlertCircle } from "lucide-react";

interface Props {
  labId: number;
}

/**
 * Student-side view for a CHEMISTRY lab.
 * Loads the saved ChemistryLabSpec from the lab's runtimeConfig,
 * then renders the interactive ChemistryCanvasStage.
 */
export function ChemistryLabStudentView({ labId }: Props) {
  const [spec, setSpec] = useState<ChemistryLabSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await labService.getLabById(labId);
        const labSpec = res.data?.runtimeConfig?.chemistry_spec as ChemistryLabSpec | undefined;
        if (labSpec) {
          setSpec(labSpec);
        } else {
          setError("Giảng viên chưa cấu hình thí nghiệm hóa học cho lab này.");
        }
      } catch {
        setError("Không thể tải cấu hình thí nghiệm.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [labId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] gap-3 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm">Đang tải thí nghiệm hóa học...</span>
      </div>
    );
  }

  if (error || !spec) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-slate-400 p-8 text-center">
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40">
          <FlaskConical className="h-10 w-10 text-purple-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-300">
            {error ?? "Thí nghiệm chưa sẵn sàng"}
          </p>
          <p className="text-xs text-slate-500">
            Liên hệ giảng viên để biết thêm thông tin.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/30 border border-amber-800/40 rounded-xl px-4 py-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          Giảng viên cần vào trang quản lý Lab → tab &quot;🧪 Cấu hình Hóa học&quot; để thiết kế thí nghiệm.
        </div>
      </div>
    );
  }

  return <ChemistryCanvasStage spec={spec} />;
}
