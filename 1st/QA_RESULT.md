# 1st Cohort Graduation Exhibition QA

Date: 2026-07-18
Status: PASS_PHASE_2_IN_PROGRESS

## Passed

- Static validator: `VALIDATION_OK: 42 artworks, 42 unique ids, 128 collection images, 10 AI image collections, 15 future slide collections, 16 Suno tracks`
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
- 조영숙 자서전 카드와 공용 플립북 경로를 작품관에 등록했습니다.
- 조영숙 자서전 329개 본문 문단의 순서와 누락 여부, 36쪽 페이지네이션, 페이지 넘김, overflow를 데스크톱 1440×1000과 모바일 390×844에서 확인했습니다.
- 플립북 엔진을 로컬 정적 파일로 고정해 외부 CDN 장애가 핵심 열람 흐름을 막지 않도록 했습니다.

## Phase 2 in progress

- 조영숙 자서전 1편을 공개 요청에 따라 먼저 등록했습니다.
- 남은 자서전은 각 저자의 최종 원고와 표지를 받은 뒤 같은 검증 절차로 한 편씩 추가합니다.

## Release gate

Each Phase 2 autobiography is released only after:

1. The private consent register and public artwork list match.
2. Names, titles, descriptions, and files receive final instructor review.
3. The projector rehearsal is repeated with the final autobiography set.
4. The instructor explicitly approves the Phase 2 git push.
