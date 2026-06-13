# ASSUMPTION_MODEL

Project: Investment Scenario Lab  
Updated: 2026-06-13

## Simulation Principle

The simulation is not a forecast. It is a structured comparison of assumptions.

The user can edit:

- Initial capital
- Monthly contribution
- Investment years
- Assumed annual return
- Assumed annual distribution yield
- Dividend/distribution reinvestment

## Default Assumptions

| Asset | Annual Return | Distribution Yield | Purpose |
|---|---:|---:|---|
| QQQ | 10.0% | 0.6% | Growth |
| SCHD | 7.0% | 3.0% | Dividend growth |
| JEPI | 3.0% | 7.0% | Income |

These values are intentionally round educational assumptions. They are not official expected returns.

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
