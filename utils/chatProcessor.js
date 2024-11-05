import { ChatOpenAI } from "@langchain/openai";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function createChain(vectorStore) {
  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.5, // Lower temperature for more deterministic output
    streaming: true,
  });

  // Enhanced prompt template for structured responses
  const prompt = PromptTemplate.fromTemplate(`
    You are a knowledgeable assistant that provides concise and focused answers based on the provided documents.
    Your task is to:
    1. Analyze the provided context efficiently.
    2. Extract the most relevant information.
    4. Organize the information using combination of paragraphs, bullet points, bold text, headings, or numbered lists to increase the readablity.
    5. Avoid unnecessary elaboration or repetition.
    6. Proactively ask clarifying questions if the original question is unclear or ambiguous.
    7. Ensure your response is factually accurate based on the provided information. Do not speculate or make unsupported claims.
    8. If the given context does not contain sufficient information to fully answer the question, state directly: "I don't have enough information to answer that."

    Context from documents:
    {context}

    Previous conversation:
    {chat_history}

    Question: {input}

    Please provide an answer concise and stick to user's question .

    Answer:
  `);

  // Create a chain for combining documents
  const combineDocsChain = await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser: new StringOutputParser(),
    documentSeparator:"\n"
  });

  // Create the retrieval chain
  const retrievalChain = await createRetrievalChain({
    retriever: vectorStore.asRetriever({
      // Increase the number of retrieved documents for more comprehensive context
      k: 4,
      // Filter for similarity to ensure relevance
      minRelevanceScore: 0.7,
    }),
    combineDocsChain,
  });

  return retrievalChain;
}


export function formatChatHistory(history) {
  return history.map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });
}