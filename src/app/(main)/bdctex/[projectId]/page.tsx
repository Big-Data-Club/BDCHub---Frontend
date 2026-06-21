"use client";

import React, { useState, useEffect, use } from "react";
import { useLatexEditor } from "@/hooks/useLatexEditor";
import { useCompilation } from "@/hooks/useCompilation";
import { EditorToolbar } from "@/components/bdctex/EditorToolbar";
import { FileTree } from "@/components/bdctex/FileTree";
import { TexEditor } from "@/components/bdctex/TexEditor";
import { PdfViewer } from "@/components/bdctex/PdfViewer";
import { CompileLogPanel } from "@/components/bdctex/CompileLogPanel";
import { FileUploadModal } from "@/components/bdctex/FileUploadModal";
import { latexService } from "@/services/latexService";
import type { LatexProject } from "@/types";

interface EditorPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function LatexEditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const projectId = parseInt(resolvedParams.projectId, 10);

  const [project, setProject] = useState<LatexProject | null>(null);
  const [compiler, setCompiler] = useState<"pdflatex" | "xelatex" | "lualatex">("pdflatex");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const {
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
  } = useLatexEditor(projectId);

  const {
    compiling,
    pdfUrl,
    log,
    errorMsg,
    compileProject,
    clearLogs,
  } = useCompilation();

  // Load project details
  useEffect(() => {
    async function loadProject() {
      try {
        const res = await latexService.getProject(projectId);
        if (res.success && res.data) {
          setProject(res.data);
          setCompiler(res.data.compiler);
        }
      } catch (err) {
        console.error("Failed to load project details:", err);
      }
    }
    loadProject();
  }, [projectId]);

  const handleCompilerChange = async (newCompiler: "pdflatex" | "xelatex" | "lualatex") => {
    setCompiler(newCompiler);
    try {
      const res = await latexService.updateProject(projectId, { compiler: newCompiler });
      if (res.success && project) {
        setProject({ ...project, compiler: newCompiler });
      }
    } catch (err) {
      console.error("Failed to update project compiler:", err);
    }
  };

  const handleCompile = async () => {
    // Save active file changes first if dirty
    if (isDirty) {
      await saveActiveFile();
    }
    await compileProject(projectId, compiler);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Toolbar */}
      <EditorToolbar
        projectTitle={project?.title || "Đang tải dự án..."}
        compiler={compiler}
        isDirty={isDirty}
        compiling={compiling}
        onSave={saveActiveFile}
        onCompile={handleCompile}
        onCompilerChange={handleCompilerChange}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Files Tree */}
        <FileTree
          files={files}
          activeFile={activeFile}
          onSelect={selectFile}
          onDelete={deleteFile}
          onUploadClick={() => setUploadModalOpen(true)}
        />

        {/* Center & Bottom: Code Editor and Console Logs */}
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          <TexEditor
            file={activeFile}
            content={activeFileContent}
            isDirty={isDirty}
            loading={loadingContent || loadingFiles}
            onChange={handleContentChange}
            onSave={saveActiveFile}
          />
          <CompileLogPanel log={log} errorMsg={errorMsg} onClear={clearLogs} />
        </div>

        {/* Right: PDF Viewer */}
        <PdfViewer pdfUrl={pdfUrl} compiling={compiling} errorMsg={errorMsg} />
      </div>

      {/* Upload files modal */}
      <FileUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadFiles={uploadFiles}
        onUploadZip={uploadZip}
      />
    </div>
  );
}
