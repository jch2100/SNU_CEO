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

### 2. Ten-Year Comparison Tab

Inputs:

- Initial capital with comma-formatted input
- Investment years
- Distribution reinvestment mode
- Quick amount buttons

Outputs:

- Projected value by asset
- Estimated annual distribution
- Total distribution received if not reinvested
- Plain explanation of why the value changes

### 3. Distribution Income Tab

Purpose:

- Replace the unclear "target annual cash flow" concept.
- Show simple annual and monthly distribution estimates from current capital.

### 4. Macro Dashboard

Show:

- Indicator value
- Source/date
- Interpretation
- Investor questions

### 5. Copy Prompt

Generate a prompt the learner can copy into ChatGPT:

- Scenario summary
- Best-matching structure
- Top risks
- Questions to verify next

## UX Rules

- White minimal background.
- No decorative finance hype.
- No buy/sell language.
- Mobile-first layout with top tabs.
- Avoid exposing all three tools in one long vertical scroll.
- Use comma-formatted money inputs such as `100,000,000`.
- Result must end with questions, not a conclusion.

## Acceptance Criteria

- Runs as a static site on GitHub Pages.
- No external API required.
- All calculations happen client-side.
- Every data value has date and source.
- Korean text renders correctly as UTF-8.
- Copy button works.
- Mobile and desktop screenshots are visually coherent.
