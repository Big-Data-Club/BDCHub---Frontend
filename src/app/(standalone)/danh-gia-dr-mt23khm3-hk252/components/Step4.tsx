import { FormData } from "../types";

interface Step4Props {
  data: FormData;
  onEditStep: (step: number) => void;
}

export function Step4({ data, onEditStep }: Step4Props) {
  const s1 = parseFloat(data.score1) || 0;
  const s2 = parseFloat(data.score2) || 0;
  const s3 = parseFloat(data.score3) || 0;
  const s4 = parseFloat(data.score4) || 0;
  const s5 = parseFloat(data.score5) || 0;
  const s6 = parseFloat(data.score6) || 0;

  const rawSum = s1 + s2 + s3 + s4 + s5 + s6;
  const finalScore = Math.min(100, rawSum);

  const getEvidenceLink = (url: string, filename: string) => {
    if (!url) return <span className="text-slate-400 dark:text-slate-600 text-xs italic font-medium">Không có minh chứng</span>;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold hover:underline"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
        <span className="truncate max-w-[150px] sm:max-w-[200px]" title={filename}>{filename || "Xem minh chứng"}</span>
      </a>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
          Xem lại thông tin tự đánh giá
        </h2>
        <p className="text-slate-500 dark:text-slate-450 text-sm">
          Kiểm tra kỹ các thông tin dưới đây. Nhấn nút &quot;Quay lại&quot; hoặc click vào biểu tượng chỉnh sửa kế bên tiêu đề để sửa đổi nếu có sai sót.
        </p>
      </div>

      {/* Box 1: Student Information */}
      <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative group">
        <button
          onClick={() => onEditStep(1)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 shadow-sm"
          title="Chỉnh sửa thông tin cá nhân"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        <h3 className="text-sm font-black text-slate-850 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-3">
          Thông tin sinh viên
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-sm">
          <div>
            <span className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Họ và Tên</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.fullName || "—"}</span>
          </div>
          <div>
            <span className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mã số sinh viên</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.studentId || "—"}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email liên hệ</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.email || "—"}</span>
          </div>
        </div>
      </div>

      {/* Box 2: Score details */}
      <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative">
        <button
          onClick={() => onEditStep(2)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 shadow-sm"
          title="Chỉnh sửa điểm số"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        <h3 className="text-sm font-black text-slate-850 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-3">
          Chi tiết điểm tự đánh giá
        </h3>

        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 pr-4">Nội dung đánh giá</th>
                  <th className="py-2.5 px-4 text-center">Điểm tự đánh giá</th>
                  <th className="py-2.5 pl-4">Minh chứng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                <tr>
                  <td className="py-3 pr-4 font-semibold text-slate-750 dark:text-slate-250">1. Ý thức tham gia học tập</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-850 dark:text-slate-200">{s1} / 20</td>
                  <td className="py-3 pl-4">{getEvidenceLink(data.evidenceUrl1, data.evidenceName1)}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-slate-750 dark:text-slate-250">2. Ý thức chấp hành nội quy nhà trường</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-850 dark:text-slate-200">{s2} / 25</td>
                  <td className="py-3 pl-4">{getEvidenceLink(data.evidenceUrl2, data.evidenceName2)}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-slate-750 dark:text-slate-250">3. Tham gia hoạt động chính trị, xã hội, VH-VN-TT</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-850 dark:text-slate-200">{s3} / 20</td>
                  <td className="py-3 pl-4">{getEvidenceLink(data.evidenceUrl3, data.evidenceName3)}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-slate-750 dark:text-slate-250">4. Ý thức công dân, quan hệ cộng đồng</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-850 dark:text-slate-200">{s4} / 25</td>
                  <td className="py-3 pl-4">{getEvidenceLink(data.evidenceUrl4, data.evidenceName4)}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-slate-750 dark:text-slate-250">5. Công tác cán bộ lớp, đoàn thể</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-850 dark:text-slate-200">{s5} / 10</td>
                  <td className="py-3 pl-4">{getEvidenceLink(data.evidenceUrl5, data.evidenceName5)}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-slate-750 dark:text-slate-250 text-cyan-750 dark:text-cyan-400">6. Điểm thưởng đặc biệt</td>
                  <td className="py-3 px-4 text-center font-bold text-cyan-600 dark:text-cyan-400">{s6}</td>
                  <td className="py-3 pl-4">{getEvidenceLink(data.evidenceUrl6, data.evidenceName6)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 px-5 py-4 rounded-xl shadow-inner-sm">
            <span className="text-sm font-black text-slate-800 dark:text-slate-200">Tổng điểm tự đánh giá cuối cùng:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">{finalScore}</span>
              <span className="text-xs text-slate-400 dark:text-slate-550 font-bold">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Box 3: Confirmations, Inquiry & Security */}
      <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative">
        <button
          onClick={() => onEditStep(3)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 shadow-sm"
          title="Chỉnh sửa xác nhận"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        <h3 className="text-sm font-black text-slate-850 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-3">
          Thông tin bổ sung & Bảo mật
        </h3>

        <div className="space-y-3.5 text-sm">
          <div>
            <span className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ý kiến, thắc mắc của sinh viên</span>
            <p className="text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap mt-0.5">
              {data.inquiry.trim() ? data.inquiry : <span className="text-slate-400 dark:text-slate-600 text-xs italic">Không có ý kiến/thắc mắc</span>}
            </p>
          </div>
          <div>
            <span className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mật khẩu tra cứu submission</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {"•".repeat(data.password.length)} (Độ dài: {data.password.length} ký tự)
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/40 text-emerald-600 dark:text-emerald-400 font-bold">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Đã cam đoan thông tin khai báo là hoàn toàn chính xác.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
