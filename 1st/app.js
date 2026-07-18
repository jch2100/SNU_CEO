const CATEGORY_LABELS = {
  story: "우리의 이야기",
  music: "우리의 노래",
  image: "우리의 이미지",
  slides: "우리의 생각"
};

const state = {
  artworks: [],
  groupPhoto: "",
  musicPlaylist: null,
  ceremonySlides: [],
  ceremonyIndex: 0,
  ceremonyTimer: null,
  lightboxItem: null,
  lightboxIndex: 0,
  pretext: null,
  prepared: new Map()
};

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);
}

function safeUrl(value = "") {
  if (!value) return "";
  try {
    const url = new URL(value, window.location.href);
    if (!["http:", "https:"].includes(url.protocol) && url.origin !== window.location.origin) return "";
    return url.href;
  } catch {
    return "";
  }
}

function artworkLink(item, label, className = "") {
  const href = safeUrl(item.viewer || item.pdf || item.originalUrl);
  if (!href) return "";
  return `<a class="${className}" href="${escapeHtml(href)}" target="_blank" rel="noopener">${label}</a>`;
}

function imageList(item) {
  if (Array.isArray(item.images) && item.images.length) {
    return item.images.map(image => typeof image === "string" ? { src: image } : image).filter(image => image?.src);
  }
  const source = item.media || item.thumbnail;
  return source ? [{ src: source }] : [];
}

function imagePresentationLabel(item) {
  const count = imageList(item).length;
  if (item.presentation === "composite") return "합본 1장";
  if (item.presentation === "mixed") return `${count}장 · 가로·세로 혼합`;
  return `${count}장`;
}

function imageThemeLabel(item) {
  return item.imageTheme === "future" ? "5–10년 뒤의 나" : item.imageTheme === "ai-meets" ? "AI를 만나고" : "이미지 작품";
}

function renderStory(item) {
  return `<article class="art-card book-card">
    <a class="art-thumb" href="${escapeHtml(safeUrl(item.viewer || item.pdf))}" target="_blank" rel="noopener">
      <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)} 자서전 표지" loading="lazy">
    </a>
    <div class="art-meta">
      <h4>${escapeHtml(item.title)}</h4>
      <span class="creator">${escapeHtml(item.creator)}</span>
      <p>${escapeHtml(item.description)}</p>
      <div class="art-links">${artworkLink(item, "플립북 보기")}</div>
    </div>
  </article>`;
}

function renderMusic(item) {
  if (item.embedUrl) {
    const order = String(item.playlistOrder || 0).padStart(2, "0");
    const label = item.playlistExtra ? "추가 트랙" : "PLAYLIST";
    return `<button class="music-track" type="button" data-music-track="${escapeHtml(item.id)}" aria-pressed="false">
      <span class="music-track-index">${escapeHtml(order)}</span>
      <span class="music-track-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.creator)}</small></span>
      <span class="music-track-label${item.playlistExtra ? " is-extra" : ""}">${label}</span>
      <span class="music-track-action" aria-hidden="true">재생 →</span>
    </button>`;
  }
  const audio = item.media ? `<audio controls preload="none" src="${escapeHtml(item.media)}">오디오를 재생할 수 없습니다.</audio>` : "";
  const suno = item.originalUrl ? `<a href="${escapeHtml(safeUrl(item.originalUrl))}" target="_blank" rel="noopener">Suno 원곡</a>` : "";
  return `<article class="music-card">
    <div class="music-cover"><img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)} 앨범 이미지" loading="lazy"></div>
    <div>
      <h4>${escapeHtml(item.title)}</h4>
      <span class="creator">${escapeHtml(item.creator)}</span>
      <p>${escapeHtml(item.description)}</p>
      ${audio}
      <div class="art-links">${suno}</div>
    </div>
  </article>`;
}

function renderImage(item) {
  return `<article class="art-card image-card">
    <button class="art-thumb" type="button" data-lightbox="${escapeHtml(item.id)}">
      <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy">
      <span class="art-flags"><span>${escapeHtml(imageThemeLabel(item))}</span><span>${escapeHtml(imagePresentationLabel(item))}</span></span>
    </button>
    <div class="art-meta">
      <h4>${escapeHtml(item.title)}</h4>
      <span class="creator">${escapeHtml(item.creator)}</span>
      <p>${escapeHtml(item.description)}</p>
      <div class="art-links"><button type="button" data-lightbox="${escapeHtml(item.id)}">작품 보기</button></div>
    </div>
  </article>`;
}

function renderSlides(item) {
  if (Array.isArray(item.images) && item.images.length) {
    return `<article class="art-card slide-card is-collection">
      <button class="art-thumb" type="button" data-lightbox="${escapeHtml(item.id)}">
        <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy">
        <span class="art-flags"><span>${escapeHtml(imageThemeLabel(item))}</span><span>${escapeHtml(imagePresentationLabel(item))}</span></span>
      </button>
      <div class="art-meta">
        <h4>${escapeHtml(item.title)}</h4>
        <span class="creator">${escapeHtml(item.creator)}</span>
        <p>${escapeHtml(item.description)}</p>
        <div class="art-links"><button type="button" data-lightbox="${escapeHtml(item.id)}">작품 보기</button></div>
      </div>
    </article>`;
  }
  return `<article class="art-card slide-card">
    <a class="art-thumb" href="${escapeHtml(safeUrl(item.viewer || item.pdf))}" target="_blank" rel="noopener">
      <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)} 발표자료 미리보기" loading="lazy">
    </a>
    <div class="art-meta">
      <h4>${escapeHtml(item.title)}</h4>
      <span class="creator">${escapeHtml(item.creator)}</span>
      <p>${escapeHtml(item.description)}</p>
      <div class="art-links">${artworkLink(item, item.pdf ? "전체 PDF 보기" : "발표자료 보기")}</div>
    </div>
  </article>`;
}

function emptyState(category) {
  return `<div class="empty-gallery"><div><strong>작품을 준비하고 있습니다.</strong><span>${CATEGORY_LABELS[category]} 전시는 공개 동의 확인 후 차례로 열립니다.</span></div></div>`;
}

function renderGalleries() {
  const renderers = { story: renderStory, music: renderMusic, image: renderImage, slides: renderSlides };
  Object.keys(CATEGORY_LABELS).forEach(category => {
    const target = qs(`[data-gallery="${category}"]`);
    const items = state.artworks
      .filter(item => item.category === category)
      .sort((a, b) => category === "music" ? (a.playlistOrder || 999) - (b.playlistOrder || 999) : 0);
    target.innerHTML = items.length ? items.map(renderers[category]).join("") : emptyState(category);
  });
  enforceSingleAudio();
  bindLightboxes();
  setupMusicPlaylist();
}

function selectMusicTrack(item, { focus = false } = {}) {
  const frame = qs("#sunoPlayer");
  const embedUrl = safeUrl(item.embedUrl);
  if (!frame || !embedUrl) return;
  frame.src = embedUrl;
  frame.title = `${item.title} · ${item.creator} Suno 플레이어`;
  qs("#musicNowTitle").textContent = item.title;
  qs("#musicNowCreator").textContent = item.playlistExtra ? `${item.creator} · 플레이리스트 외 추가 작품` : item.creator;
  const currentLink = qs("#musicCurrentLink");
  currentLink.href = safeUrl(item.originalUrl);
  qsa("[data-music-track]").forEach(button => {
    const active = button.dataset.musicTrack === item.id;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (focus) qs("#musicExperience").scrollIntoView({ behavior: "smooth", block: "start" });
}

function setupMusicPlaylist() {
  const tracks = state.artworks
    .filter(item => item.category === "music" && item.embedUrl)
    .sort((a, b) => (a.playlistOrder || 999) - (b.playlistOrder || 999));
  const experience = qs("#musicExperience");
  const fallback = qs("#musicFallback");
  if (!experience || !tracks.length) {
    if (experience) experience.hidden = true;
    if (fallback) fallback.hidden = false;
    return;
  }
  experience.hidden = false;
  if (fallback) fallback.hidden = true;
  const playlist = state.musicPlaylist || {};
  const playlistLink = qs("#musicPlaylistLink");
  playlistLink.href = safeUrl(playlist.url);
  const count = Number(playlist.trackCount) || tracks.filter(item => !item.playlistExtra).length;
  const extra = Number(playlist.extraTrackCount) || tracks.filter(item => item.playlistExtra).length;
  qs("#musicPlaylistMeta").textContent = `CEO 1ST · ${count} TRACKS${extra ? ` + ${extra} EXTRA` : ""}`;
  qsa("[data-music-track]").forEach(button => button.addEventListener("click", () => {
    const item = tracks.find(track => track.id === button.dataset.musicTrack);
    if (item) selectMusicTrack(item, { focus: window.innerWidth < 720 });
  }));
  selectMusicTrack(tracks[0]);
}

function renderFeatured() {
  let items = state.artworks.filter(item => item.featured).sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99));
  if (!items.length) {
    items = ["music", "image", "slides"]
      .map(category => state.artworks.find(item => item.category === category))
      .filter(Boolean);
  }
  const rail = qs("#featuredRail");
  if (!items.length) {
    rail.innerHTML = `<div class="empty-gallery"><div><strong>1기 작품을 기다리고 있습니다.</strong><span>공개 동의를 받은 대표작이 이곳에 펼쳐집니다.</span></div></div>`;
    return;
  }
  rail.innerHTML = items.map(item => `<a class="featured-card featured-card--${escapeHtml(item.category)}" href="#${escapeHtml(item.category)}">
    <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy">
    <span class="featured-meta"><small>${escapeHtml(CATEGORY_LABELS[item.category])}</small><strong>${escapeHtml(item.title)}</strong></span>
  </a>`).join("");
}

function enforceSingleAudio() {
  qsa("audio").forEach(audio => audio.addEventListener("play", () => {
    qsa("audio").forEach(other => { if (other !== audio) other.pause(); });
  }));
}

function bindLightboxes() {
  qsa("[data-lightbox]").forEach(button => button.addEventListener("click", () => {
    const item = state.artworks.find(entry => entry.id === button.dataset.lightbox);
    if (!item) return;
    state.lightboxItem = item;
    state.lightboxIndex = 0;
    renderLightbox();
    qs("#lightbox").showModal();
  }));
}

function renderLightbox() {
  const item = state.lightboxItem;
  if (!item) return;
  const images = imageList(item);
  const image = images[state.lightboxIndex] || images[0];
  if (!image) return;
  const dialog = qs("#lightbox");
  dialog.classList.remove("is-zoomed");
  qs("#lightboxImage").src = image.src;
  qs("#lightboxImage").alt = `${item.creator} ${item.title} ${state.lightboxIndex + 1}번째 이미지`;
  qs("#lightboxTitle").textContent = item.title;
  qs("#lightboxCreator").textContent = item.creator;
  qs("#lightboxCount").textContent = images.length > 1 ? `${state.lightboxIndex + 1} / ${images.length}` : imagePresentationLabel(item);
  [qs("#lightboxPrev"), qs("#lightboxNext")].forEach(button => { button.hidden = images.length < 2; });
}

function moveLightbox(direction) {
  const images = imageList(state.lightboxItem || {});
  if (images.length < 2) return;
  state.lightboxIndex = (state.lightboxIndex + direction + images.length) % images.length;
  renderLightbox();
}

function setupLightbox() {
  const dialog = qs("#lightbox");
  qs("[data-close-dialog]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  qs("#lightboxPrev").addEventListener("click", () => moveLightbox(-1));
  qs("#lightboxNext").addEventListener("click", () => moveLightbox(1));
  qs("#lightboxZoom").addEventListener("click", () => dialog.classList.toggle("is-zoomed"));
  let touchStartX = 0;
  qs(".lightbox-viewport").addEventListener("touchstart", event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  qs(".lightbox-viewport").addEventListener("touchend", event => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) moveLightbox(distance > 0 ? -1 : 1);
  }, { passive: true });
  window.addEventListener("keydown", event => {
    if (!dialog.open) return;
    if (event.key === "ArrowRight") moveLightbox(1);
    if (event.key === "ArrowLeft") moveLightbox(-1);
  });
}

function setupGalleryObserver() {
  const links = qsa(".gallery-tabs a");
  const observer = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach(entry => {
      links.forEach(link => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-25% 0px -60%", threshold: 0 });
  qsa(".gallery-section").forEach(section => observer.observe(section));
}

function setupShare() {
  qs("#shareButton").addEventListener("click", async () => {
    const shareData = {
      title: "1기의 8주, 배움이 작품으로 남았습니다",
      text: "경영자를 위한 AI 마스터과정 1기 수료 기념관",
      url: "https://ceo-ai.org/1st/"
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        showToast("기념관 주소를 복사했습니다.");
      }
    } catch (error) {
      if (error.name !== "AbortError") showToast("주소를 복사하지 못했습니다.");
    }
  });
}

function showToast(message) {
  const toast = qs("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function buildCeremonySlides() {
  const featured = state.artworks.filter(item => item.featured).sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99));
  state.ceremonySlides = [
    { type: "intro" },
    ...featured.map(item => ({ type: "artwork", item })),
    { type: "outro" }
  ];
}

function ceremonyMarkup(slide) {
  if (slide.type === "intro") return `<p class="ceremony-kicker">경영자를 위한 AI 마스터과정</p><h2>1기의 8주,<br>배움이 작품으로 남았습니다.</h2><p>2026.06.01 — 07.20</p>`;
  if (slide.type === "outro") return `<p class="ceremony-kicker">CONGRATULATIONS</p><h2>1기 여러분의<br>새로운 시작을 응원합니다.</h2><p>강사 정찬훈 드림</p>`;
  const item = slide.item;
  return `<p class="ceremony-kicker">${escapeHtml(CATEGORY_LABELS[item.category])}</p>
    <img class="ceremony-media" src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}">
    <strong class="ceremony-art-title">${escapeHtml(item.title)}</strong>
    <span class="ceremony-art-meta">${escapeHtml(item.creator)}</span>`;
}

function renderCeremony() {
  const slide = state.ceremonySlides[state.ceremonyIndex];
  qs("#ceremonySlide").innerHTML = ceremonyMarkup(slide);
  qs("#ceremonyCount").textContent = `${state.ceremonyIndex + 1} / ${state.ceremonySlides.length}`;
  qs("#ceremonyProgress").style.width = `${((state.ceremonyIndex + 1) / state.ceremonySlides.length) * 100}%`;
}

function moveCeremony(direction) {
  state.ceremonyIndex = (state.ceremonyIndex + direction + state.ceremonySlides.length) % state.ceremonySlides.length;
  renderCeremony();
}

function startCeremony() {
  state.ceremonyIndex = 0;
  renderCeremony();
  const dialog = qs("#ceremony");
  dialog.showModal();
  document.body.classList.add("is-locked");
}

function stopCeremony() {
  window.clearInterval(state.ceremonyTimer);
  state.ceremonyTimer = null;
  qs("#ceremonyAuto").textContent = "자동 상영";
  if (document.fullscreenElement) document.exitFullscreen?.();
  qs("#ceremony").close();
  document.body.classList.remove("is-locked");
}

function toggleAutoCeremony() {
  const button = qs("#ceremonyAuto");
  if (state.ceremonyTimer) {
    window.clearInterval(state.ceremonyTimer);
    state.ceremonyTimer = null;
    button.textContent = "자동 상영";
  } else {
    state.ceremonyTimer = window.setInterval(() => moveCeremony(1), 12000);
    button.textContent = "자동 멈춤";
  }
}

function setupCeremony() {
  [qs("#ceremonyButton"), qs("#heroCeremonyButton")].forEach(button => button.addEventListener("click", startCeremony));
  qs("#ceremonyPrev").addEventListener("click", () => moveCeremony(-1));
  qs("#ceremonyNext").addEventListener("click", () => moveCeremony(1));
  qs("#ceremonyAuto").addEventListener("click", toggleAutoCeremony);
  qs("#ceremonyFullscreen").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await qs("#ceremony").requestFullscreen();
    } catch {
      showToast("브라우저 메뉴에서 전체 화면을 선택해 주세요.");
    }
  });
  qs("#ceremonyClose").addEventListener("click", stopCeremony);
  window.addEventListener("keydown", event => {
    if (!qs("#ceremony").open) return;
    if (event.key === "ArrowRight" || event.key === " ") moveCeremony(1);
    if (event.key === "ArrowLeft") moveCeremony(-1);
    if (event.key === "Escape") stopCeremony();
  });
}

async function setupPretext() {
  try {
    // Progressive enhancement: CSS remains the fallback if the CDN is unavailable.
    state.pretext = await import("https://esm.sh/@chenglou/pretext");
    await document.fonts.ready;
    qsa("[data-pretext]").forEach(element => {
      const style = getComputedStyle(element);
      state.prepared.set(element, state.pretext.prepare(element.innerText, style.font));
    });
    const relayout = () => {
      state.prepared.forEach((handle, element) => {
        const style = getComputedStyle(element);
        const result = state.pretext.layout(handle, element.clientWidth, parseFloat(style.lineHeight));
        element.style.minHeight = `${Math.ceil(result.height)}px`;
      });
    };
    new ResizeObserver(relayout).observe(document.body);
    relayout();
  } catch (error) {
    console.info("Pretext enhancement unavailable; native responsive layout is active.");
  }
}

async function loadArtworks() {
  try {
    const response = await fetch("data/artworks.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.artworks = Array.isArray(data.artworks) ? data.artworks.filter(item => CATEGORY_LABELS[item.category]) : [];
    state.groupPhoto = typeof data.groupPhoto === "string" ? data.groupPhoto : "";
    state.musicPlaylist = data.musicPlaylist && typeof data.musicPlaylist === "object" ? data.musicPlaylist : null;
  } catch (error) {
    console.error("작품 목록을 불러오지 못했습니다.", error);
    state.artworks = [];
    showToast("작품 목록을 불러오지 못했습니다.");
  }
}

async function detectGroupPhoto() {
  if (!state.groupPhoto) return;
  const images = [qs("#heroPhoto img"), qs("#closingPhoto img")];
  const test = new Image();
  test.onload = () => {
    images.forEach(image => {
      image.src = state.groupPhoto;
      image.hidden = false;
      image.nextElementSibling.hidden = true;
    });
    qs("#heroPhoto figcaption").textContent = "함께한 시간을 한 장면에 담았습니다.";
  };
  test.src = state.groupPhoto;
}

async function init() {
  setupLightbox();
  setupGalleryObserver();
  setupShare();
  setupCeremony();
  await loadArtworks();
  detectGroupPhoto();
  renderGalleries();
  renderFeatured();
  buildCeremonySlides();
  setupPretext();
}

document.addEventListener("DOMContentLoaded", init);
