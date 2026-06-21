"use client";

import React, { useState, useEffect, use } from "react";
import { useLatexEditor } from "@/hooks/useLatexEditor";
import { useCompilation } from "@/hooks/useCompilation";
import { useCollaborators } from "@/hooks/useCollaborators";
import { EditorToolbar } from "@/components/bdctex/EditorToolbar";
import { FileTree } from "@/components/bdctex/FileTree";
import { TexEditor } from "@/components/bdctex/TexEditor";
import { PdfViewer } from "@/components/bdctex/PdfViewer";
import { CompileLogPanel } from "@/components/bdctex/CompileLogPanel";
import { FileUploadModal } from "@/components/bdctex/FileUploadModal";
import { ShareProjectModal } from "@/components/bdctex/ShareProjectModal";
import { CommentPanel } from "@/components/bdctex/CommentPanel";
import { latexService } from "@/services/latexService";
import type { LatexProject } from "@/types";

interface EditorPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

interface TextSelection {
  start: number;
  end: number;
  text: string;
}

export default function LatexEditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const projectId = parseInt(resolvedParams.projectId, 10);

  const [project, setProject] = useState<LatexProject | null>(null);
  const [compiler, setCompiler] = useState<"pdflatex" | "xelatex" | "lualatex">("pdflatex");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [textSelection, setTextSelection] = useState<TextSelection | null>(null);

  const userRole = project?.user_role;
  const canEdit = userRole === "owner" || userRole === "editor";
  const canCompile = canEdit;

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

  const { collaborators } = useCollaborators(projectId, userRole);

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
    if (!canEdit) return;
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
    if (!canCompile) return;
    if (isDirty) {
      await saveActiveFile();
    }
    await compileProject(projectId, compiler);
  };

  // Auto-open comment panel when text is selected
  const handleTextSelect = (selection: TextSelection | null) => {
    setTextSelection(selection);
    if (selection && !commentsOpen) {
      setCommentsOpen(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Toolbar */}
      <EditorToolbar
        projectTitle={project?.title || "Đang tải dự án..."}
        compiler={compiler}
        isDirty={isDirty}
        compiling={compiling}
        userRole={userRole}
        collaborators={collaborators}
        commentsOpen={commentsOpen}
        onSave={saveActiveFile}
        onCompile={handleCompile}
        onCompilerChange={handleCompilerChange}
        onShareClick={() => setShareModalOpen(true)}
        onToggleComments={() => setCommentsOpen((prev) => !prev)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Files Tree */}
        <FileTree
          files={files}
          activeFile={activeFile}
          onSelect={selectFile}
          onDelete={canEdit ? deleteFile : undefined}
          onUploadClick={canEdit ? () => setUploadModalOpen(true) : undefined}
        />

        {/* Center & Bottom: Code Editor and Console Logs */}
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          <TexEditor
            file={activeFile}
            content={activeFileContent}
            isDirty={isDirty}
            loading={loadingContent || loadingFiles}
            userRole={userRole}
            onChange={handleContentChange}
            onSave={saveActiveFile}
            onTextSelect={handleTextSelect}
          />
          <CompileLogPanel log={log} errorMsg={errorMsg} onClear={clearLogs} />
        </div>

        {/* Comments Panel (toggleable) */}
        {commentsOpen && (
          <CommentPanel
            projectId={projectId}
            activeFile={activeFile}
            userRole={userRole}
            textSelection={textSelection}
            onClearSelection={() => setTextSelection(null)}
            onClose={() => setCommentsOpen(false)}
          />
        )}

        {/* Right: PDF Viewer */}
        <PdfViewer pdfUrl={pdfUrl} compiling={compiling} errorMsg={errorMsg} />
      </div>

      {/* Upload files modal (editor/owner only) */}
      {canEdit && (
        <FileUploadModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUploadFiles={uploadFiles}
          onUploadZip={uploadZip}
        />
      )}

      {/* Share project modal (owner only) */}
      {userRole === "owner" && shareModalOpen && (
        <ShareProjectModal
          projectId={projectId}
          projectTitle={project?.title || ""}
          ownerEmail={""}
          userRole={userRole}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
}
