"use client";

import React, { memo } from "react";
import { SurveyFormData, FormErrors, Lang } from "../types";
import { T_DATA } from "../translations";
import { QuestionCard, LikertScale, LinearRating, TextAreaInput } from "./FormControls";

interface CoreQuestionsProps {
  form: SurveyFormData;
  onChange: (field: keyof SurveyFormData, value: any) => void;
  errors: FormErrors;
  lang: Lang;
}

export const CoreQuestions = memo(function CoreQuestions({ form, onChange, errors, lang }: CoreQuestionsProps) {
  const t = T_DATA[lang];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-5 sm:p-6 mb-6">
        <h3 className="text-base sm:text-lg font-bold text-blue-950 dark:text-blue-100 mb-1">
          {t.coreSectionTitle}
        </h3>
        <p className="text-xs sm:text-sm text-blue-800/80 dark:text-blue-300 leading-relaxed">
          {t.coreSectionDesc}
        </p>
      </div>

      {/* Q1: Overall experience 1-5 */}
      <QuestionCard
        id="core_overall_experience"
        question={t.core_q1}
        required
        error={errors.core_overall_experience}
      >
        <LinearRating
          value={form.core_overall_experience}
          onChange={(val) => onChange("core_overall_experience", val)}
          lowLabel={t.linearScaleExp.low}
          highLabel={t.linearScaleExp.high}
        />
      </QuestionCard>

      {/* Q2: Useful value 1-5 Likert */}
      <QuestionCard
        id="core_useful_value"
        question={t.core_q2}
        required
        error={errors.core_useful_value}
      >
        <LikertScale
          value={form.core_useful_value}
          onChange={(val) => onChange("core_useful_value", val)}
          labels={t.likert}
        />
      </QuestionCard>

      {/* Q3: Well organized 1-5 Likert */}
      <QuestionCard
        id="core_well_organized"
        question={t.core_q3}
        required
        error={errors.core_well_organized}
      >
        <LikertScale
          value={form.core_well_organized}
          onChange={(val) => onChange("core_well_organized", val)}
          labels={t.likert}
        />
      </QuestionCard>

      {/* Q4: Theme clarity 1-5 Likert */}
      <QuestionCard
        id="core_theme_clarity"
        question={t.core_q4}
        required
        error={errors.core_theme_clarity}
      >
        <LikertScale
          value={form.core_theme_clarity}
          onChange={(val) => onChange("core_theme_clarity", val)}
          labels={t.likert}
        />
      </QuestionCard>

      {/* Q5: Future participation interest 1-5 Likert */}
      <QuestionCard
        id="core_future_interest"
        question={t.core_q5}
        required
        error={errors.core_future_interest}
      >
        <LikertScale
          value={form.core_future_interest}
          onChange={(val) => onChange("core_future_interest", val)}
          labels={t.likert}
        />
      </QuestionCard>

      {/* Q6: Most appreciated aspect (Paragraph) */}
      <QuestionCard
        id="core_most_appreciated"
        question={t.core_q6}
        required
        error={errors.core_most_appreciated}
      >
        <TextAreaInput
          value={form.core_most_appreciated}
          onChange={(val) => onChange("core_most_appreciated", val)}
          placeholder={t.core_q6_placeholder}
          rows={3}
        />
      </QuestionCard>

      {/* Q7: One thing to change for next time (Paragraph) */}
      <QuestionCard
        id="core_one_thing_to_change"
        question={t.core_q7}
        required
        error={errors.core_one_thing_to_change}
      >
        <TextAreaInput
          value={form.core_one_thing_to_change}
          onChange={(val) => onChange("core_one_thing_to_change", val)}
          placeholder={t.core_q7_placeholder}
          rows={3}
        />
      </QuestionCard>
    </div>
  );
});
