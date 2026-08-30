import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const root = "C:/Users/user/Google 드라이브/교안/01_GEN_AI/서울대학교_최고위과정/03_홈페이지_작업물/2nd";
const data = JSON.parse(fs.readFileSync(`${root}/data/artworks.json`, "utf8"));
const stories = data.artworks.filter(item => item.category === "story");
if (!stories.length) throw new Error("표지 전용 story 데이터가 없습니다.");
for (const item of stories) {
  if (item.visibility !== "cover-only") throw new Error(`${item.id}: visibility가 cover-only가 아닙니다.`);
  for (const field of ["viewer", "pdf", "originalUrl", "media", "images", "description"]) {
    if (item[field]) throw new Error(`${item.id}: 공개 데이터에 개인 필드 ${field}가 있습니다.`);
  }
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto("http://127.0.0.1:4174/03_홈페이지_작업물/2nd/", { waitUntil: "networkidle" });
  const result = await page.locator('[data-gallery="story"]').evaluate(node => ({
    cards: node.querySelectorAll(".book-card").length,
    images: [...node.querySelectorAll("img")].map(image => image.getAttribute("src")),
    anchors: node.querySelectorAll("a").length,
    buttons: node.querySelectorAll("button").length,
    text: node.textContent.trim()
  }));
  if (result.cards !== stories.length || result.images.length !== stories.length || result.anchors || result.buttons) {
    throw new Error(`표지 전용 카드 검증 실패: ${JSON.stringify(result)}`);
  }
  for (const item of stories) {
    if (!result.images.includes(item.thumbnail)) throw new Error(`${item.id}: 표지 경로가 DOM에 없습니다.`);
  }
  console.log(JSON.stringify({ ok: true, stories: stories.length, ...result }, null, 2));
} finally {
  await browser.close();
}
