import { OpenAIEmbeddings } from "@langchain/openai";
import {
  MongoDBAtlasVectorSearch,
  MongoDBAtlasVectorSearchLibArgs,
} from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
dotenv.config();

let embeddingsInstance: OpenAIEmbeddings | null = null;

export const client = new MongoClient(
  "mongodb+srv://daredevil15963:U8sPkw3zv88aPgG1@cluster0.nni1s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);
await client.connect();

const namespace = "chatter.training_data";
const [dbName, collectionName] = namespace.split(".");
export const collection = client.db(dbName).collection(collectionName);

export function getEmbeddingsTransformer(): OpenAIEmbeddings {
  try {
    if (!embeddingsInstance) {
      embeddingsInstance = new OpenAIEmbeddings({
        openAIApiKey: "",
      });
    }
    return embeddingsInstance;
  } catch (error) {
    console.error("Error creating OpenAIEmbeddings instance:", error);
    console.error("Retrying creation of OpenAIEmbeddings...");
    embeddingsInstance = new OpenAIEmbeddings({
      openAIApiKey: "",
    });
    if (!embeddingsInstance) {
      throw new Error(
        "Failed to create OpenAIEmbeddings instance after retries. Check the logs for details."
      );
    }

    return embeddingsInstance;
  }
}

export function vectorStore(): MongoDBAtlasVectorSearch {
  const vectorStore: MongoDBAtlasVectorSearch = new MongoDBAtlasVectorSearch(
    getEmbeddingsTransformer(),
    searchArgs()
  );
  return vectorStore;
}

export let inMemoryStore: MemoryVectorStore = new MemoryVectorStore(
  new OpenAIEmbeddings(getEmbeddingsTransformer())
);
export async function inMemoryVectorStore(): Promise<MemoryVectorStore> {
  try {
    inMemoryStore = new MemoryVectorStore(getEmbeddingsTransformer());
    console.log("Memory Vector Store initialized successfully.");
    return inMemoryStore;
  } catch (error) {
    console.error("Error initializing Memory Vector Store:", error);
    throw error;
  }
}

export function searchArgs(): MongoDBAtlasVectorSearchLibArgs {
  const searchArgs: MongoDBAtlasVectorSearchLibArgs = {
    collection: collection,
    indexName: "vector_index",
    textKey: "text",
    embeddingKey: "text_embedding",
  };
  return searchArgs;
}
