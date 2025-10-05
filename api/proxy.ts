import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Passthrough without context if Supabase is not configured
  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or key not defined. Proxying request without context.");
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify(req.body),
        });
        const data = await response.json();
        return res.status(response.status).json(data);
      } catch (error) {
        console.error('Error proxying request:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { videoId, blogId, knowledgeBase, ...restOfBody } = req.body;
    let systemMessage = {
        role: 'system',
        content: 'You are a helpful assistant. Your responses should be concise and helpful.'
    };
    let contextAdded = false;

    if (videoId) {
        const { data: video, error } = await supabase
            .from('videos')
            .select('title, description, transcript')
            .eq('id', videoId)
            .single();

        if (video) {
            systemMessage.content += ` The user is asking a question about a video. Here is the video's information. Use this information to answer the user's question.\n\n            Title: ${video.title}\n\n            Description: ${video.description}\n\n            Transcript: ${video.transcript ? video.transcript.substring(0, 4000) + '...' : 'Not available.'}`;
            contextAdded = true;
        }
    } else if (blogId) {
        const { data: blog, error } = await supabase
            .from('blogs')
            .select('title, description, content')
            .eq('id', blogId)
            .single();

        if (blog) {
             systemMessage.content += ` The user is asking a question about a blog post. Here is the blog's information. Use this information to answer the user's question.\n\n            Title: ${blog.title}\n\n            Description: ${blog.description}\n\n            Content: ${blog.content ? blog.content.substring(0, 4000) + '...' : 'Not available.'}`;
             contextAdded = true;
        }
    }

    // Fallback to knowledgeBase if context was not added via Supabase fetch
    if (!contextAdded && knowledgeBase) {
        const contextType = videoId ? 'video transcript' : (blogId ? 'blog content' : 'context');
        systemMessage.content += ` The user is asking a question. The primary data source failed, but here is the provided ${contextType}. Use this information to answer the user's question.\n\n            Content: ${knowledgeBase.substring(0, 4000) + '...'}`;
    }

    const newBody = {
        ...restOfBody,
        messages: [systemMessage, ...restOfBody.messages],
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(newBody),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
