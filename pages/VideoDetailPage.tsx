
import React from 'react';
import { useParams } from 'react-router-dom';
import { useVideoData } from '../hooks/useVideoData';
import Chatbot from '../components/Chatbot';
import KeyMoments from '../components/KeyMoments';
import ContentInsights from '../components/ContentInsights';
import LoadingSpinner from '../components/LoadingSpinner';
import Seo from '../components/Seo';
import Tabs, { Tab } from '../components/Tabs';

const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { videos, loading } = useVideoData();
  const currentVideo = videos.find(v => v.id === id);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>;
  }

  if (!currentVideo) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>Video not found.</div>;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: currentVideo.title,
    description: Array.isArray(currentVideo.description) ? currentVideo.description.join(' ') : currentVideo.description,
    thumbnailUrl: `https://img.youtube.com/vi/${currentVideo.id}/maxresdefault.jpg`,
    uploadDate: currentVideo.created_at,
    embedUrl: `https://www.youtube.com/embed/${currentVideo.id}`,
    publisher: {
      '@type': 'Organization',
      name: 'Techiral',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.techiral.com/logo.png'
      }
    },
  };

  return (
    <>
      <Seo
        title={`${currentVideo.title} - Techiral`}
        description={Array.isArray(currentVideo.description) ? currentVideo.description.join(' ') : currentVideo.description}
        jsonLd={jsonLd}
      />
      <style>
          {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Roboto&display=swap');
          `}
      </style>
      <div style={{ backgroundColor: 'white', color: 'black', minHeight: '100vh', fontFamily: 'Roboto, sans-serif' }}>
        <div style={{ maxWidth: '900px', margin: 'auto', padding: '48px 16px' }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
                <iframe
                src={`https://www.youtube.com/embed/${id}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                ></iframe>
            </div>

            <div style={{ marginTop: '48px' }}>
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2.25rem', fontWeight: 900, color: 'black', marginBottom: '8px' }}>{currentVideo.title}</h1>
                {Array.isArray(currentVideo.description) ? (
                <ul style={{ listStyleType: 'disc', listStylePosition: 'inside', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', fontSize: '1.125rem', color: 'black' }}>
                    {currentVideo.description.map((item, index) => (
                    <li key={index}>{item}</li>
                    ))}
                </ul>
                ) : (
                <p style={{ fontSize: '1.125rem', color: 'black' }}>{currentVideo.description}</p>
                )}
            </div>

            <div style={{ marginTop: '48px' }}>
                <Tabs>
                    {currentVideo.faqs && currentVideo.faqs.length > 0 && (
                        <Tab title="FAQ">
                            <ContentInsights insights={currentVideo.faqs} />
                        </Tab>
                    )}
                    {currentVideo.keyMoments && currentVideo.keyMoments.length > 0 && (
                        <Tab title="Key Moments">
                            <KeyMoments moments={currentVideo.keyMoments} />
                        </Tab>
                    )}
                    <Tab title="Chat">
                        <Chatbot videoId={id!} knowledgeBase={currentVideo.transcript} />
                    </Tab>
                </Tabs>
            </div>
        </div>
      </div>
    </>
  );
};

export default VideoDetailPage;
