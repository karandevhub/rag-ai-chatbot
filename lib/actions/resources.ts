"use server";

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from "@/lib/db/schema/resources";
import { db } from "../db";
import { embeddings as embeddingsTable } from "../db/schema/embeddings";
import { generateEmbeddings } from "../ai/embeddings";

export const createResource = async (input: NewResourceParams) => {
  try {
    // Validate input data
    const { content } = insertResourceSchema.parse(input);

    // Insert resource and retrieve the inserted record
    const [resource] = await db
      .insert(resources)
      .values({ content })
      .returning();

    console.log("Inserted resource:", resource);

    // Generate embeddings for the content
    const embeddings = await generateEmbeddings(content);
    console.log("Generated embeddings:", embeddings);

    // Prepare embedding records with resourceId
    const embeddingRecords = embeddings.map((embedding) => ({
      resourceId: resource.id,
      content: embedding.content,
      embedding: embedding.embedding, // This should be an array of floats
    }));

    console.log("Prepared embedding records:", embeddingRecords);

    // Attempt to insert embeddings
    const insertResult = await db.insert(embeddingsTable).values(embeddingRecords);
    console.log("Embeddings insertion result:", insertResult);

    return "Resource successfully created and embedded.";
  } catch (error) {
    // Log the error if the insertion fails
    console.error("Error during insertion:", error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : "Error, please try again.";
  }
};
