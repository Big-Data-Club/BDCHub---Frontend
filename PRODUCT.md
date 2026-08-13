# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Next.js (App Router), TypeScript, and Tailwind CSS.

## Users
Primary users are HCMUT (Ho Chi Minh City University of Technology) students applying to join the Big Data Club (BDC) in 2026. They are filling out a multi-step registration form to apply for club membership.

## Product Purpose
To provide a smooth, reliable, and formal recruitment application interface for BDC recruitment 2026. It ensures applicants can enter personal details, academic status, department preferences, motivation, and upload supporting documents (CV, achievements).

## Positioning
A minimalist, high-performance, and formal user experience built specifically for the Big Data Club ecosystem, reflecting the club's "Minimal & Formal" design rhythm.

## Operating Context
Applicants fill this out on desktop or mobile web browsers. The form needs draft saving (via LocalStorage) to protect user progress from accidental refreshes or disconnects.

## Capabilities and Constraints
- Multi-step form flow (Personal, Academic, Department, Review).
- Local draft persistence (via `localStorage`).
- Support for file uploads (CV and evidence files).
- Multi-language support (Vietnamese and English).
- Fields validated dynamically per step.

## Brand Commitments
- Big Data Club (BDC) branding, CSE (Computer Science & Engineering) HCMUT, and HPCC logos.
- Adherence to the "Minimal & Formal" design rhythm.

## Evidence on Hand
- [page.tsx](file:///home/thanh/BDCHub---Frontend/src/app/(standalone)/bdc-recruitment-2026/page.tsx) - Main page containing the form logic and layout.
- [types.ts](file:///home/thanh/BDCHub---Frontend/src/app/(standalone)/bdc-recruitment-2026/types.ts) - Type definitions for the form schema.

## Product Principles
- **No Progress Loss:** Auto-save drafts so candidates don't lose typed data.
- **Formal & Professional:** Visuals must represent an academic/engineering club at HCMUT, prioritizing clarity and trust.
- **A11y & Form validation:** Explicit fields validation and feedback to guide users successfully.

## Accessibility & Inclusion
- Clear typography, form labels, and color contrast suitable for students in low-light or bright environments.
