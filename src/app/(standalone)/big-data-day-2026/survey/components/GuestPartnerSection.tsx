"use client";

import React from "react";
import { SurveyFormData, FormErrors, Lang } from "../types";
import { T_DATA } from "../translations";
import {
  QuestionCard,
  LikertScale,
  SingleChoiceGroup,
  MultipleChoiceGroup,
  TextAreaInput,
  TextInput,
} from "./FormControls";

interface GuestPartnerSectionProps {
  form: SurveyFormData;
  onChange: (field: keyof SurveyFormData, value: any) => void;
  errors: FormErrors;
  lang: Lang;
}

export function GuestPartnerSection({ form, onChange, errors, lang }: GuestPartnerSectionProps) {
  const t = T_DATA[lang];

  return (
    <div className="space-y-10">
      {/* ── SECTION A: EVALUATION ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.gstSectionA_Title}
          </h3>
        </div>

        <QuestionCard id="gst_goal_clarity" question={t.gst_a1} required error={errors.gst_goal_clarity}>
          <LikertScale
            value={form.gst_goal_clarity}
            onChange={(val) => onChange("gst_goal_clarity", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="gst_bdc_capacity_understanding" question={t.gst_a2} required error={errors.gst_bdc_capacity_understanding}>
          <LikertScale
            value={form.gst_bdc_capacity_understanding}
            onChange={(val) => onChange("gst_bdc_capacity_understanding", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="gst_practical_student_projects" question={t.gst_a3} required error={errors.gst_practical_student_projects}>
          <LikertScale
            value={form.gst_practical_student_projects}
            onChange={(val) => onChange("gst_practical_student_projects", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="gst_professional_quality" question={t.gst_a4} required error={errors.gst_professional_quality}>
          <LikertScale
            value={form.gst_professional_quality}
            onChange={(val) => onChange("gst_professional_quality", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="gst_student_interaction_opportunity" question={t.gst_a5} required error={errors.gst_student_interaction_opportunity}>
          <LikertScale
            value={form.gst_student_interaction_opportunity}
            onChange={(val) => onChange("gst_student_interaction_opportunity", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="gst_expert_networking_opportunity" question={t.gst_a6} required error={errors.gst_expert_networking_opportunity}>
          <LikertScale
            value={form.gst_expert_networking_opportunity}
            onChange={(val) => onChange("gst_expert_networking_opportunity", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="gst_poster_demo_capacity" question={t.gst_a7} required error={errors.gst_poster_demo_capacity}>
          <LikertScale
            value={form.gst_poster_demo_capacity}
            onChange={(val) => onChange("gst_poster_demo_capacity", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="gst_networking_value" question={t.gst_a8} required error={errors.gst_networking_value}>
          <LikertScale
            value={form.gst_networking_value}
            onChange={(val) => onChange("gst_networking_value", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="gst_collaboration_potential" question={t.gst_a9} required error={errors.gst_collaboration_potential}>
          <LikertScale
            value={form.gst_collaboration_potential}
            onChange={(val) => onChange("gst_collaboration_potential", val)}
            labels={t.likert}
          />
        </QuestionCard>
      </div>

      {/* ── SECTION B: COLLABORATION ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.gstSectionB_Title}
          </h3>
        </div>

        <QuestionCard
          id="gst_collaboration_forms"
          question={t.gst_collab_q}
          required
          error={errors.gst_collaboration_forms}
        >
          <MultipleChoiceGroup
            options={t.gst_collab_options}
            value={form.gst_collaboration_forms}
            onChange={(val) => onChange("gst_collaboration_forms", val)}
          />
        </QuestionCard>

        <QuestionCard
          id="gst_notable_projects"
          question={t.gst_notable_projects_q}
        >
          <TextAreaInput
            value={form.gst_notable_projects}
            onChange={(val) => onChange("gst_notable_projects", val)}
            placeholder={t.gst_notable_projects_placeholder}
            rows={3}
          />
        </QuestionCard>

        <QuestionCard
          id="gst_student_skills_needed"
          question={t.gst_skills_needed_q}
        >
          <TextAreaInput
            value={form.gst_student_skills_needed}
            onChange={(val) => onChange("gst_student_skills_needed", val)}
            placeholder={t.gst_skills_needed_placeholder}
            rows={3}
          />
        </QuestionCard>

        <QuestionCard
          id="gst_future_event_suggestions"
          question={t.gst_future_suggestions_q}
        >
          <TextAreaInput
            value={form.gst_future_event_suggestions}
            onChange={(val) => onChange("gst_future_event_suggestions", val)}
            placeholder={t.gst_future_suggestions_placeholder}
            rows={3}
          />
        </QuestionCard>

        <QuestionCard
          id="gst_contact_permission"
          question={t.gst_contact_permission_q}
          required
          error={errors.gst_contact_permission}
        >
          <SingleChoiceGroup
            name="gst_contact_permission"
            options={t.gst_contact_options}
            value={form.gst_contact_permission}
            onChange={(val) => onChange("gst_contact_permission", val)}
            allowOther={false}
          />
        </QuestionCard>

        {form.gst_contact_permission && !form.gst_contact_permission.includes("Chưa") && !form.gst_contact_permission.includes("Not") && (
          <QuestionCard
            id="gst_contact_details"
            question={t.gst_contact_details_label}
          >
            <TextInput
              value={form.gst_contact_details}
              onChange={(val) => onChange("gst_contact_details", val)}
              placeholder={t.gst_contact_details_placeholder}
            />
          </QuestionCard>
        )}
      </div>
    </div>
  );
}
