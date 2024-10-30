import { createResource } from "@/lib/actions/resources";
import { findRelevantContent } from "@/lib/ai/embeddings";
import { convertToCoreMessages, streamText, tool } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await streamText({
    model: google("gemini-1.5-flash-latest"),
    messages: convertToCoreMessages(messages),
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls,do not respond`,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z
            .string()
            .describe("the content or resource to add to the knowledge base"),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
      getInformation: tool({
        type: "function",
        description: `Get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe("the user's question"),
        }),
        execute: async ({ question }) => {
          const result = await findRelevantContent(question);
          return { response: result };
        },
      }),      
    },
  });
  return result.toDataStreamResponse();
}
