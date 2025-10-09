---
description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## 📊 Phase Progress Overview

| Phase | Name | Status | Tasks | Completed | Progress |
|-------|------|--------|-------|-----------|----------|
| 1 | Setup | 🔴 Not Started | 3 | 0 | ░░░░░░░░░░ 0% |
| 2 | Foundational | 🔴 Not Started | 6 | 0 | ░░░░░░░░░░ 0% |
| 3 | User Story 1 - [Title] 🎯 MVP | 🔴 Not Started | 7 | 0 | ░░░░░░░░░░ 0% |
| 4 | User Story 2 - [Title] | 🔴 Not Started | 6 | 0 | ░░░░░░░░░░ 0% |
| 5 | User Story 3 - [Title] | 🔴 Not Started | 5 | 0 | ░░░░░░░░░░ 0% |
| N | Polish & Cross-Cutting | 🔴 Not Started | 6 | 0 | ░░░░░░░░░░ 0% |

**Legend**: 🔴 Not Started | 🟡 In Progress | 🟢 Complete

**Update this table** as you complete tasks. Status transitions:
- 🔴 → 🟡 when first task in phase starts
- 🟡 → 🟢 when all tasks in phase complete

**Progress bars**: Use █ for completed 10% blocks, ░ for remaining

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /vibedraft.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure  
**Status**: 🔴 Not Started  
**Progress**: 0/3 tasks complete (0%)

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

**Phase Checkpoint**: ✅ When all tasks complete, update status to 🟢 Complete and update overview table

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented  
**Status**: 🔴 Not Started  
**Progress**: 0/6 tasks complete (0%)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Setup database schema and migrations framework
- [ ] T005 [P] Implement authentication/authorization framework
- [ ] T006 [P] Setup API routing and middleware structure
- [ ] T007 Create base models/entities that all stories depend on
- [ ] T008 Configure error handling and logging infrastructure
- [ ] T009 Setup environment configuration management

**Phase Checkpoint**: ✅ When all tasks complete, update status to 🟢 Complete and update overview table  
**Critical Milestone**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]  
**Status**: 🔴 Not Started  
**Progress**: 0/7 tasks complete (0%)

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T011 [P] [US1] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create [Entity1] model in src/models/[entity1].py
- [ ] T013 [P] [US1] Create [Entity2] model in src/models/[entity2].py
- [ ] T014 [US1] Implement [Service] in src/services/[service].py (depends on T012, T013)
- [ ] T015 [US1] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T016 [US1] Add validation and error handling
- [ ] T017 [US1] Add logging for user story 1 operations

**Phase Checkpoint**: ✅ When all tasks complete, update status to 🟢 Complete and update overview table  
**Story Validation**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]  
**Status**: 🔴 Not Started  
**Progress**: 0/6 tasks complete (0%)

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T018 [P] [US2] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T019 [P] [US2] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create [Entity] model in src/models/[entity].py
- [ ] T021 [US2] Implement [Service] in src/services/[service].py
- [ ] T022 [US2] Implement [endpoint/feature] in src/[location]/[file].py
- [ ] T023 [US2] Integrate with User Story 1 components (if needed)

**Phase Checkpoint**: ✅ When all tasks complete, update status to 🟢 Complete and update overview table  
**Story Validation**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]  
**Status**: 🔴 Not Started  
**Progress**: 0/5 tasks complete (0%)

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T024 [P] [US3] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T025 [P] [US3] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 3

- [ ] T026 [P] [US3] Create [Entity] model in src/models/[entity].py
- [ ] T027 [US3] Implement [Service] in src/services/[service].py
- [ ] T028 [US3] Implement [endpoint/feature] in src/[location]/[file].py

**Phase Checkpoint**: ✅ When all tasks complete, update status to 🟢 Complete and update overview table  
**Story Validation**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories  
**Status**: 🔴 Not Started  
**Progress**: 0/6 tasks complete (0%)

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

**Phase Checkpoint**: ✅ When all tasks complete, update status to 🟢 Complete and update overview table  
**Final Milestone**: Feature is production-ready and fully polished

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## 📝 Phase Progress Tracking Guide

### How to Update Phase Status

As you complete tasks, keep both the **Phase Progress Overview** table and individual phase headers up to date:

#### When Starting a Phase:
1. Update phase status from 🔴 to 🟡 in overview table
2. Update phase header status from 🔴 to 🟡

#### When Completing Tasks:
1. Check off the task checkbox: `- [x] T001 ...`
2. Update phase progress: `**Progress**: 1/3 tasks complete (33%)`
3. Update overview table completed count and progress bar
   - Progress bars: Each █ = 10% complete, ░ = incomplete
   - Example: 33% = `███░░░░░░░ 33%`

#### When Completing a Phase:
1. Update phase status from 🟡 to 🟢 in overview table
2. Update phase header status from 🟡 to 🟢
3. Update progress to show 100%: `███████████ 100%`
4. Validate phase checkpoint criteria before moving to next phase

### Progress Bar Examples:

```
  0% = ░░░░░░░░░░ 0%
 10% = █░░░░░░░░░ 10%
 25% = ██░░░░░░░░ 25%
 50% = █████░░░░░ 50%
 75% = ███████░░░ 75%
100% = ██████████ 100%
```

### Phase Completion Checklist:

**Phase 1 (Setup)**: ✅ Project structure exists, dependencies installed, tools configured  
**Phase 2 (Foundational)**: ✅ Database ready, auth framework working, core infrastructure testable  
**Phase 3+ (User Stories)**: ✅ Story independently tested and validated per acceptance criteria  
**Phase N (Polish)**: ✅ Documentation complete, code clean, performance acceptable

---

## 🎯 Quick Reference: Phase Status Indicators

| Indicator | Meaning | When to Use |
|-----------|---------|-------------|
| 🔴 Not Started | No tasks begun | Initial state, haven't started phase work |
| 🟡 In Progress | Some tasks complete, some remaining | First task started, not all complete |
| 🟢 Complete | All tasks done, checkpoint validated | All tasks checked, validation passed |

**Remember**: Update the overview table at the top whenever you update an individual phase!


