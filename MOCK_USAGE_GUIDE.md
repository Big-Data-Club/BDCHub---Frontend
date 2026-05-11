# 🚀 Hướng dẫn Sử dụng Hệ thống API Mocking (MSW)

Tài liệu này hướng dẫn cách sử dụng các tài khoản và dữ liệu giả lập để phát triển Frontend mà không cần Backend thật.

---

## 🔑 1. Thông tin Đăng nhập (Authentication)

Sử dụng tài khoản sau để đăng nhập vào hệ thống khi Mocking đang bật:

| Trường | Giá trị |
| :--- | :--- |
| **Email** | `admin@bigdataclub.io` |
| **Mật khẩu** | `123456` |

> [!TIP]
> Sau khi đăng nhập thành công, bạn sẽ nhận được một Token giả lập và quyền `ADMIN`. Bạn có thể thay đổi thông tin này trong file `src/mocks/handlers/auth.ts`.

---

## ⚙️ 2. Cách Bật/Tắt Mocking

Bạn có thể kiểm soát việc sử dụng dữ liệu giả hay dữ liệu thật thông qua file `.env.local`:

1. Mở file `.env.local`.
2. Tìm biến `NEXT_PUBLIC_API_MOCKING`.
3. Cập nhật giá trị:
   - `NEXT_PUBLIC_API_MOCKING=enabled` (Để **BẬT** Mock).
   - `NEXT_PUBLIC_API_MOCKING=disabled` (Để **TẮT** Mock và kết nối Backend thật).
4. **Lưu ý:** Bạn cần khởi động lại server (`npm run dev`) sau khi thay đổi file `.env`.

---

## 📺 3. Cách Kiểm tra Hệ thống đang chạy

Để biết Mock API có đang hoạt động hay không, hãy kiểm tra tại 2 nơi:

### A. Trong Trình duyệt (Browser Console)

- Nhấn **F12** -> Tab **Console**.
- Tìm dòng: `✅ MSW Mocking Enabled`.
- Khi có request, bạn sẽ thấy các log như: `📢 [MSW] Mocking Announcements`.

### B. Trong Terminal (Cửa sổ chạy lệnh npm run dev)

- Vì NextAuth chạy ở phía Server, bạn sẽ thấy các log sau trong Terminal:
- `🖥️ [MSW Server] Mocking enabled on Next.js Server`.
- `🚀 [MSW] Incoming Login Request: ...`.

---

## 🛠 4. Danh sách các Service đã Mock

Hệ thống đã giả lập đầy đủ các API cho các trang sau:

1. **Dashboard:** Thông báo, Nhiệm vụ, Sự kiện.
2. **Users:** Danh sách thành viên, thông tin chi tiết.
3. **Leaderboard:** Bảng xếp hạng (tự động lọc các User `active: true`).
4. **Shared Knowledge (LMS):**
   - Màn hình chọn vai trò (Admin, Teacher, Student).
   - Danh sách khóa học, chương hồi, bài tập Quiz.
5. **AI Services:**
   - Chatbot Agent (có giả lập độ trễ phản hồi).
   - Knowledge Map (Sơ đồ kiến thức).
   - Flashcards.

---

## 📝 5. Cách chỉnh sửa Dữ liệu Mock

Nếu bạn muốn thay đổi nội dung dữ liệu (ví dụ: đổi tên khóa học, thêm user mới):

- **Auth/Users/Tasks:** Sửa tại `src/mocks/handlers/auth.ts`.
- **LMS/Courses:** Sửa tại `src/mocks/handlers/lms.ts`.
- **AI/Chat:** Sửa tại `src/mocks/handlers/ai.ts`.

Hệ thống sử dụng thư viện `@faker-js/faker` để tạo dữ liệu ngẫu nhiên một cách chuyên nghiệp.

---
*Mọi thắc mắc về hệ thống Mocking, vui lòng liên hệ trợ lý AI Antigravity.*
