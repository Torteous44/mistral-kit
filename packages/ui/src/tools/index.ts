import { calculatorTool } from "./calculator";
import { weatherTool } from "./weather";
import { dateTimeTool } from "./dateTime";
import { searchDocsTool } from "./searchDocs";

export { calculatorTool, weatherTool, dateTimeTool, searchDocsTool };

export const defaultTools = [
  weatherTool,
  calculatorTool,
  dateTimeTool,
  searchDocsTool,
];
