const state = {
  assets: [],
  presets: [],
  macro: [],
  scenario: {
    initialCapital: 100000000,
    monthlyContribution: 0,
    horizonYears: 10,
    targetAnnualIncome: 4000000,
    dividendReinvest: true,
    riskTolerance: "medium"
  },
  activePreset: null
};

const formatWon = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0
});

const formatNumber = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2
});

const $ = (selector) => document.querySelector(selector);

const readNumber = (id, fallback = 0) => {
  const value = Number($(id).value);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
};

async function loadData() {
  const [assetResponse, macroResponse] = await Promise.all([
    fetch("data/assets.json"),
    fetch("data/macro.json")
  ]);

  if (!assetResponse.ok || !macroResponse.ok) {
    throw new Error("데이터 파일을 불러오지 못했습니다.");
  }

  const assetData = await assetResponse.json();
  const macroData = await macroResponse.json();

  state.assets = assetData.assets;
  state.presets = assetData.presets;
  state.macro = macroData.indicators;
  $("#dataDate").textContent = `${assetData.asOf} / ${macroData.asOf}`;
}

function syncScenarioFromForm() {
  state.scenario = {
    initialCapital: readNumber("#initialCapital"),
    monthlyContribution: readNumber("#monthlyContribution"),
    horizonYears: Math.max(1, Math.min(40, readNumber("#horizonYears", 10))),
    targetAnnualIncome: readNumber("#targetAnnualIncome"),
    dividendReinvest: $("#dividendReinvest").checked,
    riskTolerance: $("#riskTolerance").value
  };
}

function applyPreset(preset) {
  state.activePreset = preset.id;
  $("#initialCapital").value = preset.initialCapital;
  $("#monthlyContribution").value = preset.monthlyContribution;
  $("#horizonYears").value = preset.horizonYears;
  $("#targetAnnualIncome").value = preset.targetAnnualIncome;
  $("#dividendReinvest").checked = preset.dividendReinvest;
  $("#riskTolerance").value = preset.riskTolerance;
  syncScenarioFromForm();
  render();
}

function calculateAsset(asset) {
  const scenario = state.scenario;
  const months = scenario.horizonYears * 12;
  const monthlyGrowth = Math.pow(1 + asset.assumedAnnualReturnPct / 100, 1 / 12) - 1;
  const monthlyYield = asset.assumedDividendYieldPct / 100 / 12;
  let value = scenario.initialCapital;
  let cashIncome = 0;

  for (let month = 0; month < months; month += 1) {
    value += scenario.monthlyContribution;
    const distribution = value * monthlyYield;
    if (scenario.dividendReinvest) {
      value += distribution;
    } else {
      cashIncome += distribution;
    }
    value *= 1 + monthlyGrowth;
  }

  const annualIncome = value * (asset.assumedDividendYieldPct / 100);
  return {
    ticker: asset.ticker,
    projectedValue: value,
    annualIncome,
    cashIncome,
    fitScore: scoreAsset(asset, value, annualIncome),
    fitNote: getFitNote(asset, annualIncome)
  };
}

function scoreAsset(asset, projectedValue, annualIncome) {
  const scenario = state.scenario;
  let score = 0;

  if (scenario.targetAnnualIncome > 0) {
    const incomeRatio = Math.min(annualIncome / scenario.targetAnnualIncome, 1.4);
    score += incomeRatio * 42;
  } else {
    score += asset.category === "Growth" ? 34 : 18;
  }

  const growthRatio = projectedValue / Math.max(scenario.initialCapital + scenario.monthlyContribution * scenario.horizonYears * 12, 1);
  score += Math.min(growthRatio, 2.5) * 18;

  if (scenario.riskTolerance === "high" && asset.volatility === "High") score += 24;
  if (scenario.riskTolerance === "medium" && asset.volatility === "Medium") score += 24;
  if (scenario.riskTolerance === "low" && asset.volatility !== "High") score += 18;
  if (scenario.riskTolerance === "low" && asset.volatility === "High") score -= 18;

  if (!scenario.dividendReinvest && asset.category === "Income") score += 18;
  if (scenario.dividendReinvest && asset.category !== "Income") score += 10;

  return Math.round(score);
}

function getFitNote(asset, annualIncome) {
  const target = state.scenario.targetAnnualIncome;
  const incomeText = target > 0
    ? `목표 연 현금흐름의 약 ${Math.round((annualIncome / target) * 100)}% 수준입니다.`
    : "현금흐름 목표가 없으므로 성장성과 변동성 감내도를 더 크게 봅니다.";

  if (asset.category === "Growth") {
    return `성장 목적에 가까운 구조입니다. ${incomeText}`;
  }
  if (asset.category === "Dividend Growth") {
    return `성장과 배당의 균형을 보는 구조입니다. ${incomeText}`;
  }
  return `정기 현금흐름 목적에 가까운 구조입니다. ${incomeText}`;
}

function renderPresets() {
  $("#presetList").innerHTML = state.presets.map((preset) => `
    <button class="preset-button ${state.activePreset === preset.id ? "active" : ""}" type="button" data-preset="${preset.id}">
      ${preset.label}
    </button>
  `).join("");

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const preset = state.presets.find((item) => item.id === button.dataset.preset);
      if (preset) applyPreset(preset);
    });
  });
}

function renderResults(results) {
  const best = [...results].sort((a, b) => b.fitScore - a.fitScore)[0];
  const bestAsset = state.assets.find((asset) => asset.ticker === best.ticker);

  $("#summary").innerHTML = `
    <div class="metric">
      <span>조건상 가장 가까운 구조</span>
      <strong>${best.ticker}</strong>
    </div>
    <div class="metric">
      <span>예상 평가금액</span>
      <strong>${formatWon.format(best.projectedValue)}</strong>
    </div>
    <div class="metric">
      <span>예상 연 분배금</span>
      <strong>${formatWon.format(best.annualIncome)}</strong>
    </div>
  `;

  $("#resultCards").innerHTML = results.map((result) => {
    const asset = state.assets.find((item) => item.ticker === result.ticker);
    const isBest = result.ticker === best.ticker;
    return `
      <article class="result-card ${isBest ? "best" : ""}">
        <div class="card-label">${asset.role}</div>
        <div class="card-title">
          <h3>${asset.ticker}</h3>
          <span class="badge ${isBest ? "best" : ""}">${isBest ? "조건상 가까움" : `점수 ${result.fitScore}`}</span>
        </div>
        <dl class="stat-list">
          <div class="stat-row"><dt>예상 평가금액</dt><dd>${formatWon.format(result.projectedValue)}</dd></div>
          <div class="stat-row"><dt>예상 연 분배금</dt><dd>${formatWon.format(result.annualIncome)}</dd></div>
          <div class="stat-row"><dt>분배금 별도 수령</dt><dd>${formatWon.format(result.cashIncome)}</dd></div>
        </dl>
        <p class="fit-note">${result.fitNote}</p>
      </article>
    `;
  }).join("");

  renderPrompt(best, bestAsset, results);
}

function renderAssetControls() {
  $("#assetControls").innerHTML = state.assets.map((asset) => `
    <article class="asset-card">
      <div class="card-label">${asset.category}</div>
      <h3>${asset.ticker} · ${asset.role}</h3>
      <p>${asset.summary}</p>
      <div class="assumption-grid">
        <label>
          <span>가정 수익률(연)</span>
          <div class="field-with-unit">
            <input type="number" min="-30" max="40" step="0.1" value="${asset.assumedAnnualReturnPct}" data-assumption="${asset.ticker}:return">
            <em>%</em>
          </div>
        </label>
        <label>
          <span>가정 분배율(연)</span>
          <div class="field-with-unit">
            <input type="number" min="0" max="25" step="0.1" value="${asset.assumedDividendYieldPct}" data-assumption="${asset.ticker}:yield">
            <em>%</em>
          </div>
        </label>
      </div>
      <dl class="stat-list">
        <div class="stat-row"><dt>비용률</dt><dd>${asset.expenseRatioPct}%</dd></div>
        <div class="stat-row"><dt>변동성</dt><dd>${asset.volatility}</dd></div>
      </dl>
      <p><strong>맞는 사용자:</strong> ${asset.bestFor}</p>
      <p><strong>확인할 위험:</strong> ${asset.watchOut}</p>
      <a class="source-link" href="${asset.sourceUrl}" target="_blank" rel="noopener">공식 출처 보기</a>
    </article>
  `).join("");

  document.querySelectorAll("[data-assumption]").forEach((input) => {
    input.addEventListener("input", () => {
      const [ticker, field] = input.dataset.assumption.split(":");
      const asset = state.assets.find((item) => item.ticker === ticker);
      const value = Number(input.value);
      if (!asset || !Number.isFinite(value)) return;
      if (field === "return") asset.assumedAnnualReturnPct = value;
      if (field === "yield") asset.assumedDividendYieldPct = value;
      renderResults(getResults());
    });
  });
}

function renderMacro() {
  $("#macroGrid").innerHTML = state.macro.map((indicator) => `
    <article class="macro-card">
      <div class="card-label">${indicator.asOf}</div>
      <h3>${indicator.label}</h3>
      <div class="macro-value">
        <strong>${formatNumber.format(indicator.value)}</strong>
        <span>${indicator.unit}</span>
      </div>
      <p>${indicator.interpretation}</p>
      <ol class="question-list">
        ${indicator.investorQuestions.map((question) => `<li>${question}</li>`).join("")}
      </ol>
      <a class="source-link" href="${indicator.sourceUrl}" target="_blank" rel="noopener">${indicator.sourceName}</a>
    </article>
  `).join("");
}

function renderPrompt(best, bestAsset, results) {
  const scenario = state.scenario;
  const ranked = [...results].sort((a, b) => b.fitScore - a.fitScore);
  const comparison = ranked.map((result) => {
    const asset = state.assets.find((item) => item.ticker === result.ticker);
    return `- ${asset.ticker}: 예상 평가금액 ${formatWon.format(result.projectedValue)}, 예상 연 분배금 ${formatWon.format(result.annualIncome)}, 역할 ${asset.role}`;
  }).join("\n");

  $("#copyPrompt").value = `아래 투자 시나리오를 투자 추천이 아니라 학습용 판단표로 정리해줘.

[내 조건]
- 초기 투자금: ${formatWon.format(scenario.initialCapital)}
- 월 추가납입: ${formatWon.format(scenario.monthlyContribution)}
- 투자 기간: ${scenario.horizonYears}년
- 목표 연 현금흐름: ${formatWon.format(scenario.targetAnnualIncome)}
- 분배금 재투자: ${scenario.dividendReinvest ? "예" : "아니오"}
- 위험 감내도: ${scenario.riskTolerance}

[시뮬레이션 비교]
${comparison}

[조건상 가장 가까운 구조]
- ${bestAsset.ticker}: ${bestAsset.role}
- 단, 이것은 추천이 아니라 가정값 기준의 구조 비교입니다.

다음 형식으로 정리해줘.
1. 내 조건에서 가장 중요한 판단 기준 3개
2. ${bestAsset.ticker} 구조가 맞을 수 있는 이유
3. 반대로 틀릴 수 있는 위험
4. QQQ, SCHD, JEPI 각각에 대해 추가로 확인할 공식 자료
5. 최종 결론은 매수/매도/보유가 아니라 보류/관심/추가검토 중 하나로만 표시`;
}

function getResults() {
  return state.assets.map(calculateAsset).sort((a, b) => b.fitScore - a.fitScore);
}

function render() {
  renderPresets();
  renderAssetControls();
  renderMacro();
  renderResults(getResults());
}

function bindEvents() {
  $("#scenarioForm").addEventListener("input", () => {
    state.activePreset = null;
    syncScenarioFromForm();
    renderPresets();
    renderResults(getResults());
  });

  $("#copyButton").addEventListener("click", async () => {
    const prompt = $("#copyPrompt").value;
    try {
      await navigator.clipboard.writeText(prompt);
      $("#copyStatus").textContent = "복사했습니다.";
    } catch {
      $("#copyPrompt").select();
      document.execCommand("copy");
      window.getSelection()?.removeAllRanges();
      $("#copyPrompt").blur();
      $("#copyStatus").textContent = "복사했습니다.";
    }
    window.setTimeout(() => {
      $("#copyStatus").textContent = "";
    }, 1800);
  });
}

async function init() {
  try {
    await loadData();
    bindEvents();
    render();
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
