"use client";

import { useState } from "react";
import { BookOpen, Check, Menu, MessageSquare } from "lucide-react";
import { CourseLearningSidebar } from "@/components/lms/student/CourseLearningSidebar";
import {
  StudentCourseContext,
  type StudentCourseContextValue,
} from "@/components/lms/student/StudentCourseContext";
import { PrevNextButtons } from "@/components/lms/student/learn/PrevNextButtons";
import { QuizQuestionCard } from "@/components/lms/student/quiz/QuizQuestionCard";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import type { Content, Course } from "@/types";
import { showcaseQuestion, showcaseSection } from "./courseFixtures";
import { ChatPreview } from "./ChatPreview";
import styles from "./bdchub.module.css";

type Props = {
  course: Course;
  contents: Content[];
  activeId: number;
  onSelect: (content: Content) => void;
};
export function LearningPreview({
  course,
  contents,
  activeId,
  onSelect,
}: Props) {
  const active =
    contents.find((content) => content.id === activeId) || contents[0];
  const [completed, setCompleted] = useState(new Set<number>());
  const [expanded, setExpanded] = useState(new Set([1]));
  const [sidebar, setSidebar] = useState(false);
  const [chat, setChat] = useState(false);
  const [answer, setAnswer] = useState<{ selected_option_id?: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const markComplete = async (id: number) =>
    setCompleted((current) => new Set([...current, id]));
  const context: StudentCourseContextValue = {
    course,
    courseId: 1,
    sections: [showcaseSection],
    activeContent: active,
    setActiveContent: (content) => {
      onSelect(content);
      setSidebar(false);
    },
    sectionContents: { 1: contents },
    loadSectionContents: () => {},
    loadingSection: {},
    coTeachers: [],
    completedIds: completed,
    handleMarkComplete: markComplete,
    markingComplete: false,
    progress: null,
    progressDetail: [],
    loadProgress: async () => {},
    expanded,
    toggleSection: (id) =>
      setExpanded((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    sidebarOpen: sidebar,
    setSidebarOpen: setSidebar,
  };
  return (
    <StudentCourseContext.Provider value={context}>
      <div className={styles.productSurface}>
        <div className={styles.learningBar}>
          <button
            className={styles.textButton}
            onClick={() => setSidebar(!sidebar)}
            aria-expanded={sidebar}
          >
            <Menu size={18} /> Nội dung
          </button>
          <strong>{course.title}</strong>
          <button
            className={styles.secondary}
            onClick={() => setChat(!chat)}
            aria-pressed={chat}
          >
            <MessageSquare size={17} /> AI Cowork
          </button>
        </div>
        <div
          className={`${styles.learningLayout} ${chat ? styles.withChat : ""}`}
        >
          <aside
            className={`${styles.learningSidebar} ${sidebar ? styles.openSidebar : ""}`}
          >
            <CourseLearningSidebar onClose={() => setSidebar(false)} />
          </aside>
          <div className={styles.lessonSurface}>
            <div className={styles.cardHeading}>
              <span className={styles.badge}>
                <BookOpen size={14} />{" "}
                {active.type === "QUIZ" ? "BÀI KIỂM TRA" : "BÀI HỌC"}
              </span>
              <span className={styles.muted}>
                {completed.size}/{contents.length} hoàn thành
              </span>
            </div>
            <h3>{active.title}</h3>
            {active.type === "QUIZ" ? (
              <>
                <QuizQuestionCard
                  question={showcaseQuestion}
                  currentIndex={0}
                  totalQuestions={1}
                  answer={answer}
                  onAnswerChange={(
                    _id,
                    value: { selected_option_id?: number },
                  ) => {
                    setAnswer(value);
                    setSubmitted(false);
                  }}
                  onOpenImageModal={() => {}}
                />
                <button
                  className={styles.primary}
                  disabled={!answer.selected_option_id}
                  onClick={() => {
                    setSubmitted(true);
                    if (answer.selected_option_id === 1)
                      void markComplete(active.id);
                  }}
                >
                  Nộp bài
                </button>
                {submitted && (
                  <p className={styles.status} role="status">
                    {answer.selected_option_id === 1
                      ? "Chính xác! Tác tử tối đa hóa phần thưởng tích lũy."
                      : "Hãy xem lại phần mục tiêu của tác tử và thử thêm một lần."}
                  </p>
                )}
              </>
            ) : (
              <>
                <MarkdownRenderer
                  content={String(active.metadata?.content || "")}
                />
                <button
                  className={styles.primary}
                  onClick={() => void markComplete(active.id)}
                  disabled={completed.has(active.id)}
                >
                  <Check size={16} />
                  {completed.has(active.id)
                    ? "Đã hoàn thành"
                    : "Đánh dấu hoàn thành"}
                </button>
              </>
            )}
            <PrevNextButtons
              sections={[showcaseSection]}
              sectionContents={{ 1: contents }}
              activeContent={active}
              onSelect={onSelect}
            />
          </div>
          {chat && (
            <aside className={styles.learningChat}>
              <ChatPreview
                topic={
                  active.id === 3 ? "td" : active.id === 2 ? "reward" : "agent"
                }
                compact
              />
            </aside>
          )}
        </div>
      </div>
    </StudentCourseContext.Provider>
  );
}
