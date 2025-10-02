import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useVideoData } from '../hooks/useVideoData';
import Chatbot from '../components/Chatbot';
import KeyMoments from '../components/KeyMoments';
import ContentInsights from '../components/ContentInsights';
import LoadingSpinner from '../components/LoadingSpinner';
import Seo from '../components/Seo';
import type { Video } from '../types';

const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchVideoById, loading } = useVideoData();
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (id) {
      const loadVideo = async () => {
        const video = await fetchVideoById(id);
        setCurrentVideo(video);
      };
      loadVideo();
    }
  }, [id, fetchVideoById]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!currentVideo) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Video not found.</div>;
  }

  const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: currentVideo.title,
      description: currentVideo.metaDescription || (Array.isArray(currentVideo.description) ? currentVideo.description.join(' ') : currentVideo.description),
      thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      uploadDate: currentVideo.created_at,
      contentUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube.com/embed/${id}`,
    };
    
    const createMarkup = (htmlContent: string | undefined) => {
      return { __html: htmlContent || '' };
    };

  return (
    <>
      <Seo
        title={currentVideo.metaTitle || `${currentVideo.title} - Techiral`}
        description={currentVideo.metaDescription || (Array.isArray(currentVideo.description) ? currentVideo.description.join(' ') : currentVideo.description)}
        jsonLd={jsonLd}
      />
      <div className="bg-white text-black min-h-screen font-sans">
        <div className="max-w-4xl mx-auto px-4 py-12">
            
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center">{currentVideo.title}</h1>

          <div className="aspect-w-16 aspect-h-9 mb-8 shadow-lg rounded-lg overflow-hidden">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${id}`}
              title={currentVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">About this video</h2>
            <div className="prose prose-lg max-w-none text-gray-600" dangerouslySetInnerHTML={createMarkup(Array.isArray(currentVideo.description) ? currentVideo.description.join(' ') : currentVideo.description)} />
          </div>

          <div className="bg-gray-50 rounded-lg p-8 text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready for the Next Step?</h3>
            <p className="text-gray-600 mb-6">If you found this helpful, join our community of creators and developers to keep the conversation going.</p>
            <a href="#" className="bg-black text-white font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors">Join The Community</a>
          </div>

          <div>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('summary')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'summary' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>AI Summary</button>
                    <button onClick={() => setActiveTab('moments')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'moments' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Key Moments</button>
                    <button onClick={() => setActiveTab('transcript')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'transcript' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Transcript</button>
                    <button onClick={() => setActiveTab('chat')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'chat' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Chat</button>
                </nav>
            </div>

            <div className="py-8">
                {activeTab === 'summary' && currentVideo.faqs && <ContentInsights insights={currentVideo.faqs} />}
                {activeTab === 'moments' && currentVideo.keyMoments && <KeyMoments moments={currentVideo.keyMoments} />}
                {activeTab === 'transcript' && <div className="prose prose-lg max-w-none text-gray-600" dangerouslySetInnerHTML={createMarkup(currentVideo.transcript)} />}
                {activeTab === 'chat' && <Chatbot videoId={id!} />}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default VideoDetailPage;
