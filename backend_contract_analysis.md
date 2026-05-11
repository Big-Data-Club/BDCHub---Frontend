# 📊 Phân tích Hợp đồng Backend & Chiến lược Mocking (MSW)

Dựa trên tài liệu Database tại: <https://big-data-club.github.io/Database-Documentation/>

Hệ thống được thiết kế theo kiến trúc Microservices với 3 Database độc lập. Dưới đây là danh sách các API cần thiết và Schema tương ứng để thiết lập MSW.

---

## 1. Auth & Management Service (`auth_db`)

Quản lý người dùng, phân quyền, thông báo và các tác vụ vận hành CLB.

### 📋 Danh sách Bảng (Tables)

- `users`: Thông tin định danh người dùng.
- `tasks`: Nhiệm vụ được giao.
- `user_tasks`: Bảng trung gian gán nhiệm vụ cho user.
- `announcements`: Thông báo chung.
- `events`: Lịch sự kiện.

### 🛠 Thiết kế API Mock (MSW)

| Method | Endpoint | Mô tả | Data Schema (Keys) |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/auth/me` | Lấy profile hiện tại | `id, email, full_name, avatar_url, role` |
| GET | `/api/v1/auth/announcements` | Danh sách thông báo | `id, title, content, created_at, priority` |
| GET | `/api/v1/auth/tasks` | Nhiệm vụ của tôi | `id, title, status, deadline, score` |

---

## 2. Learning Management System Service (`lms_db`)

Trái tim của hệ thống, quản lý khóa học, bài học và tương tác học tập.

### 📋 Danh sách Bảng (Tables)

- `courses`: Metadata của khóa học.
- `course_sections`: Các chương trong khóa học.
- `section_content`: Nội dung bài học (Video, Document, Link).
- `enrollments`: Dữ liệu đăng ký học.
- `quizzes` & `quiz_questions`: Hệ thống bài kiểm tra.
- `forum_posts` & `forum_comments`: Diễn đàn thảo luận.

### 🛠 Thiết kế API Mock (MSW)

| Method | Endpoint | Mô tả | Data Schema (Keys) |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/lms/courses` | Danh sách khóa học | `id, title, description, thumbnail, instructor_id` |
| GET | `/api/v1/lms/courses/{id}` | Chi tiết khóa học & Chương | `id, title, sections: [{ id, title, contents: [] }]` |
| GET | `/api/v1/lms/progress` | Tiến độ học tập | `course_id, completed_lessons, total_lessons` |
| POST | `/api/v1/lms/enroll` | Đăng ký khóa học | `course_id, user_id, status` |

---

## 3. AI Services (`ai_db`)

Cung cấp các tính năng thông minh, Chatbot và Knowledge Graph.

### 📋 Danh sách Bảng (Tables)

- `knowledge_nodes`: Các node kiến thức trong hệ thống.
- `knowledge_node_relations`: Quan hệ giữa các node.
- `agent_sessions`: Quản lý phiên chat với AI.
- `agent_messages`: Lịch sự tin nhắn.
- `flashcards`: Thẻ ghi nhớ (Flashcards).
- `llm_models`: Danh sách các model AI được hỗ trợ.

### 🛠 Thiết kế API Mock (MSW)

| Method | Endpoint | Mô tả | Data Schema (Keys) |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/ai/chat/session` | Tạo phiên chat mới | `session_id, user_id, model_id` |
| POST | `/api/v1/ai/chat/message` | Gửi tin nhắn cho AI | `message, session_id` -> Trả về `text_response` |
| GET | `/api/v1/ai/knowledge-map` | Lấy sơ đồ kiến thức | `nodes: [{id, label, type}], edges: [{from, to}]` |
| GET | `/api/v1/ai/flashcards` | Flashcards cần học hôm nay | `id, front_text, back_text, last_reviewed` |

---

## 🔍 Chi tiết Schema Mapping cho Auth Service

Để đảm bảo Frontend hoạt động ổn định, các mock data trong `src/mocks/handlers/auth.ts` đã được thiết lập theo đúng cấu trúc cột của Database:

### Bảng `users` (Mock cho `/api/v1/auth/me`)

| Key | Type | Ghi chú |
| :--- | :--- | :--- |
| `id` | `UUID` | Khóa chính |
| `full_name` | `String` | Họ và tên hiển thị |
| `email` | `String` | Email đăng nhập (unique) |
| `avatar_url` | `String` | Link ảnh đại diện (Faker image) |
| `role` | `Enum` | `ADMIN`, `TEACHER`, `STUDENT` |
| `status` | `Enum` | `ACTIVE`, `INACTIVE` |

### Bảng `announcements` (Mock cho `/api/v1/auth/announcements`)

| Key | Type | Ghi chú |
| :--- | :--- | :--- |
| `id` | `UUID` | |
| `title` | `String` | Tiêu đề thông báo |
| `content` | `Text` | Nội dung chi tiết (HTML/Markdown) |
| `priority` | `Enum` | `HIGH`, `MEDIUM`, `LOW` |

---

---

## 🔍 Chi tiết Schema Mapping cho LMS Service

### Bảng `courses` (Mock cho `/api/v1/lms/courses`)

| Key | Type | Ghi chú |
| :--- | :--- | :--- |
| `id` | `UUID` | ID khóa học |
| `title` | `String` | Tên khóa học |
| `description` | `Text` | Mô tả khóa học |
| `thumbnail` | `String` | URL ảnh đại diện |
| `price` | `Number` | Giá (VNĐ) |
| `level` | `Enum` | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` |

### Bảng `course_sections` & `section_content`

| Key | Type | Ghi chú |
| :--- | :--- | :--- |
| `id` | `UUID` | ID chương/bài học |
| `title` | `String` | Tiêu đề |
| `type` | `Enum` | `VIDEO`, `DOCUMENT`, `QUIZ` |
| `is_preview` | `Boolean` | Bài học xem thử |

---

## 🔍 Chi tiết Schema Mapping cho AI Service

### Bảng `agent_sessions` & `agent_messages`

| Key | Type | Ghi chú |
| :--- | :--- | :--- |
| `session_id` | `UUID` | ID phiên chat |
| `role` | `Enum` | `user`, `assistant` |
| `content` | `Text` | Nội dung tin nhắn |

### Bảng `flashcards`

| Key | Type | Ghi chú |
| :--- | :--- | :--- |
| `front_text` | `String` | Mặt trước thẻ |
| `back_text` | `String` | Mặt sau thẻ |
| `next_review` | `DateTime` | Thời gian ôn tập tiếp theo |

---

## 🚀 Hướng dẫn kích hoạt MSW trong Dự án

Tôi đã khởi tạo sẵn bộ khung Mocking hoàn chỉnh cho tất cả các Service trong thư mục `src/mocks/`.

1. **Cấu trúc Mocking:**
   - `src/mocks/handlers/auth.ts`: Mock các API xác thực & User.
   - `src/mocks/handlers/lms.ts`: Mock các API khóa học & học tập.
   - `src/mocks/handlers/ai.ts`: Mock các API Chatbot & AI.
2. **Kiểm soát bật/tắt:** Sử dụng biến `NEXT_PUBLIC_API_MOCKING=enabled` trong file `.env.local`.
3. **Kích hoạt:** Hệ thống đã được nhúng sẵn vào `MainProvider.tsx` (phía Client) và NextAuth Route (phía Server).

---
> [!IMPORTANT]
> **Xem hướng dẫn sử dụng chi tiết (Tài khoản, Mật khẩu, Cách bật/tắt) tại file: [MOCK_USAGE_GUIDE.md](file:///home/thanh/BDCHub---Frontend/MOCK_USAGE_GUIDE.md)**

---
*Tài liệu này được tổng hợp tự động để hỗ trợ phát triển Frontend Big Data Club Hub.*
