"use client";
import type {
  QuizResultAttempt,
  QuizResultStudent,
} from "@/types/lms/quizResults";
interface QuizStudentResultsProps {
  students: QuizResultStudent[];
  page: number;
  total: number;
  pageSize: number;
  loading: boolean;
  onPage: (page: number) => void;
  onSelect: (id: number, attempt?: QuizResultAttempt) => Promise<void>;
}
const button =
  "rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50 dark:border-blue-500/20 dark:hover:bg-[#162644]";
const score = (value: number | null) =>
  value == null ? "—" : `${value.toFixed(1)}%`;
export function QuizStudentResults({
  students,
  page,
  total,
  pageSize,
  onPage,
  onSelect,
  loading,
}: QuizStudentResultsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-blue-500/10 dark:bg-[#0F1E35]">
      <h2 className="text-lg font-semibold">Tổng hợp theo thí sinh</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Điểm cao nhất và trung bình trên toàn bộ lượt đã chấm của mỗi thí sinh.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              {[
                "Thí sinh",
                "Đã nộp / số lượt",
                "Điểm cao nhất",
                "Điểm trung bình",
                "Bài làm",
              ].map((label) => (
                <th
                  className="p-3 font-medium text-slate-600 dark:text-slate-400"
                  key={label}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                className="border-t border-slate-200 dark:border-blue-500/10"
                key={student.student_id}
              >
                <td className="p-3">
                  <p className="font-medium">
                    {student.student_name || `#${student.student_id}`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ID {student.student_id}
                  </p>
                </td>
                <td className="p-3 tabular-nums">
                  {student.submitted_attempts} / {student.total_attempts}
                </td>
                <td className="p-3 font-medium tabular-nums text-blue-700 dark:text-cyan-400">
                  {score(student.best_percentage)}
                </td>
                <td className="p-3 tabular-nums">
                  {score(student.average_percentage)}
                </td>
                <td className="p-3">
                  <button
                    className={button}
                    onClick={() =>
                      void onSelect(
                        student.latest_attempt_id,
                        student.latest_attempt,
                      )
                    }
                  >
                    Xem lượt mới nhất
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!students.length && (
          <p className="p-4 text-sm text-slate-500 dark:text-slate-400">
            Chưa có thí sinh phù hợp.
          </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
        <p>
          {total} thí sinh · Trang {page} /{" "}
          {Math.max(1, Math.ceil(total / pageSize))}
        </p>
        <div className="flex gap-2">
          <button
            className={button}
            disabled={loading || page <= 1}
            onClick={() => onPage(page - 1)}
          >
            Trước
          </button>
          <button
            className={button}
            disabled={loading || page * pageSize >= total}
            onClick={() => onPage(page + 1)}
          >
            Sau
          </button>
        </div>
      </div>
    </section>
  );
}
