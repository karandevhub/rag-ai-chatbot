"use server";
import "../../../envConfig";
import { LangChainStream } from "ai";
import { ChatOpenAI } from "@langchain/openai";
import { inMemoryStore, vectorStore } from "@/utils/openai";
import { NextResponse } from "next/server";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";

export async function POST(req: Request) {
  try {
    const { stream, handlers } = LangChainStream();
    const { messages, storedFile } = await req.json();
    console.log(messages);
    const currentMessage = messages[messages.length - 1].content;
    const previousMessages = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));
    console.log("stored file", storedFile);
    const llm = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY ?? "xyzassdklfdskjsdsnmfbd",
      temperature: 0.5,
      streaming: true,
      callbacks: [handlers],
    });

    const mongoretriever = vectorStore().asRetriever({
      searchType: "mmr",
      searchKwargs: { fetchK: 10, lambda: 0.25 },
    });

    const memoryretriver = inMemoryStore.asRetriever({
      searchType: "mmr",
      searchKwargs: { fetchK: 10, lambda: 0.25 },
    });

    console.log("in", memoryretriver);
    console.log("out", mongoretriever);

    const prompt = PromptTemplate.fromTemplate(`
        You are a knowledgeable assistant that provides concise and focused answers based on the provided documents and chat history.
        Your task is to:
        1. Analyze the provided context efficiently.
        2. Extract the most relevant information.
        4. Organize the information using combination of paragraphs, bullet points, bold text, headings, or numbered lists to increase the readablity.
        5. Avoid unnecessary elaboration or repetition.
        6. Proactively ask clarifying questions if the original question is unclear or ambiguous.
        7. Ensure your response is factually accurate based on the provided information. Do not speculate or make unsupported claims.
        8. Incluse chat history also as context to answer. 
        9. If the given context does not contain sufficient information to fully answer the question, state directly: "I don't have enough information to answer that."
    
        Context from documents:
        {context}
    
        Previous conversation:
        {chat_history}
    
        Question: {input}
    
        Please provide an answer concise and stick to user's question .
    
        Answer:
      `);

    const combineDocsChain = await createStuffDocumentsChain({
      llm,
      prompt,
      outputParser: new StringOutputParser(),
      documentSeparator: "\n",
    });

    const retrievalChain = await createRetrievalChain({
      retriever: storedFile ? memoryretriver : mongoretriever,
      combineDocsChain,
    });

    const res = retrievalChain.invoke({
      input: currentMessage,
      chat_history: previousMessages,
    });

    console.log(res);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return NextResponse.json({ message: "Error Processing" }, { status: 500 });
  }
}
