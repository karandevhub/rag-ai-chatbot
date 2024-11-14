'use client';

import React, { useRef, useState, ChangeEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect } from 'react';
import { Paperclip, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getFileIcon } from '@/lib/utils';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement> | ReactKeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  handleInputChange,
  handleSubmit,
  isLoading
}) => {
  const [file, setFile] = useState<{ name: string; type: string } | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);




  const removeFile = async () => {
    setIsUploading(true)
    try {
      const response = await fetch('api/clearstore', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      localStorage.removeItem('uploadedFile');
      setFile(null);
      setUploadError('');
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setIsUploading(false);
      console.error('Error clearing store file:', error);
      setUploadError('Failed to clear store. Please try again.')
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile({
        name: uploadedFile.name,
        type: uploadedFile.type
      });
      setUploadError('');
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', uploadedFile);

        const response = await fetch('api/uploadInChat', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem("uploadedFile", JSON.stringify({
            name: uploadedFile.name,
            type: uploadedFile.type
          }));
        }


        console.log(`Uploaded file`, uploadedFile.name);
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadError('Failed to upload file. Please try again.');
        removeFile();
      } finally {
        setIsUploading(false);
      }
    }
  };
  let storedFile: any


  if (typeof window !== "undefined") {
    storedFile = window?.localStorage.getItem("uploadedFile");
  }
  


  useEffect(() => {
    try {
      setFile(storedFile ? JSON.parse(storedFile) : null);
    } catch (error) {
      console.error("Error parsing stored file:", error);
      setFile(null);
    }
  }, [storedFile]);

 

  const handleKeyPress = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input?.trim() && !isLoading) {
        if (formRef.current) {
          handleSubmit(e);
        }
      }
    }
  };

  return (
    <div className="sticky bottom-0 p-4">
      <div className="container mx-auto max-w-4xl">
        <form ref={formRef} onSubmit={onSubmit}>
          {uploadError && (
            <div className="flex justify-end mb-2">
              <div className="text-sm text-red-500">{uploadError}</div>
            </div>
          )}

          {file && (
            <div className="flex justify-end mb-2">
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                <span className="text-sm mr-2 truncate max-w-[150px]">
                  {getFileIcon(file.type)}
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={removeFile}
                  disabled={isUploading}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  {isUploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <X size={16} />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="relative flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.docx,.pptx"
            />

            <div className="relative w-full bg-background">
              <Textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="w-full pr-24 pl-4 resize-none rounded-2xl border border-gray-400 hover:border-gray-500 focus:border-gray-200 transition-colors duration-200 outline-none ring-0 focus:ring-0 focus:outline-none"
                rows={1}
                disabled={isLoading}
                style={{
                  minHeight: '70px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  borderRadius: '10px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                } as React.CSSProperties}
              />

              <div className="absolute top-1/2 transform -translate-y-1/2 right-2 flex space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isUploading}
                  className="text-gray-500 hover:text-blue-500 transition-colors duration-200 rounded-full"
                >
                  <Paperclip size={24} />
                </Button>

                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  disabled={isLoading || !input?.trim()}
                  className={`text-blue-500 transition-colors duration-200  rounded-full
                    ${!input?.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-700 hover:bg-blue-50'}`}
                >
                  <Send fontWeight={"bold"} size={20} />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;