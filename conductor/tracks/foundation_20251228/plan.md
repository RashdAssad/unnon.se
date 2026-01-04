# Track Plan: Project Foundation & Core Scaffolding

This track initializes the project and builds the core UI for the Generator Mode.

## Phase 1: Project Initialization & UI Setup [checkpoint: ca72a52]
Focus on scaffolding the Next.js app and integrating the design system.

- [x] **Task: Initialize Next.js Project** 6a27136
- [x] **Task: Integrate shadcn/ui** 1ecf1e3
- [x] **Task: Establish Global Layout** f971213
- [x] Task: Conductor - User Manual Verification 'Phase 1: Project Initialization & UI Setup' (Protocol in workflow.md)

## Phase 2: Generator Mode UI [checkpoint: cf6df87]
Focus on the interactive prompt interface.

- [x] **Task: Create Generator Interface** 212621e
  - [x] Write Tests: Verify prompt input existence and submit button behavior.
  - [x] Implement: Build the `GeneratorView` component with a large text prompt area and "Generate" button.
- [x] **Task: Implement Generation State Management** 212621e
  - [x] Write Tests: Verify loading states and transition to "complete" state.
  - [x] Implement: Use React state to handle input, loading animations, and the display of a mock result.
- [x] **Task: Mock Result Preview** 212621e
  - [x] Write Tests: Verify that the preview area displays the mock result correctly.
  - [x] Implement: Create a `PreviewCard` component to show a representation of the "generated" site.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Generator Mode UI' (Protocol in workflow.md)

## Phase 3: Polish & Standards
Ensure the codebase is clean and meets all requirements.

- [x] **Task: Final Quality Gate & Refactoring** 563c2e8
  - [x] Write Tests: Ensure comprehensive coverage for all new components.
  - [x] Implement: Run linting, type checks, and refactor for clarity. Ensure mobile responsiveness.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Polish & Standards' (Protocol in workflow.md)

## Unplanned Work & Known Issues
- [x] **Task: Investigate node-pty Crash**
  - [x] Context: `Error: Cannot resize a pty that has already exited` in `windowsPtyAgent.js`.
  - [x] Goal: Identify triggers (resize events during commits/heavy output) and implement mitigation (e.g., avoiding interactive resizing, stabilizing shell commands).
  - [x] Resolution: Confirmed commit `3009549` succeeded. Crash caused by terminal resize during command execution. No code changes needed. Mitigation: User advised to avoid resizing window during heavy CLI operations.
- [x] **Task: UI Customization (Header Font)** 2d7283b
  - [x] Context: User requested "AI Replicator" text to use custom font `Klaxon-Crunchy.otf`, be larger, and have no underline.
  - [x] Implementation: Configured `next/font/local` and updated Header component.
