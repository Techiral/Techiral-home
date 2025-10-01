import React, { useState, useRef, useEffect } from 'react';
import type { Video, ChatMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';

const Chatbot: React.FC<{ video: Video | null }> = ({ video }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: `Hi! I'm an AI assistant. Ask me anything about "${video?.title}"!` }
    ]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !video) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const apiResponse = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'chat',
                    payload: {
                        title: video.title,
                        transcript: video.transcript,
                        message: input,
                    }
                })
            });

            if (!apiResponse.ok) {
                throw new Error(`API Error: ${apiResponse.statusText}`);
            }

            const data = await apiResponse.json();
            const modelMessage: ChatMessage = { role: 'model', text: data.text };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting to my brain right now. Please try again in a moment." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-sm lg:max-w-md rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="bg-gray-200 text-black rounded-lg px-4 py-2">
                                <LoadingSpinner small />
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
             <form onSubmit={handleSendMessage} className="mt-4 flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about the video..."
                    className="flex-1 p-2 border-2 border-black rounded-l-md focus:outline-none focus:ring-2 focus:ring-black font-roboto"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-r-md disabled:bg-gray-500 font-roboto font-bold"
                    disabled={isLoading || !input.trim()}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chatbot;