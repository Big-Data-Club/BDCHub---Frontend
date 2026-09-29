"use client";

import React, { memo } from "react";
import { SurveyFormData, FormErrors, Lang } from "../types";
import { T_DATA } from "../translations";
import {
  QuestionCard,
  LikertScale,
  MultipleChoiceGroup,
  TextAreaInput,
} from "./FormControls";

interface SpeakerSectionProps {
  form: SurveyFormData;
  onChange: (field: keyof SurveyFormData, value: any) => void;
  errors: FormErrors;
  lang: Lang;
}

export const SpeakerSection = memo(function SpeakerSection({ form, onChange, errors, lang }: SpeakerSectionProps) {
  const t = T_DATA[lang];

  return (
    <div className="space-y-10">
      {/* ── SECTION A: PRE-EVENT ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.spkSectionA_Title}
          </h3>
        </div>

        <QuestionCard id="spk_info_clarity" question={t.spk_a1} required error={errors.spk_info_clarity}>
          <LikertScale
            value={form.spk_info_clarity}
            onChange={(val) => onChange("spk_info_clarity", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="spk_audience_understanding" question={t.spk_a2} required error={errors.spk_audience_understanding}>
          <LikertScale
            value={form.spk_audience_understanding}
            onChange={(val) => onChange("spk_audience_understanding", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="spk_scope_communication" question={t.spk_a3} required error={errors.spk_scope_communication}>
          <LikertScale
            value={form.spk_scope_communication}
            onChange={(val) => onChange("spk_scope_communication", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="spk_schedule_venue_info" question={t.spk_a4} required error={errors.spk_schedule_venue_info}>
          <LikertScale
            value={form.spk_schedule_venue_info}
            onChange={(val) => onChange("spk_schedule_venue_info", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="spk_comm_with_organizer" question={t.spk_a5} required error={errors.spk_comm_with_organizer}>
          <LikertScale
            value={form.spk_comm_with_organizer}
            onChange={(val) => onChange("spk_comm_with_organizer", val)}
            labels={t.likert}
          />
        </QuestionCard>
      </div>

      {/* ── SECTION B: DURING EVENT ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.spkSectionB_Title}
          </h3>
        </div>

        <QuestionCard id="spk_reception_support" question={t.spk_b1} required error={errors.spk_reception_support}>
          <LikertScale
            value={form.spk_reception_support}
            onChange={(val) => onChange("spk_reception_support", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="spk_av_equipment" question={t.spk_b2} required error={errors.spk_av_equipment}>
          <LikertScale
            value={form.spk_av_equipment}
            onChange={(val) => onChange("spk_av_equipment", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="spk_time_allocation" question={t.spk_b3} required error={errors.spk_time_allocation}>
          <LikertScale
            value={form.spk_time_allocation}
            onChange={(val) => onChange("spk_time_allocation", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="spk_transition_flow" question={t.spk_b4} required error={errors.spk_transition_flow}>
          <LikertScale
            value={form.spk_transition_flow}
            onChange={(val) => onChange("spk_transition_flow", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="spk_audience_engagement" question={t.spk_b5} required error={errors.spk_audience_engagement}>
          <LikertScale
            value={form.spk_audience_engagement}
            onChange={(val) => onChange("spk_audience_engagement", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="spk_qa_time" question={t.spk_b6} required error={errors.spk_qa_time}>
          <LikertScale
            value={form.spk_qa_time}
            onChange={(val) => onChange("spk_qa_time", val)}
            labels={t.likert}
          />
        </QuestionCard>
      </div>

      {/* ── SECTION C: OVERALL & FUTURE ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.spkSectionC_Title}
          </h3>
        </div>

        <QuestionCard id="spk_platform_suitability" question={t.spk_c1} required error={errors.spk_platform_suitability}>
          <LikertScale
            value={form.spk_platform_suitability}
            onChange={(val) => onChange("spk_platform_suitability", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="spk_willing_to_rejoin" question={t.spk_c2} required error={errors.spk_willing_to_rejoin}>
          <LikertScale
            value={form.spk_willing_to_rejoin}
            onChange={(val) => onChange("spk_willing_to_rejoin", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard
          id="spk_best_support_aspect"
          question={t.spk_best_support_q}
          required
          error={errors.spk_best_support_aspect}
        >
          <TextAreaInput
            value={form.spk_best_support_aspect}
            onChange={(val) => onChange("spk_best_support_aspect", val)}
            placeholder={t.spk_best_support_placeholder}
            rows={3}
          />
        </QuestionCard>

        <QuestionCard
          id="spk_support_improvement"
          question={t.spk_improve_support_q}
          required
          error={errors.spk_support_improvement}
        >
          <TextAreaInput
            value={form.spk_support_improvement}
            onChange={(val) => onChange("spk_support_improvement", val)}
            placeholder={t.spk_improve_support_placeholder}
            rows={3}
          />
        </QuestionCard>

        <QuestionCard
          id="spk_audience_prerequisites"
          question={t.spk_prerequisites_q}
        >
          <TextAreaInput
            value={form.spk_audience_prerequisites}
            onChange={(val) => onChange("spk_audience_prerequisites", val)}
            placeholder={t.spk_prerequisites_placeholder}
            rows={3}
          />
        </QuestionCard>

        <QuestionCard
          id="spk_collaboration_interests"
          question={t.spk_collab_q}
          required
          error={errors.spk_collaboration_interests}
        >
          <MultipleChoiceGroup
            options={t.spk_collab_options}
            value={form.spk_collaboration_interests}
            onChange={(val) => onChange("spk_collaboration_interests", val)}
          />
        </QuestionCard>

        <QuestionCard
          id="spk_future_topic_suggestions"
          question={t.spk_future_topics_q}
        >
          <TextAreaInput
            value={form.spk_future_topic_suggestions}
            onChange={(val) => onChange("spk_future_topic_suggestions", val)}
            placeholder={t.spk_future_topics_placeholder}
            rows={3}
          />
        </QuestionCard>
      </div>
    </div>
  );
});
