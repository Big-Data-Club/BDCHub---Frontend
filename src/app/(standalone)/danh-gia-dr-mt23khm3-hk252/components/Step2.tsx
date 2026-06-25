import React from "react";
import { FormData, Errors, THRESHOLDS } from "../types";
import { FIn, UploadZone } from "./FormFields";

interface Step2Props {
  data: FormData;
  errors: Errors;
  onChange: (field: keyof FormData, val: string) => void;
  onUploaded: (field: keyof FormData, url: string, name: string) => void;
  onUploading: (uploading: boolean) => void;
}

export function Step2({ data, errors, onChange, onUploaded, onUploading }: Step2Props) {
  // Convert scores to numbers for calculation
  const s1 = parseFloat(data.score1) || 0;
  const s2 = parseFloat(data.score2) || 0;
  const s3 = parseFloat(data.score3) || 0;
  const s4 = parseFloat(data.score4) || 0;
  const s5 = parseFloat(data.score5) || 0;
  const s6 = parseFloat(data.score6) || 0;

  const rawSum = s1 + s2 + s3 + s4 + s5 + s6;
  const finalScore = Math.min(100, rawSum);

  // Dynamic conditions for showing evidence upload zones:
  const showUpload1 = s1 > THRESHOLDS.score1; // > 18
  const showUpload2 = s2 > THRESHOLDS.score2; // > 22.5 (i.e. >= 23)
  const showUpload3 = s3 > THRESHOLDS.score3; // > 18
  const showUpload4 = s4 > THRESHOLDS.score4; // > 22.5 (i.e. >= 23)
  const showUpload5 = s5 >= THRESHOLDS.score5; // >= 9 (i.e. 9 or 10)
  const showUpload6 = s6 > 0; // Always show if bonus score > 0

  return (
    <div className="space-y-6">
      {/* Header and Total Score */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
            Tự đánh giá kết quả rèn luyện
          </h2>
          <p className="text-slate-500 dark:text-slate-450 text-xs max-w-xl">
            Điền điểm tự đánh giá của bạn (số nguyên hoặc số thập phân) cho mỗi tiêu chí dưới đây.
          </p>
        </div>
        <div className="flex items-center gap-3.5 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 px-5 py-3 rounded-2xl border border-cyan-100 dark:border-cyan-950/60 shadow-sm self-start sm:self-center">
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-wider">Tổng điểm tự đánh giá</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">
                {finalScore}
              </span>
              <span className="text-slate-400 dark:text-slate-550 text-sm font-semibold">/100</span>
              {rawSum > 100 && (
                <span className="text-[10px] text-amber-500 font-bold ml-1" title={`Tổng thực tế là ${rawSum} nhưng được làm tròn tối đa 100.`}>
                  (Thực tế: {rawSum})
                </span>
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-650 dark:text-cyan-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid of Criteria */}
      <div className="space-y-6">
        
        {/* Criterion 1 */}
        <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                1. Ý thức tham gia học tập
              </h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-450 mt-1">
                Điểm tối đa: <span className="font-semibold text-slate-650 dark:text-slate-350">20 điểm</span>
              </p>
            </div>
            <div className="w-full md:w-32 flex-shrink-0">
              <FIn
                type="number"
                min="0"
                max="20"
                step="any"
                placeholder="VD: 15"
                value={data.score1}
                onChange={(e) => onChange("score1", e.target.value)}
                error={errors.score1}
                suffix="/ 20"
              />
            </div>
          </div>
          {showUpload1 && (
            <UploadZone
              url={data.evidenceUrl1}
              filename={data.evidenceName1}
              error={errors.evidenceUrl1}
              onUploaded={(url, name) => onUploaded("evidenceUrl1", url, name)}
              onUploading={onUploading}
              label="Minh chứng mục 1 (Bắt buộc vì điểm tự đánh giá > 90% tức > 18)"
              hint="Hỗ trợ: PDF/PNG/JPG · Tối đa: 10MB"
            />
          )}
        </div>

        {/* Criterion 2 */}
        <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                2. Ý thức chấp hành nội quy, quy chế, quy định trong nhà trường
              </h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-450 mt-1">
                Điểm tối đa: <span className="font-semibold text-slate-650 dark:text-slate-350">25 điểm</span>
              </p>
            </div>
            <div className="w-full md:w-32 flex-shrink-0">
              <FIn
                type="number"
                min="0"
                max="25"
                step="any"
                placeholder="VD: 15"
                value={data.score2}
                onChange={(e) => onChange("score2", e.target.value)}
                error={errors.score2}
                suffix="/ 25"
              />
            </div>
          </div>
          {showUpload2 && (
            <UploadZone
              url={data.evidenceUrl2}
              filename={data.evidenceName2}
              error={errors.evidenceUrl2}
              onUploaded={(url, name) => onUploaded("evidenceUrl2", url, name)}
              onUploading={onUploading}
              label="Minh chứng mục 2 (Bắt buộc vì điểm tự đánh giá > 90% tức > 22.5)"
              hint="Hỗ trợ: PDF/PNG/JPG · Tối đa: 10MB"
            />
          )}
        </div>

        {/* Criterion 3 */}
        <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                3. Ý thức tham gia các hoạt động chính trị, xã hội, văn hoá, văn nghệ, thể thao, phòng chống tội phạm và các tệ nạn xã hội
              </h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-450 mt-1">
                Điểm tối đa: <span className="font-semibold text-slate-650 dark:text-slate-350">20 điểm</span>
              </p>
            </div>
            <div className="w-full md:w-32 flex-shrink-0">
              <FIn
                type="number"
                min="0"
                max="20"
                step="any"
                placeholder="VD: 15"
                value={data.score3}
                onChange={(e) => onChange("score3", e.target.value)}
                error={errors.score3}
                suffix="/ 20"
              />
            </div>
          </div>
          {showUpload3 && (
            <UploadZone
              url={data.evidenceUrl3}
              filename={data.evidenceName3}
              error={errors.evidenceUrl3}
              onUploaded={(url, name) => onUploaded("evidenceUrl3", url, name)}
              onUploading={onUploading}
              label="Minh chứng mục 3 (Bắt buộc vì điểm tự đánh giá > 90% tức > 18)"
              hint="Hỗ trợ: PDF/PNG/JPG · Tối đa: 10MB"
            />
          )}
        </div>

        {/* Criterion 4 */}
        <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                4. Ý thức công dân, quan hệ cộng đồng
              </h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-450 mt-1">
                Điểm tối đa: <span className="font-semibold text-slate-650 dark:text-slate-350">25 điểm</span>
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 italic">
                * Tất cả hoạt động từ các đoàn thể, tổ chức chính thức trong trường đều được chấp nhận.
              </p>
            </div>
            <div className="w-full md:w-32 flex-shrink-0">
              <FIn
                type="number"
                min="0"
                max="25"
                step="any"
                placeholder="VD: 15"
                value={data.score4}
                onChange={(e) => onChange("score4", e.target.value)}
                error={errors.score4}
                suffix="/ 25"
              />
            </div>
          </div>
          {/* Conditional or normal evidence display */}
          {showUpload4 && (
            <UploadZone
              url={data.evidenceUrl4}
              filename={data.evidenceName4}
              error={errors.evidenceUrl4}
              onUploaded={(url, name) => onUploaded("evidenceUrl4", url, name)}
              onUploading={onUploading}
              label="Minh chứng mục 4 (Bắt buộc vì điểm tự đánh giá > 90% tức > 22.5)"
              hint="Chấp nhận chứng nhận đoàn thể, tổ chức chính thức trong trường."
            />
          )}
        </div>

        {/* Criterion 5 */}
        <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                5. Ý thức và kết quả khi tham gia công tác cán bộ lớp, các đoàn thể, tổ chức trong trường
              </h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-450 mt-1">
                Điểm tối đa: <span className="font-semibold text-slate-650 dark:text-slate-350">10 điểm</span>
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 italic">
                * Tất cả hoạt động từ các đoàn thể, tổ chức chính thức trong trường đều được chấp nhận.
              </p>
            </div>
            <div className="w-full md:w-32 flex-shrink-0">
              <FIn
                type="number"
                min="0"
                max="10"
                step="any"
                placeholder="VD: 5"
                value={data.score5}
                onChange={(e) => onChange("score5", e.target.value)}
                error={errors.score5}
                suffix="/ 10"
              />
            </div>
          </div>
          {/* Conditional evidence display */}
          {showUpload5 && (
            <UploadZone
              url={data.evidenceUrl5}
              filename={data.evidenceName5}
              error={errors.evidenceUrl5}
              onUploaded={(url, name) => onUploaded("evidenceUrl5", url, name)}
              onUploading={onUploading}
              label="Minh chứng mục 5 (Bắt buộc vì điểm tự đánh giá >= 90% tức >= 9)"
              hint="Chấp nhận quyết định/giấy chứng nhận làm ban cán sự lớp, đoàn, hội."
            />
          )}
        </div>

        {/* Criterion 6 - Special Bonus */}
        <div className="bg-gradient-to-r from-slate-50 to-cyan-50/10 dark:from-slate-900/30 dark:to-cyan-950/5 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-cyan-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                6. Điểm thưởng đặc biệt
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1">
                Điểm tự do (Yêu cầu có kèm minh chứng).
              </p>
            </div>
            <div className="w-full md:w-32 flex-shrink-0">
              <FIn
                type="number"
                min="0"
                step="any"
                placeholder="VD: 5"
                value={data.score6}
                onChange={(e) => onChange("score6", e.target.value)}
                error={errors.score6}
                suffix="Điểm"
              />
            </div>
          </div>
          {showUpload6 && (
            <UploadZone
              url={data.evidenceUrl6}
              filename={data.evidenceName6}
              error={errors.evidenceUrl6}
              onUploaded={(url, name) => onUploaded("evidenceUrl6", url, name)}
              onUploading={onUploading}
              label="Minh chứng mục 6 (Bắt buộc khi có điểm thưởng đặc biệt)"
              hint="Quyết định khen thưởng, thành tích nghiên cứu, giải thưởng,..."
            />
          )}
        </div>

      </div>
    </div>
  );
}
