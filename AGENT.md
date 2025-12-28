AI Website Replicator – Agent Profiles & Logic (AGENT.md)

This document defines the various AI agents (or agent roles) used in the replicator system, including their responsibilities, capabilities, internal reasoning approaches, and how the system handles failure cases (fallbacks). In v1, our agents are implemented via prompts to large language models (like Gemini 3), not as persistent processes – but we conceptualize them as distinct “agents” for clarity.

Overview of Agent Roles

We have two primary agent roles in this system:

ReplicatorAgent (Coordinator) – This is a high-level orchestrator agent embedded in our backend logic (not a single LLM call, but the logic that coordinates other agents). It’s not one prompt by itself but rather the Python code that carries out the multi-step replication plan. Think of it as the conductor that uses tools (the Planner and Coder agents, plus the scraper) to achieve the end goal. It ensures each step is completed and handles decisions like ordering of tasks and handling results from other agents.

PlannerAgent – An AI agent responsible for analyzing the website’s structure and creating a formal specification and task plan. It reads the input (site structure data, user requirements) and outputs a structured plan for building the new site. It effectively answers “What should we build, and how should we break it down?”
developers.googleblog.com
github.com
.

CoderAgent – An AI agent (or you can view as a pool of agents with the same profile) that, given a specific task from the plan, writes the actual code for that part of the site. We invoke this agent multiple times (once per task/component). It answers “How do we implement this specific part in code?”.

(Note: We might conceptually add more specialized agents in future, like a StylingAgent or ContentAgent, but in v1 the Coder covers all coding needs including layout and style code. Also an EvaluatorAgent could be envisioned for testing generated code, but that’s not fully implemented now.)

ReplicatorAgent (Coordinator)

Role & Responsibilities: The ReplicatorAgent’s role is to drive the overall replication process. It’s embodied in our backend orchestration code. It:

Accepts the user’s input and initiates the workflow.

Invokes the scraping module (like a “tool” usage) to gather site data.

Calls the PlannerAgent with context and instructions.

Interprets the Planner’s output (the plan).

Sequences the tasks and for each invokes the CoderAgent.

Collects the outputs (code files) and assembles the final project.

Manages state and progress updates (for the UI and for error handling).

Decides on fallback strategies if something fails.

Capabilities: As it’s essentially our programmed logic, it has full capability to use tools:

It can use the Web Scraper (Playwright) for site data (a capability outside the model).

It can call the AI model for planning and coding.

It has file system access (to write code files, package zip).

It has knowledge of the overall system context (knows about Next.js, Tailwind, the user’s desires, etc. from configuration).

Reasoning & Decision Logic: The ReplicatorAgent follows a fixed logical progression (the phases described in the PLAN). However, it does have to make a few decisions dynamically:

Which pages to scrape (controlled by depth and filtering logic).

In what order to generate components (we generally do as planned, but it may reorder slightly, e.g., generate shared components before pages for context).

Whether to retry or adjust if an AI call fails. For example, if the Planner’s output is missing tasks, the ReplicatorAgent might decide to supplement a task or request the PlannerAgent again with more hints. Or if the Coder output is empty or obviously wrong, it might decide to call CoderAgent again with a modified prompt or even attempt a simpler model.

If a non-critical failure happens (like one image couldn’t be downloaded), the coordinator might decide to continue without that image rather than abort.

It also monitors time and could decide to cut off further actions if the process is taking too long (e.g., skip generating very minor components if overall time exceeded some threshold – not implemented in v1 but conceptually possible).

Essentially, it’s implementing the policies for robust operation.

Fallback Behaviors:

Planner Failure: If PlannerAgent returns output that is unusable (e.g., it produced too generic a plan or didn’t follow format), the ReplicatorAgent can fall back by either:

Re-prompting with a more constrained instruction (like “please list tasks explicitly”).

Or, skip using the AI for planning entirely: in worst case, have a basic heuristic plan (like “one task per page + one per major section”) as a fallback to still proceed. This ensures the pipeline doesn’t break. However, that is last resort because AI planning is core to our design.

Coder Failure: If a particular code generation fails (e.g., model times out or produces an error message instead of code):

The ReplicatorAgent can catch that and try again once.

If it still fails, it could mark that task as failed and continue with others. The final output could include a placeholder file or a TODO comment indicating the component wasn’t generated. This is better than total failure – user at least gets partial output.

Alternatively, it could try to switch to a different model for that task (maybe the code-specific model or a more powerful model if we were using a lighter one).

Integration Failure: If after generating all code, the ReplicatorAgent finds the code doesn’t compile (we might not fully test compile in v1), a robust approach would be to run npm run build in a sandbox and parse errors, then possibly re-invoke CoderAgent to fix them. In v1, we likely skip automatic fix due to time, but that could be a fallback in future: basically use the agent as a debugger.

Timeout/Resource limits: If scraping is taking too long (maybe target site is huge or slow), the agent might abort and return an error to user (“site took too long to respond”). Similarly, if the whole process exceeds certain time, it should stop to avoid hanging and inform the user.

User Cancellation: If the user cancels from UI, the ReplicatorAgent should be signaled (maybe by setting job status cancelled) and it would then halt further AI calls and clean up.

Public vs Private Nature: The ReplicatorAgent is not directly exposed to user input beyond the initial parameters, and doesn’t have a persona or prompt – it’s our code. So issues of prompt security don’t apply to it. It acts predictably by design.

PlannerAgent

Role: The PlannerAgent is an AI that transforms raw site data + user’s customization requests into a concrete spec and plan. It’s akin to a system analyst or project planner who, given an existing example (the site) and requirements (rebrand), articulates what needs to be built.

Capabilities:

It has strong analytical skills thanks to the LLM. It “understands” web structures, can interpret the significance of elements (like recognizing a navigation bar, a carousel, a contact form).

It can follow instructions on formatting output (so we expect it to output markdown with certain sections).

It does not execute any code or use external tools; its capability is purely reasoning and text generation.

It has context memory (from the model’s perspective) of up to a very large token count (Gemini 3’s context is huge, up to 1M tokens
godofprompt.ai
). We won’t use near that, but it means it can digest a significant amount of structured info about the site if needed.

Reasoning Logic:

Internally, the PlannerAgent will likely break down the problem by itself. For instance:

From the site outline given, identify the core components and pages.

Map those to features (like “Page X will require components A, B, C”).

Consider user inputs: if the user wants a style change or new branding, incorporate that into the plan (like an explicit step to apply new branding).

Then present it in the requested format.

Because we instruct it to treat the context as a formal spec exercise, it likely uses chain-of-thought invisibly (the model might do something like: “hmm, the site has these sections, user wants dark theme -> should note that in guidelines, etc.”). The output we see is final polished plan, not its raw thought.

We might set the model to a relatively higher “temperature” or creative freedom for planning (not too high, but enough that it can reorganize and not just echo the input). But we also want determinism to some extent. A mid-level creativity so it can fill gaps (like give names to tasks nicely) should work.

We include in system prompt some best practices (from Conductor’s approach) like “Ensure tasks are detailed and cover testing if relevant, ensure context is maintained”
developers.googleblog.com
. The agent thus reasons about maintaining consistency (like if the site uses a certain design style, it might mention it in guidelines).

Output Structure (Reiterated):

We expect something like:

Product Overview: (e.g., “This site is a portfolio for a photographer, featuring a gallery, about section, contact form. The goal is to replicate layout with new branding.”)

Feature Breakdown: (e.g., bullet list: “Gallery page – displays images in grid; About page – shows bio; Contact form – sends message; Navigation bar – links pages; Footer – social links.”)

Plan/Tasks: (e.g., numbered tasks or phases: “1. Set up Next.js project. 2. Implement Navbar component with logo and menu... 3. Create Gallery page component... 4. Apply user’s color scheme and logo... 5. Test responsiveness.”)

It might also mention tech choices (since we told it Next.js, Tailwind, etc., it might say “We’ll use Tailwind for styles; components from shadcn for consistency” – basically echoing the stack).

Standard vs optional: Some tasks might be optional if certain features exist or not. E.g., if the original site had a newsletter signup but user didn't ask for it, maybe the agent suggests it as optional or omits. That’s fine.

Fallbacks / Errors:

If the PlannerAgent output is missing something (like it forgot to plan for something clearly present), our coordinator could detect it (but that’s hard to automate 100%). Often we rely on subsequent steps to catch omissions (the coder might fail if it’s asked to code something not in plan).

We can mitigate by providing comprehensive input to planner. If still something is missing:

Possibly run a quick validation: e.g., count images in AST vs tasks dealing with images, if mismatch maybe adjust plan.

In case the planner returns completely unusable output (rare with a good model and prompt), the fallback is as described: the ReplicatorAgent either tries again or falls back to a minimal plan (like one task per page).

Example: Suppose the site is “MyBlog” with 3 posts on homepage. The Planner might output:

Features:
- Home page with a list of latest posts.
- Post page for detailed content.
- About page with author bio.
- Common header with site title and nav links (Home, About).
- Footer with contact info.

Plan:
1. **Scaffold Next.js project** – Initialize project with Tailwind and necessary configs.
2. **Navigation Header** – Create a responsive header component with site title "My New Site" and links.
3. **Footer** – Create a footer component with updated contact info.
4. **Home Page** – Implement homepage listing posts (static sample posts for now).
5. **Post Page** – Implement a template for blog posts (one example post).
6. **About Page** – Implement about page using user-provided bio text.
7. **Apply Branding** – Replace logo and color scheme with user’s choices (teal accent color).
8. **Testing & Deployment** – (Optional) Test pages locally and prepare for deploy on Vercel.


This plan gives our coder clear tasks (2: header, 3: footer, 4: home, 5: post, 6: about, etc.).

Note: The agent might label tasks with numbers or bullet points. We’ll parse accordingly.

CoderAgent

Role: The CoderAgent generates code for each component/page. It’s essentially a software developer agent that takes specifications (from the plan and AST details) and writes implementation in the specified tech stack.

Capabilities:

It has knowledge of coding, especially if using a code-specialized model or code-specific prompting. Gemini 3 presumably excels at code tasks and with the ADK context it knows how to use tools (though we aren’t letting it directly run tools). But it has internal knowledge of common libraries like React, Next, Tailwind usage, etc.

It can incorporate context provided (like if we give a piece of the original HTML or the desired text content, it can include those accurately).

It follows the system instructions about style (no logging, use proper code formatting, etc.).

Reasoning & Generation:

For each task, the agent will recall the overall context. We’ll remind it of anything needed: e.g., “Use functional components, don’t use outdated Next.js patterns if we want newest conventions, etc.”

It likely goes through an internal chain-of-thought for complex tasks: e.g., “Task: build responsive navbar with links. What do I need? - likely use <header> with flex, place logo to left, links to right, make it mobile-friendly with a hamburger menu perhaps.” It might reason about whether to implement a mobile menu or not depending on how complex original was (if original had one).

We might keep temperature low for code generation to ensure deterministic and correct outputs (maybe even 0 to just get the most straightforward solution).

If multiple tasks are similar (like multiple pages), since each prompt is separate, the agent might not remember what code it wrote for others unless we supply it. We might supply a brief summary of available components: e.g., when generating About page after Home page, we can mention “We already have a Header component and Footer component, reuse them.” This avoids duplicate code and ensures integration.

The agent’s code includes comments if appropriate, but we prefer minimal ones for brevity (we didn’t explicitly forbid comments, but the system prompt might emphasize output primarily code. It could still comment major sections, which is acceptable).

Use of Tools in code: The agent might spontaneously want to fetch data or similar, but since we gave it static context, it likely will not attempt things like API calls unless explicitly asked. We keep tasks such that each is self-contained.

Examples of how it might generate:

If tasked with “Implement header with logo and nav links, using Tailwind for styling,” the output might be:

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Site Logo" width={40} height={40}/>
          <span className="text-xl font-bold">My New Site</span>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}


It deduced to use Next’s Image and Link. If our instructions prefer shadcn components, it might use those instead (like using a pre-built Navbar from shadcn if one exists, or their <Button> for links – though nav links likely remain anchors).

Fallback and Error Handling:

If the agent outputs syntax errors (like mismatched tags or undefined variables), the ReplicatorAgent ideally catches that by a compile or at least by noticing obvious issues (we can do a quick parse of JSX via something like a TS compiler in the future, but not included now).

On noticing an issue, we can do:

Quick string fixes (if it's something like it used a component that wasn’t imported, we can add an import if we know it).

Or call the agent again with the error message: e.g., “The code for Header has an undefined symbol X, fix it.” – the agent should then correct.

If the agent consistently fails a particular component, the fallback might be to stub it: e.g., output a simpler version or skip. But since code LLMs are quite good at these tasks, failures should be rare if prompts are correct.

Also ensure if one component references another, we generate the referenced one first or instruct accordingly. If out-of-order, a component might import something that isn’t created yet – but we will create it eventually. This isn’t fatal, but ordering nicely avoids confusion.

Capability Constraints:

The CoderAgent doesn’t truly “run” code, so if an interactive behavior (like a carousel script) was on the original site, unless we specifically describe it, it might be omitted. It can only code what we specify. So some interactive features might not be replicated if we didn’t plan them (e.g., if site had a fancy slider, our plan might not cover implementing it unless we explicitly asked – likely omitted for MVP).

It’s limited to knowledge cutoff and training (though if Gemini 3 is up-to-date with Next 13, etc., it should be). If we ask something unusual or very new, it might falter. But for common tasks, it’s fine.

Testing the Agent’s code: In future, an EvaluatorAgent could run something like unit tests or analyze the code for mistakes. For now, the fallback is manual testing by developers or users. The user is expected to open the site and if something’s off, adjust manually. For example, if a link is broken or formatting a bit off, that’s within the tolerable error margin (10-15% not perfect).

Agent Alignment & Safety:

We keep the CoderAgent constrained to coding tasks. System prompt will warn like “Don’t output anything except code relevant to task.” That prevents it from possibly injecting unrelated text.

The code it generates could theoretically have vulnerabilities if not careful (like XSS if it blindly incorporates user content). But since it’s largely static site generation, risk is low. We should still review any form handling code it writes (likely minimal in static context).

If user’s prompt says something odd (“make the site malicious”), the agent probably wouldn’t because our instructions override to focus on replication ethically. In a dev environment, we control this fully.

Summary of Fallback Strategies:

Minor errors: fix inline or prompt again.

Major inability: skip component and leave note.

At worst, abort codegen if everything fails (very unlikely) and return error to user (we prefer partial output though).

With these agent profiles defined, we ensure each part of the AI system has a clear contract. The PlannerAgent produces the roadmap, and the CoderAgent follows it to produce the code, while the ReplicatorAgent ties everything together robustly, managing any issues that arise.

Gemini CLI & Conductor Integration Guide (GEMINI.md)

This document explains how the Gemini CLI’s Conductor extension and related tools can be utilized and understood in the context of our project. It covers the relevant Conductor commands, how Conductor sets up project context, what files it generates, best practices for using it, and advanced configuration options (like toolchains, multi-agent cycles, and various tuning settings). Even if our web app runs autonomously, understanding Conductor’s workflow helps maintain alignment with best practices in agent-driven development.

Gemini CLI Conductor – Overview and Key Commands

Gemini CLI is Google’s command-line interface for interacting with Gemini models. The Conductor extension for Gemini CLI introduces a structured, context-driven development workflow
developers.googleblog.com
. It formalizes the process of planning and coding by using persistent files in your repository to store specs and plans, which the AI reads and updates.

The main Conductor commands relevant to our context are:

/conductor:setup – Initialize project context. This is run once per project to create the foundational context files (product details, guidelines, tech preferences, etc.). It asks the developer a series of questions and generates markdown files under a conductor/ directory
github.com
github.com
.

/conductor:newTrack "<description>" – Start a new feature or task track. Conductor will generate:

A spec.md for that feature (requirements)
github.com
.

A plan.md with an itemized to-do list (phases, tasks, sub-tasks) for implementing it
github.com
.

It also updates tracks.md with an entry for this track (tracking progress)
github.com
.
The <description> is a brief summary of what you want to build (e.g., “Add dark mode toggle”).

/conductor:implement – After reviewing/editing the plan, running this command triggers the coding agent to execute the plan tasks one by one
github.com
. The Conductor extension will have the AI (Gemini) open files, write code, run tests, etc., as per the plan, checking off tasks as it goes
github.com
. Essentially, it automates the implementation guided by the plan.

/conductor:status – Shows the current status of tracks (which tasks are done, which in progress) by reading the tracks.md file
github.com
.

/conductor:revert – Allows reverting changes related to a track or task
github.com
. Under the hood, it may use version control (git) to undo commits if needed.

In summary, Conductor commands follow a lifecycle: setup project context -> create a new track (with spec and plan) -> possibly iterate on spec/plan -> implement the plan -> use status to monitor and revert if necessary
github.com
github.com
.

Project Initialization with /conductor:setup

When you run /conductor:setup in Gemini CLI, Conductor engages in an interactive session to define your project’s key context. It will ask or infer:

Product: High-level description – target users, product goals, what the project is about. Conductor then creates conductor/product.md capturing this
github.com
github.com
.

Product Guidelines: The style and tone guidelines – e.g., brand voice, UI/UX principles. Saved in conductor/product-guidelines.md
github.com
github.com
. (This might be optional; Conductor includes it if relevant. If you have none, it might still create the file but note "N/A" or you can fill it later.)

Tech Stack: Your chosen technologies – programming languages, frameworks, libraries, databases, etc. The answers populate conductor/tech-stack.md
github.com
github.com
. This ensures the AI knows the constraints (e.g., “TypeScript, Next.js, Tailwind CSS, no backend DB in this project”).

Workflow: Team preferences and processes – e.g., coding style (TDD, code review requirements), branching strategy, deployment pipeline. Stored in conductor/workflow.md
github.com
github.com
. Conductor provides a template for workflow which you can edit (like indicating you prefer small commits, or always writing tests first).

Additionally, Conductor sets up a conductor/code_styleguides/ directory if you have any specific style guides or lint rules to enforce (it might put things like ESLint rules or naming conventions there)
github.com
. If you don’t have custom style guides, this folder may remain empty or contain defaults – it’s optional.

It also creates an empty conductor/tracks.md which will list ongoing and completed tracks (features) with their status
github.com
. Think of it as a summary backlog and progress tracker.

Standard vs Optional Files:

“Standard” context files are always generated: product.md, tech-stack.md, workflow.md, and tracks.md (and typically spec.md/plan.md per track later)
github.com
.

“Optional” files: product-guidelines.md might only be created if branding/messaging guidelines are needed (Conductor usually does, but if not, that file might be minimal). The code_styleguides/ directory contents are optional – you can drop in specific style documents (like coding conventions) and Conductor will consider them. If you don’t provide any, Conductor might leave a note to add some or keep it empty.

Another optional piece: if your project has existing code or docs, Conductor might incorporate them into context (for instance, if you had a README, it might reference it or if you had tests, it might note testing approach).

In our replicator app context, we ran a form of Conductor’s setup concept internally: we have a vision (Product), chosen stack (TypeScript/Next + Python, etc.), and workflow (speed-focused). We have essentially written those down in SPECS.md. If using Conductor CLI for our dev, we’d put that info into the prompted questions.

How it helps: With these files in place, any agent commands (like implementing features) have a “single source of truth” about the project’s requirements and constraints, rather than relying on ephemeral chat context
developers.googleblog.com
developers.googleblog.com
. Conductor ensures the AI always loads these files into context during code generation, so it remembers, for example, “we use Tailwind and shadcn” or “the product should have a playful tone”.

Track Creation: Specs and Plans

When starting a new feature with /conductor:newTrack, Conductor guides you to produce two artifacts for that feature/track:

Spec (spec.md): This is a detailed requirements spec for the feature or fix. It answers what and why: what are we building, what should it do, and why (tie back to product goals). Conductor will usually prompt you with questions and then draft this spec. For example, if the feature is “dark mode toggle”, spec.md might state “Feature: Add a dark mode. Description: Allow users to switch between light and dark themes. On toggle, the UI colors should invert appropriately... Acceptance criteria: All pages support dark mode, user preference persists.” It’s basically a mini PRD (product requirement document) for that track
developers.googleblog.com
.

Plan (plan.md): This is an actionable task list breakdown for implementing the spec. It’s structured hierarchically: it may have Phases (if a big feature) which contain Tasks, which can further contain Sub-tasks
github.com
. Each item is a checkbox or bullet that the Conductor agent will tick off as it’s done. For example:

Phase 1: Update Design

Add dark mode colors to Tailwind config.

Implement toggle UI in navbar.

...

Phase 2: Save Preference

Add localStorage logic to remember theme.

...

etc.

Conductor helps generate this by suggesting tasks and asking you to confirm or edit. It ensures the plan is comprehensive and ordered logically
developers.googleblog.com
github.com
.

Conductor will create these under conductor/tracks/<track_id>/spec.md and .../plan.md
github.com
github.com
. The track_id is usually a number or slug Conductor assigns (it also logs it in tracks.md with a title so you identify which is which).

In our replicator’s context, our PlannerAgent essentially played a similar role to Conductor’s spec/plan generator, but automatically. Conductor CLI does it interactively with developer input (or suggestions to accept). We aimed to mirror that by auto-generating a plan that covers tasks akin to what Conductor would outline. Indeed, Conductor’s approach inspired how we structured the PlannerAgent’s output.

Best Practice: Always review the generated spec and plan. Conductor expects the human developer to vet these before coding. This ensures any misunderstandings are caught early. For instance, if the spec missed a requirement, you add it; if a task is unclear, clarify it. This review step maps to our system’s possibility of manual override (which we might add later).

Implementing with Conductor

After spec and plan are ready, /conductor:implement hands off to the coding agent. Here’s what happens:

Gemini CLI reads the plan.md. It will sequentially go through each task item. For each:

Opens relevant files or creates new ones as needed (the tools API allows file operations).

Writes code to satisfy the task
github.com
github.com
.

Runs tests if part of plan (Conductor might insert steps like “Run tests for X”).

Marks the task as done by editing plan.md (e.g., putting an [x] in the checkbox or strikethrough the item)
github.com
.

It follows the workflow rules from workflow.md. For example, if workflow says “TDD”, Conductor will structure the plan to write a test, see it fail, then write code, then see it pass
github.com
. The implement command enforces that by possibly running tests after tasks.

If something goes wrong (like tests fail or code can’t be executed), Conductor might pause and ask for guidance or adjust plan (it has some “checkpoints” and can revert tasks mid-flight
developers.googleblog.com
).

Once all tasks are done, Conductor updates tracks.md to mark the track completed and synchronizes context files if needed (meaning if the code introduced something that changes the overall context, it can update product or tech docs, though not sure if done automatically in current version)
github.com
github.com
.

Conductor’s implement is essentially an automated version of what our ReplicatorAgent + CoderAgents did. The difference: Conductor operates within a developer’s repository environment and often on existing code (brownfield projects). It has some safeguards:

Checkpoints: It may create git commits at certain phases, so you can revert if a phase’s changes are undesirable
developers.googleblog.com
.

Manual verification steps: After a phase, it might prompt “Verify that the feature works as expected, then continue”
github.com
. This aligns with keeping the human in the loop for validation.

For our use, since we aimed for a fully automated clone, we didn’t have a manual verification in the middle – but for larger projects, that’s wise.

Multi-agent cycles with Conductor: Conductor itself orchestrates a multi-step agent cycle: planning agent -> coding agent -> possibly test agent. It’s linear though, not parallel, except when combined with Jules (the asynchronous agent extension) you could offload tasks concurrently. E.g., you could start multiple implement tracks in parallel with /jules if you wanted each on a different VM. For our single clone job, parallelism isn’t from Conductor but we considered it (like generating multiple pages concurrently – Jules concept could handle that). Conductor by default is one track at a time.

Default Toolchains and Extensions

Default Toolchain in Gemini CLI: Out-of-the-box, Gemini CLI’s agent has a suite of tools:

File system read/write
geminicli.com
 – allows it to open and modify code files in your repo.

Shell execution – it can run commands (like tests, or start the dev server) in a sandbox.

Web fetch and search
geminicli.com
 – the agent can issue web queries if needed (for example, if it needs to look up documentation, etc., though usage depends on policies and whether internet access is allowed in context).

Memory and others – it has a “memory” tool to store info across operations, and a “todos” tool ironically similar to Conductor’s plan (though superseded by Conductor itself)
geminicli.com
geminicli.com
.

Conductor specifically leverages:

The file system tool to edit markdown plans and code files.

Possibly the shell tool to run tests or build commands.

It might use a git integration implicitly for revert (or at least expecting you have version control externally).

Gemini CLI Extensions: Conductor is one extension; Jules is another (for asynchronous tasks)
developers.googleblog.com
developers.googleblog.com
. There are others (e.g., Adaptive model routing as mentioned, and IDE integrations). By design, these can be combined:

For example, you can do /jules someTask while Conductor is in effect. Jules extension as per blog allows delegating tasks to background agent while you continue using Conductor in foreground
medium.com
.

But concurrency aside, default Conductor usage expects you to do one thing at a time.

In our project context, if a developer is working on the replicator using Gemini CLI:

They’d run gemini in the project, then use /conductor:setup to formalize the initial docs (maybe largely based on what we wrote in SPECS.md, but now interactive).

Then for each major feature of v1, they could do /conductor:newTrack (like “Implement scraping module” or “Integrate AI planning”). Conductor will help break those down. (We kind of did that manually in our plan).

They then /conductor:implement each, having the AI write code. Given our project is multi-language (TS + Python), Conductor might need to handle a polyglot scenario. It likely can (Gemini can generate Python files too if instructed). We’d ensure to mention both TS and Python in tech-stack so it knows to possibly implement in both.

Multi-agent Cycles and Adaptive Toolchains:

Multi-agent cycles: Conductor itself is one orchestrator agent working sequentially with a coding agent. If we consider multi-agents beyond that:

ADK (Agent Development Kit) can create explicit multiple agents in code. E.g., one might build an agent pipeline: one agent plans, one codes, one reviews. This is more custom but Conductor automates a specific pattern of that. Our replicator design effectively had a mini multi-agent pipeline (Planner -> Coder).

In future, we could integrate ADK’s approach to define our Planner and Coder as separate classes and orchestrate them in code, which might give more control (like you could simulate Conductor’s steps in our app).

Adaptive Model Selection: The Gemini CLI + Adaptive extension (if installed) will automatically choose among model variants (Pro, Flash, etc.) for each prompt
reddit.com
. It measures task complexity and context and picks a model optimized for it (fast vs thorough). If using Conductor with Adaptive, trivial tasks get a fast model, complex ones get the robust model, invisibly to user.

In our app, we manually thought of doing similar (maybe use Pro for planning, Flash for coding). The extension could do that automatically. E.g., short code tasks might route to flash, big planning prompt to pro.

If developing with CLI, enabling adaptive might improve speed while maintaining quality where needed.

Context Length: The CLI and models allow huge context. Conductor will load all context files plus relevant code into the model’s input when needed. It keeps an eye on token usage (hence the note in Conductor’s README about increased token consumption)
github.com
.

You can check current usage with /stats model mid-session to see how many tokens used so far. Useful to ensure you don’t exceed context.

If context is too big, Conductor might not include everything or might summarize parts. Exactly how 1M token context is managed is advanced; presumably it’s rarely fully used.

Tool Limits: Conductor uses the underlying tools. There is a policy engine possibly to prevent infinite loops or unsafe actions
geminicli.com
geminicli.com
. For example, it likely has a cap on how many web searches the agent can do or how many file changes in one go, to avoid runaway. These limits aren’t directly exposed in Conductor’s UI but can be configured in settings or policy.

The ADK and CLI settings allow limiting tool usage (e.g., you might configure “maximum 5 tool invocations per command” or similar). This ensures the agent doesn’t, say, get stuck calling a failing test repeatedly forever.

Our app doesn’t allow AI autonomous web browsing (we did our own scraping), so tool use by our agent is restricted to what we programmatically give (no user controlled loops). But it’s good to know if we allowed more open-ended AI behavior.

Reasoning Depth & Thought Process: Gemini models have a concept of “thinking levels” (or reasoning depth). This can often be adjusted via a parameter or by using a specific model variant (like Gemini “Deep Think” vs “Flash” might correspond to more reasoning vs speed).

In CLI, there might be a setting or simply the model choice. We might not directly toggle a numeric parameter, but we choose appropriate model. Also, in prompt, one can instruct the agent to be more thorough or to explain its reasoning (Conductor normally doesn’t want verbose reasoning shown to user; it just wants results).

There’s mention that in AI Studio or Comet API you can set thinking_level to LOW/MEDIUM/HIGH
reddit.com
godofprompt.ai
. In CLI, not sure if directly exposed, but it might pick up on complexity.

Practically, if you want the agent to reason more systematically, you can ask it to chain-of-thought (like show reasoning). Conductor might disable verbose reasoning by default (to avoid noise in output). They are likely using the models’ hidden reasoning ability – you see glimpses in dev mode if you enable something like “show thoughts” in CLI (there’s a debug to see the agent’s step-by-step, which is fascinating but not shown by default).

For our usage, we implicitly set a sort of reasoning depth by how complex tasks we give. If something is complex, the model will naturally do more internal thinking (especially a big model like Gemini Pro is tuned to do so with minimal prompt coaxing).

System Instructions and Advanced Flags:

Gemini CLI allows customizing the system prompt via /system or in config (systemPrompt override)
geminicli.com
geminicli.com
. Conductor sets a system prompt that instructs the agent to follow the plan, use the context files, etc. (Likely something like: “You are a software agent working on a project. Use the given context and plan to implement tasks. Only modify files as directed,” etc.).

We too set system instructions in our agents (like telling Coder to only output code, etc.). In CLI, you can override system prompt for the whole session if needed (not common when using Conductor, because Conductor’s own system prompt is carefully crafted).

Advanced Flags: The CLI and Conductor have some flags:

When installing Conductor: --auto-update (we saw) to keep extension updated
github.com
.

Running commands: conductor:newTrack optionally takes a description as parameter (saves one interactive step)
github.com
.

Possibly flags to run implement in a non-interactive or headless mode if using in scripts (there’s a CLI headless mode for automation
geminicli.com
).

Another “flag” is enabling preview models in settings (if you want to use a preview version of Gemini or increased limits, you toggle general.previewFeatures in settings)
geminicli.com
.

context management flags: There might be ways to limit context usage, like telling Conductor not to include certain large files (maybe via Trusted Folders or ignore lists if you don’t want AI reading some dirs)
geminicli.com
geminicli.com
.

Adaptive extension we discussed is sort of an advanced mode (not a flag but separate extension).

If using Jules: you’d prefix commands with /jules to delegate. That’s an advanced workflow to combine with Conductor if needed (like “/jules implement track 2” would offload that track to Jules agent VM).

Using Conductor/Jules effectively – best practices:

Keep your context files updated. After major changes, update tech-stack.md or workflow.md if something changed (Conductor doesn’t magically know if you decided to switch DB unless you tell it).

Before running implement, sanity-check the plan. It’s easier to correct plan tasks than to fix code after a misguided implementation.

Use small, well-defined tracks. Conductor excels when each track is focused. If you try to implement an entire large project in one track, the plan might be huge and harder to manage. Breaking it into multiple tracks (e.g., “Implement core scraping”, “Implement AI integration”, etc.) like we did in our roadmap is analogous to multiple Conductor tracks. You’d run them sequentially.

Engage with the agent’s output: Conductor will put progress in plan.md – as a dev, you can read those updates. If you see something off mid-run, you can stop (Ctrl+C typically stops Gemini CLI’s agent). Then correct and maybe use /conductor:revert if partial code was applied that you want undone.

Use git alongside Conductor. It’s advisable to commit before running implement, then let Conductor do changes, then diff and commit results. That way any odd changes can be reviewed. Conductor integration with git (for revert) assumes you do have your code in version control.

Utilizing Conductor for Our Project

For the AI-assisted website replicator repo itself (our project), developers can use Conductor to maintain these documentation files and to delegate coding tasks:

We can treat each documentation we wrote (SPECS, PLAN, etc.) as fulfilling what Conductor would have created. In fact, our SPECS.md covers much of product.md and tech-stack.md.

We could run /conductor:setup to see if it generates similar output, adjusting if needed. Then commit those.

As we implement new features (like adding a new site cloning option), do it via /conductor:newTrack and let the AI propose plan and maybe do some coding.

Meanwhile, ensure we align with our policy of speed vs structure: Conductor’s plan might sometimes suggest a more thorough approach (like writing tests) which we might skip for speed. We can always edit the plan to remove tasks that are out-of-scope for an MVP if needed (non-functional tasks).

Branding in Conductor: We might have a product-guidelines.md if we want the AI to stick to a certain writing style or UX principle in code comments or documentation. For now, we just require well-commented prompts; not as critical for code, but if it generates user-facing text, guidelines matter (less relevant here).

To conclude, Conductor and related tools provide a robust framework that closely mirrors what we built manually for our system. Embracing those best practices (formal context, explicit planning, iterative safe implementation) helps ensure our AI agents produce high-quality results consistently and align with the project goals
developers.googleblog.com
developers.googleblog.com
.

By understanding how to configure and harness these tools (like adjusting context, using adaptive model routing, or parallelizing with Jules), we can maintain and scale the project effectively beyond the initial MVP.
