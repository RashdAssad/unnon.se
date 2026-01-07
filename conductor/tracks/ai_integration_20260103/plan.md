# Track Plan: AI Integration & Backend Logic

This track implements the backend intelligence of the application.

## Phase 1: AI Service & Generation API [checkpoint: 4e30362]
Focus on the basic prompt-to-code flow.

- [x] **Task: Setup Environment & Gemini Client** e4d8f1a
  - [x] Write Tests: Verify environment variable loading.
  - [x] Implement: Configure Gemini SDK and create a singleton client.
- [x] **Task: Implement Generation API Route** 3a9e1d2
  - [x] Write Tests: Mock Gemini response and verify API status codes.
  - [x] Implement: Create `/api/generate` to handle prompt requests.
- [x] Task: Conductor - User Manual Verification 'Phase 1: AI Service & Generation API' 4e30362

## Phase 2: URL Analysis (Replicator Core) [checkpoint: 3b99af5]
Focus on parsing external websites.

- [x] **Task: Implement URL Fetching & Sanitization** 36c1223
  - [x] Write Tests: Verify handling of various URL formats and error states.
  - [x] Implement: Create a utility to safely fetch HTML content.
- [x] **Task: Structural Analysis Logic** c03603b
  - [x] Write Tests: Verify extraction of key elements (nav, hero, footer).
  - [x] Implement: Use AI to map HTML structure into an internal metadata format.
- [x] Task: Conductor - User Manual Verification 'Phase 2: URL Analysis' 3b99af5

## Phase 3: Project Generation & Refinement
Focus on turning metadata into code.

- [x] **Task: Code Scaffolding Engine** 4a580b0
  - [x] Write Tests: Verify code generation from metadata.
  - [x] Implement: Logic to create Next.js component structures.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Project Generation'
