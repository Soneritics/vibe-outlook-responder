# Tasks: Outlook ChatGPT Email Responder Add-in

**Input**: Design documents from `.specify/`
**Prerequisites**: plan.md (required), spec.md (required)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5, or INFRA for infrastructure)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and base structure

- [X] T001 [INFRA] Initialize Office Add-in project with `yo office` generator (React + TypeScript template)
- [X] T002 [INFRA] Configure TypeScript strict mode in `tsconfig.json` with ES2024 target
- [X] T003 [P] [INFRA] Configure ESLint 9+ with TypeScript rules in `eslint.config.js`
- [X] T004 [P] [INFRA] Configure Prettier 3+ in `.prettierrc`
- [X] T005 [P] [INFRA] Set up Husky 9+ pre-commit hooks in `.husky/`
- [X] T006 [INFRA] Configure Jest 29+ with React Testing Library in `config/jest.config.js`
- [X] T007 [P] [INFRA] Configure Playwright for E2E tests in `config/playwright.config.ts`
- [X] T008 [INFRA] Set up GitHub Actions CI workflow in `.github/workflows/ci.yml` (lint, test, build)
- [X] T009 [INFRA] Configure Webpack 5 for Office.js compatibility in `config/webpack.config.js`
- [X] T010 [INFRA] Update `manifest/manifest.xml` with ribbon buttons for main screen and compose mode
- [X] T011 [INFRA] Install production dependencies: `@fluentui/react-components`, `openai`, `tiktoken`, `react`, `react-dom`
- [X] T012 [INFRA] Install dev dependencies: `@testing-library/react`, `@playwright/test`, `jest`, `office-addin-mock`

**Checkpoint**: Project builds, lints, and runs empty add-in in Outlook

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models, services, and shared components that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Models

- [X] T013 [P] [INFRA] Create `Prompt` interface in `src/models/Prompt.ts` (id, title, content, createdAt, updatedAt)
- [X] T014 [P] [INFRA] Create `Settings` interface in `src/models/Settings.ts` (apiKey, selectedModel, keyboardShortcuts, lastUpdated)
- [X] T015 [P] [INFRA] Create `GenerationRequest` interface in `src/models/GenerationRequest.ts` (emailContent, promptContent, timestamp)
- [X] T016 [P] [INFRA] Create `GenerationResponse` interface in `src/models/GenerationResponse.ts` (generatedText, tokensUsed, responseTime)

### Shared UI Components

- [X] T017 [P] [INFRA] Create `Button` component in `src/taskpane/components/common/Button.tsx` using Fluent UI
- [X] T018 [P] [INFRA] Create `Input` component in `src/taskpane/components/common/Input.tsx` with validation support
- [X] T019 [P] [INFRA] Create `Dropdown` component in `src/taskpane/components/common/Dropdown.tsx`
- [X] T020 [P] [INFRA] Create `ProgressBar` component in `src/taskpane/components/common/ProgressBar.tsx` with steps support
- [X] T021 [P] [INFRA] Create `ConfirmDialog` component in `src/taskpane/components/common/ConfirmDialog.tsx`

### Utility Functions

- [X] T022 [P] [INFRA] Create clipboard utilities in `src/utils/clipboard.ts` (copy/paste JSON)
- [X] T023 [P] [INFRA] Create error message constants in `src/utils/errorMessages.ts`
- [X] T024 [P] [INFRA] Create localization setup in `src/utils/localization.ts` with Outlook locale detection
- [X] T025 [P] [INFRA] Create English translations in `src/locales/en.json`

### Validation Services

- [X] T026 [P] [INFRA] Implement `ApiKeyValidator` in `src/services/validation/ApiKeyValidator.ts` (format: sk-\*, length check)
- [X] T027 [P] [INFRA] Implement `PromptValidator` in `src/services/validation/PromptValidator.ts` (empty check, length limits, uniqueness)

### Unit Tests for Foundation

- [X] T028 [P] [INFRA] Write unit tests for `ApiKeyValidator` in `tests/unit/validation/ApiKeyValidator.test.ts`
- [X] T029 [P] [INFRA] Write unit tests for `PromptValidator` in `tests/unit/validation/PromptValidator.test.ts`
- [X] T030 [P] [INFRA] Write unit tests for common components in `tests/unit/components/common/`

**Checkpoint**: Foundation ready - all models, shared components, and validation in place

---

## Phase 3: User Story 1 - Configure ChatGPT API Key (Priority: P1) 🎯 MVP

**Goal**: Users can configure and persist their ChatGPT API key with validation and test connection

**Independent Test**: Open Settings → Enter API key → Save → Restart Outlook → Verify key persists (masked)

### Tests for User Story 1

- [X] T031 [P] [US1] Write unit tests for `SettingsStorage` in `tests/unit/services/SettingsStorage.test.ts`
- [X] T032 [P] [US1] Write component tests for `ApiKeyInput` in `tests/unit/components/settings/ApiKeyInput.test.tsx`
- [X] T033 [P] [US1] Write component tests for `ModelSelector` in `tests/unit/components/settings/ModelSelector.test.tsx`
- [X] T034 [US1] Write integration test for settings persistence in `tests/integration/storage.integration.test.ts`

### Implementation for User Story 1

- [X] T035 [US1] Implement `SettingsStorage` in `src/services/storage/SettingsStorage.ts` (localStorage for API key, roaming for model)
- [X] T036 [US1] Implement `useSettings` hook in `src/taskpane/hooks/useSettings.ts`
- [X] T037 [P] [US1] Create `ApiKeyInput` component in `src/taskpane/components/settings/ApiKeyInput.tsx` (masked display, validation)
- [X] T038 [P] [US1] Create `ModelSelector` component in `src/taskpane/components/settings/ModelSelector.tsx` (GPT-5 default)
- [X] T039 [US1] Implement Test Connection button in `ApiKeyInput.tsx` (calls OpenAI API with minimal request)
- [X] T040 [US1] Create `SettingsPanel` component in `src/taskpane/components/settings/SettingsPanel.tsx` (container for all settings)
- [X] T041 [US1] Wire Settings command in `src/commands/commandHandlers.ts` to open SettingsPanel
- [X] T042 [US1] Update `manifest/manifest.xml` with Settings menu item in main screen dropdown

**Checkpoint**: User Story 1 complete - API key can be saved, masked, validated, and tested

---

## Phase 4: User Story 2 - Create Custom Prompt (Priority: P1) 🎯 MVP

**Goal**: Users can create and save custom prompts that appear in dropdowns

**Independent Test**: Click "Add Custom Prompt" → Enter title/content → Save → Verify appears in dropdown (alphabetically)

### Tests for User Story 2

- [X] T043 [P] [US2] Write unit tests for `PromptStorage` in `tests/unit/services/PromptStorage.test.ts`
- [X] T044 [P] [US2] Write unit tests for `RoamingSync` in `tests/unit/services/RoamingSync.test.ts`
- [X] T045 [P] [US2] Write component tests for `PromptEditor` in `tests/unit/components/prompts/PromptEditor.test.tsx`
- [X] T046 [US2] Write integration test for prompt sync in `tests/integration/sync.integration.test.ts`

### Implementation for User Story 2

- [X] T047 [US2] Implement `RoamingSync` in `src/services/storage/RoamingSync.ts` (Office.RoamingSettings wrapper, last-write-wins for sync conflicts per FR-032b)
- [X] T048 [US2] Implement `PromptStorage` in `src/services/storage/PromptStorage.ts` (CRUD with roaming sync)
- [X] T049 [US2] Implement `usePrompts` hook in `src/taskpane/hooks/usePrompts.ts`
- [X] T050 [US2] Create `PromptEditor` component in `src/taskpane/components/prompts/PromptEditor.tsx` (title 100 chars, content 10k chars)
- [X] T051 [US2] Implement Save functionality with unique title validation in `PromptEditor.tsx`
- [X] T052 [US2] Create `PromptDropdown` component in `src/taskpane/components/prompts/PromptDropdown.tsx` (alphabetical sort)
- [X] T053 [US2] Wire "Add Custom Prompt" command in `src/commands/commandHandlers.ts`
- [X] T054 [US2] Update main screen dropdown in manifest to show prompts + "Add Custom Prompt" + separator + "Settings"

**Checkpoint**: User Story 2 complete - Prompts can be created, saved, and appear in dropdowns

---

## Phase 5: User Story 3 - Edit Existing Prompt (Priority: P2)

**Goal**: Users can edit and delete existing prompts with confirmation

**Independent Test**: Click existing prompt in main dropdown → Modify → Save → Verify changes persist; Delete → Confirm → Verify removed

### Tests for User Story 3

- [X] T055 [P] [US3] Write component tests for edit mode in `tests/unit/components/prompts/PromptEditor.edit.test.tsx`
- [X] T056 [US3] Write E2E test for edit/delete flow in `tests/e2e/prompts.e2e.test.ts`

### Implementation for User Story 3

- [X] T057 [US3] Add edit mode to `PromptEditor.tsx` (pre-fill title/content, show Delete button)
- [X] T058 [US3] Implement Delete with confirmation dialog in `PromptEditor.tsx`
- [X] T059 [US3] Update prompt in `PromptStorage.ts` with updatedAt timestamp
- [X] T060 [US3] Wire main screen dropdown prompt click to open editor in edit mode

**Checkpoint**: User Story 3 complete - Prompts can be edited and deleted

---

## Phase 6: User Story 4 - Generate AI Response in Email Compose (Priority: P1) 🎯 MVP

**Goal**: Users can generate AI responses in compose mode that insert above existing content

**Independent Test**: Open Reply → Select prompt from dropdown → Verify AI response inserted at top (above signature)

### Tests for User Story 4

- [X] T061 [P] [US4] Write unit tests for `OpenAIClient` in `tests/unit/services/OpenAIClient.test.ts`
- [X] T062 [P] [US4] Write unit tests for `TokenCounter` in `tests/unit/services/TokenCounter.test.ts`
- [X] T063 [P] [US4] Write unit tests for `ContentSummarizer` in `tests/unit/services/ContentSummarizer.test.ts`
- [X] T064 [P] [US4] Write unit tests for `EmailParser` in `tests/unit/services/EmailParser.test.ts`
- [X] T065 [P] [US4] Write unit tests for `SignatureDetector` in `tests/unit/services/SignatureDetector.test.ts`
- [X] T066 [P] [US4] Write unit tests for `ContentInserter` in `tests/unit/services/ContentInserter.test.ts`
- [X] T067 [P] [US4] Write component tests for `GenerationProgress` in `tests/unit/components/generation/GenerationProgress.test.tsx`
- [X] T068 [US4] Write integration test for OpenAI API in `tests/integration/openai.integration.test.ts`
- [X] T069 [US4] Write E2E test for generation flow in `tests/e2e/generation.e2e.test.ts`

### Implementation for User Story 4

- [X] T070 [US4] Implement `OpenAIClient` in `src/services/openai/OpenAIClient.ts` (direct API calls, no system prompt wrapping, no timeout per FR-029c)
- [X] T071 [US4] Implement `TokenCounter` in `src/services/openai/TokenCounter.ts` (using tiktoken)
- [X] T072 [US4] Implement `ContentSummarizer` in `src/services/openai/ContentSummarizer.ts` (auto-summarize long threads)
- [X] T073 [US4] Implement `EmailParser` in `src/services/email/EmailParser.ts` (extract thread content, preserve HTML)
- [X] T074 [US4] Implement `SignatureDetector` in `src/services/email/SignatureDetector.ts` (heuristic detection)
- [X] T075 [US4] Implement `ContentInserter` in `src/services/email/ContentInserter.ts` (insert above signature, support undo)
- [X] T076 [US4] Create `GenerationProgress` component in `src/taskpane/components/generation/GenerationProgress.tsx` (Preparing → Sending → Generating → Done + Cancel)
- [X] T077 [US4] Create `GenerationOverlay` component in `src/taskpane/components/generation/GenerationOverlay.tsx`
- [X] T078 [US4] Implement `useGeneration` hook in `src/taskpane/hooks/useGeneration.ts` (orchestrates generation flow)
- [X] T079 [US4] Wire compose mode dropdown in `src/commands/commandHandlers.ts` to trigger generation
- [X] T080 [US4] Update `manifest/manifest.xml` with compose mode ribbon button and dropdown
- [X] T081 [US4] Implement cancel functionality in `useGeneration.ts` (AbortController)
- [X] T082 [US4] Handle "no email content" case with user-friendly message
- [X] T083 [US4] Support multiple generations (each inserts above previous)

**Checkpoint**: User Story 4 complete - AI responses generate and insert correctly in compose mode

---

## Phase 7: User Story 5 - Handle API Errors Gracefully (Priority: P2)

**Goal**: Users see helpful error messages with retry options for all error scenarios

**Independent Test**: Configure invalid API key → Try to generate → Verify friendly error + Retry button

### Tests for User Story 5

- [X] T084 [P] [US5] Write unit tests for error handling in `tests/unit/services/OpenAIClient.errors.test.ts`
- [X] T085 [P] [US5] Write component tests for `ErrorBanner` in `tests/unit/components/generation/ErrorBanner.test.tsx`

### Implementation for User Story 5

- [X] T086 [US5] Create `ErrorBanner` component in `src/taskpane/components/generation/ErrorBanner.tsx` (message + Retry button)
- [X] T087 [US5] Handle invalid/expired API key error with "check settings" message
- [X] T088 [US5] Handle API unavailable error with "temporarily unavailable" message
- [X] T089 [US5] Handle no API key configured with "configure in settings" message
- [X] T090 [US5] Handle rate limit exceeded with "wait and try again" message
- [X] T091 [US5] Handle content policy violations with OpenAI's error message display
- [X] T092 [US5] Implement Retry button functionality in `ErrorBanner.tsx`

**Checkpoint**: User Story 5 complete - All API errors show user-friendly messages with retry

---

## Phase 8: Additional Features (From Clarified Requirements)

**Purpose**: Features beyond core user stories that were specified in clarifications

### Keyboard Shortcuts

- [X] T093 [P] [FEAT] Create `KeyboardShortcuts` component in `src/taskpane/components/settings/KeyboardShortcuts.tsx`
- [X] T094 [FEAT] Implement `useKeyboardShortcuts` hook in `src/taskpane/hooks/useKeyboardShortcuts.ts`
- [X] T095 [FEAT] Store keyboard shortcuts in `SettingsStorage.ts`

### Export/Import Prompts

- [X] T096 [P] [FEAT] Create `ExportImport` component in `src/taskpane/components/settings/ExportImport.tsx`
- [X] T097 [FEAT] Implement export to clipboard as JSON in `ExportImport.tsx`
- [X] T098 [FEAT] Implement import from clipboard with duplicate handling (append "(imported)")
- [X] T099 [FEAT] Write unit tests for export/import in `tests/unit/components/settings/ExportImport.test.tsx`

### Reset All Data

- [X] T100 [FEAT] Add "Reset All Data" button to `SettingsPanel.tsx` with confirmation dialog
- [X] T101 [FEAT] Implement reset functionality in `SettingsStorage.ts` and `PromptStorage.ts`

### Token Limit Notification

- [X] T102 [FEAT] Add user notification when content summarization occurs in `GenerationProgress.tsx`

**Checkpoint**: Additional features complete

---

## Phase 9: Localization

**Purpose**: Multi-language support based on Outlook locale

- [X] T103 [P] [L10N] Create German translations in `src/locales/de.json`
- [X] T104 [P] [L10N] Create French translations in `src/locales/fr.json`
- [X] T105 [P] [L10N] Create Spanish translations in `src/locales/es.json`
- [X] T106 [L10N] Create locale index in `src/locales/index.ts`
- [X] T107 [L10N] Integrate localization into all components
- [X] T108 [L10N] Write tests for locale detection in `tests/unit/utils/localization.test.ts`

**Checkpoint**: UI displays correctly in all supported locales

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, performance, and release preparation

### Documentation

- [X] T109 [P] [POLISH] Update `README.md` with installation and usage instructions
- [X] T110 [P] [POLISH] Create `CHANGELOG.md` with version 1.0.0 entry
- [X] T111 [P] [POLISH] Add inline code documentation for public APIs

### Performance & Quality

- [X] T112 [POLISH] Implement React lazy loading for taskpane components
- [X] T113 [POLISH] Memory profiling and leak detection
- [X] T114 [POLISH] Verify <1s add-in load time
- [X] T115 [POLISH] Verify <200ms UI interaction response

### Security

- [X] T116 [POLISH] Security audit: verify no API key logging
- [X] T117 [POLISH] Security audit: verify direct OpenAI calls only (no intermediary)
- [X] T118 [POLISH] Run `npm audit` and fix vulnerabilities

### Testing Coverage

- [X] T119 [POLISH] Verify 80%+ code coverage across all tests
- [X] T120 [POLISH] Cross-platform E2E tests on Outlook Desktop (Windows)
- [X] T121 [POLISH] Cross-platform E2E tests on Outlook Web
- [X] T122 [POLISH] Cross-platform E2E tests on Outlook Mobile (if applicable)

### Release

- [X] T123 [POLISH] Create production manifest in `manifest/manifest.xml`
- [X] T124 [POLISH] Set up GitHub Actions release workflow in `.github/workflows/release.yml`
- [X] T125 [POLISH] Prepare AppSource submission assets (icons, descriptions)

**Checkpoint**: Release-ready with full test coverage and documentation

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────────────┐
                                                              │
Phase 2 (Foundational) ◄─────────────────────────────────────┘
         │
         ├──► Phase 3 (US1: API Key) ────────┐
         │                                    │
         ├──► Phase 4 (US2: Create Prompt) ──┼──► Phase 5 (US3: Edit Prompt)
         │                                    │
         └──► Phase 6 (US4: Generation) ─────┼──► Phase 7 (US5: Errors)
                                              │
Phase 8 (Additional Features) ◄──────────────┘
         │
Phase 9 (Localization) ◄─────────────────────┘
         │
Phase 10 (Polish) ◄──────────────────────────┘
```

### User Story Dependencies

| Story               | Depends On                 | Can Parallel With |
| ------------------- | -------------------------- | ----------------- |
| US1 (API Key)       | Phase 2                    | US2, US4          |
| US2 (Create Prompt) | Phase 2                    | US1, US4          |
| US3 (Edit Prompt)   | US2                        | US5               |
| US4 (Generation)    | Phase 2, US1 (for API key) | US2               |
| US5 (Errors)        | US4                        | US3               |

### Parallel Opportunities

**Phase 2 - All models and components in parallel:**

```
T013, T014, T015, T016 (Models) ─── Run together
T017, T018, T019, T020, T021 (Components) ─── Run together
T022, T023, T024, T025 (Utils) ─── Run together
T026, T027, T028, T029, T030 (Validation) ─── Run together
```

**Phase 6 - Service implementations in parallel:**

```
T061-T067 (Tests) ─── Run together
T070, T071, T072 (OpenAI services) ─── Run together
T073, T074, T075 (Email services) ─── Run together
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (API Key) ─ **VALIDATE**
4. Complete Phase 4: User Story 2 (Create Prompt) ─ **VALIDATE**
5. Complete Phase 6: User Story 4 (Generation) ─ **MVP COMPLETE**
6. Deploy/demo basic functionality

### Full Feature Set

7. Complete Phase 5: User Story 3 (Edit Prompt)
8. Complete Phase 7: User Story 5 (Error Handling)
9. Complete Phase 8: Additional Features
10. Complete Phase 9: Localization
11. Complete Phase 10: Polish & Release

---

## Notes

- **[P]** = Can run in parallel with other [P] tasks in same phase
- **[US#]** = Maps task to User Story for traceability
- **[INFRA]** = Infrastructure/foundational task
- **[FEAT]** = Additional feature from clarified requirements
- **[L10N]** = Localization task
- **[POLISH]** = Final quality and release preparation
- Commit after each task or logical group
- Constitution requires: 80% coverage, <50 line functions, <300 line files
- All external API calls must be mocked in tests
