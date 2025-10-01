import React, { useState } from 'react';
import { useVideoData } from '../hooks/useVideoData';
import { useAuth } from '../hooks/useAuth';
import type { Video, FAQItem, KeyMoment } from '../types';

const AdminPage: React.FC = () => {
    const { videos, addVideo, updateVideo, deleteVideo } = useVideoData();
    const { logout } = useAuth();

    const initialFormState: Video = { id: '', title: '', description: '', transcript: '', faqs: [], keyMoments: [], metaTitle: '', metaDescription: '' };
    const [formState, setFormState] = useState<Video>(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNestedChange = <T extends FAQItem | KeyMoment>(
        index: number,
        field: keyof T,
        value: string,
        arrayName: 'faqs' | 'keyMoments'
    ) => {
        const newArray = [...(formState[arrayName] || [])] as T[];
        newArray[index] = { ...newArray[index], [field]: value };
        setFormState(prev => ({ ...prev, [arrayName]: newArray }));
    };
    
    const handleAddItem = (arrayName: 'faqs' | 'keyMoments') => {
        const newItem = arrayName === 'faqs' ? { question: '', answer: '' } : { timestamp: '', summary: '' };
        setFormState(prev => ({ ...prev, [arrayName]: [...(prev[arrayName] || []), newItem] }));
    };

    const handleRemoveItem = (index: number, arrayName: 'faqs' | 'keyMoments') => {
        const newArray = (formState[arrayName] || []).filter((_, i) => i !== index);
        setFormState(prev => ({ ...prev, [arrayName]: newArray }));
    };

    const handleEditClick = (video: Video) => {
        setIsEditing(true);
        setFormState(video);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const resetForm = () => {
        setIsEditing(false);
        setFormState(initialFormState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        let success = false;
        if (isEditing) {
            // Ensure arrays exist before saving to prevent persisting undefined
            const videoToUpdate = {
                ...formState,
                faqs: formState.faqs || [],
                keyMoments: formState.keyMoments || [],
            };
            success = updateVideo(videoToUpdate.id, videoToUpdate);
            if (success) alert("Video updated successfully!");
        } else {
            const { id, title, transcript } = formState;
            success = await addVideo({ id, title, transcript });
        }
        if (success) {
            resetForm();
        }
        setIsSubmitting(false);
    };

    return (
        <section className="bg-white text-black py-20 md:py-24 px-6 min-h-screen">
            <div className="container mx-auto max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="font-montserrat text-4xl md:text-5xl font-black">Admin Panel</h1>
                    <button onClick={logout} className="bg-gray-700 text-white font-roboto font-bold py-2 px-4 rounded-md hover:bg-black transition-colors duration-300">
                        Logout
                    </button>
                </div>

                {/* Video Editor Form */}
                <div className="bg-gray-50 p-8 rounded-lg shadow-md mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-montserrat text-2xl font-black">{isEditing ? 'Edit Video' : 'Add New Video'}</h2>
                        {isEditing && (
                             <button onClick={resetForm} className="text-sm font-roboto font-bold text-black hover:underline">
                                &#43; Add New Video
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="id" className="block font-roboto font-bold mb-1">YouTube Video ID</label>
                            <input type="text" name="id" id="id" value={formState.id} onChange={handleInputChange} placeholder="e.g., 72KcZewI0Ns" className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" required disabled={isEditing} />
                        </div>
                        <div>
                            <label htmlFor="title" className="block font-roboto font-bold mb-1">Title</label>
                            <input type="text" name="title" id="title" value={formState.title} onChange={handleInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" required />
                        </div>
                        {isEditing && (
                             <div>
                                <label htmlFor="description" className="block font-roboto font-bold mb-1">AI-Generated Description</label>
                                <textarea name="description" id="description" value={formState.description} onChange={handleInputChange} rows={4} className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" required></textarea>
                            </div>
                        )}
                        <div>
                            <label htmlFor="transcript" className="block font-roboto font-bold mb-1">Transcript</label>
                            <textarea name="transcript" id="transcript" value={formState.transcript} onChange={handleInputChange} rows={8} className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" required></textarea>
                        </div>
                        
                        {isEditing && (
                            <>
                                {/* SEO Metadata Editor */}
                                <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                                    <h3 className="font-montserrat text-xl font-black">SEO Metadata</h3>
                                    <div>
                                        <label htmlFor="metaTitle" className="block font-roboto font-bold mb-1">Meta Title</label>
                                        <input type="text" name="metaTitle" id="metaTitle" value={formState.metaTitle || ''} onChange={handleInputChange} placeholder="SEO-friendly title (under 60 characters)" className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
                                    </div>
                                    <div>
                                        <label htmlFor="metaDescription" className="block font-roboto font-bold mb-1">Meta Description</label>
                                        <textarea name="metaDescription" id="metaDescription" value={formState.metaDescription || ''} onChange={handleInputChange} rows={3} placeholder="SEO-friendly description (under 160 characters)" className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"></textarea>
                                    </div>
                                </div>

                                {/* FAQs Editor */}
                                <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                                    <h3 className="font-montserrat text-xl font-black">Edit FAQs</h3>
                                    {(formState.faqs || []).map((faq, index) => (
                                        <div key={index} className="p-4 bg-white border border-gray-300 rounded-md space-y-2 relative">
                                            <button type="button" onClick={() => handleRemoveItem(index, 'faqs')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                                            <input type="text" placeholder="Question" value={faq.question} onChange={e => handleNestedChange<FAQItem>(index, 'question', e.target.value, 'faqs')} className="w-full p-2 border border-gray-300 rounded-md" />
                                            <textarea placeholder="Answer" value={faq.answer} onChange={e => handleNestedChange<FAQItem>(index, 'answer', e.target.value, 'faqs')} rows={3} className="w-full p-2 border border-gray-300 rounded-md" />
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => handleAddItem('faqs')} className="text-sm font-roboto font-bold text-black hover:underline">+ Add FAQ</button>
                                </div>

                                 {/* Key Moments Editor */}
                                <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                                    <h3 className="font-montserrat text-xl font-black">Edit Key Moments</h3>
                                    {(formState.keyMoments || []).map((moment, index) => (
                                        <div key={index} className="p-4 bg-white border border-gray-300 rounded-md space-y-2 relative">
                                             <button type="button" onClick={() => handleRemoveItem(index, 'keyMoments')} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                                            <input type="text" placeholder="Timestamp (e.g., 1:40)" value={moment.timestamp} onChange={e => handleNestedChange<KeyMoment>(index, 'timestamp', e.target.value, 'keyMoments')} className="w-full p-2 border border-gray-300 rounded-md" />
                                            <textarea placeholder="Summary" value={moment.summary} onChange={e => handleNestedChange<KeyMoment>(index, 'summary', e.target.value, 'keyMoments')} rows={2} className="w-full p-2 border border-gray-300 rounded-md" />
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => handleAddItem('keyMoments')} className="text-sm font-roboto font-bold text-black hover:underline">+ Add Key Moment</button>
                                </div>
                            </>
                        )}
                        
                        <button type="submit" className="bg-black text-white font-roboto font-bold py-3 px-6 rounded-md hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-500" disabled={isSubmitting}>
                           {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Video & Generate Content')}
                        </button>
                    </form>
                </div>

                {/* Existing Videos List */}
                <div>
                    <h2 className="font-montserrat text-2xl font-black mb-6">Manage Existing Videos</h2>
                    <div className="space-y-4">
                        {videos.length > 0 ? [...videos].reverse().map(video => (
                            <div key={video.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                <div className="mb-4 sm:mb-0">
                                    <h3 className="font-roboto font-bold">{video.title}</h3>
                                    <p className="text-sm text-gray-600">ID: {video.id}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEditClick(video)} className="bg-blue-600 text-white font-roboto font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300">
                                        Edit
                                    </button>
                                    <button onClick={() => deleteVideo(video.id)} className="bg-red-600 text-white font-roboto font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-300">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-600 text-center py-4">No videos found. Add one above to get started.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AdminPage;