import type { Content, Course, Section } from "@/types";
import type { Question } from "@/hooks/lms/student/useQuizTaking";

export const showcaseCourse: Course = {
  id: 1,
  title: "Reinforcement Learning",
  description: "Từ tương tác với môi trường đến những quyết định thông minh.",
  status: "DRAFT",
  level: "BEGINNER",
  category: "Foundation in AI",
  creator_name: "Big Data Club",
  enrollment_count: 48,
  created_at: "2026-11-01T08:00:00",
  updated_at: "2026-11-15T08:00:00",
};
export const showcaseSection: Section = {
  id: 1,
  course_id: 1,
  title: "Nền tảng Reinforcement Learning",
  description: "",
  order_index: 0,
  is_published: true,
  created_at: showcaseCourse.created_at,
};
export const showcaseContents: Content[] = [
  {
    id: 1,
    section_id: 1,
    type: "TEXT",
    title: "Tác tử và môi trường",
    description: "",
    order_index: 0,
    is_published: true,
    is_mandatory: true,
    metadata: {
      content:
        "## Học từ tương tác\n\nTrong **Reinforcement Learning**, tác tử (*agent*) quan sát trạng thái của môi trường, lựa chọn hành động và nhận phần thưởng.\n\n### Vòng lặp cơ bản\n\n1. Quan sát trạng thái hiện tại.\n2. Chọn một hành động theo chính sách.\n3. Nhận phần thưởng và trạng thái tiếp theo.\n4. Cập nhật cách ra quyết định.\n\n> Mục tiêu là tối đa hóa phần thưởng tích lũy theo thời gian.\n\n### Một ví dụ gần gũi\n\nMột robot chọn đường đi trong mê cung. Mỗi bước là một hành động; vị trí hiện tại là trạng thái; đến đích mang lại phần thưởng. Thử nhiều hành trình giúp robot học cách tìm đường tốt hơn.",
    },
  },
  {
    id: 2,
    section_id: 1,
    type: "TEXT",
    title: "Phần thưởng và chính sách",
    description: "",
    order_index: 1,
    is_published: true,
    is_mandatory: true,
    metadata: {
      content:
        "## Reward, Return và Policy\n\n**Reward** là phần thưởng nhận ở một bước. **Return** tổng hợp phần thưởng tương lai, có thể có chiết khấu.\n\nMột **policy** cho biết tác tử nên chọn hành động nào trong từng trạng thái.\n\n### Khám phá và khai thác\n\n- **Exploration**: thử hành động mới để tìm cơ hội tốt hơn.\n- **Exploitation**: chọn hành động đã biết là hiệu quả.\n\nHai cách cần được cân bằng trong suốt quá trình học.",
    },
  },
  {
    id: 3,
    section_id: 1,
    type: "TEXT",
    title: "Hàm giá trị và TD Learning",
    description: "",
    order_index: 2,
    is_published: true,
    is_mandatory: true,
    metadata: {
      content:
        "## Từ phần thưởng đến giá trị\n\nHàm giá trị ước lượng return kỳ vọng khi tác tử tuân theo một chính sách.\n\n### TD(0)\n\n$$V(s) \\leftarrow V(s) + \\alpha [r + \\gamma V(s') - V(s)]$$\n\nVới $V(s)=2$, $r=1$, $\\gamma=0.9$, $V(s')=3$ và $\\alpha=0.1$, giá trị mới là **2.17**.\n\nTD cập nhật từ trải nghiệm vừa nhận, không cần chờ toàn bộ episode kết thúc.",
    },
  },
  {
    id: 4,
    section_id: 1,
    type: "QUIZ",
    title: "Kiểm tra kiến thức nền tảng",
    description: "",
    order_index: 3,
    is_published: true,
    is_mandatory: true,
  },
];
export const showcaseQuestion: Question = {
  id: 1,
  question_type: "SINGLE_CHOICE",
  question_text: "Mục tiêu của tác tử trong Reinforcement Learning là gì?",
  points: 1,
  order_index: 0,
  is_required: true,
  answer_options: [
    { id: 1, option_text: "Tối đa hóa phần thưởng tích lũy" },
    { id: 2, option_text: "Luôn chọn hành động ngẫu nhiên" },
    { id: 3, option_text: "Chỉ tối đa hóa phần thưởng ở bước hiện tại" },
  ],
};
