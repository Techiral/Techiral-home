
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const apiKey = process.env.API_KEY || process.env.VITE_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "API key is not configured on the server." });
    }

    if (req.method === 'POST') {
        // Forward POST requests to OpenRouter API
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://techiral.com',
                    'X-Title': 'Techiral AI',
                },
                body: JSON.stringify(req.body),
            });

            const isStreaming = req.body.stream === true;
            if (isStreaming && response.body) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                const forwardStream = async () => {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        res.write(decoder.decode(value));
                    }
                    res.end();
                };
                await forwardStream();
            } else {
                const data = await response.json();
                res.status(response.status).json(data);
            }
        } catch (error: any) {
            console.error("Error in POST proxy handler:", error);
            res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
        }
    } else if (req.method === 'GET') {
        // Handle GET requests for other APIs (e.g., YouTube)
        const { endpoint } = req.query;
        if (!endpoint) {
            return res.status(400).json({ error: 'Endpoint is required for GET requests' });
        }

        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        if (!YOUTUBE_API_KEY) {
            return res.status(500).json({ error: "YouTube API key is not configured on the server." });
        }

        const url = `https://www.googleapis.com/youtube/v3/${endpoint}&key=${YOUTUBE_API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            res.status(response.status).json(data);
        } catch (error: any) {
            console.error("Error in GET proxy handler:", error);
            res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
