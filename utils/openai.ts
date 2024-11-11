import { OpenAIEmbeddings } from '@langchain/openai';
import { MongoDBAtlasVectorSearch, MongoDBAtlasVectorSearchLibArgs } from '@langchain/mongodb';
import { MongoClient, MongoClientOptions } from "mongodb";
import dotenv from 'dotenv';
import env from "@beam-australia/react-env";
dotenv.config();

let embeddingsInstance: OpenAIEmbeddings | null = null;

// MongoDB connection configuration
const mongoOptions: MongoClientOptions = {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: false,
    retryWrites: true,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
};

// Async function to create and test MongoDB connection
async function createMongoClient() {
    try {
        const client = new MongoClient(
            "mongodb+srv://daredevil15963:U8sPkw3zv88aPgG1@cluster0.nni1s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
            mongoOptions
        );

        // Test the connection
        await client.connect();
        console.log("Successfully connected to MongoDB Atlas");
        
        // Ping the database
        await client.db("admin").command({ ping: 1 });
        console.log("Database ping successful");

        return client;
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        throw error;
    }
}

// Create the client instance
export const client = await createMongoClient();


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