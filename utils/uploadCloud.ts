import { Storage } from '@google-cloud/storage';
import { File } from 'buffer';
import { format } from 'date-fns';
import credentials from './credentials';

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
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.type,
    },
  });

  const buffer = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    blobStream.on('error', (error) => reject(error));
    blobStream.on('finish', async () => {
      await blob.makePublic();
      resolve(filename);
    });

    blobStream.end(Buffer.from(buffer));
  });
}

export default uploadToGCS;
