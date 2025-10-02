import { useState, useEffect, useCallback } from 'react';
import type { Video } from '../types';
import { supabase } from '../lib/supabaseClient';

export const useVideoData = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  const fetchVideos = useCallback(async () => {
    try {
      // Order by creation time to show newest videos first
      const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      setVideos(data || []);
    } catch (error) {
      console.error('Failed to load videos from Supabase:', error);
      alert('Failed to load videos.');
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

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
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
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
            throw new Error("AI response did not contain valid JSON.");
        }

        const { description, faqs, keyMoments, metaTitle, metaDescription } = JSON.parse(extractedJsonStr);
        if (!description || !faqs || !keyMoments || !metaTitle || !metaDescription) {
            throw new Error("AI returned incomplete data.");
        }

        const completeVideo: Omit<Video, 'created_at'> = {
            ...newVideoData,
            description,
            faqs,
            keyMoments,
            metaTitle,
            metaDescription,
        };

        const { data: insertedVideo, error: insertError } = await supabase
            .from('videos')
            .insert([completeVideo])
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        if (insertedVideo) {
            setVideos(prevVideos => [insertedVideo, ...prevVideos]);
            alert("Video added successfully! Content generated.");
            return true;
        } else {
            throw new Error("Insert did not return the new video.");
        }

    } catch (error: any) {
        console.error('Failed to add video:', error);
        alert(`Failed to add video: ${error.message}`);
        return false;
    }
  }, [fetchVideos]);

  const updateVideo = useCallback(async (videoId: string, updatedVideoData: Partial<Video>): Promise<boolean> => {
    try {
      const { data: updatedVideo, error } = await supabase
        .from('videos')
        .update(updatedVideoData)
        .eq('id', videoId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (updatedVideo) {
        setVideos(prevVideos =>
          prevVideos.map(video => (video.id === videoId ? updatedVideo : video))
        );
        alert('Video updated successfully!');
        return true;
      } else {
        throw new Error("Update did not return the updated video.");
      }
    } catch (error: any) {
      console.error('Failed to update video:', error);
      alert(`Failed to update video: ${error.message}`);
      return false;
    }
  }, []);

  const deleteVideo = useCallback(async (videoId: string): Promise<boolean> => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        const { error, count } = await supabase.from('videos').delete({ count: 'exact' }).eq('id', videoId);

        if (error) {
          throw error;
        }

        if (count && count > 0) {
          setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
          alert('Video deleted successfully!');
          return true;
        } else {
          alert('Could not delete the video. It may have been already removed.');
          fetchVideos(); // Re-sync state
          return false;
        }
      } catch (error: any) {
        console.error('Failed to delete video:', error);
        alert(`Failed to delete video: ${error.message}`);
        return false;
      }
    }
    return false;
  }, [fetchVideos]);

  return { videos, addVideo, updateVideo, deleteVideo };
};
