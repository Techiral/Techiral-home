import React from 'react';
import { useParams } from 'react-router-dom';
import { useVideoData } from '../hooks/useVideoData';
import Chatbot from '../components/Chatbot';
import KeyMoments from '../components/KeyMoments';
import ContentInsights from '../components/ContentInsights'; // This component will receive faqs
import LoadingSpinner from '../components/LoadingSpinner';
import Seo from '../components/Seo';
import type { Video } from '../types'; // Import the Video type

const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // The 'videos' array from this hook contains all the data we need.
  const { videos, loading } = useVideoData();

  // Find the specific video from the array.
  const currentVideo = videos.find(v => v.id === id);

  // Show a loading spinner while the videos are being fetched.
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  // If the video is not found after loading, show an error message.
  if (!currentVideo) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Video not found.</div>;
  }

  // The 'faqs' from the video data will be used as 'insights'.
  const insights = currentVideo.faqs;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: currentVideo.title,
    description: currentVideo.description,
    thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    uploadDate: currentVideo.created_at, // Use the created_at field
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
      <div className="bg-white text-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <iframe
                  className="w-full h-full rounded-lg shadow-xl"
                  src={`https://www.youtube.com/embed/${id}`}
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mb-8">
                <h1 className="font-montserrat text-3xl sm:text-4xl font-black text-gray-900 mb-3">{currentVideo.title}</h1>
                <p className="font-roboto text-gray-600 text-base">{currentVideo.description}</p>
              </div>
              {/* Use the keyMoments from the Supabase data */}
              {currentVideo.keyMoments && <KeyMoments moments={currentVideo.keyMoments} />}
            </div>
            <div className="lg:col-span-1 space-y-8">
              {/* Use the faqs from the Supabase data as insights */}
              {insights && <ContentInsights insights={insights} />}
              <Chatbot videoId={id!} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoDetailPage;
