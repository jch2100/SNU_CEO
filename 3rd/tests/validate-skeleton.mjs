import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const required = [
  "index.html",
  "styles.css",
  "app.js",
  "README.md",
  "data/artworks.json",
  "data/image-gallery.json",
  "data/slides-gallery.json",
  "data/music-player.json",
  "assets/share/favicon.svg",
  "assets/share/og-3rd.svg",
  "viewer/book.html"
];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) errors.push(`필수 파일 없음: ${relative}`);
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const marker of [
  "https://ceo-ai.org/3rd/",
  "og-3rd.svg",
  "FOUR GALLERIES",
  "data-gallery=\"story\"",
  "data-gallery=\"music\"",
  "data-gallery=\"image\"",
  "data-gallery=\"slides\"",
  "ceremonyButton",
  "lightboxPrev",
  "heroPlaceholder"
]) {
  if (!html.includes(marker)) errors.push(`index.html 필수 마커 없음: ${marker}`);
}

for (const forbidden of ["2기", "SECOND", "cover-2nd", "qr-2nd", "group-photo-lego-34"]) {
  if (html.includes(forbidden)) errors.push(`index.html에 이전 기수 문자열이 남아 있음: ${forbidden}`);
}

const data = JSON.parse(fs.readFileSync(path.join(root, "data/artworks.json"), "utf8"));
const imageData = JSON.parse(fs.readFileSync(path.join(root, "data/image-gallery.json"), "utf8"));
const musicData = JSON.parse(fs.readFileSync(path.join(root, "data/music-player.json"), "utf8"));
if (!Array.isArray(data.artworks)) errors.push("artworks가 배열이 아님");
if (!Array.isArray(imageData.artworks)) errors.push("image artworks가 배열이 아님");
if (!Array.isArray(musicData.sources)) errors.push("music sources가 배열이 아님");
const storyItems = data.artworks.filter(item => item.category === "story");
if (storyItems.some(item => item.visibility !== "cover-only")) errors.push("자서전 공개 항목은 cover-only여야 함");
for (const item of storyItems) {
  for (const field of ["viewer", "pdf", "originalUrl", "media", "images", "description"]) {
    if (item[field]) errors.push(`${item.id}: 공개 데이터에 개인 필드 ${field}가 있습니다.`);
  }
}
if (!imageData.artworks.length || musicData.sources.length) errors.push("최종 이미지가 없거나 음악 파일을 직접 포함함");

const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
for (const marker of ["data/artworks.json", "data/image-gallery.json", "data/slides-gallery.json", "data/music-player.json", "renderSlides", "setupCeremony", "navigator.share", "moveLightbox"]) {
  if (!app.includes(marker)) errors.push(`app.js 필수 기능 없음: ${marker}`);
}
for (const forbidden of ["2nd/", "2기", "SECOND"]) {
  if (app.includes(forbidden)) errors.push(`app.js에 이전 기수 문자열이 남아 있음: ${forbidden}`);
}

if (errors.length) {
  console.error(`SKELETON_VALIDATION_FAILED (${errors.length})`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log("SKELETON_VALIDATION_OK: 3rd shell, cover-only story data, 4 galleries, ceremony, share, lightbox");
