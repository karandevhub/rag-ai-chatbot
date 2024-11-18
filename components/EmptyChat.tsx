'use client';

import React from 'react';
import { FileText, MessageCircle, Info, Upload } from 'lucide-react';

const EmptyState = () => {
  const features = [
    {
      icon: <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />,
      text: "Ask questions about specific sections, request summaries, or get clarification on any topic from your document"
    },
    {
      icon: <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />,
      text: "Your questions will be answered based on the content of your uploaded PDF. I&apos;ll provide relevant information and cite specific sections when possible"
    },
    {
      icon: <Upload className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />,
      text: "Simply upload your PDF document using the button above to get started with your analysis"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center px-4">
      <div className="bg-gray-50 rounded-lg p-8 w-full shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Welcome to PDF Chat Assistant
        </h2>

        <p className="text-gray-600 mb-8">
          I can help you analyze and discuss the content from your uploaded PDF document. 
          Ask me anything about the material!
        </p>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200"
            >
              <div className="flex items-start gap-3">
                {feature.icon}
                <p className="text-gray-600 text-sm text-left">
                  {feature.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;