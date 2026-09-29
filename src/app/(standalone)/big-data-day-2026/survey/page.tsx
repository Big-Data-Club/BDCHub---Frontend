"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  RoleTrack,
  Lang,
  SurveyFormData,
  FormErrors,
} from "./types";
import { T_DATA } from "./translations";
import { SurveyHeader } from "./components/Header";
import { CoreQuestions } from "./components/CoreQuestions";
import { AttendeeSection } from "./components/AttendeeSection";
import { SpeakerSection } from "./components/SpeakerSection";
import { GuestPartnerSection } from "./components/GuestPartnerSection";
import { OrganizerSection } from "./components/OrganizerSection";
import { SuccessView } from "./components/SuccessView";
import { QuestionCard, SingleChoiceGroup, TextInput } from "./components/FormControls";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  UserCheck,
  Award,
  Briefcase,
  Users,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

const LS_DRAFT_KEY = "bdd2026_survey_draft";
const LS_SUBMITTED_KEY = "bdd2026_survey_submitted";
const LS_THEME_KEY = "bdd2026_survey_theme";

const INITIAL_FORM: SurveyFormData = {
  roleTrack: "attendee",
  fullName: "",
  email: "",
  organization: "",

  // Core
  core_overall_experience: "",
  core_useful_value: "",
  core_well_organized: "",
  core_theme_clarity: "",
  core_future_interest: "",
  core_most_appreciated: "",
  core_one_thing_to_change: "",

  // Attendee
  attendee_target_group: "",
  attendee_hcmut_student: "",
  attendee_first_time_bdc: "",
  attendee_discovery_channel: [],
  att_theme_fit: "",
  att_technical_depth: "",
  att_duration_fit: "",
  att_session_flow: "",
  att_time_worth: "",
  att_learn_bdc_scope: "",
  att_learn_academic_directions: "",
  att_learn_data_problem_solving: "",
  att_learn_pipeline_understanding: "",
  att_learn_skills_preparation: "",
  att_learn_real_world_examples: "",
  att_knowledge_before: {},
  att_knowledge_after: {},
  att_sessions_attended: [],
  att_session_usefulness: {},
  att_session_clarity: {},
  att_most_valuable_session: "",
  att_most_valuable_reason: "",
  att_visited_poster_demo: "",
  att_poster_improved_understanding: "",
  att_poster_team_interaction: "",
  att_poster_more_demos_future: "",
  att_poster_not_visited_reason: "",
  att_interacted_groups: [],
  att_qa_opportunity: "",
  att_networking_value: "",
  att_meaningful_connection: "",
  att_logistics_checkin: "",
  att_logistics_pre_info: "",
  att_logistics_venue: "",
  att_logistics_av_system: "",
  att_logistics_punctuality: "",
  att_logistics_breaks: "",
  att_logistics_wayfinding: "",
  att_future_topics: [],
  att_future_formats: "",
  att_subscribe_newsletter: "",
  att_followup_email: "",

  // Speaker
  spk_info_clarity: "",
  spk_audience_understanding: "",
  spk_scope_communication: "",
  spk_schedule_venue_info: "",
  spk_comm_with_organizer: "",
  spk_reception_support: "",
  spk_av_equipment: "",
  spk_time_allocation: "",
  spk_transition_flow: "",
  spk_audience_engagement: "",
  spk_qa_time: "",
  spk_platform_suitability: "",
  spk_willing_to_rejoin: "",
  spk_best_support_aspect: "",
  spk_support_improvement: "",
  spk_audience_prerequisites: "",
  spk_collaboration_interests: [],
  spk_future_topic_suggestions: "",

  // Guest / Partner
  gst_goal_clarity: "",
  gst_bdc_capacity_understanding: "",
  gst_practical_student_projects: "",
  gst_professional_quality: "",
  gst_student_interaction_opportunity: "",
  gst_expert_networking_opportunity: "",
  gst_poster_demo_capacity: "",
  gst_networking_value: "",
  gst_collaboration_potential: "",
  gst_collaboration_forms: [],
  gst_notable_projects: "",
  gst_student_skills_needed: "",
  gst_future_event_suggestions: "",
  gst_contact_permission: "",
  gst_contact_details: "",

  // Organizer
  org_role_teams: [],
  org_preparation_duration: "",
  org_workload_level: "",
  org_role_clarity: "",
  org_accountability_clarity: "",
  org_reasonable_deadlines: "",
  org_timely_change_updates: "",
  org_interteam_coordination: "",
  org_valuable_meetings: "",
  org_management_tools: "",
  org_setup_execution: "",
  org_checkin_efficiency: "",
  org_speaker_coordination: "",
  org_technical_support: "",
  org_schedule_coordination: "",
  org_poster_demo_operation: "",
  org_teabreak_catering: "",
  org_networking_session: "",
  org_issue_handling: "",
  org_escalation_clarity: "",
  org_exceeded_expectations: "",
  org_not_as_planned: "",
  org_biggest_issue: "",
  org_resolution_method: "",
  org_high_effort_low_value: "",
  org_should_start_earlier: "",
  org_late_decisions: "",
  org_missing_info: "",
  org_unclear_responsibility: "",
  org_first_thing_to_change: "",
  org_kira_keep: "",
  org_kira_improve: "",
  org_kira_remove: "",
  org_kira_add: "",
  org_has_incident: "",
  incident_category: "",
  incident_occurred_time: "",
  incident_severity: "",
  incident_description: "",
  incident_action_taken: "",
  incident_outcome: "",
  incident_root_cause: "",
  incident_prevention_proposal: "",
};

export default function BigDataDay2026SurveyPage() {
  const { setTheme } = useTheme();
  const [lang, setLang] = useState<Lang>("vi");
  const t = T_DATA[lang];

  // Default theme is light as requested!
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(LS_THEME_KEY);
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        setTheme("light");
      }
    } catch {
      setTheme("light");
    }
  }, [setTheme]);

  const [step, setStep] = useState<number>(1);
  const totalSteps = 3; // Step 1: Info & Track, Step 2: Core, Step 3: Track-specific

  const [form, setForm] = useState<SurveyFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [draftRestored, setDraftRestored] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Restore draft and submission status on mount
  useEffect(() => {
    try {
      const submitted = localStorage.getItem(LS_SUBMITTED_KEY);
      if (submitted === "true") {
        setIsSubmitted(true);
        return;
      }

      const savedDraft = localStorage.getItem(LS_DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setForm((prev) => ({ ...prev, ...parsed }));
        if (parsed._step && parsed._step >= 1 && parsed._step <= 3) {
          setStep(parsed._step);
        }
        setDraftRestored(true);
      }
    } catch (e) {
      console.warn("Failed to restore draft:", e);
    }
  }, []);

  // Debounced auto-save to localStorage
  useEffect(() => {
    if (isSubmitted) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          LS_DRAFT_KEY,
          JSON.stringify({ ...form, _step: step, _track: form.roleTrack })
        );
      } catch (e) {
        console.warn("Auto-save failed:", e);
      }
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [form, step, isSubmitted]);

  // Scroll to top on step change
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFieldChange = (field: keyof SurveyFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  // Reset form completely & clear localStorage
  const handleResetForm = () => {
    if (window.confirm(t.resetConfirm)) {
      try {
        localStorage.removeItem(LS_DRAFT_KEY);
        localStorage.removeItem(LS_SUBMITTED_KEY);
      } catch {
        /* ignore */
      }
      setForm(INITIAL_FORM);
      setErrors({});
      setStep(1);
      setIsSubmitted(false);
      setDraftRestored(false);
      scrollToTop();
    }
  };

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(LS_DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setForm(INITIAL_FORM);
    setErrors({});
    setStep(1);
    setDraftRestored(false);
    scrollToTop();
  };

  // Validation
  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!form.roleTrack) {
        newErrors.roleTrack = lang === "vi" ? "Vui lòng chọn vai trò của bạn tại sự kiện" : "Please select your role";
      }
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = lang === "vi" ? "Định dạng email chưa hợp lệ" : "Invalid email address";
      }
    } else if (currentStep === 2) {
      // Validate Core Questions
      if (!form.core_overall_experience) {
        newErrors.core_overall_experience = lang === "vi" ? "Vui lòng đánh giá trải nghiệm chung" : "Please rate overall experience";
      }
      if (!form.core_useful_value) {
        newErrors.core_useful_value = lang === "vi" ? "Vui lòng chọn mức độ đồng ý" : "Please select an option";
      }
      if (!form.core_well_organized) {
        newErrors.core_well_organized = lang === "vi" ? "Vui lòng chọn mức độ đồng ý" : "Please select an option";
      }
      if (!form.core_theme_clarity) {
        newErrors.core_theme_clarity = lang === "vi" ? "Vui lòng chọn mức độ đồng ý" : "Please select an option";
      }
      if (!form.core_future_interest) {
        newErrors.core_future_interest = lang === "vi" ? "Vui lòng chọn mức độ đồng ý" : "Please select an option";
      }
      if (!form.core_most_appreciated?.trim()) {
        newErrors.core_most_appreciated = lang === "vi" ? "Vui lòng chia sẻ điều bạn đánh giá cao nhất" : "Please share your highlight";
      }
      if (!form.core_one_thing_to_change?.trim()) {
        newErrors.core_one_thing_to_change = lang === "vi" ? "Vui lòng chia sẻ điểm mong muốn thay đổi" : "Please share what to change";
      }
    } else if (currentStep === 3) {
      // Validate Track Specific
      if (form.roleTrack === "attendee") {
        if (!form.attendee_target_group) newErrors.attendee_target_group = "Bắt buộc";
        if (!form.attendee_hcmut_student) newErrors.attendee_hcmut_student = "Bắt buộc";
        if (!form.attendee_first_time_bdc) newErrors.attendee_first_time_bdc = "Bắt buộc";
        if (!form.attendee_discovery_channel || form.attendee_discovery_channel.length === 0) {
          newErrors.attendee_discovery_channel = "Vui lòng chọn ít nhất một kênh";
        }
        if (!form.att_theme_fit) newErrors.att_theme_fit = "Bắt buộc";
        if (!form.att_technical_depth) newErrors.att_technical_depth = "Bắt buộc";
        if (!form.att_duration_fit) newErrors.att_duration_fit = "Bắt buộc";
        if (!form.att_session_flow) newErrors.att_session_flow = "Bắt buộc";
        if (!form.att_time_worth) newErrors.att_time_worth = "Bắt buộc";
        if (!form.att_learn_bdc_scope) newErrors.att_learn_bdc_scope = "Bắt buộc";
        if (!form.att_learn_academic_directions) newErrors.att_learn_academic_directions = "Bắt buộc";
        if (!form.att_learn_data_problem_solving) newErrors.att_learn_data_problem_solving = "Bắt buộc";
        if (!form.att_learn_pipeline_understanding) newErrors.att_learn_pipeline_understanding = "Bắt buộc";
        if (!form.att_learn_skills_preparation) newErrors.att_learn_skills_preparation = "Bắt buộc";
        if (!form.att_learn_real_world_examples) newErrors.att_learn_real_world_examples = "Bắt buộc";

        // Knowledge before/after check all 8 topics
        const topics = t.knowledgeTopics;
        const beforeKeys = Object.keys(form.att_knowledge_before || {});
        const afterKeys = Object.keys(form.att_knowledge_after || {});
        if (beforeKeys.length < topics.length) {
          newErrors.att_knowledge_before = "Vui lòng đánh giá đủ 8 lĩnh vực trước sự kiện";
        }
        if (afterKeys.length < topics.length) {
          newErrors.att_knowledge_after = "Vui lòng đánh giá đủ 8 lĩnh vực sau sự kiện";
        }

        if (!form.att_sessions_attended || form.att_sessions_attended.length === 0) {
          newErrors.att_sessions_attended = "Vui lòng chọn ít nhất một phiên bạn đã theo dõi";
        } else {
          // If sessions selected, check matrix evaluations
          const attendedCount = form.att_sessions_attended.length;
          if (Object.keys(form.att_session_usefulness || {}).length < attendedCount) {
            newErrors.att_session_usefulness = "Vui lòng đánh giá mức độ hữu ích cho các phiên đã chọn";
          }
          if (Object.keys(form.att_session_clarity || {}).length < attendedCount) {
            newErrors.att_session_clarity = "Vui lòng đánh giá mức độ dễ hiểu cho các phiên đã chọn";
          }
          if (!form.att_most_valuable_session) {
            newErrors.att_most_valuable_session = "Vui lòng chọn phiên mang lại giá trị lớn nhất";
          }
        }

        if (!form.att_visited_poster_demo) newErrors.att_visited_poster_demo = "Bắt buộc";
        if (form.att_visited_poster_demo === "Có" || form.att_visited_poster_demo === "Yes") {
          if (!form.att_poster_improved_understanding) newErrors.att_poster_improved_understanding = "Bắt buộc";
          if (!form.att_poster_team_interaction) newErrors.att_poster_team_interaction = "Bắt buộc";
          if (!form.att_poster_more_demos_future) newErrors.att_poster_more_demos_future = "Bắt buộc";
        } else if (form.att_visited_poster_demo === "Không" || form.att_visited_poster_demo === "No") {
          if (!form.att_poster_not_visited_reason) newErrors.att_poster_not_visited_reason = "Bắt buộc";
        }

        if (!form.att_interacted_groups || form.att_interacted_groups.length === 0) {
          newErrors.att_interacted_groups = "Vui lòng chọn ít nhất một nhóm bạn đã trao đổi";
        }
        if (!form.att_qa_opportunity) newErrors.att_qa_opportunity = "Bắt buộc";
        if (!form.att_networking_value) newErrors.att_networking_value = "Bắt buộc";
        if (!form.att_meaningful_connection) newErrors.att_meaningful_connection = "Bắt buộc";

        if (!form.att_logistics_checkin) newErrors.att_logistics_checkin = "Bắt buộc";
        if (!form.att_logistics_pre_info) newErrors.att_logistics_pre_info = "Bắt buộc";
        if (!form.att_logistics_venue) newErrors.att_logistics_venue = "Bắt buộc";
        if (!form.att_logistics_av_system) newErrors.att_logistics_av_system = "Bắt buộc";
        if (!form.att_logistics_punctuality) newErrors.att_logistics_punctuality = "Bắt buộc";
        if (!form.att_logistics_breaks) newErrors.att_logistics_breaks = "Bắt buộc";
        if (!form.att_logistics_wayfinding) newErrors.att_logistics_wayfinding = "Bắt buộc";

        if (!form.att_future_topics || form.att_future_topics.length === 0) newErrors.att_future_topics = "Bắt buộc";
        if (!form.att_future_formats) newErrors.att_future_formats = "Bắt buộc";
        if (!form.att_subscribe_newsletter) newErrors.att_subscribe_newsletter = "Bắt buộc";
      } else if (form.roleTrack === "speaker") {
        if (!form.spk_info_clarity) newErrors.spk_info_clarity = "Bắt buộc";
        if (!form.spk_audience_understanding) newErrors.spk_audience_understanding = "Bắt buộc";
        if (!form.spk_scope_communication) newErrors.spk_scope_communication = "Bắt buộc";
        if (!form.spk_schedule_venue_info) newErrors.spk_schedule_venue_info = "Bắt buộc";
        if (!form.spk_comm_with_organizer) newErrors.spk_comm_with_organizer = "Bắt buộc";
        if (!form.spk_reception_support) newErrors.spk_reception_support = "Bắt buộc";
        if (!form.spk_av_equipment) newErrors.spk_av_equipment = "Bắt buộc";
        if (!form.spk_time_allocation) newErrors.spk_time_allocation = "Bắt buộc";
        if (!form.spk_transition_flow) newErrors.spk_transition_flow = "Bắt buộc";
        if (!form.spk_audience_engagement) newErrors.spk_audience_engagement = "Bắt buộc";
        if (!form.spk_qa_time) newErrors.spk_qa_time = "Bắt buộc";
        if (!form.spk_platform_suitability) newErrors.spk_platform_suitability = "Bắt buộc";
        if (!form.spk_willing_to_rejoin) newErrors.spk_willing_to_rejoin = "Bắt buộc";
        if (!form.spk_best_support_aspect?.trim()) newErrors.spk_best_support_aspect = "Bắt buộc";
        if (!form.spk_support_improvement?.trim()) newErrors.spk_support_improvement = "Bắt buộc";
        if (!form.spk_collaboration_interests || form.spk_collaboration_interests.length === 0) {
          newErrors.spk_collaboration_interests = "Bắt buộc";
        }
      } else if (form.roleTrack === "guest_partner") {
        if (!form.gst_goal_clarity) newErrors.gst_goal_clarity = "Bắt buộc";
        if (!form.gst_bdc_capacity_understanding) newErrors.gst_bdc_capacity_understanding = "Bắt buộc";
        if (!form.gst_practical_student_projects) newErrors.gst_practical_student_projects = "Bắt buộc";
        if (!form.gst_professional_quality) newErrors.gst_professional_quality = "Bắt buộc";
        if (!form.gst_student_interaction_opportunity) newErrors.gst_student_interaction_opportunity = "Bắt buộc";
        if (!form.gst_expert_networking_opportunity) newErrors.gst_expert_networking_opportunity = "Bắt buộc";
        if (!form.gst_poster_demo_capacity) newErrors.gst_poster_demo_capacity = "Bắt buộc";
        if (!form.gst_networking_value) newErrors.gst_networking_value = "Bắt buộc";
        if (!form.gst_collaboration_potential) newErrors.gst_collaboration_potential = "Bắt buộc";
        if (!form.gst_collaboration_forms || form.gst_collaboration_forms.length === 0) {
          newErrors.gst_collaboration_forms = "Bắt buộc";
        }
        if (!form.gst_contact_permission) newErrors.gst_contact_permission = "Bắt buộc";
      } else if (form.roleTrack === "organizer") {
        if (!form.org_role_teams || form.org_role_teams.length === 0) newErrors.org_role_teams = "Bắt buộc";
        if (!form.org_preparation_duration) newErrors.org_preparation_duration = "Bắt buộc";
        if (!form.org_workload_level) newErrors.org_workload_level = "Bắt buộc";
        if (!form.org_role_clarity) newErrors.org_role_clarity = "Bắt buộc";
        if (!form.org_accountability_clarity) newErrors.org_accountability_clarity = "Bắt buộc";
        if (!form.org_reasonable_deadlines) newErrors.org_reasonable_deadlines = "Bắt buộc";
        if (!form.org_timely_change_updates) newErrors.org_timely_change_updates = "Bắt buộc";
        if (!form.org_interteam_coordination) newErrors.org_interteam_coordination = "Bắt buộc";
        if (!form.org_valuable_meetings) newErrors.org_valuable_meetings = "Bắt buộc";
        if (!form.org_management_tools) newErrors.org_management_tools = "Bắt buộc";
        if (!form.org_setup_execution) newErrors.org_setup_execution = "Bắt buộc";
        if (!form.org_checkin_efficiency) newErrors.org_checkin_efficiency = "Bắt buộc";
        if (!form.org_speaker_coordination) newErrors.org_speaker_coordination = "Bắt buộc";
        if (!form.org_technical_support) newErrors.org_technical_support = "Bắt buộc";
        if (!form.org_schedule_coordination) newErrors.org_schedule_coordination = "Bắt buộc";
        if (!form.org_poster_demo_operation) newErrors.org_poster_demo_operation = "Bắt buộc";
        if (!form.org_teabreak_catering) newErrors.org_teabreak_catering = "Bắt buộc";
        if (!form.org_networking_session) newErrors.org_networking_session = "Bắt buộc";
        if (!form.org_issue_handling) newErrors.org_issue_handling = "Bắt buộc";
        if (!form.org_escalation_clarity) newErrors.org_escalation_clarity = "Bắt buộc";
        if (!form.org_exceeded_expectations?.trim()) newErrors.org_exceeded_expectations = "Bắt buộc";
        if (!form.org_not_as_planned?.trim()) newErrors.org_not_as_planned = "Bắt buộc";
        if (!form.org_biggest_issue?.trim()) newErrors.org_biggest_issue = "Bắt buộc";
        if (!form.org_resolution_method?.trim()) newErrors.org_resolution_method = "Bắt buộc";
        if (!form.org_first_thing_to_change?.trim()) newErrors.org_first_thing_to_change = "Bắt buộc";
        if (!form.org_kira_keep?.trim()) newErrors.org_kira_keep = "Bắt buộc";
        if (!form.org_kira_improve?.trim()) newErrors.org_kira_improve = "Bắt buộc";
        if (!form.org_kira_remove?.trim()) newErrors.org_kira_remove = "Bắt buộc";
        if (!form.org_kira_add?.trim()) newErrors.org_kira_add = "Bắt buộc";
        if (!form.org_has_incident) newErrors.org_has_incident = "Bắt buộc";
        if (form.org_has_incident === "Có" || form.org_has_incident === "Yes") {
          if (!form.incident_category) newErrors.incident_category = "Bắt buộc";
          if (!form.incident_occurred_time?.trim()) newErrors.incident_occurred_time = "Bắt buộc";
          if (!form.incident_severity) newErrors.incident_severity = "Bắt buộc";
          if (!form.incident_description?.trim()) newErrors.incident_description = "Bắt buộc";
          if (!form.incident_action_taken?.trim()) newErrors.incident_action_taken = "Bắt buộc";
          if (!form.incident_outcome?.trim()) newErrors.incident_outcome = "Bắt buộc";
          if (!form.incident_root_cause?.trim()) newErrors.incident_root_cause = "Bắt buộc";
          if (!form.incident_prevention_proposal?.trim()) newErrors.incident_prevention_proposal = "Bắt buộc";
        }
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Find first error element and scroll to it
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = document.getElementById(firstErrorKey);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
      scrollToTop();
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    scrollToTop();
  };

  // Submit form data
  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const submissionPayload = {
        formId: "big-data-day-2026-survey",
        formTitle: "Khảo Sát Đánh Giá Big Data Day 2026",
        sheetName: "BDD2026_Survey",
        formType: "survey",
        track: form.roleTrack,
        answers: {
          ...form,
          roleTrackTitle: t.roles[form.roleTrack]?.title || form.roleTrack,
          submittedAt: new Date().toISOString(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
        },
      };

      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit survey");
      }

      // Record completed submission
      try {
        localStorage.setItem(LS_SUBMITTED_KEY, "true");
        localStorage.removeItem(LS_DRAFT_KEY);
      } catch {
        /* ignore */
      }

      setIsSubmitted(true);
      scrollToTop();
    } catch (err: any) {
      console.error("Submission failed:", err);
      alert(
        lang === "vi"
          ? "Đã xảy ra lỗi khi gửi biểu mẫu. Vui lòng kiểm tra kết nối mạng và thử lại."
          : "An error occurred while submitting the survey. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const trackMeta = [
    {
      id: "attendee",
      icon: UserCheck,
      title: t.roles.attendee.title,
      desc: t.roles.attendee.desc,
    },
    {
      id: "speaker",
      icon: Award,
      title: t.roles.speaker.title,
      desc: t.roles.speaker.desc,
    },
    {
      id: "guest_partner",
      icon: Briefcase,
      title: t.roles.guest_partner.title,
      desc: t.roles.guest_partner.desc,
    },
    {
      id: "organizer",
      icon: Users,
      title: t.roles.organizer.title,
      desc: t.roles.organizer.desc,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-20">
      <SurveyHeader
        lang={lang}
        onToggleLang={() => setLang((l) => (l === "vi" ? "en" : "vi"))}
        scrolled={scrolled}
        onReset={handleResetForm}
        draftRestored={draftRestored}
        onClearDraft={handleClearDraft}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28">
        {/* Banner / Title Header */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-3">
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              <span>Big Data Day 2026 • Official Feedback</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
              {t.siteTitle}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl font-medium">
              {t.headerDesc}
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <SuccessView
            lang={lang}
            roleTrack={form.roleTrack}
            onReset={() => {
              try {
                localStorage.removeItem(LS_SUBMITTED_KEY);
                localStorage.removeItem(LS_DRAFT_KEY);
              } catch {
                /* ignore */
              }
              setForm(INITIAL_FORM);
              setStep(1);
              setIsSubmitted(false);
              scrollToTop();
            }}
          />
        ) : (
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-9 shadow-sm">
            {/* Progress Stepper */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                <span>
                  {t.step} {step} {t.of} {totalSteps}:{" "}
                  <strong className="text-blue-600 dark:text-cyan-400 font-extrabold">
                    {step === 1 && t.step1Title}
                    {step === 2 && t.step2Title}
                    {step === 3 && t.step3Title}
                  </strong>
                </span>
                <span>{Math.round((step / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-gradient-to-r dark:from-blue-500 dark:to-cyan-400 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: Basic Info & Role Selection */}
            {step === 1 && (
              <div className="space-y-8 animate-fadeIn">
                {/* Role Selection */}
                <div>
                  <div className="mb-4">
                    <label className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{t.roleSelectLabel}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {t.roleSelectNote}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {trackMeta.map((track) => {
                      const Icon = track.icon;
                      const isSelected = form.roleTrack === track.id;
                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => handleFieldChange("roleTrack", track.id as RoleTrack)}
                          className={`p-5 rounded-2xl border text-left transition-all duration-150 flex items-start gap-4 active:scale-[0.98] ${
                            isSelected
                              ? "bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 dark:bg-blue-950/60 dark:border-blue-400"
                              : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                                {track.title}
                              </h4>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-blue-600 dark:text-cyan-400 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {track.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.roleTrack && (
                    <p className="text-red-500 text-xs font-semibold mt-2">
                      ⚠️ {errors.roleTrack}
                    </p>
                  )}
                </div>

                {/* Basic Info (Optional / Anonymous) */}
                <div className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {t.basicInfoSection}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t.basicInfoNote}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.fullNameLabel} (Tùy chọn)
                      </label>
                      <TextInput
                        value={form.fullName}
                        onChange={(val) => handleFieldChange("fullName", val)}
                        placeholder={t.fullNamePlaceholder}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.emailLabel} (Tùy chọn)
                      </label>
                      <TextInput
                        type="email"
                        value={form.email}
                        onChange={(val) => handleFieldChange("email", val)}
                        placeholder={t.emailPlaceholder}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs font-semibold mt-1">
                          ⚠️ {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.orgLabel} (Tùy chọn)
                    </label>
                    <TextInput
                      value={form.organization}
                      onChange={(val) => handleFieldChange("organization", val)}
                      placeholder={t.orgPlaceholder}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Shared Core Questions */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <CoreQuestions
                  form={form}
                  onChange={handleFieldChange}
                  errors={errors}
                  lang={lang}
                />
              </div>
            )}

            {/* STEP 3: Track-specific Deep Dive */}
            {step === 3 && (
              <div className="animate-fadeIn">
                {form.roleTrack === "attendee" && (
                  <AttendeeSection
                    form={form}
                    onChange={handleFieldChange}
                    errors={errors}
                    lang={lang}
                  />
                )}
                {form.roleTrack === "speaker" && (
                  <SpeakerSection
                    form={form}
                    onChange={handleFieldChange}
                    errors={errors}
                    lang={lang}
                  />
                )}
                {form.roleTrack === "guest_partner" && (
                  <GuestPartnerSection
                    form={form}
                    onChange={handleFieldChange}
                    errors={errors}
                    lang={lang}
                  />
                )}
                {form.roleTrack === "organizer" && (
                  <OrganizerSection
                    form={form}
                    onChange={handleFieldChange}
                    errors={errors}
                    lang={lang}
                  />
                )}
              </div>
            )}

            {/* Footer Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div>
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t.back}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto inline-flex items-center justify-center text-xs font-semibold text-slate-500 hover:text-red-600 p-2 transition-colors"
                  >
                    <span>{t.resetForm}</span>
                  </button>
                )}
              </div>

              <div className="w-full sm:w-auto">
                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    <span>{t.next}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 active:scale-95 transition-all ${
                      isSubmitting ? "opacity-70 cursor-wait" : ""
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? t.submitting : t.submit}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>© {new Date().getFullYear()} Big Data Club • Trường Đại học Bách khoa, ĐHQG HCM</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-600">
            Dữ liệu khảo sát được bảo vệ và quản trị bảo mật bởi BDC Platform
          </p>
        </footer>
      </main>
    </div>
  );
}
