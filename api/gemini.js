import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This is the main handler for the Vercel serverless function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { type, payload } = req.body;

    if (type === 'generate-faq') {
      const { title, transcript } = payload;
      if (!title || !transcript) {
        return res.status(400).json({ error: 'Title and transcript are required for FAQ generation.' });
      }

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

      const json = JSON.parse(response.text);
      return res.status(200).json(json);

    } else if (type === 'chat') {
      const { title, transcript, message } = payload;
      if (!title || !transcript || !message) {
        return res.status(400).json({ error: 'Title, transcript, and message are required for chat.' });
      }

      const systemInstruction = `You are an expert AI assistant for the YouTube channel "Techiral". You are answering questions about a specific video. Your knowledge is strictly limited to the information provided in the video's transcript. Do not use any external knowledge. If the answer cannot be found in the transcript, clearly state that the video does not cover that topic. Be friendly, concise, and helpful.

Here is the transcript for the video titled "${title}":
---
${transcript}
---`;
            
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${systemInstruction}\n\nUser question: ${message}`,
      });

      return res.status(200).json({ text: response.text });

    } else {
      return res.status(400).json({ error: 'Invalid request type.' });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'An error occurred while communicating with the AI service.' });
  }
}
