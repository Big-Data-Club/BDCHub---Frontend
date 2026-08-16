"use client";

/**
 * ContentTab
 *
 * Manages the full section → content tree for a course.
 * Modularized into:
 * - ContentTabHeader
 * - SectionItemCard & ContentRowItem
 * - ContentTabModals
 */

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Plus, FileText } from "lucide-react";
import lmsService from "@/services/lmsService";
import { AIIndexPollerProvider } from "@/hooks/useAIIndexPoller";
import { Alert, EmptyState, PrimaryBtn } from "@/components/lms/shared";
import { Content, Section } from "@/types";

import { ContentTabHeader } from "./ContentTabHeader";
import { SectionItemCard } from "./SectionItemCard";
import { ContentTabModals } from "./ContentTabModals";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContentTabProps {
  courseId: number;
  sections: Section[];
  onSectionsChange: Dispatch<SetStateAction<Section[]>>;
  onSectionsRefetch: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ContentTab({ courseId, sections, onSectionsChange, onSectionsRefetch }: ContentTabProps) {
  const [expanded, setExpanded]   = useState<Set<number>>(new Set());
  const [sectionContents, setSectionContents] = useState<Record<number, Content[]>>({});
  const [loadingContent, setLoadingContent]   = useState<Record<number, boolean>>({});

  // Local sections state for drag & drop preview
  const [localSections, setLocalSections] = useState<Section[]>([]);
  const [draggedSecIndex, setDraggedSecIndex] = useState<number | null>(null);
  const [canDragSection, setCanDragSection] = useState(false);

  const [draggedContentInfo, setDraggedContentInfo] = useState<{
    sectionId: number;
    index: number;
  } | null>(null);
  const [canDragContent, setCanDragContent] = useState<number | null>(null);

  // ── Content loading ─────────────────────────────────────────────────────────

  const reloadSectionContent = useCallback(async (sectionId: number) => {
    setLoadingContent(prev => ({ ...prev, [sectionId]: true }));
    try {
      const res = await lmsService.listContent(sectionId);
      setSectionContents(prev => ({ ...prev, [sectionId]: res?.data ?? [] }));
    } finally {
      setLoadingContent(prev => ({ ...prev, [sectionId]: false }));
    }
  }, []);

  const loadContents = useCallback(async (sectionId: number) => {
    if (sectionContents[sectionId]) return;
    setLoadingContent(prev => ({ ...prev, [sectionId]: true }));
    try {
      const res = await lmsService.listContent(sectionId);
      setSectionContents(prev => ({ ...prev, [sectionId]: res?.data ?? [] }));
    } finally {
      setLoadingContent(prev => ({ ...prev, [sectionId]: false }));
    }
  }, [sectionContents]);

  // Initial expansion & section load sync: expand all when sections are loaded
  useEffect(() => {
    if (sections.length > 0) {
      setLocalSections(sections);
      setExpanded(prev => {
        if (prev.size === 0) {
          const allIds = new Set(sections.map(s => s.id));
          sections.forEach(s => {
            lmsService.listContent(s.id).then(res => {
              setSectionContents(pc => ({ ...pc, [s.id]: res?.data ?? [] }));
            }).catch(() => {});
          });
          return allIds;
        }
        return prev;
      });
    }
  }, [sections]);

  const [reorderError, setReorderError] = useState<string | null>(null);

  // ── Drag & Drop Handlers for Sections ──────────────────────────────────────

  const handleSectionDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedSecIndex(index);
  }, []);

  const handleSectionDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedSecIndex(prevDragged => {
      if (prevDragged === null || prevDragged === index) return prevDragged;
      setLocalSections(prevSections => {
        const updated = [...prevSections];
        const [draggedItem] = updated.splice(prevDragged, 1);
        updated.splice(index, 0, draggedItem);
        return updated;
      });
      return index;
    });
  }, []);

  const handleSectionDragEnd = useCallback(async () => {
    setDraggedSecIndex(null);
    setCanDragSection(false);

    try {
      setReorderError(null);
      const ids = localSections.map(s => s.id);
      await lmsService.reorderSections(courseId, ids);
      const reorderedSections = localSections.map((section, index) => ({
        ...section,
        order_index: index,
      }));
      setLocalSections(reorderedSections);
      onSectionsChange(reorderedSections);
    } catch (err) {
      console.error("Reorder sections failed:", err);
      setReorderError("Không thể thay đổi thứ tự chương. Đang khôi phục lại...");
      setLocalSections(sections);
      setTimeout(() => setReorderError(null), 4000);
    }
  }, [courseId, localSections, onSectionsChange, sections]);

  // ── Drag & Drop Handlers for Contents ──────────────────────────────────────

  const handleContentDragStart = useCallback((e: React.DragEvent, sectionId: number, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedContentInfo({ sectionId, index });
  }, []);

  const handleContentDragOver = useCallback((e: React.DragEvent, sectionId: number, index: number) => {
    e.preventDefault();
    setDraggedContentInfo(prevInfo => {
      if (!prevInfo || prevInfo.sectionId !== sectionId || prevInfo.index === index) return prevInfo;
      setSectionContents(prevContents => {
        const sectionItems = [...(prevContents[sectionId] ?? [])];
        const [draggedItem] = sectionItems.splice(prevInfo.index, 1);
        sectionItems.splice(index, 0, draggedItem);
        return { ...prevContents, [sectionId]: sectionItems };
      });
      return { sectionId, index };
    });
  }, []);

  const handleContentDragEnd = useCallback(async (sectionId: number) => {
    setDraggedContentInfo(null);
    setCanDragContent(null);

    const currentItems = sectionContents[sectionId] ?? [];
    try {
      setReorderError(null);
      const ids = currentItems.map(c => c.id);
      await lmsService.reorderContents(sectionId, ids);
      setSectionContents(prev => ({
        ...prev,
        [sectionId]: currentItems.map((content, index) => ({
          ...content,
          order_index: index,
        })),
      }));
    } catch (err) {
      console.error("Reorder contents failed:", err);
      setReorderError("Không thể thay đổi thứ tự bài học. Đang tải lại...");
      await reloadSectionContent(sectionId);
      setTimeout(() => setReorderError(null), 4000);
    }
  }, [sectionContents, reloadSectionContent]);

  // Modal state
  const [showSectionModal, setShowSectionModal]       = useState(false);
  const [editingSection, setEditingSection]           = useState<Section | null>(null);
  const [showContentModal, setShowContentModal]       = useState(false);
  const [showBulkModal, setShowBulkModal]             = useState(false);
  const [showCourseRoutingModal, setShowCourseRoutingModal] = useState(false);
  const [showEditContentModal, setShowEditContentModal] = useState(false);
  const [showContentViewer, setShowContentViewer]     = useState(false);
  const [selectedSectionId, setSelectedSectionId]     = useState<number | null>(null);
  const [editingContent, setEditingContent]           = useState<Content | null>(null);
  const [viewingContent, setViewingContent]           = useState<Content | null>(null);

  // Deletion in-progress
  const [deletingSection, setDeletingSection] = useState<number | null>(null);
  const [deletingContent, setDeletingContent] = useState<number | null>(null);

  // Micro-lesson modal / drawer state
  const [showMicroModal, setShowMicroModal]       = useState(false);
  const [showMicroHistoryModal, setShowMicroHistoryModal] = useState(false);
  const [microPresetContentId, setMicroPresetContentId] = useState<number | undefined>();
  const [microPresetSectionId, setMicroPresetSectionId] = useState<number | undefined>();
  const [activeMicroJobId, setActiveMicroJobId]   = useState<number | null>(null);

  // Micro-quiz modal / drawer state
  const [showQuizModal, setShowQuizModal]             = useState(false);
  const [showQuizHistoryModal, setShowQuizHistoryModal] = useState(false);
  const [quizPresetContentId, setQuizPresetContentId] = useState<number | undefined>();
  const [quizPresetSectionId, setQuizPresetSectionId] = useState<number | undefined>();
  const [activeQuizJobId, setActiveQuizJobId]         = useState<number | null>(null);

  // Section overview modal / drawer state
  const [showOverviewModal, setShowOverviewModal]       = useState(false);
  const [showOverviewHistoryModal, setShowOverviewHistoryModal] = useState(false);
  const [overviewSectionId, setOverviewSectionId]       = useState<number | null>(null);
  const [overviewSectionTitle, setOverviewSectionTitle] = useState("");
  const [activeOverviewJobId, setActiveOverviewJobId]   = useState<number | null>(null);

  // ── Toggle section expand ───────────────────────────────────────────────────

  const toggle = (id: number) => {
    setExpanded(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); } else { n.add(id); loadContents(id); }
      return n;
    });
  };

  // ── Delete handlers ─────────────────────────────────────────────────────────

  const deleteSection = async (id: number) => {
    if (!confirm("Xóa chương này? Tất cả nội dung bên trong cũng sẽ bị xóa.")) return;
    setDeletingSection(id);
    try {
      await lmsService.deleteSection(id);
      onSectionsChange(prev => prev.filter(section => section.id !== id));
      setSectionContents(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setExpanded(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    finally { setDeletingSection(null); }
  };

  const deleteContent = async (contentId: number, sectionId: number) => {
    if (!confirm("Xóa nội dung này?")) return;
    setDeletingContent(contentId);
    try {
      await lmsService.deleteContent(contentId);
      setSectionContents(prev => ({
        ...prev,
        [sectionId]: (prev[sectionId] ?? []).filter(c => c.id !== contentId),
      }));
    } finally { setDeletingContent(null); }
  };

  // ── onIndexed callback for the batch poller ─────────────────────────────────
  const handleContentIndexed = useCallback((contentId: number) => {
    for (const [sectionId, contents] of Object.entries(sectionContents)) {
      if ((contents as Content[]).some(c => c.id === contentId)) {
        reloadSectionContent(Number(sectionId));
        break;
      }
    }
  }, [sectionContents, reloadSectionContent]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AIIndexPollerProvider onIndexed={handleContentIndexed}>
      <div className="space-y-4">
        {reorderError && (
          <Alert type="error">
            {reorderError}
          </Alert>
        )}

        {/* Top action bar */}
        <ContentTabHeader
          sectionsCount={sections.length}
          hasSections={sections.length > 0}
          onExpandAll={() => {
            const allIds = new Set(sections.map(s => s.id));
            setExpanded(allIds);
            sections.forEach(s => loadContents(s.id));
          }}
          onCollapseAll={() => setExpanded(new Set())}
          onOpenAddSection={() => {
            setEditingSection(null);
            setShowSectionModal(true);
          }}
          onOpenMicroModal={() => {
            setMicroPresetContentId(undefined);
            setMicroPresetSectionId(undefined);
            setShowMicroModal(true);
          }}
          onOpenQuizModal={() => {
            setQuizPresetContentId(undefined);
            setQuizPresetSectionId(undefined);
            setShowQuizModal(true);
          }}
          onOpenCourseRoutingModal={() => setShowCourseRoutingModal(true)}
          onOpenMicroHistoryModal={() => setShowMicroHistoryModal(true)}
          onOpenQuizHistoryModal={() => setShowQuizHistoryModal(true)}
        />

        {/* Empty state or Sections list */}
        {sections.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-10 h-10" />}
            title="Chưa có chương nào"
            description="Tạo chương đầu tiên để bắt đầu thêm nội dung."
            action={
              <PrimaryBtn
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowSectionModal(true)}
              >
                Tạo chương đầu tiên
              </PrimaryBtn>
            }
          />
        ) : (
          <div className="space-y-3">
            {localSections.map((sec, i) => (
              <SectionItemCard
                key={sec.id}
                section={sec}
                index={i}
                isExpanded={expanded.has(sec.id)}
                contents={sectionContents[sec.id] ?? []}
                isLoadingContents={Boolean(loadingContent[sec.id])}
                isDraggingSection={draggedSecIndex === i}
                canDragSection={canDragSection}
                deletingSectionId={deletingSection}
                draggedContentInfo={draggedContentInfo}
                canDragContentId={canDragContent}
                deletingContentId={deletingContent}
                onToggleExpand={() => toggle(sec.id)}
                onSectionDragStart={(e) => handleSectionDragStart(e, i)}
                onSectionDragOver={(e) => handleSectionDragOver(e, i)}
                onSectionDragEnd={handleSectionDragEnd}
                onMouseDownSectionDrag={() => setCanDragSection(true)}
                onMouseUpSectionDrag={() => setCanDragSection(false)}
                onAddContent={() => {
                  setSelectedSectionId(sec.id);
                  setShowContentModal(true);
                }}
                onBulkUpload={() => {
                  setSelectedSectionId(sec.id);
                  setShowBulkModal(true);
                }}
                onEditSection={() => {
                  setEditingSection(sec);
                  setShowSectionModal(true);
                }}
                onOpenSectionOverview={() => {
                  setOverviewSectionId(sec.id);
                  setOverviewSectionTitle(sec.title);
                  setShowOverviewModal(true);
                }}
                onOpenOverviewHistory={() => {
                  setOverviewSectionId(sec.id);
                  setOverviewSectionTitle(sec.title);
                  setShowOverviewHistoryModal(true);
                }}
                onDeleteSection={() => deleteSection(sec.id)}
                onContentDragStart={(e, ci) => handleContentDragStart(e, sec.id, ci)}
                onContentDragOver={(e, ci) => handleContentDragOver(e, sec.id, ci)}
                onContentDragEnd={() => handleContentDragEnd(sec.id)}
                onMouseDownContentDrag={(cid) => setCanDragContent(cid)}
                onMouseUpContentDrag={() => setCanDragContent(null)}
                onGenerateMicroLesson={(cid) => {
                  setMicroPresetContentId(cid);
                  setMicroPresetSectionId(sec.id);
                  setShowMicroModal(true);
                }}
                onGenerateMicroQuiz={(cid) => {
                  setQuizPresetContentId(cid);
                  setQuizPresetSectionId(sec.id);
                  setShowQuizModal(true);
                }}
                onViewContent={(c) => {
                  setViewingContent(c);
                  setShowContentViewer(true);
                }}
                onEditContent={(c) => {
                  setEditingContent(c);
                  setShowEditContentModal(true);
                }}
                onDeleteContent={(cid) => deleteContent(cid, sec.id)}
              />
            ))}
          </div>
        )}

        {/* Dynamic Modals Orchestrator */}
        <ContentTabModals
          courseId={courseId}
          sections={sections}
          sectionContents={sectionContents}
          selectedSectionId={selectedSectionId}
          editingSection={editingSection}
          editingContent={editingContent}
          viewingContent={viewingContent}
          showSectionModal={showSectionModal}
          showContentModal={showContentModal}
          showBulkModal={showBulkModal}
          showCourseRoutingModal={showCourseRoutingModal}
          showEditContentModal={showEditContentModal}
          showContentViewer={showContentViewer}
          showMicroModal={showMicroModal}
          showMicroHistoryModal={showMicroHistoryModal}
          microPresetContentId={microPresetContentId}
          microPresetSectionId={microPresetSectionId}
          activeMicroJobId={activeMicroJobId}
          showQuizModal={showQuizModal}
          showQuizHistoryModal={showQuizHistoryModal}
          quizPresetContentId={quizPresetContentId}
          quizPresetSectionId={quizPresetSectionId}
          activeQuizJobId={activeQuizJobId}
          showOverviewModal={showOverviewModal}
          showOverviewHistoryModal={showOverviewHistoryModal}
          overviewSectionId={overviewSectionId}
          overviewSectionTitle={overviewSectionTitle}
          activeOverviewJobId={activeOverviewJobId}
          setShowSectionModal={setShowSectionModal}
          setEditingSection={setEditingSection}
          setShowContentModal={setShowContentModal}
          setSelectedSectionId={setSelectedSectionId}
          setShowBulkModal={setShowBulkModal}
          setShowCourseRoutingModal={setShowCourseRoutingModal}
          setShowEditContentModal={setShowEditContentModal}
          setEditingContent={setEditingContent}
          setShowContentViewer={setShowContentViewer}
          setViewingContent={setViewingContent}
          setShowMicroModal={setShowMicroModal}
          setActiveMicroJobId={setActiveMicroJobId}
          setShowMicroHistoryModal={setShowMicroHistoryModal}
          setShowQuizModal={setShowQuizModal}
          setActiveQuizJobId={setActiveQuizJobId}
          setShowQuizHistoryModal={setShowQuizHistoryModal}
          setShowOverviewModal={setShowOverviewModal}
          setActiveOverviewJobId={setActiveOverviewJobId}
          setShowOverviewHistoryModal={setShowOverviewHistoryModal}
          setExpanded={setExpanded}
          onSectionsChange={onSectionsChange}
          onSectionsRefetch={onSectionsRefetch}
          reloadSectionContent={reloadSectionContent}
          setSectionContents={setSectionContents}
        />
      </div>
    </AIIndexPollerProvider>
  );
}
