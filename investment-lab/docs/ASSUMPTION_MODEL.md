# ASSUMPTION_MODEL

Project: Investment Scenario Lab  
Updated: 2026-06-13

## Simulation Principle

The simulation is not a forecast. It is a structured comparison using historical learning inputs.

The user can edit:

- Initial capital
- Monthly contribution
- Investment years
- Historical annualized price return
- Historical average distribution yield
- Dividend/distribution reinvestment

## Historical Inputs

| Asset | Price CAGR | Total Return CAGR | Distribution Yield | Purpose |
|---|---:|---:|---:|---|
| QQQ | 18.84% | 19.71% | 0.73% | Growth |
| SCHD | 8.01% | 11.67% | 3.34% | Dividend growth |
| JEPI | 2.46% | 11.68% | 8.05% | Income |

These values are historical learning inputs calculated from 2016-01-04 to 2025-12-31. JEPI is an exception because it launched after 2016, so its values use 2020-05-21 to 2025-12-31.

The main comparison uses price CAGR for portfolio value and average distribution yield for cash-flow math. Total return CAGR is shown as a reference for learners who ask how reinvested distributions affected the historical record.

## Teaching Frame

The comparison is not designed to crown the highest-return asset. It is designed to separate three learner questions:

- QQQ: What happens when the goal is long-term growth and the learner can tolerate drawdowns?
- SCHD: What changes when the learner wants dividend growth and a less aggressive equity style?
- JEPI: What trade-off appears when the learner prioritizes monthly cash flow over price appreciation?

## Calculation Model

- v2 UX model uses a simpler annual loop for explainability.
- Annual distribution = current value * `annualDistributionYield`.
- If reinvestment is on, annual distribution is added to the portfolio before annual price growth.
- If reinvestment is off, annual distribution is accumulated as separate cash income.
- Annual price growth = portfolio value * `annualReturn`.

## Exclusions

The v1 MVP excludes:

- Tax
- Brokerage fees
- Slippage
- Currency conversion fees
- Withholding tax
- Inflation-adjusted real return
- Sequence-of-return risk
- Product closure or policy changes

The UI must make these exclusions visible.
