# Track Spec: Project Foundation & Core Scaffolding

## Overview
This track focuses on setting up the fundamental structure of the AI Website Replicator & Generator. This includes the project initialization, UI framework integration, and the initial user interface for the "Generator Mode".

## Goals
- Initialize a robust Next.js project with TypeScript.
- Integrate Tailwind CSS and shadcn/ui for modern, responsive styling.
- Establish a global layout with navigation.
- Create a functional prompt-to-ui interface for "Generator Mode".

## Technical Requirements
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React

## User Stories
- As a user, I want a clean and intuitive landing page.
- As a user, I want to see a clear distinction between "Generator" and "Replicator" modes (even if Replicator is a placeholder for now).
- As a user, I want to enter a text prompt to describe the website I want to build.
- As a user, I want to see a loading state while the "AI" (placeholder logic) processes my request.
- As a user, I want to see a mockup of the generated result.

## Key Components
- `Layout`: Main wrapper with navigation.
- `ModeToggle`: Switch between Replicator and Generator modes.
- `PromptInput`: Text area for user prompts with a submit action.
- `GenerationPreview`: A placeholder area to display "generated" content.

## Success Criteria
- Project runs locally with `npm run dev`.
- UI is responsive and follows the established guidelines.
- Generator UI is fully interactive (accepts input, shows loading, displays mock result).
- Code passes all linting and type checks.
