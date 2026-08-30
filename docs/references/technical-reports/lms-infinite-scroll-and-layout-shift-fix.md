---
title: "Báo cáo Kỹ thuật: Khắc phục Lỗi Infinite Lazy Loading (Chrome) & Layout Shift (Firefox)"
category: "technical-report"
status: "completed"
last_updated: "2026-08-20"
target_surface: "src/app/(learning)/lms/student/discover/page.tsx"
---

# Báo cáo Kỹ thuật: Giải Quyết Triệt Để Lỗi Lazy Loading & Layout Shift Trang Khám Phá Khóa Học (`/lms/student/discover`)

Tài liệu này tổng hợp toàn bộ hiện tượng, nguyên nhân gốc rễ ở cấp độ trình duyệt, giải pháp kiến trúc đã triển khai và các quy tắc bảo trì liên quan đến tính năng cuộn vô hạn (lazy loading) và ổn định vị trí cuộn (scroll position stability) tại trang Khám phá khóa học (`/lms/student/discover`).

---

## 1. Tóm tắt Hiện tượng (Symptoms)

Trong quá trình phát triển và kiểm thử giao diện trang Khám phá khóa học (`/lms/student/discover`), hai sự cố lớn đã phát sinh liên quan đến hai engine trình duyệt khác nhau (Blink/Chrome & Gecko/Firefox):

| Trình duyệt | Hiện tượng quan sát được | Tác động UX |
|---|---|---|
| **Google Chrome (Blink Engine)** | Khi người dùng cuộn tới cuối batch 1 (9 khóa học đầu tiên), hệ thống tải batch 2. Ngay khi batch 2 tải xong, trình duyệt **tự động đưa vị trí cuộn xuống tận cùng của batch 2**, lập tức kích hoạt tiếp batch 3, batch 4... liên tục lặp lại không dừng cho tới khi tải toàn bộ khóa học. | Người dùng không thể dừng lại ở giữa danh sách để xem các khóa học ở batch mới. |
| **Mozilla Firefox (Gecko Engine)** | Khi truy cập đường dẫn `/lms/student/discover`, người dùng **bị rơi vào vị trí lưng chừng ở giữa trang** (tiêu đề banner "Khám Phá Khóa Học" bị đẩy khuất lên trên mép màn hình, thanh bộ lọc nằm ở đỉnh viewport). | Làm mất banner tiêu đề trang, gây trải nghiệm bối rối cho học viên khi mới mở trang. |

---

## 2. Phân tích Nguyên nhân Gốc rễ Kỹ thuật (Root Cause Analysis)

### 2.1. Tự động đưa xuống cuối batch & Lặp vô tận trên Chrome (Browser Scroll Anchoring)
- **Cơ chế CSS Scroll Anchoring (`overflow-anchor`)**: Mặc định các trình duyệt hiện đại (Chrome/Edge) bật thuộc tính `overflow-anchor: auto` cho `html`, `body` và các container cuộn.
- **Quá trình xảy ra lỗi**:
  1. Người dùng cuộn tới cuối batch 1, phần tử sentinel (`InfiniteScrollTrigger`) đi vào viewport.
  2. Hàm `loadMore()` được gọi, 9 card mới được chèn vào DOM **phía trên** sentinel.
  3. Engine Blink (Chrome) xác định loader spinner là "anchor node" đang nhìn thấy. Để giữ cho anchor node này không bị đẩy mất khỏi viewport, Chrome **tự động cộng thêm chiều cao của 9 card mới (~1050px)** vào `window.scrollY`.
  4. Hậu quả: `window.scrollY` tự động bị đẩy xuống cuối batch 2 -> sentinel vẫn nằm trong viewport -> `IntersectionObserver` kích hoạt lại ngay lập tức và lặp lại không ngừng.

### 2.2. Hiện tượng rơi vào giữa trang khi vừa truy cập trên Firefox (Async Dynamic Layout Shift)
- **Quá trình xảy ra lỗi**:
  1. Khi vừa mount trang `/lms/student/discover`, mảng `recommendedCourses` ban đầu là rỗng `[]`. Giao diện hiển thị Header banner, thanh Bộ lọc danh mục và 6 card skeleton.
  2. Sau ~500ms, API gợi ý AI (`getRecommendations`) phản hồi và chèn một `<section>` mới (chiều cao ~380px) **ngay phía trên** thanh bộ lọc danh mục.
  3. Engine Gecko (Firefox) thực hiện cuộn neo (scroll anchor) để giữ vị trí tương đối của thanh bộ lọc danh mục so với viewport -> tự động dịch chuyển `window.scrollY` tăng thêm ~380px.
  4. Hậu quả: Banner tiêu đề *"Khám Phá Khóa Học"* ở trên cùng bị đẩy khuất ra khỏi màn hình, thanh bộ lọc nằm ở đỉnh màn hình.

### 2.3. Sự cố dừng ở Batch 2 sau khi sửa đợt 1 (IntersectionObserver Transition State Trap)
- **Cơ chế của IntersectionObserver**: Chỉ phát thông báo khi có **sự thay đổi trạng thái giao điểm (transition)** từ `isIntersecting: false` $\rightarrow$ `isIntersecting: true`.
- Khi đợt sửa đầu tiên áp dụng cơ chế khóa `canTriggerRef` sau khi load batch 2:
  - Callback ban đầu của `IntersectionObserver` khi batch 2 hoàn tất bị chặn.
  - Sau đó, do sentinel **vẫn nằm trong khu vực quan sát (intersecting)**, khi người dùng cuộn chuột tiếp xuống dưới, `IntersectionObserver` **không phát thêm callback nào nữa** (vì không có thay đổi trạng thái từ false thành true).
  - Hậu quả: Hệ thống hoàn toàn không biết người dùng đã cuộn xuống tiếp, khiến việc tải batch 3 bị dừng lại vĩnh viễn.

---

## 3. Kiến trúc Giải pháp Kỹ thuật (Technical Solution Architecture)

Để giải quyết triệt để 100% các hiện tượng trên ở cả Chrome và Firefox mà không gây gãy luồng cuộn tự nhiên của người dùng, 3 lớp bảo vệ đã được triển khai:

```text
[Trình duyệt Scroll] 
        │
        ├──► 1. Global Scroll Anchoring Disabled (reset.css)
        │      └── overflow-anchor: none (Khóa việc Chrome tự ý tăng scrollY)
        │
        ├──► 2. Layout Shift Guard (discover/page.tsx)
        │      ├── window.history.scrollRestoration = "manual"
        │      └── Restores top: 0 when async AI Recommendations load
        │
        └──► 3. Dual-Trigger Sentinel Component (InfiniteScrollTrigger.tsx)
               ├── Persistent IntersectionObserver (Không unmount/re-create)
               ├── Post-load Cooldown Settle (300ms lock ngăn loop)
               └── Throttled Window Scroll Listener (Kích hoạt batch 3, 4, 5... liên tục)
```

### 3.1. Vô hiệu hóa Scroll Anchoring toàn cục (`src/styles/base/reset.css`)
Thêm directive `overflow-anchor: none` vào reset stylesheet toàn hệ thống:

```css
/* src/styles/base/reset.css */
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-anchor: none; /* Khóa triệt để scroll anchoring */
}

*, ::before, ::after {
  overflow-anchor: none;
}
```

### 3.2. Cấu trúc Dual-Trigger Sentinel & Layout Settle Lock (`src/components/lms/shared/InfiniteScrollTrigger.tsx`)
Triển khai cơ chế lắng nghe kép kết hợp khóa cooldown 300ms để đảm bảo:
- Không bị tự động đẩy xuống cuối batch mới.
- Luôn liên tục tải các batch tiếp theo (batch 3, 4, 5...) khi người dùng cuộn xuống dưới.

```tsx
// src/components/lms/shared/InfiniteScrollTrigger.tsx
import { useEffect, useRef } from "react";
import { Spinner } from "./Spinner";

export function InfiniteScrollTrigger({
  onLoadMore,
  hasMore,
  loading = false,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
}) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  const isLockedRef = useRef(false);

  // Khóa cooldown 300ms sau khi một batch hoàn tất tải (loading: true -> false)
  useEffect(() => {
    if (loading) {
      isLockedRef.current = true;
    } else {
      const timer = setTimeout(() => {
        isLockedRef.current = false;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (!hasMore) return;

    const tryTrigger = () => {
      if (loadingRef.current || !hasMoreRef.current || isLockedRef.current) return;
      const element = triggerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Kiểm tra khoảng cách sentinel với viewport bottom
      if (rect.top <= windowHeight + 150 && rect.bottom >= -50) {
        isLockedRef.current = true;
        onLoadMoreRef.current();
      }
    };

    // 1. Trigger qua IntersectionObserver
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && triggerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            tryTrigger();
          }
        },
        { rootMargin: "150px" }
      );
      observer.observe(triggerRef.current);
    }

    // 2. Trigger qua Throttled Window Scroll Listener (bảo hiểm khi IntersectionObserver đứng yên)
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        tryTrigger();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [hasMore]);

  if (!hasMore) return null;

  return (
    <div
      ref={triggerRef}
      className="w-full flex items-center justify-center py-6 [overflow-anchor:none]"
      style={{ overflowAnchor: "none" }}
      aria-live="polite"
      aria-busy={loading}
    >
      {loading ? (
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-[#0F1E35]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-blue-500/20 shadow-sm animate-in fade-in duration-200">
          <Spinner className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
          <span>Đang tải thêm khóa học...</span>
        </div>
      ) : (
        <div className="h-6" />
      )}
    </div>
  );
}
```

### 3.3. Khắc phục Layout Shift tại Page Level (`src/app/(learning)/lms/student/discover/page.tsx`)
Bổ sung cấu hình `scrollRestoration = "manual"` và giữ vững vị trí `top = 0` khi phần gợi ý AI tải bất đồng bộ:

```tsx
// Thắt chặt scroll restoration khi mount
useEffect(() => {
  if (typeof window !== "undefined") {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }
}, []);

// Giữ vị trí top = 0 khi AI recommendations xuất hiện muộn
useEffect(() => {
  if (recommendedCourses.length > 0 && typeof window !== "undefined" && window.scrollY < 50) {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }
}, [recommendedCourses]);
```

---

## 4. Bảng So Sánh Trạng Thái (Before vs After)

| Kịch bản kiểm thử | Trạng thái Ban đầu (Before) | Trạng thái Sau khi Sửa (After) |
|---|---|---|
| **Tải batch tiếp theo trên Chrome** | Tự động tăng `scrollY` đưa xuống cuối batch 2, lặp lại không ngừng tới hết bài. | Vị trí cuộn **giữ nguyên 100%** ở ranh giới giữa batch 1 và batch 2. |
| **Cuộn tiếp qua các batch tiếp theo (Batch 3, 4...)** | Dừng hẳn ở batch 2, cuộn xuống dưới không load tiếp. | Tải liên tục mượt mà từng batch một khi cuộn tới cuối danh sách. |
| **Vào trang `/lms/student/discover` trên Firefox** | Bị trôi cuộn xuống giữa trang, khuất mất banner tiêu đề "Khám Phá Khóa Học". | Hiển thị chuẩn xác từ đỉnh trang (`top = 0`), giữ đầy đủ Banner tiêu đề. |

---

## 5. Danh sách Tệp tin Liên quan (Affected Files)

- [`src/styles/base/reset.css`](file:///home/thanh/BDCHub---Frontend/src/styles/base/reset.css) - Khóa scroll anchoring cấp hệ thống.
- [`src/components/lms/shared/InfiniteScrollTrigger.tsx`](file:///home/thanh/BDCHub---Frontend/src/components/lms/shared/InfiniteScrollTrigger.tsx) - Component sentinel xử lý lazy loading kép.
- [`src/app/(learning)/lms/student/discover/page.tsx`](file:///home/thanh/BDCHub---Frontend/src/app/(learning)/lms/student/discover/page.tsx) - Khóa scroll restoration và xử lý layout shift.
- [`src/components/lms/student/discover/DiscoverCourseGrid.tsx`](file:///home/thanh/BDCHub---Frontend/src/components/lms/student/discover/DiscoverCourseGrid.tsx) - Container chứa lưới các thẻ khóa học.
