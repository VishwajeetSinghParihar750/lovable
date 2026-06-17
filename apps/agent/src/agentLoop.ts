import { GoogleGenAI, Type } from "@google/genai";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const SYSTEM_INSTRUCTION = `
You are an autonomous coding assistant.

Your goal is to complete the user's request by using the available tools.

You have access to one tool:

bash(command: string)

Rules:
- Use bash whenever information or actions are needed.
- Explore the filesystem before making assumptions.
- Read files before modifying them.
- Prefer small, incremental changes.
- Verify your work by running commands and tests when possible.
- If a command fails, inspect the error and try to recover.
- Continue working until the task is complete.
- When finished, provide a concise summary of what was done.

Output either:
1. A tool call
or
2. A final response

Never invent command outputs. Only use information obtained from tool results.
`;

const bash = async (cmd: string) => {
  try {
    const { stderr, stdout } = await execAsync(cmd);
    // console.log(stdout);
    return { success: true, stderr, stdout };
  } catch (error: any) {
    return {
      success: false,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? error.message,
    };
  }
};
const bashFunction = {
  name: "bash",
  description: `bash --version
GNU bash, version 5.2.21(1)-release (x86_64-pc-linux-gnu)
Copyright (C) 2022 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>

This is free software; you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.`,
  parameters: {
    type: Type.OBJECT,
    properties: {
      command: {
        type: Type.STRING,
        description: "the command to run on bash terminal ex. ls",
      },
    },
    required: ["command"],
  },
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const getResponseFromAi = async (contents: any[]) => {
  return await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: [bashFunction] }],
    },
  });
};

let contents: any[] = [];

const init = async () => {
  //
};

const agentLoop = async (userPrompt: string) => {
  contents.push({ role: "user", parts: [{ text: userPrompt }] });

  let response = await getResponseFromAi(contents);

  let iteartion = 1;

  while (response.functionCalls && response.functionCalls.length > 0) {
    contents.push(response.candidates![0]?.content);
    const fc = response.functionCalls;
    for (let f of fc) {
      if (f.name == "bash") {
        let curFunctionResponse = await bash(f!.args!.command as string);

        contents.push({
          role: "user",
          parts: [
            {
              functionResponse: {
                name: f.name,
                response: curFunctionResponse,
                id: f.id,
              },
            },
          ],
        });
      }
      //
    }
    //
    response = await getResponseFromAi(contents);
  }

  console.log(response.text);
};

export { init, agentLoop };
