# trivia-questions worker

Cloudflare Worker that generates fresh Arabic trivia questions on demand by calling the Anthropic API. Used by the game to keep the question pool effectively infinite.

## Endpoint

```
POST https://<your-worker>.workers.dev/generate
Content-Type: application/json

{
  "count": 8,
  "categories": ["علوم", "جغرافيا"],   // optional
  "exclude": ["نص سؤال 1", "نص سؤال 2"] // optional, up to 80
}
```

Response:

```json
{
  "questions": [
    { "id": "g1714410000-0", "category": "علوم", "question": "...", "options": ["...","...","...","..."], "correct": 2, "generated": true }
  ],
  "generatedAt": 1714410000000
}
```

CORS is locked to the game's origins; you can add more in `src/index.js` (`ALLOWED_ORIGINS`).

## Deploy (5 minutes)

You need: a free Cloudflare account, an Anthropic API key, and Node.js installed.

### 1. Get an Anthropic API key
- Sign up / log in at https://console.anthropic.com
- Go to **Settings → API keys** → **Create Key**
- Copy the key (starts with `sk-ant-...`). New accounts get $5 in free credits — enough for ~1000 batches of 8 questions on Haiku.

### 2. Sign in to Cloudflare from this folder

```sh
cd worker
npm install
npx wrangler login
```

The browser opens, you approve, done.

### 3. Set the API key as a Worker secret (not in code, not in git)

```sh
npx wrangler secret put ANTHROPIC_API_KEY
```

Paste the key when prompted, press Enter.

### 4. Deploy

```sh
npx wrangler deploy
```

Wrangler prints the deployed URL, like `https://trivia-questions.<your-username>.workers.dev`. Copy that URL.

### 5. Wire it into the game

Open `firebase-init.js` (in the repo root) and set:

```js
window.TRIVIA_WORKER_URL = "https://trivia-questions.<your-username>.workers.dev";
```

Commit and push — the GitHub Pages deploy picks it up.

## Costs

Haiku 4.5: ~$0.005 per batch of 8 questions. The free $5 in Anthropic credits covers ~1000 batches. After that, top up the Anthropic account; Cloudflare Workers free tier (100k req/day) is more than enough.

## Adding more allowed origins

Edit `ALLOWED_ORIGINS` in `src/index.js`, redeploy.
