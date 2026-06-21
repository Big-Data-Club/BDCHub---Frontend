import { useState, useEffect, useCallback } from "react";
import { latexService } from "@/services/latexService";
import type { LatexFile } from "@/types";

export function useLatexEditor(projectId: number) {
  const [files, setFiles] = useState<LatexFile[]>([]);
  const [activeFile, setActiveFile] = useState<LatexFile | null>(null);
  const [activeFileContent, setActiveFileContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const res = await latexService.getProjectFiles(projectId);
      if (res.success && res.data) {
        const fileList: LatexFile[] = res.data;
        setFiles(fileList);

        // Auto-select main.tex if available, otherwise first file, otherwise null
        if (!activeFile && fileList.length > 0) {
          const mainTex = fileList.find((f) => f.filename === "main.tex") || fileList[0];
          selectFile(mainTex);
        }
      }
    } catch (err) {
      console.error("Failed to list files:", err);
    } finally {
      setLoadingFiles(false);
    }
  }, [projectId, activeFile]);

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const selectFile = async (file: LatexFile) => {
    if (isDirty) {
      const confirmSave = confirm("Bạn có thay đổi chưa lưu. Bạn có muốn lưu trước khi chuyển file không?");
      if (confirmSave) {
        await saveActiveFile();
      }
    }

    setActiveFile(file);
    setIsDirty(false);

    // Only load content for editable text files (.tex, .bib, .cls, .txt)
    const isText =
      file.filename.endsWith(".tex") ||
      file.filename.endsWith(".bib") ||
      file.filename.endsWith(".cls") ||
      file.filename.endsWith(".txt") ||
      file.mime_type.startsWith("text/");

    if (isText) {
      setLoadingContent(true);
      try {
        const res = await latexService.getFileContent(projectId, file.id);
        if (res.success && res.data) {
          setActiveFileContent(res.data.content ?? "");
        }
      } catch (err) {
        console.error("Failed to get file content:", err);
        setActiveFileContent("");
      } finally {
        setLoadingContent(false);
      }
    } else {
      setActiveFileContent("");
    }
  };

  const handleContentChange = (newContent: string) => {
    setActiveFileContent(newContent);
    setIsDirty(true);
  };

  const saveActiveFile = async () => {
    if (!activeFile) return;
    try {
      const res = await latexService.updateFileContent(projectId, activeFile.id, activeFileContent);
      if (res.success) {
        setIsDirty(false);
      } else {
        throw new Error(res.message || "Failed to save file content");
      }
    } catch (err) {
      console.error("Failed to save file:", err);
      alert("Lưu file thất bại: " + (err as any).message);
    }
  };

  const deleteFile = async (fileId: number) => {
    try {
      const res = await latexService.deleteFile(projectId, fileId);
      if (res.success) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        if (activeFile?.id === fileId) {
          setActiveFile(null);
          setActiveFileContent("");
          setIsDirty(false);
        }
      } else {
        throw new Error(res.message || "Failed to delete file");
      }
    } catch (err) {
      console.error("Failed to delete file:", err);
      alert("Xóa file thất bại.");
    }
  };

  const uploadFiles = async (uploadedFiles: File[]) => {
    try {
      const res = await latexService.uploadFiles(projectId, uploadedFiles);
      if (res.success && res.data) {
        await fetchFiles();
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Tải file lên thất bại.");
    }
  };

  const uploadZip = async (zipFile: File) => {
    try {
      const res = await latexService.uploadZip(projectId, zipFile);
      if (res.success && res.data) {
        await fetchFiles();
      }
    } catch (err) {
      console.error("ZIP Upload failed:", err);
      alert("Giải nén và tải ZIP thất bại.");
    }
  };

  return {
    files,
    activeFile,
    activeFileContent,
    isDirty,
    loadingFiles,
    loadingContent,
    selectFile,
    handleContentChange,
    saveActiveFile,
    deleteFile,
    uploadFiles,
    uploadZip,
    refreshFiles: fetchFiles,
  };
}
