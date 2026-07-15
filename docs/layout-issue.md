# Tài liệu Phân tích và Khắc phục Lỗi Giao diện LMS Student Course

## 1. Mô tả vấn đề
Trong giao diện học tập của học viên (`/lms/student/courses/[courseId]/learn`), thiết kế hoạt động không đồng nhất giữa các kích thước màn hình:
- **Màn hình nhỏ (Mobile/Tablet/Laptop nhỏ):** Sidebar bài học dính sát vào mép trái màn hình, nội dung học tập hiển thị bình thường.
- **Màn hình lớn (Desktop/Monitor lớn):**
  - Xuất hiện khoảng trống (margin/gutter) lớn ở bên trái của sidebar và bên phải của nội dung chính.
  - Sidebar không còn dính vào mép trái của trình duyệt mà bị đẩy vào giữa.
  - Có sự không đồng nhất về mặt căn lề giữa thanh điều hướng trên cùng (Global Header) và phần nội dung khóa học phía dưới.
  - Khi thu gọn/mở rộng thanh sidebar chính (sidebar của toàn trang), nội dung trang học có cảm giác bị lệch và dồn sang phải, trong khi các trang như Tổng quan học tập hay khám phá khóa học không gặp hiện tượng này.

## 2. Nguyên nhân kỹ thuật
1. **Sự không đồng nhất về container giữa các trang:**
   - Các trang như Tổng quan học tập (`StudentDashboard`) hay Khám phá khóa học dùng chung cấu trúc container `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (chiều rộng tối đa `1280px` và căn giữa).
   - Thanh điều hướng trên cùng của học viên (`StudentLayout`) cũng sử dụng container `max-w-7xl mx-auto`.
2. **Nguyên lý của Sidebar Khóa học (Component đặc biệt):**
   Sidebar khóa học cần bám sát lề trái của trang học (cạnh sidebar chính), đồng thời phần Header khóa học (chứa `GridBackground`) phải nằm ở phía trên cùng của cả Sidebar và phần nội dung chính.
3. **Sự không đồng nhất về chiều cao và vị trí tiêu đề:**
   - Chiều cao Header của trang học ban đầu lớn hơn (`py-6 md:py-8`) so với trang Tổng quan học tập (`py-4 md:py-5`).
   - Việc đẩy lề trái của tiêu đề Header bằng độ rộng của Sidebar khóa học vô tình làm cho tiêu đề bị dồn quá nhiều sang phải, tạo cảm giác Sidebar vẫn đang chia dọc Header thay vì Header nằm trọn vẹn ở phía trên.

## 3. Các phương pháp đã thử
### Phương pháp 1: Loại bỏ căn giữa cục bộ của trang học (`LearnPage`)
- **Kết quả:** Không giải quyết được triệt để việc sidebar bị đẩy vào trong và sự lệch pha với header.

### Phương pháp 2: Chuyển đổi sang Layout dạng Fluid (Tràn viền) và Căn lề trái nội dung
- **Kết quả:** Giải quyết được việc sidebar bám mép, nhưng gây ra lỗi lệch trục hiển thị nghiêm trọng khi thu gọn sidebar chính của trang.

### Phương pháp 3: Đưa Header chứa GridBackground lên phía trên cả Sidebar
- **Kết quả:** Header khóa học hiển thị đẹp mắt, nhưng vẫn bị lệch trục khi thu gọn sidebar chính.

### Phương pháp 4: Đồng bộ hóa toàn bộ Layout theo thiết kế lưới của hệ thống (`max-w-7xl mx-auto`)
- **Kết quả:** Đồng bộ tốt trục căn giữa, nhưng làm phát sinh khoảng trống màu xám ở lề trái của Sidebar khóa học và lề phải của Header.

### Phương pháp 5: Layout Tràn viền (Fluid) phối hợp Căn giữa Nội dung trong Main
- **Kết quả:** Sidebar bám sát lề trái, nhưng phần Header bị đưa vào trong cột bên phải (bên cạnh Sidebar), quay trở lại lỗi ban đầu.

### Phương pháp 6: Đồng bộ hóa cấu trúc Header trên cùng và chiều cao (Đã hoàn thành)
- **Giải pháp áp dụng:**
  1. Đưa `<header>` chứa `GridBackground` lên phía trên cùng của Layout (trên cả Sidebar). Thiết kế tràn viền (`w-full`).
  2. Đồng bộ hóa hoàn toàn container chứa nội dung của Header theo chuẩn `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full` (giống 100% với trang Tổng quan học tập và Khám phá khóa học). Không sử dụng Placeholder đẩy lề để tiêu đề bắt đầu từ lề trái chuẩn của hệ thống, nằm đè lên trên vùng không gian dọc của Sidebar.
  3. Đồng bộ hóa chiều cao bằng cách điều chỉnh padding của Header về `py-4 md:py-5` (trước đó là `py-6 md:py-8`).
  4. Bên dưới Header, Sidebar khóa học (`aside`) bám sát lề trái và phần Main Content (`main`) ở bên phải. Căn giữa thẻ bài học bằng `max-w-6xl mx-auto`.
- **Kết quả:**
  - Tiêu đề khóa học lớn nằm ở trên cùng, có cùng chiều cao, hiệu ứng lưới và khoảng cách lề trái chính xác tuyệt đối như các trang Tổng quan học tập và Khám phá khóa học.
  - Sidebar khóa học bám sát mép trái (không có khoảng trống thừa).
  - Giao diện có chiều sâu, Header bao phủ bên trên tạo cảm giác Sidebar nằm bên dưới Header một cách rõ rệt.
