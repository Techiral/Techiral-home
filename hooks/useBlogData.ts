import { useState, useEffect, useCallback } from 'react';
import type { Blog } from '../types';
import { supabase } from '../lib/supabaseClient';

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const useBlogData = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const fetchBlogs = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Failed to load blogs from Supabase:', error);
      alert('Failed to load blogs.');
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const fetchBlogById = useCallback(async (blogId: string): Promise<Blog | null> => {
    try {
      const { data, error } = await supabase.from('blogs').select('*').eq('id', blogId).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error(`Failed to load blog with id ${blogId}:`, error);
      return null;
    }
  }, []);

  const addBlog = useCallback(async (newBlogData: Pick<Blog, 'mediumUrl' | 'title' | 'content' | 'thumbnailUrl'>): Promise<boolean> => {
    if (!newBlogData.mediumUrl || !newBlogData.title || !newBlogData.content) {
      alert("Medium URL, Title, and Content are required.");
      return false;
    }
    const slug = createSlug(newBlogData.title);

    const { data: existingBlogs, error: fetchError } = await supabase.from('blogs').select('id').eq('id', slug);
    if (fetchError) {
      console.error('Error checking for existing blog:', fetchError);
      alert('Error checking for existing blog.');
      return false;
    }
    if (existingBlogs && existingBlogs.length > 0) {
      alert("A blog with this title already exists.");
      return false;
    }

    try {
      const prompt = `You are an expert technical writer and content strategist for 'Techiral'. Your task is to analyze a blog post and generate a comprehensive set of metadata to enhance its presentation and discoverability. Your knowledge is strictly limited to the provided content.

Based on the following blog title and content, perform these five tasks:

1.  **Generate Scannable Summary:** Convert the blog's description into a bulleted list. Each bullet point should be a concise, benefit-oriented sentence starting with a bolded keyword (e.g., "**Learn** how to...").

2.  **Identify Target Audience:** Write a short, explicit sub-heading identifying the intended audience (e.g., "A step-by-step guide for developers and tech enthusiasts.").

3.  **Generate FAQs:** Create a list of 3-5 insightful FAQs that a curious reader might ask. Answers must be detailed and directly supported by the blog content.

4.  **Identify Key Takeaways:** Identify the most crucial sections or ideas. For each, provide a short, descriptive label (e.g., "The Core Concept") and a concise summary of that idea.

5.  **Generate SEO Metadata & CTA:**
    *   metaTitle: A compelling title under 60 characters.
    *   metaDescription: An enticing summary under 160 characters.
    *   ctaHeadline: A clear, unmistakable call-to-action headline for acquiring related resources.
    *   ctaDescription: A short description of what the user will get (e.g., "downloadable code snippets," "a complete project guide").

Return ONLY a single, valid JSON object with seven top-level keys: "description", "targetAudience", "faqs", "keyMoments", "metaTitle", "metaDescription", and "cta". The structure must be:
{
  "description": ["string"],
  "targetAudience": "string",
  "faqs": [{ "question": "string", "answer": "string" }],
  "keyMoments": [{ "label": "string", "summary": "string" }],
  "metaTitle": "string",
  "metaDescription": "string",
  "cta": { "headline": "string", "description": "string" }
}

Blog Title: "${newBlogData.title}"

Content:
---
${newBlogData.content}
---
`;

      const response = await fetch('/api/generate', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ prompt })
      });
      if (!response.ok) throw new Error(`AI API request failed with status ${response.status}`);
      
      const data = await response.json();
      const parsedData = JSON.parse(data.response);

      const completeBlog: Omit<Blog, 'created_at'> = {
        ...newBlogData,
        id: slug,
        ...parsedData,
      };

      const { data: insertedBlog, error: insertError } = await supabase.from('blogs').insert([completeBlog]).select().single();
      if (insertError) throw insertError;

      if (insertedBlog) {
        setBlogs(prevBlogs => [insertedBlog, ...prevBlogs]);
        alert("Blog added successfully! All content was generated automatically.");
        return true;
      } else {
        throw new Error("Insert operation did not return the new blog post.");
      }

    } catch (error: any) {
      console.error('Failed to add blog:', error);
      alert(`An unexpected error occurred while adding the blog: ${error.message}`);
      return false;
    }
  }, [fetchBlogs]);

  const updateBlog = useCallback(async (blogId: string, updatedBlogData: Partial<Blog>): Promise<boolean> => {
    try {
      const { data: updatedBlog, error } = await supabase.from('blogs').update(updatedBlogData).eq('id', blogId).select().single();
      if (error) throw error;
      if (updatedBlog) {
        setBlogs(prevBlogs => prevBlogs.map(blog => (blog.id === blogId ? updatedBlog : blog)));
        alert('Blog updated successfully!');
        return true;
      } else {
        throw new Error("Update operation did not return the updated blog post.");
      }
    } catch (error: any) {
      console.error('Failed to update blog:', error);
      alert(`Failed to update blog: ${error.message}`);
      return false;
    }
  }, []);

  const deleteBlog = useCallback(async (blogId: string): Promise<boolean> => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const { error, count } = await supabase.from('blogs').delete({ count: 'exact' }).eq('id', blogId);
        if (error) throw error;
        if (count && count > 0) {
          setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== blogId));
          alert('Blog deleted successfully!');
          return true;
        } else {
          alert('Could not delete the blog post. It may have already been removed.');
          fetchBlogs();
          return false;
        }
      } catch (error: any) {
        console.error('Failed to delete blog:', error);
        alert(`Failed to delete blog: ${error.message}`);
        return false;
      }
    }
    return false;
  }, [fetchBlogs]);

  return { blogs, fetchBlogs, fetchBlogById, addBlog, updateBlog, deleteBlog };
};
