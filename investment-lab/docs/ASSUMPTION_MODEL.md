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
| QQQ | 8.0% | 0.6% | Growth |
| SCHD | 6.0% | 3.5% | Dividend growth |
| JEPI | 3.0% | 8.0% | Income |

These values are intentionally round educational assumptions. They are not official expected returns.

## Calculation Model

- Monthly growth rate = `(1 + annualReturn)^(1/12) - 1`
- Monthly distribution = current value * `(annualDistributionYield / 12)`
- If reinvestment is on, monthly distribution is added to portfolio value.
- If reinvestment is off, monthly distribution is accumulated as separate cash income.
- Monthly contribution is added at the beginning of each month.

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
