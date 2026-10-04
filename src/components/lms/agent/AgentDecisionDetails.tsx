import type { AgentDecisionExplanation, AgentSpawningBreakdown } from "@/types/ai/agent";

interface AgentDecisionDetailsProps {
  breakdown?: AgentSpawningBreakdown;
  explanation?: AgentDecisionExplanation;
}

const factors: { key: keyof Pick<AgentSpawningBreakdown, "c_ratio" | "d_intent" | "r_docs" | "v_need" | "p_ctx" | "depth_signal">; label: string; description: string }[] = [
  { key: "c_ratio", label: "Mức sử dụng ngữ cảnh", description: "Tỉ lệ bộ nhớ hội thoại so với giới hạn" },
  { key: "d_intent", label: "Độ phức tạp ý định", description: "Phân loại yêu cầu, không đo độ dài câu hỏi" },
  { key: "r_docs", label: "Nhu cầu truy xuất", description: "Ước lượng có cần tìm tài liệu" },
  { key: "v_need", label: "Nhu cầu kiểm chứng", description: "Có dấu hiệu cần đối chiếu hoặc kiểm tra" },
  { key: "p_ctx", label: "Ngữ cảnh trang học", description: "Có bài học đang mở" },
  { key: "depth_signal", label: "Độ sâu câu hỏi", description: "Câu hỏi yêu cầu giải thích sâu hoặc hội thoại dài" },
];

export function AgentDecisionDetails({ breakdown, explanation }: AgentDecisionDetailsProps) {
  const profile = explanation?.course_profile;
  const learner = explanation?.learner_snapshot;

  return (
    <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
      {breakdown && (
        <section aria-label="Tín hiệu chọn luồng xử lý">
          <div className="font-semibold text-slate-700 dark:text-slate-200">Vì sao chọn luồng xử lý?</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 mt-1">
            {factors.map(({ key, label, description }) => (
              <div key={key} className="flex justify-between gap-2" title={description}>
                <span>{label}</span>
                <span className="font-semibold tabular-nums">{breakdown[key]?.toFixed(2) ?? "—"}</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Các số trên dùng để chọn luồng xử lý; chúng không đo mức hiểu người học.</p>
          {typeof breakdown.jev_decomposition === "number" && (
            <p className="mt-1">JEV gợi ý tách bước: <strong>{Math.round(breakdown.jev_decomposition * 100)}%</strong>{breakdown.jev_promoted ? " · đã chuyển sang Multi-Agent" : " · không đổi luồng xử lý"}</p>
          )}
        </section>
      )}

      {explanation && (
        <section className="border-t border-slate-200 dark:border-blue-500/15 pt-2" aria-label="Ngữ cảnh chuẩn bị cho câu trả lời">
          <div className="font-semibold text-slate-700 dark:text-slate-200">Ngữ cảnh nào được chuẩn bị cho câu trả lời?</div>
          <p className="mt-1">Ý định nhận diện: <strong>{explanation.intent}</strong> · Cá nhân hóa theo kế hoạch: <strong>{explanation.personalization_requested ? "có" : "không"}</strong></p>
          <p>Hội thoại gần đây: <strong>{explanation.conversation_turns_used} tin nhắn</strong>{explanation.conversation_tokens > 0 ? ` (~${explanation.conversation_tokens} token)` : ""}</p>
          <p>Ghi nhớ dài hạn: <strong>{explanation.durable_memory_used} mục</strong> · Tóm tắt hội thoại cũ: <strong>{explanation.past_episodes_used} mục</strong></p>
          {explanation.multi_agent_executed && (
            <p className="text-amber-700 dark:text-amber-300">Lượt Multi-Agent này dùng kết quả truy xuất tài liệu; chưa chuyển bộ nhớ hội thoại và hồ sơ học tập vào phần viết câu trả lời.</p>
          )}
          {!explanation.multi_agent_executed && (
            <>
              <p>Hồ sơ học tập theo khóa: <strong>{explanation.profile_status === "used" ? "đã đưa vào ngữ cảnh" : explanation.profile_status === "available_not_used" ? "có dữ liệu nhưng chưa đưa vào ngữ cảnh" : "chưa có dữ liệu"}</strong></p>
              {profile && (
                <p>Đã hoàn thành {profile.completed_lessons}/{profile.attempted_lessons} bài · Quick check {profile.quick_checks > 0 ? `${Math.round(profile.check_accuracy * 100)}% đúng (${profile.quick_checks} lượt)` : "chưa có dữ liệu"}</p>
              )}
              {learner && (
                <div>
                  <p>Ôn tập đến hạn: <strong>{learner.due_count}</strong> · Khái niệm cần củng cố: <strong>{learner.weak.length}</strong></p>
                  {learner.weak.length > 0 && <p>Cần củng cố: {learner.weak.map((item) => `${item.name} (${Math.round(item.mastery * 100)}%)`).join(", ")}</p>}
                  {learner.strong.length > 0 && <p>Đã nắm tốt: {learner.strong.join(", ")}</p>}
                </div>
              )}
            </>
          )}
          <p className="mt-1 text-slate-500 dark:text-slate-400">Ngữ cảnh có thể được rút gọn theo giới hạn model. Các nguồn được trích dẫn trong câu trả lời cho thấy bằng chứng đã sử dụng; các số này không đo mức hiểu đúng hoàn toàn.</p>
        </section>
      )}
    </div>
  );
}
