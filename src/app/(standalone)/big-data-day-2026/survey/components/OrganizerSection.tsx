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

interface OrganizerSectionProps {
  form: SurveyFormData;
  onChange: (field: keyof SurveyFormData, value: any) => void;
  errors: FormErrors;
  lang: Lang;
}

export function OrganizerSection({ form, onChange, errors, lang }: OrganizerSectionProps) {
  const t = T_DATA[lang];

  return (
    <div className="space-y-10">
      {/* ── SECTION 1: ROLES & WORKLOAD ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.orgSectionA_Title}
          </h3>
        </div>

        <QuestionCard
          id="org_role_teams"
          question={t.org_teams_q}
          required
          error={errors.org_role_teams}
        >
          <MultipleChoiceGroup
            options={t.org_teams_options}
            value={form.org_role_teams}
            onChange={(val) => onChange("org_role_teams", val)}
          />
        </QuestionCard>

        <QuestionCard
          id="org_preparation_duration"
          question={t.org_duration_q}
          required
          error={errors.org_preparation_duration}
        >
          <SingleChoiceGroup
            name="org_preparation_duration"
            options={t.org_duration_options}
            value={form.org_preparation_duration}
            onChange={(val) => onChange("org_preparation_duration", val)}
            allowOther={false}
          />
        </QuestionCard>

        <QuestionCard
          id="org_workload_level"
          question={t.org_workload_q}
          required
          error={errors.org_workload_level}
        >
          <SingleChoiceGroup
            name="org_workload_level"
            options={t.org_workload_options}
            value={form.org_workload_level}
            onChange={(val) => onChange("org_workload_level", val)}
            allowOther={false}
          />
        </QuestionCard>
      </div>

      {/* ── SECTION 2: PLANNING ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.orgSectionB_Title}
          </h3>
        </div>

        <QuestionCard id="org_role_clarity" question={t.org_b1} required error={errors.org_role_clarity}>
          <LikertScale
            value={form.org_role_clarity}
            onChange={(val) => onChange("org_role_clarity", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_accountability_clarity" question={t.org_b2} required error={errors.org_accountability_clarity}>
          <LikertScale
            value={form.org_accountability_clarity}
            onChange={(val) => onChange("org_accountability_clarity", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_reasonable_deadlines" question={t.org_b3} required error={errors.org_reasonable_deadlines}>
          <LikertScale
            value={form.org_reasonable_deadlines}
            onChange={(val) => onChange("org_reasonable_deadlines", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_timely_change_updates" question={t.org_b4} required error={errors.org_timely_change_updates}>
          <LikertScale
            value={form.org_timely_change_updates}
            onChange={(val) => onChange("org_timely_change_updates", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_interteam_coordination" question={t.org_b5} required error={errors.org_interteam_coordination}>
          <LikertScale
            value={form.org_interteam_coordination}
            onChange={(val) => onChange("org_interteam_coordination", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_valuable_meetings" question={t.org_b6} required error={errors.org_valuable_meetings}>
          <LikertScale
            value={form.org_valuable_meetings}
            onChange={(val) => onChange("org_valuable_meetings", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_management_tools" question={t.org_b7} required error={errors.org_management_tools}>
          <LikertScale
            value={form.org_management_tools}
            onChange={(val) => onChange("org_management_tools", val)}
            labels={t.likert}
          />
        </QuestionCard>
      </div>

      {/* ── SECTION 3: EXECUTION ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.orgSectionC_Title}
          </h3>
        </div>

        <QuestionCard id="org_setup_execution" question={t.org_c1} required error={errors.org_setup_execution}>
          <LikertScale
            value={form.org_setup_execution}
            onChange={(val) => onChange("org_setup_execution", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_checkin_efficiency" question={t.org_c2} required error={errors.org_checkin_efficiency}>
          <LikertScale
            value={form.org_checkin_efficiency}
            onChange={(val) => onChange("org_checkin_efficiency", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_speaker_coordination" question={t.org_c3} required error={errors.org_speaker_coordination}>
          <LikertScale
            value={form.org_speaker_coordination}
            onChange={(val) => onChange("org_speaker_coordination", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_technical_support" question={t.org_c4} required error={errors.org_technical_support}>
          <LikertScale
            value={form.org_technical_support}
            onChange={(val) => onChange("org_technical_support", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_schedule_coordination" question={t.org_c5} required error={errors.org_schedule_coordination}>
          <LikertScale
            value={form.org_schedule_coordination}
            onChange={(val) => onChange("org_schedule_coordination", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_poster_demo_operation" question={t.org_c6} required error={errors.org_poster_demo_operation}>
          <LikertScale
            value={form.org_poster_demo_operation}
            onChange={(val) => onChange("org_poster_demo_operation", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_teabreak_catering" question={t.org_c7} required error={errors.org_teabreak_catering}>
          <LikertScale
            value={form.org_teabreak_catering}
            onChange={(val) => onChange("org_teabreak_catering", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_networking_session" question={t.org_c8} required error={errors.org_networking_session}>
          <LikertScale
            value={form.org_networking_session}
            onChange={(val) => onChange("org_networking_session", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_issue_handling" question={t.org_c9} required error={errors.org_issue_handling}>
          <LikertScale
            value={form.org_issue_handling}
            onChange={(val) => onChange("org_issue_handling", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="org_escalation_clarity" question={t.org_c10} required error={errors.org_escalation_clarity}>
          <LikertScale
            value={form.org_escalation_clarity}
            onChange={(val) => onChange("org_escalation_clarity", val)}
            labels={t.likert}
          />
        </QuestionCard>
      </div>

      {/* ── SECTION 4: ORGANIZER RETROSPECTIVE ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.orgSectionD_Title}
          </h3>
        </div>

        <QuestionCard
          id="org_exceeded_expectations"
          question={t.org_exceeded_q}
          required
          error={errors.org_exceeded_expectations}
        >
          <TextAreaInput
            value={form.org_exceeded_expectations}
            onChange={(val) => onChange("org_exceeded_expectations", val)}
            placeholder={t.org_exceeded_placeholder}
            rows={2}
          />
        </QuestionCard>

        <QuestionCard
          id="org_not_as_planned"
          question={t.org_not_as_planned_q}
          required
          error={errors.org_not_as_planned}
        >
          <TextAreaInput
            value={form.org_not_as_planned}
            onChange={(val) => onChange("org_not_as_planned", val)}
            placeholder={t.org_not_as_planned_placeholder}
            rows={2}
          />
        </QuestionCard>

        <QuestionCard
          id="org_biggest_issue"
          question={t.org_biggest_issue_q}
          required
          error={errors.org_biggest_issue}
        >
          <TextAreaInput
            value={form.org_biggest_issue}
            onChange={(val) => onChange("org_biggest_issue", val)}
            placeholder={t.org_biggest_issue_placeholder}
            rows={2}
          />
        </QuestionCard>

        <QuestionCard
          id="org_resolution_method"
          question={t.org_resolution_q}
          required
          error={errors.org_resolution_method}
        >
          <TextAreaInput
            value={form.org_resolution_method}
            onChange={(val) => onChange("org_resolution_method", val)}
            placeholder={t.org_resolution_placeholder}
            rows={2}
          />
        </QuestionCard>

        <QuestionCard
          id="org_high_effort_low_value"
          question={t.org_high_effort_q}
        >
          <TextAreaInput
            value={form.org_high_effort_low_value}
            onChange={(val) => onChange("org_high_effort_low_value", val)}
            placeholder={t.org_high_effort_placeholder}
            rows={2}
          />
        </QuestionCard>

        <QuestionCard
          id="org_should_start_earlier"
          question={t.org_early_start_q}
        >
          <TextAreaInput
            value={form.org_should_start_earlier}
            onChange={(val) => onChange("org_should_start_earlier", val)}
            placeholder={t.org_early_start_placeholder}
            rows={2}
          />
        </QuestionCard>

        <QuestionCard
          id="org_late_decisions"
          question={t.org_late_decisions_q}
        >
          <TextAreaInput
            value={form.org_late_decisions}
            onChange={(val) => onChange("org_late_decisions", val)}
            placeholder={t.org_late_decisions_placeholder}
            rows={2}
          />
        </QuestionCard>

        <QuestionCard
          id="org_missing_info"
          question={t.org_missing_info_q}
        >
          <TextAreaInput
            value={form.org_missing_info}
            onChange={(val) => onChange("org_missing_info", val)}
            placeholder={t.org_missing_info_placeholder}
            rows={2}
          />
        </QuestionCard>

        <QuestionCard
          id="org_unclear_responsibility"
          question={t.org_unclear_resp_q}
        >
          <TextAreaInput
            value={form.org_unclear_responsibility}
            onChange={(val) => onChange("org_unclear_responsibility", val)}
            placeholder={t.org_unclear_resp_placeholder}
            rows={2}
          />
        </QuestionCard>

        <QuestionCard
          id="org_first_thing_to_change"
          question={t.org_first_change_q}
          required
          error={errors.org_first_thing_to_change}
        >
          <TextAreaInput
            value={form.org_first_thing_to_change}
            onChange={(val) => onChange("org_first_thing_to_change", val)}
            placeholder={t.org_first_change_placeholder}
            rows={2}
          />
        </QuestionCard>

        {/* ── 4 PILLARS (KEEP, IMPROVE, REMOVE, ADD) ── */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
            {t.orgKira_Title}
          </h4>

          <QuestionCard id="org_kira_keep" question={t.org_kira_keep_q} required error={errors.org_kira_keep}>
            <TextAreaInput
              value={form.org_kira_keep}
              onChange={(val) => onChange("org_kira_keep", val)}
              placeholder={t.org_kira_keep_placeholder}
              rows={2}
            />
          </QuestionCard>

          <QuestionCard id="org_kira_improve" question={t.org_kira_improve_q} required error={errors.org_kira_improve}>
            <TextAreaInput
              value={form.org_kira_improve}
              onChange={(val) => onChange("org_kira_improve", val)}
              placeholder={t.org_kira_improve_placeholder}
              rows={2}
            />
          </QuestionCard>

          <QuestionCard id="org_kira_remove" question={t.org_kira_remove_q} required error={errors.org_kira_remove}>
            <TextAreaInput
              value={form.org_kira_remove}
              onChange={(val) => onChange("org_kira_remove", val)}
              placeholder={t.org_kira_remove_placeholder}
              rows={2}
            />
          </QuestionCard>

          <QuestionCard id="org_kira_add" question={t.org_kira_add_q} required error={errors.org_kira_add}>
            <TextAreaInput
              value={form.org_kira_add}
              onChange={(val) => onChange("org_kira_add", val)}
              placeholder={t.org_kira_add_placeholder}
              rows={2}
            />
          </QuestionCard>
        </div>
      </div>

      {/* ── SECTION 5: INCIDENT LOG (OPTIONAL) ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.orgSectionE_Title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.org_incident_intro}
          </p>
        </div>

        <QuestionCard
          id="org_has_incident"
          question={t.org_has_incident_q}
          required
          error={errors.org_has_incident}
        >
          <SingleChoiceGroup
            name="org_has_incident"
            options={lang === "vi" ? ["Có", "Không"] : ["Yes", "No"]}
            value={form.org_has_incident}
            onChange={(val) => onChange("org_has_incident", val)}
            allowOther={false}
          />
        </QuestionCard>

        {(form.org_has_incident === "Có" || form.org_has_incident === "Yes") && (
          <div className="space-y-6 pl-2 sm:pl-4 border-l-2 border-amber-300 dark:border-amber-700">
            <QuestionCard id="incident_category" question={t.incident_category_q} required error={errors.incident_category}>
              <SingleChoiceGroup
                name="incident_category"
                options={t.incident_categories}
                value={form.incident_category}
                onChange={(val) => onChange("incident_category", val)}
              />
            </QuestionCard>

            <QuestionCard id="incident_occurred_time" question={t.incident_time_q} required error={errors.incident_occurred_time}>
              <TextInput
                value={form.incident_occurred_time}
                onChange={(val) => onChange("incident_occurred_time", val)}
                placeholder={t.incident_time_placeholder}
              />
            </QuestionCard>

            <QuestionCard id="incident_severity" question={t.incident_severity_q} required error={errors.incident_severity}>
              <SingleChoiceGroup
                name="incident_severity"
                options={t.incident_severities}
                value={form.incident_severity}
                onChange={(val) => onChange("incident_severity", val)}
                allowOther={false}
              />
            </QuestionCard>

            <QuestionCard id="incident_description" question={t.incident_desc_q} required error={errors.incident_description}>
              <TextAreaInput
                value={form.incident_description}
                onChange={(val) => onChange("incident_description", val)}
                placeholder={t.incident_desc_placeholder}
                rows={3}
              />
            </QuestionCard>

            <QuestionCard id="incident_action_taken" question={t.incident_action_q} required error={errors.incident_action_taken}>
              <TextAreaInput
                value={form.incident_action_taken}
                onChange={(val) => onChange("incident_action_taken", val)}
                placeholder={t.incident_action_placeholder}
                rows={3}
              />
            </QuestionCard>

            <QuestionCard id="incident_outcome" question={t.incident_outcome_q} required error={errors.incident_outcome}>
              <TextAreaInput
                value={form.incident_outcome}
                onChange={(val) => onChange("incident_outcome", val)}
                placeholder={t.incident_outcome_placeholder}
                rows={2}
              />
            </QuestionCard>

            <QuestionCard id="incident_root_cause" question={t.incident_root_cause_q} required error={errors.incident_root_cause}>
              <TextAreaInput
                value={form.incident_root_cause}
                onChange={(val) => onChange("incident_root_cause", val)}
                placeholder={t.incident_root_cause_placeholder}
                rows={2}
              />
            </QuestionCard>

            <QuestionCard id="incident_prevention_proposal" question={t.incident_prevention_q} required error={errors.incident_prevention_proposal}>
              <TextAreaInput
                value={form.incident_prevention_proposal}
                onChange={(val) => onChange("incident_prevention_proposal", val)}
                placeholder={t.incident_prevention_placeholder}
                rows={2}
              />
            </QuestionCard>
          </div>
        )}
      </div>
    </div>
  );
}
