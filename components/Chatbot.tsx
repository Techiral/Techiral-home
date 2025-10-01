import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Video, ChatMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const Chatbot: React.FC<{ video: Video | null }> = ({ video }) => {
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
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const systemInstruction = `You are an expert AI assistant for the YouTube channel "Techiral". You are answering questions about a specific video. Your knowledge is strictly limited to the information provided in the video's transcript. Do not use any external knowledge. If the answer cannot be found in the transcript, clearly state that the video does not cover that topic. Be friendly, concise, and helpful.

Here is the transcript for the video titled "${video?.title}":
---
${video?.transcript}
---`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `${systemInstruction}\n\nUser question: ${input}`,
            });

            const modelMessage: ChatMessage = { role: 'model', text: response.text };
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
