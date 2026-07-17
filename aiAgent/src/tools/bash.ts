import { exec } from "child_process";
import { promisify } from "util";

const asyncExec = promisify(exec);

const bashRun = async (args: {
  command: string;
}): Promise<{ stderr: string; stdout: string } | { error: string }> => {
  console.log("called bash with : ", args.command);
  try {
    return await asyncExec(args.command);
  } catch (error) {
    return { error: (error as Error).message };
  }
};
const bashTool: any = {
  type: "function",
  name: "bash",
  description: `GNU bash, version 5.3.9(1)-release (x86_64-pc-linux-gnu)
  returns {stderr : string, stdout : string} | {error : string}
  `,
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "command to run on bash",
      },
    },
    required: ["command"],
  },
};

const bash = { toolDefinition: bashTool, toolCall: bashRun };

export { bash };
