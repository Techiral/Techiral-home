import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import ContentInsights from '../components/ContentInsights';
import LoadingSpinner from '../components/LoadingSpinner';
import Seo from '../components/Seo';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchBlogDetails = async () => {
        try {
          const response = await fetch(`/api/proxy?endpoint=blogs/${id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch blog details: ${response.statusText}`);
          }
          const data = await response.json();
          setBlog(data);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          }
        }
      };
      fetchBlogDetails();
    }
  }, [id]);

  if (!blog) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    image: blog.thumbnailUrl,
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
    datePublished: blog.createdAt, // Assuming you have a createdAt field
    description: blog.description
  };

  return (
    <>
      <Seo 
        title={`${blog.title} - Techiral`}
        description={blog.description}
        jsonLd={jsonLd}
      />
      <div className="bg-white text-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-8">
                {blog.thumbnailUrl && 
                  <img 
                    src={blog.thumbnailUrl} 
                    alt={blog.title} 
                    className="w-full h-auto rounded-lg shadow-xl mb-6"
                  />
                }
                <h1 className="font-montserrat text-3xl sm:text-4xl font-black text-gray-900 mb-3">{blog.title}</h1>
                <div 
                  className="prose lg:prose-xl max-w-none font-roboto text-gray-800"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>
            </div>
            <div className="lg:col-span-1 space-y-8">
              {blog.insights && <ContentInsights insights={blog.insights} />}
              <Chatbot blogId={id!} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailPage;
