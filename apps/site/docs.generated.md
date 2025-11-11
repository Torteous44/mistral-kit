# apps/site overview
Next.js 16 App Router project that documents and showcases `@matthewporteous/mistral-kit`. It consumes the workspace package directly via TypeScript path aliases so you can iterate on the UI kit and preview changes immediately.

## Key Routes

- `/` (`src/app/page.tsx`) — Lightweight landing page with brand headline, value prop, and a call-to-action linking to the showcase.
- `/showcase` (`src/app/showcase/page.tsx`) — Full-screen demo that renders `MistralChatPanel` configured with weather, calculator, and date/time tools, embeddings + upload proxies, and custom semantic-search knobs. Serves as the canonical playground for the package.
- `/docs` (`src/app/docs/page.mdx`) — Placeholder MDX route reserved for future documentation (currently empty).

## Global Layout & Styles
- `src/app/layout.tsx` wires Geist fonts and wraps pages with Tailwind 4 styles from `src/app/globals.css` (brand palette + font tokens shared with the UI kit).

## API Routes

All API routes live under `src/app/api/**/route.ts` and simply re-export the package-provided handlers so the example app stays in sync with the published library.

| Route | Runtime | Handler | Description |
| ----- | ------- | ------- | ----------- |
| `POST /api/mistral` | Edge | `@matthewporteous/mistral-kit/next/api/chat` | Streams chat completions through Mistral while hiding `MISTRAL_API_KEY`. Accepts any `ChatCompletionRequest` payload (optionally `{ stream: false }` for JSON responses). |
| `POST /api/embeddings` | Edge | `@matthewporteous/mistral-kit/next/api/embeddings` | Proxies embeddings requests. Body should include `{ model?: string; input?: string | string[]; }`. |
| `POST /api/upload-text` | Node.js | `@matthewporteous/mistral-kit/next/api/upload-text` | Extracts text from uploads. Accepts `multipart/form-data` with `file` (PDF/DOCX) or JSON `{ text: string }`. Responds with `{ ok, kind, length, preview, text }`. |
| `POST /api/weather` | Edge | `@matthewporteous/mistral-kit/next/api/weather` | Fetches weather data from wttr.in for the built-in weather tool. Expects `{ location: string }` in the JSON body.

### Example Requests

```bash
curl -X POST http://localhost:3000/api/mistral \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "mistral-medium-latest",
    "messages": [
      {"role": "system", "content": "You are concise."},
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

```bash
curl -X POST http://localhost:3000/api/upload-text \
  -H 'Content-Type: application/json' \
  -d '{"text": "Lightweight upload demo"}'
```

## Environment Variables

Set `MISTRAL_API_KEY` in `apps/site/.env` (or your hosting provider) before hitting `/api/mistral` or `/api/embeddings`. The upload and weather routes do not require additional secrets.
