'use client';

import { useChat } from 'ai/react';
import React from 'react';

// Define types for message and tool invocation
interface ToolInvocation {
  toolName: string;
  result?: {
    response: Array<{
      name: string;
    }>;
  };
}

interface MessageType {
  id: string;
  role: string;
  content: string;
  toolInvocations?: ToolInvocation[];
}

// Separate Message Component
const Message: React.FC<{ message: MessageType }> = React.memo(({ message }) => {
  return (
    <div className="whitespace-pre-wrap">
      <div>
        <div className="font-bold">{message.role}</div>
        {message.content.length > 0 ? (
          <p>{message.content}</p>
        ) : (
          <div>
            {message.toolInvocations?.[0]?.result?.response && message.toolInvocations[0].result.response.length > 0 ? (
              // Display only the first result item if available
              <p>{message.toolInvocations[0].result.response[0].name}</p>
            ) : (
              // Display tool invocation message if no results are found
              <p className="italic font-light">
                {'Calling tool: ' + message?.toolInvocations?.[0]?.toolName}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

Message.displayName = "Message";

const Chat: React.FC = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  console.log("display", messages);

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map(m => (
          <Message key={m.id} message={m as MessageType} />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
};

Chat.displayName = "Chat";

export default Chat;
