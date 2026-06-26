---
name: bdc-frontend
description: >
  Use for every task touching frontend/src/ — components, hooks, service calls,
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
  - DESIGN_RHYTHM.md
---

# BDC Frontend — Developer Skill v3.0

**Runtime:** Node.js 20 Alpine  
**Framework:** Next.js 14 App Router  
**Language:** TypeScript (`strict: true`, `noImplicitAny: false`)  
**Styling:** Tailwind CSS + shadcn/ui  
**Auth:** NextAuth.js (credentials provider, JWT sessions)  
**Design System:** BDC Design Rhythm v3.0 (dark-first, AI-native enterprise)  
**Backends:** Auth service `:8080` · LMS service `:8081`

> **Luôn đọc DESIGN_RHYTHM.md trước khi viết bất kỳ className nào.**  
> Mọi component phải hoạt động đúng ở cả `light` và `dark` mode.

---

## Directory Map

```
frontend/src/
├── app/
│   ├── (auth)/               login, confirm-password-change
│   ├── (landing)/            public landing pages
│   ├── (main)/               authenticated sidebar app — dashboard, events, tasks, users
│   ├── (learning)/lms/       LMS area — admin, student, teacher, forums
│   └── api/                  Route Handlers — NextAuth, upload, youtube, health
├── components/
│   ├── ui/                   shadcn/ui primitives — DO NOT modify directly
│   ├── layout/               Sidebar, MobileNav, Navbar, Footer, ThemeToggle, Background
│   ├── common/               SafeImage, LoadingState, EmptyState, SectionHeader
│   ├── dashboard/            announcement/, event/, calendar/, modals/
│   ├── lms/shared/           LMS-flavoured primitives (check here before building new)
│   ├── lms/student/          AIDiagnosisModal, ContentViewer, QuizHistoryModal
│   └── lms/teacher/          AINodeManager, AIQuizGenPanel, BulkUploadModal
├── hooks/                    useAuth, useCurrentUser, useAnnouncements, useEvents, useTasks
├── services/                 ALL fetch() calls — never in components or hooks
├── types/                    All shared TypeScript interfaces — re-export from index.ts
├── store/UserContext.tsx      Global user state
├── providers/MainProvider.tsx SessionProvider + UserContext + ThemeProvider
└── utils/                    Pure helpers — no React imports
```

---

## Proxy Rewrites (next.config.ts)

Never call backend ports directly. Use proxy paths — works in Docker and production.

| Frontend path | Proxies to | Purpose |
|---|---|---|
| `/apiv1/:path*` | `BACKEND_URL/:path*` | Auth, users, events, announcements |
| `/uploads/:path*` | `BACKEND_URL/uploads/:path*` | Auth service file uploads |
| `/lmsapiv1/:path*` | `LMS_API_URL/api/v1/:path*` | All LMS features |
| `/files/:path*` | `LMS_API_URL/api/v1/files/serve/:path*` | LMS file serving |

```ts
// ✅ Correct
const res = await fetch("/apiv1/announcements");

// ❌ Wrong — breaks in Docker
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
// hooks/useFeature.tsx
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

> Full token definitions in `DESIGN_RHYTHM.md`. This section is the quick-reference.

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

---

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Component file | PascalCase.tsx | `QuizPipelineCard.tsx` |
| Hook file | camelCase.tsx, prefix `use` | `useQuizGenerator.tsx` |
| Service file | camelCase.ts, suffix `Service` | `quizService.ts` |
| Type file | kebab-case.ts | `quiz-types.ts` |
| Component export | Named | `export function QuizPipelineCard` |
| Page / layout | Default | `export default function QuizPage` |
| Event handlers | Prefix `handle` | `handleGenerate`, `handleDelete` |
| Boolean state | Prefix `is/has/show` | `isGenerating`, `hasResults` |
| Props interface | `<Component>Props` | `QuizPipelineCardProps` |

---

## Route Groups

| Group | Layout | Auth | Design mode |
|---|---|---|---|
| `(auth)` | AuthShell (cosmic bg + ThemeToggle) | No | Light / Dark toggle |
| `(landing)` | Public landing | No | Light / Dark toggle |
| `(main)` | Sidebar + MobileNav | Yes | Light (slate) |
| `(learning)/lms` | LMS shell | Yes | Dark (navy) preferred |

> LMS dark mode dùng blue-navy palette (`#050B18`), không dùng `slate-950`.

---

## Anti-Patterns

| ❌ Đừng làm | ✅ Thay bằng |
|---|---|
| `fetch()` trong component hoặc hook | Đặt trong `services/`, gọi từ hook |
| Logic fetch trong `page.tsx` | Extract sang `use<Feature>()` hook |
| Type `any` | Định nghĩa interface trong `src/types/` |
| `lmsApiClient` từ `(main)/` pages | `(main)/` dùng `api.ts` duy nhất |
| Hardcode URL/port | Dùng proxy paths qua service files |
| `backdrop-blur` trên sidebar/navbar | `bg-white dark:bg-[#070E1C]` solid |
| `dark:bg-slate-900` cho LMS cards | `dark:bg-[#0F1E35]` |
| Thiếu `dark:` pair trên màu bất kỳ | Mọi `bg/text/border` cần dark pair |
| Multi-colour gradient rực rỡ | Solid hoặc cùng dải (blue->cyan) |
| Inline `style={{}}` | Tailwind only |
| `active:scale-95` thiếu trên button | Mọi clickable element cần press feedback |
| `console.log` trong code commit | Remove trước PR |
| Default export cho component | Named exports only |
| Build LMS primitive mới | Kiểm tra `components/lms/shared/` trước |
| Shadow nặng trên dark mode | `dark:shadow-none` hoặc blue glow subtle |
| Rounded nhỏ trên card | `rounded-2xl` cho card, `rounded-xl` cho input/button |

---

## Pre-PR Checklist

```
── Types & Services ────────────────────────────────────────────────────
[ ] New type in src/types/ và re-export từ index.ts
[ ] Service dùng api.ts hoặc lmsApiClient.ts — không raw fetch() trong hook/component
[ ] Props interface tên <Component>Props, fully typed

── Architecture ────────────────────────────────────────────────────────
[ ] Hook theo pattern CRUD + modal
[ ] Component đặt đúng folder với named export
[ ] page.tsx là composition only — không có useState/useEffect/fetch

── Styling — Light Mode ────────────────────────────────────────────────
[ ] Card: bg-white border-slate-200 rounded-2xl shadow-sm
[ ] Input: border-slate-300 focus:ring-blue-500/20 focus:border-blue-500
[ ] Button: bg-blue-600 active:scale-95 transition-all duration-200

── Styling — Dark Mode ─────────────────────────────────────────────────
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
[ ] Loading dùng <LoadingState /> — không custom spinner
[ ] Empty state có message rõ ràng
[ ] Admin mutations được guard bởi checkAdminAccess()
[ ] Modal có overlay + rounded-2xl panel
[ ] Pipeline steps có numbered badge cyan/blue

── Quality ─────────────────────────────────────────────────────────────
[ ] Không hardcode localhost URLs
[ ] Không có console.log
[ ] Hoạt động đúng ở cả light và dark mode
[ ] Kiểm tra contrast WCAG AA ở cả hai mode
```