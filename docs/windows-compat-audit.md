# Windows Compatibility Audit

This document inventories the current bash/Linux-specific surfaces in the repository so they can be addressed in a later Windows support pass.

## Scope

This audit covers:

- developer workflows
- Git hooks
- test and validation scripts
- CI/release automation
- package scripts
- prompts and docs that assume bash/Linux semantics

This audit does not change behavior. It is a map of current Unix-specific assumptions.

## Summary

The main Windows blockers are not in the core TypeScript CLI. They are in repository automation:

1. shell scripts under `scripts/` and `tests/`
2. `makefile` targets that invoke those scripts
3. the Husky `pre-commit` hook, which is POSIX `sh`
4. `package.json` scripts that use inline POSIX environment-variable assignment
5. GitHub Actions steps that directly execute `.sh` files or rely on `make`

There is also a second tier of bash/Linux coupling in prompts, tests, and docs where examples explicitly assume `bash`, `/bin/bash`, `pbcopy`, or `linux`.

## Hard Blockers

### 1. Husky pre-commit hook is POSIX shell

File: `.husky/pre-commit`

Why it is Unix-specific:

- uses `#!/bin/sh`
- uses POSIX shell conditionals like `if [ ! -d "node_modules" ]; then`
- uses `command -v ... >/dev/null 2>&1`
- documentation inside the hook recommends `brew install actionlint`

Impact on Windows:

- requires a POSIX shell environment such as Git Bash to run reliably
- is not directly runnable by `cmd.exe` or PowerShell as written

Notes:

- Husky itself also installs POSIX hook shims in `.husky/_/`
- those shims are part of Husky’s own Unix-oriented execution model

Files involved:

- `.husky/pre-commit`
- `.husky/_/h`
- `.husky/_/husky.sh`

### 2. `scripts/init.sh` is bash-only

File: `scripts/init.sh`

Why it is Unix-specific:

- shebang `#!/usr/bin/env bash`
- `set -e -o pipefail`
- `command -v jq &> /dev/null`
- recommends `brew install jq`

Impact on Windows:

- cannot run natively in PowerShell or `cmd.exe`
- current `make init` workflow depends on this file

### 3. End-to-end and install validation scripts are bash-only

Files:

- `tests/test-install.sh`
- `tests/test-chat.sh`
- `tests/test-file-input.sh`

Why they are Unix-specific:

- shebang `#!/usr/bin/env bash`
- `set -e -o pipefail`
- POSIX tests `[ ... ]`
- `mktemp`
- `rm -rf`
- `eval`
- shell redirection such as `</dev/null`
- pipelines using `tee`, `grep`, and `cat`
- assumptions about npm bin layout via `node_modules/.bin/ai`
- rely on `$HOME/.ai/prompts`

Impact on Windows:

- cannot run as-is in PowerShell or `cmd.exe`
- current e2e validation path is tied to bash semantics

Specific cases:

- `tests/test-install.sh` uses `mktemp` fallback logic described as "works on Darwin/Linux"
- `tests/test-chat.sh` uses `</dev/null` to force non-interactive mode
- `tests/test-file-input.sh` uses Unix text tools and shell parsing heavily

### 4. `makefile` depends on Unix shell tooling

File: `makefile`

Why it is Unix-specific:

- assumes `make` is installed
- help target uses `grep`, `sort`, `while read`, `printf`, `cut`, and ANSI escape sequences
- recipes execute `./scripts/init.sh`, `./tests/test-chat.sh`, and `./tests/test-file-input.sh`

Impact on Windows:

- not usable on a standard Windows setup without GNU Make plus a POSIX shell/toolchain

### 5. `package.json` scripts use POSIX environment assignment syntax

File: `package.json`

Scripts affected:

- `start`
- `start:debug`
- `test`
- `test:debug`
- `test:watch`
- `test:cov`
- `relink`

Why they are Unix-specific:

- use inline env assignment like `NODE_NO_WARNINGS=1 ...`
- use single-quoted env values like `NODE_OPTIONS='--experimental-vm-modules --no-warnings'`
- `relink` chains commands with `&&` and uses `npm unlink ai && npm link ai`, which is less of an issue than the env syntax, but still assumes shell command parsing
- some scripts invoke `node_modules/.bin/...` paths explicitly

Impact on Windows:

- inline `FOO=bar command` syntax does not work in `cmd.exe`
- single-quoted values are not interpreted the same way in Windows shells

### 6. CI workflows call Unix scripts directly

File: `.github/workflows/cicd.yaml`

Why it is Unix-specific:

- all jobs run on `ubuntu-24.04`
- workflow executes `./tests/test-install.sh`
- workflow executes `make test-e2e`
- release publish step uses POSIX shell conditional syntax:
  - `if [ "$NODE_AUTH_TOKEN" == "" ]; then`

Impact on Windows:

- CI does not currently exercise Windows at all
- adding a Windows runner would fail immediately on direct `.sh` execution and POSIX conditionals

## Soft Blockers And Unix Assumptions

These do not necessarily break the CLI on Windows, but they encode bash/Linux assumptions in prompts, tests, or documentation.

### 7. Prompt context explicitly tells the model the shell and OS

File: `prompts/chat/context/02-context.txt`

Content behavior:

- injects `${OS_PLATFORM}` and `${SHELL}`
- tells the model to account for the shell when writing shell scripts

Why it matters:

- on Windows, `SHELL` may be absent or unhelpful
- prompt behavior is currently biased toward Unix shell generation when the environment exposes bash-like values

This is not inherently broken, but it is part of the platform story and should be reviewed during Windows support work.

### 8. Prompt and example tests are explicitly Linux/bash-oriented

File: `tests/test-prompts.md`

Why it is Unix-specific:

- includes `Your current shell is /bin/bash and your operating system is linux`
- expects bash script output
- includes `#!/bin/bash`
- uses Unix commands like `find`, `du`, `sort`, and `head`

Impact:

- this locks expected prompt behavior to Unix-style output

### 9. README and docs use Unix-oriented commands and tooling

Files include:

- `README.md`
- `docs/developer-guide.md`
- `docs/configuration.md`
- `docs/advanced.md`

Examples:

- fenced blocks labeled `bash`
- `pbcopy` example in `README.md`
- `brew install actionlint`
- `brew install jq`
- references to shell scripts under `scripts/`
- examples that ask the model for "bash script" output

Impact:

- documentation currently teaches a Unix-first workflow
- Windows users will hit missing commands even where the CLI itself might work

### 10. Terminal recording assets are captured from bash sessions

Files include many `docs/casts/*.cast` assets.

Why it is Unix-specific:

- recorded environments contain `SHELL: "/usr/local/bin/bash"`
- examples shown in recordings are bash-centric

Impact:

- mostly documentation-only
- relevant if you later want Windows-specific docs or demos

## Already Windows-Aware Code

### 11. Commit command shell quoting already branches for Windows

File: `src/commands/commit/git.ts`

Relevant behavior:

- detects shell from `SHELL`, `ComSpec`, `COMSPEC`, and `PSModulePath`
- returns `powershell` on `win32` by default
- quotes commit messages differently for `powershell`, `cmd`, and `sh`

Why it matters:

- this is a useful example of platform-aware implementation already present in the codebase
- it should not be treated as a Linux-only blocker

## No Prepublish Script Found

There is no `prepublish`, `prepublishOnly`, or similar npm lifecycle script in `package.json`.

The closest relevant automation is:

- `prepare`: runs `husky`
- CI release steps in `.github/workflows/cicd.yaml`

So for "pre-publish script or similar", the relevant current surfaces are:

- Husky `prepare`
- GitHub Actions release publishing steps

## Recommended Follow-Up Order

When you start the Windows support pass, the lowest-friction sequence is:

1. replace bash-based test and init scripts with Node/TypeScript or PowerShell-compatible equivalents
2. replace `makefile` entrypoints with npm scripts
3. make `package.json` scripts shell-neutral
4. rework the Husky hook to call Node/npm commands without POSIX shell assumptions
5. add a Windows CI job
6. update docs and prompt tests so expected output can vary by platform
