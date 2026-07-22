import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const privateLinkFile = process.env.PRIVATE_LINK_FILE;
if (!privateLinkFile) throw new Error("PRIVATE_LINK_FILE 환경 변수가 필요합니다.");
const localBase = process.env.LOCAL_BASE || "http://127.0.0.1:8765";
const links = fs.readFileSync(privateLinkFile, "utf8").split(/\r?\n/)
  .filter(line => line.startsWith("  https://"))
  .map(line => line.trim().replace("https://ceo-ai.org", localBase));
if (links.length !== 8) throw new Error(`비공개 링크 수 오류: ${links.length}`);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`${localBase}/1st/index.html`, { waitUntil: "networkidle" });
  const desktop = await page.evaluate(() => {
    const cards = [...document.querySelectorAll(".art-grid--books .book-card")];
    const rects = cards.map(card => card.getBoundingClientRect());
    return {
      cards: cards.length,
      meta: document.querySelectorAll(".art-grid--books .art-meta").length,
      links: document.querySelectorAll(".art-grid--books a, .art-grid--books button").length,
      rows: new Set(rects.map(rect => Math.round(rect.top))).size,
      cols: new Set(rects.map(rect => Math.round(rect.left))).size,
      overflow: document.documentElement.scrollWidth > innerWidth
    };
  });
  const expectedDesktop = { cards: 8, meta: 0, links: 0, rows: 2, cols: 4, overflow: false };
  if (JSON.stringify(desktop) !== JSON.stringify(expectedDesktop)) throw new Error(`데스크톱 갤러리 오류: ${JSON.stringify(desktop)}`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  const mobile = await page.evaluate(() => {
    const cards = [...document.querySelectorAll(".art-grid--books .book-card")];
    const rects = cards.map(card => card.getBoundingClientRect());
    return {
      cards: cards.length,
      rows: new Set(rects.map(rect => Math.round(rect.top))).size,
      cols: new Set(rects.map(rect => Math.round(rect.left))).size,
      overflow: document.documentElement.scrollWidth > innerWidth
    };
  });
  const expectedMobile = { cards: 8, rows: 4, cols: 2, overflow: false };
  if (JSON.stringify(mobile) !== JSON.stringify(expectedMobile)) throw new Error(`모바일 갤러리 오류: ${JSON.stringify(mobile)}`);

  for (const [index, link] of links.entries()) {
    const viewer = await browser.newPage();
    const requests = [];
    viewer.on("request", request => requests.push(request.url()));
    await viewer.goto(link, { waitUntil: "networkidle" });
    await viewer.waitForFunction(() => document.querySelector("#openBook")?.disabled === false);
    if (await viewer.locator("#introTitle").textContent() === "접속 링크가 올바르지 않습니다") throw new Error("유효 링크 복호화 실패");
    if (requests.some(url => url.includes("#key="))) throw new Error("링크 조각 키가 요청에 포함됨");
    if (index === 0) {
      await viewer.setViewportSize({ width: 390, height: 844 });
      await viewer.locator("#openBook").click();
      await viewer.locator("#status").waitFor({ state: "hidden" });
      const viewerLayout = await viewer.evaluate(() => {
        const main = document.querySelector("main");
        return {
          pageCount: document.querySelectorAll("#book > .page").length,
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
          mainOverflow: main.scrollHeight > main.clientHeight
        };
      });
      if (viewerLayout.pageCount < 4 || viewerLayout.horizontalOverflow || viewerLayout.mainOverflow) {
        throw new Error(`모바일 플립북 오버플로우: ${JSON.stringify(viewerLayout)}`);
      }
    }
    await viewer.close();
  }

  const invalid = await browser.newPage();
  await invalid.goto(`${localBase}/autobiography/viewer.html?id=baek-in-gi`, { waitUntil: "networkidle" });
  if (await invalid.locator("#introTitle").textContent() !== "접속 링크가 올바르지 않습니다") throw new Error("키 없는 URL 차단 실패");
  await invalid.close();
  console.log("PRIVATE_LINK_QA_OK");
} finally {
  await browser.close();
}
