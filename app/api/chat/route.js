import { LangChainStream } from "ai";
import { createChain } from "@/utils/chatProcessor";
import { processDocuments } from "@/utils/documentProcessor";

let vectorStore;
let chain;

export async function POST(req) {
  try {
    const { messages } = await req.json();
    if (!vectorStore) {
      vectorStore = await processDocuments();
      chain = await createChain(vectorStore);
    }
    const { stream, handlers } = LangChainStream();
    const currentMessage = messages[messages.length - 1].content;
    const previousMessages = messages.slice(0, -1).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    chain.invoke(
      {
        input: currentMessage,
        chat_history: previousMessages,
      },
      {
        callbacks: [handlers],
      }
    );
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
