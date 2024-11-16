import { Storage } from '@google-cloud/storage';
import { format } from 'date-fns';
import credentials from './credentials';
import { File } from 'buffer';

const storage = new Storage({
  projectId: 'quantum-device-433015-v5',
  credentials: credentials,
});

export const bucket = storage.bucket('rag-ai-llm');

async function uploadToGCS(file: File): Promise<string> {
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
  const filename = `${timestamp}-${cleanFileName}`;
  const blob = bucket.file(filename);

  try {
    const buffer = await file.arrayBuffer();
    
    await new Promise((resolve, reject) => {
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.type,
        },
      });

      blobStream
        .on('error', (error) => {
          blobStream.destroy();
          reject(error);
        })
        .on('finish', () => {
          resolve(true);
        });
      blobStream.end(Buffer.from(buffer));
    });
    await blob.makePublic();
    
    return filename;
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    throw new Error(`Failed to upload file to GCS: ${error}`);
  }
}

export default uploadToGCS;