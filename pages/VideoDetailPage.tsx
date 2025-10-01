import React, { useState, useEffect, useCallback } from 'react';
import { useVideoData } from '../hooks/useVideoData';
import type { Video, FAQItem, KeyMoment } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import FAQ from '../components/FAQ';
import Chatbot from '../components/Chatbot';
import KeyMoments from '../components/KeyMoments';

const VideoDetailPage: React.FC<{ videoId: string }> = ({ videoId }) => {
    const { videos } = useVideoData();
    const [video, setVideo] = useState<Video | null>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'moments' | 'transcript' | 'chat'>('summary');
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [keyMoments, setKeyMoments] = useState<KeyMoment[]>([]);
    const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const videoData = videos.find(v => v.id === videoId);

    const generateAiInsights = useCallback(async (title: string, transcript: string) => {
        setIsLoadingInsights(true);
        setError(null);
        try {
            const prompt = `Based on the transcript of the YouTube video titled "${title}", perform two tasks:
1. Generate a list of 3-5 frequently asked questions (FAQs) that the video answers. The questions should be concise and relevant. The answers should be clear summaries derived directly from the transcript.
2. Identify key moments from the transcript. Extract the timestamp (e.g., "(0:25)") and provide a brief, one-sentence summary of what is discussed at that point.

Return the result as a single, valid JSON object with two keys: "faqs" and "keyMoments".
- "faqs" should be an array of objects, where each object has "question" and "answer" string keys.
- "keyMoments" should be an array of objects, where each object has "timestamp" and "summary" string keys.`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': `https://techiral.com`, 
                    'X-Title': `Techiral AI`,
                },
                body: JSON.stringify({
                    model: 'x-ai/grok-4-fast:free',
                    messages: [
                        { role: 'user', content: `${prompt}\n\nTranscript:\n${transcript}` }
                    ]
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("API Error Response:", errorBody);
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const jsonContent = data.choices[0].message.content;
            
            const extractJsonString = (str: string): string | null => {
                const match = str.match(/\{[\s\S]*\}/);
                return match ? match[0] : null;
            };

            const extractedJsonStr = extractJsonString(jsonContent);

            if (extractedJsonStr) {
                const json = JSON.parse(extractedJsonStr);
                setFaqs(json.faqs || []);
                setKeyMoments(json.keyMoments || []);
            } else {
                 console.error("Could not extract JSON from AI response:", jsonContent);
                 throw new Error("AI response did not contain valid JSON.");
            }
        } catch (e) {
            console.error("Error generating AI insights:", e);
            setError("Sorry, the AI couldn't generate insights for this video. Please try again later.");
        } finally {
            setIsLoadingInsights(false);
        }
    }, []);

    useEffect(() => {
        if (videoData) {
            setVideo(videoData);
            generateAiInsights(videoData.title, videoData.transcript);
        } else {
            if (videos.length > 0) {
                setError('Video not found. It may have been deleted.');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videos.length > 0, generateAiInsights, JSON.stringify(videoData)]);
    
    const TabButton: React.FC<{tabName: 'summary' | 'moments' | 'transcript' | 'chat', children: React.ReactNode}> = ({ tabName, children }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`py-3 px-6 font-roboto font-bold text-sm md:text-base transition-colors duration-300 border-b-4 ${
                activeTab === tabName
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
            }`}
        >
            {children}
        </button>
    );

    if (!video && !error) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold p-8">{error}</div>;

    return (
        <div className="bg-white text-black py-16 md:py-24 px-6">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-8">
                     <h1 className="font-montserrat text-3xl md:text-5xl font-black">{video?.title}</h1>
                </div>

                <div className="aspect-w-16 aspect-h-9 mb-8 shadow-2xl rounded-lg overflow-hidden">
                    <iframe
                        src={`https://www.youtube.com/embed/${video?.id}`}
                        title={video?.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>

                <div className="mb-12">
                    <h2 className="font-montserrat text-2xl font-black mb-3">About this video</h2>
                    <p className="font-roboto text-gray-700 leading-relaxed">{video?.description}</p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center mb-12">
                    <h3 className="font-montserrat text-2xl font-black mb-4">Ready for the Next Step?</h3>
                    <p className="font-roboto text-gray-700 mb-6 max-w-2xl mx-auto">
                        If you found this helpful, join our community of creators and developers to keep the conversation going.
                    </p>
                    <a href="#connect" className="bg-black text-white font-roboto font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 inline-block">
                        Join The Community
                    </a>
                </div>

                <div>
                    <div className="flex justify-center border-b-2 border-gray-200 mb-6">
                       <TabButton tabName="summary">AI Summary</TabButton>
                       <TabButton tabName="moments">Key Moments</TabButton>
                       <TabButton tabName="transcript">Transcript</TabButton>
                       <TabButton tabName="chat">Chat</TabButton>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg min-h-[400px]">
                        {isLoadingInsights ? <LoadingSpinner /> : (
                            <>
                                {error && <p className="text-red-500">{error}</p>}
                                {activeTab === 'summary' && <FAQ faqs={faqs} />}
                                {activeTab === 'moments' && <KeyMoments moments={keyMoments} />}
                                {activeTab === 'transcript' && (
                                    <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                                        {video?.transcript}
                                    </div>
                                )}
                                {activeTab === 'chat' && <Chatbot video={video} />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoDetailPage;