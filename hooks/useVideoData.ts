import { useState, useEffect, useCallback } from 'react';
import type { Video } from '../types';
import { SEED_VIDEOS_DATA } from '../constants';

const LOCAL_STORAGE_KEY = 'techiral_videos';

export const useVideoData = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    try {
      const storedVideos = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedVideos) {
        setVideos(JSON.parse(storedVideos));
      } else {
        // If no videos are in storage, seed with initial data
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_VIDEOS_DATA));
        setVideos(SEED_VIDEOS_DATA);
      }
    } catch (error) {
      console.error('Failed to load videos from local storage:', error);
      // Fallback to seed data in case of parsing errors
      setVideos(SEED_VIDEOS_DATA);
    }
  }, []);

  const persistVideos = (newVideos: Video[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newVideos));
      setVideos(newVideos);
    } catch (error)
      {
      console.error('Failed to save videos to local storage:', error);
    }
  };

  const addVideo = useCallback((newVideo: Video) => {
    if (!newVideo.id || !newVideo.title || !newVideo.transcript) {
        alert("Video ID, Title, and Transcript are required.");
        return false;
    }
    const videoExists = videos.some(video => video.id === newVideo.id);
    if (videoExists) {
        alert("A video with this ID already exists.");
        return false;
    }
    const updatedVideos = [...videos, newVideo];
    persistVideos(updatedVideos);
    return true;
  }, [videos]);

  const updateVideo = useCallback((videoId: string, updatedVideoData: Video) => {
    const videoExists = videos.some(video => video.id === videoId);
    if (!videoExists) {
      alert("Cannot update a video that doesn't exist.");
      return false;
    }
    const updatedVideos = videos.map(video =>
      video.id === videoId ? updatedVideoData : video
    );
    persistVideos(updatedVideos);
    return true;
  }, [videos]);

  const deleteVideo = useCallback((videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
        const updatedVideos = videos.filter(video => video.id !== videoId);
        persistVideos(updatedVideos);
    }
  }, [videos]);

  return { videos, addVideo, updateVideo, deleteVideo };
};