# Implementation Plan: Outlook ChatGPT Email Responder Add-in

**Branch**: `001-outlook-chatgpt-responder` | **Date**: 2026-02-03 | **Spec**: `.specify/spec.md`
**Input**: Feature specification from `.specify/spec.md`

## Summary

Build an Outlook add-in that integrates ChatGPT for AI-powered email response generation. Users configure custom prompts and an API key, then use a ribbon dropdown in compose mode to generate contextual email replies. The add-in supports all Outlook platforms (Desktop, Web, Mobile) with cross-device prompt synchronization via Microsoft Roaming Settings.

**Technical Approach**: Office.js Add-in with React/TypeScript frontend, direct OpenAI API integration, Fluent UI for consistent Microsoft design language, and Office Roaming Settings for cross-device sync.

## Technical Context

**Language/Version**: TypeScript 5.4+ with ES2024 target, Node.js 22+ LTS  
**Primary Dependencies**: Office.js (latest), React 18+, Fluent UI React 9+, OpenAI SDK 4+  
**Storage**: Office.RoamingSettings (prompts, model preference), Office.localStorage (API key - local only)  
**Testing**: Jest 29+, React Testing Library, Playwright for E2E, office-addin-mock for Office.js mocking  
**Target Platform**: Outlook Desktop (Windows/Mac), Outlook Web (OWA), Outlook Mobile (iOS/Android)  
**Project Type**: Office Add-in (single project with taskpane UI)  
**Performance Goals**: <1s add-in load, <200ms UI interactions, <5s AI generation for typical emails  
**Constraints**: <512MB memory, no external servers (direct OpenAI calls), privacy-first (no logging)  
**Scale/Scope**: Individual user add-in, unlimited prompts, 3 UI screens (Settings, Prompt Editor, Progress overlay)

## Constitution Check

_GATE: Must pass before implementation. All items verified against constitution v1.0.0_

| Principle            | Requirement                                                 | Plan Compliance                                         |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| I. Code Quality      | TypeScript strict, SOLID, 50-line functions, 300-line files | ✅ TypeScript strict mode, component-based architecture |
| II. Latest Versions  | Node 22+, npm 10+, ES2024+, latest packages                 | ✅ All dependencies pinned to latest stable             |
| III. Testing         | 80% coverage, TDD, unit/integration/E2E, mocking            | ✅ Jest + RTL + Playwright, office-addin-mock           |
| IV. UX Consistency   | Loading states, error messages, confirmations               | ✅ Progress bar, Retry buttons, delete confirmations    |
| V. Performance       | <200ms UI, <3s startup, async patterns                      | ✅ React lazy loading, async/await throughout           |
| Security             | No secrets in code, input validation, HTTPS                 | ✅ API key in localStorage, validation, TLS only        |
| Development Workflow | PR-based, CI/CD, linting, pre-commit                        | ✅ GitHub Actions, ESLint, Prettier, Husky              |

## Project Structure

### Documentation (this feature)

```text
.specify/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── tasks.md             # Phase 2 output (/speckit.tasks command)
└── memory/
    └── constitution.md  # Project principles
```

### Source Code (repository root)

```text
src/
├── taskpane/                    # Main add-in UI
│   ├── components/              # React components
│   │   ├── common/              # Shared UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── settings/            # Settings screen
│   │   │   ├── SettingsPanel.tsx
│   │   │   ├── ApiKeyInput.tsx
│   │   │   ├── ModelSelector.tsx
│   │   │   ├── KeyboardShortcuts.tsx
│   │   │   └── ExportImport.tsx
│   │   ├── prompts/             # Prompt management
│   │   │   ├── PromptEditor.tsx
│   │   │   ├── PromptList.tsx
│   │   │   └── PromptDropdown.tsx
│   │   └── generation/          # AI generation UI
│   │       ├── GenerationProgress.tsx
│   │       ├── ErrorBanner.tsx
│   │       └── GenerationOverlay.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useSettings.ts
│   │   ├── usePrompts.ts
│   │   ├── useGeneration.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── App.tsx                  # Main app component
│   └── index.tsx                # Entry point
├── commands/                    # Ribbon command handlers
│   ├── commands.ts              # Command entry points
│   └── commandHandlers.ts       # Business logic for commands
├── services/                    # Core business logic
│   ├── openai/                  # OpenAI integration
│   │   ├── OpenAIClient.ts      # API client wrapper
│   │   ├── TokenCounter.ts      # Token limit management
│   │   └── ContentSummarizer.ts # Thread summarization
│   ├── storage/                 # Data persistence
│   │   ├── SettingsStorage.ts   # API key, model, shortcuts
│   │   ├── PromptStorage.ts     # Prompt CRUD with sync
│   │   └── RoamingSync.ts       # Cross-device sync logic
│   ├── email/                   # Email content handling
│   │   ├── EmailParser.ts       # Extract thread content
│   │   ├── SignatureDetector.ts # Find signature position
│   │   └── ContentInserter.ts   # Insert generated response
│   └── validation/              # Input validation
│       ├── ApiKeyValidator.ts
│       └── PromptValidator.ts
├── models/                      # TypeScript interfaces
│   ├── Prompt.ts
│   ├── Settings.ts
│   ├── GenerationRequest.ts
│   └── GenerationResponse.ts
├── utils/                       # Utility functions
│   ├── clipboard.ts
│   ├── localization.ts
│   └── errorMessages.ts
└── locales/                     # i18n translations
    ├── en.json
    ├── de.json
    ├── fr.json
    ├── es.json
    └── index.ts

tests/
├── unit/                        # Unit tests
│   ├── services/
│   │   ├── OpenAIClient.test.ts
│   │   ├── TokenCounter.test.ts
│   │   ├── PromptStorage.test.ts
│   │   └── EmailParser.test.ts
│   ├── components/
│   │   ├── SettingsPanel.test.tsx
│   │   ├── PromptEditor.test.tsx
│   │   └── GenerationProgress.test.tsx
│   └── validation/
│       ├── ApiKeyValidator.test.ts
│       └── PromptValidator.test.ts
├── integration/                 # Integration tests
│   ├── storage.integration.test.ts
│   ├── openai.integration.test.ts
│   └── sync.integration.test.ts
└── e2e/                         # End-to-end tests
    ├── settings.e2e.test.ts
    ├── prompts.e2e.test.ts
    └── generation.e2e.test.ts

manifest/                        # Office Add-in manifests
├── manifest.xml                 # Production manifest
└── manifest.dev.xml             # Development manifest

config/                          # Build configuration
├── webpack.config.js
├── jest.config.js
├── playwright.config.ts
└── tsconfig.json

.github/
└── workflows/
    ├── ci.yml                   # Lint, test, build
    └── release.yml              # Publish to AppSource
```

**Structure Decision**: Single Office Add-in project with React taskpane. Commands handle ribbon interactions, services contain business logic, components provide UI. Separation of concerns follows SOLID principles per constitution.

## Implementation Phases

### Phase 1: Project Setup & Core Infrastructure

- Initialize Office Add-in project with Yeoman generator (yo office)
- Configure TypeScript strict mode, ESLint, Prettier
- Set up Jest, React Testing Library, Playwright
- Configure Webpack for Office.js compatibility
- Create manifest with ribbon buttons for main screen and compose mode
- Set up GitHub Actions CI/CD pipeline
- Implement base component library (Button, Input, Dropdown)

### Phase 2: Storage & Data Layer

- Implement Settings model and SettingsStorage service
- Implement Prompt model and PromptStorage service
- Implement RoamingSync for cross-device prompt synchronization
- Implement ApiKeyValidator with format validation
- Implement PromptValidator with uniqueness check
- Write unit tests for all storage and validation (80%+ coverage)

### Phase 3: Settings Screen

- Build SettingsPanel component with Fluent UI
- Implement ApiKeyInput with masking and Test Connection
- Implement ModelSelector dropdown (GPT-5 default)
- Implement KeyboardShortcuts configuration
- Implement ExportImport (clipboard JSON)
- Implement Reset All Data with confirmation
- Write component tests and integration tests

### Phase 4: Prompt Management

- Build PromptEditor component (title, content, validation)
- Build PromptList/PromptDropdown for alphabetical display
- Implement Save, Delete (with confirmation), Cancel flows
- Handle duplicate title blocking
- Write component and integration tests

### Phase 5: OpenAI Integration

- Implement OpenAIClient with direct API calls
- Implement TokenCounter for context window management
- Implement ContentSummarizer for long threads
- Handle all error types (auth, rate limit, content policy)
- Write unit tests with mocked API responses

### Phase 6: Email Compose Integration

- Implement EmailParser to extract thread content
- Implement SignatureDetector for insertion positioning
- Implement ContentInserter for response placement
- Build GenerationProgress overlay with cancel support
- Build ErrorBanner with Retry functionality
- Integrate with compose mode ribbon command
- Write E2E tests for generation flow

### Phase 7: Localization & Polish

- Implement localization system with Outlook locale detection
- Add translations for supported languages
- Ensure Ctrl+Z undo works correctly
- Performance optimization and memory profiling
- Cross-platform testing (Desktop, Web, Mobile)

### Phase 8: Release Preparation

- Final test coverage verification (80%+ requirement)
- Security audit (API key handling, no logging)
- Documentation (README, CHANGELOG)
- AppSource submission preparation

## Key Technical Decisions

| Decision         | Choice                  | Rationale                                           |
| ---------------- | ----------------------- | --------------------------------------------------- |
| UI Framework     | React 18 + Fluent UI 9  | Microsoft design consistency, modern React features |
| State Management | React hooks + context   | Simple app, no need for Redux complexity            |
| API Client       | OpenAI SDK 4+           | Official SDK, TypeScript support, streaming ready   |
| Storage          | Office.RoamingSettings  | Built-in cross-device sync, no external server      |
| Local Storage    | Office.localStorage     | Secure local-only storage for API key               |
| Testing          | Jest + RTL + Playwright | Industry standard, good Office.js mock support      |
| Build            | Webpack 5               | Required for Office Add-in compatibility            |
| Token Counting   | tiktoken-js             | Accurate GPT token counting for summarization       |

## Risk Mitigation

| Risk                                       | Impact                            | Mitigation                                           |
| ------------------------------------------ | --------------------------------- | ---------------------------------------------------- |
| Roaming Settings quota exceeded            | Prompts don't sync                | Implement prompt size limits, warn on quota approach |
| Office.js API differences across platforms | Features broken on some platforms | E2E tests on all platforms, feature detection        |
| OpenAI API changes                         | Generation breaks                 | Version pin SDK, integration tests, error handling   |
| Long email threads exceed token limits     | Poor summarization                | Quality summarization algorithm, user notification   |

## Complexity Tracking

> No constitution violations identified. All requirements achievable within guidelines.

| Aspect                 | Complexity | Justification                                                    |
| ---------------------- | ---------- | ---------------------------------------------------------------- |
| Cross-platform support | Medium     | Office.js abstracts most differences; E2E testing required       |
| Token management       | Medium     | tiktoken-js library handles counting; summarization logic needed |
| Signature detection    | Low-Medium | Heuristic-based detection; may need refinement                   |
| Roaming sync           | Low        | Office.RoamingSettings handles sync; last-write-wins is simple   |

## Dependencies to Install

```json
{
  "dependencies": {
    "@fluentui/react-components": "^9.x",
    "@microsoft/office-js": "^1.x",
    "openai": "^4.x",
    "tiktoken": "^1.x",
    "react": "^18.x",
    "react-dom": "^18.x"
  },
  "devDependencies": {
    "@testing-library/react": "^14.x",
    "@playwright/test": "^1.x",
    "jest": "^29.x",
    "typescript": "^5.4.x",
    "eslint": "^9.x",
    "prettier": "^3.x",
    "husky": "^9.x",
    "office-addin-mock": "^2.x",
    "webpack": "^5.x"
  }
}
```

## Next Steps

Run `/speckit.tasks` to generate detailed implementation tasks from this plan.
