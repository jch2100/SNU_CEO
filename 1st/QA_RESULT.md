# 1st Cohort Graduation Exhibition QA

Date: 2026-07-14
Status: PASS_PHASE_1

## Passed

- Static validator: `VALIDATION_OK: 41 artworks, 41 unique ids, 128 collection images, 10 AI image collections, 15 future slide collections, 16 Suno tracks`
- UTF-8 HTML, CSS, JavaScript, JSON, Markdown, and CSV files load without parse errors.
- Responsive browser checks completed at 375×812, 768×1024, and 1440×900.
- Typography updated to Noto Serif KR and Noto Sans KR; font loading and line wrapping rechecked at 375×812 and 1440×900.
- No horizontal overflow at tested breakpoints.
- Four gallery sections render from `data/artworks.json`.
- Ceremony dialog opens with 6 slides, keyboard controls, auto-play control, and a separate fullscreen control.
- Image lightbox opens the approved AI image and future-slide sequences, including single-sheet submissions.
- Group photo renders from `assets/hero/group-photo.webp`.
- Browser console: no warnings or errors after final regression check.
- Suno's official embed player switches among 15 playlist tracks and 1 additional track without direct MP3 hosting.
- No course-example entries or labels remain in the public artwork data or rendered page.
- Open Graph image verified at 1200×630.
- QR SVG generated for `https://ceo-ai.org/1st/`.

## Phase 2 pending

- Autobiography submissions are scheduled to be completed on Saturday morning and are intentionally absent from this release.
- Add only the approved autobiography files and metadata after the private consent check.

## Release gate

Phase 1 was approved for deployment. Before adding the Phase 2 autobiographies:

1. The private consent register and public artwork list match.
2. Names, titles, descriptions, and files receive final instructor review.
3. The projector rehearsal is repeated with the final autobiography set.
4. The instructor explicitly approves the Phase 2 git push.
