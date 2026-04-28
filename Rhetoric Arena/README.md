# Rhetoric Arena

Fast, replayable AP English Language and Composition browser game built with plain HTML, CSS, and JavaScript.

## Files

- `index.html`: app shell
- `styles.css`: arcade UI, layout, accessibility, motion controls
- `data.js`: arenas, prompt banks, bosses, announcer lines, expansion comments
- `app.js`: game engine, progression, scoring, modes, persistence, audio

## Run Locally

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Scoring

- `Strong` decisions earn the highest base score.
- `Weak` decisions still earn points, but less.
- `Flawed` decisions break combo and give no base score.
- Remaining time adds a time bonus.
- Combo streak adds bonus points and increases multiplier.
- Round summary converts performance into XP, medal, and grade.

## Teacher Customization

- Use `Teacher Mode` inside the app to pick arena, difficulty, timer, and presentation mode.
- Add more prompts in `data.js` inside the mechanic arrays under `content`.
- Add more campaign arenas in `data.js` inside the `arenas` array.
- Add or remix bosses in `data.js` inside the `bosses` array.

Progress and settings save in `localStorage`.
