import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shareDir = path.join(root, "autobiography", "share");
const files = fs.readdirSync(shareDir).filter(file => file.endsWith(".html"));
if (!files.length) throw new Error("자서전별 share 페이지가 없습니다.");

function meta(html, attribute, name) {
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${name}["']\\s+content=["']([^"']*)["']`, "i");
  return html.match(pattern)?.[1] || "";
}

const results = files.map(file => {
  const html = fs.readFileSync(path.join(shareDir, file), "utf8");
  const title = meta(html, "property", "og:title");
  const description = meta(html, "property", "og:description");
  const image = meta(html, "property", "og:image");
  const url = meta(html, "property", "og:url");
  const errors = [];
  if (!title || /AI 자서전|플립북/i.test(title)) errors.push("개별 자서전 제목이 없습니다.");
  if (!description) errors.push("og:description이 없습니다.");
  if (!/^https:\/\/ceo-ai\.org\/3rd\/assets\/autobiography\//.test(image)) errors.push("3기 표지의 절대 URL이 아닙니다.");
  if (!/^https:\/\/ceo-ai\.org\/3rd\/autobiography\/share\//.test(url)) errors.push("og:url이 share 페이지가 아닙니다.");
  if (!html.includes('meta name="twitter:title"') || !html.includes('meta name="twitter:image"')) errors.push("Twitter 카드 태그가 부족합니다.");
  if (/#key=[A-Za-z0-9_-]{20,}/.test(html)) errors.push("HTML 안에 실제 키가 들어 있습니다.");
  if (!html.includes('target.searchParams.set("id"') || !html.includes('target.hash = "key="')) errors.push("키 보존 redirect가 없습니다.");
  if (errors.length) throw new Error(`${file}: ${errors.join("; ")}`);
  return { file, title, description, image, url };
});

console.log(JSON.stringify({ ok: true, pages: results }, null, 2));
