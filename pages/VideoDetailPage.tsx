import React from 'react';
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
  const { videos, loading } = useVideoData();
  const currentVideo = videos.find(v => v.id === id);

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
    description: currentVideo.description,
    thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    uploadDate: currentVideo.created_at,
    contentUrl: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube.com/embed/${id}`,
  };

  return (
    <>
      <Seo
        title={currentVideo.metaTitle || `${currentVideo.title} - Techiral`}
        description={currentVideo.metaDescription || currentVideo.description}
        jsonLd={jsonLd}
      />
      <div className="bg-white text-black min-h-screen font-roboto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-8">
            <div className="lg:col-span-2">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <iframe
                  className="w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${id}`}
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="space-y-12">
                <div>
                  <h1 className="font-montserrat text-4xl font-black text-gray-900 mb-4">{currentVideo.title}</h1>
                  <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: currentVideo.description }} />
                </div>
                {currentVideo.keyMoments && currentVideo.keyMoments.length > 0 && (
                    <KeyMoments moments={currentVideo.keyMoments} />
                )}
                 {currentVideo.faqs && currentVideo.faqs.length > 0 && (
                    <ContentInsights insights={currentVideo.faqs} />
                )}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Chatbot videoId={id!} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoDetailPage;
