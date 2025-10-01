import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    const [formattedDescription, setFormattedDescription] = useState<string>('');
    const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const playerRef = useRef<any>(null);
    const videoData = videos.find(v => v.id === videoId);

    const generateAiInsights = useCallback(async (title: string, description: string, transcript: string) => {
        setIsLoadingInsights(true);
        setError(null);
        setFormattedDescription('');
        try {
            const prompt = `Based on the provided title, description, and transcript of a YouTube video, perform three tasks:

1.  **Generate Detailed FAQs:** Create a list of 3-5 frequently asked questions (FAQs) based on the video's content. For each question, provide a detailed and comprehensive answer, drawing specific examples or steps directly from the transcript to ensure the answer is thorough and easy to understand.

2.  **Identify Key Moments:** Identify key moments from the transcript. Extract the timestamp (e.g., "(0:25)") and provide a brief, one-sentence summary of what is discussed at that point.

3.  **Format Video Description:** Create a clean, well-formatted "About this video" summary from the original video description. Remove all promotional links, social media handles, timestamps, and irrelevant marketing text. Structure the summary into clear, readable paragraphs.

Return the result as a single, valid JSON object with three keys: "faqs", "keyMoments", and "description".
-   "faqs" should be an array of objects, where each object has "question" and "answer" string keys.
-   "keyMoments" should be an array of objects, where each object has "timestamp" and "summary" string keys.
-   "description" should be a single string containing the newly formatted, clean description.

Video Title: "${title}"

Original Description:
---
${description}
---

Transcript:
---
${transcript}
---
`;

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
                setFormattedDescription(json.description || '');
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
            // Don't call generate insights if we already have them for this video
            if (videoData.id !== video?.id) {
                generateAiInsights(videoData.title, videoData.description, videoData.transcript);
            }
        } else {
            if (videos.length > 0) {
                setError('Video not found. It may have been deleted.');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videos.length, videoId, video?.id, generateAiInsights, JSON.stringify(videoData)]);

    useEffect(() => {
        if (!videoData) return;

        const createPlayer = () => {
            if (document.getElementById('yt-player-container') && !playerRef.current) {
                playerRef.current = new (window as any).YT.Player('yt-player-container', {
                    videoId: videoData.id,
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
    }, [videoData]);

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
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold p-8">{error}</div>;

    return (
        <div className="bg-white text-black py-16 md:py-24 px-6">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-8">
                     <h1 className="font-montserrat text-3xl md:text-5xl font-black">{video?.title}</h1>
                </div>

                <div className="aspect-video mb-8 shadow-2xl rounded-lg overflow-hidden bg-black">
                    <div id="yt-player-container" className="w-full h-full"></div>
                </div>

                <div className="mb-12">
                    <h2 className="font-montserrat text-2xl font-black mb-3">About this video</h2>
                    {isLoadingInsights ? (
                         <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </div>
                    ) : (
                        <p className="font-roboto text-gray-700 leading-relaxed whitespace-pre-wrap">{formattedDescription || video?.description}</p>
                    )}
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
                                {activeTab === 'moments' && <KeyMoments moments={keyMoments} onTimestampClick={handleSeekTo} />}
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