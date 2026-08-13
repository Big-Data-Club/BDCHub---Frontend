# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router), TypeScript, and Tailwind CSS.

## Users

- **Students (Học viên):** HCMUT students who take courses, do quizzes, and interact with the AI Mentor.
- **Teachers (Giảng viên):** Faculty/instructors who create courses, design lessons, and generate AI quizzes.
- **Administrators (Quản trị viên):** Club officers/system admins who manage users, permissions, and system configurations.

## Product Purpose

BDCourse serves as the core Learning Management System (LMS) within the HCMUT Big Data Club (BDC) ecosystem. It provides a formal yet engaging platform for technical learning, course material distribution, interactive quizzing, and AI-powered mentoring.

## Positioning

A premium, developer-oriented "Tech-Academic Terminal" that blends institutional structure with high-tech comic/retro elements, offering a unique tactile interface optimized for computer science and engineering students.

## Operating Context

Accessed via desktop and mobile web browsers. Students and teachers interact with complex course trees, markdown documents, interactive code sandboxes, and AI chat interfaces.

## Capabilities and Constraints

- **Role-based Architecture:** Tailored dashboard layouts and actions for Admin, Teacher, and Student.
- **Interactive Learning:** Courses, lessons, quiz flows, flashcards, and forum discussions.
- **AI Integration:** Real-time AI Mentor chat and AI-driven quiz/question generation.
- **Comic/Retro UI Toolkit:** Hard shadow shifting buttons, custom halftone textures, and elastic spring animations.
- **State Management:** NextAuth session handling, localStorage drafts, and navigation layouts.

## Brand Commitments

- Ho Chi Minh City University of Technology (HCMUT) Computer Science & Engineering (CSE) and High Performance Computing Center (HPCC) logos.
- Big Data Club (BDC) branding guidelines.
- The "Minimal & Formal Comic/Retro" aesthetic guidelines.

## Evidence on Hand

- [Role Selection Page](file:///home/thanh/BDCHub---Frontend/src/app/(learning)/lms/page.tsx) - Entrypoint routing for multiple user roles.
- [LMS Layout](file:///home/thanh/BDCHub---Frontend/src/app/(learning)/lms/layout.tsx) - Container and navigation layout for LMS.
- [LMS Design System Specification](file:///home/thanh/BDCHub---Frontend/docs/LMS_DesignSystem.md) - Colors, typography, spacing, and component definitions.
- [LMS Comic Effects Documentation](file:///home/thanh/BDCHub---Frontend/docs/LMS_Effect_Docs.md) - Exact Tailwind and CSS classes for interactions.

## Product Principles

- **Mechanically Satisfying (Tactile UI):** Use snappy physical-feeling interactions (hard shadows, spring curves, line drawing) to make the app feel tactile.
- **No Refresher Progress Loss:** Maintain state persistently (e.g. quiz state, inputs, roles) to ensure a robust user journey.
- **Unified Academic Theme:** Balance high-contrast dark space-navy themes with structured grids to emulate terminal/computational tools.

## Accessibility & Inclusion

- Keyboard navigability with ring-offsets.
- Compliant text-to-background contrast ratios for both light and dark themes.
