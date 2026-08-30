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
  "assets/share/favicon.svg",
  "assets/share/og-2nd.svg",
  "assets/share/qr-2nd.png"
];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) errors.push(`필수 파일 없음: ${relative}`);
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const marker of [
  "https://ceo-ai.org/2nd/",
  "og-2nd.svg",
  "qr-2nd.png",
  "ceremonyButton",
  "data-gallery=\"story\"",
  "data-gallery=\"music\"",
  "data-gallery=\"image\"",
  "data-gallery=\"slides\"",
  "sunoPlayer",
  "lightboxPrev",
  "lightboxNext"
]) {
  if (!html.includes(marker)) errors.push(`index.html 필수 마커 없음: ${marker}`);
}

const data = JSON.parse(fs.readFileSync(path.join(root, "data/artworks.json"), "utf8"));
if (!Array.isArray(data.artworks)) errors.push("artworks가 배열이 아님");
if (!Array.isArray(data.heroTiles) || data.heroTiles.length !== 17) errors.push(`Hero 타일 수 오류: ${data.heroTiles?.length || 0}`);
for (const tile of data.heroTiles || []) {
  const tilePath = path.resolve(root, tile);
  if (!fs.existsSync(tilePath)) errors.push(`Hero 타일 파일 없음: ${tile}`);
}
if (!data.musicPlaylist || data.musicPlaylist.url !== "https://suno.com/playlist/2c94f7c1-f077-4151-869c-6b0f3d19ed5d") errors.push("2기 Suno 플레이리스트 링크 없음");
const music = data.artworks.filter(item => item.category === "music");
if (music.length !== 11) errors.push(`2기 Suno 곡 수 오류: ${music.length}`);
if (Number(data.musicPlaylist?.trackCount) !== music.length) errors.push("플레이리스트 곡 수와 등록 곡 수가 다름");
const stories = data.artworks.filter(item => item.category === "story");
for (const [index, item] of stories.entries()) {
  for (const field of ["id", "title", "creator", "thumbnail"]) {
    if (!item[field]) errors.push(`story[${index}].${field} 없음`);
  }
  if (item.visibility !== "cover-only") errors.push(`story[${index}] 공개 범위가 cover-only가 아님`);
  for (const privateField of ["viewer", "pdf", "originalUrl", "media", "images", "description"]) {
    if (item[privateField]) errors.push(`story[${index}] 개인 본문 필드가 공개 데이터에 있음: ${privateField}`);
  }
  const thumbnailPath = path.resolve(root, item.thumbnail || "");
  if (!fs.existsSync(thumbnailPath)) errors.push(`story[${index}] 표지 파일 없음: ${item.thumbnail}`);
}
const unsupported = data.artworks.filter(item => !["music", "story"].includes(item.category));
if (unsupported.length) errors.push(`지원하지 않는 작품 범주가 들어 있음: ${unsupported.length}`);
for (const [index, item] of music.entries()) {
  for (const field of ["id", "title", "creator", "embedUrl", "originalUrl"]) {
    if (!item[field]) errors.push(`music[${index}].${field} 없음`);
  }
  if (!/^https:\/\/suno\.com\/embed\/[0-9a-f-]+$/i.test(item.embedUrl || "")) errors.push(`music[${index}].embedUrl 형식 오류`);
  if (!/^https:\/\/suno\.com\/song\/[0-9a-f-]+$/i.test(item.originalUrl || "")) errors.push(`music[${index}].originalUrl 형식 오류`);
}

const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
for (const marker of ["navigator.share", "moveLightbox", "setupCeremony", "data/artworks.json"]) {
  if (!app.includes(marker)) errors.push(`app.js 필수 기능 없음: ${marker}`);
}

if (errors.length) {
  console.error(`SKELETON_VALIDATION_FAILED (${errors.length})`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log("SKELETON_VALIDATION_OK: required files, 17 normalized poster assets + 3-cell word strip, 11-song playlist, 4 galleries, share, lightbox, ceremony");
