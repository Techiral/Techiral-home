import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ChatbotProps {
    title: string;
    content: string;
    contentType: 'video' | 'article';
}

const Chatbot: React.FC<ChatbotProps> = ({ title, content, contentType }) => {
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
            const contentSource = contentType === 'video' ? 'transcript' : 'article content';
            const systemInstruction = `You are "Techiral AI," an expert assistant for the YouTube channel "Techiral." You are answering questions about a specific ${contentType}. Your tone is friendly, encouraging, and supportive, like a helpful mentor.

Your knowledge is strictly limited to the information provided in the ${contentType}'s ${contentSource} below. Do not use any external knowledge or make assumptions.

- If the answer is in the ${contentSource}, provide a clear and concise explanation.
- When appropriate, use markdown for code snippets (e.g., \`<div>\`) or bullet points to improve readability.
- If the answer cannot be found in the ${contentSource}, you MUST clearly state that the ${contentType} does not cover that topic. For example, say "That's a great question, but the ${contentType} doesn't cover that topic."

${contentType === 'video' ? 'Video' : 'Article'} Title: "${title}"
${contentSource.charAt(0).toUpperCase() + contentSource.slice(1)}:
---
${content}
---`;
            
            const apiMessages = updatedMessages.map(msg => ({
                role: msg.role,
                content: msg.text
            }));

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': `https://techiral.com`, 
                    'X-Title': `Techiral AI`,
                },
                body: JSON.stringify({
                    model: 'x-ai/grok-4-fast:free',
                    messages: [
                        { role: 'system', content: systemInstruction },
                        ...apiMessages
                    ]
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("API Error Response:", errorBody);
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const modelResponseText = data.choices[0].message.content;

            const modelMessage: ChatMessage = { role: 'model', text: modelResponseText };
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
                    placeholder={`Ask about the ${contentType}...`}
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