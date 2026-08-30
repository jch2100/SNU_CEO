# 2nd Cohort Record Shell QA

Date: 2026-08-27  
Status: PASS — stage 2 shell and cover-only autobiography verification

## Verified

- `node tests/validate-skeleton.mjs` → `SKELETON_VALIDATION_OK`
- `node --check app.js` passed.
- Local HTTP URL opened successfully: `http://localhost:4173/2nd/`
- Page title and visible copy use 2nd-cohort wording.
- No `1기`, `FIRST`, `1ST`, `/1st/`, or first-cohort date markers remain under `2nd/`.
- Four gallery containers render; the music gallery displays the connected 11-song playlist and the other three galleries remain intentional empty states.
- The first approved autobiography cover is registered in the story gallery as a cover-only card. The card has no anchor, viewer URL, PDF, page data, body text, or private link.
- Playlist URL is connected exactly as provided: `https://suno.com/playlist/2c94f7c1-f077-4151-869c-6b0f3d19ed5d`; the visible player and track list contain 11 songs.
- The first-page hero renders a borderless 4×5 board: 17 normalized 2:3 poster assets plus one continuous three-cell word strip labeled `AI`, `CEO`, and `MASTER`.
- All 17 normalized hero assets are verified at 1000×1500px; tile gap and padding are both 0px.
- The normalization uses contain-with-canvas rather than center-cropping, so the full poster content remains visible inside each equal-size tile.
- The decorative cohort stamp and multi-color word blocks are removed; the word strip now uses a restrained neutral treatment so the posters remain the visual focus.
- The `AI / CEO / MASTER` strip is a single three-cell banner with a navy field, brass angled edge, and restrained slash separators.
- Lightbox dialog and previous/next controls exist in the shell; no lightbox artwork trigger is shown until an approved image or slide is registered.
- Record-viewing dialog opens with `1 / 2`, advances to the closing slide `2 / 2`, and closes successfully.
- QR image loads with natural width 420px and is labeled for `ceo-ai.org/2nd/`.
- Desktop viewport 1440×900: no horizontal overflow.
- Mobile viewport 390×844: no horizontal overflow; both hero actions remain visible.
- Local document console errors: none. The embedded Suno iframe emits external `identify`, storage, Turnstile, and Meta warnings during load; these are outside the local page code.

## Share note

The desktop share button is present and wired to the existing native-share-or-clipboard fallback handler. This browser exposed the native-share path, so clipboard fallback was not forced as a separate test.

## Not yet tested

- Opening a real lightbox item, because the non-music artwork data is intentionally empty.
- Private autobiography flipbook content is verified separately from its bearer link; it is not part of the public 2nd-cohort data.
- Public GitHub Pages deployment and `https://ceo-ai.org/2nd/` live verification.

## Next content gate

Add the next approved cover only after confirming the public name, title, cover file, and instructor-approved public consent. Repeat the cover-only data and asset-loading checks; issue the full flipbook URL separately to that CEO.
