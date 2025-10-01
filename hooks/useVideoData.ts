import { useState, useEffect, useCallback } from 'react';
import type { Video } from '../types';
import { supabase } from '../lib/supabaseClient';

export const useVideoData = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase.from('videos').select('*');
        if (error) {
          throw error;
        }
        setVideos(data || []);
      } catch (error) {
        console.error('Failed to load videos from Supabase:', error);
      }
    };

    fetchVideos();
  }, []);

  const addVideo = useCallback(async (newVideoData: Pick<Video, 'id' | 'title' | 'transcript'>): Promise<boolean> => {
    if (!newVideoData.id || !newVideoData.title || !newVideoData.transcript) {
        alert("Video ID, Title, and Transcript are required.");
        return false;
    }
    const { data: existingVideos, error: fetchError } = await supabase
      .from('videos')
      .select('id')
      .eq('id', newVideoData.id);

    if (fetchError) {
      console.error('Error checking for existing video:', fetchError);
      alert('Error checking for existing video.');
      return false;
    }
      
    if (existingVideos && existingVideos.length > 0) {
        alert("A video with this ID already exists.");
        return false;
    }

    try {
        const prompt = `You are an expert technical writer and content strategist for the YouTube channel 'Techiral'. Your task is to analyze a video transcript and generate a comprehensive set of metadata to enhance its presentation and discoverability. Your knowledge is strictly limited to the provided transcript.\n\nBased on the following video title and transcript, perform these four tasks:\n\n1.  **Generate Description:** Write an engaging, one-paragraph summary for the \"About this video\" section. It should hook the reader, explain the problem the video solves, and highlight the key takeaways or methods taught.\n\n2.  **Generate FAQs:** Create a list of 3-5 insightful FAQs that a curious developer might ask after watching. Questions should address potential ambiguities or explore related concepts mentioned in the video. Answers must be detailed, practical, and directly supported by the transcript.\n\n3.  **Identify Key Moments:** Identify the most crucial segments. For each, provide the exact timestamp (e.g., \"(1:40)\") and a concise, action-oriented summary that clearly states the main point or takeaway of that segment.\n\n4.  **Generate SEO Metadata:**\n    - metaTitle: A compelling title under 60 characters that is descriptive and highly clickable.\n    - metaDescription: An enticing summary under 160 characters that encourages users to click through from a search engine results page.\n\nReturn ONLY a single, valid JSON object with five top-level keys: \"description\", \"faqs\", \"keyMoments\", \"metaTitle\", and \"metaDescription\". The structure must be:\n{\n  \"description\": \"string\",\n  \"faqs\": [{ \"question\": \"string\", \"answer\": \"string\" }],\n  \"keyMoments\": [{ \"label\": \"string\", \"summary\": \"string\" }],\n  \"metaTitle\": \"string\",\n  \"metaDescription\": \"string\"\n}\n\nVideo Title: \"${newVideoData.title}\"\n\nTranscript:\n---\n${newVideoData.transcript}\n---\n`;
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

        const { error: insertError } = await supabase.from('videos').insert([completeVideo]);
        if (insertError) {
          throw insertError;
        }

        setVideos(prevVideos => [...prevVideos, completeVideo]);
        alert("Video added successfully! All content, including SEO metadata, was generated automatically.");
        return true;

    } catch (error) {
        console.error('Failed to add video:', error);
        alert("An unexpected error occurred while generating video content. Please check the console and try again.");
        return false;
    }
  }, []);

  const updateVideo = useCallback(async (videoId: string, updatedVideoData: Video) => {
    try {
      const { error } = await supabase.from('videos').update(updatedVideoData).eq('id', videoId);
      if (error) {
        throw error;
      }
      setVideos(prevVideos =>
        prevVideos.map(video => (video.id === videoId ? updatedVideoData : video))
      );
      return true;
    } catch (error) {
      console.error('Failed to update video:', error);
      alert('Failed to update video.');
      return false;
    }
  }, []);

  const deleteVideo = useCallback(async (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        const { error } = await supabase.from('videos').delete().eq('id', videoId);
        if (error) {
          throw error;
        }
        setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
      } catch (error) {
        console.error('Failed to delete video:', error);
        alert('Failed to delete video.');
      }
    }
  }, []);

  return { videos, addVideo, updateVideo, deleteVideo };
};
