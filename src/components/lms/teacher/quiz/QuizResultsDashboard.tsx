"use client";

import {
  BarChart3,
  Download,
  RefreshCw,
  Sparkles,
  Users,
  FileCheck2,
  Target,
  Gauge,
  Clock3,
} from "lucide-react";
import dynamic from "next/dynamic";
import { QuizStudentResults } from "./QuizStudentResults";
import { useParams, useRouter } from "@/lib/tenant/navigation";

import { useQuizResults } from "@/hooks/lms/teacher/useQuizResults";
import { LoadingState } from "@/components/common/LoadingState";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";

const QuizResultCharts = dynamic(
  () => import("./QuizResultCharts").then((m) => m.QuizResultCharts),
  { loading: () => <LoadingState message="Đang tải biểu đồ..." /> },
);
const QuizAttemptDetails = dynamic(() =>
  import("./QuizAttemptDetails").then((m) => m.QuizAttemptDetails),
);

const questionTypeLabels: Record<string, string> = {
  SINGLE_CHOICE: "Chọn một đáp án",
  MULTIPLE_CHOICE: "Chọn nhiều đáp án",
  ESSAY: "Tự luận",
  SHORT_ANSWER: "Trả lời ngắn",
  FILE_UPLOAD: "Nộp tệp",
  FILL_BLANK_TEXT: "Điền từ",
  FILL_BLANK_DROPDOWN: "Chọn từ điền ô trống",
  TRUE_FALSE: "Đúng / Sai",
};
const statusLabels: Record<string, string> = {
  GRADED: "Đã chấm",
  SUBMITTED: "Đã nộp",
  IN_PROGRESS: "Đang làm",
  ABANDONED: "Đã bỏ dở",
};

const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 dark:border-blue-500/10 dark:bg-[#0F1E35]";
const button =
  "rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-50 dark:border-blue-500/20 dark:hover:bg-[#162644]";
const number = (value: number | null | undefined, suffix = "") =>
  value == null ? "—" : `${Number(value.toFixed(1))}${suffix}`;

export function QuizResultsDashboard() {
  const params = useParams();
  const router = useRouter();
  const quizId = Number(params.quizId);
  const state = useQuizResults(quizId);
  const { report } = state;
  if (state.loading && !report)
    return <LoadingState message="Đang tổng hợp kết quả quiz..." />;
  const summary = report?.summary;
  const submittedCount = summary?.submitted_attempts ?? 0;
  const gradedCount = summary?.graded_attempts ?? 0;
  const average = summary?.average_percentage ?? null;
  const passRate = summary?.pass_rate ?? null;
  const distribution =
    report?.distribution.map((d) => ({
      label:
        d.bucket === 4 ? "80–100%" : `${d.bucket * 20}–<${d.bucket * 20 + 20}%`,
      count: d.count,
    })) ?? [];
  const questionChart =
    report?.questions.map((q, i) => ({
      label: `Câu ${i + 1}`,
      correct: q.correct,
      incorrect: q.incorrect,
      pending: q.pending,
      skipped: Math.max(0, submittedCount - q.answered),
    })) ?? [];
  const attempts = report?.attempts ?? [];
  const selected = state.selectedAttempt;
  const exportCSV = () => {
    const rows = [
      [
        "Thí sinh",
        "ID",
        "Lượt",
        "Trạng thái",
        "Điểm %",
        "Chờ chấm",
        "Thời gian (giây)",
        "Rời tab",
        "Vắng (giây)",
      ],
      ...attempts.map((a) => [
        a.student_name,
        a.student_id,
        a.attempt_number,
        a.status,
        a.percentage ?? "",
        a.pending_answers,
        a.time_spent_seconds ?? "",
        a.focus_summary?.departures ?? "",
        a.focus_summary?.away_seconds ?? "",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${String(cell)
                .replace(/^[=+@\-\t\r]/, "'$&")
                .replace(/"/g, '""')}"`,
          )
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `quiz-${quizId}-results-page-${state.attemptPage}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 text-slate-900 dark:text-slate-100 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            className="text-sm text-blue-700 dark:text-cyan-400"
            onClick={() => router.push(`/lms/teacher/quiz/${quizId}/manage`)}
          >
            ← Quản lý quiz
          </button>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-cyan-400">
            <BarChart3 size={15} /> Assessment insights
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            {report?.title || "Kết quả & phân tích quiz"}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Theo dõi từng câu hỏi, thí sinh và lượt làm.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={button}
            disabled={state.loading}
            onClick={() => void state.reload()}
          >
            <RefreshCw size={15} className="mr-2 inline" /> Làm mới
          </button>
          <button className={button} disabled={!report} onClick={exportCSV}>
            <Download size={15} className="mr-2 inline" /> Xuất CSV trang này
          </button>
          <button
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={state.analyzing || !gradedCount}
            onClick={() => void state.analyze()}
          >
            <Sparkles size={15} className="mr-2 inline" />
            {state.analyzing ? "AI đang phân tích…" : "AI phân tích kết quả"}
          </button>
        </div>
      </header>
      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 p-4 text-red-700 dark:border-red-500/30 dark:text-red-300"
        >
          {state.error}
        </div>
      )}
      {report && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Thí sinh đã bắt đầu", summary?.unique_students ?? 0],
              [
                "Lượt đã nộp / tổng",
                `${submittedCount} / ${summary?.total_attempts ?? 0}`,
              ],
              ["Điểm trung bình", number(average, "%")],
              ["Tỷ lệ đạt", number(passRate, "%")],
              ["Bài còn chờ chấm", summary?.pending_attempts ?? 0],
            ].map(([label, value], index) => (
              <div className={panel} key={label}>
                {(() => {
                  const Icon = [Users, FileCheck2, Gauge, Target, Clock3][
                    index
                  ];
                  return (
                    <Icon
                      size={18}
                      className="mb-4 text-blue-600 dark:text-cyan-400"
                    />
                  );
                })()}
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Trung bình và tỷ lệ đạt tính theo từng lượt đã nộp, có điểm và không
            còn câu chờ chấm; mỗi lần làm được tính riêng. Biểu đồ từng câu dùng
            tất cả lượt đã nộp. Dữ liệu có thể trễ tối đa 15 giây.
          </p>
          <dl
            className={`${panel} grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4`}
          >
            {[
              ["Điểm trung vị", number(summary?.median_percentage, "%")],
              [
                "Khoảng điểm đã chấm",
                `${number(summary?.minimum_percentage, "%")} – ${number(summary?.maximum_percentage, "%")}`,
              ],
              [
                "Thời gian làm trung bình",
                summary?.average_seconds == null
                  ? "—"
                  : number(summary.average_seconds / 60, " phút"),
              ],
              [
                "Rời tab ghi nhận",
                summary?.focus_available_attempts
                  ? `${summary.total_departures} lần · ${summary.focus_available_attempts}/${submittedCount} lượt có dữ liệu`
                  : "Chưa có dữ liệu",
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-slate-600 dark:text-slate-400">{label}</dt>
                <dd className="mt-1 font-medium tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          {!submittedCount ? (
            <section className={panel}>
              Chưa có bài nộp. Kết quả sẽ hiển thị sau khi thí sinh nộp bài.
            </section>
          ) : (
            <QuizResultCharts
              gradedCount={gradedCount}
              distribution={distribution}
              questionChart={questionChart}
            />
          )}
          {state.insights && (
            <section className={panel} aria-live="polite">
              <h2 className="mb-3 text-lg font-semibold">
                AI · Nhận định đánh giá
              </h2>
              <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">
                AI phân tích dữ liệu tại thời điểm tạo báo cáo; các yêu cầu
                trong vòng 5 phút dùng lại báo cáo để tránh chờ và tiêu tốn tài
                nguyên.
              </p>
              <p className="whitespace-pre-wrap">{state.insights.summary}</p>
              {(
                [
                  ["strengths", "Điểm mạnh"],
                  ["gaps", "Nội dung cần củng cố"],
                  ["recommendations", "Đề xuất giảng dạy"],
                  ["limitations", "Giới hạn phân tích"],
                ] as const
              ).map(([key, label]) => (
                <div className="mt-4" key={key}>
                  <h3 className="font-medium">{label}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {state.insights![key].map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}
          <section className={panel}>
            <h2 className="mb-4 text-lg font-semibold">
              Phân tích từng câu hỏi
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-blue-500/20">
                    {[
                      "Câu hỏi",
                      "Đúng / đã trả lời",
                      "Sai",
                      "Chờ chấm",
                      "Bỏ trống",
                      "Điểm TB",
                      "Thời gian TB",
                    ].map((x) => (
                      <th className="p-3" key={x}>
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.questions.map((q, i) => (
                    <tr
                      key={q.id}
                      className="border-b border-slate-200 align-top dark:border-blue-500/10"
                    >
                      <td className="max-w-md p-3">
                        <span className="font-medium">
                          Câu {i + 1} ·{" "}
                          {questionTypeLabels[q.question_type] ??
                            q.question_type}
                        </span>
                        <MarkdownRenderer content={q.question_text} />
                        {q.answer_options.length > 0 && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-xs font-medium text-blue-700 dark:text-cyan-400">
                              Phân bố lựa chọn đáp án
                            </summary>
                            <ul className="mt-3 space-y-2">
                              {q.answer_options.map((option) => (
                                <li
                                  key={option.id}
                                  className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-2 text-xs dark:bg-[#0D192E]"
                                >
                                  <span>
                                    {option.option_text}
                                    {option.is_correct && (
                                      <span className="ml-2 text-green-700 dark:text-green-400">
                                        ✓ Đúng
                                      </span>
                                    )}
                                  </span>
                                  <span className="shrink-0 tabular-nums">
                                    {option.selected_count} lượt
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </td>
                      <td className="p-3">
                        {q.correct} / {q.answered}
                        <br />
                        {q.answered
                          ? number((q.correct / q.answered) * 100, "%")
                          : "—"}
                      </td>
                      <td className="p-3">{q.incorrect}</td>
                      <td className="p-3">{q.pending}</td>
                      <td className="p-3">
                        {Math.max(0, submittedCount - q.answered)}
                      </td>
                      <td className="p-3">
                        {number(q.average_points)} / {q.points}
                      </td>
                      <td className="p-3">{number(q.average_seconds, "s")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <QuizStudentResults
            students={report.students}
            page={state.studentPage}
            total={report.students_total}
            pageSize={report.page_size}
            onPage={state.setStudentPage}
            loading={state.loading}
            onSelect={state.selectAttempt}
          />
          <section className={panel}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                Thí sinh & từng lượt làm
              </h2>
              <input
                aria-label="Tìm thí sinh theo tên hoặc ID"
                placeholder="Tìm tên hoặc ID thí sinh"
                value={state.search}
                onChange={(e) => state.setSearch(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-blue-500/20 dark:bg-[#0D192E]"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    {[
                      "Thí sinh",
                      "Lượt",
                      "Trạng thái",
                      "Điểm",
                      "Thời gian",
                      "Rời tab / vắng",
                      "Bài làm",
                    ].map((x) => (
                      <th className="p-3" key={x}>
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr
                      key={a.id}
                      className="border-t border-slate-200 dark:border-blue-500/10"
                    >
                      <td className="p-3">
                        {a.student_name || `#${a.student_id}`}
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          ID {a.student_id} ·{" "}
                          {new Date(a.started_at).toLocaleString("vi-VN")}
                        </p>
                      </td>
                      <td className="p-3">{a.attempt_number}</td>
                      <td className="p-3">
                        {statusLabels[a.status] ?? a.status}
                        {a.pending_answers > 0 &&
                          ` · ${a.pending_answers} câu chờ chấm`}
                      </td>
                      <td className="p-3">
                        {number(a.percentage, "%")}
                        <br />
                        {a.pending_answers > 0
                          ? "Điểm tạm tính"
                          : a.is_passed == null
                            ? "—"
                            : a.is_passed
                              ? "Đạt"
                              : "Chưa đạt"}
                      </td>
                      <td className="p-3">
                        {number(a.time_spent_seconds, "s")}
                      </td>
                      <td className="p-3">
                        {a.focus_summary
                          ? `${a.focus_summary.departures} lần / ${a.focus_summary.away_seconds}s`
                          : "Chưa có dữ liệu"}
                      </td>
                      <td className="p-3">
                        <button
                          className={button}
                          onClick={() => void state.selectAttempt(a.id)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!attempts.length && (
                <p className="p-4">Không có lượt làm phù hợp.</p>
              )}
            </div>
            <p className="mt-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="mb-3 flex items-center justify-between gap-3 text-sm">
                <span>
                  {report.attempts_total} lượt · Trang {state.attemptPage} /{" "}
                  {Math.max(
                    1,
                    Math.ceil(report.attempts_total / report.page_size),
                  )}
                </span>
                <span className="flex gap-2">
                  <button
                    className={button}
                    disabled={state.loading || state.attemptPage <= 1}
                    onClick={() => state.setAttemptPage((p) => p - 1)}
                  >
                    Trước
                  </button>
                  <button
                    className={button}
                    disabled={
                      state.loading ||
                      state.attemptPage * report.page_size >=
                        report.attempts_total
                    }
                    onClick={() => state.setAttemptPage((p) => p + 1)}
                  >
                    Sau
                  </button>
                </span>
              </span>
              Rời tab và thời gian vắng do trình duyệt ghi nhận, có thể thiếu dữ
              liệu. Các chỉ số này không đủ để kết luận gian lận.
            </p>
          </section>
          {selected && (
            <QuizAttemptDetails
              attempt={selected}
              questions={report.questions}
              answers={state.answers}
              error={state.answerError}
            />
          )}
        </>
      )}
    </main>
  );
}
