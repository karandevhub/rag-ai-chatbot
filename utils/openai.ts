import { OpenAIEmbeddings } from '@langchain/openai';
import { MongoDBAtlasVectorSearch, MongoDBAtlasVectorSearchLibArgs } from '@langchain/mongodb';
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
import env from "@beam-australia/react-env";
dotenv.config();

let embeddingsInstance: OpenAIEmbeddings | null = null;
const URI = env("MONGODB_URI")
console.log(URI)
export const client = new MongoClient(URI);
const namespace = "chatter.training_data";
const [dbName, collectionName] = namespace.split(".");
export const collection = client.db(dbName).collection(collectionName);

export function getEmbeddingsTransformer(): OpenAIEmbeddings {
    try {
        if (!embeddingsInstance) {
            embeddingsInstance = new OpenAIEmbeddings();
        }
        return embeddingsInstance;
    } catch (error) {
        console.error("Error creating OpenAIEmbeddings instance:", error);
        console.error("Retrying creation of OpenAIEmbeddings...");
        embeddingsInstance = new OpenAIEmbeddings();
        if (!embeddingsInstance) {
            throw new Error("Failed to create OpenAIEmbeddings instance after retries. Check the logs for details.");
        }

        return embeddingsInstance; 
    }
}

export function vectorStore(): MongoDBAtlasVectorSearch {
    const vectorStore: MongoDBAtlasVectorSearch = new MongoDBAtlasVectorSearch(
        new OpenAIEmbeddings(),
        searchArgs()
    );
    return vectorStore
}

export function searchArgs(): MongoDBAtlasVectorSearchLibArgs {
    const searchArgs: MongoDBAtlasVectorSearchLibArgs = {
        collection:collection,
        indexName: "vector_index",
        textKey: "text",
        embeddingKey: "text_embedding",
    }
    return searchArgs;
}