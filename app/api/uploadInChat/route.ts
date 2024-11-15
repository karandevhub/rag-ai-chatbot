import { NextRequest, NextResponse } from "next/server";
import {
  inMemoryStore,
  inMemoryVectorStore,
} from "@/utils/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { File } from "buffer";

export async function POST(req: NextRequest) {
  try {
    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll("file");
    console.log(uploadedFiles);
    await inMemoryVectorStore()
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const uploadedFile of uploadedFiles) {
        if (uploadedFile instanceof File) {
          const fileBlob = new Blob([await uploadedFile.arrayBuffer()], {
            type: uploadedFile.type,
          });

          let loader;
          let docs;
          switch (uploadedFile.type) {
            case "application/pdf":
              loader = new PDFLoader(fileBlob, {
                splitPages: false,
              });
              docs = await loader.load();
              break;
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
              loader = new DocxLoader(fileBlob);
              docs = await loader.load();
              break;
            case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
              loader = new PPTXLoader(fileBlob);
              docs = await loader.load();
              break;
            default:
              console.log(
                `Unsupported file type: ${uploadedFile.type}. Skipping this file.`
              );
              return NextResponse.json(
                {
                  message: `Unsupported file type: ${uploadedFile.type}. Skipping this file.`,
                },
                { status: 400 }
              );
          }

          if (docs.length === 0) {
            return NextResponse.json(
              { message: "No text content found in the PDF file." },
              { status: 400 }
            );
          }

          const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
          });

          const splitDocs = await textSplitter.splitDocuments(docs);
          console.log(splitDocs)
          inMemoryStore.addDocuments(splitDocs);
        } else {
          console.log(
            "Uploaded file is not in the expected format. Skipping this file."
          );
        }
      }

      return NextResponse.json(
        { message: "All uploaded files processed successfully" },
        { status: 200 }
      );
    } else {
      console.log("No files found.");
      return NextResponse.json({ message: "No files found" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse("An error occurred during processing.", {
      status: 500,
    });
  }
}
