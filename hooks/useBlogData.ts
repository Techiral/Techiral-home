import { useState, useEffect, useCallback } from 'react';
import type { Blog } from '../types';
import { supabase } from '../lib/supabaseClient';

// A simple utility to create a URL-friendly slug from a title
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with -
    .replace(/(^-|-$)+/g, ''); // Remove leading/trailing dashes
};

export const useBlogData = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const fetchBlogs = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      setBlogs(data || []);
    } catch (error) {
      console.error('Failed to load blogs from Supabase:', error);
      alert('Failed to load blogs.');
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const addBlog = useCallback(async (newBlogData: Pick<Blog, 'mediumUrl' | 'title' | 'content' | 'thumbnailUrl'>): Promise<boolean> => {
    if (!newBlogData.mediumUrl || !newBlogData.title || !newBlogData.content) {
        alert("Medium URL, Title, and Content are required.");
        return false;
    }
    const slug = createSlug(newBlogData.title);
    
    // Check if blog with same slug exists
    const { data: existingBlogs, error: fetchError } = await supabase
      .from('blogs')
      .select('id')
      .eq('id', slug);

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
        const prompt = `You are an expert technical writer and content strategist for the YouTube channel 'Techiral'. Your task is to analyze a blog post and generate a comprehensive set of metadata to enhance its presentation and discoverability. Your knowledge is strictly limited to the provided content.\n\nBased on the following blog title and content, perform these four tasks:\n\n1.  **Generate Description:** Write an engaging, one-paragraph summary for the \"About this article\" section. It should hook the reader, explain the problem the article solves, and highlight the key takeaways.\n\n2.  **Generate FAQs:** Create a list of 3-5 insightful FAQs that a curious developer might ask after reading. Questions should address potential ambiguities or explore related concepts mentioned in the article. Answers must be detailed, practical, and directly supported by the content.\n\n3.  **Identify Key Takeaways:** Identify the most crucial sections or ideas. For each, provide a short, descriptive label (e.g., \"The Magic of useState\") and a concise summary of that idea.\n\n4.  **Generate SEO Metadata:**\n    - metaTitle: A compelling title under 60 characters that is descriptive and highly clickable.\n    - metaDescription: An enticing summary under 160 characters that encourages users to click through from a search engine results page.\n\nReturn ONLY a single, valid JSON object with five top-level keys: \"description\", \"faqs\", \"keyMoments\", \"metaTitle\", and \"metaDescription\". The \"keyMoments\" array objects should have \"label\" and \"summary\" keys. The structure must be:\n{\n  \"description\": \"string\",\n  \"faqs\": [{ \"question\": \"string\", \"answer\": \"string\" }],\n  \"keyMoments\": [{ \"label\": \"string\", \"summary\": \"string\" }],\n  \"metaTitle\": \"string\",\n  \"metaDescription\": \"string\"\n}\n\nBlog Title: \"${newBlogData.title}\"\n\nContent:\n---\n${newBlogData.content}\n---\n`;
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': `https://techiral.com`,
                'X-Title': `Techiral AI`,
            },
            body: JSON.stringify({
                model: 'x-ai/grok-4-fast:free',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) throw new Error(`AI API request failed with status ${response.status}`);

        const data = await response.json();
        const jsonContent = data.choices[0].message.content;
        
        const extractJsonString = (str: string): string | null => {
            const match = str.match(/\{[\s\S]*\}/);
            return match ? match[0] : null;
        };

        const extractedJsonStr = extractJsonString(jsonContent);
        if (!extractedJsonStr) throw new Error("AI response did not contain valid JSON.");
        
        const { description, faqs, keyMoments, metaTitle, metaDescription } = JSON.parse(extractedJsonStr);

        if (!description || !faqs || !keyMoments || !metaTitle || !metaDescription) {
            throw new Error("AI returned incomplete data.");
        }

        const completeBlog: Omit<Blog, 'created_at'> = { // The database will set created_at
            ...newBlogData,
            id: slug,
            description,
            faqs,
            keyMoments,
            metaTitle,
            metaDescription,
        };

        const { data: insertedBlog, error: insertError } = await supabase
          .from('blogs')
          .insert([completeBlog])
          .select()
          .single(); // We expect a single object back

        if (insertError) {
          throw insertError;
        }

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
      const { data: updatedBlog, error } = await supabase
        .from('blogs')
        .update(updatedBlogData)
        .eq('id', blogId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      if (updatedBlog) {
          setBlogs(prevBlogs =>
            prevBlogs.map(blog => (blog.id === blogId ? updatedBlog : blog))
          );
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

        if (error) {
          throw error;
        }

        if (count && count > 0) {
            setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== blogId));
            alert('Blog deleted successfully!');
            return true;
        } else {
            // This case can happen with RLS or if the record is already deleted.
            alert('Could not delete the blog post. It may have already been removed.');
            // We should re-sync the state in this case.
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

  return { blogs, addBlog, updateBlog, deleteBlog };
};
