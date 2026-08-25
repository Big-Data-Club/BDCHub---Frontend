---
target: src/components/home
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-25T05-20-39Z
slug: src-components-home
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Trạng thái hiển thị tốt trong Hero/Terminal, nhưng chưa có visual indicator rõ khi tương tác scroll ở các section dưới. |
| 2 | Match System / Real World | 3 | Thuật ngữ phù hợp (Big Data, HPC, AI), iconography chuẩn và trực quan. |
| 3 | User Control and Freedom | 2 | Thiếu lối thoát nhanh hoặc nút back-to-top khi cuộn qua các phần landing dài. |
| 4 | Consistency and Standards | 3 | Tuân thủ tốt BDC Design System, nhưng màu hover trên button copy trích dẫn chưa đồng bộ chuẩn token contrast. |
| 5 | Error Prevention | 3 | Copy citation có state feedback (Đã chép) rõ ràng, giảm thao tác nhầm. |
| 6 | Recognition Rather Than Recall | 3 | Cấu trúc thẻ dự án và công bố khoa học dễ nhận biết, icon chỉ dẫn trực quan. |
| 7 | Flexibility and Efficiency | n/a | Landing page mục đích thuyết phục/truyền thông (Persuade mode). |
| 8 | Aesthetic and Minimalist Design | 3 | Visual ấn tượng với phong cách Cyber/Cosmic, tuy nhiên mật độ thông tin ở Projects & Publications hơi dày. |
| 9 | Error Recovery | 3 | Feedback thao tác sao chép hiển thị chuẩn xác (State Emerald). |
| 10 | Help and Documentation | n/a | Landing page không yêu cầu tài liệu hướng dẫn sâu (Persuade mode). |
| **Total** | | **23/32** | **Good (71.8%)** |

#### Design Specificity Verdict

**LLM assessment**: Landing page có nhận diện thương hiệu công nghệ/Big Data rất riêng biệt với theme Dark Cosmic & Cyber Cyan. Bố cục Hero với Terminal Visual Core rất giàu cá tính. Tuy nhiên, một số thành phần bên dưới như `Projects.tsx` vẫn còn lặp lại cấu trúc danh sách thẻ truyền thống, chưa tận dụng tối đa nhịp điệu thị giác (visual rhythm) của thiết kế Cybernetic.

**Deterministic scan**: Detector phát hiện 5 cảnh báo `gray-on-color` tại `src/components/home/Projects.tsx` (sử dụng text gray/slate trên nền button/badge gradient `bg-blue-600` và `bg-blue-50`, làm giảm độ tương phản và gây washed-out).

**Visual overlays**: Không chạy trên browser live injection (sử dụng CLI detector scan trực tiếp trên source tree `src/components/home`).

#### Overall Impression
Trang landing có ấn tượng thị giác ban đầu mạnh mẽ ở Hero section với animations và terminal độc đáo. Tuy nhiên, độ hấp dẫn giảm dần ở các section tiếp theo do thiếu các khoảng nghỉ thị giác (visual breath) và tương phản màu sắc bị trùng ở một số hover state.

#### What's Working
1. **Hero Section với Terminal Visual Core**: Kết hợp animation Framer Motion mượt mà và cá tính Big Data / HPC rõ nét.
2. **Interactive Citation Copy**: Trải nghiệm sao chép trích dẫn bài báo khoa học với chuyển đổi icon/state tức thì (`Đã chép`) rất mượt.
3. **Design Token Hierarchy**: Hệ màu Cosmic Navy (`#050b18`) kết hợp Cyber Cyan/Tech Blue tạo cảm giác futuristic hiện đại.

#### Priority Issues

- **[P1] Visual Contrast & Anti-pattern Gray-on-Color**: Trong `Projects.tsx`, hover state của nút ArrowUpRight và badge trích dẫn dùng `text-slate-500/slate-400` trên nền `bg-blue-600`, làm mờ chữ và giảm khả năng đọc.
  - *Why it matters*: Làm giảm tính chuyên nghiệp và vi phạm tiêu chuẩn tương phản WCAG.
  - *Fix*: Đổi màu text trên nền active/hover thành màu trắng `text-white` hoặc cyan thuần `text-cyan-300`.
  - *Suggested command*: `$impeccable colorize`

- **[P1] Density & Spatial Rhythm ở Projects & Publications**: Hai cột thông tin lớn nằm cạnh nhau với khoảng cách các thẻ tương đồng, gây cảm giác chật chội trên màn hình laptop vừa (1024px - 1280px).
  - *Why it matters*: Làm tăng tải nhận thức (Cognitive Load), người dùng dễ lướt qua thay vì đọc kỹ.
  - *Fix*: Nâng cấp layout grid, thêm nhịp điệu phân cấp thị giác hoặc dùng tab/accordion toggle cho Publications.
  - *Suggested command*: `$impeccable layout`

- **[P2] Thiếu Quick Action / Back-to-Top Indicator**: Khi cuộn sâu xuống bên dưới landing page, thanh điều hướng không theo kèm hoặc thiếu nút quay về Hero.
  - *Why it matters*: Giảm khả năng User Control & Freedom khi người dùng muốn đăng ký/tìm hiểu lại Hero CTA.
  - *Fix*: Thêm floating quick action bar hoặc sticky header/back-to-top pill.
  - *Suggested command*: `$impeccable adapt`

#### Persona Red Flags

- **Jordan (Confused First-Timer)**: Nhìn thấy danh sách bài báo khoa học quá dài với nhiều thuật ngữ hàn lâm xếp liền nhau mà không có bộ lọc (Filter by Year/Topic) hay giải thích tóm tắt, có nguy cơ bỏ qua section này.
- **Alex (Power User)**: Cuộn qua landing page nhưng không có phím tắt điều hướng (như Press 'J'/'K' hoặc shortcut đến ngay form đăng ký), phải cuộn thủ công toàn bộ chiều dài trang.

#### Minor Observations
- Hiệu ứng `backdrop-blur-md` trên thẻ `Projects.tsx` rất đẹp nhưng nền `bg-white/90` ở Light Mode còn hơi gắt so với tổng thể theme dark-first.
- Icon `Sparkles` ở công bố khoa học có màu cyan cố định, có thể thêm hiệu ứng pulse nhẹ để tăng tính sinh động.

#### Questions to Consider
- *Liệu phần Công bố khoa học có nên chuyển sang dạng carousel slider hoặc tab xem theo năm để tiết kiệm không gian không?*
- *Chúng ta có nên làm cho phần CTA trong Hero trở nên nổi bật hơn nữa với hiệu ứng glow pulse đồng bộ không?*
