import React, { useRef, useState, ChangeEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError('');
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('api/uploadInChat', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        // Handle successful upload
        const data = await response.json();
        console.log('File uploaded successfully:', data);
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadError('Failed to upload file. Please try again.');
        removeFile();
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeFile = async () => {
    try {
      const response = await fetch('api/clearstore', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      setSelectedFile(null);
      setUploadError('');
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error cleaing store file:', error);
      setUploadError('Failed to clear store. Please try again.')
    }

  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

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
    <div className="sticky bottom-0 p-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <form ref={formRef} onSubmit={onSubmit}>
          {uploadError && (
            <div className="flex justify-end mb-2">
              <div className="text-sm text-red-500">{uploadError}</div>
            </div>
          )}

          {selectedFile && (
            <div className="flex justify-end mb-2">
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                <span className="text-sm mr-2 truncate max-w-[150px]">
                  {getFileIcon(selectedFile.type)}
                  {selectedFile.name}
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

            <div className="relative w-full">
              <Textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="w-full pr-24 pl-4 resize-none rounded-2xl border border-gray-300 hover:border-gray-400 focus:border-gray-200 transition-colors duration-200 outline-none ring-0 focus:ring-0 focus:outline-none"
                rows={1}
                disabled={isLoading}
                style={{
                  minHeight: '60px',
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