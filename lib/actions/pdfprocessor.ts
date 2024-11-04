import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Chunk } from '@/app/types/types';

// Convert Buffer to Blob
function bufferToBlob(buffer: Buffer): Blob {
  return new Blob([buffer], { type: 'application/pdf' });
}

export async function extractTextFromPDF(file: Buffer | string | Blob): Promise<string[]> {
  try {
    let input: string | Blob;
    
    // Convert input to appropriate type
    if (Buffer.isBuffer(file)) {
      input = bufferToBlob(file);
    } else if (typeof file === 'string' || file instanceof Blob) {
      input = file;
    } else {
      throw new Error('Invalid input type. Expected Buffer, string, or Blob.');
    }

    const loader = new PDFLoader(input);
    const pages = await loader.load();
    return pages.map(page => page.pageContent);
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function createChunks(text: string[]): Promise<Chunk[]> {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });

    const chunks: Chunk[] = [];
    
    for (let pageNumber = 0; pageNumber < text.length; pageNumber++) {
      const pageContent = text[pageNumber];
      
      // Skip empty pages
      if (!pageContent.trim()) {
        continue;
      }

      const pageChunks = await splitter.splitText(pageContent);
      chunks.push(
        ...pageChunks.map(content => ({
          content,
          pageNumber: pageNumber + 1
        }))
      );
    }

    return chunks;
  } catch (error) {
    console.error('Error creating chunks:', error);
    throw new Error('Failed to create text chunks');
  }
}
