'use client';

import {useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';
import HistoryLimitAlert from '@/components/HistoryLimitAlert';
import { ChatHeader } from '@/components/Header';
import { Overview } from '@/components/custom/overview';
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { PreviewMessage, ThinkingMessage } from '@/components/custom/message';
import { MultimodalInput } from '@/components/custom/multimodal-input';
import { Attachment } from 'ai';

const HISTORY_LIMIT = 100;



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

  let storedFile: any
  if (typeof window !== "undefined") {
    storedFile = window?.localStorage.getItem("uploadedFile");
  }


  const { messages, input, setInput, stop, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, setMessages, } = useChat({
    api: '/api/chat',
    body: {
      storedFile
    },
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
      window?.localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages, isClient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const clearHistory = () => {
    window?.localStorage.removeItem('chatHistory');
    setMessages([]);
    setShowHistoryAlert(false);
  };

  // Wrap handleSubmit to check message limit
  const handleSubmit = () => {
    if (messages.length >= HISTORY_LIMIT) {
      setShowHistoryAlert(true);
      return;
    }
    originalHandleSubmit();
  };


  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    // <div className="flex flex-col h-screen">
    //   <ChatHeader selectedModelId={'xyz'} />
    //   {showHistoryAlert && (
    //     <div className="p-4">
    //       <HistoryLimitAlert onClose={clearHistory} />
    //     </div>
    //   )}

    //   {messages.length === 0 && <EmptyState />}

    //   <div
    //     ref={scrollRef}
    //     className="flex-1 overflow-y-auto p-6 lg:px-56"
    //   >
    //     <div className="flex flex-col gap-4">
    //       {isClient && messages.map((msg, index) => (
    //         <div
    //           key={index}
    //           className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    //         >
    //           {msg.role !== 'user' && (
    //             <div className="w-8 h-8 rounded-full flex items-center justify-center">
    //               <Sparkles className="w-5 h-5 text-blue-600" />
    //             </div>
    //           )}
    //           <div
    //             className={`max-w-[70%] p-4 rounded-lg ${msg.role === 'user'
    //               ? 'bg-gray-300 text-gray-800'
    //               : 'bg-gray-100 text-gray-800'
    //               }`}
    //           >
    //             <div className="prose prose-sm max-w-none dark:prose-invert">
    //               <ReactMarkdown
    //                 components={{
    //                   h1: ({ children }) => (
    //                     <h1 className="text-xl font-bold mb-2">{children}</h1>
    //                   ),
    //                   h2: ({ children }) => (
    //                     <h2 className="text-lg font-semibold mb-2">{children}</h2>
    //                   ),
    //                   ul: ({ children }) => (
    //                     <ul className="list-disc pl-4 mb-2">{children}</ul>
    //                   ),
    //                   ol: ({ children }) => (
    //                     <ol className="list-decimal pl-4 mb-2">{children}</ol>
    //                   ),
    //                   blockquote: ({ children }) => (
    //                     <blockquote className="border-l-4 border-gray-300 pl-4 italic">
    //                       {children}
    //                     </blockquote>
    //                   ),
    //                 }}
    //               >
    //                 {msg.content}
    //               </ReactMarkdown>
    //             </div>
    //           </div>
    //         </div>
    //       ))}

    //       {/* Streaming indicator */}
    //       {isLoading && (
    //         <div className="flex items-start gap-3">
    //           <div className="w-8 h-8 rounded-full flex items-center justify-center">
    //             <Sparkles className="w-5 h-5 text-blue-600" />
    //           </div>
    //           <div className="max-w-[70%] p-4  ">
    //             <StreamingDots />
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   </div>

    //   <ChatInput
    //     input={input}
    //     handleInputChange={handleInputChange}
    //     handleSubmit={handleSubmit}
    //     isLoading={isLoading}
    //   />
    // </div>
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader onClose={clearHistory}/>
        {showHistoryAlert && (
          <div className="p-4">
            <HistoryLimitAlert onClose={clearHistory} />
          </div>
        )}
        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              message={message}
              isLoading={isLoading && messages.length - 1 === index}
            />
          ))}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === 'user' && (
              <ThinkingMessage />
            )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>
        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
          />
        </form>
      </div>
    </>
  );
}