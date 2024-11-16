import { NextRequest, NextResponse } from 'next/server';
import { getEmbeddingsTransformer, searchArgs } from '@/utils/openai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx';
import uploadToGCS, { bucket } from '@/utils/uploadCloud';
import { File } from 'buffer';

export async function POST(req: NextRequest) {
  try {
    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll('filepond');
    const results = [];

    console.log(`Processing ${uploadedFiles.length} files`);

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json({ message: 'No files found' }, { status: 400 });
    }

    for (const uploadedFile of uploadedFiles) {
      console.log(`Processing file: ${uploadedFile instanceof File ? uploadedFile.name : 'Invalid file'}`);
      
      if (!(uploadedFile instanceof File)) {
        console.log('Invalid file format detected');
        results.push({
          status: 'error',
          message: 'Invalid file format'
        });
        continue;
      }

      try {
        // Log file details
        console.log(`File type: ${uploadedFile.type}`);
        console.log(`File size: ${uploadedFile.size} bytes`);

        const result = await processFile(uploadedFile);
        results.push(result);
      } catch (error) {
        console.error(`Error processing file ${uploadedFile.name}:`, error);
        results.push({
          fileName: uploadedFile.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
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
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

async function processFile(uploadedFile: File) {
  console.log(`Starting to process file: ${uploadedFile.name}`);
  
  try {
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

    console.log('Loading document content...');
    docs = await loader.load();

    if (!docs || docs.length === 0) {
      throw new Error('No text content found in the file.');
    }

    console.log('Uploading to GCS...');
    const gcsUrl = await uploadToGCS(uploadedFile);
    console.log(`File uploaded to GCS: ${gcsUrl}`);

    console.log('Processing document chunks...');
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);

    const chunksWithMetadata = splitDocs.map((doc) => ({
      pageContent: `${doc.pageContent}\n\nDocument URL: https://storage.googleapis.com/${bucket.name}/${gcsUrl}\n\nDocument name:${uploadedFile.name.replace(/\.[^/.]+$/, '')}`,
      metadata: {
        fileName: uploadedFile.name,
        type: uploadedFile.type,
        url: gcsUrl,
      },
    }));

    console.log('Storing in vector database...');
    await MongoDBAtlasVectorSearch.fromDocuments(
      chunksWithMetadata,
      getEmbeddingsTransformer(),
      searchArgs()
    );

    console.log(`Successfully processed file: ${uploadedFile.name}`);
    return {
      fileName: uploadedFile.name,
      status: 'success',
      url: gcsUrl
    };
  } catch (error) {
    console.error(`Error in processFile for ${uploadedFile.name}:`, error);
    throw error;
  }
}