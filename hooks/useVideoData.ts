import { useState, useEffect, useCallback } from 'react';
import type { Video } from '../types';
import { SEED_VIDEOS_DATA } from '../constants';

const LOCAL_STORAGE_KEY = 'techiral_videos';

// Ensure seed data conforms to the new Video type
const getInitialVideos = (): Video[] => {
    return SEED_VIDEOS_DATA.map(video => ({
        ...video,
        keyMoments: video.keyMoments || [],
        faqs: video.faqs || [],
        description: video.description || '',
        metaTitle: video.metaTitle || video.title,
        metaDescription: video.metaDescription || video.description.substring(0, 160),
    }));
};


export const useVideoData = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    try {
      const storedVideos = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedVideos) {
        setVideos(JSON.parse(storedVideos));
      } else {
        // If no videos are in storage, seed with initial data
        const initialData = getInitialVideos();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
        setVideos(initialData);
      }
    } catch (error) {
      console.error('Failed to load videos from local storage:', error);
      // Fallback to seed data in case of parsing errors
      setVideos(getInitialVideos());
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

  const addVideo = useCallback(async (newVideoData: Pick<Video, 'id' | 'title' | 'transcript'>): Promise<boolean> => {
    if (!newVideoData.id || !newVideoData.title || !newVideoData.transcript) {
        alert("Video ID, Title, and Transcript are required.");
        return false;
    }
    const videoExists = videos.some(video => video.id === newVideoData.id);
    if (videoExists) {
        alert("A video with this ID already exists.");
        return false;
    }

    try {
        const prompt = `You are an expert technical writer and content strategist for the YouTube channel 'Techiral'. Your task is to analyze a video transcript and generate a comprehensive set of metadata to enhance its presentation and discoverability. Your knowledge is strictly limited to the provided transcript.

Based on the following video title and transcript, perform these four tasks:

1.  **Generate Description:** Write an engaging, one-paragraph summary for the "About this video" section. It should hook the reader, explain the problem the video solves, and highlight the key takeaways or methods taught.

2.  **Generate FAQs:** Create a list of 3-5 insightful FAQs that a curious developer might ask after watching. Questions should address potential ambiguities or explore related concepts mentioned in the video. Answers must be detailed, practical, and directly supported by the transcript.

3.  **Identify Key Moments:** Identify the most crucial segments. For each, provide the exact timestamp (e.g., "(1:40)") and a concise, action-oriented summary that clearly states the main point or takeaway of that segment.

4.  **Generate SEO Metadata:**
    - metaTitle: A compelling title under 60 characters that is descriptive and highly clickable.
    - metaDescription: An enticing summary under 160 characters that encourages users to click through from a search engine results page.

Return ONLY a single, valid JSON object with five top-level keys: "description", "faqs", "keyMoments", "metaTitle", and "metaDescription". The structure must be:
{
  "description": "string",
  "faqs": [{ "question": "string", "answer": "string" }],
  "keyMoments": [{ "label": "string", "summary": "string" }],
  "metaTitle": "string",
  "metaDescription": "string"
}

Video Title: "${newVideoData.title}"

Transcript:
---
${newVideoData.transcript}
---
`;
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

        const { description, faqs, keyMoments, metaTitle, metaDescription } = JSON.parse(extractedJsonStr);

        if (!description || !faqs || !keyMoments || !metaTitle || !metaDescription) {
            throw new Error("AI returned incomplete data (description, FAQs, key moments, or SEO metadata missing).");
        }

        const completeVideo: Video = {
            ...newVideoData,
            description,
            faqs,
            keyMoments,
            metaTitle,
            metaDescription,
        };

        const updatedVideos = [...videos, completeVideo];
        persistVideos(updatedVideos);
        alert("Video added successfully! All content, including SEO metadata, was generated automatically.");
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