import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { createChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import Icon from './Icon';

interface ChatbotProps {
  hasUnreadBotMessage: boolean;
  setHasUnreadBotMessage: (hasUnread: boolean) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ hasUnreadBotMessage, setHasUnreadBotMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: "Olá! Como posso ajudar com tecnologia, ciência ou negócios hoje?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      chatRef.current = createChat();
    }
  }, [isOpen]);
  
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
        if (!isOpenRef.current) {
            setHasUnreadBotMessage(true);
        }

    } catch (error) {
      const errorMessage = "Desculpe, não consegui obter uma resposta. Por favor, tente novamente.";
      setMessages(prev => [...prev, { sender: 'bot', text: errorMessage }]);
      console.error("Chatbot error:", error);
      if (!isOpenRef.current) {
        setHasUnreadBotMessage(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
            const nextIsOpen = !isOpen;
            setIsOpen(nextIsOpen);
            if (nextIsOpen) { // if we are opening it
                setHasUnreadBotMessage(false);
            }
        }}
        className="fixed bottom-5 right-5 bg-blue-700 text-white p-4 rounded-full shadow-lg hover:bg-blue-800 transition-transform hover:scale-110 focus:outline-none z-50"
        aria-label="Toggle Chatbot"
      >
        <Icon type="chat" className="h-8 w-8" />
        {hasUnreadBotMessage && !isOpen && (
            <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-blue-700"></span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-5 w-full max-w-sm h-[60vh] bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-300 dark:border-slate-700 flex flex-col z-50 animate-slide-in-right">
          <header className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-t-lg border-b border-gray-300 dark:border-slate-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">InnovateFlow AI</h3>
             <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                <Icon type="close" className="h-6 w-6" />
            </button>
          </header>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
                 <div className="flex justify-start">
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
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder="Pergunte-me qualquer coisa..."
                className="flex-1 bg-transparent p-3 text-gray-900 dark:text-white focus:outline-none"
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading} className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:text-gray-600">
                 <Icon type="send" className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;