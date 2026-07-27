import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const localBase = process.env.LOCAL_BASE || "http://127.0.0.1:8765";
const chromePath = process.env.PLAYWRIGHT_CHROME_PATH
  || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const edgePath = process.env.PLAYWRIGHT_EDGE_PATH
  || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

const targets = [
  {
    name: "Chrome desktop",
    executablePath: chromePath,
    viewport: { width: 1440, height: 1000 }
  },
  {
    name: "Edge desktop",
    executablePath: edgePath,
    viewport: { width: 1440, height: 1000 }
  },
  {
    name: "Mobile in-app",
    executablePath: chromePath,
    viewport: { width: 390, height: 844 },
    userAgent: [
      "Mozilla/5.0 (Linux; Android 13; SM-S918N)",
      "AppleWebKit/537.36 (KHTML, like Gecko)",
      "Version/4.0 Chrome/125.0 Mobile Safari/537.36",
      "KAKAOTALK/25.6.2"
    ].join(" ")
  }
];

for (const target of targets) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: target.executablePath
  });

  try {
    const page = await browser.newPage({
      viewport: target.viewport,
      userAgent: target.userAgent
    });
    const requests = [];
    page.on("request", request => requests.push(request.url()));

    await page.goto(`${localBase}/sg`, { waitUntil: "domcontentloaded" });
    await page.waitForURL(url =>
      url.pathname === "/autobiography/viewer.html"
      && url.searchParams.get("id") === "lee-seung-gu"
      && url.hash.startsWith("#key=")
    );
    await page.waitForFunction(() =>
      document.querySelector("#openBook")?.disabled === false
    );

    const introTitle = await page.locator("#introTitle").textContent();
    const introAuthor = await page.locator("#introAuthor").textContent();
    if (introTitle !== "내 삶을 붙들어 준 사람들" || introAuthor !== "이승구 자서전") {
      throw new Error(`${target.name} 자서전 확인 실패`);
    }
    if (requests.some(url => url.includes("#key="))) {
      throw new Error(`${target.name} HTTP 요청에 암호키 조각 포함`);
    }

    await page.locator("#openBook").click();
    await page.locator("#status").waitFor({ state: "hidden" });
    const viewer = await page.evaluate(() => ({
      pageCount: document.querySelectorAll("#book .page").length,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      sceneActive: document.querySelector("#scene")?.classList.contains("active")
    }));
    if (viewer.pageCount < 4 || viewer.horizontalOverflow || !viewer.sceneActive) {
      throw new Error(`${target.name} 뷰어 확인 실패: ${JSON.stringify(viewer)}`);
    }

    console.log(`${target.name}: OK (${viewer.pageCount} pages)`);
  } finally {
    await browser.close();
  }
}

console.log("SG_SHORT_LINK_QA_OK");
