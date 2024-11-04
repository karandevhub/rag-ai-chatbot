import { db } from "../db";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { embeddings } from "../db/schema/embeddings";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddingModel = new OpenAIEmbeddings();


export const generateEmbeddings = async (value: string) => {
  const vectors = await embeddingModel.embedDocuments([value]);
  return { content: value, embedding: vectors[0] };
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const vectors = await embeddingModel.embedDocuments([input]);
  return vectors[0];
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded
  )})`;
  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(4);

  console.log("similar guides", similarGuides);
  return similarGuides;
};
