import { createResource } from '@/lib/actions/resources';
import { findRelevantContent } from '@/lib/ai/embeddings';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-3.5-turbo'),
    messages,
    system: `You are a helpful assistant. Follow these rules strictly:
    1. Check your knowledge base before answering any questions using the getInformation tool
    2. After receiving information from the tool, you MUST provide a natural language response based on that information
    3. If adding new information, use the addResource tool and then confirm what was added
    4. If no relevant information is found, respond with "Sorry, I don't know."
    5. Never leave a tool call without a follow-up response
    6. After getInformation returns results, always respond with the information found`,
    experimental_toolCallStreaming: true,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z
            .string()
            .describe('the content or resource to add to the knowledge base'),
        }),
        execute: async ({ content }) => {
          const result = await createResource({ content });
          return `Successfully stored: ${content}`;
        },
      }),
      getInformation: tool({
        type: 'function',
        description: `get information from your knowledge base to answer questions.
          After getting information, you must respond with the information found.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => {
          const results = await findRelevantContent(question);
          if (results?.length > 0) {
            return `Found information: ${results[0].name}`;
          }
          return "No relevant information found.";
        },
      }),
    },
    temperature: 0.7,
    presencePenalty: 0.6,
    frequencyPenalty: 0.2
  });

  return result.toDataStreamResponse();
}