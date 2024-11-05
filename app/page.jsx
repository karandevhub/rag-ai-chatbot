'use client';

import { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Error:', error);
      alert('An error occurred while getting the response.');
    },
    maxSteps:3
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          backgroundColor: '#333',
          color: '#fff',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <h2 style={{ marginLeft: '1rem', fontSize: '1.25rem', fontWeight: 500 }}>Chat</h2>
      </div>

      {/* Chat Messages */}
      <ScrollArea
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'start',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  backgroundColor:
                    msg.role === 'user' ? '#333' : '#f3f3f3',
                  color: msg.role === 'user' ? '#fff' : '#333'
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div
        style={{
          backgroundColor: '#f3f3f3',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={handleInputChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          style={{
            flex: 1,
            marginRight: '1rem'
          }}
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    backgroundColor: '#333',
                    borderRadius: '50%',
                    margin: '0 0.25rem',
                    animation: 'pulse 1s infinite ease-in-out'
                  }}
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