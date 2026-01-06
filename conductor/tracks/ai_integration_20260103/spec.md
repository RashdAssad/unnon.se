# Track Spec: AI Integration & Backend Logic

This track focuses on connecting the frontend to the AI backend and implementing the core replication logic.

## Goals
- Securely integrate Google Gemini API.
- Create API routes for generation and replication.
- Implement the "Replicator" logic to analyze external URLs.

## Key Features
- **Gemini Service:** A utility module to communicate with Gemini.
- **Generation API:** POST route to handle prompt-to-code requests.
- **Replicator API:** POST route to analyze a URL and return structural metadata.
- **Project Scaffolding Engine:** Logic to convert AI metadata into a downloadable/viewable project structure.

## Success Criteria
- API successfully returns a mock (or real) code structure from a text prompt.
- Replicator can fetch and basic-parse a given URL.
- 80%+ test coverage for all backend logic.
