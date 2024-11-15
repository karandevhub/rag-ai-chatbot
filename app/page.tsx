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
        <form className="realtive flex mx-auto bg-background md:pb-6 gap-2 w-full md:max-w-3xl">
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