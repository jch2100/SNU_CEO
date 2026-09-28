# 3rd Cohort Graduation Record

Public target URL: `https://ceo-ai.org/3rd/`

## Current stage

This is the 3rd-cohort static exhibition. It reuses the verified interaction structure without copying 2nd-cohort learner media. The final local collection is staged from `09_3기_수료작품_수집`.

The current page has four galleries:

- `story`: 8 AI autobiography cover cards only
- `music`: 25 Suno playlist song links
- `image`: 9 collections / 54 images from `AI를 만나 해온 일과 앞으로 1년 동안 해 나갈 일`
- `slides`: 11 collections / 63 images from `내_인생_10년계획_슬라이드`

The `자기소개카드` folder is intentionally not used. No self-introduction-card tile section is present.

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
- The page uses a plain URL in place of a QR asset; no placeholder QR is shown.

## Local verification

Run through a local HTTP server because the page loads JSON with `fetch()`:

```powershell
node tests/validate-skeleton.mjs
node tests/verify-cover-only.mjs
node tests/verify-share-preview.mjs
node tests/qa-final.mjs
node --check app.js
```

Before release, verify desktop, 390px mobile, ceremony mode, OG preview, approved media, and both `/3rd/` and `/3rd/index.html` URLs. The Suno playlist remains managed at its external URL; do not change its visibility without a separate decision. Git push and GitHub Pages deployment require separate approval.
