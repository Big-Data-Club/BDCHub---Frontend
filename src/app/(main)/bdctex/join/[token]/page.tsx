"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { latexService } from "@/services/latexService";

interface JoinPageProps {
  params: Promise<{ token: string }>;
}

export default function JoinProjectPage({ params }: JoinPageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    async function join() {
      try {
        const res = await latexService.joinViaShareLink(token);
        if (res.success && res.data) {
          setStatus("success");
          setProjectId(res.data.project_id);
          setMessage("Bạn đã tham gia dự án thành công!");
          setTimeout(() => {
            router.push(`/bdctex/${res.data.project_id}`);
          }, 2000);
        } else {
          setStatus("error");
          setMessage(res.message || "Liên kết không hợp lệ hoặc đã hết hạn.");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || err.message || "Liên kết không hợp lệ hoặc đã hết hạn.");
      }
    }
    join();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-10 max-w-sm w-full text-center space-y-4">
        <div className={`p-4 rounded-2xl mx-auto w-fit ${
          status === "loading" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
          : status === "success" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
          : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
        }`}>
          {status === "loading" ? <Loader2 size={32} className="animate-spin" />
           : status === "success" ? <CheckCircle2 size={32} />
           : <XCircle size={32} />}
        </div>

        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">
          {status === "loading" ? "Đang tham gia dự án..."
           : status === "success" ? "Tham gia thành công!"
           : "Liên kết không hợp lệ"}
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          {status === "loading"
            ? "Đang xử lý yêu cầu tham gia qua liên kết chia sẻ..."
            : message}
        </p>

        {status === "success" && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Đang chuyển hướng đến editor...
          </p>
        )}

        {status === "error" && (
          <button
            onClick={() => router.push("/bdctex")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3 text-sm shadow-sm active:scale-95 transition-all duration-200 mt-2"
          >
            Về trang chủ BDCTex
          </button>
        )}
      </div>
    </div>
  );
}
