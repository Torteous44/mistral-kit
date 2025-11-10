import { calculatorTool } from "./calculator";
import { weatherTool, createWeatherTool } from "./weather";
import { dateTimeTool } from "./dateTime";
import { searchDocsTool } from "./searchDocs";

export { calculatorTool, weatherTool, createWeatherTool, dateTimeTool, searchDocsTool };

export const defaultTools = [
  weatherTool,
  calculatorTool,
  dateTimeTool,
  searchDocsTool,
];
