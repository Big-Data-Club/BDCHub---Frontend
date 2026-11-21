export const learningTopics = [
  {
    id: "agent",
    title: "Agent & Environment",
    label: "Tác tử và môi trường",
    summary:
      "Tác tử quan sát trạng thái, chọn hành động và nhận phản hồi từ môi trường.",
    prerequisite: "Bắt đầu từ vòng lặp tương tác.",
    x: 125,
    y: 85,
  },
  {
    id: "reward",
    title: "Reward & Return",
    label: "Phần thưởng và lợi ích",
    summary:
      "Reward là phản hồi tức thời. Return tổng hợp phần thưởng tương lai, có thể có hệ số chiết khấu.",
    prerequisite: "Nắm Agent & Environment trước.",
    x: 405,
    y: 85,
  },
  {
    id: "policy",
    title: "Policy",
    label: "Chính sách hành động",
    summary:
      "Chính sách mô tả cách tác tử chọn hành động từ trạng thái đang quan sát.",
    prerequisite: "Nắm Agent & Environment trước.",
    x: 125,
    y: 230,
  },
  {
    id: "value",
    title: "Value Function",
    label: "Hàm giá trị",
    summary:
      "Hàm giá trị ước lượng return kỳ vọng khi bắt đầu từ một trạng thái và tuân theo chính sách.",
    prerequisite: "Kết nối Reward & Return với Policy.",
    x: 405,
    y: 230,
  },
  {
    id: "td",
    title: "TD Learning",
    label: "Học sai khác thời gian",
    summary:
      "TD cập nhật ước lượng từ phần thưởng vừa nhận và giá trị ước lượng của trạng thái tiếp theo.",
    prerequisite: "Nắm Policy, Return và Value Function trước.",
    x: 265,
    y: 375,
  },
] as const;

export type TopicId = (typeof learningTopics)[number]["id"];
export const topicEdges = [
  ["agent", "reward"],
  ["agent", "policy"],
  ["reward", "value"],
  ["policy", "value"],
  ["value", "td"],
  ["policy", "td"],
] as const;
export const suggestedQuestions = [
  "Để hiểu RL, tôi nên nắm chắc gì?",
  "Reward và Return khác nhau thế nào?",
  "Cho tôi một ví dụ về TD Learning",
];

// Deliberately bounded, deterministic answers. The public demo never calls a model.
export function demoAnswer(question: string, topic: TopicId) {
  const text = question.toLocaleLowerCase("vi");
  if (/reward|return|phần thưởng/.test(text))
    return {
      text: "Reward là phần thưởng ở một bước. Return là tổng phần thưởng tương lai, có thể được chiết khấu. Ví dụ: nhận 1 điểm mỗi bước trong 3 bước, với γ = 1 thì return là 3, còn reward của từng bước là 1.",
      source: "Bài 2 · Phần thưởng và chính sách",
    };
  if (/\btd\b|ví dụ/.test(text))
    return {
      text: "Ví dụ TD(0): V(s) = 2, reward = 1, γ = 0,9 và V(s′) = 3. Mục tiêu cập nhật là 1 + 0,9 × 3 = 3,7. Với α = 0,1, giá trị mới là 2 + 0,1 × (3,7 − 2) = 2,17.",
      source: "Bài 3 · Hàm giá trị và TD Learning",
    };
  if (/rl|nắm|bắt đầu|học gì/.test(text))
    return {
      text: "Bạn có thể học theo thứ tự: Agent & Environment → Reward & Return → Policy → Value Function → TD Learning. Thử chọn một chủ đề trên knowledge graph để xem quan hệ tiên quyết, rồi quay lại bài học tương ứng.",
      source: "Lộ trình · Reinforcement Learning",
    };
  const selected = learningTopics.find((item) => item.id === topic)!;
  return {
    text: `Với chủ đề ${selected.title}: ${selected.summary} Bạn muốn tìm hiểu thêm về nền tảng hay một ví dụ ứng dụng?`,
    source: `Chủ đề · ${selected.title}`,
  };
}
