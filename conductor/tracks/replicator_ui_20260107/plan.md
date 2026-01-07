# Track Plan: Replicator UI & Integration

This track implements the user interface for the Website Replicator feature and integrates it with the backend AI services.

## Phase 1: Replicator Input Interface [checkpoint: ea1b399]
Focus on the UI for URL input and mode switching.

- [x] **Task: Mode Switcher Component** df13f0c
  - [x] Write Tests: Verify state switching between "Generator" (Prompt) and "Replicator" (URL).
  - [x] Implement: Add a toggle/tab mechanism to `GeneratorView` to switch modes.
- [x] **Task: URL Input Form** df13f0c
  - [x] Write Tests: Verify URL validation and submission handling.
  - [x] Implement: Create a form specifically for entering a website URL.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Replicator Input Interface' ea1b399

## Phase 2: Integration & Generation Flow
Focus on connecting the frontend to the backend logic.

- [x] **Task: Replicator API Endpoint** c708c42
  - [x] Write Tests: Verify the endpoint handles URL inputs and returns generated code.
  - [x] Implement: Create `/api/replicate` (or update `/api/generate`) to use `scraper`, `analyzer`, and `scaffolder`.
- [ ] **Task: Frontend Integration**
  - [ ] Write Tests: Verify data flow from form submission to result display.
  - [ ] Implement: Call the API on form submit and update the `PreviewCard` with the result.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Integration & Generation Flow'

## Phase 3: Preview & Refinement
Focus on the quality of the output and user experience.

- [ ] **Task: Enhanced Preview Handling**
  - [ ] Write Tests: Verify the preview component handles complex generated layouts.
  - [ ] Implement: Ensure the `PreviewCard` can render the full generated page structure effectively.
- [ ] **Task: Error Handling & feedback**
  - [ ] Write Tests: Verify error messages for failed fetches or invalid URLs.
  - [ ] Implement: Add toast notifications or inline errors for the Replicator flow.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Preview & Refinement'
