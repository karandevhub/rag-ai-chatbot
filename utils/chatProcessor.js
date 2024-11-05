import { ChatOpenAI } from "@langchain/openai";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  BaseOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";

export async function createChain(vectorStore) {
  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
    streaming: true,
  });

  // Enhanced prompt template for more detailed responses
  const prompt = PromptTemplate.fromTemplate(`
    You are a knowledgeable assistant that provides detailed and comprehensive answers based on the provided documents.
    Your task is to:
    1. Thoroughly analyze the provided context
    2. Extract relevant information and supporting details
    3. Provide a comprehensive answer from the documents
    4. Organize the information in a clear and structured way
    5. If there are multiple relevant points in the context, address each one
    6. Never start your responses with phrases like "Based on the documents" or "According to the information provided." Instead, give direct, knowledgeable answers while incorporating the context naturally.

    Context from documents:
    {context}

    Previous conversation:
    {chat_history}

    Question: {input}

    Please provide well-structured answer using the information from the documents. 
    If context are not relevent to the question, please respond  "No infomartion available".
    
    answer:`);

  // Create a chain for combining documents
  const combineDocsChain = await createStuffDocumentsChain({
    llm,
    prompt,
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
