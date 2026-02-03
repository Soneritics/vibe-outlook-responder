# Vibe Outlook Responder Constitution

## Core Principles

### I. Code Quality Excellence
- All code must be clean, readable, and self-documenting
- Follow established design patterns and SOLID principles
- Maximum function length: 50 lines; maximum file length: 300 lines
- Strict type annotations required (TypeScript strict mode / Python type hints)
- No code duplication; DRY principle enforced
- Meaningful variable and function names; no abbreviations unless industry-standard
- All functions must have clear single responsibility

### II. Latest Versions Policy (NON-NEGOTIABLE)
- Always use the latest stable LTS versions of all technologies
- Package managers must be latest stable: npm 10+, pip 24+, or equivalent
- Dependencies must be updated to latest compatible versions before each release
- Node.js LTS (22+), Python 3.12+, or latest stable for chosen stack
- Use modern language features and syntax (ES2024+, Python 3.12+ features)
- Deprecated APIs and packages are prohibited
- Lock files (package-lock.json, poetry.lock) must be committed and maintained

### III. Testing Standards (NON-NEGOTIABLE)
- Minimum 80% code coverage for all new code
- Unit tests required for all business logic
- Integration tests required for API endpoints and external service interactions
- E2E tests for critical user flows
- TDD approach: Write tests first, then implement
- Tests must be fast: unit tests < 100ms each, integration tests < 5s each
- Mocking required for external dependencies (Outlook API, ChatGPT API)
- Test naming convention: `should_[expected]_when_[condition]`

### IV. User Experience Consistency
- Consistent error messaging format across all user-facing outputs
- Loading states and progress indicators for all async operations
- Response times must be communicated to users when > 2 seconds expected
- Clear, actionable error messages (no technical jargon for end users)
- Consistent email response formatting and tone
- Graceful degradation when external services unavailable
- Undo/confirmation for destructive actions

### V. Performance Requirements
- API response times: < 200ms for simple operations, < 2s for AI-generated responses
- Memory usage: < 512MB for standard operation
- Startup time: < 3 seconds
- Email processing throughput: minimum 10 emails/minute
- No memory leaks; proper resource cleanup required
- Async/await patterns for I/O operations
- Connection pooling for external API calls
- Caching strategy for frequently accessed data

## Security Standards

- All API keys and secrets in environment variables only
- Input validation and sanitization for all external data
- Rate limiting on all external API calls
- Secure handling of email content (no logging of sensitive data)
- OAuth 2.0 for Outlook authentication
- HTTPS/TLS for all external communications
- Regular dependency vulnerability scanning (npm audit, safety check)

## Development Workflow

- All code changes via pull requests
- Automated CI/CD pipeline must pass before merge
- Linting (ESLint/Ruff) and formatting (Prettier/Black) enforced
- Pre-commit hooks for code quality checks
- Semantic versioning for releases
- Changelog maintained for all releases
- Documentation updated with code changes

## Governance

This constitution supersedes all other practices and guidelines. Any amendments require:
1. Documentation of the proposed change
2. Justification for the amendment
3. Update to this constitution with new version number

All code reviews must verify compliance with these principles. Non-compliance is grounds for PR rejection.

**Version**: 1.0.0 | **Ratified**: 2026-02-03 | **Last Amended**: 2026-02-03
