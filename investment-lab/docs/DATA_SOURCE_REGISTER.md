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

## Data Fields Required

Every fund and macro data point must include:

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

## v2 Automation Candidate

If the service is used repeatedly after the class, add a GitHub Actions scheduled workflow:

- Pull FRED data server-side.
- Store API keys in GitHub Secrets.
- Commit refreshed JSON files.
- Keep the browser as a static client.

Do not put API keys in `app.js`.
