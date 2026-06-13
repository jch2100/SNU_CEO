# SERVICE_SPEC

Project: Investment Scenario Lab  
Course: 경영자를 위한 생성형 AI 마스터 과정  
Updated: 2026-06-13

## Objective

Build a free, static, GitHub Pages-hosted educational web service that helps learners compare investment structures using QQQ, SCHD, JEPI, and macro context.

## URL Structure

Target path:

```text
/investment-lab/
```

## Screens

### 1. Intro

Purpose:

- Clarify that the service is educational.
- Set the frame: condition comparison, not recommendation.

### 2. Scenario Simulator

Inputs:

- Initial capital
- Monthly contribution
- Investment years
- Target annual income
- Dividend reinvestment
- Risk tolerance
- Preset buttons

Outputs:

- Projected value by asset
- Estimated annual distribution
- Total distribution received if not reinvested
- Fit label

### 3. ETF Compare

Show:

- Role
- Editable return assumption
- Editable distribution assumption
- Expense ratio
- Best-fit user type
- Watch-out risks
- Official source

### 4. Macro Dashboard

Show:

- Indicator value
- Source/date
- Interpretation
- Investor questions

### 5. Result / Copy Prompt

Generate a prompt the learner can copy into ChatGPT:

- Scenario summary
- Best-matching structure
- Top risks
- Questions to verify next

## UX Rules

- White minimal background.
- No decorative finance hype.
- No buy/sell language.
- Mobile-first layout.
- Result must end with questions, not a conclusion.

## Acceptance Criteria

- Runs as a static site on GitHub Pages.
- No external API required.
- All calculations happen client-side.
- Every data value has date and source.
- Korean text renders correctly as UTF-8.
- Copy button works.
- Mobile and desktop screenshots are visually coherent.
