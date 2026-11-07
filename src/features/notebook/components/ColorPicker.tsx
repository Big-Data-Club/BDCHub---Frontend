import type { HighlightColor } from "@/types/ai/notebook";
import { highlightColors } from "../colors";

export function ColorPicker({
  value,
  onChange,
  disabled,
}: {
  value: HighlightColor;
  onChange: (color: HighlightColor) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Màu highlight"
      className="flex items-center gap-2"
    >
      {highlightColors.map((color) => (
        <button
          key={color.value}
          type="button"
          aria-label={`Highlight ${color.label}`}
          aria-pressed={value === color.value}
          disabled={disabled}
          onClick={() => onChange(color.value)}
          style={{ backgroundColor: color.background }}
          className={`h-7 w-7 rounded-full border-2 transition-all duration-200 active:scale-95 disabled:opacity-50 ${value === color.value ? "border-blue-700 ring-2 ring-blue-300 dark:border-white" : "border-transparent"}`}
        />
      ))}
    </div>
  );
}
