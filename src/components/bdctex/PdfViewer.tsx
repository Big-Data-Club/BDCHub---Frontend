import React from "react";
import { Loader2, FileText, Download } from "lucide-react";

interface PdfViewerProps {
  pdfUrl: string | null;
  compiling: boolean;
  errorMsg: string | null;
}

export function PdfViewer({ pdfUrl, compiling, errorMsg }: PdfViewerProps) {
  return (
    <div className="flex-1 bg-slate-100 dark:bg-slate-950/40 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50 uppercase tracking-wider">
          Xem trước tài liệu (PDF)
        </h4>
        {pdfUrl && (
          <a
            href={pdfUrl}
            download="document.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            <Download size={14} />
            Tải PDF
          </a>
        )}
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {compiling ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
            <span className="text-sm text-slate-500 dark:text-slate-400">Đang biên dịch dự án LaTeX...</span>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center max-w-xs text-center">
            <div className="bg-red-50 dark:bg-red-950/30 text-red-500 p-3 rounded-2xl mb-4">
              <FileText size={28} />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Lỗi biên dịch xảy ra
            </span>
            <span className="text-xs text-slate-400 mt-2">
              Có lỗi xảy ra trong quá trình biên dịch LaTeX. Vui lòng xem log biên dịch để khắc phục.
            </span>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner bg-white"
          />
        ) : (
          <div className="flex flex-col items-center max-w-xs text-center">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-slate-400 mb-4 border border-slate-200/50 dark:border-slate-800/50">
              <FileText size={28} />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Chưa có bản xem trước PDF
            </span>
            <span className="text-xs text-slate-400 mt-2">
              Nhấn nút "Biên dịch" trên thanh công cụ để build tệp PDF xem trước.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
