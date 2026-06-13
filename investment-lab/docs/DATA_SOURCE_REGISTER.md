# DATA_SOURCE_REGISTER

Project: Investment Scenario Lab  
Updated: 2026-06-13

## v1 Data Policy

The MVP uses manual JSON data. It does not call live APIs from the browser.

Reasons:

- Zero operating cost.
- No browser-exposed API keys.
- More stable for classroom demos.
- Easier to explain data dates and assumptions.

## Historical Performance Method

Historical return and distribution inputs were calculated from Yahoo Finance chart data for the period `2016-01-04` to `2025-12-31`.

- Price return input: annualized CAGR from close price. This drives the separate portfolio value calculation.
- Total return reference: annualized CAGR from adjusted close. This is shown as a reinvested-distribution reference and should not be added again to cash distributions.
- Distribution yield input: annual cash distributions divided by average daily close for each calendar year, then averaged.
- JEPI exception: JEPI did not exist in 2016, so JEPI uses `2020-05-21` to `2025-12-31`.
- These values are learning inputs, not forecasts.

## Data Fields Required

Every fund, ETF, tenbagger candidate, and macro data point must include:

- `asOf`
- `sourceName`
- `sourceUrl`
- `sourceNote` or `interpretation`
- `isManual` where applicable

## ETF Sources

| Ticker | Source | URL | Update Method |
|---|---|---|---|
| QQQ | Invesco | https://www.invesco.com/qqq-etf/en/home.html | Manual before class |
| SCHD | Schwab Asset Management | https://www.schwabassetmanagement.com/products/schd | Manual before class |
| JEPI | J.P. Morgan Asset Management | https://am.jpmorgan.com/us/en/asset-management/adv/products/jpmorgan-equity-premium-income-etf-etf-shares-46641q332 | Manual before class |

## Macro Sources

| Indicator | Source | URL | Update Method |
|---|---|---|---|
| Korea base rate | Bank of Korea | https://www.bok.or.kr/eng/main/main.do | Manual monthly or before class |
| U.S. target rate | FRED DFEDTARU | https://fred.stlouisfed.org/series/DFEDTARU | Manual before class |
| U.S. CPI | BLS CPI release | https://www.bls.gov/news.release/cpi.nr0.htm | Manual monthly |
| USD/KRW | MOEF or official data | https://english.moef.go.kr/ | Manual before class |
| U.S. 10-year yield | FRED DGS10 | https://fred.stlouisfed.org/series/DGS10 | Manual before class |
| PHLX Semiconductor | FRED NASDAQSOX | https://fred.stlouisfed.org/series/NASDAQSOX | Manual before class |

## Tenbagger Candidate Sources

The tenbagger tab is a game-like teaching tool. It uses qualitative candidate data, not valuation targets or analyst price objectives.

| Candidate | Source | URL | Update Method |
|---|---|---|---|
| SK hynix | SK hynix Newsroom | https://news.skhynix.com/sk-hynix-announces-fy25-financial-results/ | Manual before class |
| Hanwha Aerospace | Hanwha Aerospace IR | https://m.hanwhaaerospace.com/eng/ir/earning-release.do | Manual before class |
| Doosan Robotics | Doosan Robotics IR | https://www.doosanrobotics.com/en/investment/ir/irdata/ | Manual before class |
| Samsung Biologics | Samsung Biologics Newsroom | https://samsungbiologics.com/media/company-news/samsung-biologics-reports-fourth-quarter-and-fiscal-year-2025-financial-results | Manual before class |
| NVIDIA | NVIDIA 2025 Annual Report | https://s201.q4cdn.com/141608511/files/doc_financials/2025/annual/NVIDIA-2025-Annual-Report.pdf | Manual before class |
| Broadcom | Broadcom Investor Relations | https://investors.broadcom.com/ | Manual before class |
| Palantir | Palantir Investor Relations | https://investors.palantir.com/ | Manual before class |
| Rocket Lab | Rocket Lab Investor Relations | https://investors.rocketlabcorp.com/ | Manual before class |

## v2 Automation Candidate

If the service is used repeatedly after the class, add a GitHub Actions scheduled workflow:

- Pull FRED data server-side.
- Store API keys in GitHub Secrets.
- Commit refreshed JSON files.
- Keep the browser as a static client.

Do not put API keys in `app.js`.
