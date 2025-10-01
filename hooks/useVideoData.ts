import { useState, useEffect, useCallback } from 'react';
import type { Video, FAQItem } from '../types';
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

  const addVideo = useCallback(async (newVideo: Omit<Video, 'description' | 'faqs'>): Promise<boolean> => {
    if (!newVideo.id || !newVideo.title || !newVideo.transcript) {
        alert("Video ID, Title, and Transcript are required.");
        return false;
    }
    const videoExists = videos.some(video => video.id === newVideo.id);
    if (videoExists) {
        alert("A video with this ID already exists.");
        return false;
    }

    try {
        const prompt = `Based on the following video title and transcript, perform two tasks:
1.  **Generate Description:** Create a concise and compelling one-paragraph description. This description will be shown in a list of videos, so it should be engaging and accurately summarize the video's content.
2.  **Generate FAQs:** Create an initial list of 3-5 frequently asked questions (FAQs) with detailed answers based on the video's content.

Return the result as a single, valid JSON object with two keys: "description" (a string) and "faqs" (an array of objects, where each object has "question" and "answer" string keys). Do not add any introductory text or markdown formatting.

Video Title: "${newVideo.title}"

Transcript:
---
${newVideo.transcript}
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
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("AI API Error Response:", errorBody);
            throw new Error(`AI API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const jsonContent = data.choices[0].message.content;

        const extractJsonString = (str: string): string | null => {
            const match = str.match(/\{[\s\S]*\}/);
            return match ? match[0] : null;
        };

        const extractedJsonStr = extractJsonString(jsonContent);
        if (!extractedJsonStr) {
            console.error("Could not extract JSON from AI response:", jsonContent);
            throw new Error("AI response did not contain valid JSON.");
        }

        const { description, faqs } = JSON.parse(extractedJsonStr);

        if (!description || !faqs || faqs.length === 0) {
            throw new Error("AI returned incomplete data (description or FAQs missing).");
        }

        const videoWithGeneratedContent: Video = {
            ...newVideo,
            description,
            faqs,
        };

        const updatedVideos = [...videos, videoWithGeneratedContent];
        persistVideos(updatedVideos);
        alert("Video added successfully! Description and initial FAQs were generated automatically.");
        return true;

    } catch (error) {
        console.error('Failed to add video:', error);
        alert("An unexpected error occurred while generating video content. Please check the console and try again.");
        return false;
    }
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