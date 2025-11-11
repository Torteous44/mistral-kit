# defaultTools
Convenience array exported from `packages/ui/src/tools/index.ts` that bundles the built-in tools in a reasonable order: `[weatherTool, calculatorTool, dateTimeTool, searchDocsTool]`.

## Usage
```tsx
import { defaultTools } from "@matthewporteous/mistral-kit";

const toolExecutor = useToolExecutor({
  tools: defaultTools,
  apiProxyUrl: "/api/mistral",
});
```

## Notes
* `searchDocsTool` is currently a stub—override it with `createSemanticSearchTool` when you have embedded chunks.
* `defaultTools` is immutable; spread it (`[...defaultTools, customTool]`) if you need to append or modify entries.
