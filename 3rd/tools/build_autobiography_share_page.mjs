import fs from "node:fs";
import path from "node:path";

const [,, sourcePath, outputPath, publicBaseUrl, cohort, siteName = "서울대학교 경영자를 위한 AI 마스터과정"] = process.argv;
if (!sourcePath || !outputPath || !publicBaseUrl || !cohort) {
  throw new Error("Usage: node build_autobiography_share_page.mjs <book-source.json> <output.html> <public-base-url> <cohort> [site-name]");
}

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
if (!/^[a-z0-9-]+$/.test(source.id) || !source.title || !source.author || !source.cover) {
  throw new Error("Book source needs a slug id, title, author, and cover");
}

const escapeHtml = value => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const baseUrl = publicBaseUrl.replace(/\/+$/, "");
const fileName = path.basename(outputPath);
const shareUrl = `${baseUrl}/autobiography/share/${fileName}`;
const coverPath = source.cover.replace(/^(\.\.\/)+/, "");
const coverUrl = /^https?:\/\//i.test(source.cover) ? source.cover : `${baseUrl}/${coverPath}`;
const socialTitle = `${source.author} — ${source.title}`;
const description = source.subtitle || `${source.author}의 자서전`;
const safeId = escapeHtml(source.id);
const safeTitle = escapeHtml(source.title);
const safeAuthor = escapeHtml(source.author);
const safeDescription = escapeHtml(description);
const safeSiteName = escapeHtml(`${siteName}${/^\d+기$/.test(siteName) ? "" : ` ${cohort}기`}`);
const safeShareUrl = escapeHtml(shareUrl);
const safeCoverUrl = escapeHtml(coverUrl);
const safeSocialTitle = escapeHtml(socialTitle);

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="referrer" content="no-referrer">
  <title>${safeSocialTitle}</title>
  <meta name="description" content="${safeDescription}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${safeSiteName}">
  <meta property="og:title" content="${safeSocialTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:url" content="${safeShareUrl}">
  <meta property="og:image" content="${safeCoverUrl}">
  <meta property="og:image:alt" content="${safeAuthor} 자서전 표지">
  <meta property="og:image:type" content="image/png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeSocialTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${safeCoverUrl}">
  <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#071421;color:#f6f0e4;font-family:system-ui,"Noto Sans KR",sans-serif;text-align:center}main{padding:2rem}h1{font-size:1.5rem;font-weight:600}p{color:#c8c0b3}small{color:#918879}</style>
</head>
<body><main><h1>${safeSocialTitle}</h1><p>${safeDescription}</p><small>개별 플립북을 여는 중입니다.</small></main>
<script>
(() => {
  const key = new URLSearchParams(location.hash.slice(1)).get("key");
  const target = new URL("../viewer.html", location.href);
  target.searchParams.set("id", "${safeId}");
  target.searchParams.set("cohort", "${escapeHtml(cohort)}");
  if (key) target.hash = "key=" + encodeURIComponent(key);
  location.replace(target.toString());
})();
</script>
</body>
</html>
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html, "utf8");
console.log(JSON.stringify({ outputPath, shareUrl, title: socialTitle, description, coverUrl }, null, 2));
