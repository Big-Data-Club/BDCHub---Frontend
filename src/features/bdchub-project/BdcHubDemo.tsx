"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { CoursePreview } from "./CoursePreview";
import { showcaseCourse, showcaseContents } from "./courseFixtures";
import {
  ArrowRight,
  BookOpen,
  GitBranch,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { learningTopics, topicEdges, type TopicId } from "./content";
import styles from "./bdchub.module.css";

type View = "courses" | "learn" | "graph" | "chat";
const views = [
  { id: "courses", label: "Quản lý khóa học", icon: BookOpen },
  { id: "learn", label: "Trang học tập", icon: BookOpen },
  { id: "graph", label: "Knowledge graph", icon: GitBranch },
  { id: "chat", label: "Chat AI", icon: MessageSquare },
] as const;

const ProductGraph = dynamic(
  () => import("@/components/lms/teacher/KnowledgeGraph"),
  {
    ssr: false,
    loading: () => (
      <p className={styles.status} role="status">
        Đang mở bản đồ kiến thức…
      </p>
    ),
  },
);
const ChatPreview = dynamic(
  () => import("./ChatPreview").then((module) => module.ChatPreview),
  {
    loading: () => (
      <p className={styles.status} role="status">
        Đang mở AI Cowork…
      </p>
    ),
  },
);

const LearningPreview = dynamic(() =>
  import("./LearningPreview").then((module) => module.LearningPreview),
);

function GraphDemo({
  selected,
  onSelect,
  onChat,
}: {
  selected: TopicId;
  onSelect: (id: TopicId) => void;
  onChat: () => void;
}) {
  const graphData = useMemo(
    () => ({
      nodes: learningTopics.map((topic, index) => ({
        id: index + 1,
        name: topic.title,
        description: topic.summary,
        x: topic.x,
        y: topic.y,
      })),
      links: topicEdges.map(([from, to]) => ({
        source: learningTopics.findIndex((topic) => topic.id === from) + 1,
        target: learningTopics.findIndex((topic) => topic.id === to) + 1,
        type: "prerequisite",
        strength: 0.9,
      })),
    }),
    [],
  );
  return (
    <div className={styles.productSurface}>
      <div className={styles.graphTopics} role="group" aria-label="Chọn chủ đề">
        {learningTopics.map((topic) => (
          <button
            key={topic.id}
            aria-pressed={selected === topic.id}
            onClick={() => onSelect(topic.id)}
          >
            {topic.title}
          </button>
        ))}
      </div>
      <ProductGraph
        courseId={0}
        initialData={graphData}
        readOnly
        selectedNodeId={
          learningTopics.findIndex((topic) => topic.id === selected) + 1
        }
        onNodeSelect={(id) => {
          const topic = learningTopics[id - 1];
          if (topic) onSelect(topic.id);
        }}
      />
      <button className={styles.textButton} onClick={onChat}>
        Hỏi AI về {learningTopics.find((topic) => topic.id === selected)!.title}{" "}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

export function BdcHubDemo() {
  const [view, setView] = useState<View>("courses");
  const [selected, setSelected] = useState<TopicId>("agent");
  const [session, setSession] = useState(0);
  const [course, setCourse] = useState(showcaseCourse);
  const [contents, setContents] = useState(showcaseContents);
  const [activeLessonId, setActiveLessonId] = useState(1);
  const [visited, setVisited] = useState(new Set<View>());
  function changeView(next: View) {
    setVisited((current) => new Set([...current, next]));
    setView(next);
  }
  return (
    <div className={styles.demoShell}>
      <div className={styles.windowBar}>
        <span className={styles.windowDots} aria-hidden="true">
          ● ● ●
        </span>
        <span>BDC Hub / Trải nghiệm sản phẩm</span>
        <button
          className={styles.textButton}
          onClick={() => {
            setSession(session + 1);
            setSelected("agent");
            setView("courses");
            setCourse(showcaseCourse);
            setContents(showcaseContents);
            setActiveLessonId(1);
            setVisited(new Set());
          }}
        >
          <RotateCcw size={14} /> Làm lại
        </button>
      </div>
      <div
        className={styles.demoNavigation}
        role="group"
        aria-label="Chọn màn hình demo"
      >
        {views.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={view === id ? styles.selectedView : styles.viewButton}
            aria-pressed={view === id}
            onClick={() => changeView(id)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>
      <div key={session} className={styles.demoBody}>
        <div hidden={view !== "courses"}>
          <CoursePreview
            course={course}
            onCourseChange={setCourse}
            contents={contents}
            onContentsChange={setContents}
            onLearn={(content) => {
              if (content) setActiveLessonId(content.id);
              changeView("learn");
            }}
            onGraph={() => changeView("graph")}
          />
        </div>
        {view === "graph" && (
          <div>
            <GraphDemo
              selected={selected}
              onSelect={setSelected}
              onChat={() => changeView("chat")}
            />
          </div>
        )}
        {visited.has("learn") && (
          <div hidden={view !== "learn"}>
            <LearningPreview
              course={course}
              contents={contents}
              activeId={activeLessonId}
              onSelect={(content) => setActiveLessonId(content.id)}
            />
          </div>
        )}
        {visited.has("chat") && (
          <div hidden={view !== "chat"}>
            <ChatPreview topic={selected} />
          </div>
        )}
      </div>
    </div>
  );
}
