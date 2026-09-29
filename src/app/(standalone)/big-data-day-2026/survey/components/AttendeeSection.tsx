"use client";

import React, { useMemo, useCallback, memo } from "react";
import { SurveyFormData, FormErrors, Lang } from "../types";
import { T_DATA } from "../translations";
import {
  QuestionCard,
  LikertScale,
  MatrixGrid,
  SingleChoiceGroup,
  MultipleChoiceGroup,
  TextAreaInput,
  TextInput,
} from "./FormControls";

interface AttendeeSectionProps {
  form: SurveyFormData;
  onChange: (field: keyof SurveyFormData, value: any) => void;
  errors: FormErrors;
  lang: Lang;
}

interface SessionCheckboxItemProps {
  id: string;
  title: string;
  isChecked: boolean;
  onToggle: (id: string) => void;
}

const SessionCheckboxItem = memo(function SessionCheckboxItem({
  id,
  title,
  isChecked,
  onToggle,
}: SessionCheckboxItemProps) {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors duration-75 ${
        isChecked
          ? "bg-blue-50/80 border-blue-500 dark:bg-blue-950/50 dark:border-blue-400"
          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-300"
      }`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => onToggle(id)}
        className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 accent-blue-600 cursor-pointer"
      />
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
        {title}
      </span>
    </label>
  );
});

export const AttendeeSection = memo(function AttendeeSection({ form, onChange, errors, lang }: AttendeeSectionProps) {
  const t = T_DATA[lang];

  // Granular matrix callbacks to prevent unnecessary dependency re-creation
  const handleKnowledgeBeforeChange = useCallback(
    (rowId: string, colVal: string) => {
      onChange("att_knowledge_before", { ...(form.att_knowledge_before || {}), [rowId]: colVal });
    },
    [form.att_knowledge_before, onChange]
  );

  const handleKnowledgeAfterChange = useCallback(
    (rowId: string, colVal: string) => {
      onChange("att_knowledge_after", { ...(form.att_knowledge_after || {}), [rowId]: colVal });
    },
    [form.att_knowledge_after, onChange]
  );

  const handleSessionUsefulChange = useCallback(
    (rowId: string, colVal: string) => {
      onChange("att_session_usefulness", { ...(form.att_session_usefulness || {}), [rowId]: colVal });
    },
    [form.att_session_usefulness, onChange]
  );

  const handleSessionClarityChange = useCallback(
    (rowId: string, colVal: string) => {
      onChange("att_session_clarity", { ...(form.att_session_clarity || {}), [rowId]: colVal });
    },
    [form.att_session_clarity, onChange]
  );

  const handleSessionToggle = useCallback(
    (sessionId: string) => {
      const cur = form.att_sessions_attended || [];
      const updated = cur.includes(sessionId)
        ? cur.filter((id) => id !== sessionId)
        : [...cur, sessionId];
      onChange("att_sessions_attended", updated);
    },
    [form.att_sessions_attended, onChange]
  );

  const knowledgeCols = useMemo(() => [
    { value: "1", label: t.knowledgeScale[1] },
    { value: "2", label: t.knowledgeScale[2] },
    { value: "3", label: t.knowledgeScale[3] },
    { value: "4", label: t.knowledgeScale[4] },
    { value: "5", label: t.knowledgeScale[5] },
  ], [t.knowledgeScale]);

  const usefulCols = useMemo(() => [
    { value: "1", label: t.sessionUsefulScale[1] },
    { value: "2", label: t.sessionUsefulScale[2] },
    { value: "3", label: t.sessionUsefulScale[3] },
    { value: "4", label: t.sessionUsefulScale[4] },
    { value: "5", label: t.sessionUsefulScale[5] },
  ], [t.sessionUsefulScale]);

  const clarityCols = useMemo(() => [
    { value: "1", label: t.sessionClarityScale[1] },
    { value: "2", label: t.sessionClarityScale[2] },
    { value: "3", label: t.sessionClarityScale[3] },
    { value: "4", label: t.sessionClarityScale[4] },
    { value: "5", label: t.sessionClarityScale[5] },
  ], [t.sessionClarityScale]);

  // Filter sessions that were selected as attended
  const attendedSessionIds = form.att_sessions_attended || [];
  const attendedSessionRows = useMemo(() => {
    return t.sessionsList
      .filter((s) => attendedSessionIds.includes(s.id))
      .map((s) => ({ id: s.id, text: s.title }));
  }, [t.sessionsList, attendedSessionIds]);

  return (
    <div className="space-y-10">
      {/* ── SECTION A: ABOUT YOU ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.attSectionA_Title}
          </h3>
        </div>

        <QuestionCard
          id="attendee_target_group"
          question={t.att_group_q}
          required
          error={errors.attendee_target_group}
        >
          <SingleChoiceGroup
            name="attendee_target_group"
            options={t.att_groups}
            value={form.attendee_target_group}
            onChange={(val) => onChange("attendee_target_group", val)}
          />
        </QuestionCard>

        <QuestionCard
          id="attendee_hcmut_student"
          question={t.att_hcmut_q}
          required
          error={errors.attendee_hcmut_student}
        >
          <SingleChoiceGroup
            name="attendee_hcmut_student"
            options={lang === "vi" ? ["Có", "Không"] : ["Yes", "No"]}
            value={form.attendee_hcmut_student}
            onChange={(val) => onChange("attendee_hcmut_student", val)}
            allowOther={false}
          />
        </QuestionCard>

        <QuestionCard
          id="attendee_first_time_bdc"
          question={t.att_first_time_q}
          required
          error={errors.attendee_first_time_bdc}
        >
          <SingleChoiceGroup
            name="attendee_first_time_bdc"
            options={lang === "vi" ? ["Có", "Không"] : ["Yes", "No"]}
            value={form.attendee_first_time_bdc}
            onChange={(val) => onChange("attendee_first_time_bdc", val)}
            allowOther={false}
          />
        </QuestionCard>

        <QuestionCard
          id="attendee_discovery_channel"
          question={t.att_channels_q}
          required
          error={errors.attendee_discovery_channel}
        >
          <MultipleChoiceGroup
            options={t.att_channels}
            value={form.attendee_discovery_channel}
            onChange={(val) => onChange("attendee_discovery_channel", val)}
          />
        </QuestionCard>
      </div>

      {/* ── SECTION B: OVERALL EXPERIENCE ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.attSectionB_Title}
          </h3>
        </div>

        <QuestionCard id="att_theme_fit" question={t.att_b1} required error={errors.att_theme_fit}>
          <LikertScale
            value={form.att_theme_fit}
            onChange={(val) => onChange("att_theme_fit", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_technical_depth" question={t.att_b2} required error={errors.att_technical_depth}>
          <LikertScale
            value={form.att_technical_depth}
            onChange={(val) => onChange("att_technical_depth", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_duration_fit" question={t.att_b3} required error={errors.att_duration_fit}>
          <LikertScale
            value={form.att_duration_fit}
            onChange={(val) => onChange("att_duration_fit", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_session_flow" question={t.att_b4} required error={errors.att_session_flow}>
          <LikertScale
            value={form.att_session_flow}
            onChange={(val) => onChange("att_session_flow", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_time_worth" question={t.att_b5} required error={errors.att_time_worth}>
          <LikertScale
            value={form.att_time_worth}
            onChange={(val) => onChange("att_time_worth", val)}
            labels={t.likert}
          />
        </QuestionCard>
      </div>

      {/* ── SECTION C: LEARNING IMPACT ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.attSectionC_Title}
          </h3>
        </div>

        <QuestionCard id="att_learn_bdc_scope" question={t.att_c1} required error={errors.att_learn_bdc_scope}>
          <LikertScale
            value={form.att_learn_bdc_scope}
            onChange={(val) => onChange("att_learn_bdc_scope", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_learn_academic_directions" question={t.att_c2} required error={errors.att_learn_academic_directions}>
          <LikertScale
            value={form.att_learn_academic_directions}
            onChange={(val) => onChange("att_learn_academic_directions", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_learn_data_problem_solving" question={t.att_c3} required error={errors.att_learn_data_problem_solving}>
          <LikertScale
            value={form.att_learn_data_problem_solving}
            onChange={(val) => onChange("att_learn_data_problem_solving", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_learn_pipeline_understanding" question={t.att_c4} required error={errors.att_learn_pipeline_understanding}>
          <LikertScale
            value={form.att_learn_pipeline_understanding}
            onChange={(val) => onChange("att_learn_pipeline_understanding", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_learn_skills_preparation" question={t.att_c5} required error={errors.att_learn_skills_preparation}>
          <LikertScale
            value={form.att_learn_skills_preparation}
            onChange={(val) => onChange("att_learn_skills_preparation", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_learn_real_world_examples" question={t.att_c6} required error={errors.att_learn_real_world_examples}>
          <LikertScale
            value={form.att_learn_real_world_examples}
            onChange={(val) => onChange("att_learn_real_world_examples", val)}
            labels={t.likert}
          />
        </QuestionCard>
      </div>

      {/* ── SECTION D: PERCEIVED KNOWLEDGE GAIN ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.attSectionD_Title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.att_d_desc}
          </p>
        </div>

        {/* Matrix Before */}
        <QuestionCard
          id="att_knowledge_before"
          question={t.att_d_before_label}
          required
          note="Thang điểm 1 (Gần như chưa biết) đến 5 (Hiểu rất tốt)"
          error={errors.att_knowledge_before}
        >
          <MatrixGrid
            rows={t.knowledgeTopics}
            value={form.att_knowledge_before}
            onChange={handleKnowledgeBeforeChange}
            columns={knowledgeCols}
            rowHeader={lang === "vi" ? "Lĩnh vực chuyên môn" : "Technical Domain"}
          />
        </QuestionCard>

        {/* Matrix After */}
        <QuestionCard
          id="att_knowledge_after"
          question={t.att_d_after_label}
          required
          note="Thang điểm 1 (Gần như chưa biết) đến 5 (Hiểu rất tốt)"
          error={errors.att_knowledge_after}
        >
          <MatrixGrid
            rows={t.knowledgeTopics}
            value={form.att_knowledge_after}
            onChange={handleKnowledgeAfterChange}
            columns={knowledgeCols}
            rowHeader={lang === "vi" ? "Lĩnh vực chuyên môn" : "Technical Domain"}
          />
        </QuestionCard>
      </div>

      {/* ── SECTION E: SESSION EVALUATION ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.attSectionE_Title}
          </h3>
        </div>

        <QuestionCard
          id="att_sessions_attended"
          question={t.att_sessions_attended_q}
          required
          note={lang === "vi" ? "Chọn tất cả các phiên bạn đã tham dự hoặc theo dõi" : "Select all sessions you attended"}
          error={errors.att_sessions_attended}
        >
          <div className="space-y-2 pt-1">
            {t.sessionsList.map((session) => (
              <SessionCheckboxItem
                key={session.id}
                id={session.id}
                title={session.title}
                isChecked={(form.att_sessions_attended || []).includes(session.id)}
                onToggle={handleSessionToggle}
              />
            ))}
          </div>
        </QuestionCard>

        {/* Condition: if attended any sessions, show evaluation matrices */}
        {attendedSessionRows.length > 0 && (
          <>
            <QuestionCard
              id="att_session_usefulness"
              question={t.att_matrix_useful_label}
              required
              note="Thang điểm 1 (Không hữu ích) đến 5 (Rất hữu ích)"
              error={errors.att_session_usefulness}
            >
              <MatrixGrid
                rows={attendedSessionRows}
                value={form.att_session_usefulness}
                onChange={handleSessionUsefulChange}
                columns={usefulCols}
                rowHeader={lang === "vi" ? "Phiên đã theo dõi" : "Attended Session"}
              />
            </QuestionCard>

            <QuestionCard
              id="att_session_clarity"
              question={t.att_matrix_clarity_label}
              required
              note="Thang điểm 1 (Rất khó theo dõi) đến 5 (Rất dễ theo dõi)"
              error={errors.att_session_clarity}
            >
              <MatrixGrid
                rows={attendedSessionRows}
                value={form.att_session_clarity}
                onChange={handleSessionClarityChange}
                columns={clarityCols}
                rowHeader={lang === "vi" ? "Phiên đã theo dõi" : "Attended Session"}
              />
            </QuestionCard>

            <QuestionCard
              id="att_most_valuable_session"
              question={t.att_most_valuable_q}
              required
              error={errors.att_most_valuable_session}
            >
              <select
                value={form.att_most_valuable_session || ""}
                onChange={(e) => onChange("att_most_valuable_session", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 p-3.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">
                  {lang === "vi" ? "-- Chọn phiên ấn tượng nhất --" : "-- Select the most valuable session --"}
                </option>
                {attendedSessionRows.map((s) => (
                  <option key={s.id} value={s.text}>
                    {s.text}
                  </option>
                ))}
              </select>
            </QuestionCard>

            <QuestionCard
              id="att_most_valuable_reason"
              question={t.att_most_valuable_reason_q}
            >
              <TextAreaInput
                value={form.att_most_valuable_reason}
                onChange={(val) => onChange("att_most_valuable_reason", val)}
                placeholder={t.att_most_valuable_reason_placeholder}
                rows={2}
              />
            </QuestionCard>
          </>
        )}
      </div>

      {/* ── SECTION F: POSTER, DEMO & INTERACTION ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.attSectionF_Title}
          </h3>
        </div>

        <QuestionCard
          id="att_visited_poster_demo"
          question={t.att_poster_visit_q}
          required
          error={errors.att_visited_poster_demo}
        >
          <SingleChoiceGroup
            name="att_visited_poster_demo"
            options={lang === "vi" ? ["Có", "Không"] : ["Yes", "No"]}
            value={form.att_visited_poster_demo}
            onChange={(val) => onChange("att_visited_poster_demo", val)}
            allowOther={false}
          />
        </QuestionCard>

        {/* If Visited */}
        {(form.att_visited_poster_demo === "Có" || form.att_visited_poster_demo === "Yes") && (
          <>
            <QuestionCard id="att_poster_improved_understanding" question={t.att_f1_yes} required error={errors.att_poster_improved_understanding}>
              <LikertScale
                value={form.att_poster_improved_understanding}
                onChange={(val) => onChange("att_poster_improved_understanding", val)}
                labels={t.likert}
              />
            </QuestionCard>

            <QuestionCard id="att_poster_team_interaction" question={t.att_f2_yes} required error={errors.att_poster_team_interaction}>
              <LikertScale
                value={form.att_poster_team_interaction}
                onChange={(val) => onChange("att_poster_team_interaction", val)}
                labels={t.likert}
              />
            </QuestionCard>

            <QuestionCard id="att_poster_more_demos_future" question={t.att_f3_yes} required error={errors.att_poster_more_demos_future}>
              <LikertScale
                value={form.att_poster_more_demos_future}
                onChange={(val) => onChange("att_poster_more_demos_future", val)}
                labels={t.likert}
              />
            </QuestionCard>
          </>
        )}

        {/* If Not Visited */}
        {(form.att_visited_poster_demo === "Không" || form.att_visited_poster_demo === "No") && (
          <QuestionCard
            id="att_poster_not_visited_reason"
            question={t.att_f_no_reason_q}
            required
            error={errors.att_poster_not_visited_reason}
          >
            <SingleChoiceGroup
              name="att_poster_not_visited_reason"
              options={t.att_f_no_reasons}
              value={form.att_poster_not_visited_reason}
              onChange={(val) => onChange("att_poster_not_visited_reason", val)}
            />
          </QuestionCard>
        )}

        {/* Interaction with groups */}
        <QuestionCard
          id="att_interacted_groups"
          question={t.att_interacted_groups_q}
          required
          error={errors.att_interacted_groups}
        >
          <MultipleChoiceGroup
            options={t.att_interacted_groups}
            value={form.att_interacted_groups}
            onChange={(val) => onChange("att_interacted_groups", val)}
            allowOther={false}
          />
        </QuestionCard>

        <QuestionCard id="att_qa_opportunity" question={t.att_f_qa} required error={errors.att_qa_opportunity}>
          <LikertScale
            value={form.att_qa_opportunity}
            onChange={(val) => onChange("att_qa_opportunity", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_networking_value" question={t.att_f_networking} required error={errors.att_networking_value}>
          <LikertScale
            value={form.att_networking_value}
            onChange={(val) => onChange("att_networking_value", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_meaningful_connection" question={t.att_f_new_conn} required error={errors.att_meaningful_connection}>
          <LikertScale
            value={form.att_meaningful_connection}
            onChange={(val) => onChange("att_meaningful_connection", val)}
            labels={t.likert}
          />
        </QuestionCard>
      </div>

      {/* ── SECTION G: LOGISTICS ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.attSectionG_Title}
          </h3>
        </div>

        <QuestionCard id="att_logistics_checkin" question={t.att_g1} required error={errors.att_logistics_checkin}>
          <LikertScale
            value={form.att_logistics_checkin}
            onChange={(val) => onChange("att_logistics_checkin", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_logistics_pre_info" question={t.att_g2} required error={errors.att_logistics_pre_info}>
          <LikertScale
            value={form.att_logistics_pre_info}
            onChange={(val) => onChange("att_logistics_pre_info", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_logistics_venue" question={t.att_g3} required error={errors.att_logistics_venue}>
          <LikertScale
            value={form.att_logistics_venue}
            onChange={(val) => onChange("att_logistics_venue", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_logistics_av_system" question={t.att_g4} required error={errors.att_logistics_av_system}>
          <LikertScale
            value={form.att_logistics_av_system}
            onChange={(val) => onChange("att_logistics_av_system", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_logistics_punctuality" question={t.att_g5} required error={errors.att_logistics_punctuality}>
          <LikertScale
            value={form.att_logistics_punctuality}
            onChange={(val) => onChange("att_logistics_punctuality", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_logistics_breaks" question={t.att_g6} required error={errors.att_logistics_breaks}>
          <LikertScale
            value={form.att_logistics_breaks}
            onChange={(val) => onChange("att_logistics_breaks", val)}
            labels={t.likert}
          />
        </QuestionCard>

        <QuestionCard id="att_logistics_wayfinding" question={t.att_g7} required error={errors.att_logistics_wayfinding}>
          <LikertScale
            value={form.att_logistics_wayfinding}
            onChange={(val) => onChange("att_logistics_wayfinding", val)}
            labels={t.likert}
          />
        </QuestionCard>
      </div>

      {/* ── SECTION H: FUTURE DEMAND ── */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {t.attSectionH_Title}
          </h3>
        </div>

        <QuestionCard
          id="att_future_topics"
          question={t.att_h_topics_q}
          required
          error={errors.att_future_topics}
        >
          <MultipleChoiceGroup
            options={t.att_h_topics}
            value={form.att_future_topics}
            onChange={(val) => onChange("att_future_topics", val)}
          />
        </QuestionCard>

        <QuestionCard
          id="att_future_formats"
          question={t.att_h_format_q}
          required
          error={errors.att_future_formats}
        >
          <SingleChoiceGroup
            name="att_future_formats"
            options={t.att_h_formats}
            value={form.att_future_formats}
            onChange={(val) => onChange("att_future_formats", val)}
          />
        </QuestionCard>

        <QuestionCard
          id="att_subscribe_newsletter"
          question={t.att_h_newsletter_q}
          required
          error={errors.att_subscribe_newsletter}
        >
          <SingleChoiceGroup
            name="att_subscribe_newsletter"
            options={lang === "vi" ? ["Có", "Không"] : ["Yes", "No"]}
            value={form.att_subscribe_newsletter}
            onChange={(val) => onChange("att_subscribe_newsletter", val)}
            allowOther={false}
          />
        </QuestionCard>

        {(form.att_subscribe_newsletter === "Có" || form.att_subscribe_newsletter === "Yes") && (
          <QuestionCard
            id="att_followup_email"
            question={t.att_h_email_prompt}
            note={lang === "vi" ? "Nếu đã nhập email ở Bước 1, bạn có thể để trống mục này." : "If already entered in Step 1, you can leave this blank."}
          >
            <TextInput
              type="email"
              value={form.att_followup_email}
              onChange={(val) => onChange("att_followup_email", val)}
              placeholder="example@student.hcmut.edu.vn"
            />
          </QuestionCard>
        )}
      </div>
    </div>
  );
});
