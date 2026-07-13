import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const required = ["index.html", "styles.css", "app.js", "data/artworks.json", "viewer/book.html", "assets/share/og-1st.png", "assets/share/qr-1st.svg"];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) errors.push(`필수 파일 없음: ${relative}`);
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const marker of ["og:title", "og:image", "ceremonyButton", "data-gallery=\"story\"", "data-gallery=\"music\"", "data-gallery=\"image\"", "data-gallery=\"slides\""]) {
  if (!html.includes(marker)) errors.push(`index.html 필수 마커 없음: ${marker}`);
}

const raw = fs.readFileSync(path.join(root, "data/artworks.json"), "utf8");
const data = JSON.parse(raw);
if (!Array.isArray(data.artworks)) errors.push("artworks가 배열이 아님");

const ids = new Set();
const categories = new Set(["story", "music", "image", "slides"]);
const privateKeys = new Set(["consent", "phone", "email", "contact", "공개동의"]);

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
  for (const key of Object.keys(item)) {
    if (privateKeys.has(key.toLowerCase())) errors.push(`공개 JSON에 개인정보/동의 키 사용: ${prefix}.${key}`);
  }
  validateLocalAsset(item.thumbnail);
  validateLocalAsset(item.media);
  validateLocalAsset(item.pdf);
  if (item.viewer && !item.viewer.includes("book.html?id=")) validateLocalAsset(item.viewer);
  if (Array.isArray(item.pages)) item.pages.forEach(page => validateLocalAsset(page, path.join(root, "viewer")));
}

const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
if (!app.includes('preload="none"')) errors.push("오디오 preload=none 처리 없음");
if (!app.includes("other.pause()")) errors.push("다중 오디오 동시 재생 방지 없음");
if (!app.includes("navigator.share")) errors.push("모바일 공유 기능 없음");

if (errors.length) {
  console.error(`VALIDATION_FAILED (${errors.length})`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`VALIDATION_OK: ${data.artworks.length} artworks, ${ids.size} unique ids`);
