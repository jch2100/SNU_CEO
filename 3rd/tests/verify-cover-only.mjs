import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "data", "artworks.json"), "utf8"));
const stories = data.artworks.filter(item => item.category === "story");
if (stories.length !== 1) throw new Error(`예상한 표지 전용 자서전 수: 1, 실제: ${stories.length}`);
for (const item of stories) {
  if (item.visibility !== "cover-only") throw new Error(`${item.id}: visibility가 cover-only가 아닙니다.`);
  for (const field of ["viewer", "pdf", "originalUrl", "media", "images", "description"]) {
    if (item[field]) throw new Error(`${item.id}: 공개 데이터에 개인 필드 ${field}가 있습니다.`);
  }
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:8765/03_%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80_%EC%9E%91%EC%97%85%EB%AC%BC/3rd/";
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const result = await page.locator('[data-gallery="story"]').evaluate(node => ({
    cards: node.querySelectorAll(".book-card").length,
    images: [...node.querySelectorAll("img")].map(image => image.getAttribute("src")),
    anchors: node.querySelectorAll("a").length,
    buttons: node.querySelectorAll("button").length,
  }));
  if (result.cards !== stories.length || result.images.length !== stories.length || result.anchors || result.buttons) {
    throw new Error(`표지 전용 카드 검증 실패: ${JSON.stringify(result)}`);
  }
  if (!result.images.includes(stories[0].thumbnail)) throw new Error("표지 경로가 DOM에 없습니다.");
  console.log(JSON.stringify({ ok: true, stories: stories.length, ...result }, null, 2));
} finally {
  await browser.close();
}
