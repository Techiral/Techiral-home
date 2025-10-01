import React, { useState, useEffect } from 'react';
import { useVideoData } from '../hooks/useVideoData';
import type { Video } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import FAQ from '../components/FAQ';
import Chatbot from '../components/Chatbot';

const VideoDetailPage: React.FC<{ videoId: string }> = ({ videoId }) => {
    const { videos } = useVideoData();
    const [video, setVideo] = useState<Video | null>(null);
    const [activeTab, setActiveTab] = useState<'faq' | 'transcript' | 'chat'>('faq');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const videoData = videos.find(v => v.id === videoId);
        if (videoData) {
            setVideo(videoData);
        } else {
            setError('Video not found. It may have been deleted.');
        }
    }, [videoId, videos]);

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
                                <FAQ faqs={video?.faqs || []} />
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