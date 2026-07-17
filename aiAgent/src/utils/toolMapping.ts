import { bash } from "../tools/bash";

const allTools = { bash };

const availableToolsNames = Object.keys(allTools);

const availableFunctionsMapping = Object.fromEntries(
  Object.entries(allTools).map(([name, tool]) => [name, tool.toolCall]),
);

const availableToolsMapping = Object.fromEntries(
  Object.entries(allTools).map(([name, tool]) => [name, tool.toolDefinition]),
);

const tools = Object.values(allTools).map((tool) => tool.toolDefinition);

export {
  tools,
  availableToolsNames,
  availableFunctionsMapping,
  availableToolsMapping,
};
