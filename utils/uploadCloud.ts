import { Storage } from '@google-cloud/storage';
import { format } from 'date-fns';
import credentials from './credentials';
import { File } from 'buffer';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  credentials: credentials,
});

export const bucket = storage.bucket('rag-ai-llm');

async function uploadToGCS(file: File): Promise<string> {
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
  const filename = `${timestamp}-${cleanFileName}`;
  const blob = bucket.file(filename);

  try {
    // Get the buffer first
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload using the upload method instead of streams
    await blob.save(buffer, {
      contentType: file.type,
      metadata: {
        contentType: file.type,
      },
    });

    // Make the file public after successful upload
    await blob.makePublic();
    
    return filename;
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload file to GCS: ${error.message}`);
    } else {
      throw new Error('Failed to upload file to GCS: Unknown error');
    }
  }
}

export default uploadToGCS;