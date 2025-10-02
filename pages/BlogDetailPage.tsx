import React from 'react';
import { useParams } from 'react-router-dom';
import { useBlogData } from '../hooks/useBlogData';
import Chatbot from '../components/Chatbot';
import ContentInsights from '../components/ContentInsights';
import LoadingSpinner from '../components/LoadingSpinner';
import Seo from '../components/Seo';
import type { Blog } from '../types';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { blogs, loading } = useBlogData();
  const currentBlog = blogs.find(b => b.id === id);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!currentBlog) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Blog not found.</div>;
  }

  const insights = currentBlog.faqs;

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
    description: currentBlog.description
  };

  return (
    <>
      <Seo
        title={currentBlog.metaTitle || `${currentBlog.title} - Techiral`}
        description={currentBlog.metaDescription || currentBlog.description}
        jsonLd={jsonLd}
      />
      <div className="bg-white text-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-6 sm:p-8 rounded-lg shadow-md">
                {currentBlog.thumbnailUrl &&
                  <img
                    src={currentBlog.thumbnailUrl}
                    alt={currentBlog.title}
                    className="w-full h-auto rounded-lg shadow-xl mb-8"
                  />
                }
                <h1 className="font-montserrat text-3xl sm:text-4xl font-black text-gray-900 mb-4">{currentBlog.title}</h1>
                <div
                  className="prose prose-lg max-w-none text-gray-800 font-roboto"
                  dangerouslySetInnerHTML={{ __html: currentBlog.content }}
                />
              </div>
            </div>
            <div className="lg:col-span-1 space-y-8">
              {insights && <ContentInsights insights={insights} />}
              <Chatbot blogId={id!} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailPage;
