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
    const cleanedContent = content.replace(/\0/g, '');

    // Insert resource and retrieve the inserted record
    const [resource] = await db
      .insert(resources)
      .values({ content:cleanedContent})
      .returning();

    console.log("Inserted resource:", resource);

    // Generate embeddings for the content
    const embeddings = await generateEmbeddings(cleanedContent);
    console.log("Generated embeddings:", embeddings);

    // Prepare embedding records with resourceId
    const embeddingRecords = {
      resourceId: resource.id,
      content: embeddings.content,
      embedding: embeddings.embedding, // This should be an array of floats
    }

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




// import { db } from "@/lib/db";
// import { resources } from "@/lib/db/schema/resources";
// import { embeddings } from "@/lib/db/schema/embeddings";

// interface StoreResourceParams {
//   content: string;
//   embedding: number[];
//   pageNumber?: number;
// }

// export async function storeResourceWithEmbeddings({
//   content,
//   embedding,
//   pageNumber,
// }: StoreResourceParams) {
//   try {

//     console.log("storeResourceWithEmbeddings",embedding)
//     function cleanUTF8(str: string) {
//       return str.replace(/[^\x00-\x7F]/g, "");
//     }

//     // Use cleaned content in the insert
//     const [resource] = await db
//       .insert(resources)
//       .values({
//         content: cleanUTF8(content),
//         metadata: pageNumber ? { pageNumber } : undefined,
//       })
//       .returning();

//     await db.insert(embeddings).values({
//       resourceId: resource.id,
//       content,
//       embedding,
//     });

//     return resource;
//   } catch (error) {
//     console.error("Error storing resource and embedding:", error);
//     throw error;
//   }
// }
