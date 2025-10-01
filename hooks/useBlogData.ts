import { useState, useEffect, useCallback } from 'react';
import type { Blog } from '../types';
import { SEED_BLOGS_DATA } from '../constants';

const LOCAL_STORAGE_KEY = 'techiral_blogs';

const getInitialBlogs = (): Blog[] => {
    return SEED_BLOGS_DATA.map(blog => ({
        ...blog,
        keyMoments: blog.keyMoments || [],
        faqs: blog.faqs || [],
        description: blog.description || '',
        metaTitle: blog.metaTitle || blog.title,
        metaDescription: blog.metaDescription || blog.description.substring(0, 160),
    }));
};

// A simple utility to create a URL-friendly slug from a title
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with -
    .replace(/(^-|-$)+/g, ''); // Remove leading/trailing dashes
};

export const useBlogData = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    try {
      const storedBlogs = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedBlogs) {
        setBlogs(JSON.parse(storedBlogs));
      } else {
        const initialData = getInitialBlogs();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
        setBlogs(initialData);
      }
    } catch (error) {
      console.error('Failed to load blogs from local storage:', error);
      setBlogs(getInitialBlogs());
    }
  }, []);

  const persistBlogs = (newBlogs: Blog[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newBlogs));
      setBlogs(newBlogs);
    } catch (error) {
      console.error('Failed to save blogs to local storage:', error);
    }
  };

  const addBlog = useCallback(async (newBlogData: Pick<Blog, 'mediumUrl' | 'title' | 'content'>): Promise<boolean> => {
    if (!newBlogData.mediumUrl || !newBlogData.title || !newBlogData.content) {
        alert("Medium URL, Title, and Content are required.");
        return false;
    }
    const slug = createSlug(newBlogData.title);
    const blogExists = blogs.some(blog => blog.id === slug);
    if (blogExists) {
        alert("A blog with this title already exists.");
        return false;
    }

    try {
        const prompt = `You are an expert technical writer and content strategist for the YouTube channel 'Techiral'. Your task is to analyze a blog post and generate a comprehensive set of metadata to enhance its presentation and discoverability. Your knowledge is strictly limited to the provided content.

Based on the following blog title and content, perform these four tasks:

1.  **Generate Description:** Write an engaging, one-paragraph summary for the "About this article" section. It should hook the reader, explain the problem the article solves, and highlight the key takeaways.

2.  **Generate FAQs:** Create a list of 3-5 insightful FAQs that a curious developer might ask after reading. Questions should address potential ambiguities or explore related concepts mentioned in the article. Answers must be detailed, practical, and directly supported by the content.

3.  **Identify Key Takeaways:** Identify the most crucial sections or ideas. For each, provide a short, descriptive label (e.g., "The Magic of useState") and a concise summary of that idea.

4.  **Generate SEO Metadata:**
    - metaTitle: A compelling title under 60 characters that is descriptive and highly clickable.
    - metaDescription: An enticing summary under 160 characters that encourages users to click through from a search engine results page.

Return ONLY a single, valid JSON object with five top-level keys: "description", "faqs", "keyMoments", "metaTitle", and "metaDescription". The "keyMoments" array objects should have "label" and "summary" keys. The structure must be:
{
  "description": "string",
  "faqs": [{ "question": "string", "answer": "string" }],
  "keyMoments": [{ "label": "string", "summary": "string" }],
  "metaTitle": "string",
  "metaDescription": "string"
}

Blog Title: "${newBlogData.title}"

Content:
---
${newBlogData.content}
---
`;
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
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

        const completeBlog: Blog = {
            ...newBlogData,
            id: slug,
            description,
            faqs,
            keyMoments,
            metaTitle,
            metaDescription,
        };

        const updatedBlogs = [...blogs, completeBlog];
        persistBlogs(updatedBlogs);
        alert("Blog added successfully! All content was generated automatically.");
        return true;

    } catch (error) {
        console.error('Failed to add blog:', error);
        alert("An unexpected error occurred while generating blog content. Please check the console and try again.");
        return false;
    }
  }, [blogs]);

  const updateBlog = useCallback((blogId: string, updatedBlogData: Blog) => {
    const blogExists = blogs.some(blog => blog.id === blogId);
    if (!blogExists) {
      alert("Cannot update a blog that doesn't exist.");
      return false;
    }
    const updatedBlogs = blogs.map(blog =>
      blog.id === blogId ? updatedBlogData : blog
    );
    persistBlogs(updatedBlogs);
    return true;
  }, [blogs]);

  const deleteBlog = useCallback((blogId: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
        const updatedBlogs = blogs.filter(blog => blog.id !== blogId);
        persistBlogs(updatedBlogs);
    }
  }, [blogs]);

  return { blogs, addBlog, updateBlog, deleteBlog };
};
