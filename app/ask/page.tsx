'use client';

import { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Error:', error);
      alert('An error occurred while getting the response.');
    },
    maxSteps: 3
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center">
        <h2 className="ml-4 text-xl font-medium">Chat</h2>
        <Link href="/teach" className="ml-auto bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" >
          Train
        </Link>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6"
      >
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg ${msg.role === 'user'
                  ? 'bg-gray-300 text-gray-800'
                  : 'bg-gray-100 text-gray-800'
                  }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold mb-2">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold mb-2">{children}</h2>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 mb-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 mb-2">{children}</ol>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-4 italic">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-gray-100 p-4 flex items-center">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={handleInputChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          className="flex-1 mr-4"
        />
        <Button onClick={() => handleSubmit()} disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-gray-800 rounded-full mx-1 animate-pulse"
                />
              ))}
            </div>
          ) : (
            'Send'
          )}
        </Button>
      </div>
    </div>
  );
}