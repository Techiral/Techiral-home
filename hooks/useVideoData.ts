import { useState, useEffect, useCallback } from 'react';
import type { Video } from '../types';
import { supabase } from '../lib/supabaseClient';

export const useVideoData = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVideos(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load videos from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const fetchVideoById = useCallback(async (videoId: string): Promise<Video | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('videos').select('*').eq('id', videoId).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error(`Failed to load video with id ${videoId}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateVideoMetadata = useCallback(async (newVideoData: { id: string; title: string; transcript: string }) => {
    try {
      const prompt = `You are an expert technical writer and content strategist for the YouTube channel \'Techiral\'. Your task is to analyze a video transcript and generate a comprehensive set of metadata to enhance its presentation and discoverability. Your knowledge is strictly limited to the provided transcript.\n\nBased on the following video title and transcript, perform these five tasks:\n\n1.  **Generate Scannable Summary:** Convert the video\'s description into a bulleted list. Each bullet point should be a concise, benefit-oriented sentence starting with a bolded keyword (e.g., "**Craft** viral CGI ads...").\n\n2.  **Identify Target Audience:** Write a short, explicit sub-heading identifying the intended audience (e.g., "A step-by-step guide for solopreneurs and indie creators.").\n\n3.  **Generate FAQs:** Create a list of 3-5 insightful FAQs that a curious developer might ask. Answers must be detailed and directly supported by the transcript.\n\n4.  **Identify Key Moments:** Identify the most crucial segments. For each, provide the exact timestamp (e.g., "(1:40)") and a concise, action-oriented summary.\n\n5.  **Generate SEO Metadata & CTA:**\n    *   metaTitle: A compelling title under 60 characters.\n    *   metaDescription: An enticing summary under 160 characters.\n    *   ctaHeadline: A clear, unmistakable call-to-action headline for acquiring resources.\n    *   ctaDescription: A short description of what the user will get (e.g., "prompt list," "checklist").\n\nReturn ONLY a single, valid JSON object with seven top-level keys: "description", "targetAudience", "faqs", "keyMoments", "metaTitle", "metaDescription", "cta". The structure must be:\n{\n  "description": ["string"],\n  "targetAudience": "string",\n  "faqs": [{ "question": "string", "answer": "string" }],\n  "keyMoments": [{ "label": "string", "summary": "string" }],\n  "metaTitle": "string",\n  "metaDescription": "string",\n  "cta": { "headline": "string", "description": "string" }\n}\n\nVideo Title: "${newVideoData.title}"\n\nTranscript:\n---\n${newVideoData.transcript}\n---\n`;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate metadata');
      }

      const data = await response.json();
      const parsedData = JSON.parse(data.response);

      const updatedVideoData: Partial<Video> = {
        title: newVideoData.title,
        transcript: newVideoData.transcript,
        ...parsedData,
      };

      const { data: updatedVideo, error } = await supabase
        .from('videos')
        .update(updatedVideoData)
        .eq('id', newVideoData.id)
        .select()
        .single();
        
      if (error) throw error;

      if (updatedVideo) {
        setVideos(prev => prev.map(v => v.id === newVideoData.id ? updatedVideo : v));
        return updatedVideo;
      } else {
        throw new Error("Update operation did not return the updated video post.");
      }
    } catch (err) {
      console.error("Error generating or saving metadata:", err);
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, []);

  return { videos, loading, error, fetchVideos, fetchVideoById, generateVideoMetadata };
};
