# Technology Stack

This document defines the core technologies used in the AI Website Replicator & Generator project.

## Frontend
- **Framework:** Next.js (App Router)
- **Library:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State Management:** React Hooks (Context API if needed)

## Backend
- **Environment:** Node.js (Edge Runtime preferred for API routes)
- **Database/Persistence:** Firestore or Redis (for job tracking and session state)
- **Storage:** Cloud Storage (for generated ZIP archives and user-uploaded assets)

## AI & Core Logic
- **Models:** Google Gemini (via Google AI SDK or Vertex AI)
- **Web Analysis:** Custom DOM analysis logic for "Replicator Mode"
- **Generation:** AI-driven React/TypeScript code generation

## Infrastructure & DevOps
- **Deployment:** Vercel or Netlify (Support for Next.js features)
- **Version Control:** Git
