export type RoleTrack = "attendee" | "speaker" | "guest_partner" | "organizer";

export type Lang = "vi" | "en";

export interface SurveyFormData {
  // Metadata & Step
  _step?: number;
  _track?: RoleTrack;
  roleTrack: RoleTrack;

  // Basic Info (Optional & Anonymous friendly)
  fullName?: string;
  email?: string;
  organization?: string;

  // Core Questions (Shared for all 4 roles)
  core_overall_experience?: string; // 1-5 linear scale
  core_useful_value?: string; // 1-5 Likert
  core_well_organized?: string; // 1-5 Likert
  core_theme_clarity?: string; // 1-5 Likert
  core_future_interest?: string; // 1-5 Likert
  core_most_appreciated?: string; // Paragraph
  core_one_thing_to_change?: string; // Paragraph

  // ================= ATTENDEE FIELDS =================
  attendee_target_group?: string;
  attendee_hcmut_student?: string; // "Có" | "Không"
  attendee_first_time_bdc?: string; // "Có" | "Không"
  attendee_discovery_channel?: string[];

  // Attendee Section B: Overall experience (Likert 1-5)
  att_theme_fit?: string;
  att_technical_depth?: string;
  att_duration_fit?: string;
  att_session_flow?: string;
  att_time_worth?: string;

  // Attendee Section C: Learning Impact (Likert 1-5)
  att_learn_bdc_scope?: string;
  att_learn_academic_directions?: string;
  att_learn_data_problem_solving?: string;
  att_learn_pipeline_understanding?: string;
  att_learn_skills_preparation?: string;
  att_learn_real_world_examples?: string;

  // Attendee Section D: Perceived Knowledge Gain (Before & After grids: topic -> score 1-5)
  att_knowledge_before?: Record<string, string>;
  att_knowledge_after?: Record<string, string>;

  // Attendee Section E: Session Evaluation
  att_sessions_attended?: string[];
  att_session_usefulness?: Record<string, string>;
  att_session_clarity?: Record<string, string>;
  att_most_valuable_session?: string;
  att_most_valuable_reason?: string;

  // Attendee Section F: Poster / Demo & Interaction
  att_visited_poster_demo?: string; // "Có" | "Không"
  att_poster_improved_understanding?: string;
  att_poster_team_interaction?: string;
  att_poster_more_demos_future?: string;
  att_poster_not_visited_reason?: string;
  att_interacted_groups?: string[];
  att_qa_opportunity?: string;
  att_networking_value?: string;
  att_meaningful_connection?: string;

  // Attendee Section G: Logistics (Likert 1-5)
  att_logistics_checkin?: string;
  att_logistics_pre_info?: string;
  att_logistics_venue?: string;
  att_logistics_av_system?: string;
  att_logistics_punctuality?: string;
  att_logistics_breaks?: string;
  att_logistics_wayfinding?: string;

  // Attendee Section H: Future Demand
  att_future_topics?: string[];
  att_future_formats?: string;
  att_subscribe_newsletter?: string; // "Có" | "Không"
  att_followup_email?: string;

  // ================= SPEAKER FIELDS =================
  // Before Event (Likert 1-5)
  spk_info_clarity?: string;
  spk_audience_understanding?: string;
  spk_scope_communication?: string;
  spk_schedule_venue_info?: string;
  spk_comm_with_organizer?: string;

  // During Event (Likert 1-5)
  spk_reception_support?: string;
  spk_av_equipment?: string;
  spk_time_allocation?: string;
  spk_transition_flow?: string;
  spk_audience_engagement?: string;
  spk_qa_time?: string;

  // Overall & Future
  spk_platform_suitability?: string;
  spk_willing_to_rejoin?: string;
  spk_best_support_aspect?: string;
  spk_support_improvement?: string;
  spk_audience_prerequisites?: string;
  spk_collaboration_interests?: string[];
  spk_future_topic_suggestions?: string;

  // ================= GUEST / PARTNER FIELDS =================
  gst_goal_clarity?: string;
  gst_bdc_capacity_understanding?: string;
  gst_practical_student_projects?: string;
  gst_professional_quality?: string;
  gst_student_interaction_opportunity?: string;
  gst_expert_networking_opportunity?: string;
  gst_poster_demo_capacity?: string;
  gst_networking_value?: string;
  gst_collaboration_potential?: string;
  gst_collaboration_forms?: string[];
  gst_notable_projects?: string;
  gst_student_skills_needed?: string;
  gst_future_event_suggestions?: string;
  gst_contact_permission?: string;
  gst_contact_details?: string;

  // ================= ORGANIZER FIELDS =================
  org_role_teams?: string[];
  org_preparation_duration?: string;
  org_workload_level?: string;

  // Planning (Likert 1-5)
  org_role_clarity?: string;
  org_accountability_clarity?: string;
  org_reasonable_deadlines?: string;
  org_timely_change_updates?: string;
  org_interteam_coordination?: string;
  org_valuable_meetings?: string;
  org_management_tools?: string;

  // Event Execution (Likert 1-5)
  org_setup_execution?: string;
  org_checkin_efficiency?: string;
  org_speaker_coordination?: string;
  org_technical_support?: string;
  org_schedule_coordination?: string;
  org_poster_demo_operation?: string;
  org_teabreak_catering?: string;
  org_networking_session?: string;
  org_issue_handling?: string;
  org_escalation_clarity?: string;

  // Retrospective
  org_exceeded_expectations?: string;
  org_not_as_planned?: string;
  org_biggest_issue?: string;
  org_resolution_method?: string;
  org_high_effort_low_value?: string;
  org_should_start_earlier?: string;
  org_late_decisions?: string;
  org_missing_info?: string;
  org_unclear_responsibility?: string;
  org_first_thing_to_change?: string;

  // Retrospective 4 Pillars
  org_kira_keep?: string;
  org_kira_improve?: string;
  org_kira_remove?: string;
  org_kira_add?: string;

  // Optional Incident Log
  org_has_incident?: string; // "Có" | "Không"
  incident_category?: string;
  incident_occurred_time?: string;
  incident_severity?: string;
  incident_description?: string;
  incident_action_taken?: string;
  incident_outcome?: string;
  incident_root_cause?: string;
  incident_prevention_proposal?: string;
}

export interface FormErrors {
  [key: string]: string;
}
