# Outlook ChatGPT Email Responder Add-in

An intelligent Outlook add-in that integrates ChatGPT to help you compose professional email responses with custom AI prompts. Works across all Outlook platforms: Desktop (Windows/Mac), Web, and Mobile.

## Features

✨ **AI-Powered Email Responses**: Generate contextual email replies using ChatGPT with your custom prompts  
🔐 **Secure API Key Storage**: Your OpenAI API key is stored locally and never shared  
📝 **Custom Prompt Library**: Create, edit, and manage unlimited custom prompts  
☁️ **Cross-Device Sync**: Your prompts sync across all devices via Microsoft account  
🌍 **Multi-Language Support**: UI adapts to your Outlook locale (English, German, French, Spanish)  
⚡ **Smart Context Handling**: Includes full email thread context with automatic summarization for long threads  
⌨️ **Keyboard Shortcuts**: Configurable shortcuts for faster workflow  
📤 **Export/Import**: Backup and share your prompts via clipboard

## Prerequisites

- **Outlook**: Desktop (Windows/Mac), Web (OWA), or Mobile (iOS/Android)
- **OpenAI API Key**: Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Node.js 22+** (for development only)

## Installation

### For Users (AppSource)

1. Open Outlook and go to **Get Add-ins** or **Store**
2. Search for "Outlook ChatGPT Email Responder"
3. Click **Add** to install the add-in
4. The add-in will appear in your Outlook ribbon

### For Developers (Sideloading)

1. Clone this repository:
   ```bash
   git clone https://github.com/Soneritics/vibe-outlook-responder.git
   cd vibe-outlook-responder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the add-in:
   ```bash
   npm run build
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Sideload the manifest in Outlook:
   ```bash
   npm start
   ```

## Quick Start Guide

### 1. Configure Your API Key

1. Click the **AI Responder** button in the Outlook ribbon
2. Select **Settings** from the dropdown
3. Paste your OpenAI API key (starts with `sk-`)
4. Optionally click **Test Connection** to verify
5. Select your preferred ChatGPT model (defaults to GPT-5)
6. Click **Save**

### 2. Create Your First Prompt

1. Click **AI Responder** → **Add Custom Prompt**
2. Enter a title (e.g., "Professional Reply")
3. Write your prompt template:
   ```
   Please write a professional, friendly response to this email.
   Acknowledge their points and provide helpful information.
   Keep the tone warm but business-appropriate.
   ```
4. Click **Save**

### 3. Generate a Response

1. Open or reply to an email
2. Click **AI Responder** in the compose ribbon
3. Select your prompt from the dropdown
4. Wait for ChatGPT to generate the response
5. The response is inserted above your signature
6. Edit as needed and send!

## Usage

### Managing Prompts

**Create a Prompt**:
- Main screen → AI Responder → Add Custom Prompt
- Enter title (max 100 chars) and content (max 10,000 chars)
- Save to add to your library

**Edit a Prompt**:
- Main screen → AI Responder → Select prompt name
- Modify title or content
- Save changes or Delete prompt

**Export/Import Prompts**:
- Settings → Export Prompts → Copies JSON to clipboard
- Settings → Import Prompts → Paste JSON from clipboard
- Duplicate titles are automatically renamed with "(imported)"

### Using in Compose Mode

1. **Start Composing**: Open a new email or reply
2. **Select Prompt**: Click AI Responder ribbon button → choose prompt
3. **Progress Display**: See real-time progress (Preparing → Sending → Generating → Done)
4. **Review Response**: Response is inserted above your content
5. **Edit & Send**: Customize the generated text and send

### Keyboard Shortcuts

Configure custom shortcuts in Settings for:
- Open Settings
- Add New Prompt
- Generate with Last Used Prompt

### Settings & Preferences

**API Key Management**:
- Stored locally for security (not synced)
- Masked display (`sk-****...****`)
- Test connection button to verify

**Model Selection**:
- Choose from available OpenAI models
- Preference syncs across devices
- Defaults to GPT-5

**Keyboard Shortcuts**:
- Customize key combinations
- View available commands
- Enable/disable shortcuts

**Reset All Data**:
- Clear all prompts, settings, and API key
- Confirmation required
- Cannot be undone

## How It Works

### Email Context

The add-in includes the entire email thread for context:
- Original message content
- All previous replies in the thread
- Subject line and participants
- Automatic summarization if thread exceeds token limits

### Response Insertion

Generated responses are inserted:
- Above your existing draft content
- Above your email signature (auto-detected)
- Multiple generations stack in order
- Use Ctrl+Z to undo insertion

### Privacy & Security

🔒 **Local API Key Storage**: Your OpenAI API key stays on your device  
🚫 **No Intermediary Servers**: Direct connection to OpenAI only  
🔕 **No Usage Logging**: We don't track or log your prompts or responses  
🌐 **Secure Communication**: All API calls use HTTPS/TLS encryption

## Development

### Project Structure

```
src/
├── taskpane/          # React UI components
│   ├── components/    # UI components
│   ├── hooks/         # Custom React hooks
│   └── App.tsx        # Main application
├── commands/          # Ribbon command handlers
├── services/          # Business logic
│   ├── openai/        # OpenAI API integration
│   ├── storage/       # Data persistence
│   ├── email/         # Email content handling
│   └── validation/    # Input validation
├── models/            # TypeScript interfaces
├── utils/             # Utility functions
└── locales/           # Translations (en, de, fr, es)
```

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Sideload in Outlook Desktop
npm test                 # Run unit tests
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests with Playwright
npm run lint             # Lint code with ESLint
npm run format           # Format code with Prettier
npm run validate         # Validate manifest.xml
```

### Testing

```bash
# Unit tests (Jest + React Testing Library)
npm test

# Coverage report (requires 80%+ coverage)
npm run test:coverage

# E2E tests (Playwright)
npm run test:e2e

# Watch mode for development
npm run test:watch
```

### Building for Production

```bash
# Build optimized bundle
npm run build

# Validate manifest
npm run validate

# Test in Outlook
npm start
```

## Troubleshooting

### Add-in doesn't appear in Outlook

- Verify the manifest is properly sideloaded
- Check Outlook version supports add-ins
- Try restarting Outlook
- Clear Office cache: `C:\Users\<user>\AppData\Local\Microsoft\Office\16.0\Wef\`

### "API Key Invalid" Error

- Verify your API key starts with `sk-`
- Check the key hasn't been revoked in OpenAI dashboard
- Use Test Connection in Settings to verify
- Ensure you have API credits in your OpenAI account

### Prompts not syncing across devices

- Verify you're signed in with the same Microsoft account
- Allow a few minutes for roaming settings to sync
- API keys don't sync (security feature) - re-enter on each device

### Generation fails with rate limit error

- Wait a few minutes before retrying
- Check your OpenAI account usage limits
- Consider upgrading your OpenAI plan

### Response inserted in wrong location

- Ensure you're in compose mode (not reading mode)
- The add-in detects signatures automatically
- Check that your email client preserves HTML formatting

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Code Standards

- TypeScript strict mode required
- 80%+ test coverage
- ESLint + Prettier formatting
- Maximum 50 lines per function
- Maximum 300 lines per file

## License

ISC License - see [LICENSE](LICENSE) file for details

## Support

- **Issues**: [GitHub Issues](https://github.com/Soneritics/vibe-outlook-responder/issues)
- **Documentation**: [Project Wiki](https://github.com/Soneritics/vibe-outlook-responder/wiki)
- **OpenAI API**: [OpenAI Documentation](https://platform.openai.com/docs)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

---

**Made with ❤️ for better email communication**
