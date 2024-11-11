'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { AlertTriangle, BookOpen, Loader2, Send } from 'lucide-react';

const HISTORY_LIMIT = 30;

const HistoryLimitAlert = ({ onClose }: { onClose: () => void }) => (
  <Alert variant="destructive" className="mb-4 mx-auto max-w-4xl">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Memory Full</AlertTitle>
    <AlertDescription className="mt-2">
      <p className="mb-2">
        You&apos;ve reached the maximum chat history limit. Please clear your chat history to continue the conversation.
      </p>
      <Button 
        variant="destructive"
        onClick={onClose}
        className="mt-2"
      >
        Clear History
      </Button>
    </AlertDescription>
  </Alert>
);

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [showHistoryAlert, setShowHistoryAlert] = useState(false);

  const getInitialMessages = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('chatHistory');
      const parsedMessages = stored ? JSON.parse(stored) : [];
      
      // Check if stored messages exceed limit
      if (parsedMessages.length > HISTORY_LIMIT) {
        setShowHistoryAlert(true);
        return [];
      }
      return parsedMessages;
    } catch (e) {
      console.error('Error parsing chat history:', e);
      return [];
    }
  };

  const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Error:', error);
      if (error.message?.includes('HISTORY_LIMIT_EXCEEDED')) {
        setShowHistoryAlert(true);
      } else {
        alert('An error occurred while getting the response.');
      }
    },
    maxSteps: 3,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    const storedMessages = getInitialMessages();
    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    }
  }, [setMessages]);

  useEffect(() => {
    if (messages.length > 0 && isClient) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages, isClient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const clearHistory = () => {
    localStorage.removeItem('chatHistory');
    setMessages([]);
    setShowHistoryAlert(false);
  };

  // Wrap handleSubmit to check message limit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (messages.length >= HISTORY_LIMIT) {
      setShowHistoryAlert(true);
      return;
    }
    originalHandleSubmit(e);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-2 py-3 flex items-center">
          <h1 className="text-xl font-semibold">R.A.G</h1>
          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={clearHistory}
              className="text-sm"
            >
              Clear History
            </Button>
            <Link
              href="/teach"
              className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              <BookOpen size={18} />
              <span>Train</span>
            </Link>
          </div>
        </div>
      </header>

      {/* History Limit Alert */}
      {showHistoryAlert && (
        <div className="p-4">
          <HistoryLimitAlert onClose={clearHistory} />
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6"
      >
        <div className="flex flex-col gap-4">
          {isClient && messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg ${
                  msg.role === 'user'
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
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="container mx-auto max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="flex items-center space-x-4"
          >
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading || showHistoryAlert}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || showHistoryAlert}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Send</span>
                  <Send size={16} />
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}