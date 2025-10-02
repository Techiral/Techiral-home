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
      <div className="bg-white text-black min-h-screen font-roboto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-8">
            <div className="lg:col-span-2">
              <div className="space-y-12">
                <div>
                    {currentBlog.thumbnailUrl &&
                        <div className="mb-6">
                        <img
                            src={currentBlog.thumbnailUrl}
                            alt={currentBlog.title}
                            className="w-full h-auto rounded-lg"
                        />
                        </div>
                    }
                  <h1 className="font-montserrat text-4xl font-black text-gray-900 mb-4">{currentBlog.title}</h1>
                  <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: currentBlog.content }} />
                </div>
                {currentBlog.faqs && currentBlog.faqs.length > 0 && (
                    <ContentInsights insights={currentBlog.faqs} />
                )}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Chatbot blogId={id!} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailPage;
