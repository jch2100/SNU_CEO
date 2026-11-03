(() => {
  'use strict';
  const catalog = window.COURSE_TOOLS;
  if (!catalog) {
    document.getElementById('tool-count').textContent = '자료를 불러오지 못했습니다. 새로고침하거나 공식 디렉터리에서 확인해 주세요.';
    return;
  }
  const {categories, items} = catalog;
  const kindNames = {plugin:'플러그인', skill:'스킬', opensource:'오픈소스 프로젝트'};
  const audienceNames = {ceo:'CEO·경영자', worker:'직장인', expert:'전문가'};
  const search = document.getElementById('tool-search');
  const kind = document.getElementById('tool-kind');
  const audience = document.getElementById('tool-audience');
  const results = document.getElementById('tool-results');
  const selected = new Set();
  const cards = new Map();
  const sections = new Map();
  const categoryButtons = new Map();
  let category = 'all';
  let printSnapshot = null;
  let printing = false;
  let toastTimer;
  const node = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  function announce(text) {
    const toast = document.querySelector('.toast');
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }
  function link(label, url) {
    const a = node('a', '', label);
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    return a;
  }
  function field(dl, name, value) {
    dl.append(node('dt', '', name), node('dd', '', value));
  }
  async function copy(text, button) {
    let area;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        area = node('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.cssText = 'position:fixed;left:0;top:-9999px';
        document.body.append(area);
        area.select();
        if (!document.execCommand('copy')) throw new Error('copy unavailable');
      }
      button.textContent = '복사했습니다';
      announce('시작 요청을 복사했습니다. 내 상황에 맞게 바꿔 사용하세요.');
      setTimeout(() => button.textContent = '시작 요청 복사', 1800);
    } catch {
      announce('자동 복사가 되지 않습니다. 시작 요청 문장을 직접 선택해 복사하세요.');
    } finally {
      area?.remove();
      button.focus({preventScroll:true});
    }
  }
  function updateSelected() {
    document.getElementById('selected-count').textContent = String(selected.size);
    const button = document.getElementById('print-selected');
    button.disabled = selected.size === 0;
    button.setAttribute('aria-label', `선택한 자료 ${selected.size}개 인쇄. 필터로 숨겨진 선택도 포함합니다.`);
  }
  for (const [id, title, desc] of categories) {
    const section = node('section', 'library-group');
    section.setAttribute('aria-labelledby', `group-${id}`);
    const heading = node('div', 'library-group-heading');
    const number = String(sections.size + 1).padStart(2, '0');
    heading.append(node('span', 'library-group-number', number));
    const headingText = node('div');
    const h2 = node('h2', '', title);
    h2.id = `group-${id}`;
    headingText.append(h2, node('p', '', desc));
    const count = node('span', 'library-group-count');
    heading.append(headingText, count);
    const grid = node('div', 'library-grid');
    section.append(heading, grid);
    results.append(section);
    sections.set(id, {section, grid, count});
  }
  for (const item of items) {
    const card = node('article', 'library-card');
    card.id = `tool-${item.id}`;
    card.dataset.kind = item.kind;
    const meta = node('div', 'library-card-meta');
    meta.append(node('span', `library-kind kind-${item.kind}`, kindNames[item.kind]));
    if (item.featured) meta.append(node('span', 'library-featured', '먼저 살펴보기'));
    const title = node('h3', '', item.name);
    card.append(meta, title, node('p', 'library-tagline', item.tagline), node('p', 'library-result', item.result));
    const tags = node('div', 'library-tags');
    tags.append(node('span', '', item.level));
    if (item.kind === 'opensource') tags.append(node('span', '', '실행 비용 별도 확인'));
    else if (item.evidence === '제공 안내 확인') tags.append(node('span', '', '계정 제공 범위 확인'));
    else tags.append(node('span', '', '가입·요금 확인'));
    card.append(tags);
    const detail = node('details', 'library-detail');
    const summary = node('summary', '', '활용법·가입 조건 보기');
    detail.append(summary);
    const dl = node('dl', 'library-facts');
    field(dl, '추천 대상', item.audiences.map(a => audienceNames[a]).join(' · '));
    field(dl, '가입·연결', item.account);
    field(dl, '무료·유료', item.cost);
    field(dl, '권한·환경', item.access);
    field(dl, '이용 조건', item.license);
    field(dl, '확인 상태', `${item.evidence} · ${item.checked} / 실제 Codex 작업·한국어 결과 품질 미검증`);
    detail.append(dl);
    const prompt = node('div', 'library-prompt');
    prompt.append(node('strong', '', '시작 요청 예시'), node('p', '', item.prompt));
    const copyButton = node('button', 'library-copy', '시작 요청 복사');
    copyButton.type = 'button';
    copyButton.setAttribute('aria-label', `${item.name} 시작 요청 복사`);
    copyButton.addEventListener('click', () => copy(item.prompt, copyButton));
    prompt.append(copyButton);
    detail.append(prompt);
    const links = node('div', 'library-links');
    links.append(link('공식 안내 ↗', item.url));
    if (item.pricing) links.append(link('요금 확인 ↗', item.pricing));
    links.append(link('확인 근거 ↗', item.sourceUrl));
    detail.append(links, node('p', 'library-source', `근거: ${item.source}. 업무 예시와 시작 요청은 활용 제안입니다.`));
    card.append(detail);
    const bottom = node('div', 'library-card-bottom');
    const label = node('label', 'library-select-card');
    const checkbox = node('input');
    checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', `${item.name} 인쇄 선택`);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selected.add(item.id); else selected.delete(item.id);
      card.classList.toggle('is-selected', checkbox.checked);
      updateSelected();
    });
    label.append(checkbox, document.createTextNode('인쇄 선택'));
    const permalink = node('a', 'library-permalink', '이 자료 링크');
    permalink.href = `#tool-${item.id}`;
    permalink.setAttribute('aria-label', `${item.name} 직접 링크`);
    bottom.append(label, permalink);
    card.append(bottom);
    card.dataset.search = [item.name, item.tagline, item.result, item.prompt, kindNames[item.kind]].join(' ').normalize('NFKC').toLocaleLowerCase('ko');
    sections.get(item.category).grid.append(card);
    cards.set(item.id, {card, detail, checkbox, item});
  }
  const buttonArea = document.getElementById('category-buttons');
  for (const [id, title] of [['all','모든 업무'], ...categories]) {
    const button = node('button', '', title);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(id === category));
    button.addEventListener('click', () => { category = id; filter(); });
    categoryButtons.set(id, button);
    buttonArea.append(button);
  }
  function filter() {
    const terms = search.value.trim().normalize('NFKC').toLocaleLowerCase('ko').split(/\s+/).filter(Boolean);
    const counts = new Map(categories.map(([id]) => [id, 0]));
    let count = 0;
    for (const {card, item} of cards.values()) {
      const show = (category === 'all' || item.category === category) &&
        (kind.value === 'all' || item.kind === kind.value) &&
        (audience.value === 'all' || item.audiences.includes(audience.value)) &&
        terms.every(term => card.dataset.search.includes(term));
      card.hidden = !show;
      if (show) { count++; counts.set(item.category, counts.get(item.category) + 1); }
    }
    for (const [id, {section, count:label}] of sections) {
      section.hidden = counts.get(id) === 0;
      label.textContent = `${counts.get(id)}개`;
    }
    for (const [id, button] of categoryButtons) button.setAttribute('aria-pressed', String(id === category));
    document.getElementById('tool-count').textContent = `전체 ${items.length}개 중 ${count}개 자료`;
    document.getElementById('library-empty').hidden = count !== 0;
    document.getElementById('print-overview').disabled = count === 0;
  }
  function reset() { search.value = ''; kind.value = 'all'; audience.value = 'all'; category = 'all'; filter(); }
  function openHash() {
    if (!location.hash.startsWith('#tool-')) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(6)); } catch { return; }
    const entry = cards.get(id);
    if (!entry) return;
    reset();
    entry.detail.open = true;
    requestAnimationFrame(() => entry.card.scrollIntoView({block:'start', behavior:'auto'}));
  }
  function preparePrint(mode) {
    if (printSnapshot) return;
    printSnapshot = {
      details: [...cards.values()].map(({detail}) => detail.open),
      counts: [...sections.values()].map(({count}) => count.textContent)
    };
    document.body.dataset.libraryPrint = mode;
    for (const [id, {card, detail}] of cards) {
      card.classList.toggle('print-omit', mode === 'selected' ? !selected.has(id) : card.hidden);
      card.classList.toggle('print-include', mode === 'selected' && selected.has(id));
      if (mode === 'selected' && selected.has(id)) detail.open = true;
    }
    for (const {section, grid, count} of sections.values()) {
      const included = [...grid.children].filter(c => !c.classList.contains('print-omit')).length;
      section.classList.toggle('print-omit', included === 0);
      count.textContent = `${included}개`;
    }
  }
  function restorePrint() {
    if (!printSnapshot) return;
    [...cards.values()].forEach(({card, detail}, i) => {
      detail.open = printSnapshot.details[i];
      card.classList.remove('print-omit', 'print-include');
    });
    [...sections.values()].forEach(({section,count},i) => {
      section.classList.remove('print-omit');
      count.textContent = printSnapshot.counts[i];
    });
    delete document.body.dataset.libraryPrint;
    printSnapshot = null;
    printing = false;
  }
  function print(mode) {
    if (printing) return;
    if (mode === 'selected' && !selected.size) return;
    printing = true;
    preparePrint(mode);
    try { window.print(); } finally { restorePrint(); }
  }
  search.addEventListener('input', filter);
  kind.addEventListener('change', filter);
  audience.addEventListener('change', filter);
  document.getElementById('tool-reset').addEventListener('click', reset);
  document.getElementById('library-filters').addEventListener('submit', e => e.preventDefault());
  document.getElementById('print-overview').addEventListener('click', () => print('overview'));
  document.getElementById('print-selected').addEventListener('click', () => print('selected'));
  window.addEventListener('beforeprint', () => {
    preparePrint(document.body.dataset.libraryPrint || 'overview');
    // The shared theme expands details before printing; summary printing hides them in CSS.
    for (const {detail} of cards.values()) if (document.body.dataset.libraryPrint === 'selected') detail.open = true;
  });
  window.addEventListener('afterprint', restorePrint);
  window.addEventListener('hashchange', openHash);
  for (const control of document.querySelectorAll('#library-filters input, #library-filters select, #tool-reset')) control.disabled = false;
  filter();
  updateSelected();
  openHash();
})();
