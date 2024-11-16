import { NextRequest, NextResponse } from 'next/server';
import { collection } from '@/utils/openai';
import { bucket } from '@/utils/uploadCloud';

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();
    await deleteFile(url);
    await collection.deleteMany({ url });
    return NextResponse.json(
      { message: 'File deleted successfully' },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

async function deleteFile(url: string): Promise<void> {
  try {
    console.log(`Deleted file ${url}`);
    const file = bucket.file(url);
    await file.delete();
   
  } catch (error) {
    console.error(`Error deleting file ${url}:`, error);
    throw error;
  }
}
