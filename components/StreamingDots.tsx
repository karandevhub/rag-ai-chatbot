const StreamingDots = () => (
    <div className="flex items-center gap-1 h-6">
      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          25%, 90% { opacity: 1; }
        }
        .thinking-dot {
          animation: fadeInOut 2s infinite;
        }
      `}</style>
      <div 
        className="w-1 h-1 bg-blue-600 rounded-full thinking-dot" 
        style={{ animationDelay: '0s' }}
      ></div>
      <div 
        className="w-1 h-1 bg-blue-600 rounded-full thinking-dot" 
        style={{ animationDelay: '0.5s' }}
      ></div>
      <div 
        className="w-1 h-1 bg-blue-600 rounded-full thinking-dot" 
        style={{ animationDelay: '1s' }}
      ></div>
      <div 
        className="w-1 h-1 bg-blue-600 rounded-full thinking-dot" 
        style={{ animationDelay: '1.5s' }}
      ></div>
    </div>
  );
  
  export default StreamingDots;