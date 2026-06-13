# SERVICE_SPEC

Project: Investment Scenario Lab  
Course: 경영자를 위한 생성형 AI 마스터 과정  
Updated: 2026-06-13

## Objective

Build a free, static, GitHub Pages-hosted educational web service that helps learners compare investment structures using QQQ, SCHD, JEPI, industry ETFs, and a game-like tenbagger strategy quiz.

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

### 3. Industry ETF Tab

Purpose:

- Replace the duplicated distribution tab.
- Let learners select one of 10 industries.
- Show representative ETF, strategy, popularity reason, 10-year learning assumptions, and example top holdings.

### 4. Tenbagger Strategy Tab

Purpose:

- Replace the macro dashboard with a game-like four-question quiz.
- Always output two Korean and two global candidate stocks.
- Explain why the candidates were selected, what evidence supports the idea, and what could go wrong.
- Keep the framing educational and speculative, not advisory.

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
- Use 2016-2025 historical performance inputs where available; show JEPI as a post-inception exception.
- Explain QQQ, SCHD, and JEPI as different learner purposes, not a single return ranking.
- Tenbagger tab must say candidates are for study and debate, not recommendation.
- Result must end with questions, not a conclusion.

## Acceptance Criteria

- Runs as a static site on GitHub Pages.
- No external API required.
- All calculations happen client-side.
- Every data value has date and source.
- Korean text renders correctly as UTF-8.
- Copy button works.
- Mobile and desktop screenshots are visually coherent.
