---
name: bdc-frontend
description: >
  Use for every task touching frontend/src/ - components, hooks, service calls,
  page routes, API route handlers, Tailwind styling, dark mode, modals, forms,
  or any new feature. Also consult when wiring up environment variables,
  proxy-aware fetches, reviewing code consistency, or building AI-native UI
  components following BDC Design Rhythm v3.0.
triggers:
  - frontend/
  - next.js
  - react
  - tailwind
  - typescript
  - nextauth
  - component
  - hook
  - page
  - dark mode
  - lms
  - quiz
  - pipeline
version: "3.0"
authors:
  - BDC Team
requires:
  - bdc-core-orchestrator
  - docs/references/design-systems/bdc-design-rhythm-v3.md
---

# BDC Frontend - Developer Skill v3.0

**Runtime:** Node.js 20 Alpine  
**Framework:** Next.js 14 App Router  
**Language:** TypeScript (`strict: true`, `noImplicitAny: false`)  
**Styling:** Tailwind CSS + shadcn/ui  
**Auth:** NextAuth.js (credentials provider, JWT sessions)  
**Design System:** BDC Design Rhythm v3.0 (dark-first, AI-native enterprise)  
**Backends:** Auth service `:8080` · LMS service `:8081`

> **Luôn đọc [BDC Design Rhythm v3.0](file:///home/thanh/BDCHub---Frontend/docs/references/design-systems/bdc-design-rhythm-v3.md) trước khi viết bất kỳ className nào.**  
> **Luôn đọc [Component & Hook Guide](file:///home/thanh/BDCHub---Frontend/docs/references/architecture/COMPONENT_HOOK_GUIDE.md) trước khi tạo hoặc di chuyển tệp mới.**  
> Mọi component phải hoạt động đúng ở cả `light` và `dark` mode.

---

## Directory Map

```
frontend/src/
├── app/
│   ├── (auth)/               login, confirm-password-change
│   ├── (landing)/            public landing pages
│   ├── (main)/               authenticated sidebar app - dashboard, events, tasks, users
│   ├── (learning)/lms/       LMS area - admin, student, teacher, forums
│   └── api/                  Route Handlers - NextAuth, upload, youtube, health
├── components/
│   ├── ui/                   shadcn/ui primitives - DO NOT modify directly
│   ├── layout/               Sidebar, MobileNav, Navbar, Footer, ThemeToggle, Background
│   ├── common/               SafeImage, LoadingState, EmptyState, SectionHeader, CountDown...
│   ├── auth/                 AuthShell, LoginForm, GoogleRegisterForm, Mascot...
│   ├── board/                Kanban board components (column/, task/)
│   ├── dashboard/            announcement/, event/, calendar/, modals/
│   ├── admin/                System & Platform Admin (role/, permission/, dashboard/)
│   ├── lms/admin/            LMS Admin (LmsMappingModal, LmsUserRoleManager, llm-config/)
│   ├── lms/shared/           LMS-flavoured primitives (BreadcrumbNav, QuestionImageUploader...)
│   ├── lms/student/          ContentViewer, modals/, stats/, analytics/
│   ├── lms/teacher/          AINodeManager, AIQuizGenPanel, modals/, quiz/, upload/, views/
│   └── user/                 User management (manage/, modals/, table/)
├── hooks/                    Structured by domain (auth/, common/, dashboard/, lms/, chat/, labs/)
│   └── index.ts              Central barrel export for all hooks
├── services/                 ALL fetch() calls - never in components or hooks
├── types/                    All shared TypeScript interfaces - re-export from index.ts
├── store/UserContext.tsx      Global user state
├── providers/MainProvider.tsx SessionProvider + UserContext + ThemeProvider
└── utils/                    Pure helpers - no React imports
```

---

## Modular Architecture & File Separation Guidelines

Ngoài việc phân chia Component UI nhỏ gọn, dự án tuân thủ mô hình kiến trúc phân lớp chuyên nghiệp nhằm tối ưu khả năng **tái sử dụng (Reusability)**, **bảo trì (Maintainability)** và **mở rộng (Scalability)**:

### 1. Phân Lớp Trách Nhiệm (Separation of Concerns)

* **UI Components (`/components`)**: Chỉ chịu trách nhiệm hiển thị (Presentation Layer) và nhận callback. Không chứa API calls, không chứa complex business logic hay raw validation rules.
* **Custom Hooks (`/hooks`)**: Chịu trách nhiệm quản lý state, side-effects, UI handlers và kết nối với Service Layer.
* **Service / API Layer (`/services`)**: Nơi duy nhất xử lý HTTP requests (Fetch/Axios), interceptors, và transform data nếu cần.
* **Form Schemas (`/schemas` hoặc trong module `schemas/`)**: Chứa Zod/Yup schemas để validate dữ liệu đầu vào độc lập với Form UI.
* **Types / Interfaces (`/types`)**: Chứa toàn bộ định nghĩa data models, API DTOs, Enums. Tuyệt đối không dùng `any`.
* **Utilities / Helpers (`/utils`)**: Các hàm thuần túy (Pure Functions) xử lý format tiền tệ, ngày tháng, chuỗi, toán học,... Không import React/State.
* **Constants & Configs (`/constants`, `/config`)**: Chứa hằng số hệ thống, enum status, route URLs, API Endpoints, app settings. Đẩy các magic strings/numbers ra khỏi logic.

### 2. Tiêu Chuẩn Khi Tạo Feature Mới (Feature-Based Structure)

Đối với các tính năng phức tạp (ví dụ: `auth`, `lms/quiz`, `user`), khuyến khích gom nhóm theo module/feature nếu số lượng file lớn:

```
src/features/feature-name/ (hoặc trong components/lms/domain/)
├── api/             # API service functions cho feature này
├── components/      # Sub-components chỉ thuộc về feature này
├── hooks/           # Custom hooks phục vụ feature này (logic & state)
├── schemas/         # Validation schemas (zod/yup)
├── types/           # TS Types/Interfaces cho feature
└── index.ts         # Export duy nhất các thành phần public ra ngoài
```

### 3. Quy Tắc Tách File Khi Code

1. **Khi Component vượt quá ~150-200 dòng**:
   - Tách phần UI lặp lại/phức tạp thành các Sub-components (`components/...`).
   - Tách phần State/Effects/Logic sang Custom Hook (`hooks/use...`).
2. **Khi Form có validation**:
   - Tạo file Schema riêng bằng Zod (`schemas/...Schema.ts`).
3. **Khi làm việc với API**:
   - Khai báo Response/Request Type trong `types/`.
   - Viết hàm gọi API trong `services/` (dùng `api.ts` hoặc `lmsApiClient.ts`).
   - Tránh gọi `fetch()` / `apiClient` trực tiếp từ Component hay Hook inline.
4. **Khi cần định dạng dữ liệu / tính toán**:
   - Viết helper thuần túy trong `utils/` kèm unit test / JSDoc nếu cần.

---

## Proxy Rewrites (next.config.ts)

Never call backend ports directly. Use proxy paths - works in Docker and production.

| Frontend path | Proxies to | Purpose |
|---|---|---|
| `/apiv1/:path*` | `BACKEND_URL/:path*` | Auth, users, events, announcements |
| `/uploads/:path*` | `BACKEND_URL/uploads/:path*` | Auth service file uploads |
| `/lmsapiv1/:path*` | `LMS_API_URL/api/v1/:path*` | All LMS features |
| `/files/:path*` | `LMS_API_URL/api/v1/files/serve/:path*` | LMS file serving |

```ts
// ✅ Correct
const res = await fetch("/apiv1/announcements");

// ❌ Wrong - breaks in Docker
const res = await fetch("http://localhost:8080/announcements");
```

---

## API Clients

| Client | File | Use for |
|---|---|---|
| Auth backend | `services/api.ts` | All `(main)/` pages |
| LMS backend | `services/lmsApiClient.ts` | All `(learning)/lms/` pages |

Both attach `Authorization: Bearer <token>` from NextAuth session and throw `Error` on non-2xx.

### Service File Template

```ts
// services/featureService.ts
import { apiClient } from "./api"; // or lmsApiClient for LMS
import type { Feature } from "@/types";

export const featureService = {
  getAll:    ():                       Promise<Feature[]>  => apiClient.get("/features"),
  getById:   (id: number):             Promise<Feature>    => apiClient.get(`/features/${id}`),
  create:    (data: Partial<Feature>): Promise<Feature>    => apiClient.post("/features", data),
  update:    (id: number, data: Partial<Feature>): Promise<Feature> =>
                                                              apiClient.put(`/features/${id}`, data),
  delete:    (id: number):             Promise<void>       => apiClient.delete(`/features/${id}`),
};
```

---

## Authentication

### Client Components

```ts
import { useAuth } from "@/hooks/useAuth";
const { user, isAdmin, checkAdminAccess } = useAuth();

const handleDelete = async (id: number) => {
  if (!checkAdminAccess("xóa")) return;
  await featureService.delete(id);
};
```

### Route Handlers

```ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

---

## Hook Template (CRUD + Modal)

```ts
// hooks/dashboard/useFeature.ts (Pure logic -> Dùng đuôi .ts)
import { useState, useEffect, useCallback } from "react";
import { featureService } from "@/services/featureService";
import type { Feature } from "@/types";

type ModalMode = "add" | "edit" | "view";
const EMPTY: Partial<Feature> = {};

export function useFeature() {
  const [items,       setItems]       = useState<Feature[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalMode,   setModalMode]   = useState<ModalMode>("view");
  const [currentItem, setCurrentItem] = useState<Partial<Feature>>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try   { setItems(await featureService.getAll()); }
    catch (err) { console.error("useFeature:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal  = useCallback((mode: ModalMode, item?: Feature) => {
    setModalMode(mode);
    setCurrentItem(item ?? EMPTY);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const save = useCallback(async (item: Partial<Feature>) => {
    item.id ? await featureService.update(item.id, item)
            : await featureService.create(item);
    closeModal();
    await load();
  }, [closeModal, load]);

  const remove = useCallback(async (id: number) => {
    await featureService.delete(id);
    setItems(prev => prev.filter(f => f.id !== id));
  }, []);

  return {
    items, loading,
    modalOpen, modalMode, currentItem, setCurrentItem,
    openModal, closeModal, save, remove,
  };
}
```

---

## Page Composition Pattern

`page.tsx` = composition shell only. No `useState`, `useEffect`, or `fetch()` inside.

```tsx
// app/(main)/feature/page.tsx
"use client";
import { useAuth }        from "@/hooks/useAuth";
import { useFeature }     from "@/hooks/useFeature";
import { usePagination }  from "@/hooks/usePagination";
import { FeatureModal }   from "@/components/dashboard/feature/FeatureModal";
import { FeatureList }    from "@/components/dashboard/feature/FeatureList";
import { SectionHeader }  from "@/components/common/SectionHeader";
import { ShowMoreButton } from "@/components/common/ShowMoreButton";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function FeaturePage() {
  const { isAdmin, checkAdminAccess }                                        = useAuth();
  const { items, loading, modalOpen, modalMode, currentItem, setCurrentItem,
          openModal, closeModal, save, remove }                               = useFeature();
  const { visibleItems, hasMore, remaining, showMore }                       = usePagination(items, 4);

  return (
    <>
      <FeatureModal
        open={modalOpen} mode={modalMode} item={currentItem}
        onOpenChange={closeModal} onChange={setCurrentItem}
        onSave={async () => {
          try { await save(currentItem); }
          catch (e: any) { alert(e.message); }
        }}
      />
      <div className="space-y-10">
        <DashboardHeader />
        <section>
          <SectionHeader
            title="Feature" showAddButton={isAdmin}
            onAdd={() => { if (checkAdminAccess()) openModal("add"); }}
          />
          <FeatureList
            items={visibleItems} loading={loading} isAdmin={isAdmin}
            onView={item  => openModal("view", item)}
            onEdit={item  => { if (checkAdminAccess())      openModal("edit", item); }}
            onDelete={async id => { if (checkAdminAccess("xóa")) await remove(id); }}
          />
          {hasMore && <ShowMoreButton onClick={showMore} remaining={remaining} />}
        </section>
      </div>
    </>
  );
}
```

---

## Styling Reference

> Full token definitions in [BDC Design Rhythm v3.0](file:///home/thanh/BDCHub---Frontend/docs/references/design-systems/bdc-design-rhythm-v3.md). This section is the quick-reference.

### Color Token Table

| Role | Light | Dark |
|---|---|---|
| Page bg | `bg-slate-50` | `dark:bg-[#050B18]` |
| Sidebar / Shell | `bg-white` | `dark:bg-[#070E1C]` |
| Card bg | `bg-white` | `dark:bg-[#0F1E35]` |
| Card border | `border-slate-200` | `dark:border-blue-500/10` |
| Card border hover | `border-slate-300` | `dark:border-blue-500/25` |
| Input bg | `bg-slate-50` | `dark:bg-[#0D192E]` |
| Input border | `border-slate-300` | `dark:border-blue-500/20` |
| Input focus ring | `ring-blue-500/20` | `dark:ring-cyan-400/20` |
| Input focus border | `border-blue-500` | `dark:border-cyan-400/50` |
| Heading | `text-slate-900` | `dark:text-white` |
| Body | `text-slate-600` | `dark:text-slate-300` |
| Caption | `text-slate-500` | `dark:text-slate-400` |
| Placeholder | `text-slate-400` | `dark:text-slate-500` |
| Primary btn | `bg-blue-600 hover:bg-blue-700` | (unchanged) |
| Active nav | `bg-blue-600 text-white` | `dark:bg-blue-600 dark:text-white` |
| Row hover | `hover:bg-slate-50` | `dark:hover:bg-[#162644]` |
| Divider | `border-slate-200` | `dark:border-slate-400/8` |
| Danger | `text-red-500 bg-red-50` | `dark:text-red-400 dark:bg-red-950/40` |
| AI accent / label | `text-blue-600` | `dark:text-cyan-400` |

### Copy-Paste Patterns

#### Standard Card
```tsx
<div className="bg-white dark:bg-[#0F1E35]
                border border-slate-200 dark:border-blue-500/10
                rounded-2xl p-6
                shadow-sm dark:shadow-none
                hover:shadow-md dark:hover:border-blue-500/25
                transition-all duration-300">
```

#### AI Pipeline Step Card
```tsx
<div className="bg-white dark:bg-[#0F1E35]
                border border-slate-200 dark:border-blue-500/12
                rounded-xl p-5
                hover:border-blue-400/50 dark:hover:border-blue-500/30
                transition-all duration-200">
  <div className="w-8 h-8 rounded-full mb-4 flex items-center justify-center
                  border border-slate-300 dark:border-blue-500/30
                  bg-slate-50 dark:bg-[#0A1628]
                  text-sm font-bold text-blue-600 dark:text-cyan-400">
    1
  </div>
  ...
</div>
```

#### Primary Button
```tsx
<Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold
                   rounded-xl px-6 py-2.5 shadow-sm
                   active:scale-95 transition-all duration-200">
```

#### Input
```tsx
<Input className="rounded-xl px-4 py-3
                  bg-slate-50 dark:bg-[#0D192E]
                  border border-slate-300 dark:border-blue-500/20
                  text-slate-900 dark:text-slate-100
                  placeholder:text-slate-400 dark:placeholder:text-slate-500
                  focus:bg-white dark:focus:bg-[#0A1628]
                  focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20
                  focus:border-blue-500 dark:focus:border-cyan-400/50
                  transition-all duration-200" />
```

#### Section Label (Pipeline Header)
```tsx
<div className="flex items-center gap-4 mb-8">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-blue-500/30 dark:to-cyan-400/20" />
  <span className="text-xs font-bold uppercase tracking-widest
                   text-blue-600 dark:text-cyan-400 whitespace-nowrap">
    Quiz Generation Pipeline
  </span>
  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-blue-500/30 dark:to-cyan-400/20" />
</div>
```

#### Badge / Tag
```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                 text-xs font-semibold uppercase tracking-wider
                 bg-blue-50 dark:bg-blue-900/30
                 text-blue-600 dark:text-cyan-400
                 border border-blue-200 dark:border-blue-500/20">
  AI
</span>
```

## Naming Conventions & File Extension Rules

### 1. Quy Định Đặt Tên (Naming Matrix)

| Loại Đối Tượng | Quy Chuẩn Đặt Tên | Ví Dụ Đặt Tên File | Quy Chuẩn Export / Symbols |
|---|---|---|---|
| **Component File** | `PascalCase.tsx` | `TaskCard.tsx`, `QuizPipelineCard.tsx` | Named export (`export function TaskCard`) |
| **Pure Logic Hook** | `camelCase.ts` (Bắt buộc `.ts`) | `useAuth.ts`, `useQuizCourse.ts` | Named export (`export function useQuizCourse`) |
| **JSX Provider Hook** | `camelCase.tsx` (Chỉ dùng khi có JSX) | `useChat.tsx`, `usePageContext.tsx` | Named export (`export function useChat`) |
| **Service File** | `camelCase.ts` (suffix `Service`/`ApiClient`) | `quizService.ts`, `lmsApiClient.ts` | Named export object/class |
| **Utility / Helper** | `camelCase.ts` | `formatCurrency.ts`, `formatDate.ts` | Named export function |
| **Form Schema** | `camelCase.ts` (suffix `Schema`) | `authSchema.ts`, `checkoutSchema.ts` | Named export (`export const loginSchema`) |
| **Type / DTO File** | `kebab-case.ts` hoặc `camelCase.ts` | `quiz-types.ts`, `lms.types.ts` | Export interface/type |
| **Folder / Thư mục** | `kebab-case` hoặc `lowercase` | `auth`, `board`, `common`, `modals` | **KHÔNG** dùng PascalCase cho tên thư mục |
| **Barrel Export File** | `index.ts` | `src/hooks/index.ts` | `export * from "./auth/useAuth"` |
| **Event Handlers** | Prefix `handle` | `handleGenerate`, `handleDelete` | Inside components |
| **Boolean State** | Prefix `is/has/show` | `isGenerating`, `hasResults` | Inside hooks/components |
| **Props Interface** | `<Component>Props` | `QuizPipelineCardProps` | Interface |

### 2. Quy Tắc Phân Định Đuôi File (`.ts` vs `.tsx`)

* **`.ts` (Pure TypeScript)**: Dùng cho Services, Utils, Types, Schemas, Constants, và **Custom Hooks chỉ chứa logic / state / side-effects thuần túy** (không chứa JSX).
* **`.tsx` (TypeScript + JSX)**: Dùng cho UI Components, Layouts, Pages, và **Hooks có render trực tiếp JSX Element** (ví dụ: `<Context.Provider value={...}>`).

---

## Anti-Patterns

| ❌ Đừng làm | ✅ Thay bằng |
|---|---|
| `fetch()` trong component hoặc hook | Đặt trong `services/`, gọi từ hook |
| Logic fetch trong `page.tsx` | Extract sang `use<Feature>()` hook |
| Hook pure logic dùng đuôi `.tsx` (`useAuth.tsx`) | Dùng đuôi `.ts` chuẩn mực (`useAuth.ts`) |
| Quên re-export hook mới tạo | Thêm re-export tại `src/hooks/index.ts` |
| Để loose Modal ở root folder | Gom vào subfolder `modals/` (VD: `components/user/modals/`) |
| Đặt tên folder bằng PascalCase (`src/components/Board/`) | Dùng lowercase/kebab-case (`src/components/board/`) |
| Type `any` | Định nghĩa interface trong `src/types/` |
| `lmsApiClient` từ `(main)/` pages | `(main)/` dùng `api.ts` duy nhất |
| Hardcode URL/port | Dùng proxy paths qua service files |
| `backdrop-blur` trên sidebar/navbar | `bg-white dark:bg-[#070E1C]` solid |
| `dark:bg-slate-900` cho LMS cards | `dark:bg-[#0F1E35]` |
| Thiếu `dark:` pair trên màu bất kỳ | Mọi `bg/text/border` cần dark pair |
| Multi-colour gradient rực rỡ | Solid hoặc cùng dải (blue→cyan) |
| Inline `style={{}}` | Tailwind only |
| `active:scale-95` thiếu trên button | Mọi clickable element cần press feedback |
| `console.log` trong code commit | Remove trước PR |
| Prefix `_` cho unused variable/prop (`_course`, `_progressPct`) | Xóa hẳn variable/prop khỏi destructuring nếu không dùng (ESLint vẫn báo lỗi) |
| Import icon dư thừa từ `lucide-react` | Xóa các unused imports trước khi commit |
| Dùng `<img>` mà không handle ESLint warning | Dùng `<Image />` từ `next/image` (ảnh static), hoặc dùng `/* eslint-disable-next-line @next/next/no-img-element */` (ảnh dynamic từ backend) |
| Viết dấu nháy `'` hoặc `"` trực tiếp trong JSX text | Dùng `&quot;`, `&apos;` hoặc JSX expression `{"'..."}` |
| Default export cho component | Named exports only |
| Build LMS primitive mới | Kiểm tra `components/lms/shared/` trước |
| Shadow nặng trên dark mode | `dark:shadow-none` hoặc blue glow subtle |
| Rounded nhỏ trên card | `rounded-2xl` cho card, `rounded-xl` cho input/button |

---

## Pre-PR Checklist

```
── Types & Services ────────────────────────────────────────────────────
[ ] New type in src/types/ và re-export từ index.ts
[ ] Service dùng api.ts hoặc lmsApiClient.ts - không raw fetch() trong hook/component
[ ] Props interface tên <Component>Props, fully typed

── Architecture ────────────────────────────────────────────────────────
[ ] Hook theo pattern CRUD + modal
[ ] Component đặt đúng folder với named export
[ ] page.tsx là composition only - không có useState/useEffect/fetch

── Styling - Light Mode ────────────────────────────────────────────────
[ ] Card: bg-white border-slate-200 rounded-2xl shadow-sm
[ ] Input: border-slate-300 focus:ring-blue-500/20 focus:border-blue-500
[ ] Button: bg-blue-600 active:scale-95 transition-all duration-200

── Styling - Dark Mode ─────────────────────────────────────────────────
[ ] Card: dark:bg-[#0F1E35] dark:border-blue-500/10 dark:shadow-none
[ ] Input: dark:bg-[#0D192E] dark:border-blue-500/20 dark:focus:ring-cyan-400/20
[ ] Page bg: dark:bg-[#050B18]
[ ] Sidebar: dark:bg-[#070E1C]
[ ] AI labels: dark:text-cyan-400

── Paired tokens ───────────────────────────────────────────────────────
[ ] Mọi bg/text/border có cặp light + dark:
[ ] Hover states có cặp hover: + dark:hover:
[ ] Border subtle dark: dùng opacity (dark:border-blue-500/10)

── UX ──────────────────────────────────────────────────────────────────
[ ] Loading dùng <LoadingState /> - không custom spinner
[ ] Empty state có message rõ ràng
[ ] Admin mutations được guard bởi checkAdminAccess()
[ ] Modal có overlay + rounded-2xl panel
[ ] Pipeline steps có numbered badge cyan/blue

── Quality & ESLint Clean Code ──────────────────────────────────────────
[ ] Không hardcode localhost URLs
[ ] Không có console.log
[ ] Không để unused variables/props (kể cả khi prefix `_` như `_course`)
[ ] Dọn dẹp unused imports (icons từ `lucide-react`, React hooks...)
[ ] Escape các kí tự nháy `'` và `"` trong JSX text bằng `&quot;` / `&apos;`
[ ] Thêm `/* eslint-disable-next-line @next/next/no-img-element */` nếu bắt buộc dùng `<img>` cho dynamic backend URLs
[ ] Chạy `npx next lint` kiểm tra đạt 0 errors trước khi tạo PR
[ ] Hoạt động đúng ở cả light và dark mode
[ ] Kiểm tra contrast WCAG AA ở cả hai mode
```