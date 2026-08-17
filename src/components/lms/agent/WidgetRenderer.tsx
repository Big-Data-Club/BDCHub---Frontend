"use client";

/**
 * WidgetRenderer - dynamic component dispatcher for Generative UI.
 *
 * Maps backend `component` names to actual React components.
 * When a tool returns ui_instruction, this renders the appropriate widget.
 */
import dynamic from "next/dynamic";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import type { UIComponentData } from "@/types";
import { saveNotebookEntry } from "@/services/agentService";

const WIDGET_MAP: Record<string, React.ComponentType<any>> = {
  QuizDraftPreview: dynamic(() =>
    import("./widgets/QuizDraftPreview").then((m) => m.QuizDraftPreview),
  ),
  ContentDraftPreview: dynamic(() =>
    import("./widgets/ContentDraftPreview").then((m) => m.ContentDraftPreview),
  ),
  QuizCreationWizard: dynamic(() =>
    import("./widgets/QuizCreationWizard").then((m) => m.QuizCreationWizard),
  ),
  PerformanceChart: dynamic(() =>
    import("./widgets/PerformanceChart").then((m) => m.PerformanceChart),
  ),
  QuizImportPreview: dynamic(() =>
    import("./widgets/QuizImportPreview").then((m) => m.QuizImportPreview),
  ),
  KnowledgeGapMap: dynamic(() =>
    import("./widgets/KnowledgeGapMap").then((m) => m.KnowledgeGapMap),
  ),
  MiniChallengeWidget: dynamic(() =>
    import("./widgets/MiniChallengeWidget").then((m) => m.MiniChallengeWidget),
  ),
  // Backend sends "StudyPlanWidget", keep "StudyPlan" as legacy alias
  StudyPlan: dynamic(() =>
    import("./widgets/StudyPlanWidget").then((m) => m.StudyPlanWidget),
  ),
  StudyPlanWidget: dynamic(() =>
    import("./widgets/StudyPlanWidget").then((m) => m.StudyPlanWidget),
  ),
  RecommendationWidget: dynamic(() =>
    import("./widgets/RecommendationWidget").then((m) => m.RecommendationWidget),
  ),
  FlashcardPreview: dynamic(() =>
    import("./widgets/FlashcardWidget").then((m) => m.FlashcardWidget),
  ),
  FlashcardDeck: dynamic(() =>
    import("./widgets/FlashcardWidget").then((m) => m.FlashcardWidget),
  ),
  MaterialPreparationWorkspace: dynamic(() =>
    import("./widgets/MaterialPreparationWorkspace").then((m) => m.MaterialPreparationWorkspace),
  ),
  CourseBlueprintWorkspace: dynamic(() =>
    import("./widgets/CourseBlueprintLaunchCard").then((m) => m.CourseBlueprintLaunchCard),
  ),
  NotebookSaveSuccess: ({ props }: { props: { title?: string } }) => (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-300">
      Đã lưu “{props.title || "ghi chú"}” vào Notebook.
    </div>
  ),
};


interface WidgetRendererProps {
  data: UIComponentData;
}

function notebookContent(data: UIComponentData): { title: string; content: string } | null {
  const props = data.props || {};
  if (data.component === "MiniChallengeWidget" && props.question) {
    const options = (props.options || []).map((option: { text: string; is_correct?: boolean; explanation?: string }, index: number) =>
      `${String.fromCharCode(65 + index)}. ${option.text}${option.is_correct ? " ✓" : ""}${option.explanation ? ` — ${option.explanation}` : ""}`,
    );
    return {
      title: `Mini challenge: ${props.concept || "Ôn tập"}`,
      content: `# Mini challenge${props.concept ? ` — ${props.concept}` : ""}\n\n${props.question}\n\n${options.join("\n")}`,
    };
  }
  if ((data.component === "FlashcardDeck" || data.component === "FlashcardPreview") && (props.cards || props.flashcards)) {
    const cards = props.cards || props.flashcards;
    return {
      title: props.title || "Flashcards ôn tập",
      content: `# ${props.title || "Flashcards ôn tập"}\n\n${cards.map((card: { front: string; back: string }, index: number) => `## ${index + 1}. ${card.front}\n${card.back}`).join("\n\n")}`,
    };
  }
  return null;
}

function SaveWidgetToNotebook({ data }: { data: UIComponentData }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const note = notebookContent(data);
  if (!note) return null;

  const save = async () => {
    if (saving || saved) return;
    setSaving(true);
    try {
      await saveNotebookEntry({
        title: note.title,
        content: note.content,
        courseId: data.props?.course_id,
      });
      setSaved(true);
    } catch (error) {
      console.error("Failed to save widget to notebook", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button type="button" onClick={save} disabled={saving || saved} className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 disabled:cursor-default disabled:text-emerald-600 dark:hover:bg-slate-800 dark:disabled:text-emerald-400">
      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : saved ? <Check className="h-3 w-3" /> : <BookmarkPlus className="h-3 w-3" />}
      {saved ? "Đã lưu vào Notebook" : "Lưu vào Notebook"}
    </button>
  );
}

export function WidgetRenderer({ data }: WidgetRendererProps) {
  const Widget = WIDGET_MAP[data.component];

  if (!Widget) {
    return (
      <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-500">
        Widget không khả dụng: {data.component}
      </div>
    );
  }

  return (
    <div className="mt-3">
      <Widget props={data.props || {}} />
      <SaveWidgetToNotebook data={data} />
    </div>
  );
}
