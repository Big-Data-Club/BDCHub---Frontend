---
timestamp: 2026-08-17T09-46-00Z
slug: src-app-learning-lms-student-ai-mentor-page-tsx
---
Method: single-context (sub-agent tool unavailable in default flow)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Trạng thái suy nghĩ AI & streaming rõ ràng, nhưng nút đóng/mở sidebar khi bị collapsed bị khuất và icon Console nhỏ |
| 2 | Match System / Real World | 3 | Thuật ngữ Tiếng Việt tự nhiên, phù hợp sinh viên HCMUT/BDC; tuy nhiên một số badge kỹ thuật (S-Score, RAG compression) hơi sâu về AI internals |
| 3 | User Control and Freedom | 2 | Thiếu nút Undo / Stop nhanh ở level message, chưa có nút xóa/sửa message user gửi sai, xóa session dùng confirm browser mặc định |
| 4 | Consistency and Standards | 3 | Đã áp dụng chuẩn Tech-Academic Terminal & Design Rhythm v3.0, tuy nhiên font-size dùng nhiều hằng số px lẻ (10.5px, 11px, 9px) |
| 5 | Error Prevention | 2 | Nút xóa session dùng `confirm()` mặc định của browser dễ bấm nhầm; chưa có Autosave draft cho thanh input khi người dùng vô tình bấm đổi session |
| 6 | Recognition Rather Than Recall | 3 | Gợi ý prompt mẫu (hints) xuất hiện tốt ở Empty State; danh sách chat có metadata turn_count và ngày tạo |
| 7 | Flexibility and Efficiency | 3 | Hỗ trợ phím tắt Ctrl+Shift+C toggle Console, Enter gửi tin nhắn, nhưng thiếu phím tắt tạo chat mới hoặc điều hướng nhanh |
| 8 | Aesthetic and Minimalist Design | 3 | Giao diện hiện đại, cosmic navy kết hợp cyber blue/cyan glow chuẩn BDC rhythm; tuy nhiên khi mở trace và console có thể bị rác thị giác nhẹ |
| 9 | Error Recovery | 2 | Thông báo lỗi RAG/Agent khá mờ nhạt, khi stream bị đứt gãy chưa có nút "Thử lại" (Retry response) trực tiếp trên bubble |
| 10 | Help and Documentation | 3 | Gợi ý hints rõ ràng, có thông tin trợ giúp ngữ cảnh từng agent |
| **Total** | | **27/40** | **Acceptable (Nền tảng tốt, cần tinh chỉnh trải nghiệm UX)** |

#### Design Specificity Verdict

**LLM assessment**: Trang AI Mentor (`/lms/student/ai-mentor`) sở hữu nhận diện thương hiệu "Tech-Academic Terminal" đậm chất BDC Hub & HCMUT: sự kết hợp giữa bảng màu Cosmic Dark Navy (#050B18), điểm nhấn Cyber Cyan/Tech Blue và trải nghiệm AI trợ giảng/mentor sâu sắc. Thiết kế không bị lẫn lộn với các giao diện AI chat generic (như ChatGPTclone thông thường) nhờ các thành phần RAG Trace inline, Console Debugger học tập, và nút "Lưu vào Notebook" tích hợp sâu với LMS. Tuy nhiên, bố cục layout và tương tác UI ở một số điểm chưa thực sự tối ưu: thanh header điều hướng bị phân tán, tương tác xóa/sửa session còn thô, và nhịp khoảng cách font chữ còn nhiều class lẻ (`text-[10.5px]`, `text-[9px]`).

**Deterministic scan**: Detector CLI ghi nhận 15 cảnh báo `design-system-font-size` trong [AgentMessageBubble.tsx](file:///home/thanh/BDCHub---Frontend/src/components/lms/agent/AgentMessageBubble.tsx) do sử dụng các font size tùy biến không theo thang chuẩn thiết kế (`10.5px`, `11px`, `9px`, `8px`).

**Visual overlays**: Không mở overlay trực tiếp do đang chạy trong chế độ đánh giá code tĩnh.

#### Overall Impression
Một giao diện AI Chat/Mentor vô cùng hứa hẹn, giàu tính năng và đậm chất kỹ thuật BDC. Điểm sáng lớn nhất là sự kết hợp minh bạch giữa câu trả lời AI và tiến trình suy nghĩ (Thinking + Multi-Agent Trace + Console). Điểm cần cải thiện lớn nhất nằm ở **tương tác điều hướng & nhịp bố cục UI (Layout Rhythm)**: việc quản lý ẩn/hiện Sidebar và Console chưa thực sự mượt mà, và các micro-interactions (xóa chat, sửa tin nhắn, thử lại khi lỗi) chưa đạt độ chỉn chu cao nhất.

#### What's Working
1. **Thiết kế màu sắc & Không khí Tech-Academic**: Sự phối hợp giữa Cosmic Dark Navy `#050B18`, surface `#0F1E35` và đường viền subtle `border-blue-500/12` tạo cảm giác cực kỳ cao cấp, chuyên nghiệp và chuẩn BDC Design Rhythm v3.0.
2. **Minh bạch hóa tiến trình AI (Chain of Thought & Multi-Agent Trace)**: Khả năng mở rộng/thu gọn vết xử lý RAG, Spawning Score, và Multi-agent logs ngay trên từng tin nhắn giúp sinh viên không chỉ nhận đáp án mà còn hiểu cách AI tư duy.
3. **Empty State & Hint Chips thông minh**: Lời chào thân thiện kèm các chip gợi ý câu hỏi theo từng role (`Virtual Mentor` vs `Virtual TA`) giúp giảm rào cản bắt đầu cho người dùng mới.

#### Priority Issues

- **[P1] layout: Thanh điều hướng Control Bar top bị phân tán & đè đè lên nội dung**
  - *Why it matters*: Nút "Lịch sử chat" và nút "Console" được đặt `absolute top-3.5` nổi lơ lửng trên cùng của khung chat. Khi danh sách tin nhắn cuộn lên top, văn bản tin nhắn bị đè bên dưới nút này, gây rối mắt và vi phạm khoảng cách làm việc.
  - *Fix*: Chuyển thanh control bar phía trên thành một Header Bar cố định (`h-14 flex items-center justify-between border-b backdrop-blur-md px-4`), tách biệt hoàn toàn với vùng cuộn tin nhắn `overflow-y-auto`.
  - *Suggested command*: `$impeccable layout`

- **[P1] harden: Thao tác Xóa / Đổi tên Session chưa đạt chuẩn UX hiện đại**
  - *Why it matters*: Việc xóa đoạn chat đang dùng `confirm()` mặc định của trình duyệt - gây đứt gãy trải nghiệm UI đẹp mắt. Đồng thời không có tính năng khôi phục (Undo) hoặc Modal xác nhận theo style thiết kế BDC.
  - *Fix*: Thay `confirm()` bằng bdc Modal / Popover xác nhận chuyên nghiệp, hoặc cung cấp Toast thông báo kèm nút "Hoàn tác" (Undo delete).
  - *Suggested command*: `$impeccable harden`

- **[P2] typeset: Cắt giảm font size tùy biến lẻ (Off-ramp Font Sizes)**
  - *Why it matters*: Việc dùng `text-[10.5px]`, `text-[9px]`, `text-[8px]` tràn lan ở [AgentMessageBubble.tsx](file:///home/thanh/BDCHub---Frontend/src/components/lms/agent/AgentMessageBubble.tsx#L307) làm giảm tính đồng nhất typography và gây khó đọc trên các màn hình có độ phân giải thường hoặc đối với người có thị lực yếu.
  - *Fix*: Quy chuẩn toàn bộ về hệ thống token font chuẩn: `text-[10px]` (micro label/badge), `text-xs` (12px - metadata), `text-sm` (14px - body chat).
  - *Suggested command*: `$impeccable typeset`

- **[P2] adapt: Trải nghiệm Mobile và Sidebar Overlay còn chật chội**
  - *Why it matters*: Khi hiển thị trên thiết bị di động, sidebar che phủ 85vw nhưng các nút bấm tương tác đóng/mở và đổi tên câu hỏi khá bé, dễ bấm nhầm. Khung nhập liệu `AgentInputBar` ở đáy màn hình di động cũng dễ bị bàn phím ảo đẩy mờ.
  - *Fix*: Tối ưu hóa padding/touch target (tối thiểu 44x44px) cho thiết bị di động và điều chỉnh độ cao an toàn (`env(safe-area-inset-bottom)`).
  - *Suggested command*: `$impeccable adapt`

- **[P3] delight: Thiếu tính năng "Thử lại" (Retry) và "Chỉnh sửa câu hỏi" (Edit User Prompt)**
  - *Why it matters*: Khi AI đưa ra câu trả lời chưa ưng ý hoặc sinh viên muốn sửa lại câu hỏi đã gửi, sinh viên buộc phải gõ lại từ đầu.
  - *Fix*: Thêm nút "Sửa" trên User Message Bubble và nút "Tạo lại đáp án" (Regenerate) ở cuối Assistant Message Bubble.
  - *Suggested command*: `$impeccable delight`

#### Persona Red Flags

- **Jordan (Confused First-Timer)**:
  - *Issue*: Lơ ngơ khi các nút điều hướng "Lịch sử chat" và "Console" trôi tự do ở header mà không có label rõ ràng trên mobile. Trạng thái Console Debugger mở ra chứa nhiều thông số kỹ thuật (`S-Score: 0.750`, `RAG Compression: 42%`) có thể gây hoang mang nếu không hiểu AI internals.
  - *Fix*: Bổ sung Tooltip giải thích đơn giản cho các badge kỹ thuật hoặc ẩn bớt các chỉ số sâu dưới tab "Nâng cao".

- **Alex (Impatient Power User)**:
  - *Issue*: Muốn tạo ngay chat mới hoặc đổi tên mà phải rê chuột qua item để chờ nút Pencil/Trash hiện ra (hover opacity). Thiếu phím tắt nhanh như `Cmd+K` hoặc `Ctrl+N` để tạo cuộc hội thoại mới.
  - *Fix*: Thêm phím tắt `Ctrl+N` (New Chat) và hỗ trợ shortcut điều hướng lịch sử chat.

- **Sam (Accessibility-Dependent User)**:
  - *Issue*: Nhiều nút bấm biểu tượng nhỏ (`p-1`, `w-3.5 h-3.5`) như Like/Dislike, Copy, Trace chưa đạt kích thước min touch target 44x44px. Font size 8px/9px ở phần badge vi phạm tiêu chuẩn tương phản và khả năng đọc.
  - *Fix*: Nâng kích thước font tối thiểu lên 10px/12px và tăng không gian bấm cho các nút biểu tượng.

#### Minor Observations
- Nút "Cuộn xuống tin nhắn mới nhất" (Scroll to bottom) xuất hiện mượt mà nhưng hiệu ứng floating ở `-top-12` đôi khi bị che bởi vùng mờ mờ gradient đáy.
- Nút "Lưu ghi chú" (Save to Notebook) hoạt động rất tốt, nhưng nên có phản hồi Toast trực tiếp thay vì chỉ đổi chữ trên nút bấm.

#### Questions to Consider
- *Liệu ta có nên chuyển Console Debugger thành một Modal/Drawer tách biệt thay vì Sidebar bên phải để nhường 100% không gian hiển thị cho khung Chat trên các màn hình vừa (Laptop 13-14 inch)?*
- *Có nên tích hợp thanh Header cố định hiển thị tên Course / Topic hiện tại mà AI Mentor đang hỗ trợ không?*
