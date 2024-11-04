import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { createResource } from "@/lib/actions/resources";


export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    try {
      // Process PDF
      const loader = new PDFLoader(file,{
        splitPages:false
      });
      const docs = await loader.load();

      // Split documents
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 20,
      });
      const splittedDocs = await splitter.splitDocuments(docs);

    //   console.log("splitted",splittedDocs);

      // Add each chunk to the knowledge base
      for (const doc of splittedDocs) {
        await createResource({ content: doc.pageContent });
      }

      // Clean up: remove the temporary file

      return NextResponse.json({ success: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
