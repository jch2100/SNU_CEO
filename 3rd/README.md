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

## Private autobiography share-link rule

Every private autobiography link must use a static per-book share page:

`/3rd/autobiography/share/<book-id>.html#key=<url-fragment-key>`

The share page is the KakaoTalk preview surface. Its source HTML must contain:

- `og:title`: `<author> — <title>`
- `og:description`: the book subtitle or a short approved description
- `og:image`: the public cover URL
- matching Twitter card tags

The page must not contain a decryption key or manuscript text. Its small redirect script preserves the fragment key and opens `../viewer.html`. Generate it from the protected book source with `tools/build_autobiography_share_page.mjs`; never hand-edit metadata for individual books.

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
node tests/verify-share-preview.mjs
node --check app.js
```

Before release, verify desktop, 390px mobile, ceremony mode, QR, OG preview, approved media, and both `/3rd/` and `/3rd/index.html` URLs. Git push and GitHub Pages deployment require separate approval.
