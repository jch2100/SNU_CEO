# 1st Cohort Graduation Exhibition

Public URL after deployment: `https://ceo-ai.org/1st/`

## Privacy gate

- Never copy raw learner submissions directly into this public repository.
- Add an artwork only after the instructor confirms public consent.
- Keep the private consent register outside `03_홈페이지_작업물`.
- Do not add consent status, phone numbers, email addresses, or unpublished learner names to `data/artworks.json`.

## Add artwork

1. Optimize approved media and copy it under `assets/artworks/<participant-slug>/`.
2. Add one object to `data/artworks.json`.
3. Use a non-identifying slug for `id`, for example `story-001`.
4. Set `featured: true` only for the 12–16 ceremony selections.
5. Open the page through a local HTTP server. `fetch()` does not work reliably from `file://`.

### Story

```json
{
  "id": "story-001",
  "category": "story",
  "title": "작품 제목",
  "creator": "공개에 동의한 이름 또는 익명",
  "description": "한 줄 소개",
  "thumbnail": "assets/artworks/story-001/cover.webp",
  "viewer": "viewer/book.html?id=story-001",
  "pages": [
    "../assets/artworks/story-001/page-001.webp",
    "../assets/artworks/story-001/page-002.webp"
  ],
  "featured": true,
  "featuredOrder": 1
}
```

Page paths are resolved from `viewer/book.html`, so page images start with `../assets/`.

### Music

Use `media` for an approved MP3 and `originalUrl` for the Suno share URL. Audio is loaded with `preload="none"`, and starting one track pauses every other track.

### Image

Use a WebP thumbnail in `thumbnail` and the larger approved WebP in `media`.

### Slides

Use a 16:9 WebP thumbnail and a PDF in `pdf`. Do not publish raw PPTX files.

## Group photo

Save the approved group photo as `assets/hero/group-photo.webp`, then set `"groupPhoto": "assets/hero/group-photo.webp"` in `data/artworks.json`. While the value is empty, the page shows the artwork-themed fallback panel without requesting a missing file.

## Ceremony mode

- Buttons: `수료식 상영` or `수료식 상영 시작`
- Keys: left/right arrows, Space, Escape
- Auto timing: 12 seconds per slide
- Fullscreen starts only when the presenter clicks `전체 화면`, so permission failure never blocks the ceremony dialog.
- Audio never autoplays

## Release gate

- Run `node tests/validate.mjs`.
- Verify desktop projector, 375px mobile, and Kakao Open Graph preview.
- Confirm the private consent register and public JSON match exactly.
- Obtain explicit approval before git push or external link distribution.
