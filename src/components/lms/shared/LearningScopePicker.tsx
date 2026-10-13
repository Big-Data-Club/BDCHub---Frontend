import type { LearningScope, LearningScopeSection } from "@/types/lms/learning-scope";

interface LearningScopePickerProps {
  sections: LearningScopeSection[];
  value: LearningScope;
  onChange: (value: LearningScope) => void;
  loading: boolean;
  error: string;
  onRetry: () => void;
  disabled?: boolean;
}

const typeLabels: Record<string, string> = { TEXT: "Văn bản", DOCUMENT: "Tài liệu", VIDEO: "Video", IMAGE: "Hình ảnh" };

export function LearningScopePicker({ sections, value, onChange, loading, error, onRetry, disabled }: LearningScopePickerProps) {
  if (loading) return <p role="status" className="text-sm text-muted-foreground">Đang tải chương và bài học…</p>;
  if (error) return <div role="alert" className="space-y-2 text-sm text-destructive">
    <p>{error}</p>
    <button type="button" onClick={onRetry} className="rounded-xl border border-border px-3 py-2 active:scale-95 transition-all duration-200">Thử lại</button>
  </div>;
  return <fieldset disabled={disabled} className="space-y-2 text-sm">
    <legend className="mb-2 font-semibold">Phạm vi nội dung</legend>
    <label className="flex items-center gap-2 rounded-xl border border-border p-3 cursor-pointer">
      <input type="checkbox" checked={value.whole_course} onChange={(e) => onChange({ whole_course: e.target.checked, section_ids: [], content_ids: [] })} />
      Toàn bộ khóa học
    </label>
    <div className="max-h-64 overflow-y-auto rounded-xl border border-border p-2 space-y-3">
      {sections.length === 0 && <p className="p-2 text-muted-foreground">Khóa học chưa có chương hoặc bài học.</p>}
      {sections.map((section) => {
        const chapterSelected = value.section_ids.includes(section.id);
        return <div key={section.id}>
          <label className="flex items-center gap-2 p-2 font-medium cursor-pointer">
            <input type="checkbox" checked={value.whole_course || chapterSelected} disabled={value.whole_course || section.contents.length === 0}
              onChange={() => onChange({ whole_course: false,
                section_ids: chapterSelected ? value.section_ids.filter((id) => id !== section.id) : [...value.section_ids, section.id],
                content_ids: value.content_ids.filter((id) => !section.contents.some((c) => c.id === id)),
              })} />
            <span className="min-w-0">{section.title}</span>
          </label>
          {section.contents.length === 0 && <p className="pl-8 text-xs text-muted-foreground">Chưa có tài liệu học tập.</p>}
          {section.contents.map((content) => <label key={content.id} className="flex items-start gap-2 rounded-xl py-2 pl-8 pr-2 hover:bg-muted cursor-pointer">
            <input type="checkbox" className="mt-1 shrink-0" disabled={value.whole_course || chapterSelected} checked={value.whole_course || chapterSelected || value.content_ids.includes(content.id)}
              onChange={() => onChange({ whole_course: false, section_ids: value.section_ids.filter((id) => id !== section.id),
                content_ids: value.content_ids.includes(content.id) ? value.content_ids.filter((id) => id !== content.id) : [...value.content_ids, content.id],
              })} />
            <span className="min-w-0 flex-1">{content.title}<span className="block text-xs text-muted-foreground">{typeLabels[content.type] ?? content.type}</span></span>
          </label>)}
        </div>;
      })}
    </div>
    <p className="text-xs text-muted-foreground">Chọn cả chương hoặc từng bài học. AI tổng hợp tài liệu trong phạm vi này để tạo nội dung theo mục tiêu học tập.</p>
  </fieldset>;
}
