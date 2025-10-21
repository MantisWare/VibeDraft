# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/vibedraft.plan` command. See `.vibedraft/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. If VibeDraft detected an existing technology stack during initialization,
  many of these values should be available in the constitution's Technology Stack section.
  
  Reference: Check `.vibedraft/memory/constitution.md` for detected tech stack details.
-->

**Language/Version**: [from constitution or NEEDS CLARIFICATION, e.g., TypeScript 5.x, Python 3.11, Swift 5.9]  
**Primary Framework**: [from constitution or NEEDS CLARIFICATION, e.g., React 18.x, Next.js 14.x, Express 4.x]  
**Build Tool**: [from constitution or NEEDS CLARIFICATION, e.g., Vite, Webpack, esbuild]  
**Primary Dependencies**: [from constitution or list key dependencies, or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, MongoDB, CoreData, files or N/A]  
**Testing Framework**: [from constitution or NEEDS CLARIFICATION, e.g., Jest, Vitest, pytest]  
**Target Platform**: [from constitution or NEEDS CLARIFICATION, e.g., Web browser, Node.js server, iOS 15+]  
**Project Type**: [from constitution, e.g., web-app, fullstack, monorepo, library, cli]  
**Package Manager**: [from constitution or NEEDS CLARIFICATION, e.g., npm, yarn, pnpm]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, <100ms API response, 60 fps UI or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific or from constitution, e.g., <200ms p95, browser support, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, enterprise scale, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/vibedraft.plan command output)
├── research.md          # Phase 0 output (/vibedraft.plan command)
├── data-model.md        # Phase 1 output (/vibedraft.plan command)
├── quickstart.md        # Phase 1 output (/vibedraft.plan command)
├── contracts/           # Phase 1 output (/vibedraft.plan command)
└── tasks.md             # Phase 2 output (/vibedraft.tasks command - NOT created by /vibedraft.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
