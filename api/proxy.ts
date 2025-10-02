
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This function is the core of our secure proxy.
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Set CORS headers to allow requests from your frontend.
    res.setHeader('Access-Control-Allow-Origin', '*'); // In production, you should restrict this to your domain: 'https://your-domain.com'
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 2. Handle preflight OPTIONS requests for CORS.
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Ensure the request is a POST request.
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    // 4. Securely get the API key from server-side environment variables.
    const apiKey = process.env.API_KEY || process.env.VITE_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "API key is not configured on the server." });
    }

    try {
        // 5. Forward the incoming request body to the OpenRouter API.
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                // These headers are recommended by OpenRouter for better identification.
                'HTTP-Referer': 'https://techiral.com', // Replace with your actual domain
                'X-Title': 'Techiral AI', // Replace with your actual app title
            },
            body: JSON.stringify(req.body),
        });

        // 6. Handle streaming responses for features like the Chatbot.
        const isStreaming = req.body.stream === true;
        
        if (isStreaming && response.body) {
            // Set the appropriate headers for a streaming response.
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            // Pipe the response stream directly from OpenRouter to the client.
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            const forwardStream = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    res.write(decoder.decode(value));
                }
                res.end();
            };
            
            await forwardStream();

        } else {
            // 7. Handle standard, non-streaming JSON responses.
            const data = await response.json();
            res.status(response.status).json(data);
        }

    } catch (error: any) {
        console.error("Error in proxy handler:", error);
        res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
    }
}
