# mistral-kit

> A production-minded toolkit for building modern AI web apps with Mistral AI models.

Built with **Next.js 16 + React 19** | Part of a **Mistral AI internship application**

---

## Project Goals

**mistral-kit** provides clean, reusable building blocks for developers who want to integrate Mistral AI into their React applications without starting from scratch.

### Why this exists

Most developers start from scratch each time they use Mistral's APIs:
- Custom streaming logic
- Proxying API keys securely  
- Handling partial deltas
- Building a usable chat UI
- Function calling & structured outputs
- Vector embeddings for RAG

**mistral-kit solves this** with production-ready components and hooks.

### Target Audience

- **React/Next.js developers** building AI-powered applications
- **Teams** who want to prototype quickly with Mistral models
- **Developers** who need type-safe, edge-compatible AI integrations

---

## Architecture

### Monorepo Structure

```
mistral-kit/
├── apps/
│   └── site/                  -> Next.js 16 docs + showcase
│       ├── src/app/
│       │   ├── api/
│       │   │   ├── mistral/   -> Edge-safe chat proxy
│       │   │   └── embeddings/ -> Edge-safe embeddings proxy
│       │   ├── docs/          -> MDX documentation
│       │   └── showcase/      -> Interactive demos
│       └── package.json
│
└── packages/
    └── ui/                     -> @mistral/ui library
        ├── src/
        │   ├── components/     -> React UI primitives
        │   ├── hooks/          -> Headless AI hooks
        │   └── types/          -> TypeScript definitions
        └── package.json
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 | App router, Edge runtime, MDX |
| **UI Library** | React 19 | Concurrent features, Server Components |
| **Language** | TypeScript 5 | Strict mode, type safety |
| **Styling** | Tailwind CSS 4 | Utility-first, custom theme |
| **Validation** | Zod | Runtime schema validation |
| **Build** | tsup | Fast ESM library bundler |
| **Package Manager** | pnpm 9 | Fast, disk-efficient workspaces |

---

## What's Included

### 1. UI Components (Unstyled Primitives)

All components accept `className` props for full styling control.

| Component | Purpose |
|-----------|---------|
| `<MistralChatWindow />` | Complete chat UI (1-line integration) |
| `<MessageList />` | Role-aware message renderer |
| `<Composer />` | Input + send/stop/clear controls |
| `<StreamingText />` | A11y-friendly token streaming |
| `<ToolCallBadge />` | Visual indicator for tool calls |

### 2. Headless Hooks

| Hook | Feature |
|------|---------|
| `useMistralChat` | Streaming chat with conversation memory |
| `useJSONMode` | Structured output with Zod validation |
| `useToolExecutor` | Function calling with auto-execution |
| `useEmbeddings` | Vector embeddings + similarity search |

### 3. API Proxies (Edge-Compatible)

- **`/api/mistral`** - Chat completions proxy (protects API keys)
- **`/api/embeddings`** - Embeddings API proxy

Both routes use Edge Runtime for fast, globally distributed responses.

---

## Design System

### Brand Colors

```css
--mistral-orange: #fa520f;  /* Primary brand color */
--mistral-beige:  #fffaeb;  /* Background, light mode */
--mistral-black:  #101010;  /* Text, dark elements */
```

### Typography

**Primary:** Arial (system font for fast loading)  
**Monospace:** Courier New (for code blocks)

### Component Philosophy

1. **Unstyled by default** - No opinions, full control
2. **Accessible** - ARIA labels, keyboard navigation
3. **Edge-safe** - No Node.js APIs, works on Vercel/Cloudflare
4. **Type-safe** - Full TypeScript support with generics

---

## Implementation Status

### Completed

- [x] Monorepo setup (pnpm workspaces)
- [x] Next.js 16 site with Turbopack
- [x] Design system (Tailwind + custom colors)
- [x] Core chat hook (`useMistralChat`)
  - [x] SSE streaming
  - [x] Conversation memory (React 19 state bug fixed)
  - [x] Abort/restart controls
- [x] UI components
  - [x] `<MessageList />` with role-aware rendering
  - [x] `<Composer />` with keyboard shortcuts
  - [x] `<StreamingText />` with blinking cursor
  - [x] `<MistralChatWindow />` all-in-one component
- [x] Advanced hooks
  - [x] `useJSONMode` for structured outputs
  - [x] `useToolExecutor` for function calling
  - [x] `useEmbeddings` for vector search
- [x] API proxies (Edge runtime)
- [x] Chat demo showcase

### In Progress

- [ ] Unified showcase with mode switcher (Chat | Tools | JSON | Embeddings)
- [ ] `<ToolCallBadge />` component implementation
- [ ] Documentation pages (MDX)

### Planned

- [ ] Tool calling demo (weather + calculator)
- [ ] JSON mode demo (data extraction)
- [ ] Embeddings demo (semantic search)
- [ ] Comprehensive docs
- [ ] Unit tests for hooks
- [ ] README examples
- [ ] npm publishing prep

---

## Key Features Demonstrated

### 1. React 19 Expertise

**Challenge:** React 19's concurrent features broke state batching in `useMistralChat`.

**Solution:** Used `useRef` for synchronous state access alongside `useState` for rendering.

```typescript
// Before: setState callbacks deferred, snapshot was empty
setMessages(m => { snapshot = m; return m; });

// After: Ref provides synchronous access
const currentMessages = messagesRef.current;
```

### 2. Edge Runtime Safety

All API routes use `export const runtime = "edge"` for:
- Fast global distribution
- Lower latency (Vercel/Cloudflare Edge)
- Secure API key handling (never exposed to client)

### 3. Type-Safe AI Interactions

Generic hooks with Zod validation:

```typescript
const schema = z.object({ name: z.string(), age: z.number() });
const { data, generate } = useJSONMode({ schema });
// data is typed as { name: string; age: number }
```

### 4. Production-Ready Patterns

- Abort controllers for cancellation
- Error boundaries ready
- Loading states
- A11y compliance (aria-live, focus management)

---

## Local Development

### Prerequisites

- Node.js 18+
- pnpm 9+
- Mistral API key

### Setup

```bash
# Install dependencies
pnpm install

# Set API key
echo "MISTRAL_API_KEY=your-key-here" > apps/site/.env

# Build UI library
pnpm -C packages/ui build

# Start dev server
pnpm -C apps/site dev

# Open http://localhost:3000
```

### Plug-and-Play Setup for Consumers

If you're installing `@mistral/ui` inside your own Next.js app, you only need three steps:

1. `pnpm install @mistral/ui`
2. Add `MISTRAL_API_KEY=<your-key>` to your environment
3. Run the scaffolder (recommended):  
   ```bash
   # From your project root (uses npm by default)
   npx mistral-kit init
   
   # or, if your Next.js app lives elsewhere
   npx mistral-kit init -- --dir apps/site
   ```
   This command creates the four API route files for you. Use `--app-dir src/app` if your `app` folder lives under `src/`.

   Prefer pnpm? `pnpm mistral-kit init -- --dir apps/site`

   If you’d rather do it manually, re-export the provided handlers (only the ones you need):

```ts
// app/api/mistral/route.ts
import { POST as chatHandler } from "@mistral/ui/next/api/chat";
export const runtime = "edge";
export const dynamic = "force-dynamic";
export const POST = chatHandler;

// app/api/embeddings/route.ts (optional, for semantic search)
import { POST as embeddingsHandler } from "@mistral/ui/next/api/embeddings";
export const runtime = "edge";
export const POST = embeddingsHandler;

// app/api/upload-text/route.ts (optional, for attachments)
import { POST as uploadHandler } from "@mistral/ui/next/api/upload-text";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = uploadHandler;

// app/api/weather/route.ts (optional, for built-in weather tool)
import { POST as weatherHandler } from "@mistral/ui/next/api/weather";
export const runtime = "edge";
export const dynamic = "force-dynamic";
export const POST = weatherHandler;
```

With the server routes in place, you can drop the chat UI anywhere:

```tsx
import { MistralChatPanel } from "@mistral/ui";

export default function Demo() {
  return <MistralChatPanel apiProxyUrl="/api/mistral" />;
}
```

---

## Project Roadmap

### Phase 1: Foundation
- [x] Monorepo architecture
- [x] Design system
- [x] Core chat functionality

### Phase 2: Advanced Features
- [x] Structured outputs (JSON mode)
- [x] Function calling (tools)
- [x] Vector embeddings

### Phase 3: Showcase & Docs
- [ ] Unified interactive demo
- [ ] MDX documentation
- [ ] Code examples

### Phase 4: Polish & Ship
- [ ] Unit tests
- [ ] Performance optimization
- [ ] npm package publishing
- [ ] Video demo

---

## Internship Application Context

This project demonstrates:

1. **Full-stack React expertise** - Next.js 16, React 19, TypeScript
2. **AI/ML integration** - Streaming, embeddings, function calling
3. **Production mindset** - Edge runtime, security, accessibility
4. **Developer experience** - Clean APIs, thorough docs, examples
5. **Problem-solving** - Fixed React 19 state batching bug
6. **Design sense** - Custom Tailwind theme, cohesive UI

**Goal:** Show Mistral AI that I can build production-quality developer tools for their ecosystem.

---

## License

MIT © 2025

---

## Links

- **Live Demo:** (Coming soon)
- **Documentation:** (Coming soon)
- **Mistral AI:** https://mistral.ai
