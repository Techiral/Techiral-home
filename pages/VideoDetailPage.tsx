import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useVideoData } from '../hooks/useVideoData';
import type { Video, FAQItem } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import FAQ from '../components/FAQ';
import Chatbot from '../components/Chatbot';

// Initialize the Gemini AI model
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VideoDetailPage: React.FC<{ videoId: string }> = ({ videoId }) => {
    const { videos } = useVideoData();
    const [video, setVideo] = useState<Video | null>(null);
    const [activeTab, setActiveTab] = useState<'faq' | 'transcript' | 'chat'>('faq');
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [isLoadingFaqs, setIsLoadingFaqs] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const videoData = videos.find(v => v.id === videoId);

    const generateFaqs = useCallback(async (title: string, transcript: string) => {
        setIsLoadingFaqs(true);
        setError(null);
        try {
            const prompt = `Based on the transcript of the YouTube video titled "${title}", generate a list of 3-5 frequently asked questions (FAQs) that the video answers. The questions should be concise and relevant to the video's main topics. The answers should be clear summaries derived directly from the transcript content.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `${prompt}\n\nTranscript:\n${transcript}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            faqs: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        question: { type: Type.STRING },
                                        answer: { type: Type.STRING },
                                    },
                                    required: ['question', 'answer'],
                                },
                            },
                        },
                        required: ['faqs'],
                    },
                },
            });

            const json = JSON.parse(response.text);
            setFaqs(json.faqs || []);
        } catch (e) {
            console.error("Error generating FAQs:", e);
            setError("Sorry, the AI couldn't generate FAQs for this video. Please check the transcript tab.");
        } finally {
            setIsLoadingFaqs(false);
        }
    }, []);

    useEffect(() => {
        // Find the video data from our dynamic hook based on the ID from the URL
        if (videoData) {
            setVideo(videoData);
            generateFaqs(videoData.title, videoData.transcript);
        } else {
            // Only set error if videos have loaded and we still can't find the video.
            if (videos.length > 0) {
                setError('Video not found. It may have been deleted.');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videos.length, generateFaqs, JSON.stringify(videoData)]);
    
    const TabButton: React.FC<{tabName: 'faq' | 'transcript' | 'chat', children: React.ReactNode}> = ({ tabName, children }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`py-2 px-4 font-roboto font-bold rounded-t-lg transition-colors duration-300 ${
                activeTab === tabName
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
        >
            {children}
        </button>
    );

    if (!video && !error) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold p-8">{error}</div>;

    return (
        <div className="bg-white text-black py-16 md:py-24 px-6">
            <div className="container mx-auto">
                <div className="text-center mb-8">
                     <h1 className="font-montserrat text-3xl md:text-5xl font-black">{video?.title}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2">
                         {/* YouTube Player */}
                        <div className="aspect-w-16 aspect-h-9 mb-6 shadow-2xl rounded-lg overflow-hidden">
                            <iframe
                                src={`https://www.youtube.com/embed/${video?.id}`}
                                title={video?.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                        <h2 className="font-montserrat text-2xl font-black mb-3">About this video</h2>
                        <p className="font-roboto text-gray-700 leading-relaxed">{video?.description}</p>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="flex border-b-2 border-black">
                           <TabButton tabName="faq">AI-Generated FAQ</TabButton>
                           <TabButton tabName="transcript">Transcript</TabButton>
                           <TabButton tabName="chat">Chat</TabButton>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-b-lg h-[60vh] overflow-y-auto">
                            {activeTab === 'faq' && (
                                isLoadingFaqs ? <LoadingSpinner /> : (error ? <p className="text-red-500">{error}</p> : <FAQ faqs={faqs} />)
                            )}
                            {activeTab === 'transcript' && (
                                <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                    {video?.transcript}
                                </div>
                            )}
                            {activeTab === 'chat' && <Chatbot video={video} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoDetailPage;