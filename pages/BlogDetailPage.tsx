import React from 'react';
import { useParams } from 'react-router-dom';
import { useBlogData } from '../hooks/useBlogData'; // Import the correct hook
import Chatbot from '../components/Chatbot';
import ContentInsights from '../components/ContentInsights';
import LoadingSpinner from '../components/LoadingSpinner';
import Seo from '../components/Seo';
import type { Blog } from '../types'; // Import the Blog type

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // The 'blogs' array from this hook contains all the data we need.
  const { blogs, loading } = useBlogData();

  // Find the specific blog from the array.
  const currentBlog = blogs.find(b => b.id === id);

  // Show a loading spinner while the blogs are being fetched.
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  // If the blog is not found after loading, show an error message.
  if (!currentBlog) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Blog not found.</div>;
  }

  // The 'faqs' from the blog data will be used as 'insights'.
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
        url: 'https://www.techiral.com/logo.png' // Replace with your actual logo URL
      }
    },
    datePublished: currentBlog.created_at, // Use the created_at field
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
              <div className="mb-8">
                {currentBlog.thumbnailUrl &&
                  <img
                    src={currentBlog.thumbnailUrl}
                    alt={currentBlog.title}
                    className="w-full h-auto rounded-lg shadow-xl mb-6"
                  />
                }
                <h1 className="font-montserrat text-3xl sm:text-4xl font-black text-gray-900 mb-3">{currentBlog.title}</h1>
                {/* Render the HTML content from the database */}
                <div
                  className="prose lg:prose-xl max-w-none font-roboto text-gray-800"
                  dangerouslySetInnerHTML={{ __html: currentBlog.content }}
                />
              </div>
            </div>
            <div className="lg:col-span-1 space-y-8">
              {/* Use the faqs from the Supabase data as insights */}
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
