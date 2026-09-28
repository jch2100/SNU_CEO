import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const base = "http://127.0.0.1:8765/03_%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80_%EC%9E%91%EC%97%85%EB%AC%BC/3rd/";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
await page.goto(base, { waitUntil: "networkidle" });

const counts = await page.evaluate(() => Object.fromEntries(
  ["story", "music", "image", "slides"].map(category => [category, document.querySelectorAll(`[data-gallery="${category}"] > *`).length])
));
if (JSON.stringify(counts) !== JSON.stringify({ story: 8, music: 25, image: 9, slides: 11 })) errors.push(`gallery counts: ${JSON.stringify(counts)}`);
if (await page.locator("#heroSlideshow").count()) errors.push("hero tile slideshow remains");
if ((await page.locator("body").innerText()).includes("자기소개카드")) errors.push("self-introduction card copy remains");
if (await page.locator("a[href*='suno.com/song/']").count() !== 25) errors.push("Suno song link count mismatch");

for (const image of await page.locator("img:visible").all()) {
  await image.scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
}
const unloadedImages = await page.locator("img:visible").evaluateAll(images => images.filter(image => image.getAttribute("src") && image.naturalWidth === 0).map(image => image.getAttribute("src")));
if (unloadedImages.length) errors.push(`images did not load: ${unloadedImages.length}`);
await page.screenshot({ path: "qa/final-desktop.png", fullPage: true });

const assetPaths = await page.evaluate(async () => {
  const files = [];
  for (const src of [...document.querySelectorAll("img")].map(image => image.getAttribute("src")).filter(Boolean)) files.push(src);
  return [...new Set(files)];
});
for (const asset of assetPaths) {
  const response = await page.request.get(new URL(asset, base).href);
  if (!response.ok()) errors.push(`asset ${response.status()}: ${asset}`);
}

await page.locator("[data-gallery='image'] [data-lightbox]").first().click();
if (!(await page.locator("#lightbox").isVisible())) errors.push("image lightbox did not open");
await page.locator("[data-close-dialog]").click();
await page.locator("[data-gallery='slides'] [data-lightbox]").first().click();
if (!(await page.locator("#lightbox").isVisible())) errors.push("slides lightbox did not open");
await page.locator("[data-close-dialog]").click();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(base, { waitUntil: "networkidle" });
await mobile.screenshot({ path: "qa/final-mobile.png", fullPage: true });
const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
if (mobileOverflow) errors.push("390px horizontal overflow");

await browser.close();
if (errors.length) {
  console.error("QA_FINAL_FAILED");
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, counts, assetCount: assetPaths.length, mobileOverflow }));
