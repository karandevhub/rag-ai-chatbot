import { OpenAIEmbeddings } from '@langchain/openai';
import {
  MongoDBAtlasVectorSearch,
  MongoDBAtlasVectorSearchLibArgs,
} from '@langchain/mongodb';
import { MongoClient } from 'mongodb';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

let embeddingsInstance: OpenAIEmbeddings | null = null;

export const client = new MongoClient(
  process.env.MONGODB_URI || ''
);
await client.connect();

const namespace = 'chatter.training_data';
const [dbName, collectionName] = namespace.split('.');
export const collection = client.db(dbName).collection(collectionName);

export function getEmbeddingsTransformer(): OpenAIEmbeddings {
  try {
    if (!embeddingsInstance) {
      embeddingsInstance = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY ?? 'snkkd',
      });
    }
    return embeddingsInstance;
  } catch (error) {
    console.error('Error creating OpenAIEmbeddings instance:', error);
    console.error('Retrying creation of OpenAIEmbeddings...');
    embeddingsInstance = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY ?? 'snkkd',
    });
    if (!embeddingsInstance) {
      throw new Error(
        'Failed to create OpenAIEmbeddings instance after retries. Check the logs for details.'
      );
    }

    return embeddingsInstance;
  }
}

export function vectorStore(): MongoDBAtlasVectorSearch {
  const vectorStore: MongoDBAtlasVectorSearch = new MongoDBAtlasVectorSearch(
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY ?? 'snkkd',
    }),
    searchArgs()
  );
  return vectorStore;
}

export let inMemoryStore: MemoryVectorStore = new MemoryVectorStore(
  new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY ?? 'snkkd',
  })
);
export async function inMemoryVectorStore(): Promise<MemoryVectorStore> {
  try {
    inMemoryStore = new MemoryVectorStore(
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY ?? 'snkkd',
      })
    );
    console.log('Memory Vector Store initialized successfully.');
    return inMemoryStore;
  } catch (error) {
    console.error('Error initializing Memory Vector Store:', error);
    throw error;
  }
}

export function searchArgs(): MongoDBAtlasVectorSearchLibArgs {
  const searchArgs: MongoDBAtlasVectorSearchLibArgs = {
    collection: collection,
    indexName: 'vector_index',
    textKey: 'text',
    embeddingKey: 'text_embedding',
  };
  return searchArgs;
}
