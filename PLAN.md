# mistral-kit Implementation Plan

## Current Status: Phase 3 - Unified Demo

---

## Next Steps: Unified Showcase Demo

### UX Design: Tabbed Interface

```
┌─────────────────────────────────────────────────────┐
│  Mistral Kit · Interactive Showcase                │
├─────────────────────────────────────────────────────┤
│  [Chat] [Tools] [JSON] [Embeddings]  <- Tab switcher│
├─────────────────────────────────────────────────────┤
│                                                     │
│  Mode-specific demo content here                   │
│  (Chat UI, tool executor, JSON form, etc.)        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Mode 1: Chat
**What:** Standard streaming chat with conversation memory  
**Hook:** `useMistralChat`  
**UI:** MessageList + Composer  
**Demo:** "Ask me anything" style chat

### Mode 2: Tools
**What:** Function calling with weather + calculator  
**Hook:** `useToolExecutor`  
**UI:** Message list showing tool invocations  
**Demo:**
- "What's the weather in Paris?"
- "Calculate 15% tip on $84.50"
- Shows tool calls in real-time

### Mode 3: JSON
**What:** Extract structured data from text  
**Hook:** `useJSONMode`  
**UI:** Input box + JSON output display  
**Demo:**
- Input: "John Doe, 25 years old, john@example.com"
- Output: `{ name: "John Doe", age: 25, email: "john@example.com" }`
- Shows Zod schema validation

### Mode 4: Embeddings
**What:** Semantic search over sample documents  
**Hook:** `useEmbeddings`  
**UI:** Search box + ranked results  
**Demo:**
- Pre-load sample docs (recipes, articles, etc.)
- User searches "how to make pasta"
- Shows similarity scores + top matches

---

## Implementation Tasks

### Task 1: Implement ToolCallBadge Component
**Status:** Not started  
**Priority:** Medium  
**File:** `packages/ui/src/components/ToolCallBadge.tsx`

**Requirements:**
- Show tool name
- Show "executing..." state
- Show success/error
- Unstyled (className props)

**Design:**
```tsx
<ToolCallBadge
  toolName="get_weather"
  status="executing" | "success" | "error"
  className="..."
/>
```

---

### Task 2: Build Unified Showcase Page
**Status:** Not started  
**Priority:** High  
**File:** `apps/site/src/app/showcase/page.tsx`

**Structure:**
```tsx
const [mode, setMode] = useState<'chat' | 'tools' | 'json' | 'embeddings'>('chat');

return (
  <div className="container">
    {/* Tab navigation */}
    <div className="tabs">
      <button onClick={() => setMode('chat')}>Chat</button>
      <button onClick={() => setMode('tools')}>Tools</button>
      <button onClick={() => setMode('json')}>JSON</button>
      <button onClick={() => setMode('embeddings')}>Embeddings</button>
    </div>

    {/* Mode-specific content */}
    {mode === 'chat' && <ChatMode />}
    {mode === 'tools' && <ToolsMode />}
    {mode === 'json' && <JSONMode />}
    {mode === 'embeddings' && <EmbeddingsMode />}
  </div>
);
```

---

### Task 3: Create Sample Tools for Demo
**Status:** Not started  
**Priority:** High  
**File:** `apps/site/src/lib/sampleTools.ts`

**Tools to implement:**

1. **get_weather**
   - Input: `{ location: string }`
   - Output: `{ temp: number, condition: string }`
   - Mock data (Paris: 18C, sunny)

2. **calculator**
   - Input: `{ operation: string, a: number, b?: number }`
   - Output: `{ result: number }`
   - Operations: add, subtract, multiply, divide, percentage

3. **get_date**
   - Input: `{ timezone?: string }`
   - Output: `{ date: string, time: string }`

---

### Task 4: Create Sample Documents for Embeddings
**Status:** Not started  
**Priority:** High  
**File:** `apps/site/src/lib/sampleDocs.ts`

**Documents:**
- 5-10 short articles/recipes
- Topics: cooking, technology, travel
- Each ~100-200 words
- Pre-compute embeddings on page load

---

### Task 5: Documentation Page
**Status:** Not started  
**Priority:** Medium  
**File:** `apps/site/src/app/docs/page.mdx`

**Sections:**
1. Getting Started
2. Installation
3. API Reference
   - Hooks
   - Components
   - Types
4. Examples
5. Troubleshooting

---

## Directory Structure (Current + Planned)

```
mistral-kit/
│
├── apps/site/
│   ├── src/app/
│   │   ├── api/
│   │   │   ├── mistral/route.ts       [done]
│   │   │   └── embeddings/route.ts    [done]
│   │   │
│   │   ├── docs/
│   │   │   └── page.mdx               [pending]
│   │   │
│   │   ├── showcase/
│   │   │   ├── page.tsx               [in-progress] Refactor to unified demo
│   │   │   └── chat/page.tsx          [done] (will be removed)
│   │   │
│   │   ├── layout.tsx                 [done]
│   │   └── page.tsx                   [pending] (home page)
│   │
│   └── src/lib/
│       ├── sampleTools.ts             [pending]
│       └── sampleDocs.ts              [pending]
│
└── packages/ui/
    └── src/
        ├── components/
        │   ├── MistralChatWindow.tsx  [done]
        │   ├── MessageList.tsx        [done]
        │   ├── Composer.tsx           [done]
        │   ├── StreamingText.tsx      [done]
        │   └── ToolCallBadge.tsx      [pending]
        │
        ├── hooks/
        │   ├── useMistralChat.ts      [done]
        │   ├── useJSONMode.ts         [done]
        │   ├── useToolExecutor.ts     [done]
        │   └── useEmbeddings.ts       [done]
        │
        └── types/
            └── chat.ts                [done]
```

---

## Design Guidelines

### Color Usage

| Element | Color | Usage |
|---------|-------|-------|
| Primary action | `#fa520f` (orange) | Send buttons, active tabs |
| Background | `#fffaeb` (beige) | Page background |
| Text | `#101010` (black) | Body text, headings |
| User messages | `#101010` (black bg) | Chat bubbles |
| AI messages | `#ffffff` (white bg) | With border |
| Tool badges | `#fa520f` | Highlight function calls |

### Component Spacing

- Container: `max-w-4xl mx-auto px-6 py-8`
- Cards: `rounded-2xl border border-mistral-black/10`
- Sections: `space-y-6`

---

## Completion Criteria

Before marking this project "complete":

1. [done] All hooks implemented and tested
2. [done] All core components working
3. [pending] Unified showcase demo with 4 modes
4. [pending] ToolCallBadge component
5. [pending] Documentation page (MDX)
6. [pending] Home page with clear value prop
7. [pending] README with examples
8. [pending] No console errors
9. [pending] Responsive design (mobile + desktop)
10. [pending] Accessible (keyboard nav, screen readers)

---

## Deployment Checklist

When ready to deploy:

- [ ] Remove debug console.logs
- [ ] Add meta tags (SEO)
- [ ] Add favicon
- [ ] Test on Vercel Edge
- [ ] Add analytics (optional)
- [ ] Create demo video
- [ ] Share with Mistral AI team

---

## Time Estimates

| Task | Estimated Time | Priority |
|------|---------------|----------|
| ToolCallBadge component | 30 min | Medium |
| Unified showcase page | 2 hours | High |
| Sample tools | 30 min | High |
| Sample docs + embeddings | 1 hour | High |
| Documentation MDX | 2 hours | Medium |
| Home page | 1 hour | Low |
| Testing + polish | 1 hour | High |

**Total:** ~8 hours of focused work

---

## Learning Outcomes

By completing this project, demonstrated:

1. **React 19 mastery** - Concurrent features, state management
2. **Next.js 16** - App router, Edge runtime, streaming
3. **TypeScript** - Generics, type inference, strict mode
4. **AI integration** - Streaming APIs, embeddings, tool calling
5. **DX focus** - Clean APIs, good docs, reusable components
6. **Production patterns** - Security, performance, accessibility
