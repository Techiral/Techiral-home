import React, { useState, useEffect } from 'react';
import { useVideoData } from '../hooks/useVideoData';
import { useAuth } from '../hooks/useAuth';
import type { Video, FAQItem } from '../types';

const AdminPage: React.FC = () => {
    const { videos, addVideo, updateVideo, deleteVideo } = useVideoData();
    const { logout } = useAuth();

    const initialFormState: Video = { id: '', title: '', description: '', transcript: '' };
    const [formState, setFormState] = useState<Video>(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // For non-disruptive notifications
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleEditClick = (video: Video) => {
        setIsEditing(true);
        setFormState(video);
        setNotification(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const resetForm = () => {
        setIsEditing(false);
        setFormState(initialFormState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setNotification(null);

        try {
            // Step 1: Generate FAQs via the secure API
            const faqResponse = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'generate-faq',
                    payload: {
                        title: formState.title,
                        transcript: formState.transcript
                    }
                })
            });

            if (!faqResponse.ok) {
                throw new Error('Failed to generate AI-powered FAQs.');
            }

            const faqData = await faqResponse.json();
            const videoWithFaqs: Video = { ...formState, faqs: faqData.faqs || [] };

            // Step 2: Save the complete video data (including FAQs)
            let success = false;
            if (isEditing) {
                success = updateVideo(videoWithFaqs.id, videoWithFaqs);
                if (success) setNotification({ type: 'success', message: 'Video updated successfully!' });
            } else {
                success = addVideo(videoWithFaqs);
                if (success) setNotification({ type: 'success', message: 'Video added successfully!' });
            }

            if (success) {
                resetForm();
            } else {
                // This case handles validation errors from useVideoData hook (e.g., duplicate ID)
                if (!isEditing && videos.some(v => v.id === formState.id)) {
                     setNotification({ type: 'error', message: "A video with this ID already exists." });
                } else {
                     setNotification({ type: 'error', message: "Failed to save the video." });
                }
            }
        } catch (error) {
            console.error("Error during save:", error);
            setNotification({ type: 'error', message: 'An AI error occurred. Please try saving again.' });
        } finally {
            setIsSaving(false);
        }
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
                
                {/* Notification Area */}
                {notification && (
                    <div className={`p-4 mb-6 rounded-md text-white font-bold ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {notification.message}
                    </div>
                )}

                {/* Video Editor Form */}
                <div className="bg-gray-50 p-8 rounded-lg shadow-md mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-montserrat text-2xl font-black">{isEditing ? 'Edit Video' : 'Add New Video'}</h2>
                        {isEditing && (
                             <button onClick={() => { resetForm(); setNotification(null); }} className="text-sm font-roboto font-bold text-black hover:underline">
                                &#43; Add New Video
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="id" className="block font-roboto font-bold mb-1">YouTube Video ID</label>
                            <input type="text" name="id" id="id" value={formState.id} onChange={handleInputChange} placeholder="e.g., 72KcZewI0Ns" className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" required disabled={isEditing || isSaving} />
                        </div>
                        <div>
                            <label htmlFor="title" className="block font-roboto font-bold mb-1">Title</label>
                            <input type="text" name="title" id="title" value={formState.title} onChange={handleInputChange} className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" required disabled={isSaving} />
                        </div>
                        <div>
                            <label htmlFor="description" className="block font-roboto font-bold mb-1">Description</label>
                            <textarea name="description" id="description" value={formState.description} onChange={handleInputChange} rows={3} className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" disabled={isSaving}></textarea>
                        </div>
                        <div>
                            <label htmlFor="transcript" className="block font-roboto font-bold mb-1">Transcript</label>
                            <textarea name="transcript" id="transcript" value={formState.transcript} onChange={handleInputChange} rows={8} className="w-full p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" required disabled={isSaving}></textarea>
                        </div>
                        <button type="submit" className="bg-black text-white font-roboto font-bold py-3 px-6 rounded-md hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-400" disabled={isSaving}>
                           {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Video & Generate AI FAQs')}
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