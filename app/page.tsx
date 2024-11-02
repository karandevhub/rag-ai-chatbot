'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({ 
    maxSteps: 3,
  });
console.log(messages)
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map(m => (
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
}
