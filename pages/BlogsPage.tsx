
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBlogData } from '../hooks/useBlogData';
import type { Blog } from '../types';
import Seo from '../components/Seo';

const BlogCard: React.FC<{ blog: Blog }> = ({ blog }) => {
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
    <Link to={`/blogs/${blog.id}`} style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {blog.thumbnailUrl && (
          <img src={blog.thumbnailUrl} alt={blog.title} style={{ width: '128px', height: '80px', objectFit: 'cover', borderRadius: '0.25rem' }} />
        )}
        <div>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', fontWeight: 900, color: 'black', marginBottom: '8px' }}>{blog.title}</h3>
            <p style={{ fontFamily: 'Roboto, sans-serif', color: 'black', fontSize: '0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{blog.description}</p>
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
        <style>
            {`
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Roboto&display=swap');
            input:focus { outline: none; box-shadow: 0 0 0 2px black; }
            `}
        </style>
        <section style={{ backgroundColor: 'white', color: 'black', padding: '80px 24px', minHeight: '100vh', fontFamily: 'Roboto, sans-serif' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', maxWidth: '768px', margin: '0 auto 48px' }}>
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: '3rem', marginBottom: '16px', color: 'black' }}>Article Library.</h1>
                <p style={{ fontSize: '1.125rem', color: 'black', marginBottom: '32px' }}>
                    A collection of articles, tutorials, and deep dives. Each one is enhanced with AI-powered Q&A to help you learn faster.
                </p>
                <input 
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', maxWidth: '512px', margin: '0 auto', padding: '12px', border: '2px solid black', borderRadius: '9999px', fontFamily: 'Roboto, sans-serif' }}
                />
            </div>
            <div style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredBlogs.length > 0 ? (
                [...filteredBlogs].reverse().map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
                ))
            ) : (
                <div style={{ textAlign: 'center', padding: '64px 0' }}>
                    <p style={{ fontFamily: 'Roboto, sans-serif', color: 'black' }}>No articles found. Try a different search term or add one in the admin panel.</p>
                </div>
            )}
            </div>
        </div>
        </section>
    </>
  );
};

export default BlogsPage;
