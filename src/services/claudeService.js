const CLAUDE_API_URL = '/api/anthropic/v1/messages';

export const summarizeWithClaude = async (content) => {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('Claude API key not configured. Please add VITE_CLAUDE_API_KEY to your .env file.');
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key-proxy': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Please summarize the following note concisely, capturing the key points and main ideas:\n\n${content}`
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to summarize with Claude');
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    
    // Provide helpful error message for CORS issues
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('API connection failed. Make sure you are running the app with "npm run dev" for local development.');
    }
    
    throw error;
  }
};
