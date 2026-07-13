'use client';

import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply || 'No response received.',
        },
      ]);
    } catch (error) {
      console.error('Error talking to Gemini:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 justify-between font-sans">
      <div className="flex-1 overflow-y-auto space-y-4 p-6 min-h-[70vh] border rounded-xl bg-slate-50 shadow-inner">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <h2 className="text-2xl font-bold text-slate-800">Gemini AI Assistant</h2>
            <p className="text-sm mt-2">Ask me anything to test your new zero-cost AI architecture!</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border rounded-bl-none'}`}>
              <span className="font-bold block mb-1 text-xs opacity-70 uppercase tracking-wider">
                {m.role === 'user' ? 'You' : 'Gemini'}
              </span>
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-2xl rounded-bl-none p-4 shadow-sm text-gray-400 text-sm animate-pulse">
              Gemini is thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3 pb-4">
        <input
          className="flex-1 border-2 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
          value={input}
          placeholder="Message Gemini..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}