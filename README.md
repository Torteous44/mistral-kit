# mistral-kit

Ready-made chat components for Mistral AI. Drop in the full UI or build your own with headless hooks. Includes secure API proxies and common features like streaming, tool calling, and document search.

**Next.js 16 · React 19 · TypeScript · Edge Runtime**

## Quick Start

```bash
npm i @matthewporteous/mistral-kit
```

```bash
npx mistral-kit init
```

```tsx
import { MistralChat, defaultTools } from "@matthewporteous/mistral-kit";

export default function Demo() {
  return (
    <MistralChat
      apiProxyUrl="/api/mistral"
      baseTools={defaultTools}
      promptPlaceholder="Ask anything..."
    />
  );
}
```

```bash
MISTRAL_API_KEY=your-key-here
```

---

## What's Included

**Components** — `MistralChat`, `MessageList`, `StreamingText`, `Tool`, `CodeBlock`, and more

**Hooks** — `useMistralChat`, `useToolExecutor`, `useEmbeddings`, `useJSONMode`

**API Routes** — Edge-safe proxies for chat, embeddings, uploads, weather

**Tools** — Calculator, weather, datetime, semantic search

[Full Reference →](./packages/ui/README.md)

---

## Development

```bash
pnpm install
echo "MISTRAL_API_KEY=your-key" > apps/site/.env
pnpm -C packages/ui build
pnpm -C apps/site dev
```
---

This project was built for my Mistral AI internship application —> a small experiment in making Mistral’s APIs easy and fun for developers to build with.
