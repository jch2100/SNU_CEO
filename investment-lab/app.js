const state = {
  assets: [],
  macro: [],
  dataDate: "",
  activeTab: "compare"
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
  state.macro = macroData.indicators;
  state.dataDate = `${assetData.asOf} / ${macroData.asOf}`;
  $("#dataDate").textContent = state.dataDate;
}

function compareScenario() {
  return {
    amount: parseMoney($("#compareAmount").value),
    years: Number($("#compareYears").value),
    reinvest: $("#reinvestMode").value === "yes"
  };
}

function incomeScenario() {
  return {
    amount: parseMoney($("#incomeAmount").value),
    showMonthly: $("#incomeView").value === "monthly"
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
    ? `${won.format(scenario.amount)}을 ${scenario.years}년 동안 두고, 매년의 가정 수익률과 분배금을 다시 투자한다고 단순 계산했습니다. 그래서 원금보다 커질 수 있습니다. 실제로 이렇게 된다는 뜻은 아닙니다.`
    : `${won.format(scenario.amount)}을 ${scenario.years}년 동안 두되, 분배금은 생활비처럼 따로 받는다고 계산했습니다. 평가금액과 받은 분배금은 따로 봐야 합니다.`;

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
          <dt>${scenario.years}년 뒤 평가액 가정</dt>
          <dd>${won.format(result.projectedValue)}</dd>
        </div>
        <div>
          <dt>원금 대비</dt>
          <dd>${decimal.format(result.totalMultiple)}배</dd>
        </div>
        <div>
          <dt>가정 수익률 / 분배율</dt>
          <dd>${asset.assumedAnnualReturnPct}% / ${asset.assumedDividendYieldPct}%</dd>
        </div>
        <div>
          <dt>그동안 받은 분배금</dt>
          <dd>${won.format(result.receivedCash)}</dd>
        </div>
      </dl>
      <p class="plain-note">${getPlainAssetExplanation(asset, scenario)}</p>
    </article>
  `).join("");

  $("#comparePrompt").value = makeComparePrompt(scenario, results);
}

function renderIncome() {
  const scenario = incomeScenario();
  $("#incomeResults").innerHTML = state.assets.map((asset) => {
    const annualIncome = scenario.amount * (asset.assumedDividendYieldPct / 100);
    const monthlyIncome = annualIncome / 12;
    return `
      <article class="compare-card">
        <div class="card-top">
          <div>
            <span class="card-kicker">${asset.role}</span>
            <h3>${asset.ticker}</h3>
          </div>
          <span class="plain-badge">분배율 ${asset.assumedDividendYieldPct}% 가정</span>
        </div>
        <dl class="big-stats">
          <div>
            <dt>1년 분배금 가정</dt>
            <dd>${won.format(annualIncome)}</dd>
          </div>
          ${scenario.showMonthly ? `
          <div>
            <dt>월평균으로 나누면</dt>
            <dd>${won.format(monthlyIncome)}</dd>
          </div>` : ""}
          <div>
            <dt>계산식</dt>
            <dd>${won.format(scenario.amount)} x ${asset.assumedDividendYieldPct}%</dd>
          </div>
        </dl>
        <p class="plain-note">실제 분배금은 매월/분기마다 바뀔 수 있고, 세금과 환율은 빠져 있습니다.</p>
      </article>
    `;
  }).join("");

  $("#incomePrompt").value = makeIncomePrompt(scenario);
}

function getPlainAssetExplanation(asset, scenario) {
  if (asset.ticker === "QQQ") {
    return "성장주 중심이라 평가금액이 크게 움직일 수 있습니다. 배당보다 가격 상승 가정의 영향이 큽니다.";
  }
  if (asset.ticker === "SCHD") {
    return "배당과 가격 성장을 함께 보는 구조입니다. 분배금을 다시 투자하면 복리 효과가 커집니다.";
  }
  return "분배금 가정은 높지만, 가격 상승 가정은 낮게 둔 현금흐름형 구조입니다. 상승장에서는 덜 따라갈 수 있습니다.";
}

function renderAssumptions() {
  $("#assumptionControls").innerHTML = state.assets.map((asset) => `
    <div class="assumption-card">
      <h3>${asset.ticker}</h3>
      <label>
        <span>연 수익률 가정</span>
        <div class="percent-input">
          <input type="number" min="-30" max="40" step="0.5" value="${asset.assumedAnnualReturnPct}" data-assumption="${asset.ticker}:return">
          <em>%</em>
        </div>
      </label>
      <label>
        <span>연 분배율 가정</span>
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
      renderIncome();
    });
  });
}

function renderMacro() {
  $("#macroGrid").innerHTML = state.macro.map((indicator) => `
    <article class="macro-card">
      <span class="card-kicker">${indicator.asOf}</span>
      <h3>${indicator.label}</h3>
      <div class="macro-value">
        <strong>${decimal.format(indicator.value)}</strong>
        <span>${indicator.unit}</span>
      </div>
      <p>${indicator.interpretation}</p>
      <ol>
        ${indicator.investorQuestions.map((question) => `<li>${question}</li>`).join("")}
      </ol>
      <a href="${indicator.sourceUrl}" target="_blank" rel="noopener">${indicator.sourceName}</a>
    </article>
  `).join("");
}

function makeComparePrompt(scenario, results) {
  const rows = results.map(({ asset, result }) =>
    `- ${asset.ticker}: ${scenario.years}년 뒤 평가액 가정 ${won.format(result.projectedValue)}, 원금 대비 ${decimal.format(result.totalMultiple)}배, 그동안 받은 분배금 ${won.format(result.receivedCash)}, 가정 수익률 ${asset.assumedAnnualReturnPct}%, 가정 분배율 ${asset.assumedDividendYieldPct}%`
  ).join("\n");

  return `아래 ETF 비교를 투자 추천이 아니라 학습용 판단표로 정리해줘.

[조건]
- 처음 넣는 돈: ${won.format(scenario.amount)}
- 기간: ${scenario.years}년
- 분배금 처리: ${scenario.reinvest ? "다시 투자한다고 가정" : "생활비처럼 따로 받는다고 가정"}

[비교 결과]
${rows}

다음 4가지를 쉬운 말로 정리해줘.
1. 평가액 가정이 달라지는 이유
2. QQQ, SCHD, JEPI의 차이
3. 이 계산에서 빠진 위험
4. 실제 투자 전에 확인할 공식 자료`;
}

function makeIncomePrompt(scenario) {
  const rows = state.assets.map((asset) => {
    const annualIncome = scenario.amount * (asset.assumedDividendYieldPct / 100);
    return `- ${asset.ticker}: ${won.format(scenario.amount)} x ${asset.assumedDividendYieldPct}% = 연 ${won.format(annualIncome)} 가정`;
  }).join("\n");

  return `아래 분배금 계산을 투자 추천이 아니라 현금흐름 학습용으로 설명해줘.

[투자금]
- ${won.format(scenario.amount)}

[단순 분배금 가정]
${rows}

세금, 환율, 실제 분배금 변동, 가격 하락 가능성이 빠져 있다는 점을 포함해서 초보자도 이해할 수 있게 설명해줘.`;
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
  if (state.activeTab === "income") renderIncome();
}

function renderAll() {
  renderTabs();
  renderAssumptions();
  renderCompare();
  renderIncome();
  renderMacro();
}

function bindEvents() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      renderTabs();
    });
  });

  bindMoneyInput($("#compareAmount"));
  bindMoneyInput($("#incomeAmount"));

  $("#compareYears").addEventListener("change", renderCompare);
  $("#reinvestMode").addEventListener("change", renderCompare);
  $("#incomeView").addEventListener("change", renderIncome);

  document.querySelectorAll("[data-amount]").forEach((button) => {
    button.addEventListener("click", () => {
      const amount = plainNumber.format(Number(button.dataset.amount));
      $("#compareAmount").value = amount;
      $("#incomeAmount").value = amount;
      renderCompare();
      renderIncome();
    });
  });

  $("#copyCompare").addEventListener("click", () => copyText("#comparePrompt", "#compareCopyStatus"));
  $("#copyIncome").addEventListener("click", () => copyText("#incomePrompt", "#incomeCopyStatus"));
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
