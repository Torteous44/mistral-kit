import { z } from "zod";
import type { ToolDefinition } from "../types/chat";

const calculatorSchema = z.object({
  operation: z.enum(["add", "subtract", "multiply", "divide", "percentage"]).describe(
    "The mathematical operation to perform"
  ),
  a: z.number().describe("First number"),
  b: z.number().optional().describe("Second number (required for most operations)"),
});

type CalculatorArgs = z.infer<typeof calculatorSchema>;

export const calculatorTool: ToolDefinition = {
  name: "calculator",
  description: "Perform mathematical calculations (add, subtract, multiply, divide, percentage). ONLY use this for math operations with numbers. Do NOT use for document analysis or text-based queries.",
  schema: calculatorSchema,
  parameters: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["add", "subtract", "multiply", "divide", "percentage"],
        description: "The mathematical operation to perform",
      },
      a: {
        type: "number",
        description: "First number",
      },
      b: {
        type: "number",
        description: "Second number (required for most operations)",
      },
    },
    required: ["operation", "a"],
  },
  run: async (args: CalculatorArgs) => {
    const { operation, a, b } = args;
    let result: number;

    switch (operation) {
      case "add":
        if (b === undefined) throw new Error("Second number required for addition");
        result = a + b;
        break;
      case "subtract":
        if (b === undefined) throw new Error("Second number required for subtraction");
        result = a - b;
        break;
      case "multiply":
        if (b === undefined) throw new Error("Second number required for multiplication");
        result = a * b;
        break;
      case "divide":
        if (b === undefined) throw new Error("Second number required for division");
        if (b === 0) throw new Error("Cannot divide by zero");
        result = a / b;
        break;
      case "percentage":
        if (b === undefined) throw new Error("Second number required for percentage calculation");
        result = (a / 100) * b;
        break;
      default:
        throw new Error(`Unknown operation: ${operation as string}`);
    }

    return {
      operation,
      operands: b !== undefined ? [a, b] : [a],
      result: Math.round(result * 100) / 100,
    };
  },
};
