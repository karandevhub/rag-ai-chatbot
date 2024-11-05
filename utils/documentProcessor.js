import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function processDocuments() {
  // Load documents from the 'documents' directory
  const loader = new DirectoryLoader(
    "documents/",
    {
      ".pdf": (path) => new PDFLoader(path),
      ".txt": (path) => new TextLoader(path)
    }
  );

  const docs = await loader.load();

  // Split documents into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await textSplitter.splitDocuments(docs);

  // Create vector store
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );
  console.log("vector store",vectorStore)
  return vectorStore;
}