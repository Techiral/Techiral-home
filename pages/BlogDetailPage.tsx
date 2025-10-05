
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBlogData } from '../hooks/useBlogData';
import Chatbot from '../components/Chatbot';
import ContentInsights from '../components/ContentInsights';
import LoadingSpinner from '../components/LoadingSpinner';
import Seo from '../components/Seo';
import Tabs, { Tab } from '../components/Tabs';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { blogs, loading } = useBlogData();
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(true);
  const [showFullContent, setShowFullContent] = useState(false);
  const currentBlog = blogs.find(b => b.id === id);

  const handleSummarize = async () => {
    if(currentBlog) {
      setIsSummarizing(true);
      // MOCK: In a real app, you'd call an AI summarization service.
      // Simulating a network request delay.
      await new Promise(resolve => setTimeout(resolve, 1000));
      const summaryText = Array.isArray(currentBlog.description)
        ? currentBlog.description.map(d => `<p>${d}</p>`).join('')
        : currentBlog.description;
      setSummary(summaryText || (currentBlog.content.substring(0, 500) + '...'));
      setIsSummarizing(false);
    }
  }

  useEffect(() => {
    if (currentBlog) {
      handleSummarize();
    }
  }, [currentBlog]);


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
            
            <div style={{ fontSize: '1.125rem', maxWidth: 'none', color: 'black', marginTop: '32px' }}>
              {isSummarizing ? (
                <LoadingSpinner />
              ) : showFullContent ? (
                <div dangerouslySetInnerHTML={createMarkup(currentBlog.content)} />
              ) : (
                <div dangerouslySetInnerHTML={createMarkup(summary)} />
              )}
            </div>

            {!isSummarizing && (
              <button onClick={() => setShowFullContent(!showFullContent)} style={{ marginTop: '24px', padding: '12px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
                {showFullContent ? 'Show Summary' : 'Read More'}
              </button>
            )}

            <div style={{ marginTop: '48px' }}>
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
