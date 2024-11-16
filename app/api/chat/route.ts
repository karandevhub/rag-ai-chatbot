'use server';

import '../../../envConfig';

import { LangChainStream } from 'ai';
import { NextResponse } from 'next/server';
import { inMemoryStore, vectorStore } from '@/utils/openai';

import { ChatOpenAI } from '@langchain/openai';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { createRetrievalChain } from 'langchain/chains/retrieval';


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
    console.log('stored file', storedFile);
    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      openAIApiKey: process.env.OPENAI_API_KEY ?? 'xyzassdklfdskjsdsnmfbd',
      temperature: 0.5,
      streaming: true,
      callbacks: [handlers],
    });

    const mongoretriever = vectorStore().asRetriever({
      searchType: 'mmr',
      searchKwargs: { fetchK: 10, lambda: 0.25 },
    });

    const memoryretriver = inMemoryStore.asRetriever({
      searchType: 'mmr',
      searchKwargs: { fetchK: 10, lambda: 0.25 },
    });

    const retriver = storedFile ? memoryretriver : mongoretriever;

    console.log('retriver', retriver);

    const prompt = PromptTemplate.fromTemplate(`
      You are a smart and friendly assistant with access to a knowledge base.
    
      Provided Context (Knowledge Base):
      {context}
    
      User's Query:
      {input}
    
      Instructions:
      1. First, analyze the user's query carefully to understand its intent.
      2. If the query is specific to the provided context, use the context as your primary source of information and craft an accurate, relevant response based on it.
      3. If the query is general or unrelated to the context (e.g., greetings or casual questions), respond naturally using your general knowledge and conversational abilities.
      4. Always ensure your response is clear, friendly, and tailored to the user's needs, regardless of whether it relies on the context or general knowledge.
      5. If you use the provided context to answer user's questions and if URL of document is present, end your response with for more detail refer [document_name](document_url).

         
      Provide your answer below:
    
      Answer:
    `);

    const combineDocsChain = await createStuffDocumentsChain({
      llm,
      prompt,
      outputParser: new StringOutputParser(),
      documentSeparator: '\n',
    });

    const retrievalChain = await createRetrievalChain({
      retriever: retriver,
      combineDocsChain,
    });

    const res = await retrievalChain.invoke({
      input: currentMessage,
      chat_history: previousMessages,
    });

    console.log("my res",res.context[0].metadata);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (e) {
    return NextResponse.json({ message: 'Error Processing' }, { status: 500 });
  }
}
