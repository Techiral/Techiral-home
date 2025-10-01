const { GoogleGenAI, Type } = require("@google/genai");

// Initialize the AI with the API key from server-side environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates FAQs based on a video transcript.
 * @param {string} title - The title of the video.
 * @param {string} transcript - The full transcript of the video.
 * @returns {Promise<object>} - A promise that resolves to the generated FAQs object.
 */
async function generateFaqs(title, transcript) {
    const prompt = `Based on the transcript of the YouTube video titled "${title}", generate a list of 3-5 frequently asked questions (FAQs) that the video answers. The questions should be concise and relevant to the video's main topics. The answers should be clear summaries derived directly from the transcript content.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${prompt}\n\nTranscript:\n${transcript}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    faqs: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING },
                            },
                            required: ['question', 'answer'],
                        },
                    },
                },
                required: ['faqs'],
            },
        },
    });

    return JSON.parse(response.text);
}

/**
 * Generates a chat response based on a user's message and video context.
 * @param {string} title - The title of the video.
 * @param {string} transcript - The full transcript of the video.
 * @param {string} message - The user's question.
 * @returns {Promise<string>} - A promise that resolves to the AI's text response.
 */
async function generateChatResponse(title, transcript, message) {
    const systemInstruction = `You are an expert AI assistant for the YouTube channel "Techiral". You are answering questions about a specific video. Your knowledge is strictly limited to the information provided in the video's transcript. Do not use any external knowledge. If the answer cannot be found in the transcript, clearly state that the video does not cover that topic. Be friendly, concise, and helpful.

Here is the transcript for the video titled "${title}":
---
${transcript}
---`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${systemInstruction}\n\nUser question: ${message}`,
    });

    return response.text;
}

/**
 * Vercel Serverless Function handler.
 * This function routes requests to the appropriate AI generation service.
 */
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { type, payload } = req.body;
        let result;

        if (type === 'faq') {
            const { title, transcript } = payload;
            if (!title || !transcript) {
                 return res.status(400).json({ error: 'Missing title or transcript for FAQ generation.' });
            }
            result = await generateFaqs(title, transcript);
        } else if (type === 'chat') {
            const { title, transcript, message } = payload;
             if (!title || !transcript || !message) {
                 return res.status(400).json({ error: 'Missing title, transcript, or message for chat.' });
            }
            result = await generateChatResponse(title, transcript, message);
        } else {
            return res.status(400).json({ error: 'Invalid request type specified.' });
        }

        res.status(200).json({ data: result });
    } catch (error) {
        console.error('API function error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};
