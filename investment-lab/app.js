const state = {
  assets: [],
  industries: [],
  tenbagger: null,
  tenbaggerAnswers: {},
  dataDate: "",
  activeTab: "compare",
  activeIndustryId: "technology"
};

const dataVersion = "20260614-tenbagger-buckets";

const tenbaggerThemeCoreTags = {
  "ai-infra": ["ai-infra", "semiconductor", "data-center"],
  "ai-software": ["ai-software", "enterprise-ai"],
  "defense-space": ["defense", "space"],
  "robotics-bio": ["robotics", "bio", "automation"]
};

const won = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0
});

const plainNumber = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 0
});

const decimal = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2
});

const $ = (selector) => document.querySelector(selector);

function parseMoney(value) {
  const number = Number(String(value).replace(/[^\d]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function formatMoneyInput(input) {
  const value = parseMoney(input.value);
  input.value = value ? plainNumber.format(value) : "";
}

function bindMoneyInput(input) {
  input.addEventListener("input", () => {
    const startAtEnd = input.selectionStart === input.value.length;
    formatMoneyInput(input);
    if (startAtEnd) input.setSelectionRange(input.value.length, input.value.length);
    renderActiveTool();
  });
  input.addEventListener("blur", () => formatMoneyInput(input));
}

async function loadData() {
  const [assetResponse, industryResponse, tenbaggerResponse] = await Promise.all([
    fetch(`data/assets.json?v=${dataVersion}`),
    fetch(`data/industry-etfs.json?v=${dataVersion}`),
    fetch(`data/tenbagger-candidates.json?v=${dataVersion}`)
  ]);

  if (!assetResponse.ok || !industryResponse.ok || !tenbaggerResponse.ok) {
    throw new Error("데이터 파일을 불러오지 못했습니다.");
  }

  const assetData = await assetResponse.json();
  const industryData = await industryResponse.json();
  const tenbaggerData = await tenbaggerResponse.json();
  state.assets = assetData.assets;
  state.industries = industryData.industries;
  state.tenbagger = tenbaggerData;
  state.tenbaggerAnswers = Object.fromEntries(
    tenbaggerData.questions.map((question) => [question.id, question.options[0].id])
  );
  state.dataDate = `${assetData.asOf} / ${industryData.asOf} / ${tenbaggerData.asOf}`;
  $("#dataDate").textContent = state.dataDate;
}

function compareScenario() {
  return {
    amount: parseMoney($("#compareAmount").value),
    years: Number($("#compareYears").value),
    reinvest: $("#reinvestMode").value === "yes"
  };
}

function calculateGrowth(asset, scenario) {
  let value = scenario.amount;
  let receivedCash = 0;
  const years = scenario.years;
  const annualReturn = asset.assumedAnnualReturnPct / 100;
  const annualYield = asset.assumedDividendYieldPct / 100;

  for (let year = 0; year < years; year += 1) {
    const distribution = value * annualYield;
    if (scenario.reinvest) {
      value += distribution;
    } else {
      receivedCash += distribution;
    }
    value *= 1 + annualReturn;
  }

  return {
    ticker: asset.ticker,
    projectedValue: value,
    receivedCash,
    annualIncomeAtEnd: value * annualYield,
    totalMultiple: scenario.amount > 0 ? value / scenario.amount : 0
  };
}

function renderTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.activeTab);
  });
  document.querySelectorAll(".tool-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${state.activeTab}Tab`);
  });
}

function renderCompare() {
  const scenario = compareScenario();
  const results = state.assets.map((asset) => ({
    asset,
    result: calculateGrowth(asset, scenario)
  }));

  $("#growthExplanation").textContent = scenario.reinvest
    ? `${won.format(scenario.amount)}을 ${scenario.years}년 동안 두고, 2016-2025 가격 연평균 수익률과 평균 분배율이 반복된다고 단순 계산했습니다. 실제 미래도 이렇게 된다는 뜻은 아닙니다.`
    : `${won.format(scenario.amount)}을 ${scenario.years}년 동안 두되, 분배금은 생활비처럼 따로 받는다고 계산했습니다. 평가액과 받은 분배금은 분리해서 봐야 합니다.`;

  $("#decisionFrame").innerHTML = `
    <strong>이 비교의 핵심</strong>
    <p>QQQ가 숫자로 앞선다고 모든 목적에 맞는 것은 아닙니다. 아래 세 상품은 수익률 순위가 아니라 서로 다른 질문을 만드는 예시입니다.</p>
    <div class="decision-grid">
      ${state.assets.map((asset) => `
        <article>
          <span>${asset.ticker}</span>
          <strong>${asset.decisionReason}</strong>
          <p>${asset.fitWhen}</p>
        </article>
      `).join("")}
    </div>
  `;

  $("#compareResults").innerHTML = results.map(({ asset, result }) => `
    <article class="compare-card">
      <div class="card-top">
        <div>
          <span class="card-kicker">${asset.role}</span>
          <h3>${asset.ticker}</h3>
        </div>
        <span class="plain-badge">${asset.category}</span>
      </div>
      <dl class="big-stats">
        <div>
          <dt>${scenario.years}년 뒤 단순계산 평가액</dt>
          <dd>${won.format(result.projectedValue)}</dd>
        </div>
        <div>
          <dt>원금 대비</dt>
          <dd>${decimal.format(result.totalMultiple)}배</dd>
        </div>
        <div>
          <dt>가격 연평균 / 평균 분배율</dt>
          <dd>${asset.assumedAnnualReturnPct}% / ${asset.assumedDividendYieldPct}%</dd>
        </div>
        <div>
          <dt>그동안 받은 분배금</dt>
          <dd>${won.format(result.receivedCash)}</dd>
        </div>
      </dl>
      <p class="plain-note">${getPlainAssetExplanation(asset, scenario)}</p>
      <p class="lesson-note">${asset.classLesson}</p>
      <p class="data-note">${getPerformanceNote(asset)}</p>
    </article>
  `).join("");

  $("#comparePrompt").value = makeComparePrompt(scenario, results);
}

function getPlainAssetExplanation(asset, scenario) {
  if (asset.ticker === "QQQ") {
    return "성장주 중심이라 평가액이 크게 움직일 수 있습니다. 배당보다 가격 상승의 영향이 큽니다.";
  }
  if (asset.ticker === "SCHD") {
    return "배당과 가격 성장을 함께 보는 구조입니다. 분배금을 다시 투자하면 복리 효과가 커집니다.";
  }
  return "분배율은 높았지만, 가격 상승은 별도로 봐야 하는 현금흐름형 구조입니다. 상승장에서는 덜 따라갈 수 있습니다.";
}

function getPerformanceNote(asset) {
  if (asset.ticker === "JEPI") {
    return `데이터 기간: ${asset.performanceStart}~${asset.performanceEnd}. 가격수익률 ${asset.assumedAnnualReturnPct}%, 분배금 재투자 총수익률 ${asset.historicalTotalReturnCagrPct}%. JEPI는 10년 전체 비교가 아닙니다.`;
  }
  return `데이터 기간: ${asset.performanceStart}~${asset.performanceEnd}. 가격수익률 ${asset.assumedAnnualReturnPct}%, 분배금 재투자 총수익률 ${asset.historicalTotalReturnCagrPct}%.`;
}

function renderAssumptions() {
  $("#assumptionControls").innerHTML = state.assets.map((asset) => `
    <div class="assumption-card">
      <h3>${asset.ticker}</h3>
      <label>
        <span>가격 연평균 수익률</span>
        <div class="percent-input">
          <input type="number" min="-30" max="40" step="0.5" value="${asset.assumedAnnualReturnPct}" data-assumption="${asset.ticker}:return">
          <em>%</em>
        </div>
      </label>
      <label>
        <span>평균 분배율</span>
        <div class="percent-input">
          <input type="number" min="0" max="25" step="0.5" value="${asset.assumedDividendYieldPct}" data-assumption="${asset.ticker}:yield">
          <em>%</em>
        </div>
      </label>
      <a href="${asset.sourceUrl}" target="_blank" rel="noopener">공식 자료 보기</a>
    </div>
  `).join("");

  document.querySelectorAll("[data-assumption]").forEach((input) => {
    input.addEventListener("input", () => {
      const [ticker, field] = input.dataset.assumption.split(":");
      const asset = state.assets.find((item) => item.ticker === ticker);
      const value = Number(input.value);
      if (!asset || !Number.isFinite(value)) return;
      if (field === "return") asset.assumedAnnualReturnPct = value;
      if (field === "yield") asset.assumedDividendYieldPct = value;
      renderCompare();
    });
  });
}

function renderIndustryButtons() {
  $("#industryButtons").innerHTML = state.industries.map((industry) => `
    <button class="${industry.id === state.activeIndustryId ? "active" : ""}" type="button" data-industry="${industry.id}">
      <span>${industry.label}</span>
      <small>${industry.ticker}</small>
    </button>
  `).join("");

  document.querySelectorAll("[data-industry]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeIndustryId = button.dataset.industry;
      renderIndustry();
    });
  });
}

function calculateTenYearAssumption(industry) {
  const initial = 100000000;
  let value = initial;
  let received = 0;
  for (let year = 0; year < 10; year += 1) {
    received += value * (industry.assumedDistributionYieldPct / 100);
    value *= 1 + industry.assumedAnnualReturnPct / 100;
  }
  return { value, received, multiple: value / initial };
}

function renderIndustry() {
  renderIndustryButtons();
  const industry = state.industries.find((item) => item.id === state.activeIndustryId) || state.industries[0];
  if (!industry) return;
  const tenYear = calculateTenYearAssumption(industry);

  $("#industryDetail").innerHTML = `
    <article class="industry-detail">
      <div class="card-top">
        <div>
          <span class="card-kicker">${industry.label} 대표 ETF</span>
          <h3>${industry.ticker} · ${industry.name}</h3>
        </div>
        <span class="plain-badge">${industry.manager}</span>
      </div>

      <p class="industry-question">${industry.question}</p>

      <div class="industry-layout">
        <section>
          <h4>어떤 전략인가요?</h4>
          <p>${industry.strategy}</p>
        </section>
        <section>
          <h4>왜 많이 보나요?</h4>
          <p>${industry.whyPopular}</p>
        </section>
        <section>
          <h4>주의할 점</h4>
          <p>${industry.risk}</p>
        </section>
      </div>

      <dl class="big-stats">
        <div>
          <dt>2016-2025 가격 연평균</dt>
          <dd>${industry.assumedAnnualReturnPct}%</dd>
        </div>
        <div>
          <dt>분배금 재투자 총수익률</dt>
          <dd>${industry.historicalTotalReturnCagrPct}%</dd>
        </div>
        <div>
          <dt>평균 분배율</dt>
          <dd>${industry.assumedDistributionYieldPct}%</dd>
        </div>
        <div>
          <dt>1억 10년 단순계산</dt>
          <dd>${won.format(tenYear.value)}</dd>
        </div>
        <div>
          <dt>10년 받은 분배금 계산</dt>
          <dd>${won.format(tenYear.received)}</dd>
        </div>
      </dl>

      <div class="holdings-box">
        <h4>대표 구성종목 예시</h4>
        <div class="holding-list">
          ${industry.holdingsExamples.map((name) => `<span>${name}</span>`).join("")}
        </div>
        <p>구성종목과 비중은 수시로 바뀝니다. 위 목록은 산업을 이해하기 위한 예시입니다.</p>
      </div>

      <a class="source-link" href="${industry.sourceUrl}" target="_blank" rel="noopener">${industry.sourceName}</a>
    </article>
  `;

  $("#industryPrompt").value = makeIndustryPrompt(industry, tenYear);
}

function selectedTenbaggerOptions() {
  return state.tenbagger.questions.map((question) => (
    {
      questionId: question.id,
      ...(question.options.find((option) => option.id === state.tenbaggerAnswers[question.id]) || question.options[0])
    }
  ));
}

function scoreTenbaggerCandidate(candidate, selectedOptions) {
  const themeOption = selectedOptions.find((option) => option.questionId === "theme");
  const sizeOption = selectedOptions.find((option) => option.questionId === "size");
  const themeTags = themeOption ? (tenbaggerThemeCoreTags[themeOption.id] || themeOption.tags) : [];
  const sizeTags = sizeOption ? sizeOption.tags : [];
  const supportTags = selectedOptions
    .filter((option) => option.questionId !== "theme" && option.questionId !== "size")
    .flatMap((option) => option.tags);
  const themeMatches = candidate.tags.filter((tag) => themeTags.includes(tag));
  const sizeMatches = candidate.tags.filter((tag) => sizeTags.includes(tag));
  const supportMatches = candidate.tags.filter((tag) => supportTags.includes(tag));
  const uniqueMatches = [...new Set([...themeMatches, ...sizeMatches, ...supportMatches])];
  const themeBonus = themeMatches.length > 0 ? 20 : -35;
  const sizePenalty = sizeMatches.length > 0 ? 0 : -70;
  const score = themeMatches.length * 40 + sizeMatches.length * 35 + supportMatches.length * 10 + themeBonus + sizePenalty;
  return { ...candidate, matchedTags: uniqueMatches, score };
}

function tenbaggerResults() {
  const selectedOptions = selectedTenbaggerOptions();
  const themeOption = selectedOptions.find((option) => option.questionId === "theme");
  const sizeOption = selectedOptions.find((option) => option.questionId === "size");
  const bucketKey = `${themeOption?.id || ""}:${sizeOption?.id || ""}`;
  const bucketTickers = state.tenbagger.scenarioBuckets?.[bucketKey] || [];
  const candidatePool = bucketTickers.length
    ? bucketTickers
      .map((ticker) => state.tenbagger.candidates.find((candidate) => candidate.ticker === ticker))
      .filter(Boolean)
    : state.tenbagger.candidates;
  const scored = candidatePool
    .map((candidate) => scoreTenbaggerCandidate(candidate, selectedOptions))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "ko"));

  return {
    selectedOptions,
    korea: scored.filter((candidate) => candidate.market === "korea").slice(0, 2),
    global: scored.filter((candidate) => candidate.market === "global").slice(0, 2)
  };
}

function renderTenbagger() {
  if (!state.tenbagger) return;
  const result = tenbaggerResults();

  $("#tenbaggerQuiz").innerHTML = state.tenbagger.questions.map((question, index) => `
    <fieldset class="quiz-card">
      <legend>${index + 1}. ${question.label}</legend>
      <div class="quiz-options">
        ${question.options.map((option) => `
          <button class="${state.tenbaggerAnswers[question.id] === option.id ? "active" : ""}" type="button" data-question="${question.id}" data-option="${option.id}">
            <strong>${option.label}</strong>
            <span>${option.description}</span>
          </button>
        `).join("")}
      </div>
    </fieldset>
  `).join("");

  $("#tenbaggerResult").innerHTML = `
    <div class="result-summary">
      <strong>최종 결론</strong>
      <p>당신의 답변으로는 국내 후보 2개와 해외 후보 2개를 먼저 공부해볼 만합니다. 이 결과는 매수 추천이 아니라, 어떤 근거를 더 확인해야 하는지 보여주는 수업용 결론입니다.</p>
      <div class="answer-tags">
        ${result.selectedOptions.map((option) => `<span>${option.label}</span>`).join("")}
      </div>
    </div>

    <div class="tenbagger-groups">
      ${renderTenbaggerGroup("국내 후보 2", result.korea)}
      ${renderTenbaggerGroup("해외 후보 2", result.global)}
    </div>
  `;

  $("#tenbaggerPrompt").value = makeTenbaggerPrompt(result);

  document.querySelectorAll("[data-question][data-option]").forEach((button) => {
    button.addEventListener("click", () => {
      state.tenbaggerAnswers[button.dataset.question] = button.dataset.option;
      renderTenbagger();
    });
  });
}

function renderTenbaggerGroup(title, candidates) {
  return `
    <section class="tenbagger-group">
      <h3>${title}</h3>
      <div class="tenbagger-list">
        ${candidates.map((candidate) => `
          <article class="tenbagger-card">
            <div class="card-top">
              <div>
                <span class="card-kicker">${candidate.theme}</span>
                <h4>${candidate.name}</h4>
                <p>${candidate.ticker}</p>
              </div>
              <span class="plain-badge">${candidate.score}점</span>
            </div>
            <p class="tenbagger-thesis">${candidate.thesis}</p>
            <div class="match-tags">
              ${(candidate.matchedTags.length ? candidate.matchedTags : ["학습 후보"]).slice(0, 5).map((tag) => `<span>${tag}</span>`).join("")}
            </div>
            <h5>근거</h5>
            <ul>
              ${candidate.evidence.map((item) => `<li>${item}</li>`).join("")}
            </ul>
            <p class="risk-note"><strong>위험:</strong> ${candidate.risks}</p>
            <a class="source-link" href="${candidate.sourceUrl}" target="_blank" rel="noopener">${candidate.sourceName}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function makeComparePrompt(scenario, results) {
  const rows = results.map(({ asset, result }) =>
    `- ${asset.ticker}: ${asset.decisionReason}, ${scenario.years}년 뒤 단순계산 평가액 ${won.format(result.projectedValue)}, 원금 대비 ${decimal.format(result.totalMultiple)}배, 그동안 받은 분배금 ${won.format(result.receivedCash)}, 가격 연평균 수익률 ${asset.assumedAnnualReturnPct}%, 분배금 재투자 총수익률 ${asset.historicalTotalReturnCagrPct}%, 평균 분배율 ${asset.assumedDividendYieldPct}%`
  ).join("\n");

  return `아래 ETF 비교를 투자 추천이 아니라 학습용 판단표로 정리해줘.

[조건]
- 처음 넣는 돈: ${won.format(scenario.amount)}
- 기간: ${scenario.years}년
- 분배금 처리: ${scenario.reinvest ? "다시 투자한다고 단순계산" : "생활비처럼 따로 받는다고 단순계산"}

[비교 결과]
${rows}

다음 4가지를 쉬운 말로 정리해줘.
1. 단순계산 평가액이 달라지는 이유
2. QQQ, SCHD, JEPI를 서로 다른 목적에서 비교해야 하는 이유
3. 이 계산에서 빠진 위험
4. 실제 투자 전에 확인할 공식 자료`;
}

function makeIndustryPrompt(industry, tenYear) {
  return `아래 산업 ETF를 투자 추천이 아니라 산업 공부용으로 설명해줘.

[선택 산업]
- 산업: ${industry.label}
- 대표 ETF: ${industry.ticker} (${industry.name})
- 전략: ${industry.strategy}
- 왜 많이 보는지: ${industry.whyPopular}
- 2016-2025 가격 연평균 수익률: ${industry.assumedAnnualReturnPct}%
- 2016-2025 분배금 재투자 총수익률: ${industry.historicalTotalReturnCagrPct}%
- 2016-2025 평균 분배율: ${industry.assumedDistributionYieldPct}%
- 1억 원 10년 단순계산 평가액: ${won.format(tenYear.value)}
- 10년 받은 분배금 단순계산: ${won.format(tenYear.received)}
- 대표 구성종목 예시: ${industry.holdingsExamples.join(", ")}

다음 형식으로 쉽게 정리해줘.
1. 이 산업 ETF가 무엇에 투자하는지
2. 이 산업이 좋아질 때 필요한 조건
3. 반대로 조심해야 할 위험
4. 대표 구성종목을 볼 때 확인할 질문
5. 이 ETF를 지금 사라는 결론 없이, 공부할 체크리스트만 작성`;
}

function makeTenbaggerPrompt(result) {
  const rows = [...result.korea, ...result.global].map((candidate) => (
    `- ${candidate.name}(${candidate.ticker}): ${candidate.theme}, 점수 ${candidate.score}, 논리: ${candidate.thesis}, 위험: ${candidate.risks}`
  )).join("\n");
  const answers = result.selectedOptions.map((option) => option.label).join(", ");

  return `아래 결과를 투자 추천이 아니라 텐배거 후보를 공부하는 수업용 토론 자료로 정리해줘.

[학습자 선택]
${answers}

[도출 후보]
${rows}

다음 형식으로 정리해줘.
1. 왜 이 네 종목이 나왔는지
2. 각 종목이 10배가 되려면 필요한 조건
3. 반대로 실패할 수 있는 이유
4. 실제 투자 전에 반드시 확인할 숫자와 공식 자료
5. 매수/매도 결론 없이 토론 질문 3개`;
}

function copyText(textareaSelector, statusSelector) {
  const text = $(textareaSelector).value;
  navigator.clipboard.writeText(text).then(() => {
    $(statusSelector).textContent = "복사했습니다.";
    window.setTimeout(() => {
      $(statusSelector).textContent = "";
    }, 1600);
  }).catch(() => {
    $(textareaSelector).select();
    document.execCommand("copy");
    window.getSelection()?.removeAllRanges();
    $(textareaSelector).blur();
    $(statusSelector).textContent = "복사했습니다.";
  });
}

function renderActiveTool() {
  if (state.activeTab === "compare") renderCompare();
  if (state.activeTab === "industry") renderIndustry();
  if (state.activeTab === "tenbagger") renderTenbagger();
}

function renderAll() {
  renderTabs();
  renderAssumptions();
  renderCompare();
  renderIndustry();
  renderTenbagger();
}

function bindEvents() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      renderTabs();
    });
  });

  bindMoneyInput($("#compareAmount"));

  $("#compareYears").addEventListener("change", renderCompare);
  $("#reinvestMode").addEventListener("change", renderCompare);

  document.querySelectorAll("[data-amount]").forEach((button) => {
    button.addEventListener("click", () => {
      const amount = plainNumber.format(Number(button.dataset.amount));
      $("#compareAmount").value = amount;
      renderCompare();
    });
  });

  $("#copyCompare").addEventListener("click", () => copyText("#comparePrompt", "#compareCopyStatus"));
  $("#copyIndustry").addEventListener("click", () => copyText("#industryPrompt", "#industryCopyStatus"));
  $("#copyTenbagger").addEventListener("click", () => copyText("#tenbaggerPrompt", "#tenbaggerCopyStatus"));
}

async function init() {
  try {
    await loadData();
    bindEvents();
    renderAll();
  } catch (error) {
    document.body.innerHTML = `
      <main class="error-state">
        <h1>데이터를 불러오지 못했습니다.</h1>
        <p>${error.message}</p>
      </main>
    `;
  }
}

init();
