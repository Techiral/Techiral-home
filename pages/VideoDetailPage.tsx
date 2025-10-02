import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVideoData } from '../hooks/useVideoData';
import Chatbot from '../components/Chatbot';
import KeyMoments from '../components/KeyMoments';
import ContentInsights from '../components/ContentInsights';
import LoadingSpinner from '../components/LoadingSpinner';
import Seo from '../components/Seo';

const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { videos, loading } = useVideoData();
  const [video, setVideo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchVideoDetails = async () => {
        try {
          const response = await fetch(`/api/proxy?endpoint=videos/${id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch video details: ${response.statusText}`);
          }
          const data = await response.json();
          setVideo(data);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          }
        }
      };
      fetchVideoDetails();
    }
  }, [id]);

  const currentVideo = videos.find(v => v.id === id);

  if (loading || !video || !currentVideo) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: currentVideo.title,
    description: currentVideo.description,
    thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    contentUrl: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube.com/embed/${id}`,
  };

  return (
    <>
      <Seo 
        title={`${currentVideo.title} - Techiral`}
        description={currentVideo.description}
        jsonLd={jsonLd}
      />
      <div className="bg-white text-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <iframe 
                  className="w-full h-full rounded-lg shadow-xl"
                  src={`https://www.youtube.com/embed/${id}`}
                  title={currentVideo?.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mb-8">
                <h1 className="font-montserrat text-3xl sm:text-4xl font-black text-gray-900 mb-3">{currentVideo?.title}</h1>
                <p className="font-roboto text-gray-600 text-base">{currentVideo?.description}</p>
              </div>
              {video.keyMoments && <KeyMoments moments={video.keyMoments} />}
            </div>
            <div className="lg:col-span-1 space-y-8">
              {video.insights && <ContentInsights insights={video.insights} />}
              <Chatbot videoId={id!} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoDetailPage;
