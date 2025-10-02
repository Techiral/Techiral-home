import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { useVideoData } from '../hooks/useVideoData';
import type { Video } from '../types';
import Seo from '../components/Seo';

const VideoCard: React.FC<{ video: Video }> = ({ video }) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/0.jpg`;
  return (
    // Use Link instead of anchor tag
    <Link 
      to={`/videos/${video.id}`} 
      className="group block p-6 bg-gray-50 hover:bg-white border border-gray-200 hover:shadow-md rounded-lg transition-all duration-300"
    >
      <div className="flex items-start space-x-4">
        <img src={thumbnailUrl} alt={video.title} className="w-32 h-20 object-cover rounded" />
        <div>
            <h3 className="font-montserrat text-xl font-black text-black mb-2 group-hover:text-gray-600">{video.title}</h3>
            <p className="font-roboto text-gray-700 text-sm overflow-hidden line-clamp-2">{video.description}</p>
        </div>
      </div>
    </Link>
  );
};

const VideosPage: React.FC = () => {
    const { videos } = useVideoData();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVideos = useMemo(() => {
        if (!searchTerm) return videos;
        return videos.filter(video => 
            video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            video.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [videos, searchTerm]);

  return (
    <>
        <Seo 
            title="Content Library - Techiral"
            description="A collection of tutorials, deep dives, and explorations. Each video is enhanced with AI-powered Q&A to help you learn faster."
        />
        <section id="videos" className="bg-white text-black py-20 md:py-24 px-6 min-h-screen">
        <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h1 className="font-montserrat text-4xl md:text-5xl font-black mb-4">Content Library.</h1>
                <p className="font-roboto text-lg text-gray-700 mb-8">
                    A collection of tutorials, deep dives, and explorations. Each video is enhanced with AI-powered Q&A to help you learn faster.
                </p>
                <input 
                    type="text"
                    placeholder="Search videos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg mx-auto p-3 border-2 border-black rounded-full font-roboto focus:outline-none focus:ring-2 focus:ring-black"
                />
            </div>
            <div className="max-w-4xl mx-auto space-y-4">
            {filteredVideos.length > 0 ? (
                filteredVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
                ))
            ) : (
                <div className="text-center py-16">
                    <p className="font-roboto text-gray-600">No videos found. Try a different search term or add a video in the admin panel.</p>
                </div>
            )}
            </div>
        </div>
        </section>
    </>
  );
};

export default VideosPage;
