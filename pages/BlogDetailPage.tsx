
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBlogData } from '../hooks/useBlogData';
import Chatbot from '../components/Chatbot';
import ContentInsights from '../components/ContentInsights';
import LoadingSpinner from '../components/LoadingSpinner';
import Seo from '../components/Seo';
import Tabs, { Tab } from '../components/Tabs';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { blogs, loading, generateBlogMetadata } = useBlogData();
  const [isGenerating, setIsGenerating] = useState(false);
  const currentBlog = blogs.find(b => b.id === id);

  const handleGenerateMetadata = async () => {
    if (currentBlog) {
      setIsGenerating(true);
      try {
        await generateBlogMetadata(currentBlog.id, currentBlog.title, currentBlog.content);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>;
  }

  if (!currentBlog) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>Blog not found.</div>;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://techiral.com/blogs/${id}`,
    },
    headline: currentBlog.title,
    image: currentBlog.thumbnailUrl,
    author: {
      '@type': 'Person',
      name: 'Techiral'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Techiral',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.techiral.com/logo.png'
      }
    },
    datePublished: currentBlog.created_at,
    description: currentBlog.metaDescription || (Array.isArray(currentBlog.description) ? currentBlog.description.join(' ') : currentBlog.description),
  };
  
    const createMarkup = (htmlContent: string) => {
        return { __html: htmlContent };
    };

  return (
    <>
      <Seo
        title={currentBlog.metaTitle || `${currentBlog.title} - Techiral`}
        description={currentBlog.metaDescription || (Array.isArray(currentBlog.description) ? currentBlog.description.join(' ') : currentBlog.description)}
        jsonLd={jsonLd}
      />
      <style>
          {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Roboto&display=swap');
          `}
      </style>
      <div style={{ backgroundColor: 'white', color: 'black', minHeight: '100vh', fontFamily: 'Roboto, sans-serif' }}>
        <div style={{ maxWidth: '900px', margin: 'auto', padding: '48px 16px' }}>
            {currentBlog.thumbnailUrl &&
                <div style={{ marginBottom: '24px' }}>
                <img
                    src={currentBlog.thumbnailUrl}
                    alt={currentBlog.title}
                    style={{ width: '100%', height: 'auto', borderRadius: '0.5rem' }}
                />
                </div>
            }
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2.25rem', fontWeight: 900, color: 'black', marginBottom: '8px' }}>{currentBlog.title}</h1>
            {currentBlog.targetAudience && (
            <p style={{ fontSize: '1.125rem', color: 'black', fontWeight: 600, marginBottom: '16px', fontStyle: 'italic' }}>{currentBlog.targetAudience}</p>
            )}
            {Array.isArray(currentBlog.description) ? (
                <ContentInsights insights={currentBlog.description.map(d => ({ summary: d }))} />
            ) : (
            <div style={{ fontSize: '1.125rem', maxWidth: 'none', color: 'black' }} dangerouslySetInnerHTML={createMarkup(currentBlog.description)} />
            )}
            <div style={{ fontSize: '1.125rem', maxWidth: 'none', color: 'black', marginTop: '32px' }} dangerouslySetInnerHTML={createMarkup(currentBlog.content)} />
            <div style={{ marginTop: '48px' }}>
              <button onClick={handleGenerateMetadata} disabled={isGenerating} style={{ marginBottom: '24px', padding: '12px 24px', backgroundColor: isGenerating ? '#ccc' : '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
                {isGenerating ? 'Generating...' : 'Generate Blog Metadata'}
              </button>
              <Tabs>
                  {currentBlog.faqs && currentBlog.faqs.length > 0 && (
                      <Tab title="FAQ">
                          <ContentInsights insights={currentBlog.faqs} />
                      </Tab>
                  )}
                  <Tab title="Chat">
                      <Chatbot blogId={id!} />
                  </Tab>
              </Tabs>
            </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailPage;
