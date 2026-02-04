# Feature Specification: Outlook ChatGPT Email Responder Add-in

**Feature Branch**: `001-outlook-chatgpt-responder`  
**Created**: 2026-02-03  
**Status**: Complete  
**Input**: User description: "An Outlook add-in that uses ChatGPT to respond to emails with user-configured prompts"

## Clarified Requirements

| Decision                | Choice                                                               |
| ----------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Target Platforms        | All platforms: Desktop (Windows/Mac), Web (OWA), and Mobile          |
| ChatGPT Model           | User-selectable in Settings, defaults to GPT-5                       |
| Response Placement      | Insert above user's existing content                                 |
| Prompt Limit            | No limit on number of prompts                                        |
| Email Format            | Preserve HTML formatting from original email                         |
| Prompt Sync             | Sync across devices using Microsoft account                          |
| Language Support        | Multiple languages based on user's Outlook locale                    |
| Thread Context          | Include entire email thread for context                              |
| Token Limit Handling    | Automatically summarize older messages to fit within limits          |
| Prompt Display Order    | Alphabetically by title                                              |
| Delete Confirmation     | Simple confirmation dialog                                           |
| First-Time Use          | Allow creating prompts before API key is set; block generation only  |
| Prompt Field Limits     | Title: 100 chars, Content: 10,000 chars                              |
| Manage Prompts Screen   | Side panel opens from                                                | List of prompts with click-to-edit + Add New button (Recommended) |
| Prompt Editor (Compose) | Side panel (consistent with main screen)                             |
| Navigation              | Back button to return to Manage Prompts list after editing           |
| Button Configuration    | Two separate buttons: "AI Assistant" (main) and "AI Reply" (compose) |
| First-time Guidance     | No special messaging; just show empty list                           |
| Panel Behavior          | Stay open after save (user manually closes)                          |
| Multiple Generations    | Allowed; each inserts above previous                                 |
| Keyboard Shortcuts      | Configurable in settings                                             |
| Response Preview        | No preview; insert directly inline                                   |
| Undo Generation         | Ctrl+Z works to undo insertion                                       |
| Settings Sync           | Model preference syncs; API key stays local for security             |
| API Key Validation      | Format validation + optional "Test Connection" button                |
| System Prompt           | No wrapping; user controls prompt entirely                           |
| Loading Indicator       | Progress bar with steps: Preparing → Sending → Generating → Done     |
| Cancel Generation       | Always show cancel button during generation                          |
| Retry on Failure        | Show "Retry" button on error                                         |
| API Timeout             | No timeout; wait for OpenAI response                                 |
| Prompt Export/Import    | Via clipboard (copy/paste JSON)                                      |
| Duplicate Titles        | Block saving; require unique titles                                  |
| Demo Mode               | None; API key required for generation                                |
| Usage Logging           | No logging; privacy first                                            |
| Button Appearance       | Ribbon button with icon and text label                               |
| Button Label            | "AI Assistant"                                                       |
| Screen Display          | Dialog/Taskpane (standard Outlook add-in panel)                      |
| Sync Conflict           | Last write wins (most recent save overwrites)                        |
| Email Attachments       | No special handling; generate normally                               |
| Reading Pane            | Generation only works in compose mode                                |
| Signature Handling      | Insert response above signature (auto-detect position)               |
| Prompt Placeholders     | None; advanced users handle manually                                 |
| Content Policy          | Show OpenAI's content policy message on violation                    |
| Factory Reset           | "Reset All Data" button in settings with confirmation                |

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Configure ChatGPT API Key (Priority: P1)

As a user, I want to configure my ChatGPT API key so that the add-in can communicate with the ChatGPT API to generate email responses.

**Why this priority**: Without API key configuration, no AI functionality works. This is the foundational requirement.

**Independent Test**: Can be tested by opening settings, entering an API key, saving, and verifying persistence across Outlook sessions.

**Acceptance Scenarios**:

1. **Given** the add-in is installed, **When** I click the dropdown button on the main Outlook screen and select "Settings", **Then** I see a settings screen with an input field for the ChatGPT API key.
2. **Given** I am on the settings screen, **When** I paste a valid API key and save, **Then** the API key is securely stored and persists across sessions.
3. **Given** I am on the settings screen, **When** I paste an invalid API key format, **Then** I see a validation error message.
4. **Given** I have previously saved an API key, **When** I open the settings screen, **Then** I see the API key masked (e.g., `sk-****...****`) for security.

---

### User Story 2 - Create Custom Prompt (Priority: P1)

As a user, I want to create and save custom prompts so that I can reuse them when generating email responses.

**Why this priority**: Core functionality - users need prompts to generate AI responses.

**Independent Test**: Can be tested by adding a new prompt with title and content, saving it, and verifying it appears in the dropdown list.

**Acceptance Scenarios**:

1. **Given** I am on the main Outlook screen, **When** I click the dropdown button and select "Add Custom Prompt", **Then** I see a prompt editor screen with a text field for title and a textarea for prompt content.
2. **Given** I am on the prompt editor screen, **When** I enter a title and prompt content and click "Save", **Then** the prompt is saved and appears in the dropdown list.
3. **Given** I am on the prompt editor screen, **When** I click "Cancel", **Then** the screen closes without saving and I return to Outlook.
4. **Given** I am on the prompt editor screen with empty title or prompt, **When** I click "Save", **Then** I see a validation error indicating required fields.

---

### User Story 3 - Edit Existing Prompt (Priority: P2)

As a user, I want to edit my existing prompts so that I can refine and improve them over time.

**Why this priority**: Important for usability but not blocking core functionality.

**Independent Test**: Can be tested by clicking an existing prompt in the main screen dropdown, modifying content, saving, and verifying changes persist.

**Acceptance Scenarios**:

1. **Given** I have saved prompts, **When** I click the dropdown on the main Outlook screen and select a prompt title, **Then** I see the prompt editor screen with the existing title and prompt content pre-filled.
2. **Given** I am editing an existing prompt, **When** I modify the content and click "Save", **Then** the changes are persisted.
3. **Given** I am editing an existing prompt, **When** I click "Delete", **Then** the prompt is removed from the list after confirmation.
4. **Given** I am editing an existing prompt, **When** I click "Cancel", **Then** no changes are saved and I return to Outlook.

---

### User Story 4 - Generate AI Response in Email Compose (Priority: P1)

As a user, I want to generate AI responses when composing emails so that I can quickly draft professional replies.

**Why this priority**: This is the primary value proposition of the add-in.

**Independent Test**: Can be tested by opening a compose window, selecting a prompt from dropdown, and verifying AI-generated response is inserted.

**Acceptance Scenarios**:

1. **Given** I am composing an email (new, reply, or forward), **When** I look at the compose toolbar, **Then** I see a dropdown button with my configured prompts listed.
2. **Given** I am composing a reply with existing email content, **When** I click a prompt title from the dropdown, **Then** the email content is sent to ChatGPT along with the selected prompt.
3. **Given** ChatGPT has generated a response, **When** the response is ready, **Then** the generated text is inserted at the top of the email body.
4. **Given** I am composing a new email with no content, **When** I click a prompt, **Then** I see a message indicating there is no email content to respond to.
5. **Given** I click a prompt, **When** the AI is generating a response, **Then** I see a loading indicator and the dropdown is disabled until completion.

---

### User Story 5 - Handle API Errors Gracefully (Priority: P2)

As a user, I want to see helpful error messages when something goes wrong so that I can understand and resolve issues.

**Why this priority**: Essential for good UX but not core functionality.

**Independent Test**: Can be tested by configuring an invalid API key and attempting to generate a response.

**Acceptance Scenarios**:

1. **Given** my API key is invalid or expired, **When** I try to generate a response, **Then** I see an error message suggesting I check my API key in settings.
2. **Given** the ChatGPT API is unavailable, **When** I try to generate a response, **Then** I see a message indicating the service is temporarily unavailable.
3. **Given** I haven't configured an API key, **When** I try to generate a response, **Then** I see a message prompting me to configure the API key in settings.
4. **Given** the API rate limit is exceeded, **When** I try to generate a response, **Then** I see a message indicating I should wait before trying again.

---

### Edge Cases

- What happens when a user has no saved prompts? → Show empty dropdown with only "Add Custom Prompt" and "Settings" options.
- What happens when the email content is very long? → Truncate or summarize to fit API token limits, with user notification.
- What happens if the user closes the compose window while AI is generating? → Cancel the API request gracefully.
- What happens if network connectivity is lost mid-request? → Show timeout error with retry option.
- What happens if the generated response contains inappropriate content? → Display with option to regenerate or discard.
- What happens when trying to delete the last remaining prompt? → Allow deletion, showing empty prompt list.

## Requirements _(mandatory)_

### Functional Requirements

**Main Outlook Screen Button/Dropdown**:

- **FR-001**: Add-in MUST display a button labeled "AI Assistant" with icon in the main Outlook ribbon/toolbar.
- **FR-001a**: Button MUST always be active/enabled, regardless of whether an email is selected.
- **FR-002**: Button MUST show a dropdown menu when clicked.
- **FR-003**: Dropdown MUST display exactly 2 items: "Manage Prompts" and "Settings".
- **FR-004**: [REMOVED - no longer applicable]
- **FR-005**: [REMOVED - no longer applicable]
- **FR-006**: [REMOVED - no longer applicable]
- **FR-007**: [REMOVED - merged into FR-003]
- **FR-007a**: "Manage Prompts" MUST open in the side panel (taskpane), NOT a modal dialog.
- **FR-007b**: "Settings" MUST open in the side panel (taskpane), NOT a modal dialog.

**Settings Screen**:

- **FR-008**: Settings screen MUST open in a Dialog/Taskpane (standard Outlook add-in panel).
- **FR-009**: Settings screen MUST provide an input field for ChatGPT API key.
- **FR-010**: Settings screen MUST mask the stored API key for security display.
- **FR-011**: Settings MUST persist API key securely using Outlook storage mechanisms.
- **FR-012**: Settings MUST validate API key format before saving (starts with sk-, correct length).
- **FR-012a**: Settings MUST provide a "Test Connection" button to verify API key works.
- **FR-013**: Settings screen MUST provide a dropdown to select ChatGPT model (GPT-5 default, GPT-4, GPT-4-turbo, GPT-3.5-turbo).
- **FR-014**: Selected model MUST persist and be used for all API requests.
- **FR-014a**: Settings MUST provide a "Reset All Data" button with confirmation dialog.

**Prompt Editor Screen**:

- **FR-015**: Prompt editor MUST open in a Dialog/Taskpane (standard Outlook add-in panel).
- **FR-016**: Prompt editor MUST display a text field for prompt title (max 100 characters).
- **FR-017**: Prompt editor MUST display a textarea for prompt content (max 10,000 characters).
- **FR-018**: Prompt editor MUST provide "Save" button to persist changes.
- **FR-019**: Prompt editor MUST provide "Delete" button to remove prompts (only when editing existing).
- **FR-020**: Prompt editor MUST provide "Cancel" button to discard changes.
- **FR-021**: Prompt editor MUST validate that title and content are not empty.
- **FR-021a**: Delete action MUST show a simple confirmation dialog before proceeding.
- **FR-021b**: Prompt titles MUST be unique; saving duplicate title MUST be blocked with error message.

**Manage Prompts Screen**:

- **FR-047**: Manage Prompts screen MUST display a list of all prompts with click-to-edit functionality.
- **FR-048**: Manage Prompts screen MUST include an "Add New Prompt" button.
- **FR-049**: Clicking a prompt in the list MUST navigate to the Prompt Editor with that prompt pre-filled.
- **FR-050**: Prompt Editor MUST include a back button to return to Manage Prompts list.
- **FR-051**: "Add Custom Prompt" from compose dropdown MUST open in side panel (consistent with main screen).
- **FR-052**: Side panel MUST stay open after saving (user manually closes).
- **FR-053**: Empty prompt list MUST show without special first-time messaging.

**Email Compose Screen Integration**:

- **FR-022**: Add-in MUST display a dropdown button labeled "AI Reply" in the compose toolbar for new, reply, and forward email actions.
- **FR-023**: Compose dropdown MUST list all user-configured prompts alphabetically by title.
- **FR-023a**: Compose dropdown MUST include "Add Custom Prompt" option (after separator), but NOT Settings.
- **FR-024**: When prompt is selected, add-in MUST send email content + prompt to ChatGPT API without additional system prompt wrapping.
- **FR-025**: Generated response MUST be inserted at the top of the email body, above any existing user content but above signature.
- **FR-025a**: Add-in MUST auto-detect signature position and insert response above it.
- **FR-026**: Add-in MUST show progress bar with steps during generation: Preparing → Sending → Generating → Done.
- **FR-026a**: Add-in MUST show a cancel button during generation that aborts the request.
- **FR-027**: Add-in MUST handle and display API errors gracefully with a "Retry" button.
- **FR-027a**: Content policy violations MUST display OpenAI's error message.
- **FR-028**: Add-in MUST include entire email thread as context when replying.
- **FR-029**: Add-in MUST preserve HTML formatting from original email.
- **FR-029a**: Multiple generations MUST be allowed; each new generation inserts above previous content.
- **FR-029b**: Insertion MUST be undoable via Ctrl+Z (standard undo).
- **FR-029c**: API requests MUST wait indefinitely for OpenAI response (no timeout).
- **FR-029d**: Generation MUST only work in compose mode (not reading pane).
- **FR-029e**: Email attachments require no special handling.

**Data Persistence & Sync**:

- **FR-030**: User prompts MUST persist across Outlook sessions.
- **FR-031**: API key MUST be stored securely and locally (not synced for security).
- **FR-032**: Prompts MUST sync across devices using Microsoft account/Roaming Settings.
- **FR-032a**: Model preference MUST sync across devices.
- **FR-032b**: Sync conflicts MUST use "last write wins" strategy (most recent save overwrites).
- **FR-033**: No limit on number of prompts a user can create.
- **FR-033a**: Prompts MUST be displayed alphabetically by title in all dropdowns.

**Prompt Export/Import**:

- **FR-034**: Settings MUST provide "Export Prompts" button that copies all prompts as JSON to clipboard.
- **FR-035**: Settings MUST provide "Import Prompts" button that imports prompts from clipboard JSON.
- **FR-036**: Import MUST handle duplicate titles by appending "(imported)" suffix.

**Privacy**:

- **FR-037**: Add-in MUST NOT log any usage data, email content, or analytics.
- **FR-038**: All API calls MUST go directly to OpenAI; no intermediary servers.

**First-Time Use**:

- **FR-039**: Users MUST be able to create and edit prompts without an API key configured.
- **FR-040**: Generation MUST be blocked with helpful message if API key is not configured.

**Keyboard Shortcuts**:

- **FR-041**: Settings MUST allow configuring keyboard shortcuts for opening prompt dropdown.
- **FR-042**: Keyboard shortcuts MUST work in compose mode across all supported platforms.

**Token Limit Handling**:

- **FR-043**: When email thread exceeds token limit, add-in MUST automatically summarize older messages.
- **FR-044**: User MUST be notified when content summarization occurs.

**Platform & Localization**:

- **FR-045**: Add-in MUST work on Outlook Desktop (Windows/Mac), Outlook Web, and Outlook Mobile.
- **FR-046**: Add-in UI MUST support multiple languages based on user's Outlook locale.

### Key Entities

- **Prompt**: User-created instruction for ChatGPT. Attributes: id, title, content, createdAt, updatedAt.
- **Settings**: User configuration. Attributes: apiKey (encrypted, local only), selectedModel, keyboardShortcuts, lastUpdated.
- **GenerationRequest**: Transient object for API calls. Attributes: emailContent, promptContent, timestamp.
- **GenerationResponse**: Transient object from API. Attributes: generatedText, tokensUsed, responseTime.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can configure API key and save a prompt in under 2 minutes on first use.
- **SC-002**: AI response generation completes in under 5 seconds for typical email length (<500 words).
- **SC-003**: Add-in loads and is interactive within 1 second of Outlook compose window opening.
- **SC-004**: 95% of API errors result in user-friendly error messages (not technical errors).
- **SC-005**: Saved prompts persist across 100% of Outlook restarts.
- **SC-006**: Add-in core features (generation, settings, prompts) are functional on Outlook Desktop (Windows/Mac), Outlook Web, and Outlook Mobile.
- **SC-007**: Prompts sync across devices within 30 seconds of save.
- **SC-008**: UI elements render without layout breaks in all supported Outlook locales (en, de, fr, es).

## UI Components Summary

| Location              | Component                                                 | Contents                                                                                                                                                                             |
| --------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Main Outlook Screen   | Ribbon Button "AI Assistant" (icon + text, always active) | Dropdown: "Manage Prompts" → "Settings" (both open in side panel)                                                                                                                    |
| Settings Screen       | Side Panel (Taskpane)                                     | API Key input (masked) + Test Connection button, Model selector (GPT-5 default), Keyboard shortcut config, Export/Import Prompts buttons, Reset All Data button, Save/Cancel buttons |
| Prompt Editor Screen  | Side Panel (Taskpane)                                     | Title field (100 char max, unique), Prompt textarea (10,000 char max), Save/Delete/Cancel buttons                                                                                    |
| Manage Prompts Screen | Side Panel (Taskpane)                                     | List of prompts with edit/delete options, Add New Prompt button                                                                                                                      |
| Email Compose Screen  | Ribbon Button "AI Reply" (icon + text)                    | Dropdown: Prompt titles (alphabetical) → Separator → "Add Custom Prompt"                                                                                                             |
| Generation Progress   | Overlay/Banner in compose                                 | Progress bar (Preparing → Sending → Generating → Done) + Cancel button                                                                                                               |
| Error State           | Banner in compose                                         | Error message (including OpenAI policy messages) + Retry button                                                                                                                      |
