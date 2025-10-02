import { useState, useEffect, useCallback } from 'react';
import type { Video } from '../types';

export const useVideoData = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const response = await fetch('/api/videos');
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const data = await response.json();
      setVideos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const fetchVideoById = useCallback(async (id: string): Promise<Video | null> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/videos/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch video with id ${id}`);
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateVideoMetadata = useCallback(async (newVideoData: { id: string; title: string; transcript: string }) => {
    try {
      const prompt = `You are an expert technical writer and content strategist for the YouTube channel 'Techiral'. Your task is to analyze a video transcript and generate a comprehensive set of metadata to enhance its presentation and discoverability. Your knowledge is strictly limited to the provided transcript.

Based on the following video title and transcript, perform these five tasks:

1.  **Generate Scannable Summary:** Convert the video's description into a bulleted list. Each bullet point should be a concise, benefit-oriented sentence starting with a bolded keyword (e.g., "**Craft** viral CGI ads...").

2.  **Identify Target Audience:** Write a short, explicit sub-heading identifying the intended audience (e.g., "A step-by-step guide for solopreneurs and indie creators.").

3.  **Generate FAQs:** Create a list of 3-5 insightful FAQs that a curious developer might ask. Answers must be detailed and directly supported by the transcript.

4.  **Identify Key Moments:** Identify the most crucial segments. For each, provide the exact timestamp (e.g., "(1:40)") and a concise, action-oriented summary.

5.  **Generate SEO Metadata & CTA:**
    *   metaTitle: A compelling title under 60 characters.
    *   metaDescription: An enticing summary under 160 characters.
    *   ctaHeadline: A clear, unmistakable call-to-action headline for acquiring resources.
    *   ctaDescription: A short description of what the user will get (e.g., "prompt list," "checklist").

Return ONLY a single, valid JSON object with seven top-level keys: "description", "targetAudience", "faqs", "keyMoments", "metaTitle", "metaDescription", "cta". The structure must be:
{
  "description": ["string"],
  "targetAudience": "string",
  "faqs": [{ "question": "string", "answer": "string" }],
  "keyMoments": [{ "label": "string", "summary": "string" }],
  "metaTitle": "string",
  "metaDescription": "string",
  "cta": { "headline": "string", "description": "string" }
}

Video Title: "${newVideoData.title}"

Transcript:
---
${newVideoData.transcript}
---
`;

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

      const updatedVideo: Video = {
        id: newVideoData.id,
        title: newVideoData.title,
        transcript: newVideoData.transcript,
        ...parsedData,
        created_at: new Date().toISOString(),
      };

      await fetch(`/api/videos/${newVideoData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedVideo),
      });

      setVideos(prev => prev.map(v => v.id === newVideoData.id ? updatedVideo : v));
      return updatedVideo;

    } catch (err) {
      console.error("Error generating or saving metadata:", err);
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  }, []);

  return { videos, loading, error, fetchVideos, fetchVideoById, generateVideoMetadata };
};
