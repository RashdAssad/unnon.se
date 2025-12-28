# Product Guidelines

## Brand Voice & Tone
-   **Friendly & Guide-like:** The application should sound like a helpful assistant. It uses clear, encouraging language to guide the user through the cloning and generation process.
-   **Approachable & Reassuring:** Avoid overly dense technical jargon when communicating with the user. Instead of "Initializing headless browser," use "Starting our analysis of the website."
-   **Transparent:** Clearly communicate progress during long-running jobs (Scraping, Planning, Generating) so the user feels informed and in control.

## Visual Identity
-   **Aesthetic:** Clean & Minimal. The interface should be uncluttered, focusing on the core utility of URL input and prompt submission.
-   **UI Framework:** Leveraging **shadcn/ui** default styles for a "Pro" feel with high consistency.
-   **Palette:** Neutral and professional. Primarily White, Gray, and Black, allowing the content (user's input and generated output) to take center stage.
-   **Typography:** Modern, legible sans-serif fonts that align with a high-quality developer tool.
-   **Components:** Use standard shadcn/ui components (Buttons, Inputs, Progress bars, Toasts) to maintain a cohesive and familiar experience.

## Design Principles
-   **Speed-to-Result:** Minimize the number of clicks required to start a generation job.
-   **Clarity over Decoration:** Visual elements should serve a functional purpose. Use subtle shadows and gradients only to provide depth and hierarchy.
-   **Responsive First:** The UI must perform flawlessly across mobile, tablet, and desktop devices to cater to users on the go.

## User Experience (UX) Standards
-   **Immediate Feedback:** Provide instant validation on inputs (e.g., URL format check).
-   **Informative Progress:** Use a progress bar or step-by-step checklist during the AI workflow to manage user expectations during the ~5-minute wait.
-   **Easy Export:** The download action should be the most prominent element once a job is complete.
