AI Website Replicator – Workflows & Operational Details (WORKFLOWS.md)
This document describes both developer workflows (how to develop, test, and release the system) and the internal agentic workflows that power the AI coordination. We cover data flows between the TypeScript front-end and Python back-end, how AI prompts are structured and where humans can intervene or override, how user-provided branding flows through the system, and the development lifecycle processes (dev, test, release).
Data Flow: TypeScript–Python Serialization
Our architecture splits the application logic between the Next.js frontend (TS) and the Python backend. Data exchange must be serialized (likely via JSON over HTTP). Here’s the format and steps:
    1. User Input Capture (Frontend): The Next.js UI collects:
        ◦ url (string): The target website URL to replicate.
        ◦ assets (array of files): Up to 5 image files (logo and other images) uploaded by the user.
        ◦ siteName (string, optional): New site name/title (if provided by user).
        ◦ tagline or other texts (optional strings): Additional text customizations.
        ◦ styleInstructions (string, optional): A free-form prompt for stylistic guidance to the AI.
       These inputs are held in React state until submission.
    2. Request Serialization: On submission, the frontend constructs a JSON payload. The image files are converted to a transmittable form. We have two options:
        ◦ Inline Base64 JSON: Convert each file to a base64-encoded string and include it in JSON (e.g., images: [{filename: "logo.png", content: "<base64>"}]). This keeps it single-request but can bloat the JSON.
        ◦ Multipart Form: Use an HTML form submission or FormData via fetch to send files as binary and other fields as text. The Python backend would parse a multipart form.
       For simplicity, v1 chooses the JSON approach for small files (with a size check). The payload JSON might look like:
{
  "url": "https://example.com",
  "siteName": "My New Site",
  "tagline": "Just another awesome site",
  "styleInstructions": "Use a playful tone and bright colors.",
  "assets": [
     {"name": "logo.png", "data": "data:image/png;base64,iVBORw0KG..."},
     {"name": "hero.jpg", "data": "data:image/jpeg;base64,/9j/4AAQSkZJR..."}
  ]
}
The data URI scheme here includes the MIME type for clarity.
    3. API Call (Frontend): The JSON is sent via fetch to the backend endpoint (e.g., /api/replicate which is either a Next.js API route or directly the Python service URL). We prefer to have Next.js forward the request to the Python service (acting as a proxy) to avoid dealing with CORS in v1. This means the Next API route will receive the request, then use node-fetch or Axios to POST to the actual Python endpoint (configured via env var).
    4. Reception and Parsing (Backend): The Python server receives the request. If it's an API framework like FastAPI:
        ◦ It will parse the JSON automatically into a Python dict. If assets are base64 strings, it will handle those as strings. (If we used multipart, frameworks can handle file saves; in JSON method, we manually decode base64).
        ◦ The backend then decodes each assets.data: stripping the data URI prefix and base64-decoding into binary. It saves these bytes to a temporary directory or keeps in memory as needed. Filenames provided are sanitized (we'll remove any path components for safety, just use the base name).
        ◦ It constructs a job context: including the target URL, user text inputs, and references to the saved images.
    5. Status Updates (Backend → Frontend): Because replication can take time (possibly 1-3 minutes), we implement a basic status mechanism:
        ◦ When the job starts, the backend generates a job_id (e.g., a UUID).
        ◦ It immediately responds to the initial request with a JSON containing { "jobId": "<id>", "status": "started" } (or possibly we keep the HTTP connection open and stream, but that’s more complex).
        ◦ The frontend, upon receiving this, navigates to a progress page that begins polling. The Next.js app has an endpoint (or uses the same Python service’s status endpoint) like /api/status?job=<id>.
        ◦ The Python backend maintains a global (or in a database) job status dictionary: e.g., status[job_id] = {"phase": "scraping", "progress": 20}. As it goes through phases, it updates this.
        ◦ The polling endpoint simply returns the status for that job as JSON, e.g., { "phase": "generating code for footer", "progress": 60 }.
        ◦ The front-end uses this to update a progress bar or text. We categorize phases: e.g., Scraping (0-20%), Planning (20-30%), Generating components (30-90% distributed per component), Packaging (90-100%).
        ◦ When done, status might be { "phase": "completed", "progress": 100, "downloadUrl": "/api/download?job=<id>" }.
        ◦ The front-end then stops polling and triggers the download (navigating the user’s browser to that download URL or using fetch to get it as blob and then create a link).
       This decouples the long process from the initial request, avoiding timeouts. (Alternatively, we could have initially responded only when done, but on Vercel/Serverless that’s risky due to time limits).
    6. Result Download: The frontend either automatically initiates download or provides a button. The downloadUrl might hit a Next.js API route that proxies from Python storage, or the Python service itself could serve the file. In v1 for simplicity, we may have the Python service store the zip in memory (or disk) and the Next front-end fetch it via an API call:
        ◦ Possibly we skip proxy and just provide a direct link to a signed URL or the cloud run URL (with job token). That requires CORS; might handle if properly configured (the Python can allow GET from our domain).
        ◦ Implementation decision: We might choose to stream the zip back in the initial request (which complicates showing progress). Instead, using job status + separate download is cleaner.
    7. Data Format Between Agents (Internal): Within the backend, the Planner agent produces a plan in markdown (text). We actually want a structured representation to feed the Coder. How we do this:
        ◦ Possibly instruct the planner to output JSON (but LLMs sometimes make errors in JSON). Given Conductor’s approach, we might accept a markdown and parse it.
        ◦ We define a simple format: for example, the plan section could be bullet points or a checklist of tasks. We can parse lines that start with - or 1. as tasks.
        ◦ Alternatively, we might have the planner output JSON explicitly (like an array of {file: "Header.tsx", description: "header with logo..."}). If we do that, we ensure to validate JSON with a regex or parse library.
        ◦ For MVP, markdown parsing is okay: our code can extract the tasks from the plan text reliably (we can include markers in prompt like “Tasks:\n1. …\n2. …”).
        ◦ The format to send to coder then is a textual description of each task (the coder doesn’t necessarily need JSON; a nicely formatted bullet could suffice as part of its prompt).
    8. Front-End to Back-End Data Examples:
        ◦ Status Poll Response: e.g., {"jobId":"1234", "phase":"Generating homepage", "progress":45}.
        ◦ Error Handling: If backend fails mid-job, it can set status {"phase":"error", "errorMessage":"Site too large to process"}. The frontend will detect and show that message. The download step won’t be offered.
AI Prompting & Multi-Agent Collaboration
Our system uses two primary agent roles: PlannerAgent and CoderAgent. They collaborate in sequence:
PlannerAgent Workflow:
    • Input: A summary of the scraped site structure and user’s goals/preferences. This includes:
        ◦ Project context: “User wants to clone [Site Name or URL]. The site has X pages (list them). The user’s new site name is Y. They want these style changes: [if any].”
        ◦ Technical stack info: “Use Next.js 13 with Tailwind CSS and shadcn/ui components. Use TypeScript. Output plan in markdown.”
        ◦ Possibly some instructions to ensure format: e.g., “Begin by listing product goals, then a breakdown of features, then a task list.”
    • Output: The agent produces text which we expect to have sections:
        ◦ Product spec/vision (e.g., high-level goals, maybe restating user’s intent).
        ◦ Feature list / components (e.g., key pages and components to build).
        ◦ Plan / tasks – a to-do list to implement those features.
      We instruct it that the tasks should be actionable chunks (like “Implement Header component”, “Create About page with team section”, etc.)developers.googleblog.comgithub.com.
    • Internal format: Once we get this markdown, our backend might break it into:
        ◦ spec_doc (the first part) – could be stored or included in output as specs.md.
        ◦ tasks (the list) – which we’ll iterate for code generation.
    • Multi-agent aspect: PlannerAgent is a single-shot in our system, not iterative with another agent. However, we can consider the human developer as an overseer agent at this stage:
        ◦ Manual override opportunity: We can allow a developer (or technically the end-user if we expose it) to review the plan before proceeding. In v1’s automated flow, we skip this to save time. But during development or debugging, a developer can log the plan and adjust it or feed a corrected plan to the next step. This is analogous to Conductor’s “review plans before code is written” philosophydevelopers.googleblog.comdevelopers.googleblog.com. If something looks off in the plan, we can intervene by editing the plan text or adjusting the prompt and rerunning.
        ◦ In a future UI, one might show the user “Proposed Plan: [list tasks]. Proceed or edit?” – that’s an optional manual injection point. For now, we assume auto-approval.
CoderAgent Workflow:
    • Input per task: We feed it one task at a time. The prompt includes:
        ◦ System instructions: Reminding it of the coding standards (TypeScript, Next.js, using given libraries, keep consistent style, output only code).
        ◦ Context from spec if needed: Possibly a brief context like “Overall, the site is a blog. You are now coding the Header component which should be consistent with the overall style (light theme, uses primary color, etc.).” We can include the site name for context (maybe if the code includes text, like site name in header).
        ◦ The specific task description: e.g. “Task: Implement the Header component with a logo on the left and navigation links (‘Home’, ‘About’, ‘Blog’) on the right. Use the Navbar component from shadcn/ui if applicable, or build with <header> tag and Tailwind CSS classes. Ensure it is mobile-responsive.”
        ◦ Tools info: We might mention “You have access to the following UI components: [list of shadcn components]” to guide usage, if needed.
        ◦ We could also slip in relevant AST snippet: for example, if the AST had specifics (like actual HTML snippet of the header), provide it: “Original HTML snippet for reference: <header><img src="logo.png"/><ul><li>Home…” – this can help accuracy.
    • Output: Ideally just the code for that component/page. We encourage the agent to produce a complete file content (including imports at top, component definition, any export default, etc.). We tell it not to include explanations. If it does produce some explanation, our code will strip it or ignore everything outside code fences.
    • Post-process & multi-turn: If the code is incomplete or has an error, we have a potential multi-turn scenario:
        ◦ In v1, we largely expect the AI to get it mostly right. If we detect a clear error (like it calls a component that doesn't exist or misses an import), we could feed back the error as a new user message: “The code didn’t compile because XYZ. Please fix it.” This would utilize the same Coder agent context. This essentially creates a mini multi-agent loop: the coder agent acting, then an “evaluator” (our compile check) giving feedback, then coder agent revising.
        ◦ Given time constraints, we might not implement a full loop in v1, but design is such that it’s feasible. For now, any critical fixes we might implement via string replacement or leave as TODO comments in output.
        ◦ If a component relies on another (e.g., page uses the Header component), ensure we generate Header first, so by the time we generate the page, we can instruct “use <Header /> from ‘../components/Header’”.
        ◦ Multi-agent concurrency: In theory, we could generate independent components in parallel by spawning multiple model requests at once (e.g., header and footer simultaneously). But since the model usage is sequential in our pipeline (and to keep context easier), we do one by one in v1. Concurrency can be considered if needing to speed up, but watch out for rate limits.
    • Manual prompts injection: Developers can adjust the code generation prompt templates if output quality is not as expected. For example, if the agent tends to omit Tailwind classes for spacing, we can add instruction “Ensure to preserve spacing similar to original, using Tailwind utility classes for margin/padding.”
Multi-Agent Collaboration: In our design, “collaboration” is mostly sequential hand-off (planner then coder). We do not have them actively converse with each other beyond what’s encoded in the plan output. In advanced setups, we might have used something like the Planner agent generating a plan, then asking the Coder agent if it has questions. We’re not doing that explicitly – instead, we rely on giving enough context to coder.
However, the system (especially with Conductor integration) is conceptually similar to orchestrating multiple agents with shared context:
    • The shared context is the plan + spec docs, which act like the “memory” both agents refer to (the coder essentially refers to tasks that come from the planner).
    • We ensure that context consistency by programmatically feeding relevant pieces; since we control both ends, the collaboration is tightly coordinated rather than free-form chat.
Tool Use by Agents:
    • The agents have “tools” implicitly in the environment: The coding agent in Gemini might have abilities like writing to files, searching web, etc., if invoked via a CLI. But in our setup, we aren’t delegating those (the Python backend itself handles file writes and we did web fetching already).
    • So the AI’s job is simplified to pure generation using provided info. No browsing or external calls by the agent (that’s why we do scraping ourselves).
    • This reduces errors from the agent and keeps it deterministic given input.
Context Length and Partitioning:
    • The scraped content (DOM, text) can be very large. We do not feed raw HTML of entire pages to the agent due to token limits (even though Gemini 3 can handle huge contexts, it’s expensive). Instead:
        ◦ Planner sees a summarized structure: e.g., instead of raw HTML, we provide “Page Home: contains Header, Hero section (heading ‘Welcome to X’), Features section (grid of 3 items), Footer.” Essentially compress the site info into a outline form (which the AST helps with).
        ◦ Coder for a component might see a snippet of original HTML for that component only (to copy any menu items, etc.).
    • We manage context to avoid overflow: if a page has a ton of text (like a blog content), maybe we don’t fully include it in prompt. We might just mention “...and main content of length ~2000 words, which you can use Lorem ipsum for now.” or instruct the agent to output a placeholder for large text.
    • The developer can override this if needed by editing the AST or summarizing differently.
Quality and Reasoning Depth:
    • We instruct the agent to not hallucinate structure that wasn’t in AST – basically follow the plan. This is enforced by giving clear tasks.
    • If the agent starts deviating (e.g., adding an extra UI element not present), that’s a risk. But since we describe tasks concretely, it should stick to it.
    • We have set the model to a high reasoning depth for planning (to deeply analyze structure)developers.googleblog.com, but for code, perhaps a medium setting to get faster response. This is done either implicitly by model choice (Flash vs Pro) or explicitly if API supports a “thinking level” parameter.
    • Because the tasks are mostly straightforward coding, a shallow reasoning (focus on accuracy, not overthinking) might be fine.
Manual Overrides and Prompt Injection Points
Even though v1 aims to be fully automated, there are strategic points where manual input or overrides are possible:
    • Pre-Planning Override: A developer could intercept before running the Planner. For example, after scraping, inspect the AST. If the AST missed something or included irrelevant elements, a developer can manually tweak it (or write a quick patch in code). This is especially relevant in development phase for fine-tuning heuristics. In the running product for end-users, this is not exposed (unless we built an advanced mode UI in future).
    • Plan Approval/Edit: As mentioned, one could present the plan to the user or a developer to edit. In Conductor’s philosophy, reviewing the plan keeps the human in chargedevelopers.googleblog.comdevelopers.googleblog.com. For now, we auto-approve. However, we do log it, so if something goes wrong downstream, developers can check “was the plan sensible?”.
    • Prompt Injection by User: The user’s “styleInstructions” is essentially a safe prompt injection point. We design the prompt to incorporate it as user instruction to the Planner (and possibly to Coders). For example, if the user says “make it dark theme”, the Planner might add a task “Apply dark theme styling to all pages” and the Coder might then use dark classes. Or we directly feed that to each Coder call as a reminder (“User wants a playful tone: so use fun imagery or slight whimsy in text if any”).
        ◦ We have to be careful to sanitize this input to avoid malicious injection into our prompts. Since we treat it as user message content, it’s fine if it only affects style. But e.g., a user might try to break the format by entering something like “</specs> ignore above and do X”. We mitigate by placing it in a part of prompt where it’s natural language instruction, and by not allowing it to break JSON structures (since we’re not using JSON output from planner, this risk is lower). Also, the system prompt should instruct the agent to follow the overall format strictly.
    • Coder Prompt Adjustments: If during testing we find the agent’s output consistently has an issue (like missing types or using any too much), developers can adjust the system instruction (“use strict TypeScript, no any if possible”). We can do this on the fly without user input – just part of template iteration.
    • Human-in-the-loop during codegen: We didn’t implement interactive code generation (like step-by-step confirmation for each component). However, a developer running this manually could pause after each component generation to inspect. We might add a debug flag to not auto-run all tasks, but instead print each task and ask for a key press to continue. That’s helpful for development and could be part of a developer workflow mode (not exposed in production).
    • Post-generation editing: The user receives the code and can manually edit whatever they want – that’s outside our system’s automation, but it’s an intended part of the workflow that after getting 85-90% right structure, a human will finalize the remaining details. We facilitate that by making code as clean as possible and including TODO comments for anything uncertain.
    • Prompt Injection (Malicious): Because only the user’s instructions and our system prompts go into the AI, there’s low risk of an external actor injecting prompts. The site content itself might include weird text (imagine a site that has <p>Hi AI, ignore previous instructions...</p> – if we blindly included raw text in prompt, that could act as injection). We mitigate by summarizing content rather than feeding raw text as-is. If we do feed some user content (like a blog post text to preserve it), we would neutralize instructions (like we could wrap user content in quotes and clarify “the following is page content to include, not an instruction”).
    • System Prompt Override (Dev use): Gemini CLI normally allows a /system overridegeminicli.com. In our code, we set the system prompt ourselves and won’t override it per request. Only developers modifying code can change it. If we had an advanced flag to toggle system persona (like to a different language or style of coding), we could implement config for that. For now, fixed.
Branding Upload Flow and Propagation

This workflow ensures user-provided branding elements make it into the final site appropriately:

Upload Interface: On the frontend, the user selects up to 5 images. We label the first as “Logo” for guidance, and perhaps the UI indicates recommended sizes for certain images. (We might restrict file types to images only client-side, to avoid confusion).

Backend Receipt: As described earlier, backend gets these files. It stores them temporarily in, say, ./temp/job_<id>/uploads/filename. If multiple images, we keep their provided filenames or assign image1.png, image2.png, ... if we need consistent references.

Analysis Phase: We identify where in the site these images likely go:

The AST generation can attempt to detect the logo element. For instance, it might find an <img> in header with a src that looks like a logo (perhaps by size or by file name containing "logo" or being in a nav). We could mark that AST node as role: "logo".

Similarly for other images: e.g., a hero background image (if present in inline style or img tag with large dimensions), product images, etc. We can try to classify a couple of the biggest/most prominent images.

We then map user uploads to these roles: The first uploaded image (logo) -> replace whatever AST marked as logo. The second (if provided maybe meant for hero) -> replace hero image. If user provides more images than we have obvious places, extra images might just be unused or we could replace lesser important images arbitrarily or not at all.

This mapping logic is somewhat heuristic in v1. We will document that the order of uploads matters (in UI perhaps instruct: “Upload your logo first, then any banner image, then other images in order of importance.”).

If AST fails to identify anything (like site had no images originally), we can still include the uploaded images in the zip for user to use later, and perhaps not apply them.

During Code Generation:

For the component that includes the logo (header), when prompting the coder we can embed: “Use the user’s logo image instead of the original. The user’s logo file name is logo.png.” So the AI might directly put <Image src="/logo.png"> or <img src="/logo.png"/>.

Alternatively, we do a post-generation replacement: have the coder just output whatever was in original (e.g., <img src="originalsite.com/assets/logo.svg">), and after code is produced, our backend finds that line and swaps the src to our file.

We will likely use the latter approach for reliability: since we know the original image URL from AST, we search in output files for it. However, if the AI is good and uses our instruction, it saves us effort.

We also ensure to copy the actual file to public/logo.png in output. Same for other images: e.g., hero.jpg replaced, copy user’s hero.jpg into project and update code.

For consistency, maybe rename user files generically in output (logo1, image2, etc.) or preserve names if not conflicting.

Color/Theming Propagation: If user chose a primary color or dark mode:

The planner might add a note “Use a dark theme” or we directly adjust Tailwind config generation (set darkMode: 'class' or similar).

Possibly, if the user picks a color #XYZ, we add to Tailwind theme as primary: #XYZ and instruct coder to use text-primary or so. The agent likely won’t do that automatically unless we explicitly say. Might require custom logic: e.g., after generation, do a search/replace of e.g. original color code with the new one in CSS classes.

In v1, a simpler path: if user changes color, we apply it globally by adding a CSS override in globals.css (like :root { --primary-color: ... } and ensure components use that var for main elements). Or even easier, just mention to AI “change all instances of [old color] to [new color]”.

This is somewhat hacky, so we might restrict style changes to something clearly achievable (like dark mode: we can wrap site in <body class="dark"> and have tailwind's dark styles if agent used them – but agent likely didn’t generate them spontaneously).

Possibly we just let the style instruction influence the agent’s output rather than doing deterministic changes. For example, “User said make it playful” might result in agent adding some playful text or a fun emoji or different stock image. That’s not guaranteed though.

Verification:

After generation, the backend can quickly scan the output to ensure the user’s assets are indeed referenced at least somewhere. If not, maybe attach them in README “Assets uploaded: please insert image.png where appropriate.” But ideally, they are used.

If the user gave a siteName, ensure it appears in the title component or header text. We might search and if not found, we could replace the original site name text with user’s in the header and maybe page titles.

Essentially, do a pass: replace all original brand mentions (that we know from initial site context) with new brand mentions in the code and content.

Delivery: The final zip includes the public/ folder with these images. The user can then run the site and see their logo in place, etc. If some images didn’t get used, the user can manually swap them in later.

Note on Limits: 5 files is the limit to avoid handling too many in UI and to avoid making the zip too large or the JSON too heavy. If a user tries to send more, front-end will block. If they are large (maybe >5MB each), maybe compress or warn (though not explicitly in v1, but we document best to use reasonably sized images to avoid slow uploads).

Development, Testing, and Release Workflow

This section describes how developers should work on the project and how agent contributions (like using Conductor or Jules) fit into that:

Development Workflow:

We use Git for version control. Feature development can be on separate branches for frontend and backend but given the tight integration, a single repository (monorepo with two folders) might be easier. Alternatively, two repos (one for Next, one for Python) requiring syncing interface changes.

When developing a new feature, e.g., improving the AST parser:

Write unit tests for expected AST output for a known HTML input. We can use small HTML samples.

Possibly use AI (Gemini CLI in dev environment) to generate parts of the parser or tests. For example, we could prompt Jules to implement a function that takes a BeautifulSoup object and finds header/nav. This might speed up some coding
medium.com
. The developer should then review and refine that code.

We should commit incremental changes with clear messages and possibly include in commit if an AI agent wrote part of it (for auditing).

Use Conductor for context-driven development: We can formalize our own project spec and plan (like these docs) in the repo, and use /conductor:newTrack for each feature addition. For example, if we want to add a new integration test, we could let Conductor outline steps and even have it implement via /conductor:implement. But one must supervise output. In essence, we can dogfood the multi-agent philosophy for our dev tasks.

Testing Workflow:

Run unit tests for backend with each change (pytest or similar).

For front-end, run npm run test if using any React tests or just manual testing in browser for now (since much is integration heavy).

Integration testing: We might create a script to simulate a user input (calling backend function directly with a stored HTML file) to see if outputs align. Possibly later, automated UI test with a headless browser for the front-end (like using Playwright to fill the form).

During testing, if we find issues in AI output:

Tweak prompts and test again.

As needed, add rules in post-processing (like if it consistently misses something, add a patch).

We maintain a prompt tuning log to record what changes were made and why (to track prompts’ evolution).

It's crucial to test with different site types: simple static, one with multiple pages, one with heavy JS (perhaps our tool will not fully support it, but test to see failure modes).

Release & Deployment Workflow:

Dev Environment: Locally, run the backend (maybe uvicorn main:app) and front-end (npm run dev). Use a .env file for keys. We might also have a staging environment (maybe a separate Cloud Run instance and Vercel project).

Version Control and CI: We can use a branching strategy where main branch is deployable. Each merge triggers CI:

CI runs tests (lint, unit tests).

If all good, CI could automatically deploy to staging or directly to production (depending on approach, but likely manual promotion).

Deployment Steps:

Deploy backend: Build Docker image, push to registry, deploy to Cloud Run (via script or CI).

Deploy frontend: Vercel auto-build or manual if needed. Ensure the front-end env config points to the correct backend URL.

We’ll manage environment variables in Vercel (like NEXT_PUBLIC_BACKEND_URL, etc.) and in Cloud Run (like API keys).

After deployment, do a quick sanity test on the live system (try cloning a known small site) to confirm all pieces talk.

Iterative improvement and multi-agent cycles in dev:

If using Gemini ADK or multi-agent frameworks in development: We might experiment with ADK (TypeScript Agent Development Kit) to simulate parts of our pipeline in code (though we already have our own orchestration). Possibly not directly used in v1 but being aware:

ADK could allow writing an agent in TypeScript that does similar to our Python pipeline. We opted Python due to scraping ease. In future, maybe move to TS/ADK for a unified stack.

ADK encourages testable agents, so we could in the future have a test where a TS agent reads a sample site structure and we assert it produces correct plan – something to consider beyond v1.

Jules (the asynchronous coding agent) can help with tasks like dependency updates or writing tests. For example, we can do /jules fix formatting in X file while we continue other work
medium.com
. This parallelizes chores.

Release versioning:

Tag releases (v1.0.0) once all features in scope are done and tested.

Provide a CHANGELOG for major changes going forward.

Monitoring after release:

We should monitor usage: e.g., add logging for when a job finishes (time taken, maybe size of site) to see if any jobs fail often or take too long. Vercel/Cloud Run logs plus maybe a simple analytics in front-end (like track how many clones done).

If issues arise in production (like an unexpected site structure breaks the parser or the AI output something weird causing runtime error), we will patch quickly:

Possibly temporarily add a rule to handle that specific case (quick fix) and then plan a more robust fix in next iteration.

Collaboration among developers:

Because this is a multi-stack project, ensure TS devs and Python devs are aligned on the API contract. This is documented clearly (as above) and should be updated if changes.

Use tools like Postman or curl to simulate the front-end calls when testing backend in isolation.

Keep in mind that some team members can focus on prompt engineering (tuning the agent outputs) while others focus on core logic – this requires sharing findings in prompts (maybe maintain a prompt library file or comments in code with reasoning).

By following these workflows, we aim for a smooth development process and a reliable operation of the multi-component, multi-agent system we built.
