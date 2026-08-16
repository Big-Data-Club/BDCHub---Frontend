"use client";

import React, { Dispatch, SetStateAction } from "react";
import dynamic from "next/dynamic";
import { SectionModal } from "@/components/lms/teacher/SectionModal";
import { Content, Section } from "@/types";

// Dynamic imports
const ContentViewer = dynamic(
  () => import("@/components/lms/student/ContentViewer"),
  { ssr: false }
);

const ContentModal = dynamic(
  () => import("@/components/lms/teacher/ContentModal").then((m) => ({ default: m.default })),
  { ssr: false }
);

const EditContentModal = dynamic(
  () => import("@/components/lms/teacher/EditContentModal").then((m) => ({ default: m.default })),
  { ssr: false }
);

const BulkUploadModal = dynamic(
  () => import("@/components/lms/teacher/upload/BulkUploadModal").then((m) => ({ default: m.default })),
  { ssr: false }
);

const CourseMaterialRoutingModal = dynamic(
  () => import("@/components/lms/teacher/upload/CourseMaterialRoutingModal"),
  { ssr: false }
);

const GenerateMicroLessonsModal = dynamic(
  () => import("@/components/lms/teacher/micro/GenerateMicroLessonsModal").then((m) => ({ default: m.GenerateMicroLessonsModal })),
  { ssr: false }
);

const MicroLessonsDrawer = dynamic(
  () => import("@/components/lms/teacher/micro/MicroLessonsDrawer").then((m) => ({ default: m.MicroLessonsDrawer })),
  { ssr: false }
);

const MicroLessonHistoryModal = dynamic(
  () => import("@/components/lms/teacher/micro/MicroLessonHistoryModal").then((m) => ({ default: m.MicroLessonHistoryModal })),
  { ssr: false }
);

const GenerateMicroQuizzesModal = dynamic(
  () => import("@/components/lms/teacher/micro/GenerateMicroQuizzesModal").then((m) => ({ default: m.GenerateMicroQuizzesModal })),
  { ssr: false }
);

const MicroQuizzesDrawer = dynamic(
  () => import("@/components/lms/teacher/micro/MicroQuizzesDrawer").then((m) => ({ default: m.MicroQuizzesDrawer })),
  { ssr: false }
);

const MicroQuizHistoryModal = dynamic(
  () => import("@/components/lms/teacher/micro/MicroQuizHistoryModal").then((m) => ({ default: m.MicroQuizHistoryModal })),
  { ssr: false }
);

const GenerateSectionOverviewModal = dynamic(
  () => import("@/components/lms/teacher/overview/GenerateSectionOverviewModal").then((m) => ({ default: m.GenerateSectionOverviewModal })),
  { ssr: false }
);

const SectionOverviewDrawer = dynamic(
  () => import("@/components/lms/teacher/overview/SectionOverviewDrawer").then((m) => ({ default: m.SectionOverviewDrawer })),
  { ssr: false }
);

const SectionOverviewHistoryModal = dynamic(
  () => import("@/components/lms/teacher/overview/SectionOverviewHistoryModal").then((m) => ({ default: m.SectionOverviewHistoryModal })),
  { ssr: false }
);

interface ContentTabModalsProps {
  courseId: number;
  sections: Section[];
  sectionContents: Record<number, Content[]>;
  selectedSectionId: number | null;
  editingSection: Section | null;
  editingContent: Content | null;
  viewingContent: Content | null;
  showSectionModal: boolean;
  showContentModal: boolean;
  showBulkModal: boolean;
  showCourseRoutingModal: boolean;
  showEditContentModal: boolean;
  showContentViewer: boolean;
  showMicroModal: boolean;
  showMicroHistoryModal: boolean;
  microPresetContentId?: number;
  microPresetSectionId?: number;
  activeMicroJobId: number | null;
  showQuizModal: boolean;
  showQuizHistoryModal: boolean;
  quizPresetContentId?: number;
  quizPresetSectionId?: number;
  activeQuizJobId: number | null;
  showOverviewModal: boolean;
  showOverviewHistoryModal: boolean;
  overviewSectionId: number | null;
  overviewSectionTitle: string;
  activeOverviewJobId: number | null;

  // Handlers & State setters
  setShowSectionModal: (show: boolean) => void;
  setEditingSection: (sec: Section | null) => void;
  setShowContentModal: (show: boolean) => void;
  setSelectedSectionId: (id: number | null) => void;
  setShowBulkModal: (show: boolean) => void;
  setShowCourseRoutingModal: (show: boolean) => void;
  setShowEditContentModal: (show: boolean) => void;
  setEditingContent: (c: Content | null) => void;
  setShowContentViewer: (show: boolean) => void;
  setViewingContent: (c: Content | null) => void;
  setShowMicroModal: (show: boolean) => void;
  setActiveMicroJobId: (id: number | null) => void;
  setShowMicroHistoryModal: (show: boolean) => void;
  setShowQuizModal: (show: boolean) => void;
  setActiveQuizJobId: (id: number | null) => void;
  setShowQuizHistoryModal: (show: boolean) => void;
  setShowOverviewModal: (show: boolean) => void;
  setActiveOverviewJobId: (id: number | null) => void;
  setShowOverviewHistoryModal: (show: boolean) => void;
  setExpanded: Dispatch<SetStateAction<Set<number>>>;
  onSectionsChange: Dispatch<SetStateAction<Section[]>>;
  onSectionsRefetch: () => void;
  reloadSectionContent: (sectionId: number) => Promise<void>;
  setSectionContents: Dispatch<SetStateAction<Record<number, Content[]>>>;
}

export function ContentTabModals({
  courseId,
  sections,
  sectionContents,
  selectedSectionId,
  editingSection,
  editingContent,
  viewingContent,
  showSectionModal,
  showContentModal,
  showBulkModal,
  showCourseRoutingModal,
  showEditContentModal,
  showContentViewer,
  showMicroModal,
  showMicroHistoryModal,
  microPresetContentId,
  microPresetSectionId,
  activeMicroJobId,
  showQuizModal,
  showQuizHistoryModal,
  quizPresetContentId,
  quizPresetSectionId,
  activeQuizJobId,
  showOverviewModal,
  showOverviewHistoryModal,
  overviewSectionId,
  overviewSectionTitle,
  activeOverviewJobId,

  setShowSectionModal,
  setEditingSection,
  setShowContentModal,
  setSelectedSectionId,
  setShowBulkModal,
  setShowCourseRoutingModal,
  setShowEditContentModal,
  setEditingContent,
  setShowContentViewer,
  setViewingContent,
  setShowMicroModal,
  setActiveMicroJobId,
  setShowMicroHistoryModal,
  setShowQuizModal,
  setActiveQuizJobId,
  setShowQuizHistoryModal,
  setShowOverviewModal,
  setActiveOverviewJobId,
  setShowOverviewHistoryModal,
  setExpanded,
  onSectionsChange,
  onSectionsRefetch,
  reloadSectionContent,
  setSectionContents,
}: ContentTabModalsProps) {
  return (
    <>
      {showCourseRoutingModal && (
        <CourseMaterialRoutingModal
          courseId={courseId}
          sections={sections}
          onClose={() => setShowCourseRoutingModal(false)}
          onSuccess={() => {
            setShowCourseRoutingModal(false);
            onSectionsRefetch();
            Object.keys(sectionContents).forEach((id) =>
              reloadSectionContent(Number(id))
            );
          }}
        />
      )}

      {showSectionModal && (
        <SectionModal
          courseId={courseId}
          section={editingSection}
          existingSections={sections}
          onClose={() => {
            setShowSectionModal(false);
            setEditingSection(null);
          }}
          onSuccess={(savedSection) => {
            setShowSectionModal(false);
            setEditingSection(null);
            setExpanded((prev) => new Set(prev).add(savedSection.id));
            onSectionsChange((prev) => {
              const exists = prev.some(
                (section) => section.id === savedSection.id
              );
              const next = exists
                ? prev.map((section) =>
                    section.id === savedSection.id ? savedSection : section
                  )
                : [...prev, savedSection];
              return [...next].sort((a, b) => a.order_index - b.order_index);
            });
          }}
        />
      )}

      {showContentModal && selectedSectionId && (
        <ContentModal
          sectionId={selectedSectionId}
          existingContents={sectionContents[selectedSectionId] ?? []}
          onClose={() => {
            setShowContentModal(false);
            setSelectedSectionId(null);
          }}
          onSuccess={(createdContent) => {
            setShowContentModal(false);
            if (
              selectedSectionId &&
              Object.hasOwn(sectionContents, selectedSectionId)
            ) {
              setSectionContents((prev) => ({
                ...prev,
                [selectedSectionId]: [
                  ...(prev[selectedSectionId] ?? []),
                  createdContent,
                ].sort((a, b) => a.order_index - b.order_index),
              }));
            } else if (selectedSectionId) {
              reloadSectionContent(selectedSectionId);
            }
            setSelectedSectionId(null);
          }}
        />
      )}

      {showBulkModal && selectedSectionId && (
        <BulkUploadModal
          sectionId={selectedSectionId}
          onClose={() => {
            setShowBulkModal(false);
            setSelectedSectionId(null);
          }}
          onSuccess={() => {
            setShowBulkModal(false);
            if (selectedSectionId) reloadSectionContent(selectedSectionId);
            setSelectedSectionId(null);
          }}
        />
      )}

      {showEditContentModal && editingContent && (
        <EditContentModal
          content={editingContent}
          onClose={() => {
            setShowEditContentModal(false);
            setEditingContent(null);
          }}
          onSuccess={(updatedContent) => {
            setShowEditContentModal(false);
            setSectionContents((prev) => ({
              ...prev,
              [updatedContent.section_id]: (
                prev[updatedContent.section_id] ?? []
              ).map((content) =>
                content.id === updatedContent.id ? updatedContent : content
              ),
            }));
            setEditingContent(null);
          }}
        />
      )}

      {showMicroModal && (
        <GenerateMicroLessonsModal
          courseId={courseId}
          sections={sections}
          presetContentId={microPresetContentId}
          presetSectionId={microPresetSectionId}
          onClose={() => setShowMicroModal(false)}
          onJobCreated={(jobId) => {
            setShowMicroModal(false);
            setActiveMicroJobId(jobId);
          }}
        />
      )}

      {showMicroHistoryModal && (
        <MicroLessonHistoryModal
          courseId={courseId}
          onClose={() => setShowMicroHistoryModal(false)}
          onSelectJob={(jobId) => {
            setShowMicroHistoryModal(false);
            setActiveMicroJobId(jobId);
          }}
        />
      )}

      {activeMicroJobId !== null && (
        <MicroLessonsDrawer
          jobId={activeMicroJobId}
          sections={sections}
          onClose={() => setActiveMicroJobId(null)}
          onPublished={(sectionId) => reloadSectionContent(sectionId)}
        />
      )}

      {showQuizModal && (
        <GenerateMicroQuizzesModal
          courseId={courseId}
          sections={sections}
          presetContentId={quizPresetContentId}
          presetSectionId={quizPresetSectionId}
          onClose={() => setShowQuizModal(false)}
          onJobCreated={(jobId) => {
            setShowQuizModal(false);
            setActiveQuizJobId(jobId);
          }}
        />
      )}

      {activeQuizJobId !== null && (
        <MicroQuizzesDrawer
          jobId={activeQuizJobId}
          sections={sections}
          onClose={() => setActiveQuizJobId(null)}
          onPublished={(sectionId) => reloadSectionContent(sectionId)}
        />
      )}

      {showQuizHistoryModal && (
        <MicroQuizHistoryModal
          courseId={courseId}
          onClose={() => setShowQuizHistoryModal(false)}
          onSelectJob={(jobId) => {
            setShowQuizHistoryModal(false);
            setActiveQuizJobId(jobId);
          }}
        />
      )}

      {/* ── Section Overview modals & drawer ── */}
      {showOverviewModal && overviewSectionId !== null && (
        <GenerateSectionOverviewModal
          courseId={courseId}
          sectionId={overviewSectionId}
          sectionTitle={overviewSectionTitle}
          onClose={() => setShowOverviewModal(false)}
          onJobCreated={(jobId) => {
            setShowOverviewModal(false);
            setActiveOverviewJobId(jobId);
          }}
        />
      )}

      {showOverviewHistoryModal && overviewSectionId !== null && (
        <SectionOverviewHistoryModal
          courseId={courseId}
          sectionId={overviewSectionId}
          sectionTitle={overviewSectionTitle}
          onClose={() => setShowOverviewHistoryModal(false)}
          onSelectJob={(jobId) => {
            setShowOverviewHistoryModal(false);
            setActiveOverviewJobId(jobId);
          }}
        />
      )}

      {activeOverviewJobId !== null && overviewSectionId !== null && (
        <SectionOverviewDrawer
          jobId={activeOverviewJobId}
          sectionTitle={overviewSectionTitle}
          sections={sections}
          onClose={() => setActiveOverviewJobId(null)}
          onLessonPublished={(sectionId) => reloadSectionContent(sectionId)}
          onQuizPublished={(sectionId) => reloadSectionContent(sectionId)}
        />
      )}

      {showContentViewer && viewingContent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-50">
                {viewingContent.title}
              </h3>
              <button
                onClick={() => {
                  setShowContentViewer(false);
                  setViewingContent(null);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <ContentViewer content={viewingContent} userRole="TEACHER" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
