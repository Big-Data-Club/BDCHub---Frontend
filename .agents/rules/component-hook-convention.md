# Component & Hook Architecture Conventions

Mọi thao tác tạo mới, phân tách hoặc di chuyển tệp Component (`src/components/`) và Hook (`src/hooks/`) BẮT BUỘC tuân thủ các quy tắc sau:

## 1. Nơi tra cứu vị trí chuẩn:
- Chi tiết sơ đồ cây quyết định xem tại: [`docs/references/architecture/COMPONENT_HOOK_GUIDE.md`](file:///home/thanh/BDCHub---Frontend/docs/references/architecture/COMPONENT_HOOK_GUIDE.md)

## 2. Quy tắc cho Components (`src/components/`):
- **Không dùng PascalCase cho tên thư mục**: Tất cả các thư mục dưới `src/components/` phải dùng `kebab-case` / `lowercase` (ví dụ: `src/components/board/` - KHÔNG dùng `src/components/Board/`).
- **Modals**: Tất cả các component Modal phải nằm trong subfolder `modals/` của domain tương ứng (ví dụ: `src/components/lms/teacher/modals/EditCourseModal.tsx` hoặc `src/components/user/modals/CreateUserModal.tsx`). KHÔNG để loose ở root folder của domain.
- **Common App Components**: Component dùng chung toàn ứng dụng (như `LoadingState`, `SectionHeader`, `ShowMoreButton`, `CountDown`) đặt tại `src/components/common/` và xuất bản tại `src/components/common/index.ts`.
- **Storybook**: Tất cả các file `.stories.tsx` đặt trong `src/stories/` (ví dụ: `src/stories/home/Hero.stories.tsx`), KHÔNG đặt rải rác trong `src/components/`.

## 3. Quy tắc cho Hooks (`src/hooks/`):
- **Phân loại domain**: Tất cả hooks nằm trong các thư mục con theo domain (`auth/`, `common/`, `dashboard/`, `lms/`, `chat/`, `labs/`). KHÔNG đặt loose ở root `src/hooks/`.
- **Đuôi file `.ts` vs `.tsx`**:
  - Pure logic hooks (không render JSX) → **BẮT BUỘC dùng đuôi `.ts`**.
  - Provider hooks render JSX Provider Element (`<Ctx.Provider>`) → Dùng đuôi `.tsx`.
- **Barrel Export**: Mọi hook mới BẮT BUỘC phải được re-export tại `src/hooks/index.ts`.
