import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadStatus {
  fileName: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

export default function PDFUploader() {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);

  const processFile = async (file: File) => {
    const uploadStatus: UploadStatus = {
      fileName: file.name,
      status: 'uploading',
      progress: 0
    };

    setUploads(prev => [...prev, uploadStatus]);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploads(prev =>
        prev.map(u =>
          u.fileName === file.name
            ? { ...u, status: 'complete', progress: 100 }
            : u
        )
      );
    } catch (error) {
      console.error('Error processing PDF:', error);
      setUploads(prev =>
        prev.map(u =>
          u.fileName === file.name
            ? {
                ...u,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : u
        )
      );
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(processFile);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload PDFs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            {isDragActive
              ? 'Drop PDFs here...'
              : 'Drag & drop PDFs here, or click to select files'}
          </p>
        </div>

        {uploads.map((upload) => (
          <div key={upload.fileName} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">{upload.fileName}</span>
              </div>
              {upload.status === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>

            {upload.status !== 'complete' && (
              <Progress value={upload.progress} className="h-2" />
            )}

            {upload.status === 'error' && (
              <Alert variant="destructive">
                <AlertDescription>{upload.error}</AlertDescription>
              </Alert>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}