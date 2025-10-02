import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBlogData } from '../hooks/useBlogData';
import type { Blog } from '../types';
import Seo from '../components/Seo';

const BlogCard: React.FC<{ blog: Blog }> = ({ blog }) => {
  return (
    <Link to={`/blogs/${blog.id}`} className="group block p-4 sm:p-6 bg-gray-50 hover:bg-white border border-gray-200 hover:shadow-md rounded-lg transition-all duration-300">
      <div className="flex items-start space-x-4">
        {blog.thumbnailUrl && (
          <img src={blog.thumbnailUrl} alt={blog.title} className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded" />
        )}
        <div>
            <h3 className="font-montserrat text-lg sm:text-xl font-black text-black mb-2 group-hover:text-gray-600">{blog.title}</h3>
            <p className="font-roboto text-gray-700 text-xs sm:text-sm overflow-hidden line-clamp-2">{blog.description}</p>
        </div>
      </div>
    </Link>
  );
};

const BlogsPage: React.FC = () => {
    const { blogs } = useBlogData();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBlogs = useMemo(() => {
        if (!searchTerm) return blogs;
        return blogs.filter(blog => 
            blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            blog.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [blogs, searchTerm]);

  return (
    <>
        <Seo 
            title="Article Library - Techiral"
            description="A collection of articles, tutorials, and deep dives. Each one is enhanced with AI-powered Q&A to help you learn faster."
        />
        <section id="blogs" className="bg-white text-black py-16 sm:py-20 md:py-24 px-4 sm:px-6 min-h-screen">
        <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h1 className="font-montserrat text-3xl sm:text-4xl md:text-5xl font-black mb-4">Article Library.</h1>
                <p className="font-roboto text-base sm:text-lg text-gray-700 mb-8">
                    A collection of articles, tutorials, and deep dives. Each one is enhanced with AI-powered Q&A to help you learn faster.
                </p>
                <input 
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md sm:max-w-lg mx-auto p-3 border-2 border-black rounded-full font-roboto focus:outline-none focus:ring-2 focus:ring-black"
                />
            </div>
            <div className="max-w-4xl mx-auto space-y-4">
            {filteredBlogs.length > 0 ? (
                [...filteredBlogs].reverse().map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
                ))
            ) : (
                <div className="text-center py-16">
                    <p className="font-roboto text-gray-600">No articles found. Try a different search term or add one in the admin panel.</p>
                </div>
            )}
            </div>
        </div>
        </section>
    </>
  );
};

export default BlogsPage;
