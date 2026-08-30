# 2nd Cohort Record

Local draft URL after starting an HTTP server: `http://localhost:4173/2nd/`

Public target URL: `https://ceo-ai.org/2nd/`

## Current stage

This page is a responsive shell based on the first-cohort exhibition format. The hero uses a borderless 4×5 board with 17 normalized 2:3 self-introduction poster assets and one continuous three-cell word strip (`AI`, `CEO`, `MASTER`). The 2nd Suno playlist is connected first; learner works for the other galleries are added later through `data/artworks.json` and approved media files.

The normalized hero assets are generated at 1000×1500px JPEG from the source posters with `tools/normalize-hero-tiles.py`. The script preserves the full poster with a uniform 2:3 canvas instead of center-cropping it, so adjacent poster content can meet horizontally; the original source files remain in `assets/hero/tiles/`.

## Privacy gate

- Add a work only after the instructor confirms public consent.
- Keep the private consent register outside this folder.
- Do not add consent status, contact details, or unpublished learner names to `data/artworks.json`.
- Autobiographies are registered as `category: "story"` with `visibility: "cover-only"` only. The public page carries the cover image and public title/name; it must not carry a viewer URL, PDF, page data, body text, or private link.
- Give each CEO's full flipbook URL separately from `PRIVATE_FLIPBOOK_LINK.md`. Never place that bearer link in this folder or in the public homepage data.

## Add artwork later

1. Optimize approved media under `assets/artworks/`.
2. Add one approved object to `data/artworks.json`.
3. Use a non-identifying public ID such as `image-001`.
4. Run the skeleton validator and browser checks again.

## Stage 2 verification scope

- All four gallery containers render intentional empty states.
- Share button copies the 2nd URL when native sharing is unavailable.
- The QR asset loads and is labeled for the 2nd URL.
- The record-viewing dialog opens with intro and closing slides.
- The layout has no horizontal overflow at desktop and mobile widths.
- Story cards show covers only and have no click-through to personal content.
