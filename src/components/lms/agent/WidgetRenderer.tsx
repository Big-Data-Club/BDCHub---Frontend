"use client";

/**
 * WidgetRenderer — dynamic component dispatcher for Generative UI.
 *
 * Maps backend `component` names to actual React components.
 * When a tool returns ui_instruction, this renders the appropriate widget.
 */
import dynamic from "next/dynamic";
import type { UIComponentData } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
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
  FlashcardPreview: dynamic(() =>
    import("./widgets/FlashcardWidget").then((m) => m.FlashcardWidget),
  ),
};


interface WidgetRendererProps {
  data: UIComponentData;
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
    </div>
  );
}
