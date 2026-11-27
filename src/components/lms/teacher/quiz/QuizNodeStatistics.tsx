import type { QuizNodeStatistics } from "@/types/lms/quizIndex";

export function QuizScoreDistribution({ counts }: { counts: number[] }) {
  return (
    <div
      className="flex flex-wrap gap-1 text-xs"
      aria-label="Phân bố phần trăm điểm"
    >
      {counts.map((count, i) => (
        <span
          key={i}
          className="rounded bg-slate-100 px-2 py-1 tabular-nums dark:bg-slate-800"
          title={`${i * 20} đến ${i === 4 ? 100 : (i + 1) * 20}% điểm`}
        >
          {i * 20}–{i === 4 ? "100" : `<${(i + 1) * 20}`} %:{" "}
          <strong>{count}</strong>
        </span>
      ))}
    </div>
  );
}

export function QuizNodeStatisticsTable({
  nodes,
}: {
  nodes: QuizNodeStatistics[];
}) {
  return (
    <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
      <h3 className="font-medium">Phân bố điểm theo node</h3>
      <p className="my-2 text-xs text-slate-500 dark:text-slate-400">
        Tính trên các câu đã trả lời, theo từng lượt nộp; một người có thể có
        nhiều lượt. Node còn câu chờ chấm chưa được tính vào phân bố. Dữ liệu cũ
        được gắn theo câu hỏi tại thời điểm nâng cấp. Gắn node mới không phân
        loại lại bài đã nộp.
      </p>
      {nodes.length === 0 ? (
        <p className="text-sm">Chưa có dữ liệu đánh giá theo node.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-2">Node</th>
                <th className="p-2">Người / lượt đã chấm</th>
                <th className="p-2">Điểm TB</th>
                <th className="p-2">Chờ chấm</th>
                <th className="p-2">Phân bố điểm</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => (
                <tr
                  key={node.node_id ?? "unassigned"}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  <td className="p-2">
                    {node.node_id ? `Node #${node.node_id}` : "Chưa gắn node"}
                  </td>
                  <td className="p-2">
                    {node.students} / {node.graded_attempts}
                  </td>
                  <td className="p-2">
                    {node.average_percentage == null
                      ? "—"
                      : `${node.average_percentage.toFixed(1)}%`}
                  </td>
                  <td className="p-2">{node.pending_answers}</td>
                  <td className="p-2">
                    <QuizScoreDistribution counts={node.distribution} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
