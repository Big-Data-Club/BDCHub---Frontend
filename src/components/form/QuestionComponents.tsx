import React from 'react';

// ==========================================
// SHARED UI COMPONENTS (Tái sử dụng)
// ==========================================

const QuestionCard = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 transition-all hover:shadow-md">
    {children}
  </div>
);

const QuestionHeader = ({ question, required, note, constraints }: any) => (
  <div className="mb-5">
    <label className="text-lg font-bold text-slate-900 flex items-start gap-1.5 leading-snug">
      <span>{question}</span>
      {required && <span className="text-red-500 mt-1">*</span>}
    </label>
    {note && <p className="text-sm text-slate-500 mt-2">{note}</p>}
    {constraints && (
      <p className="text-xs font-medium text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded mt-2">
        {constraints}
      </p>
    )}
  </div>
);

const ErrorMsg = ({ error }: { error?: string }) => 
  error ? <p className="text-red-500 text-sm mt-3 flex items-center gap-1.5 font-medium">⚠️ {error}</p> : null;

// Class dùng chung cho tất cả các Text Inputs
const inputClasses = "w-full border border-slate-300 rounded-xl p-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white transition-all";

// Class dùng chung cho các Options (Radio, Checkbox)
const optionItemClasses = "flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors";

// ==========================================
// SPECIFIC QUESTION COMPONENTS
// ==========================================

// 1. Single Choice (Radio)
export const SingleChoiceQuestion = ({ question, value, onChange, error }: any) => {
  return (
    <QuestionCard>
      <QuestionHeader question={question.question} required={question.required} note={question.note} />
      <div className="space-y-1">
        {question.options.map((option: string, idx: number) => (
          <label key={idx} className={optionItemClasses}>
            <input
              type="radio"
              name={question.id}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(question.id, e.target.value)}
              className="w-5 h-5 mt-0.5 accent-blue-600 cursor-pointer"
            />
            <span className="text-slate-700 font-medium group-hover:text-slate-900">{option}</span>
          </label>
        ))}
      </div>
      <ErrorMsg error={error} />
    </QuestionCard>
  );
};

// 2. Multiple Choice (Checkbox)
export const MultipleChoiceQuestion = ({ question, value = [], onChange, error }: any) => {
  const handleCheckboxChange = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((v: string) => v !== option)
      : [...value, option];
    
    if (question.constraints?.minChoices && newValue.length < question.constraints.minChoices && newValue.length > 0) {
      onChange(question.id, newValue);
      return;
    }
    if (question.constraints?.maxChoices && newValue.length > question.constraints.maxChoices) {
      return;
    }
    onChange(question.id, newValue);
  };

  const constraintsText = [
    question.constraints?.minChoices && `Tối thiểu ${question.constraints.minChoices} lựa chọn`,
    question.constraints?.maxChoices && `Tối đa ${question.constraints.maxChoices} lựa chọn`
  ].filter(Boolean).join(" • ");

  return (
    <QuestionCard>
      <QuestionHeader question={question.question} required={question.required} note={question.note} constraints={constraintsText} />
      <div className="space-y-1">
        {question.options.map((option: string, idx: number) => (
          <label key={idx} className={optionItemClasses}>
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              className="w-5 h-5 mt-0.5 accent-blue-600 cursor-pointer rounded"
            />
            <span className="text-slate-700 font-medium group-hover:text-slate-900">{option}</span>
          </label>
        ))}
      </div>
      <ErrorMsg error={error} />
    </QuestionCard>
  );
};

// 3. Short Answer
export const ShortAnswerQuestion = ({ question, value = '', onChange, error }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (question.constraints?.maxLength && e.target.value.length > question.constraints.maxLength) return;
    onChange(question.id, e.target.value);
  };

  const constraintsText = question.constraints?.maxLength ? `${value.length || 0}/${question.constraints.maxLength} ký tự` : null;

  return (
    <QuestionCard>
      <QuestionHeader question={question.question} required={question.required} note={question.note} constraints={constraintsText} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={question.placeholder || "Nhập câu trả lời..."}
        className={inputClasses}
      />
      <ErrorMsg error={error} />
    </QuestionCard>
  );
};

// 4. Long Answer
export const LongAnswerQuestion = ({ question, value = '', onChange, error }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (question.constraints?.maxLength && e.target.value.length > question.constraints.maxLength) return;
    onChange(question.id, e.target.value);
  };

  const constraintsText = question.constraints?.maxLength ? `${value.length || 0}/${question.constraints.maxLength} ký tự` : null;

  return (
    <QuestionCard>
      <QuestionHeader question={question.question} required={question.required} note={question.note} constraints={constraintsText} />
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={question.placeholder || "Nhập câu trả lời chi tiết..."}
        rows={5}
        className={`${inputClasses} resize-y`}
      />
      <ErrorMsg error={error} />
    </QuestionCard>
  );
};

// 5. Number
export const NumberQuestion = ({ question, value = '', onChange, error }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '') {
      onChange(question.id, '');
      return;
    }
    const num = parseFloat(newValue);
    if (isNaN(num)) return;
    if (question.constraints?.min !== undefined && num < question.constraints.min) return;
    if (question.constraints?.max !== undefined && num > question.constraints.max) return;
    
    onChange(question.id, newValue);
  };

  const constraintsText = [
    question.constraints?.min !== undefined && `Từ ${question.constraints.min}`,
    question.constraints?.max !== undefined && `Đến ${question.constraints.max}`
  ].filter(Boolean).join(" - ");

  return (
    <QuestionCard>
      <QuestionHeader question={question.question} required={question.required} note={question.note} constraints={constraintsText} />
      <input
        type="number"
        value={value}
        onChange={handleChange}
        placeholder={question.placeholder || "Nhập số..."}
        min={question.constraints?.min}
        max={question.constraints?.max}
        step={question.constraints?.step || 1}
        className={inputClasses}
      />
      <ErrorMsg error={error} />
    </QuestionCard>
  );
};

// 6. Fill in the Blank
export const FillInTheBlankQuestion = ({ question, value = {}, onChange, error }: any) => {
  const handleBlankChange = (blankId: string, newValue: string) => {
    onChange(question.id, { ...value, [blankId]: newValue });
  };

  return (
    <QuestionCard>
      <QuestionHeader question={question.question} required={question.required} note={question.note} />
      <div className="space-y-5">
        {question.blanks.map((blank: any, idx: number) => (
          <div key={idx}>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              {blank.label}
            </label>
            <input
              type="text"
              value={value[blank.id] || ''}
              onChange={(e) => handleBlankChange(blank.id, e.target.value)}
              placeholder={blank.placeholder || "Điền vào đây..."}
              className={inputClasses}
            />
          </div>
        ))}
      </div>
      <ErrorMsg error={error} />
    </QuestionCard>
  );
};

// 7. Code Question
export const CodeQuestion = ({ question, value = '', onChange, error }: any) => {
  return (
    <QuestionCard>
      <QuestionHeader question={question.question} required={question.required} note={question.note} constraints={question.language ? `Ngôn ngữ: ${question.language}` : null} />
      <textarea
        value={value}
        onChange={(e) => onChange(question.id, e.target.value)}
        placeholder={question.placeholder || "// Nhập code của bạn tại đây..."}
        rows={8}
        className={`${inputClasses} font-mono text-sm bg-slate-800 text-slate-100 focus:bg-slate-900 focus:ring-slate-500/30 border-slate-700 placeholder:text-slate-500`}
      />
      <ErrorMsg error={error} />
    </QuestionCard>
  );
};

// 8. Matching Question
export const MatchingQuestion = ({ question, value = {}, onChange, error }: any) => {
  const handleMatch = (itemId: string, category: string) => {
    onChange(question.id, { ...value, [itemId]: category });
  };

  return (
    <QuestionCard>
      <QuestionHeader question={question.question} required={question.required} note={question.note} />
      <div className="space-y-4">
        {question.items.map((item: any, idx: number) => (
          <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-slate-800 font-medium flex-1">{item.text}</p>
            <select
              value={value[item.id] || ''}
              onChange={(e) => handleMatch(item.id, e.target.value)}
              className="w-full sm:w-1/2 border border-slate-300 rounded-lg p-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">-- Chọn danh mục --</option>
              {question.categories.map((cat: string, catIdx: number) => (
                <option key={catIdx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <ErrorMsg error={error} />
    </QuestionCard>
  );
};

// 9. Rating Question
export const RatingQuestion = ({ question, value = '', onChange, error }: any) => {
  const scale = question.scale || { min: 1, max: 5 };
  const options : number[] = [];
  for (let i = scale.min; i <= scale.max; i++) options.push(i);

  return (
    <QuestionCard>
      <QuestionHeader question={question.question} required={question.required} note={question.note} />
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-4">
        {scale.minLabel && <span className="text-sm font-medium text-slate-500 hidden sm:block w-24 text-right">{scale.minLabel}</span>}
        
        <div className="flex gap-2 sm:gap-4 flex-1 justify-center w-full sm:w-auto">
          {options.map((opt) => (
            <label key={opt} className="flex flex-col items-center gap-3 cursor-pointer group">
              <span className={`text-sm font-bold ${value === opt.toString() ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-900'}`}>
                {opt}
              </span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${value === opt.toString() ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-white group-hover:border-slate-400'}`}>
                {value === opt.toString() && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
              </div>
              <input
                type="radio"
                name={question.id}
                value={opt}
                checked={value === opt.toString()}
                onChange={(e) => onChange(question.id, e.target.value)}
                className="hidden"
              />
            </label>
          ))}
        </div>

        {scale.maxLabel && <span className="text-sm font-medium text-slate-500 hidden sm:block w-24 text-left">{scale.maxLabel}</span>}
      </div>
      <ErrorMsg error={error} />
    </QuestionCard>
  );
};

// 10. Date / Time Question
export const DateTimeQuestion = ({ question, value = '', onChange, error }: any) => {
  return (
    <QuestionCard>
      <QuestionHeader question={question.question} required={question.required} note={question.note} />
      <input
        type={question.dateType || 'date'}
        value={value}
        onChange={(e) => onChange(question.id, e.target.value)}
        min={question.constraints?.min}
        max={question.constraints?.max}
        className={inputClasses}
      />
      <ErrorMsg error={error} />
    </QuestionCard>
  );
};

// 11. Email Question
export const EmailQuestion = ({ question, value = '', onChange, error }: any) => {
  return (
    <QuestionCard>
      <QuestionHeader question={question.question} required={question.required} note={question.note} />
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(question.id, e.target.value)}
        placeholder={question.placeholder || "example@email.com"}
        className={inputClasses}
      />
      <ErrorMsg error={error} />
    </QuestionCard>
  );
};

// 12. Matrix Question
export const MatrixQuestion = ({ question, value = {}, onChange, error }: any) => {
  const handleChange = (rowId: string, columnValue: string) => {
    onChange(question.id, { ...value, [rowId]: columnValue });
  };

  const rows = question.rows || [];
  const columns = question.columns || [];

  return (
    <QuestionCard>
      <QuestionHeader question={question.question} required={question.required} note={question.note} />

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-700 min-w-[200px]">
                {question.rowLabel || 'Tiêu chí'}
              </th>
              {columns.map((col: any, idx: number) => (
                <th key={idx} className="p-4 text-center font-semibold text-slate-700 min-w-[80px]">
                  {col.label || col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row: any, rowIdx: number) => (
              <tr key={rowIdx} className="hover:bg-blue-50/30 transition-colors group">
                <td className="p-4 font-medium text-slate-800 text-wrap leading-relaxed">
                  {row.text || row}
                </td>
                {columns.map((col: any, colIdx: number) => {
                  const colValue = col.value || col;
                  const rowId = row.id || `row_${rowIdx}`;
                  const isChecked = value[rowId] === colValue;
                  
                  return (
                    <td key={colIdx} className="p-4 text-center">
                      <label className="flex justify-center cursor-pointer w-full h-full">
                        <input
                          type="radio"
                          name={`${question.id}_${rowId}`}
                          value={colValue}
                          checked={isChecked}
                          onChange={() => handleChange(rowId, colValue)}
                          className="w-5 h-5 accent-blue-600 cursor-pointer"
                        />
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {question.showBottomLabels && (
        <div className="flex justify-end gap-4 mt-4 text-xs font-medium text-slate-500">
          {columns.map((col: any, idx: number) => (
            <div key={idx} className="min-w-[80px] text-center">
              {col.description}
            </div>
          ))}
        </div>
      )}

      <ErrorMsg error={error} />
    </QuestionCard>
  );
};