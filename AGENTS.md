# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the TypeScript CLI and domain modules. Key areas include `src/commands/` for top-level commands, `src/chat-pipeline/` for request/response flow, `src/configuration/` for config loading and validation, `src/providers/` for provider setup, and `src/ui/` for interactive prompts. Unit tests live next to implementation files as `*.test.ts`. Bundled prompt templates are under `prompts/`, contributor docs under `docs/`, helper scripts under `scripts/`, and broader integration fixtures under `tests/`. Build output goes to `dist/`; do not edit generated files there.

## Build, Test, and Development Commands
Use `npm install` to install dependencies and Husky hooks. Core commands:

- `npm run build` compiles TypeScript to `dist/`.
- `npm run build:watch` rebuilds continuously during development.
- `npm start -- --help` runs the CLI from `src/cli.ts` with `ts-node`.
- `npm run lint` checks ESLint and Prettier rules.
- `npm run lint:fix` auto-fixes lintable issues.
- `npm run test` runs Jest unit tests without coverage.
- `npm run test:cov` writes coverage reports to `artifacts/coverage`.
- `npm run init` verifies the local development environment.
- `npm run test:e2e` runs cross-platform chat and file-input integration checks.

## Coding Style & Naming Conventions
This repo uses TypeScript with ESLint plus `plugin:prettier/recommended` behavior through `.eslintrc.yml`; run lint before opening a PR. Follow the existing style: 2-space indentation, double quotes, trailing commas where Prettier expects them, and small focused modules. Use `PascalCase` for class-style files such as `ReplyAction.ts`, and `kebab-case` for utility modules such as `translate-error.ts`. Keep tests colocated and named `feature-name.test.ts`.

## Testing Guidelines
Jest is configured in `jest.config.ts` with `roots: ["./src/"]`, so unit tests should stay under `src/`. Prefer deterministic unit tests with mocked filesystem or provider interactions where needed. For broader CLI behavior, add or update the Node-based integration scripts under `scripts/`. Run `npm run test` locally for fast validation and `npm run test:cov` when touching core flows.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit prefixes such as `feat:`, `fix:`, `docs:`, and `chore:`; keep subjects short and imperative, for example `feat: add provider validation`. Pull requests should explain the user-visible change, note any config or prompt updates, link related issues, and include terminal screenshots or recordings when UI/interactive behavior changes.

## Configuration & Security Tips
Never commit API keys or local config. End-to-end checks may require `TESTING_AI_API_KEY`, and debug output can be enabled with `AI_DEBUG_ENABLE=1` plus `AI_DEBUG_NAMESPACE='ai*'` when diagnosing provider or prompt issues.
