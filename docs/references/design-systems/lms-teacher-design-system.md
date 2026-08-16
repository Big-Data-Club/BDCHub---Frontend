---
title: "LMS Teacher Design System Reference"
category: "design-system"
status: "active-spec"
last_updated: "2026-08-16"
target_surface: "src/app/(learning)/lms/teacher"
---

# LMS Teacher Design System Reference

This document serves as the official visual design, layout, and component spec for the **LMS Teacher (Giảng viên) module** in the BDCHub ecosystem. It defines the design tokens, user experience guidelines, interactive states, and component architectures used across all teacher dashboards, course managers, and quiz tools.

---

## 1. Overview

**Creative North Star: "The Academic Control Center"**

The LMS Teacher interface is built to feel powerful, efficient, and content-rich. It is an operational dashboard designed for high scanability and dense information display, balanced by clean aesthetic boundaries, cybernetic highlights, and a structured dark-first grid theme. It communicates rigor, modern education technology, and ease of orchestration.

### Key Characteristics:
* **High Density, Low Noise:** Information is structured into grid-aligned modules. Dense content lists (such as students, course syllabus nodes, and graded items) use minimal wrappers to preserve screen real estate.
* **Operational Aesthetics:** Visual status is immediately clear via contrasting action badges (Green for beginners/published, Yellow for intermediate/draft, Red for advanced/archived, Gray for general tags).
* **Atmospheric Spatial Gradients:** Smooth elliptical gradients (`bg-blue-500/10` and `bg-purple-500/10` on light mode; `dark:bg-cyan-500/5` and `dark:bg-blue-500/5` on dark mode) layer under a moving grid, providing visual depth without hindering text readability.

---

## 2. Color Palette & Theming

The Teacher LMS module strictly adheres to the **BDC Design Rhythm v3.0** token guidelines, optimizing readability and interactivity in both light and dark environments.

| Element | Light Mode | Dark Mode | CSS / Tailwind Pattern |
| :--- | :--- | :--- | :--- |
| **Page BG** | `#F1F5F9` | `#050B18` | `bg-slate-100/80` / `dark:bg-[#050B18]` |
| **Container Card** | `#FFFFFF` | `#0F1E35` | `bg-white` / `dark:bg-[#0F1E35]` |
| **Interior Row Hover** | `#F8FAFC` | `#162644` | `hover:bg-slate-50` / `dark:hover:bg-[#162644]` |
| **Primary Accent** | `#2563EB` | `#06B6D4` | `text-blue-600` / `dark:text-cyan-400` |
| **Grid Lines** | `rgba(11, 102, 162, 0.22)` | `rgba(169, 210, 240, 0.15)` | Graph grid overlay (`bg-grid-paper`) |

### Named Rules:
* **The High-Contrast Action Rule:** Use vibrant colors exclusively for actionable buttons, active navigation, focus boundaries, and validation indicators.
* **The Navy-Darkness Rule:** Dark mode layouts must avoid flat dark gray backgrounds (`#121212` or `slate-950`). Use the designated deep navy (`#050B18`) and card backgrounds (`#0F1E35`) to retain the professional, cybernetic BDC branding.

---

## 3. Layouts & Structure

The LMS Teacher pages are categorized into three main structural types:

### A. Teacher Dashboard Page
* **Path:** [/lms/teacher](file:///home/thanh/BDCHub---Frontend/src/app/(learning)/lms/teacher/page.tsx)
* **Spatial System:** A three-section vertical stack containing:
  1. **Analytics Summary Blocks:** Grid layout containing course status counts (Total, Published, Draft) and unique student metrics.
  2. **Quick Action Grid:** Dynamic, responsive button grid supporting 4 action levels:
     * `primary` (blue layout - e.g. "Tạo khóa học mới")
     * `success` (green layout - e.g. "Tạo Quiz bằng AI")
     * `warning` (yellow layout - e.g. "Chấm điểm nhanh")
     * `default` (standard border - e.g. "Quản lý tài nguyên")
  3. **Course Overview Catalog:** Table row list displaying thumbnails, course levels (Beginner, Intermediate, Advanced), publication status, and quick administrative options (Publish, Archive, Edit, Delete).
* **Keyboard Navigation:** Pressing `/` or `Ctrl/Cmd + K` focuses the main course search input instantly.

### B. Course Blueprint Workspace
* **Path:** `/lms/teacher/courses/[courseId]`
* **Spatial System:** A multi-pane interface dividing the workspace into section outlines (syllabuses) and node graphs. It manages:
  * Section creation and interactive ordering.
  * Drag-and-drop lecture materials, exercises, and quizzes.
  * Student enrollment lists and visual analytics.

### C. Quiz Workspace & Grading Interface
* **Path:** `/lms/teacher/quiz/[quizId]/manage` and `/lms/teacher/quiz/[quizId]/grading`
* **Spatial System:** Split-pane layouts showing candidate responses on one side and the grading matrix/scoring fields on the other, ensuring optimal productivity.

---

## 4. Components

### A. CourseTableRow Component
* **Path:** [`CourseRowComponents.tsx`](file:///home/thanh/BDCHub---Frontend/src/components/lms/teacher/CourseRowComponents.tsx)
* **Visual Spec:** A responsive, interactive table row that supports rich state changes (publishing, archiving, deleting) with embedded spinner statuses.
* **Hover Interaction:** Smooth transition to `bg-slate-50/60` (light) or `dark:bg-[#0D192E]/40` (dark), with thumbnail borders scaling to `group-hover:border-blue-500/30` or `dark:group-hover:border-cyan-400/40`.

```tsx
<tr className="group hover:bg-slate-50/60 dark:hover:bg-[#0D192E]/40 transition-all duration-200 border-b border-slate-100 dark:border-blue-500/5 cursor-pointer">
  {/* Course Thumbnail & Title */}
  <td className="px-6 py-4">
    <div className="flex items-center gap-4">
      <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-50 dark:bg-[#0D192E] flex items-center justify-center flex-shrink-0 border border-slate-200/80 dark:border-blue-500/15 group-hover:border-blue-500/30 dark:group-hover:border-cyan-400/40 transition-all duration-300">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} className="object-cover w-full h-full" />
        ) : (
          <BookOpen className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:scale-110 transition-transform duration-300" />
        )}
      </div>
      <div>
        <p className="font-bold text-sm text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
          {course.title}
        </p>
      </div>
    </div>
  </td>
  {/* Status & Options dropdowns */}
</tr>
```

### B. ActionCard / Quick Action Button
* **Path:** [`page.tsx`](file:///home/thanh/BDCHub---Frontend/src/app/(learning)/lms/teacher/page.tsx)
* **Visual Spec:** Thick rounded corners (`rounded-2xl`), subtle internal paddings (`p-5`), and responsive flex alignments. Icons animate on hover (`group-hover:scale-110`).
* **Active State:** Gentle scale-down action click (`active:scale-97`).

---

## 5. UI/UX Do's and Don'ts

### Do:
* **Do** implement standard keyboard navigation cues (e.g., search autofocus hooks).
* **Do** load heavy elements (e.g. Recharts, visual node graphs) using Next.js `dynamic()` imports to keep initial page speeds low.
* **Do** cache dashboard data locally in `sessionStorage` with standard timeouts (TTL like 5 minutes) to avoid repeated API hits.
* **Do** ensure all actions that mutate data (publishing, deleting, archiving) provide visual spinner feedback during loading states.

### Don't:
* **Don't** use standard heavy drop shadows on dark mode cards. Rely on borders (`border-blue-500/15`) and color contrast to specify elevation.
* **Don't** allow mutation requests without verifying permission scopes via `checkAdminAccess` or roles (e.g. checking if the user is `TEACHER` or `ADMIN`).
* **Don't** load client-heavy pages without fallback skeletons (`animate-pulse` classes).
