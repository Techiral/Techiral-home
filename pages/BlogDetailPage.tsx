import React, { useState, useEffect, useCallback } from 'react';
import { useBlogData } from '../hooks/useBlogData';
import type { Blog, FAQItem } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import FAQ from '../components/FAQ';
import Chatbot from '../components/Chatbot';
import ContentInsights from '../components/ContentInsights';

const BlogDetailPage: React.FC<{ blogId: string }> = ({ blogId }) => {
    const { fetchBlogById, updateBlog } = useBlogData();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'moments' | 'transcript' | 'chat'>('summary');
    const [isGeneratingMoreFaqs, setIsGeneratingMoreFaqs] = useState<boolean>(false);

    const loadBlog = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedBlog = await fetchBlogById(blogId);
            if (fetchedBlog) {
                setBlog(fetchedBlog);
            } else {
                setError('Blog post not found. It may have been moved or deleted.');
            }
        } catch (err) {
            console.error('Error fetching blog post:', err);
            setError('An error occurred while loading the blog post.');
        }
        setIsLoading(false);
    }, [blogId, fetchBlogById]);

    useEffect(() => {
        loadBlog();
    }, [loadBlog]);

    useEffect(() => {
        const originalTitle = document.title;
        let metaDescriptionTag = document.querySelector('meta[name="description"]');
        const originalDescriptionContent = metaDescriptionTag ? metaDescriptionTag.getAttribute('content') : null;
        
        if (blog) {
            if (blog.metaTitle) document.title = blog.metaTitle;
            if (blog.metaDescription) {
                if (!metaDescriptionTag) {
                    metaDescriptionTag = document.createElement('meta');
                    metaDescriptionTag.setAttribute('name', 'description');
                    document.head.appendChild(metaDescriptionTag);
                }
                metaDescriptionTag.setAttribute('content', blog.metaDescription);
            }
        }

        return () => {
            document.title = originalTitle;
            if (metaDescriptionTag) {
                if (originalDescriptionContent) {
                    metaDescriptionTag.setAttribute('content', originalDescriptionContent);
                } else {
                    metaDescriptionTag.remove();
                }
            }
        };
    }, [blog]);

    const handleGenerateMoreFaqs = async () => {
        if (!blog) return;
        setIsGeneratingMoreFaqs(true);
        setError(null);

        const existingQuestions = (blog.faqs || []).map(faq => `- ${faq.question}`).join('\n');

        try {
             const prompt = `You are an expert AI assistant for the YouTube channel 'Techiral'. Your task is to generate 3 new and insightful FAQs based on the provided blog article content.

These questions must be substantively different from the existing ones provided below. Your knowledge is strictly limited to the article content. Answers should be practical and directly cite information from the article.

Blog Title: "${blog.title}"

Existing Questions (Do NOT repeat these):
${existingQuestions}

Article Content:
---
${blog.content}
---

Generate exactly 3 new, unique FAQs. Return ONLY a single, valid JSON array of objects, where each object has "question" and "answer" string keys. Do not include any introductory text or markdown formatting.`;
            
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

            if (!response.ok) throw new Error('Failed to generate more FAQs.');

            const data = await response.json();
            const jsonContent = data.choices[0].message.content;
            const extractJsonArrayString = (str: string): string | null => str.match(/\[[\s\S]*\]/)?.[0] || null;
            const extractedJsonStr = extractJsonArrayString(jsonContent);
            if (!extractedJsonStr) throw new Error('Invalid JSON response for new FAQs.');

            const newFaqs: FAQItem[] = JSON.parse(extractedJsonStr);
            const existingFaqSet = new Set((blog.faqs || []).map(f => f.question));
            const uniqueNewFaqs = newFaqs.filter(faq => !existingFaqSet.has(faq.question));

            if (uniqueNewFaqs.length > 0) {
                const updatedFaqs = [...(blog.faqs || []), ...uniqueNewFaqs];
                const updatedBlog = { ...blog, faqs: updatedFaqs };
                setBlog(updatedBlog);
                await updateBlog(blog.id, updatedBlog);
            }

        } catch (e) {
            console.error("Error generating more FAQs:", e);
            setError("Sorry, could not generate more FAQs at this time.");
        } finally {
            setIsGeneratingMoreFaqs(false);
        }
    };

    const TabButton: React.FC<{tabName: 'summary' | 'moments' | 'transcript' | 'chat', children: React.ReactNode}> = ({ tabName, children }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`py-3 px-6 font-roboto font-bold text-sm md:text-base transition-colors duration-300 border-b-4 ${
                activeTab === tabName
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
            }`}
        >
            {children}
        </button>
    );

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold p-8">{error}</div>;
    if (!blog) return null; // Should ideally not be reached if error is handled

    return (
        <div className="bg-white text-black py-16 md:py-24 px-6">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-12">
                     <h1 className="font-montserrat text-3xl md:text-5xl font-black mb-4">{blog.title}</h1>
                     <a href={blog.mediumUrl} target="_blank" rel="noopener noreferrer" className="bg-black text-white font-roboto font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 inline-block">
                        Read the Full Article on Medium
                    </a>
                </div>

                <div className="mb-12">
                    <h2 className="font-montserrat text-2xl font-black mb-3">About this article</h2>
                    <p className="font-roboto text-gray-700 leading-relaxed whitespace-pre-wrap">{blog.description}</p>
                </div>
                
                <div>
                    <div className="flex justify-center border-b-2 border-gray-200 mb-6">
                       <TabButton tabName="summary">AI Summary</TabButton>
                       <TabButton tabName="moments">Key Takeaways</TabButton>
                       <TabButton tabName="transcript">Full Article</TabButton>
                       <TabButton tabName="chat">Chat</TabButton>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg min-h-[400px]">
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        {activeTab === 'summary' && (
                            <>
                                <FAQ faqs={blog.faqs || []} />
                                <div className="text-center mt-6">
                                    <button
                                        onClick={handleGenerateMoreFaqs}
                                        disabled={isGeneratingMoreFaqs}
                                        className="bg-black text-white font-roboto font-bold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    >
                                        {isGeneratingMoreFaqs ? 'Generating...' : 'Generate More FAQs'}
                                    </button>
                                </div>
                            </>
                        )}
                        {activeTab === 'moments' && <ContentInsights insights={blog.keyMoments || []} />}
                        {activeTab === 'transcript' && (
                            <div className="font-serif text-base text-gray-800 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                                {blog.content}
                            </div>
                        )}
                        {activeTab === 'chat' && <Chatbot title={blog.title} content={blog.content} contentType="article" />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetailPage;
