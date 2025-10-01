import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVideoData } from '../hooks/useVideoData';
import type { Video, FAQItem } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import FAQ from '../components/FAQ';
import Chatbot from '../components/Chatbot';
import KeyMoments from '../components/KeyMoments';

const VideoDetailPage: React.FC<{ videoId: string }> = ({ videoId }) => {
    const { videos, updateVideo } = useVideoData();
    const [video, setVideo] = useState<Video | null>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'moments' | 'transcript' | 'chat'>('summary');
    const [isGeneratingMoreFaqs, setIsGeneratingMoreFaqs] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const playerRef = useRef<any>(null);
    
    // Find video data from the hook's state
    const videoDataFromHook = videos.find(v => v.id === videoId);

    useEffect(() => {
        if (videoDataFromHook) {
             // Deep comparison to prevent re-renders if the object reference changes but content is the same
            if (JSON.stringify(videoDataFromHook) !== JSON.stringify(video)) {
                setVideo(videoDataFromHook);
            }
        } else {
            // Set error only after videos have been loaded and the video is still not found
            if (videos.length > 0) {
                setError('Video not found. It may have been deleted.');
            }
        }
    }, [videos, videoId, videoDataFromHook, video]);


    useEffect(() => {
        const originalTitle = document.title;
        let metaDescriptionTag = document.querySelector('meta[name="description"]');
        const originalDescriptionContent = metaDescriptionTag ? metaDescriptionTag.getAttribute('content') : null;
        
        if (video) {
            if (video.metaTitle) {
                document.title = video.metaTitle;
            }
            if (video.metaDescription) {
                if (!metaDescriptionTag) {
                    metaDescriptionTag = document.createElement('meta');
                    metaDescriptionTag.setAttribute('name', 'description');
                    document.head.appendChild(metaDescriptionTag);
                }
                metaDescriptionTag.setAttribute('content', video.metaDescription);
            }
        }

        return () => {
            document.title = originalTitle;
            if (metaDescriptionTag) {
                if (originalDescriptionContent) {
                    metaDescriptionTag.setAttribute('content', originalDescriptionContent);
                } else {
                    // If the tag didn't exist originally, remove it on cleanup
                    metaDescriptionTag.remove();
                }
            }
        };
    }, [video]);


    const handleGenerateMoreFaqs = async () => {
        if (!video) return;
        setIsGeneratingMoreFaqs(true);
        setError(null);

        const existingQuestions = (video.faqs || []).map(faq => `- ${faq.question}`).join('\n');

        try {
             const prompt = `You are an expert AI assistant for the YouTube channel 'Techiral'. Your task is to generate 3 new and insightful FAQs based on the provided video transcript.

These questions must be substantively different from the existing ones provided below. The goal is to anticipate further, more nuanced questions a viewer might have. Your knowledge is strictly limited to the video transcript. Answers should be practical, detailed, and directly cite information from the video.

Video Title: "${video.title}"

Existing Questions (Do NOT repeat these):
${existingQuestions}

Transcript:
---
${video.transcript}
---

Generate exactly 3 new, unique FAQs. Return ONLY a single, valid JSON array of objects, where each object has "question" and "answer" string keys. Do not include any introductory text, notes, or markdown formatting. The output must be a raw JSON array.`;
            
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
                        { role: 'user', content: prompt }
                    ]
                })
            });

            if (!response.ok) throw new Error('Failed to generate more FAQs.');

            const data = await response.json();
            const jsonContent = data.choices[0].message.content;

            const extractJsonArrayString = (str: string): string | null => {
                const match = str.match(/\[[\s\S]*\]/);
                return match ? match[0] : null;
            };
            
            const extractedJsonStr = extractJsonArrayString(jsonContent);
            if (!extractedJsonStr) throw new Error('Invalid JSON response for new FAQs.');

            const newFaqs: FAQItem[] = JSON.parse(extractedJsonStr);

            const existingFaqSet = new Set((video.faqs || []).map(f => f.question));
            const uniqueNewFaqs = newFaqs.filter(faq => !existingFaqSet.has(faq.question));

            if (uniqueNewFaqs.length > 0) {
                const updatedFaqs = [...(video.faqs || []), ...uniqueNewFaqs];
                const updatedVideo = { ...video, faqs: updatedFaqs };
                setVideo(updatedVideo); // Update local state immediately
                updateVideo(video.id, updatedVideo); // Persist to storage
            }

        } catch (e) {
            console.error("Error generating more FAQs:", e);
            setError("Sorry, could not generate more FAQs at this time.");
        } finally {
            setIsGeneratingMoreFaqs(false);
        }
    };

    useEffect(() => {
        if (!videoDataFromHook) return;

        const createPlayer = () => {
            if (document.getElementById('yt-player-container') && !playerRef.current) {
                playerRef.current = new (window as any).YT.Player('yt-player-container', {
                    videoId: videoDataFromHook.id,
                    width: '100%',
                    height: '100%',
                });
            }
        };

        if (!(window as any).YT || !(window as any).YT.Player) {
            (window as any).onYouTubeIframeAPIReady = createPlayer;
            if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                document.body.appendChild(tag);
            }
        } else {
            createPlayer();
        }

        return () => {
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [videoDataFromHook]);

    const handleSeekTo = useCallback((timestamp: string) => {
        if (!playerRef.current || typeof playerRef.current.seekTo !== 'function') return;

        const timeParts = timestamp.replace(/[()]/g, '').split(':');
        let totalSeconds = 0;

        if (timeParts.length === 2) { // MM:SS
            totalSeconds = parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10);
        } else if (timeParts.length === 3) { // HH:MM:SS
            totalSeconds = parseInt(timeParts[0], 10) * 3600 + parseInt(timeParts[1], 10) * 60 + parseInt(timeParts[2], 10);
        } else {
            return;
        }

        if (!isNaN(totalSeconds)) {
            playerRef.current.seekTo(totalSeconds, true);
            if (typeof playerRef.current.playVideo === 'function') {
                playerRef.current.playVideo();
            }
        }
    }, []);

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
    if (error && !video) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold p-8">{error}</div>;
    if (!video) return null; // Should not happen if error handling is correct

    return (
        <div className="bg-white text-black py-16 md:py-24 px-6">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-8">
                     <h1 className="font-montserrat text-3xl md:text-5xl font-black">{video.title}</h1>
                </div>

                <div className="aspect-video mb-8 shadow-2xl rounded-lg overflow-hidden bg-black">
                    <div id="yt-player-container" className="w-full h-full"></div>
                </div>

                <div className="mb-12">
                    <h2 className="font-montserrat text-2xl font-black mb-3">About this video</h2>
                    <p className="font-roboto text-gray-700 leading-relaxed whitespace-pre-wrap">{video.description}</p>
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
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        {activeTab === 'summary' && (
                            <>
                                <FAQ faqs={video.faqs || []} />
                                <div className="text-center mt-6">
                                    <button
                                        onClick={handleGenerateMoreFaqs}
                                        disabled={isGeneratingMoreFaqs}
                                        className="bg-black text-white font-roboto font-bold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    >
                                        {isGeneratingMoreFaqs ? 'Generating...' : 'Generate More FAQs'}
                                    </button>
                                </div>
                            </>
                        )}
                        {activeTab === 'moments' && <KeyMoments moments={video.keyMoments || []} onTimestampClick={handleSeekTo} />}
                        {activeTab === 'transcript' && (
                            <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                                {video.transcript}
                            </div>
                        )}
                        {activeTab === 'chat' && <Chatbot video={video} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoDetailPage;