# لعبة المعلومات — Arabic Trivia Game

A bilingual-RTL Arabic trivia game with single-player and online multiplayer modes.

**Live demo:** https://gejbarah-debug.github.io/trivia/

## Features

- 🎯 **Single-player** — 8 random questions, 30-second timer, 3 lives, speed-based scoring
- 👑 **Multiplayer rooms** — host creates a 4-character room code, friends join, everyone plays the same synced questions with a live scoreboard
- 🌙 Light & dark themes
- 🎨 Neo-brutalist Arabic design (Cairo + Tajawal fonts)
- 📦 Public question API — see below

## Public API

The question bank is served as plain JSON from GitHub Pages and is free to use in your own projects.

**Endpoint:**

```
GET https://gejbarah-debug.github.io/trivia/questions.json
```

CORS is open (`Access-Control-Allow-Origin: *`), so you can `fetch()` it directly from the browser.

### Response shape

```json
{
  "version": "1.0.0",
  "language": "ar",
  "license": "MIT",
  "categories": ["علوم", "جغرافيا", "فن وثقافة", "تاريخ", "لغة وأدب", "رياضة", "إسلاميات", "تكنولوجيا", "حيوانات"],
  "questions": [
    {
      "id": 1,
      "category": "علوم",
      "question": "ما أكبر كوكب في المجموعة الشمسية؟",
      "options": ["زحل", "نبتون", "المشتري", "أورانوس"],
      "correct": 2
    }
  ]
}
```

`correct` is the **0-based index** into `options`.

### Example usage

```js
const res = await fetch("https://gejbarah-debug.github.io/trivia/questions.json");
const { questions } = await res.json();

const q = questions[Math.floor(Math.random() * questions.length)];
console.log(q.question);
console.log("Answer:", q.options[q.correct]);
```

### Filter by category

```js
const science = questions.filter(q => q.category === "علوم");
```

### License

Questions are released under the **MIT License**. Use them in any project, commercial or otherwise. Attribution appreciated but not required.

## Tech stack

- React 18 (UMD) + Babel standalone — no build step
- Firebase Realtime Database for multiplayer sync
- Pure CSS with `oklch()` color space and CSS custom properties for theming
- Hosted on GitHub Pages with automatic deploys via GitHub Actions

## Local development

Just open `index.html` in a browser, or serve the directory with any static server:

```sh
python -m http.server 5173
```

Then visit `http://localhost:5173/`.

## Contributing questions

Edit `questions.json` and open a PR. Each question needs:
- `id` (integer, unique)
- `category` (one of the categories listed above, or a new one — also add it to `categories`)
- `question` (Arabic string)
- `options` (array of 4 strings)
- `correct` (0-based index)
