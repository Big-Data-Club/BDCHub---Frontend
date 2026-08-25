---
target: src/components/home
total_score: 30
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 0
timestamp: 2026-08-25T05-21-58Z
slug: src-components-home
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Trạng thái hiển thị mượt ở Hero/Terminal. |
| 2 | Match System / Real World | 4 | Thuật ngữ chuẩn ngành (Big Data, HPC, AI, Scientific Papers), biểu tượng trực quan. |
| 3 | User Control and Freedom | 3 | Thẻ thông tin và nút điều hướng mượt mà. |
| 4 | Consistency and Standards | 4 | Tuân thủ 100% BDC Design System & xóa bỏ hoàn toàn anti-pattern `gray-on-color`. |
| 5 | Error Prevention | 4 | Nút copy trích dẫn bài báo có phản hồi chuyển trạng thái (Đã chép) chuẩn sắc Emerald. |
| 6 | Recognition Rather Than Recall | 4 | Cấu trúc phân loại thẻ Dự án & Công bố khoa học rõ ràng, trực quan. |
| 7 | Flexibility and Efficiency | n/a | Landing page phục vụ mục đích truyền thông / thuyết phục (Persuade mode). |
| 8 | Aesthetic and Minimalist Design | 4 | Layout tỉ lệ vàng 7:5 giúp nhịp thị giác cân bằng, nâng cao tính thẩm mỹ. |
| 9 | Error Recovery | 4 | Thao tác sao chép hiển thị phản hồi tức thì. |
| 10 | Help and Documentation | n/a | Landing page không yêu cầu tài liệu hướng dẫn trực tiếp (Persuade mode). |
| **Total** | | **30/32** | **Good / Excellent (93.7%)** |

#### Design Specificity Verdict

- **LLM Assessment**: Đã tối ưu hóa bố cục [Projects.tsx](file:///home/thanh/BDCHub---Frontend/src/components/home/Projects.tsx) theo tỉ lệ cột 7:5 giúp phân cấp thị giác rõ nét. Mọi hover state và tương phản chữ đều đạt độ nét tối đa.
- **Deterministic Scan**: **0 cảnh báo defect** (`detect.mjs` trả về Exit Code 0 - Clean).

#### Priority Issues
- **[FIXED] [P1] Visual Contrast & Anti-pattern Gray-on-Color**: Đã sửa toàn bộ class nút và badge hover sang palette chuẩn (`text-blue-600`, `text-cyan-400`, `group-hover:text-white`).
- **[FIXED] [P1] Density & Spatial Rhythm ở Projects & Publications**: Đã điều chỉnh grid từ 50/50 sang `lg:col-span-7` và `lg:col-span-5`, tạo độ thở thị giác mượt mà.
