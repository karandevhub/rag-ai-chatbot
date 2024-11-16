import { NextRequest, NextResponse } from 'next/server';
import { getEmbeddingsTransformer, searchArgs } from '@/utils/openai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx';
import uploadToGCS, { bucket } from '@/utils/uploadCloud';

export async function POST(req: NextRequest) {
  try {
    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll('filepond');
    const results = [];
    console.log("ups",uploadedFiles)
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json({ message: 'No files found' }, { status: 400 });
    }


    for (const uploadedFile of uploadedFiles) {
      console.log("up",uploadedFile)
      if (!(uploadedFile instanceof File)) {
        console.log('Skipping invalid file format');
        continue
      }

      try {
        const result = await processFile(uploadedFile);
        results.push(result);
      } catch (error) {
        console.error(`Error processing file ${uploadedFile.name}:`, error);
        results.push({
          fileName: uploadedFile.name,
          status: 'error',
          message: error
        });
      }
    }

    return NextResponse.json({
      message: 'Files processed',
      results
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({
      message: 'An error occurred during processing',
      error: error
    }, { status: 500 });
  }
}

async function processFile(uploadedFile: File) {
  const fileBlob = new Blob([await uploadedFile.arrayBuffer()], {
    type: uploadedFile.type,
  });

  let loader;
  let docs;

  // Validate file type and load document
  switch (uploadedFile.type) {
    case 'application/pdf':
      loader = new PDFLoader(fileBlob, { splitPages: false });
      break;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      loader = new DocxLoader(fileBlob);
      break;
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      loader = new PPTXLoader(fileBlob);
      break;
    default:
      throw new Error(`Unsupported file type: ${uploadedFile.type}`);
  }

  docs = await loader.load();

  if (docs.length === 0) {
    throw new Error('No text content found in the file.');
  }

  // Upload to GCS
  const gcsUrl = await uploadToGCS(uploadedFile);

  // Process documents
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
  });

  const splitDocs = await textSplitter.splitDocuments(docs);

  const chunksWithMetadata = splitDocs.map((doc) => ({
    pageContent: `${doc.pageContent}\n\nDocument URL: https://storage.googleapis.com/${bucket.name}/${gcsUrl}`,
    metadata: {
      fileName: uploadedFile.name,
      type: uploadedFile.type,
      url: gcsUrl,
    },
  }));

  // Store in vector database
  await MongoDBAtlasVectorSearch.fromDocuments(
    chunksWithMetadata,
    getEmbeddingsTransformer(),
    searchArgs()
  );

  return {
    fileName: uploadedFile.name,
    status: 'success',
    url: gcsUrl
  };
}