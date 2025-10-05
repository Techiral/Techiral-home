
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ChatbotProps {
    videoId?: string;
    blogId?: string;
    knowledgeBase?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ videoId, blogId, knowledgeBase }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'meituan/longcat-flash-chat:free',
                    messages: updatedMessages.map(m => ({
                        role: m.role === 'model' ? 'assistant' : m.role,
                        content: m.text
                    })),
                    videoId,
                    blogId,
                    knowledgeBase,
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const modelMessage: ChatMessage = { role: 'model', text: data.choices[0].message.content };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const contentType = videoId ? 'video' : 'blog';

    return (
        <div className="bg-gray-100 rounded-lg flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 font-montserrat">Ask Techiral AI</h2>
                <p className="text-sm text-gray-600 font-roboto">Get instant answers about this {contentType}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                            <div className="text-sm font-roboto whitespace-pre-wrap">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-800 rounded-lg px-4 py-2">
                            <LoadingSpinner small />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Ask anything...`}
                        className="flex-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 font-roboto"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="bg-gray-800 text-white px-4 py-2 rounded-md disabled:bg-gray-400 font-roboto font-bold hover:bg-gray-700 transition-colors"
                        disabled={isLoading || !input.trim()}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot; 
