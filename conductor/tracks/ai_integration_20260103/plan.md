# Track Plan: AI Integration & Backend Logic

This track implements the backend intelligence of the application.

## Phase 1: AI Service & Generation API
Focus on the basic prompt-to-code flow.

- [x] **Task: Setup Environment & Gemini Client** e4d8f1a
  - [x] Write Tests: Verify environment variable loading.
  - [x] Implement: Configure Gemini SDK and create a singleton client.
- [x] **Task: Implement Generation API Route** 3a9e1d2
  - [x] Write Tests: Mock Gemini response and verify API status codes.
  - [x] Implement: Create `/api/generate` to handle prompt requests.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: AI Service & Generation API'

## Phase 2: URL Analysis (Replicator Core)
Focus on parsing external websites.

- [ ] **Task: Implement URL Fetching & Sanitization**
  - [ ] Write Tests: Verify handling of various URL formats and error states.
  - [ ] Implement: Create a utility to safely fetch HTML content.
- [ ] **Task: Structural Analysis Logic**
  - [ ] Write Tests: Verify extraction of key elements (nav, hero, footer).
  - [ ] Implement: Use AI to map HTML structure into an internal metadata format.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: URL Analysis'

## Phase 3: Project Generation & Refinement
Focus on turning metadata into code.

- [ ] **Task: Code Scaffolding Engine**
  - [ ] Write Tests: Verify code generation from metadata.
  - [ ] Implement: Logic to create Next.js component structures.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Project Generation'
