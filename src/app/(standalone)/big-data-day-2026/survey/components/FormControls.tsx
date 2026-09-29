"use client";

import React, { memo, useCallback } from "react";
import { Check, AlertCircle } from "lucide-react";

export const QuestionCard = memo(function QuestionCard({
  id,
  question,
  required,
  note,
  error,
  children,
}: {
  id?: string;
  question: string;
  required?: boolean;
  note?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className={`p-5 sm:p-7 rounded-2xl border transition-colors duration-100 ${
        error
          ? "border-red-400 bg-red-50/20 dark:border-red-500/40 dark:bg-red-950/10 shadow-sm"
          : "border-slate-200/90 bg-white dark:border-slate-800/80 dark:bg-[#0D192E] hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
      }`}
    >
      <div className="mb-4">
        <label className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-start gap-1.5 leading-snug">
          <span>{question}</span>
          {required && <span className="text-red-500 text-sm font-black">*</span>}
        </label>
        {note && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {note}
          </p>
        )}
      </div>

      <div className="mt-2">{children}</div>

      {error && (
        <div className="mt-3 flex items-center gap-1.5 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

// 5-Point Likert Scale
export const LikertScale = memo(function LikertScale({
  value,
  onChange,
  labels,
}: {
  value?: string;
  onChange: (val: string) => void;
  labels: {
    stronglyDisagree: string;
    disagree: string;
    neutral: string;
    agree: string;
    stronglyAgree: string;
  };
}) {
  const options = [
    { score: "1", label: labels.stronglyDisagree },
    { score: "2", label: labels.disagree },
    { score: "3", label: labels.neutral },
    { score: "4", label: labels.agree },
    { score: "5", label: labels.stronglyAgree },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
      {options.map((opt) => {
        const isSelected = value === opt.score;
        return (
          <button
            key={opt.score}
            type="button"
            onClick={() => onChange(opt.score)}
            className={`flex sm:flex-col items-center justify-between sm:justify-center p-3 rounded-xl border text-center transition-colors duration-75 active:scale-[0.99] ${
              isSelected
                ? "bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-950/60 dark:border-blue-400 dark:text-blue-100 ring-2 ring-blue-500/20"
                : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-2 sm:mb-1.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {opt.score}
              </span>
              <span className="sm:hidden text-xs font-semibold text-slate-800 dark:text-slate-200 text-left">
                {opt.label}
              </span>
            </div>
            <span className="hidden sm:block text-[11px] leading-tight font-medium text-slate-600 dark:text-slate-400">
              {opt.label}
            </span>
            {isSelected && (
              <span className="sm:hidden text-blue-600 dark:text-blue-400">
                <Check className="w-4 h-4" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

// Linear scale 1 to 5 (e.g. Very Poor to Very Good)
export const LinearRating = memo(function LinearRating({
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  value?: string;
  onChange: (val: string) => void;
  lowLabel: string;
  highLabel: string;
}) {
  const scores = ["1", "2", "3", "4", "5"];

  return (
    <div className="space-y-2 pt-1">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {scores.map((score) => {
          const isSelected = value === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base border transition-colors duration-75 active:scale-[0.99] ${
                isSelected
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-500/30"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-800"
              }`}
            >
              {score}
            </button>
          );
        })}
      </div>
    </div>
  );
});

// Memoized Matrix Row for instant re-rendering without table thrashing
interface MatrixRowProps {
  rowId: string;
  rowText: string;
  selectedVal?: string;
  columns: Array<{ value: string; label: string }>;
  onChange: (rowId: string, colValue: string) => void;
}

const MatrixRow = memo(function MatrixRow({
  rowId,
  rowText,
  selectedVal,
  columns,
  onChange,
}: MatrixRowProps) {
  return (
    <tr className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors">
      <td className="p-3.5 sm:p-4 font-medium text-slate-800 dark:text-slate-200 leading-snug">
        {rowText}
      </td>
      {columns.map((col) => {
        const isChecked = selectedVal === col.value;
        return (
          <td key={col.value} className="p-2 text-center align-middle">
            <label className="flex items-center justify-center w-full h-full cursor-pointer py-2">
              <input
                type="radio"
                name={`matrix_${rowId}`}
                value={col.value}
                checked={isChecked}
                onChange={() => onChange(rowId, col.value)}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
            </label>
          </td>
        );
      })}
    </tr>
  );
});

// Matrix Grid (rows: items, columns: 1..5)
export const MatrixGrid = memo(function MatrixGrid({
  rows,
  value = {},
  onChange,
  columns,
  rowHeader = "Hạng mục",
}: {
  rows: Array<{ id: string; text: string }>;
  value?: Record<string, string>;
  onChange: (rowId: string, colValue: string) => void;
  columns: Array<{ value: string; label: string }>;
  rowHeader?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40">
      <table className="w-full text-xs sm:text-sm text-left border-collapse">
        <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
          <tr>
            <th className="p-3.5 sm:p-4 font-semibold min-w-[200px] sm:min-w-[240px]">
              {rowHeader}
            </th>
            {columns.map((col) => (
              <th
                key={col.value}
                className="p-2.5 sm:p-3 text-center font-semibold min-w-[65px] sm:min-w-[85px]"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">{col.value}</div>
                <div className="text-[10px] text-slate-400 font-normal hidden sm:block truncate">
                  {col.label}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {rows.map((row) => (
            <MatrixRow
              key={row.id}
              rowId={row.id}
              rowText={row.text}
              selectedVal={value[row.id]}
              columns={columns}
              onChange={onChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

// Memoized Single Choice Item
interface SingleChoiceItemProps {
  opt: string;
  isChecked: boolean;
  name: string;
  onSelect: (opt: string) => void;
  isOther: boolean;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  otherPlaceholder?: string;
}

const SingleChoiceItem = memo(function SingleChoiceItem({
  opt,
  isChecked,
  name,
  onSelect,
  isOther,
  otherValue,
  onOtherChange,
  otherPlaceholder,
}: SingleChoiceItemProps) {
  return (
    <div className="flex flex-col">
      <label
        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors duration-75 ${
          isChecked
            ? "bg-blue-50/80 border-blue-500 dark:bg-blue-950/50 dark:border-blue-400"
            : "border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-300"
        }`}
      >
        <input
          type="radio"
          name={name}
          value={opt}
          checked={isChecked}
          onChange={() => onSelect(opt)}
          className="w-4 h-4 mt-0.5 text-blue-600 border-slate-300 focus:ring-blue-500 accent-blue-600 cursor-pointer"
        />
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
          {opt}
        </span>
      </label>

      {isOther && isChecked && onOtherChange && (
        <div className="mt-2 ml-7">
          <input
            type="text"
            placeholder={otherPlaceholder}
            value={otherValue || ""}
            onChange={(e) => onOtherChange(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
});

// Single choice radio group
export const SingleChoiceGroup = memo(function SingleChoiceGroup({
  name,
  options,
  value,
  onChange,
  allowOther = true,
  otherPlaceholder = "Vui lòng ghi rõ...",
}: {
  name: string;
  options: string[];
  value?: string;
  onChange: (val: string) => void;
  allowOther?: boolean;
  otherPlaceholder?: string;
}) {
  const isOtherSelected = value?.startsWith("Khác:") || (value === "Khác" && allowOther);
  const otherText = value?.startsWith("Khác: ") ? value.replace("Khác: ", "") : "";

  const handleSelect = useCallback(
    (opt: string) => {
      const isOther = opt === "Khác" || opt === "Other";
      if (isOther) {
        onChange(otherText ? `Khác: ${otherText}` : "Khác");
      } else {
        onChange(opt);
      }
    },
    [onChange, otherText]
  );

  const handleOtherText = useCallback(
    (text: string) => {
      onChange(text ? `Khác: ${text}` : "Khác");
    },
    [onChange]
  );

  return (
    <div className="space-y-2 pt-1">
      {options.map((opt) => {
        const isOther = opt === "Khác" || opt === "Other";
        const isChecked = isOther ? isOtherSelected : value === opt;

        return (
          <SingleChoiceItem
            key={opt}
            opt={opt}
            isChecked={isChecked}
            name={name}
            onSelect={handleSelect}
            isOther={isOther}
            otherValue={otherText}
            onOtherChange={handleOtherText}
            otherPlaceholder={otherPlaceholder}
          />
        );
      })}
    </div>
  );
});

// Memoized Multiple Choice Item
interface MultipleChoiceItemProps {
  opt: string;
  isChecked: boolean;
  onToggle: (opt: string) => void;
  isOther: boolean;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  otherPlaceholder?: string;
}

const MultipleChoiceItem = memo(function MultipleChoiceItem({
  opt,
  isChecked,
  onToggle,
  isOther,
  otherValue,
  onOtherChange,
  otherPlaceholder,
}: MultipleChoiceItemProps) {
  return (
    <div className="flex flex-col">
      <label
        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors duration-75 ${
          isChecked
            ? "bg-blue-50/80 border-blue-500 dark:bg-blue-950/50 dark:border-blue-400"
            : "border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-300"
        }`}
      >
        <input
          type="checkbox"
          value={opt}
          checked={isChecked}
          onChange={() => onToggle(opt)}
          className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 accent-blue-600 cursor-pointer"
        />
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
          {opt}
        </span>
      </label>

      {isOther && isChecked && onOtherChange && (
        <div className="mt-2 ml-7">
          <input
            type="text"
            placeholder={otherPlaceholder}
            value={otherValue || ""}
            onChange={(e) => onOtherChange(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
});

// Multiple choice checkbox group
export const MultipleChoiceGroup = memo(function MultipleChoiceGroup({
  options,
  value = [],
  onChange,
  allowOther = true,
  otherPlaceholder = "Vui lòng ghi rõ...",
}: {
  options: string[];
  value?: string[];
  onChange: (val: string[]) => void;
  allowOther?: boolean;
  otherPlaceholder?: string;
}) {
  const isOtherSelected = value.some((v) => v.startsWith("Khác:") || v === "Khác");
  const otherValue = value.find((v) => v.startsWith("Khác:"))?.replace("Khác: ", "") || "";

  const handleToggle = useCallback(
    (opt: string) => {
      const isOther = opt === "Khác" || opt === "Other";
      if (isOther) {
        if (isOtherSelected) {
          onChange(value.filter((v) => !v.startsWith("Khác:") && v !== "Khác" && v !== "Other"));
        } else {
          onChange([...value, "Khác"]);
        }
        return;
      }

      if (value.includes(opt)) {
        onChange(value.filter((v) => v !== opt));
      } else {
        onChange([...value, opt]);
      }
    },
    [value, isOtherSelected, onChange]
  );

  const handleOtherText = useCallback(
    (text: string) => {
      const withoutOther = value.filter((v) => !v.startsWith("Khác:") && v !== "Khác" && v !== "Other");
      if (text.trim()) {
        onChange([...withoutOther, `Khác: ${text}`]);
      } else {
        onChange([...withoutOther, "Khác"]);
      }
    },
    [value, onChange]
  );

  return (
    <div className="space-y-2 pt-1">
      {options.map((opt) => {
        const isOther = opt === "Khác" || opt === "Other";
        const isChecked = isOther ? isOtherSelected : value.includes(opt);

        return (
          <MultipleChoiceItem
            key={opt}
            opt={opt}
            isChecked={isChecked}
            onToggle={handleToggle}
            isOther={isOther}
            otherValue={otherValue}
            onOtherChange={handleOtherText}
            otherPlaceholder={otherPlaceholder}
          />
        );
      })}
    </div>
  );
});

// Text Input
export const TextInput = memo(function TextInput({
  value = "",
  onChange,
  placeholder,
  type = "text",
}: {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 p-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
    />
  );
});

// Text Area
export const TextAreaInput = memo(function TextAreaInput({
  value = "",
  onChange,
  placeholder,
  rows = 3,
}: {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 p-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 transition-colors leading-relaxed"
    />
  );
});
