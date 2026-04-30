# Source Court: AP Research Edition

Browser game about evaluating whether sources are admissible for academic research.

## Files

- `index.html`: app shell
- `styles.css`: courtroom UI, layout, motion, and responsive styling
- `data.js`: criteria, personas, ranks, dockets, cases, and offline custom-practice templates
- `app.js`: game engine, progression, scoring, verdict flow, persistence, and optional Gemini integration

## What Changed

- Preserved the courtroom fantasy, personas, strikes, streaks, verdict flow, optional note questions, and custom topic mode
- Added a clearer guided campaign with docket chapters and promotions
- Added visible long-term rank progress and short-term run pressure
- Improved verdict payoff with a full score breakdown and criterion review
- Added offline custom-topic fallback so the custom mode still works without an API key

## Scoring

- Correct verdicts earn the main ruling bonus
- Correct note-card checks on Authority, Currency, Rigor, and Objectivity add score
- Persona focus doubles that criterion note bonus
- Full-note mastery adds an extra reward
- Streaks increase the multiplier and create better survival payoffs
- Career XP advances long-term judicial rank even while run score tracks the current session

## Customization

- Add more dockets and cases in `data.js` under `dockets`
- Add more local custom-topic templates in `data.js` under `customTemplates`
- If you want live AI-generated custom cases, add a Gemini API key in the home screen
