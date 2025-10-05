import React, { useState } from 'react';
import { useVideoData } from '../hooks/useVideoData';
import { useBlogData } from '../hooks/useBlogData';
import { useLinkData } from '../hooks/useLinkData';
import { useAuth } from '../hooks/useAuth';
import type { Video, Blog, FAQItem, ContentInsight, Link } from '../types';

type AdminTab = 'videos' | 'blogs' | 'links';

const AdminPage: React.FC = () => {
    const { videos, addVideo, updateVideo, deleteVideo } = useVideoData();
    const { blogs, addBlog, updateBlog, deleteBlog } = useBlogData();
    const { links, addLink, updateLink, deleteLink } = useLinkData();
    const { logout } = useAuth();
    
    const [activeTab, setActiveTab] = useState<AdminTab>('videos');

    // Form states
    const initialVideoFormState: Video = { id: '', title: '', description: '', transcript: '', faqs: [], keyMoments: [], metaTitle: '', metaDescription: '' };
    const [videoFormState, setVideoFormState] = useState<Video>(initialVideoFormState);
    const [isEditingVideo, setIsEditingVideo] = useState(false);
    
    const initialBlogFormState: Blog = { id: '', mediumUrl: '', title: '', description: '', content: '', faqs: [], keyMoments: [], metaTitle: '', metaDescription: '', thumbnailUrl: '' };
    const [blogFormState, setBlogFormState] = useState<Blog>(initialBlogFormState);
    const [isEditingBlog, setIsEditingBlog] = useState(false);

    const initialLinkFormState: Link = { id: '', title: '', url: '', description: '', order: 0 };
    const [linkFormState, setLinkFormState] = useState<Link>(initialLinkFormState);
    const [isEditingLink, setIsEditingLink] = useState(false);

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
    
    // Video handlers
    const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setVideoFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleEditVideoClick = (video: Video) => {
        setIsEditingVideo(true);
        setVideoFormState({ ...video, faqs: video.faqs || [], keyMoments: video.keyMoments || [] });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetVideoForm = () => {
        setIsEditingVideo(false);
        setVideoFormState(initialVideoFormState);
    };

    const handleVideoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        let success = isEditingVideo
            ? await updateVideo(videoFormState.id, { ...videoFormState, faqs: videoFormState.faqs || [], keyMoments: videoFormState.keyMoments || [] })
            : await addVideo({ id: videoFormState.id, title: videoFormState.title, transcript: videoFormState.transcript });
        if (success) resetVideoForm();
        setIsSubmitting(false);
    };

    // Blog handlers
    const handleBlogInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBlogFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleEditBlogClick = (blog: Blog) => {
        setIsEditingBlog(true);
        setBlogFormState({ ...blog, faqs: blog.faqs || [], keyMoments: blog.keyMoments || [] });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetBlogForm = () => {
        setIsEditingBlog(false);
        setBlogFormState(initialBlogFormState);
    };

    const handleBlogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        let success = isEditingBlog
            ? await updateBlog(blogFormState.id, { ...blogFormState, faqs: blogFormState.faqs || [], keyMoments: blogFormState.keyMoments || [] })
            : await addBlog({ mediumUrl: blogFormState.mediumUrl, title: blogFormState.title, content: blogFormState.content, thumbnailUrl: blogFormState.thumbnailUrl });
        if (success) resetBlogForm();
        setIsSubmitting(false);
    };

    // Link handlers
    const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? parseInt(value, 10) : value;
        setLinkFormState(prev => ({ ...prev, [name]: val }));
    };

    const handleEditLinkClick = (link: Link) => {
        setIsEditingLink(true);
        setLinkFormState(link);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetLinkForm = () => {
        setIsEditingLink(false);
        setLinkFormState(initialLinkFormState);
    };

    const handleLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = isEditingLink
            ? await updateLink(linkFormState.id, linkFormState)
            : await addLink(linkFormState);
        if (success) resetLinkForm();
        setIsSubmitting(false);
    };

    const TabButton: React.FC<{ tab: AdminTab, children: React.ReactNode }> = ({ tab, children }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 sm:px-6 font-roboto font-bold rounded-t-lg transition-colors duration-300 ${activeTab === tab ? 'bg-gray-50 text-black' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
            {children}
        </button>
    );

    return (
        <section className="bg-white text-black py-16 sm:py-20 md:py-24 px-4 sm:px-6 min-h-screen">
            <div className="container mx-auto max-w-4xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <h1 className="font-montserrat text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-0">Admin Panel</h1>
                    <button onClick={logout} className="bg-gray-700 text-white font-roboto font-bold py-2 px-4 rounded-md hover:bg-black transition-colors duration-300">
                        Logout
                    </button>
                </div>
                
                <div className="flex border-b-2 border-gray-300">
                    <TabButton tab="videos">Manage Videos</TabButton>
                    <TabButton tab="blogs">Manage Blogs</TabButton>
                    <TabButton tab="links">Manage Links</TabButton>
                </div>

                {activeTab === 'videos' && (
                    <div className="bg-gray-50 p-4 sm:p-8 rounded-b-lg shadow-md mb-12">
                        <h2 className="font-montserrat text-xl sm:text-2xl font-black">{isEditingVideo ? 'Edit Video' : 'Add New Video'}</h2>
                        {isEditingVideo && <button onClick={resetVideoForm} className="text-sm font-roboto font-bold text-black hover:underline mb-6">&#43; Add New Video</button>}
                        <form onSubmit={handleVideoSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="video-id" className="block font-roboto font-bold mb-1">Video ID (YouTube)</label>
                                <input type="text" id="video-id" name="id" value={videoFormState.id} onChange={handleVideoInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label htmlFor="video-title" className="block font-roboto font-bold mb-1">Title</label>
                                <input type="text" id="video-title" name="title" value={videoFormState.title} onChange={handleVideoInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label htmlFor="video-description" className="block font-roboto font-bold mb-1">Description</label>
                                <textarea id="video-description" name="description" value={videoFormState.description} onChange={handleVideoInputChange} rows={5} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="video-transcript" className="block font-roboto font-bold mb-1">Transcript</label>
                                <textarea id="video-transcript" name="transcript" value={videoFormState.transcript} onChange={handleVideoInputChange} rows={10} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                            </div>
                            <div className="border-t-2 border-gray-200 pt-6">
                                <h3 className="font-montserrat text-lg font-black mb-4">SEO</h3>
                                <div>
                                    <label htmlFor="video-metaTitle" className="block font-roboto font-bold mb-1">Meta Title</label>
                                    <input type="text" id="video-metaTitle" name="metaTitle" value={videoFormState.metaTitle} onChange={handleVideoInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="video-metaDescription" className="block font-roboto font-bold mb-1">Meta Description</label>
                                    <textarea id="video-metaDescription" name="metaDescription" value={videoFormState.metaDescription} onChange={handleVideoInputChange} rows={3} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                                </div>
                            </div>
                            <button type="submit" className="bg-black text-white font-roboto font-bold py-3 px-6 rounded-md" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (isEditingVideo ? 'Save Changes' : 'Add Video')}
                            </button>
                        </form>
                    </div>
                )}
                
                {activeTab === 'blogs' && (
                     <div className="bg-gray-50 p-4 sm:p-8 rounded-b-lg shadow-md mb-12">
                        <h2 className="font-montserrat text-xl sm:text-2xl font-black">{isEditingBlog ? 'Edit Blog' : 'Add New Blog'}</h2>
                        {isEditingBlog && <button onClick={resetBlogForm} className="text-sm font-roboto font-bold text-black hover:underline mb-6">&#43; Add New Blog</button>}
                        <form onSubmit={handleBlogSubmit} className="space-y-6">
                            {!isEditingBlog && (
                                <div>
                                    <label htmlFor="blog-mediumUrl" className="block font-roboto font-bold mb-1">Medium URL</label>
                                    <input type="text" id="blog-mediumUrl" name="mediumUrl" value={blogFormState.mediumUrl} onChange={handleBlogInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                                    <p className="text-sm text-gray-500 mt-1">Fill this to fetch content from Medium.</p>
                                </div>
                            )}
                            <div>
                                <label htmlFor="blog-title" className="block font-roboto font-bold mb-1">Title</label>
                                <input type="text" id="blog-title" name="title" value={blogFormState.title} onChange={handleBlogInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label htmlFor="blog-description" className="block font-roboto font-bold mb-1">Description</label>
                                <textarea id="blog-description" name="description" value={blogFormState.description} onChange={handleBlogInputChange} rows={5} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="blog-content" className="block font-roboto font-bold mb-1">Content (HTML)</label>
                                <textarea id="blog-content" name="content" value={blogFormState.content} onChange={handleBlogInputChange} rows={15} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                            </div>
                             <div>
                                <label htmlFor="blog-thumbnailUrl" className="block font-roboto font-bold mb-1">Thumbnail URL</label>
                                <input type="text" id="blog-thumbnailUrl" name="thumbnailUrl" value={blogFormState.thumbnailUrl} onChange={handleBlogInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                            </div>
                            <div className="border-t-2 border-gray-200 pt-6">
                                <h3 className="font-montserrat text-lg font-black mb-4">SEO</h3>
                                <div>
                                    <label htmlFor="blog-metaTitle" className="block font-roboto font-bold mb-1">Meta Title</label>
                                    <input type="text" id="blog-metaTitle" name="metaTitle" value={blogFormState.metaTitle} onChange={handleBlogInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="blog-metaDescription" className="block font-roboto font-bold mb-1">Meta Description</label>
                                    <textarea id="blog-metaDescription" name="metaDescription" value={blogFormState.metaDescription} onChange={handleBlogInputChange} rows={3} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                                </div>
                            </div>
                            <button type="submit" className="bg-black text-white font-roboto font-bold py-3 px-6 rounded-md" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (isEditingBlog ? 'Save Changes' : 'Add Blog')}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'links' && (
                    <div className="bg-gray-50 p-4 sm:p-8 rounded-b-lg shadow-md mb-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-montserrat text-xl sm:text-2xl font-black">{isEditingLink ? 'Edit Link' : 'Add New Link'}</h2>
                            {isEditingLink && <button onClick={resetLinkForm} className="text-sm font-roboto font-bold text-black hover:underline">&#43; Add New Link</button>}
                        </div>
                        <form onSubmit={handleLinkSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="link-title" className="block font-roboto font-bold mb-1">Title</label>
                                <input type="text" id="link-title" name="title" value={linkFormState.title} onChange={handleLinkInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label htmlFor="link-url" className="block font-roboto font-bold mb-1">URL</label>
                                <input type="text" id="link-url" name="url" value={linkFormState.url} onChange={handleLinkInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label htmlFor="link-description" className="block font-roboto font-bold mb-1">Description</label>
                                <textarea id="link-description" name="description" value={linkFormState.description} onChange={handleLinkInputChange} rows={3} className="w-full p-2 border-2 border-gray-300 rounded-md" />
                            </div>
                             <div>
                                <label htmlFor="link-order" className="block font-roboto font-bold mb-1">Order</label>
                                <input type="number" id="link-order" name="order" value={linkFormState.order} onChange={handleLinkInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md" required />
                            </div>
                            <button type="submit" className="bg-black text-white font-roboto font-bold py-3 px-6 rounded-md" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (isEditingLink ? 'Save Changes' : 'Add Link')}
                            </button>
                        </form>
                    </div>
                )}

                <div>
                     {activeTab === 'videos' && (
                        <div>
                             <h2 className="font-montserrat text-xl sm:text-2xl font-black mb-6">Manage Existing Videos</h2>
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
                            <h2 className="font-montserrat text-xl sm:text-2xl font-black mb-6">Manage Existing Blogs</h2>
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
                    {activeTab === 'links' && (
                        <div>
                            <h2 className="font-montserrat text-xl sm:text-2xl font-black mb-6">Manage Existing Links</h2>
                            <div className="space-y-4">
                                {links.length > 0 ? [...links].sort((a, b) => a.order - b.order).map(link => (
                                    <div key={link.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex justify-between items-center">
                                        <div>
                                            <h3 className="font-roboto font-bold">{link.title}</h3>
                                            <p className="text-sm text-gray-600">{link.url}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEditLinkClick(link)} className="bg-blue-600 text-white font-roboto font-bold py-2 px-4 rounded-md">Edit</button>
                                            <button onClick={() => deleteLink(link.id)} className="bg-red-600 text-white font-roboto font-bold py-2 px-4 rounded-md">Delete</button>
                                        </div>
                                    </div>
                                )) : <p>No links found.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AdminPage;
