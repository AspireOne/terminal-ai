# Repository Guidelines

## Project Structure & Module Organization
Core TypeScript sources live in `src/`. Key areas are `src/commands/` for CLI entrypoints, `src/chat-pipeline/` for request flow, `src/configuration/` for config loading, `src/providers/` for provider adapters, and `src/ui/` for terminal prompts. Keep unit tests colocated as `*.test.ts`; Jest only scans `src/`. Helper scripts live in `scripts/`, longer-form docs in `docs/`, prompt assets in `prompts/`, and shell-based install/reference tests in `tests/`. Build output goes to `dist/` and should never be edited by hand.

## Build, Test, and Development Commands
Install dependencies with `npm install`.

- `npm run build` compiles `src/` to `dist/`.
- `npm run build:watch` rebuilds on file changes.
- `npm start -- --help` runs the CLI from source via `ts-node`.
- `npm run lint` checks ESLint and Prettier rules.
- `npm run lint:fix` applies safe lint fixes.
- `npm run test` runs Jest without coverage for quick feedback.
- `npm run test:cov` writes coverage reports to `artifacts/coverage`.
- `npm run test:e2e` runs the Node-based chat and file-input integration checks.
- `make init` and `make test-e2e` wrap common setup and end-to-end workflows.

## Coding Style & Naming Conventions
Use strict TypeScript and keep modules small and focused. Follow the existing style: 2-space indentation, double quotes, and trailing commas where formatter output expects them. Prefer descriptive kebab-case filenames for functions such as `translate-error.ts`; use PascalCase only where the codebase already does so for class-like modules. Run `npm run lint` before submitting changes.

## Testing Guidelines
Jest is configured in `jest.config.ts` with `roots: ["./src/"]` and `collectCoverageFrom: ["src/**/*.{js,ts}"]`. Add unit tests beside the implementation, for example `src/ui/format-chat-menu-hint.test.ts`. Mock filesystem, terminal, and provider behavior where practical. Run `npm run test` for every change; use `npm run test:cov` when touching shared flows or command handling.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commits such as `feat:`, `fix:`, `test:`, and `chore:`. Keep subjects short and imperative, for example `fix: improve windows shell support`. PRs should summarize user-visible behavior, call out config or prompt changes, link issues when relevant, and include terminal screenshots or recordings for interactive UX changes.

## Configuration & Security Tips
Never commit API keys or local config files. Use environment variables for secrets, and prefer test-only credentials such as `TESTING_AI_API_KEY` for end-to-end runs. For debugging, enable `AI_DEBUG_ENABLE=1` and narrow logs with `AI_DEBUG_NAMESPACE='ai*'`.
