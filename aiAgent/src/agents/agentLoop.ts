import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const geminiModel = "gemini-3.5-flash";
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
});

type agentLoopArgs = {
  systemInstruction: string;
  message: string;
  tools: any[];
  availableFunctions: any;
  onOutput: (output: string) => void;
  onFinish: () => void;
  outputStructure?: any;
};

type FunctionCall = {
  id: string;
  name: string;
  args: string;
};

let previousInteractionId: any = undefined;
export async function agentLoop(
  args: agentLoopArgs,
): Promise<string | undefined> {
  let {
    systemInstruction,
    message,
    tools,
    availableFunctions,
    onFinish,
    onOutput,
  } = args;

  let nextInput: any = [
    {
      type: "user_input",
      content: [{ type: "text", text: message }],
    },
  ];

  while (true) {
    console.log(nextInput);

    const stream = await ai.interactions.create({
      model: geminiModel,
      tools,
      system_instruction: systemInstruction,
      stream: true,
      input: nextInput,
      previous_interaction_id: previousInteractionId,
    });

    const functionCalls: FunctionCall[] = [];
    let currentFunction: FunctionCall | null = null;

    for await (const event of stream) {
      if (event.event_type === "interaction.created") {
        previousInteractionId = event.interaction.id;
      } else if (event.event_type === "step.start") {
        const step = event.step;
        if (step.type === "function_call") {
          currentFunction = { id: step.id, name: step.name, args: "" };
          functionCalls.push(currentFunction);
        }
      } else if (event.event_type === "step.delta") {
        if (event.delta.type === "arguments_delta") {
          if (currentFunction) currentFunction.args += event.delta.arguments;
        } else if (event.delta.type === "text") {
          onOutput(event.delta.text);
        }
      }
    }

    if (functionCalls.length == 0) {
      onFinish();
      return;
    }

    console.log(functionCalls);
    const functionOutputs = [];
    for (const functionCall of functionCalls) {
      onOutput(
        "Calling tool " +
          functionCall.name +
          " with args : " +
          functionCall.args,
      );

      const result = await (availableFunctions as any)[functionCall.name](
        JSON.parse(functionCall.args || "{}"),
      );

      functionOutputs.push({
        type: "function_result",
        name: functionCall.name,
        call_id: functionCall.id,
        result,
      });
    }
    nextInput = functionOutputs;
  }
}
