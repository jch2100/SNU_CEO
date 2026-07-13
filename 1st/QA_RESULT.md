# 1st Cohort Graduation Exhibition QA

Date: 2026-07-13
Status: PASS_WITH_CONTENT_PENDING

## Passed

- Static validator: `VALIDATION_OK: 4 artworks, 4 unique ids`
- UTF-8 HTML, CSS, JavaScript, JSON, Markdown, and CSV files load without parse errors.
- Responsive browser checks completed at 375×812, 768×1024, and 1440×900.
- Typography updated to Noto Serif KR and Noto Sans KR; font loading and line wrapping rechecked at 375×812 and 1440×900.
- No horizontal overflow at tested breakpoints.
- Four gallery sections render from `data/artworks.json`.
- Ceremony dialog opens with 6 slides, keyboard controls, auto-play control, and a separate fullscreen control.
- Image lightbox opens the correct approved example image.
- Shared flipbook viewer resolves the existing autobiography example to `/autobiography/index.html`.
- Missing group photo produces no asset request and uses the designed fallback panel.
- Browser console: no warnings or errors after final regression check.
- Open Graph image verified at 1200×630.
- QR SVG generated for `https://ceo-ai.org/1st/`.

## Content pending

- Learner submissions are not present yet. Only already-public instructor/course examples are displayed and marked `과정 예시`.
- Private consent register must be completed before learner assets are copied into the public repository.
- Temporary group image is installed as `assets/hero/group-photo.webp`; replace this file or clear `groupPhoto` when the final photo is ready.
- Music gallery remains empty until approved MP3 and Suno links arrive.

## Release gate

Do not deploy or distribute the URL until:

1. The private consent register and public artwork list match.
2. Learner names, titles, descriptions, and files receive final instructor review.
3. The projector rehearsal is repeated with the final media set.
4. The instructor explicitly approves git push and public distribution.
