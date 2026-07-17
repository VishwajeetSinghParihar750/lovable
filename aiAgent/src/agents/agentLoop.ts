import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { assert } from "console";
// import {
//   SUMMARIZATION_OR_COMPACTION_OUTPUT_STRUCTURE,
//   SUMMARIZATION_OR_COMPACTION_SYSTEM_INSTRUCTION,
// } from "../utils/compactionSummarization";

const geminiModel = "gemini-3.5-flash";
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
});
const model = await ai.models.get({
  model: geminiModel,
});

type agentLoopArgs = {
  systemInstruction: string;
  chat: any[];
  tools: any[];
  availableFunctions: any;
  outputStructure?: any;
};

export async function agentLoop(
  args: agentLoopArgs,
): Promise<string | undefined> {
  const contextWindowSize = model.inputTokenLimit;
  assert(contextWindowSize, "context window size could not be found ");

  let { systemInstruction, chat, tools, availableFunctions, outputStructure } =
    args;

  while (true) {
    const interaction = await ai.interactions.create({
      model: geminiModel,
      input: chat,
      store: false,
      tools,
      system_instruction: systemInstruction,
      ...(outputStructure != undefined && outputStructure),
    });

    // const tokensUsed = interaction.usage?.total_tokens;
    // if (tokensUsed != undefined) {
    //   // maybe summarize / compaction
    //   if (contextWindowSize! / 2 < tokensUsed) {
    //     const compactionInteraction = await ai.interactions.create({
    //       model: geminiModel,
    //       input: chat,
    //       store: false,
    //       system_instruction: SUMMARIZATION_OR_COMPACTION_SYSTEM_INSTRUCTION,
    //       ...SUMMARIZATION_OR_COMPACTION_OUTPUT_STRUCTURE,
    //     });
    //     const parsedResponse = JSON.parse(compactionInteraction.output_text!);

    //     const { type, value } = parsedResponse;
    //     chat.length = 0;
    //     chat.push(...value);
    //   }
    // }

    chat.push(...interaction.steps);

    let hadFunctionCalls = false;
    const toolOutputs = [];

    for (const item of interaction.steps) {
      if (item.type !== "function_call") continue;

      hadFunctionCalls = true;

      const result = await (availableFunctions as any)[item.name](
        item.arguments,
      );

      toolOutputs.push({
        type: "function_result",
        name: item.name,
        call_id: item.id,
        result,
      });
    }

    if (!hadFunctionCalls) {
      return interaction.output_text;
    }

    chat.push(...toolOutputs);
  }
}
