# Contributing To DexPDF

Thanks for helping improve DexPDF. Contributions should keep the project useful, privacy-aware, and honest about browser and provider limitations.

## Development Setup

```bash
git clone https://github.com/dexpie/dexpdf.git
cd dexpdf
npm ci
npm run dev
```

Optional integrations can be configured by copying `.env.local.example` to `.env.local`. Local tools do not require API keys.

## Before Opening A Pull Request

1. Keep the change focused and avoid unrelated refactors.
2. Preserve local-first processing unless a cloud dependency is necessary.
3. Clearly label every workflow that uploads files or extracted content.
4. Add or update validation for user-facing file operations.
5. Run `npm run verify`.
6. Do not commit generated files, logs, environment files, or `node_modules`.

## Adding Or Updating A Tool

Public tools normally require:

1. Tool metadata in `src/config/tools.tsx`.
2. A runtime mapping in `src/components/tools/ToolContainer.jsx`.
3. An implementation in `src/tools/` using the shared tool UI.
4. Clear file limits, errors, progress, and output naming.
5. Accurate copy about heuristic, local, and cloud behavior.

Run `npm run audit:tools` to catch missing routes or mappings.

## Pull Requests

- Use a short descriptive title.
- Explain the user-visible behavior and limitations.
- Include screenshots for interface changes.
- List the commands used for verification.
- Never include real documents, credentials, or personal information in fixtures or screenshots.

By contributing, you agree that your contribution will be licensed under the project's MIT License.
