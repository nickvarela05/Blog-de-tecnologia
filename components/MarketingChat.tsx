import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { createMarketingChat } from '../services/geminiService';
import { ChatMessage, Article } from '../types';
import Icon from './Icon';

interface MarketingChatProps {
  article: Article;
}

const MarketingChat: React.FC<MarketingChatProps> = ({ article }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat when component mounts
    chatRef.current = createMarketingChat(article.title, article.content || '');
    setMessages([
      { sender: 'bot', text: `Olá! Eu sou o GrowthBot, seu especialista em marketing. Analisei o artigo "${article.title}". Como posso ajudar a impulsionar seu alcance hoje?` }
    ]);
  }, [article]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const stream = await chatRef.current.sendMessageStream({ message: input });
        
        let botResponse = '';
        setMessages(prev => [...prev, { sender: 'bot', text: '...' }]);

        for await (const chunk of stream) {
            botResponse += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = botResponse;
                return newMessages;
            });
        }
    } catch (error) {
      const errorMessage = "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.";
      setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = errorMessage;
          return newMessages;
      });
      console.error("Marketing Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700 flex flex-col h-[75vh] mt-6">
      <header className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-t-lg border-b border-gray-300 dark:border-slate-600">
        <Icon type="voice_chat" className="h-6 w-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Consultor de IA para Marketing</h3>
      </header>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center"><Icon type="spark" className="h-5 w-5 text-blue-500" /></div>}
            <div className={`max-w-md px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-blue-700 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start gap-3 items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center"><Icon type="spark" className="h-5 w-5 text-blue-500" /></div>
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200">
                  <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-300 dark:border-slate-600">
        <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                !isLoading && handleSend();
              }
            }}
            placeholder="Pergunte sobre Google Ads, SEO, ideias de conteúdo..."
            className="flex-1 bg-transparent p-3 text-gray-900 dark:text-white focus:outline-none resize-none"
            rows={1}
            style={{ maxHeight: '100px' }}
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading} className="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-500 disabled:text-gray-600">
             <Icon type="send" className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketingChat;