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
| Samsung Electronics | Samsung Electronics IR | https://www.samsung.com/global/ir/ | Manual before class |
| Hanmi Semiconductor | Hanmi Semiconductor official site | https://www.hanmisemi.com/ | Manual before class |
| ISC | ISC official site | https://isc21.kr/ | Manual before class |
| Hanwha Aerospace | Hanwha Aerospace IR | https://m.hanwhaaerospace.com/eng/ir/earning-release.do | Manual before class |
| LIG Nex1 | LIG Nex1 official site | https://www.lignex1.com/ | Manual before class |
| Hanwha Systems | Hanwha Systems financial information | https://www.hanwhasystems.com/en/investment/financial-info.do | Manual before class |
| Hyundai Rotem | Hyundai Rotem official site | https://www.hyundai-rotem.co.kr/ | Manual before class |
| KAI | KAI annual report | https://www.koreaaero.com/EN/IR/AnnualReport.aspx | Manual before class |
| AP Satellite | AP Satellite official site | https://www.apsi.co.kr/en/index.php | Manual before class |
| CONTEC | CONTEC official site | https://www.contec.kr/ | Manual before class |
| NAVER | NAVER earnings | https://www.navercorp.com/en/investment/earnings | Manual before class |
| Douzone Bizon | Douzone investor relations | https://en.douzone.com/invest/return.jsp | Manual before class |
| Saltlux | Saltlux official site | https://www.saltlux.com/eng/ | Manual before class |
| ESTsoft | ESTsoft investment information | https://estsoft.ai/en/investment-2 | Manual before class |
| Doosan Robotics | Doosan Robotics IR | https://www.doosanrobotics.com/en/investment/ir/irdata/ | Manual before class |
| Rainbow Robotics | Rainbow Robotics official site | https://www.rainbow-robotics.com/ | Manual before class |
| Samsung Biologics | Samsung Biologics Newsroom | https://samsungbiologics.com/media/company-news/samsung-biologics-reports-fourth-quarter-and-fiscal-year-2025-financial-results | Manual before class |
| Alteogen | Alteogen IR information | https://www.alteogen.com/en/sub/ir/information.php | Manual before class |
| NVIDIA | NVIDIA 2025 Annual Report | https://s201.q4cdn.com/141608511/files/doc_financials/2025/annual/NVIDIA-2025-Annual-Report.pdf | Manual before class |
| AMD | AMD Investor Relations | https://ir.amd.com/ | Manual before class |
| Broadcom | Broadcom Investor Relations | https://investors.broadcom.com/ | Manual before class |
| Astera Labs | Astera Labs Investor Relations | https://asteralabs.gcs-web.com/ | Manual before class |
| Credo Technology | Credo official site | https://www.credosemi.com/ | Manual before class |
| Palantir | Palantir Investor Relations | https://investors.palantir.com/ | Manual before class |
| ServiceNow | ServiceNow Investor Relations | https://investor.servicenow.com/overview/default.aspx | Manual before class |
| Snowflake | Snowflake FY2025 results | https://www.snowflake.com/en/news/press-releases/snowflake-reports-financial-results-for-the-fourth-quarter-and-full-year-of-fiscal-2025/ | Manual before class |
| Northrop Grumman | Northrop Grumman annual reports | https://www.northropgrumman.com/who-we-are/annual-reports | Manual before class |
| AeroVironment | AeroVironment Investor Relations | https://investor.avinc.com/ | Manual before class |
| Kratos | Kratos Investor Relations | https://ir.kratosdefense.com/ | Manual before class |
| Rocket Lab | Rocket Lab Investor Relations | https://investors.rocketlabcorp.com/ | Manual before class |
| AST SpaceMobile | AST SpaceMobile Investor Relations | https://investors.ast-science.com/ | Manual before class |
| Symbotic | Symbotic official site | https://www.symbotic.com/ | Manual before class |
| Intuitive Surgical | Intuitive Surgical Investor Relations | https://isrg.intuitive.com/ | Manual before class |
| Recursion | Recursion official site | https://www.recursion.com/ | Manual before class |

## v2 Automation Candidate

If the service is used repeatedly after the class, add a GitHub Actions scheduled workflow:

- Pull FRED data server-side.
- Store API keys in GitHub Secrets.
- Commit refreshed JSON files.
- Keep the browser as a static client.

Do not put API keys in `app.js`.
