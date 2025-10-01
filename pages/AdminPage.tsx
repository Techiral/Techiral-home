import React, { useState } from 'react';
import { useVideoData } from '../hooks/useVideoData';
import { useBlogData } from '../hooks/useBlogData';
import { useAuth } from '../hooks/useAuth';
import type { Video, Blog, FAQItem, ContentInsight } from '../types';

type AdminTab = 'videos' | 'blogs';

const AdminPage: React.FC = () => {
    const { videos, addVideo, updateVideo, deleteVideo } = useVideoData();
    const { blogs, addBlog, updateBlog, deleteBlog } = useBlogData();
    const { logout } = useAuth();
    
    const [activeTab, setActiveTab] = useState<AdminTab>('videos');

    // State for video form
    const initialVideoFormState: Video = { id: '', title: '', description: '', transcript: '', faqs: [], keyMoments: [], metaTitle: '', metaDescription: '' };
    const [videoFormState, setVideoFormState] = useState<Video>(initialVideoFormState);
    const [isEditingVideo, setIsEditingVideo] = useState(false);
    
    // State for blog form
    const initialBlogFormState: Blog = { id: '', mediumUrl: '', title: '', description: '', content: '', faqs: [], keyMoments: [], metaTitle: '', metaDescription: '' };
    const [blogFormState, setBlogFormState] = useState<Blog>(initialBlogFormState);
    const [isEditingBlog, setIsEditingBlog] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Generic handlers for nested state updates
    const handleNestedChange = <T extends FAQItem | ContentInsight, S extends Video | Blog>(
        index: number,
        field: keyof T,
        value: string,
        arrayName: 'faqs' | 'keyMoments',
        setState: React.Dispatch<React.SetStateAction<S>>
    ) => {
        setState(prev => {
            const newArray = [...(prev[arrayName] || [])] as T[];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [arrayName]: newArray };
        });
    };

    const handleAddItem = <S extends Video | Blog>(
        arrayName: 'faqs' | 'keyMoments',
        setState: React.Dispatch<React.SetStateAction<S>>
    ) => {
        const newItem = arrayName === 'faqs' ? { question: '', answer: '' } : { label: '', summary: '' };
        setState(prev => ({ ...prev, [arrayName]: [...(prev[arrayName] || []), newItem] }));
    };

    const handleRemoveItem = <S extends Video | Blog>(
        index: number,
        arrayName: 'faqs' | 'keyMoments',
        setState: React.Dispatch<React.SetStateAction<S>>
    ) => {
        setState(prev => {
            const newArray = (prev[arrayName] || []).filter((_, i) => i !== index);
            return { ...prev, [arrayName]: newArray };
        });
    };
    
    // Video-specific handlers
    const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setVideoFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleEditVideoClick = (video: Video) => {
        setIsEditingVideo(true);
        setVideoFormState({
            ...video,
            faqs: video.faqs || [],
            keyMoments: video.keyMoments || [],
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetVideoForm = () => {
        setIsEditingVideo(false);
        setVideoFormState(initialVideoFormState);
    };

    const handleVideoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        let success = false;
        if (isEditingVideo) {
            const videoToUpdate = { ...videoFormState, faqs: videoFormState.faqs || [], keyMoments: videoFormState.keyMoments || [] };
            success = updateVideo(videoToUpdate.id, videoToUpdate);
            if (success) alert("Video updated successfully!");
        } else {
            const { id, title, transcript } = videoFormState;
            success = await addVideo({ id, title, transcript });
        }
        if (success) resetVideoForm();
        setIsSubmitting(false);
    };

    // Blog-specific handlers
    const handleBlogInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBlogFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleEditBlogClick = (blog: Blog) => {
        setIsEditingBlog(true);
        setBlogFormState({
            ...blog,
            faqs: blog.faqs || [],
            keyMoments: blog.keyMoments || [],
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetBlogForm = () => {
        setIsEditingBlog(false);
        setBlogFormState(initialBlogFormState);
    };

    const handleBlogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        let success = false;
        if (isEditingBlog) {
            const blogToUpdate = { ...blogFormState, faqs: blogFormState.faqs || [], keyMoments: blogFormState.keyMoments || [] };
            success = updateBlog(blogToUpdate.id, blogToUpdate);
            if (success) alert("Blog updated successfully!");
        } else {
            const { mediumUrl, title, content } = blogFormState;
            success = await addBlog({ mediumUrl, title, content });
        }
        if (success) resetBlogForm();
        setIsSubmitting(false);
    };

    const TabButton: React.FC<{ tab: AdminTab, children: React.ReactNode }> = ({ tab, children }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-6 font-roboto font-bold rounded-t-lg transition-colors duration-300 ${activeTab === tab ? 'bg-gray-50 text-black' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
            {children}
        </button>
    );

    return (
        <section className="bg-white text-black py-20 md:py-24 px-6 min-h-screen">
            <div className="container mx-auto max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="font-montserrat text-4xl md:text-5xl font-black">Admin Panel</h1>
                    <button onClick={logout} className="bg-gray-700 text-white font-roboto font-bold py-2 px-4 rounded-md hover:bg-black transition-colors duration-300">
                        Logout
                    </button>
                </div>
                
                <div className="flex border-b-2 border-gray-300">
                    <TabButton tab="videos">Manage Videos</TabButton>
                    <TabButton tab="blogs">Manage Blogs</TabButton>
                </div>

                {/* Video Manager */}
                {activeTab === 'videos' && (
                    <div className="bg-gray-50 p-8 rounded-b-lg shadow-md mb-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-montserrat text-2xl font-black">{isEditingVideo ? 'Edit Video' : 'Add New Video'}</h2>
                            {isEditingVideo && <button onClick={resetVideoForm} className="text-sm font-roboto font-bold text-black hover:underline">&#43; Add New Video</button>}
                        </div>
                        <form onSubmit={handleVideoSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="video-id" className="block font-roboto font-bold mb-1">YouTube Video ID</label>
                                <input type="text" id="video-id" name="id" value={videoFormState.id} onChange={handleVideoInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" required disabled={isEditingVideo} />
                            </div>
                            <div>
                                <label htmlFor="video-title" className="block font-roboto font-bold mb-1">Title</label>
                                <input type="text" id="video-title" name="title" value={videoFormState.title} onChange={handleVideoInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" required />
                            </div>
                            {isEditingVideo && (
                                <div>
                                    <label htmlFor="video-description" className="block font-roboto font-bold mb-1">Description</label>
                                    <textarea id="video-description" name="description" value={videoFormState.description} onChange={handleVideoInputChange} rows={4} className="w-full p-2 border-2 border-gray-300 rounded-md" required />
                                </div>
                            )}
                            <div>
                                <label htmlFor="video-transcript" className="block font-roboto font-bold mb-1">Transcript</label>
                                <textarea id="video-transcript" name="transcript" value={videoFormState.transcript} onChange={handleVideoInputChange} rows={8} className="w-full p-2 border-2 border-gray-300 rounded-md" required />
                            </div>
                             {isEditingVideo && (
                                <>
                                    <div className="pt-4 border-t-2 border-gray-200">
                                        <h3 className="font-montserrat text-xl font-black mb-4">SEO Metadata</h3>
                                        <div>
                                            <label htmlFor="video-metaTitle" className="block font-roboto font-bold mb-1">Meta Title</label>
                                            <input type="text" id="video-metaTitle" name="metaTitle" value={videoFormState.metaTitle || ''} onChange={handleVideoInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                                        </div>
                                        <div className="mt-4">
                                            <label htmlFor="video-metaDescription" className="block font-roboto font-bold mb-1">Meta Description</label>
                                            <textarea id="video-metaDescription" name="metaDescription" value={videoFormState.metaDescription || ''} onChange={handleVideoInputChange} rows={3} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t-2 border-gray-200">
                                        <h3 className="font-montserrat text-xl font-black mb-4">Edit FAQs</h3>
                                        {(videoFormState.faqs).map((faq, index) => (
                                            <div key={index} className="p-4 mb-2 bg-white border border-gray-300 rounded-md space-y-2 relative">
                                                <button type="button" onClick={() => handleRemoveItem(index, 'faqs', setVideoFormState)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                                                <label htmlFor={`video-faq-question-${index}`} className="sr-only">FAQ Question {index + 1}</label>
                                                <input id={`video-faq-question-${index}`} type="text" placeholder="Question" value={faq.question} onChange={e => handleNestedChange<FAQItem, Video>(index, 'question', e.target.value, 'faqs', setVideoFormState)} className="w-full p-2 border border-gray-300 rounded-md" />
                                                <label htmlFor={`video-faq-answer-${index}`} className="sr-only">FAQ Answer {index + 1}</label>
                                                <textarea id={`video-faq-answer-${index}`} placeholder="Answer" value={faq.answer} onChange={e => handleNestedChange<FAQItem, Video>(index, 'answer', e.target.value, 'faqs', setVideoFormState)} rows={3} className="w-full p-2 border border-gray-300 rounded-md" />
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => handleAddItem('faqs', setVideoFormState)} className="text-sm font-roboto font-bold text-black hover:underline">+ Add FAQ</button>
                                    </div>
                                    <div className="pt-4 border-t-2 border-gray-200">
                                        <h3 className="font-montserrat text-xl font-black mb-4">Edit Key Moments</h3>
                                        {(videoFormState.keyMoments).map((moment, index) => (
                                            <div key={index} className="p-4 mb-2 bg-white border border-gray-300 rounded-md space-y-2 relative">
                                                <button type="button" onClick={() => handleRemoveItem(index, 'keyMoments', setVideoFormState)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                                                <label htmlFor={`video-moment-label-${index}`} className="sr-only">Key Moment Label {index + 1}</label>
                                                <input id={`video-moment-label-${index}`} type="text" placeholder="Label (e.g., (1:40))" value={moment.label} onChange={e => handleNestedChange<ContentInsight, Video>(index, 'label', e.target.value, 'keyMoments', setVideoFormState)} className="w-full p-2 border border-gray-300 rounded-md" />
                                                <label htmlFor={`video-moment-summary-${index}`} className="sr-only">Key Moment Summary {index + 1}</label>
                                                <textarea id={`video-moment-summary-${index}`} placeholder="Summary" value={moment.summary} onChange={e => handleNestedChange<ContentInsight, Video>(index, 'summary', e.target.value, 'keyMoments', setVideoFormState)} rows={2} className="w-full p-2 border border-gray-300 rounded-md" />
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => handleAddItem('keyMoments', setVideoFormState)} className="text-sm font-roboto font-bold text-black hover:underline">+ Add Key Moment</button>
                                    </div>
                                </>
                            )}
                            <button type="submit" className="bg-black text-white font-roboto font-bold py-3 px-6 rounded-md" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (isEditingVideo ? 'Save Changes' : 'Add Video & Generate')}
                            </button>
                        </form>
                    </div>
                )}
                
                {/* Blog Manager */}
                {activeTab === 'blogs' && (
                     <div className="bg-gray-50 p-8 rounded-b-lg shadow-md mb-12">
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="font-montserrat text-2xl font-black">{isEditingBlog ? 'Edit Blog' : 'Add New Blog'}</h2>
                            {isEditingBlog && <button onClick={resetBlogForm} className="text-sm font-roboto font-bold text-black hover:underline">&#43; Add New Blog</button>}
                        </div>
                        <form onSubmit={handleBlogSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="blog-mediumUrl" className="block font-roboto font-bold mb-1">Medium URL</label>
                                <input type="text" id="blog-mediumUrl" name="mediumUrl" value={blogFormState.mediumUrl} onChange={handleBlogInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label htmlFor="blog-title" className="block font-roboto font-bold mb-1">Title</label>
                                <input type="text" id="blog-title" name="title" value={blogFormState.title} onChange={handleBlogInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" required disabled={isEditingBlog} />
                            </div>
                            {isEditingBlog && (
                                <div>
                                    <label htmlFor="blog-description" className="block font-roboto font-bold mb-1">Description</label>
                                    <textarea id="blog-description" name="description" value={blogFormState.description} onChange={handleBlogInputChange} rows={4} className="w-full p-2 border-2 border-gray-300 rounded-md" required />
                                </div>
                            )}
                            <div>
                                <label htmlFor="blog-content" className="block font-roboto font-bold mb-1">Content</label>
                                <textarea id="blog-content" name="content" value={blogFormState.content} onChange={handleBlogInputChange} rows={8} className="w-full p-2 border-2 border-gray-300 rounded-md" required />
                            </div>
                            {isEditingBlog && (
                                <>
                                    <div className="pt-4 border-t-2 border-gray-200">
                                        <h3 className="font-montserrat text-xl font-black mb-4">SEO Metadata</h3>
                                        <div>
                                            <label htmlFor="blog-metaTitle" className="block font-roboto font-bold mb-1">Meta Title</label>
                                            <input type="text" id="blog-metaTitle" name="metaTitle" value={blogFormState.metaTitle || ''} onChange={handleBlogInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                                        </div>
                                        <div className="mt-4">
                                            <label htmlFor="blog-metaDescription" className="block font-roboto font-bold mb-1">Meta Description</label>
                                            <textarea id="blog-metaDescription" name="metaDescription" value={blogFormState.metaDescription || ''} onChange={handleBlogInputChange} rows={3} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t-2 border-gray-200">
                                        <h3 className="font-montserrat text-xl font-black mb-4">Edit FAQs</h3>
                                        {(blogFormState.faqs).map((faq, index) => (
                                            <div key={index} className="p-4 mb-2 bg-white border border-gray-300 rounded-md space-y-2 relative">
                                                <button type="button" onClick={() => handleRemoveItem(index, 'faqs', setBlogFormState)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                                                <label htmlFor={`blog-faq-question-${index}`} className="sr-only">Blog FAQ Question {index + 1}</label>
                                                <input id={`blog-faq-question-${index}`} type="text" placeholder="Question" value={faq.question} onChange={e => handleNestedChange<FAQItem, Blog>(index, 'question', e.target.value, 'faqs', setBlogFormState)} className="w-full p-2 border border-gray-300 rounded-md" />
                                                <label htmlFor={`blog-faq-answer-${index}`} className="sr-only">Blog FAQ Answer {index + 1}</label>
                                                <textarea id={`blog-faq-answer-${index}`} placeholder="Answer" value={faq.answer} onChange={e => handleNestedChange<FAQItem, Blog>(index, 'answer', e.target.value, 'faqs', setBlogFormState)} rows={3} className="w-full p-2 border border-gray-300 rounded-md" />
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => handleAddItem('faqs', setBlogFormState)} className="text-sm font-roboto font-bold text-black hover:underline">+ Add FAQ</button>
                                    </div>
                                    <div className="pt-4 border-t-2 border-gray-200">
                                        <h3 className="font-montserrat text-xl font-black mb-4">Edit Key Takeaways</h3>
                                        {(blogFormState.keyMoments).map((moment, index) => (
                                            <div key={index} className="p-4 mb-2 bg-white border border-gray-300 rounded-md space-y-2 relative">
                                                <button type="button" onClick={() => handleRemoveItem(index, 'keyMoments', setBlogFormState)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                                                <label htmlFor={`blog-takeaway-label-${index}`} className="sr-only">Key Takeaway Label {index + 1}</label>
                                                <input id={`blog-takeaway-label-${index}`} type="text" placeholder="Label (e.g., The Magic of useState)" value={moment.label} onChange={e => handleNestedChange<ContentInsight, Blog>(index, 'label', e.target.value, 'keyMoments', setBlogFormState)} className="w-full p-2 border border-gray-300 rounded-md" />
                                                <label htmlFor={`blog-takeaway-summary-${index}`} className="sr-only">Key Takeaway Summary {index + 1}</label>
                                                <textarea id={`blog-takeaway-summary-${index}`} placeholder="Summary" value={moment.summary} onChange={e => handleNestedChange<ContentInsight, Blog>(index, 'summary', e.target.value, 'keyMoments', setBlogFormState)} rows={2} className="w-full p-2 border border-gray-300 rounded-md" />
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => handleAddItem('keyMoments', setBlogFormState)} className="text-sm font-roboto font-bold text-black hover:underline">+ Add Key Takeaway</button>
                                    </div>
                                </>
                            )}
                            <button type="submit" className="bg-black text-white font-roboto font-bold py-3 px-6 rounded-md" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (isEditingBlog ? 'Save Changes' : 'Add Blog & Generate')}
                            </button>
                        </form>
                    </div>
                )}

                {/* Lists of Existing Content */}
                <div>
                     {activeTab === 'videos' && (
                        <div>
                             <h2 className="font-montserrat text-2xl font-black mb-6">Manage Existing Videos</h2>
                             <div className="space-y-4">
                                {videos.length > 0 ? [...videos].reverse().map(video => (
                                    <div key={video.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex justify-between items-center">
                                        <div>
                                            <h3 className="font-roboto font-bold">{video.title}</h3>
                                            <p className="text-sm text-gray-600">ID: {video.id}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEditVideoClick(video)} className="bg-blue-600 text-white font-roboto font-bold py-2 px-4 rounded-md">Edit</button>
                                            <button onClick={() => deleteVideo(video.id)} className="bg-red-600 text-white font-roboto font-bold py-2 px-4 rounded-md">Delete</button>
                                        </div>
                                    </div>
                                )) : <p>No videos found.</p>}
                            </div>
                        </div>
                    )}
                    {activeTab === 'blogs' && (
                        <div>
                            <h2 className="font-montserrat text-2xl font-black mb-6">Manage Existing Blogs</h2>
                            <div className="space-y-4">
                                {blogs.length > 0 ? [...blogs].reverse().map(blog => (
                                    <div key={blog.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex justify-between items-center">
                                        <div>
                                            <h3 className="font-roboto font-bold">{blog.title}</h3>
                                            <p className="text-sm text-gray-600">ID: {blog.id}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEditBlogClick(blog)} className="bg-blue-600 text-white font-roboto font-bold py-2 px-4 rounded-md">Edit</button>
                                            <button onClick={() => deleteBlog(blog.id)} className="bg-red-600 text-white font-roboto font-bold py-2 px-4 rounded-md">Delete</button>
                                        </div>
                                    </div>
                                )) : <p>No blogs found.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AdminPage;