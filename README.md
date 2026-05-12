# BDCHub Frontend

The official web interface for the **BDC Platform — AI-Powered Microservices LMS**. This application provides a minimalist, high-performance user experience built with Next.js, specifically designed for the Big Data Club ecosystem.

## Overview

This repository houses the frontend layer that interacts with multiple microservices, including Auth, LMS, and AI-driven agents. It follows a "Basic is the Best" design philosophy, focusing on formal aesthetics and functional clarity.

### Core Modules

- **Learning Management System (LMS):** Comprehensive tools for course navigation, interactive quizzes, and flashcard-based learning.
- **AI Mentor & Assistant:** Integrated intelligent agents providing personalized study plans and real-time concept explanations.
- **Admin Dashboard:** Centralized management for user roles, system permissions, and LLM provider configurations.
- **Events & Hackathon:** Dedicated landing pages and registration systems for club activities like Hackathon 2025.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js with Google OAuth2 support
- **State Management:** React Context & Hooks

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Big-Data-Club/BDCHub---Frontend.git
   cd BDCHub---Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and update the backend service URLs:
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Run Storybook:**
   To view the UI components in isolation:
   ```bash
   npm run storybook
   ```

## Containerization

You can run the frontend standalone using Docker for consistency across environments.

```bash
docker-compose -f docker-compose.frontend.yml up -d
```

The application will be accessible at `http://localhost:3000`.

## Environment Variables

The following variables are required for full system functionality:

- `BACKEND_URL`: Primary Auth and Management service endpoint.
- `LMS_API_URL`: Go-based LMS backend endpoint.
- `AI_SERVICE_URL`: FastAPI-based AI service endpoint.
- `NEXTAUTH_SECRET`: Secret key for session encryption.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID.

## Development Standards

- **Linting:** All code must pass ESLint checks before submission.
- **Git Workflow:** Follow the `feature/` and `fix/` naming conventions for branches.
- **UI/UX:** Adhere to the club's "Minimal & Formal" design rhythm.

---

© 2026 Big Data Club - HCMUT. All rights reserved.
