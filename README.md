# BDCHub Frontend

The official web interface for the **BDC Platform - AI-Powered Microservices LMS**. This application provides a minimalist, high-performance user experience built with Next.js, specifically designed for the Big Data Club ecosystem.

## Overview

This repository houses the frontend layer that interacts with multiple microservices, including Auth, LMS, and AI-driven agents. It follows a "Basic is the Best" design philosophy, focusing on formal aesthetics and functional clarity.

### Core Modules
* **Learning Management System (LMS):** Comprehensive tools for course navigation, interactive quizzes, and flashcard-based learning.
* **Authoring context:** Studio and course question generation select whole courses, chapters or lessons (text, documents, video and images). The shared curriculum picker sends IDs; LMS authorizes and resolves canonical material. Knowledge nodes and chunks are internal AI details. Deploy the LMS authoring-context endpoint and AI curriculum generation support before this UI.
* **AI Mentor & Assistant:** Integrated intelligent agents providing personalized study plans and real-time concept explanations.
* **Admin Dashboard:** Centralized management for user roles, system permissions, and LLM provider configurations.
* **Community Chat:** Theme-aware channels and direct messages with mobile navigation, per-account browser preferences, bounded message history and reconnect recovery. Administrators manage access at `/settings/chat-roles`.
* **Events & Hackathon:** Dedicated landing pages and registration systems for club activities like Hackathon 2025.

## Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Authentication:** NextAuth.js with Google OAuth2 support/authOptions.ts]
* **State Management:** React Context & Hooks

## Getting Started

### Prerequisites
* Node.js 18.x or higher
* npm or yarn

### Local Development
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Big-Data-Club/BDCHub---Frontend.git](https://github.com/Big-Data-Club/BDCHub---Frontend.git)
    cd BDCHub---Frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and update the backend service URLs:
    ```bash
    cp .env.example .env.local
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Containerization

You can run the frontend standalone using Docker for consistency across environments.

```bash
docker-compose -f docker-compose.frontend.yml up -d

```

The application will be accessible at `http://localhost:3000`.

## Environment Variables

The following variables are required for full system functionality:

* `BACKEND_URL`: Primary Auth and Management service endpoint.
* `LMS_API_URL`: Go-based LMS backend endpoint.
* `AI_SERVICE_URL`: FastAPI-based AI service endpoint.
* `NEXTAUTH_SECRET`: Secret key for session encryption.
* `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID.

## Development Standards

* **Linting:** All code must pass ESLint checks before submission.
* **Git Workflow:** Follow the `feature/` and `fix/` naming conventions for branches.
* **UI/UX:** Adhere to the club's "Minimal & Formal" design rhythm.

---

© 2026 Big Data Club - HCMUT. All rights reserved.

### Nông trại kiến thức

`/knowledge-farm` is an authenticated educational farm game, reached from the
main navigation. Set server-side `FARM_SERVICE_URL` (default
`http://farm-service:8087`). The BFF forwards the session access token, enforces
same-origin POST requests and exposes only farm routes. Configure NEXTAUTH_URL
with the public origin, including the local development port.

Six starter plants/animals include real-world learning cards with sources.
Each harvest requires a quiz or typed recall flashcard. Farm-awarded points
are asynchronous; `/api/farm/score` reads the canonical Auth total using only
the session user ID, and the UI refreshes it every 15 seconds. There are
no real-farm bookings, IoT, commerce or per-action AI generation. Quiz questions
come from enrolled LMS courses, and flashcards from the learner's LMS library.
Original sprite source
is recorded in `public/knowledge-farm/ATTRIBUTION.md`.
