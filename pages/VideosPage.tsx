
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVideoData } from '../hooks/useVideoData';
import type { Video } from '../types';
import Seo from '../components/Seo';

const VideoCard: React.FC<{ video: Video }> = ({ video }) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
  const descriptionText = Array.isArray(video.description) ? video.description.join(' ') : video.description;

  const cardStyle: React.CSSProperties = {
    display: 'block',
    padding: '24px',
    backgroundColor: 'white',
    border: '1px solid black',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    color: 'black'
  };

  return (
    <Link 
      to={`/videos/${video.id}`} 
      style={cardStyle}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <img src={thumbnailUrl} alt={video.title} style={{ width: '192px', borderRadius: '0.25rem', objectFit: 'cover', aspectRatio: '16/9' }} />
        <div>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: 'black', marginBottom: '8px' }}>{video.title}</h3>
            <p style={{ fontFamily: 'Roboto, sans-serif', color: 'black', fontSize: '0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{descriptionText}</p>
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
        return videos.filter(video => {
            const descriptionText = Array.isArray(video.description) ? video.description.join(' ') : video.description;
            return video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   descriptionText.toLowerCase().includes(searchTerm.toLowerCase())
        });
    }, [videos, searchTerm]);

  return (
    <>
        <Seo 
            title="Content Library - Techiral"
            description="A collection of tutorials, deep dives, and explorations. Each video is enhanced with AI-powered Q&A to help you learn faster."
        />
        <style>
            {`
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Roboto&display=swap');
            input:focus { outline: none; box-shadow: 0 0 0 2px black; }
            `}
        </style>
        <section style={{ backgroundColor: 'white', color: 'black', padding: '80px 24px', minHeight: '100vh', fontFamily: 'Roboto, sans-serif' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', maxWidth: '768px', margin: '0 auto 48px' }}>
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '3rem', marginBottom: '16px', color: 'black' }}>Content Library.</h1>
                <p style={{ fontSize: '1.125rem', color: 'black', marginBottom: '32px' }}>
                    A collection of tutorials, deep dives, and explorations. Each video is enhanced with AI-powered Q&A to help you learn faster.
                </p>
                <input 
                    type="text"
                    placeholder="Search videos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', maxWidth: '512px', margin: '0 auto', padding: '12px', border: '2px solid black', borderRadius: '9999px', fontFamily: 'Roboto, sans-serif' }}
                />
            </div>
            <div style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredVideos.length > 0 ? (
                filteredVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
                ))
            ) : (
                <div style={{ textAlign: 'center', padding: '64px 0' }}>
                    <p style={{ fontFamily: 'Roboto, sans-serif', color: 'black' }}>No videos found. Try a different search term or add a video in the admin panel.</p>
                </div>
            )}
            </div>
        </div>
        </section>
    </>
  );
};

export default VideosPage;
