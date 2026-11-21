"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Plus, Search } from "lucide-react";
import {
  CourseTableRow,
  CourseMobileCard,
} from "@/components/lms/teacher/CourseRowComponents";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { SidebarSection } from "@/components/lms/student/SidebarSection";
import type { Content, Course } from "@/types";
import { showcaseSection } from "./courseFixtures";
import styles from "./bdchub.module.css";

type Props = {
  course: Course;
  onCourseChange: (course: Course) => void;
  contents: Content[];
  onContentsChange: (contents: Content[]) => void;
  onLearn: (content?: Content) => void;
  onGraph: () => void;
};
export function CoursePreview({
  course,
  onCourseChange,
  contents,
  onContentsChange,
  onLearn,
  onGraph,
}: Props) {
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [notice, setNotice] = useState("");
  function publish() {
    onCourseChange({
      ...course,
      status: course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
    });
  }
  function archive() {
    onCourseChange({
      ...course,
      status: course.status === "ARCHIVED" ? "DRAFT" : "ARCHIVED",
    });
  }
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || contents.length >= 12) return;
    onContentsChange([
      ...contents,
      {
        id: Math.max(...contents.map((item) => item.id), 0) + 1,
        section_id: 1,
        title: title.trim(),
        type: "TEXT",
        description: "",
        is_published: true,
        is_mandatory: false,
        order_index: contents.length,
        metadata: {
          content: `## ${title.trim()}\n\nBài học mới đã sẵn sàng để bổ sung nội dung.`,
        },
      },
    ]);
    setTitle("");
  }
  const actions = {
    course,
    onOpen: () => setOpened(true),
    onPublish: publish,
    onArchive: archive,
    onDelete: () =>
      setNotice(
        "Khóa học này là điểm bắt đầu của hành trình trải nghiệm. Bạn có thể thử lưu trữ hoặc xuất bản.",
      ),
    publishing: false,
    archiving: false,
    deleting: false,
  };
  return (
    <div className={styles.productSurface}>
      <div className={styles.workspaceHeader}>
        <div>
          <p className={styles.kicker}>GIẢNG VIÊN / KHÓA HỌC</p>
          <h3>{opened ? course.title : "Khóa học của tôi"}</h3>
          <p className={styles.muted}>
            {opened
              ? "Tổ chức nội dung và thiết kế hành trình học tập."
              : "Quản lý, tổ chức và phát triển các khóa học của bạn."}
          </p>
        </div>
        <button
          className={styles.primary}
          onClick={opened ? () => onLearn() : () => setOpened(true)}
        >
          {opened ? "Xem trang học tập" : "Quản lý nội dung"}
          <ArrowRight size={16} />
        </button>
      </div>
      {!opened ? (
        <>
          <label className={styles.searchField}>
            <Search size={17} />
            <input
              aria-label="Tìm khóa học"
              placeholder="Tìm kiếm khóa học…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              maxLength={100}
            />
          </label>
          {course.title
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()) ? (
            <>
              <div className={styles.desktopTable}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[
                        "Khóa học",
                        "Phân loại",
                        "Học viên",
                        "Trạng thái",
                        "Cập nhật",
                        "Thao tác",
                      ].map((name) => (
                        <TableHead key={name}>{name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <CourseTableRow {...actions} />
                  </TableBody>
                </Table>
              </div>
              <div className={styles.mobileCourse}>
                <CourseMobileCard {...actions} />
              </div>
            </>
          ) : (
            <p className={styles.status}>Không tìm thấy khóa học phù hợp.</p>
          )}
        </>
      ) : (
        <>
          <div className={styles.courseToolbar}>
            <button
              className={styles.textButton}
              onClick={() => setOpened(false)}
            >
              <ArrowLeft size={16} /> Khóa học của tôi
            </button>
            <button className={styles.secondary} onClick={publish}>
              {course.status === "PUBLISHED"
                ? "Chuyển về bản nháp"
                : "Xuất bản khóa học"}
            </button>
            <button className={styles.secondary} onClick={onGraph}>
              Knowledge graph
            </button>
          </div>
          <p className={styles.status} role="status">
            {course.status === "PUBLISHED"
              ? "Đã xuất bản"
              : course.status === "ARCHIVED"
                ? "Đã lưu trữ"
                : "Bản nháp"}{" "}
            · {contents.length} nội dung
          </p>
          <div className={styles.contentTree}>
            <SidebarSection
              section={showcaseSection}
              index={0}
              contents={contents}
              loading={false}
              isExpanded={expanded}
              onToggle={() => setExpanded(!expanded)}
              activeContentId={null}
              onSelect={onLearn}
              completedIds={new Set()}
            />
          </div>
          <form className={styles.inlineForm} onSubmit={add}>
            <BookOpen size={18} />
            <label className={styles.srOnly} htmlFor="showcase-lesson">
              Tên bài học mới
            </label>
            <input
              id="showcase-lesson"
              placeholder="Tên bài học mới…"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              disabled={contents.length >= 12}
            />
            <button
              className={styles.iconButton}
              aria-label="Thêm bài học"
              disabled={!title.trim() || contents.length >= 12}
            >
              <Plus size={18} />
            </button>
          </form>
        </>
      )}
      {notice && (
        <p className={styles.status} role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
