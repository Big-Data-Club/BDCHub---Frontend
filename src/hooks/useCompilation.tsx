import { useState, useRef, useEffect, useCallback } from "react";
import { latexService } from "@/services/latexService";
import { getAccessToken } from "@/services/authToken";
import type { CompileJob } from "@/types";

export function useCompilation() {
  const [compiling, setCompiling] = useState(false);
  const [job, setJob] = useState<CompileJob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [log, setLog] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearPolling();
  }, []);

  const pollStatus = useCallback((jobId: string) => {
    clearPolling();

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await latexService.getCompileStatus(jobId);
        if (res.success && res.data) {
          const updatedJob: CompileJob = res.data;
          setJob(updatedJob);

          if (updatedJob.status === "success") {
            clearPolling();
            setCompiling(false);
            const token = await getAccessToken();
            setPdfUrl(latexService.getCompilePdfUrl(jobId, token));
            setLog(updatedJob.log_output || null);
            setErrorMsg(null);
          } else if (updatedJob.status === "failed" || updatedJob.status === "timeout") {
            clearPolling();
            setCompiling(false);
            setErrorMsg(updatedJob.error_message || "Biên dịch thất bại.");
            // Fetch complete log
            try {
              const logRes = await latexService.getCompileLog(jobId);
              if (logRes.success && logRes.data) {
                setLog(logRes.data.log || null);
              } else {
                setLog(updatedJob.log_output || null);
              }
            } catch (e) {
              setLog(updatedJob.log_output || null);
            }
          }
        }
      } catch (err: any) {
        console.error("Polling error:", err);
        // Do not abort immediately on minor network glitch, continue polling
      }
    }, 2000);
  }, []);

  const compileProject = async (projectId: number, compiler?: string) => {
    clearPolling();
    setCompiling(true);
    setJob(null);
    setPdfUrl(null);
    setLog(null);
    setErrorMsg(null);

    try {
      const res = await latexService.compile(projectId, compiler);
      if (res.success && res.data) {
        const initialJob: CompileJob = res.data;
        setJob(initialJob);
        pollStatus(initialJob.job_id);
      } else {
        throw new Error(res.message || "Failed to initiate compilation");
      }
    } catch (err: any) {
      console.error("Compile failed:", err);
      setCompiling(false);
      setErrorMsg(err.response?.data?.message || err.message || "Tạo tiến trình biên dịch thất bại.");
    }
  };

  return {
    compiling,
    job,
    pdfUrl,
    log,
    errorMsg,
    compileProject,
    clearLogs: () => setLog(null),
  };
}
