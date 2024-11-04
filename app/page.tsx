'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { messages, input, handleInputChange, handleSubmit } = useChat(
    {maxSteps:10}
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setFile(e.target.files[0]);
  };

  const uploadPDF = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>PDF Chat Assistant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="mb-2"
            />
            <Button
              onClick={uploadPDF}
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? 'Processing PDF...' : 'Upload PDF'}
            </Button>
          </div>

          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            {messages.map((m) => (
              <div key={m.id} className="whitespace-pre-wrap">
                <div>
                  <div className="font-bold">{m.role}</div>
                  {m.content ? (
                    <p>{m.content}</p>
                  ) : m.toolInvocations && m.toolInvocations.length > 0 ? (
                    <div>
                      <p className="italic font-light">
                        {'calling tool: ' + m.toolInvocations[0].toolName}
                      </p>
                      {m.toolInvocations[0].state === 'result' && (
                        <p className="mt-2">

                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question about the PDF..."
              className="flex-1"
            />
            <Button type="submit">Send</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}





