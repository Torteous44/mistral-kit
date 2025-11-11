# searchDocsTool
Placeholder semantic-search tool that returns canned responses. Useful while wiring up the UI before you have real embeddings to query.

## Usage
```tsx
import { searchDocsTool } from "@matthewporteous/mistral-kit";

const result = await searchDocsTool.run({ query: "how to make pasta", limit: 1 });
// { query: "how to make pasta", results: [...], note: "Embeddings integration coming next" }
```

## Input Schema
```ts
{
  query: string;
  limit?: number; // defaults to 3
}
```

## Output
```ts
{
  query: string;
  results: Array<{
    title: string;
    excerpt: string;
    similarity: number;
  }>; // truncated to `limit`
  note: string;
}
```

## Notes
* Replace it with a real semantic-search implementation (or use `createSemanticSearchTool`) once you have embeddings and chunk metadata ready.
