# 3rd Cohort Graduation Record

Public target URL: `https://ceo-ai.org/3rd/`

## Current stage

This is the approved 3rd-cohort static exhibition shell. It reuses the verified 2nd-cohort interaction structure without copying 2nd-cohort learner media. The local staging data currently contains one approved-format autobiography cover card; the individual flipbook remains on a separate private-link path.

The current page has three core galleries:

- `story`: AI autobiography covers only
- `music`: approved Suno works and original links
- `image`: approved introduction and AI image works

Add a fourth `slides` / `생각` gallery only after the 3rd-cohort public-work inventory confirms enough approved material.

For cover-only verification, run the 3rd-cohort test through the local HTTP server:

```powershell
node tests/verify-cover-only.mjs
```

## Privacy gate

- Never copy raw learner submissions into this folder.
- Keep the private consent register outside `03_홈페이지_작업물`.
- Do not add consent status, phone numbers, email addresses, private links, or unpublished names to public JSON.
- Autobiographies remain cover-only until a separate public-release decision is made.
- The QR block is a temporary placeholder and must be replaced with a real QR asset before release.

## Local verification

Run through a local HTTP server because the page loads JSON with `fetch()`:

```powershell
node tests/validate-skeleton.mjs
node --check app.js
```

Before release, verify desktop, 390px mobile, ceremony mode, QR, OG preview, approved media, and both `/3rd/` and `/3rd/index.html` URLs. Git push and GitHub Pages deployment require separate approval.
