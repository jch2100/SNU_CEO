# RESEARCH

Project: Investment Scenario Lab for `경영자를 위한 생성형 AI 마스터 과정`  
Updated: 2026-06-13

## Product Positioning

This service is an education-first investment scenario tool. It must not present itself as a stock recommendation, investment advisory, trading signal, or portfolio management service.

Confirmed product stance:

- Compare investment structures, not products to buy.
- Use QQQ, SCHD, and JEPI as familiar example ETFs.
- End each result with questions to verify, not a buy/sell conclusion.
- Make all return and distribution figures editable assumptions.
- Show data dates and source links visibly.

## ETF Research

### Historical Calculation Note

The service now uses historical learning inputs instead of arbitrary assumptions.

- Main period: 2016-01-04 to 2025-12-31.
- Price return: calculated from close price and used for separate portfolio value.
- Total return reference: calculated from adjusted close and shown as a reinvested-distribution reference.
- Average distribution yield: annual cash distributions divided by average daily close for each year, then averaged.
- JEPI exception: JEPI launched after 2016, so it uses 2020-05-21 to 2025-12-31.
- These figures explain what happened in the past. They do not imply expected future returns.

### QQQ

- Official source: Invesco QQQ official fund page.
- Role in MVP: growth-oriented comparison asset.
- Core lesson: high growth potential usually comes with higher drawdown and valuation sensitivity.
- Key user question: "Can I hold through large declines if the growth thesis takes time?"

Source: https://www.invesco.com/qqq-etf/en/home.html

### SCHD

- Official source: Schwab Asset Management SCHD official page.
- Role in MVP: dividend-growth comparison asset.
- Core lesson: dividend growth can support long-term compounding, but it is not a guaranteed income stream.
- Key user question: "Do I want a balance between capital growth and dividend income?"

Source: https://www.schwabassetmanagement.com/products/schd

### JEPI

- Official source: J.P. Morgan Asset Management JEPI official page.
- Role in MVP: income-oriented comparison asset.
- Core lesson: higher distribution income may come with lower upside participation and distribution variability.
- Key user question: "Do I value near-term cash flow more than maximum long-term capital growth?"

Source: https://am.jpmorgan.com/us/en/asset-management/adv/products/jpmorgan-equity-premium-income-etf-etf-shares-46641q332

## Macro Research

The original dashboard used macro indicators only as context. In the current UI, the third tab has been replaced by a tenbagger quiz because learners needed a more memorable and discussion-friendly activity.

Tracked v1 indicators:

- Korea base rate: local cash-rate comparison and won asset context.
- U.S. policy rate: dollar asset and growth-stock discount-rate context.
- U.S. CPI: inflation pressure and rate-expectation context.
- USD/KRW: overseas ETF translation risk for Korean investors.
- U.S. 10-year Treasury yield: long-duration growth asset sensitivity.
- PHLX Semiconductor Index: AI and semiconductor-cycle context.

Primary source candidates:

- Bank of Korea: https://www.bok.or.kr/eng/main/main.do
- FRED DFEDTARU: https://fred.stlouisfed.org/series/DFEDTARU
- FRED DGS10: https://fred.stlouisfed.org/series/DGS10
- FRED NASDAQSOX: https://fred.stlouisfed.org/series/NASDAQSOX
- U.S. BLS CPI release: https://www.bls.gov/news.release/cpi.nr0.htm
- Korea MOEF indicators: https://english.moef.go.kr/

## Tenbagger Quiz Research

Purpose:

- Make the third tab more engaging than a passive macro dashboard.
- Force learners to choose an investment hypothesis before seeing candidate names.
- Return two Korean and two global candidates as study prompts, not recommendations.

Candidate logic:

- AI infrastructure: SK hynix, NVIDIA, Broadcom.
- AI software/platform: Palantir.
- Defense/space: Hanwha Aerospace, Rocket Lab.
- Robotics/automation: Doosan Robotics.
- Bio CDMO: Samsung Biologics.

The quiz asks four objective questions:

- Long-term theme.
- Preferred company size/stage.
- Evidence type the learner trusts.
- Drawdown tolerance.

The result is a score-based match against qualitative tags. It deliberately avoids price targets, expected returns, or buy/sell language.

Primary source candidates:

- SK hynix Newsroom: https://news.skhynix.com/sk-hynix-announces-fy25-financial-results/
- Hanwha Aerospace IR: https://m.hanwhaaerospace.com/eng/ir/earning-release.do
- Doosan Robotics IR: https://www.doosanrobotics.com/en/investment/ir/irdata/
- Samsung Biologics FY2025 results: https://samsungbiologics.com/media/company-news/samsung-biologics-reports-fourth-quarter-and-fiscal-year-2025-financial-results
- NVIDIA 2025 Annual Report: https://s201.q4cdn.com/141608511/files/doc_financials/2025/annual/NVIDIA-2025-Annual-Report.pdf
- Broadcom IR: https://investors.broadcom.com/
- Palantir IR: https://investors.palantir.com/
- Rocket Lab IR: https://investors.rocketlabcorp.com/

## Expression Guardrails

Forbidden wording:

- 추천 종목
- 사야 한다
- 매수 신호
- 확정 수익
- 보장 수익
- 무조건 유리
- 안전한 고수익

Preferred wording:

- 조건상 더 가까운 구조
- 가정값 기준
- 추가 확인 필요
- 현금흐름 목적에 가까움
- 성장 목적에 가까움
- 원출처 확인 필요

## Open Checks Before Public Class Use

- Re-check ETF facts from official pages on the class date.
- Re-check macro values and dates.
- Confirm GitHub Pages URL and mobile rendering.
- Confirm all data values have visible source links.
