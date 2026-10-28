# al-business-multi-agent

Simple multi-agent workflow app for Al Business.

## Run locally

```bash
npm install
cp .env.example .env
# add your Gemini key to .env
npm start
```

Then open http://localhost:3000

## Deploy to Render

1. Create a new Node web service on Render.
2. Connect this repo.
3. Set env var: `GEMINI_API_KEY`.
4. Build: `npm install`
5. Start: `npm start`
