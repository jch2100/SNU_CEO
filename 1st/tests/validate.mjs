import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const required = [
  "index.html",
  "styles.css",
  "app.js",
  "data/artworks.json",
  "viewer/book.html",
  "assets/share/og-1st.png",
  "assets/share/qr-1st.svg",
  "../autobiography/viewer.html",
  "../autobiography/vendor/page-flip.browser.js",
  "../autobiography/vendor/page-flip.LICENSE.txt"
];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) errors.push(`필수 파일 없음: ${relative}`);
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const marker of ["og:title", "og:image", "ceremonyButton", "data-gallery=\"story\"", "data-gallery=\"music\"", "data-gallery=\"image\"", "data-gallery=\"slides\"", "sunoPlayer", "musicPlaylistLink", "lightboxPrev", "lightboxNext"]) {
  if (!html.includes(marker)) errors.push(`index.html 필수 마커 없음: ${marker}`);
}

const raw = fs.readFileSync(path.join(root, "data/artworks.json"), "utf8");
const data = JSON.parse(raw);
if (!Array.isArray(data.artworks)) errors.push("artworks가 배열이 아님");

const ids = new Set();
const categories = new Set(["story", "music", "image", "slides"]);
const privateKeys = new Set(["consent", "phone", "email", "contact", "공개동의"]);
let imageAssetCount = 0;
let aiImageCollections = 0;
let futureSlideCollections = 0;
let sunoTracks = 0;
let sunoExtraTracks = 0;

function validateLocalAsset(value, base = root) {
  if (!value || /^https?:\/\//.test(value)) return;
  const clean = value.split(/[?#]/)[0];
  const resolved = path.resolve(base, clean);
  if (!fs.existsSync(resolved)) errors.push(`참조 파일 없음: ${value}`);
}

for (const [index, item] of (data.artworks || []).entries()) {
  const prefix = `artworks[${index}]`;
  for (const field of ["id", "category", "title", "creator", "description", "thumbnail"]) {
    if (!item[field]) errors.push(`${prefix}.${field} 없음`);
  }
  if (ids.has(item.id)) errors.push(`중복 id: ${item.id}`);
  ids.add(item.id);
  if (!categories.has(item.category)) errors.push(`잘못된 category: ${item.category}`);
  if (item.example) errors.push(`과정 예시 작품이 공개 목록에 남아 있음: ${item.id}`);
  for (const key of Object.keys(item)) {
    if (privateKeys.has(key.toLowerCase())) errors.push(`공개 JSON에 개인정보/동의 키 사용: ${prefix}.${key}`);
  }
  validateLocalAsset(item.thumbnail);
  validateLocalAsset(item.media);
  validateLocalAsset(item.pdf);
  if (Array.isArray(item.images)) {
    if (!item.images.length) errors.push(`${prefix}.images가 비어 있음`);
    item.images.forEach((image, imageIndex) => {
      const source = typeof image === "string" ? image : image?.src;
      if (!source) errors.push(`${prefix}.images[${imageIndex}].src 없음`);
      else {
        validateLocalAsset(source);
        imageAssetCount += 1;
      }
    });
    if (item.category === "image" && item.imageTheme === "ai-meets") aiImageCollections += 1;
    if (item.category === "slides" && item.imageTheme === "future") futureSlideCollections += 1;
  }
  if (item.category === "music" && item.embedUrl) {
    if (!/^https:\/\/suno\.com\/embed\/[0-9a-f-]+$/i.test(item.embedUrl)) errors.push(`${prefix}.embedUrl 형식 오류`);
    if (!/^https:\/\/suno\.com\/song\/[0-9a-f-]+$/i.test(item.originalUrl || "")) errors.push(`${prefix}.originalUrl 형식 오류`);
    sunoTracks += 1;
    if (item.playlistExtra) sunoExtraTracks += 1;
  }
  if (item.viewer && !item.viewer.includes("book.html?id=")) validateLocalAsset(item.viewer);
  if (item.category === "story" && item.viewer?.includes("../autobiography/viewer.html?id=")) {
    const bookId = new URL(item.viewer, "https://ceo-ai.org/1st/").searchParams.get("id");
    const bookPath = path.resolve(root, `../autobiography/books/${bookId}.json`);
    if (!fs.existsSync(bookPath)) {
      errors.push(`${prefix} 자서전 데이터 없음: ${bookId}`);
    } else {
      const book = JSON.parse(fs.readFileSync(bookPath, "utf8"));
      if (book.id !== bookId || book.title !== item.title || book.author !== item.creator) {
        errors.push(`${prefix} 자서전 메타데이터 불일치: ${bookId}`);
      }
      if (!book.backQuote || !Array.isArray(book.sections) || !book.sections.length) {
        errors.push(`${prefix} 자서전 본문 구조 오류: ${bookId}`);
      }
      validateLocalAsset(book.cover, path.resolve(root, "..", "autobiography"));
    }
  }
  if (Array.isArray(item.pages)) item.pages.forEach(page => validateLocalAsset(page, path.join(root, "viewer")));
}

if (data.artworks.some(item => item.imageTheme === "future" && item.category !== "slides")) {
  errors.push("5–10년 뒤의 나 작품이 slides가 아닌 전시관에 있음");
}
if (data.artworks.some(item => item.imageTheme === "ai-meets" && item.category !== "image")) {
  errors.push("AI를 만나고 작품이 image가 아닌 전시관에 있음");
}
if (data.musicPlaylist) {
  if (data.musicPlaylist.trackCount !== 15) errors.push("Suno 플레이리스트 수록곡은 15곡이어야 함");
  if (sunoTracks !== 16 || sunoExtraTracks !== 1) errors.push(`Suno 작품 수 오류: 전체 ${sunoTracks}, 추가 ${sunoExtraTracks}`);
}

const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
if (!app.includes('preload="none"')) errors.push("오디오 preload=none 처리 없음");
if (!app.includes("other.pause()")) errors.push("다중 오디오 동시 재생 방지 없음");
if (!app.includes("navigator.share")) errors.push("모바일 공유 기능 없음");
if (!app.includes("moveLightbox")) errors.push("연속 이미지 넘기기 기능 없음");
if (!app.includes("selectMusicTrack")) errors.push("Suno 곡 선택 기능 없음");
if (!app.includes("object-fit: contain") && !fs.readFileSync(path.join(root, "styles.css"), "utf8").includes("object-fit: contain")) errors.push("비율 보존 표시 없음");

if (errors.length) {
  console.error(`VALIDATION_FAILED (${errors.length})`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`VALIDATION_OK: ${data.artworks.length} artworks, ${ids.size} unique ids, ${imageAssetCount} collection images, ${aiImageCollections} AI image collections, ${futureSlideCollections} future slide collections, ${sunoTracks} Suno tracks`);
