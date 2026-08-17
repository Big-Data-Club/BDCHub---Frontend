---
target: /home/thanh/BDCHub---Frontend/src/app/(learning)/lms/student/discover/page.tsx
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-17T09-02-29Z
slug: src-app-learning-lms-student-discover-page-tsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Trạng thái loading skeleton và pagination count rõ ràng, phản hồi tức thì. |
| 2 | Match System / Real World | 4 | Thuật ngữ "Khám phá", "Cơ bản", "Tải thêm" quen thuộc với học viên. |
| 3 | User Control and Freedom | 3 | Dễ dàng lọc lại, reset filter, toggle form cá nhân hóa. |
| 4 | Consistency and Standards | 3 | Sử dụng thiết kế BDC Rhythm v3 và các primitive components tiêu chuẩn. |
| 5 | Error Prevention | 2 | Ảnh thumbnail bị lỗi link không crash nhờ fallback, tuy nhiên không có cache error handler triệt để. |
| 6 | Recognition Rather Than Recall | 4 | Hiển thị đầy đủ gợi ý, tag chip, badge trình độ, giúp người dùng nhận diện nhanh. |
| 7 | Flexibility and Efficiency | 3 | Vừa hỗ trợ cuộn vô tận (Infinite Scroll) vừa có nút "Tải thêm thủ công" làm accelerator. |
| 8 | Aesthetic and Minimalist Design | 3 | Giao diện hiện đại (dark-first blue navy), thẻ card có hiệu ứng hover glow. |
| 9 | Error Recovery | 2 | Alert thông báo lỗi chung chung ("Không thể tải danh sách khóa học") thiếu action retry trực tiếp tại chỗ. |
| 10 | Help and Documentation | 3 | Có tooltip và mô tả phụ giải thích rõ các lựa chọn cá nhân hóa. |
| **Total** | | **30/40** | **Good (Khá)** |

#### Design Specificity Verdict

**LLM assessment**: Trang `/lms/student/discover` được xây dựng đúng theo tinh thần BDC Design Rhythm v3.0 dành cho hệ thống LMS. Việc kết hợp giữa bộ lọc đa chiều (Search, Level, Categories) và hệ thống gợi ý AI (Recommendation System) tạo cảm giác cá nhân hóa cao. Về mặt kỹ thuật Lazy Loading, trang đã kết hợp 3 kỹ thuật thực tế tiêu chuẩn:
1. **Lazy Fetching / Pagination**: Phân trang server-side (`PAGE_SIZE = 9`), tải theo đợt.
2. **Infinite Scrolling Trigger**: Dùng `IntersectionObserver` với `rootMargin: "400px"` để trigger fetching trước khi học viên cuộn xuống tới đáy.
3. **Image Lazy Loading**: Dùng Next.js `<Image loading="lazy" />` cho thumbnail khóa học.

Tuy nhiên, khi soi xét kĩ dưới góc độ **Production-grade Craft & Design Performance Patterns**, kỹ thuật Lazy Loading tại trang này có một số **điểm nghẽn/anti-pattern** đáng lưu ý:
- **`loading="lazy"` bị vô hiệu hóa bởi `unoptimized`**: Trong `CourseCard.tsx`, thẻ `<Image>` khai báo thuộc tính `unoptimized` kết hợp với `loading="lazy"`. Đối với `next/image`, `unoptimized` sẽ bypass quá trình nén và tạo responsive `srcset` của Next.js server, làm giảm hiệu quả lazy loading thực tế đối với các ảnh dung lượng lớn từ CDN bên ngoài.
- **Thiếu Component Dynamic Import (Code Splitting)**: Phần `Preferences Panel` (xử lý form cá nhân hóa gợi ý) và `Recommendation Carousel/Section` là các component có tương tác phụ nhưng hiện tại được import tĩnh trực tiếp vào bundle chính của trang.
- **Race Condition & Refetch Unnecessary**: `loadInitialData` tải 100 khóa học (`page_size: 100`) chỉ để trích xuất danh sách Tag/Categories ở client. Việc này tạo ra đợt load dư thừa dữ liệu thô ngay lần đầu render.

**Deterministic scan**: Detector chạy không phát hiện lỗi trực tiếp trên `page.tsx`, nhưng trên `CourseCard.tsx` phát hiện một số điểm lưu ý về typography (`text-[10px]`, `text-[7px]`) ngoài type ramp chuẩn.

#### Overall Impression
Trang `/lms/student/discover` đáp ứng tốt UX tiêu chuẩn cho học viên với trải nghiệm cuộn mượt mà và Skeleton loading đẹp mắt. Tuy nhiên, kiến trúc Lazy Loading ở cấp độ **Asset & Data Fetching** mới dừng ở mức cơ bản, chưa tối ưu triệt để cho môi trường Production lượng truy cập cao.

#### What's Working
1. **Trải nghiệm Infinite Scroll mượt mà với `rootMargin` hợp lý**: `InfiniteScrollTrigger` thiết lập `rootMargin: "400px"`, giúp tải trước nội dung trước khi học viên chạm đáy màn hình mà không tạo cảm giác khựng (stuttering).
2. **Tối ưu trải nghiệm chờ với Skeleton Loaders**: Trạng thái chờ render thẻ khóa học (`CourseCardSkeleton`) và chỉ báo tải thêm (`Spinner`) tuân thủ chuẩn visual feedback.
3. **Cơ chế fallback linh hoạt**: Tích hợp cả tự động tải khi cuộn (Infinite Scroll) và nút bấm thủ công ("Tải thêm khóa học thủ công"), giúp đảm bảo accessibility cho người dùng điều hướng bằng bàn phím.

#### Priority Issues

- **[P1] Asset Lazy Loading bị suy giảm do `unoptimized` trên Next.js Image**
  - *Why it matters*: Ảnh thumbnail khóa học được nạp nguyên bản mà không có responsive sizing hay nén WebP/AVIF. Khi cuộn vô tận, nhiều thẻ card hiển thị cùng lúc sẽ làm quá tải băng thông mạng và GPU render.
  - *Fix*: Bỏ `unoptimized` (hoặc cấu hình `remotePatterns` trong `next.config.ts`), sử dụng responsive `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` đi kèm `loading="lazy"`.
  - *Suggested command*: `$impeccable optimize`

- **[P1] Over-fetching dữ liệu ở lần tải đầu (`loadInitialData`)**
  - *Why it matters*: `lmsService.listPublishedCourses({ page_size: 100 })` được gọi ở client chỉ để trích xuất các danh mục/tags. Điều này đi ngược lại nguyên lý Lazy Data Loading, bắt client tải về 100 đối tượng `Course` hoàn chỉnh không cần thiết.
  - *Fix*: Tách API lấy danh sách categories/tags riêng (ví dụ `/api/v1/courses/categories`) hoặc tính toán server-side/aggregate lightweight payload.
  - *Suggested command*: `$impeccable optimize`

- **[P2] Thiếu Dynamic Code Splitting cho các UI Component ít dùng**
  - *Why it matters*: Form "Cá nhân hóa gợi ý" (`showPreferences`) và các thư viện hỗ trợ liên quan nằm trong bundle ban đầu mặc dù học viên hiếm khi mở ra liên tục.
  - *Fix*: Áp dụng `next/dynamic` cho `PreferencesPanel` với `ssr: false` để giảm Initial JS Bundle size.
  - *Suggested command*: `$impeccable optimize`

- **[P2] Hiệu ứng Render Stuttering khi append danh sách khóa học**
  - *Why it matters*: Khi cuộn để nạp thêm `publishedCourses`, toàn bộ danh sách bị re-render nếu không dùng React virtualization (`react-window` hoặc `tanstack-virtual`) khi số lượng khóa học lên tới hàng trăm item.
  - *Fix*: Cân nhắc tích hợp Windowing/Virtualization nếu danh sách phát triển dài.
  - *Suggested command*: `$impeccable optimize`

#### Persona Red Flags

**Alex (Power User)**:
- Không thể chọn nhanh tag hoặc dùng phím tắt (`/` để search, `Esc` để đóng form cá nhân hóa).
- Khi cuộn nhanh qua nhiều trang, số lượng DOM node tăng liên tục làm chậm thao tác phím.

**Casey (Distracted Mobile User)**:
- Nạp ảnh unoptimized dung lượng lớn gây tốn dung lượng 3G/4G khi cuộn vô tận.
- Thao tác chọn bộ lọc Cấp độ / Chủ đề trên màn hình nhỏ chưa tối ưu thumb-zone.

#### Minor Observations
- `key={`page-${page}`}` trên `InfiniteScrollTrigger` làm remount component mỗi khi đổi trang, làm re-bind `IntersectionObserver` không cần thiết.

#### Questions to Consider
- *Chúng ta có nên triển khai Virtual Scrolling (Danh sách ảo) nếu số lượng khóa học tìm kiếm vượt quá 50-100 items hay không?*
- *API backend đã hỗ trợ endpoint chuyên dụng để trả về danh sách Categories thay vì client phải gọi list 100 courses hay chưa?*
