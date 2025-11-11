# calculatorTool
Simple math tool definition (`ToolDefinition`) that supports addition, subtraction, multiplication, division, and percentages. Inputs are validated with Zod before execution.

## Usage
```tsx
import { calculatorTool } from "@matthewporteous/mistral-kit";

const result = await calculatorTool.run({ operation: "percentage", a: 15, b: 84.5 });
// { operation: "percentage", operands: [15, 84.5], result: 12.68 }
```

## Input Schema
```ts
{
  operation: "add" | "subtract" | "multiply" | "divide" | "percentage";
  a: number;
  b?: number; // required for every operation except using a single operand
}
```

## Output
```ts
{
  operation: string;
  operands: number[];
  result: number; // rounded to 2 decimals
}
```

## Notes
* Division by zero throws `Error("Cannot divide by zero")`.
* Percentage is interpreted as `(a / 100) * b`.
* When used inside `useToolExecutor`, invalid arguments will fail Zod validation before `run` executes.
