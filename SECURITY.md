# Security Policy

## Supported Version

Security fixes are applied to the latest version of the `main` branch.

## Reporting A Vulnerability

Please do not disclose security vulnerabilities in a public issue.

Use GitHub's private vulnerability reporting feature when it is available for this repository. Otherwise, contact the maintainer through the repository owner's GitHub profile and request a private reporting channel. Do not send confidential documents or active credentials in the first message.

Include:

- A clear description of the issue.
- The affected route, tool, or component.
- Reproduction steps using non-sensitive sample data.
- The expected impact.
- Any suggested mitigation, if known.

## File Processing Boundary

Most DexPDF tools process files in the browser. Optional cloud features can send a file or extracted content to Gemini, OCR.Space, or ConvertAPI when configured and selected.

Deployers are responsible for reviewing provider terms, retention, regional processing, quotas, and credentials before enabling those integrations. API keys must remain server-side and must never be committed to the repository.
