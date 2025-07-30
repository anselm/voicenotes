const CLAUDE_API_URL = '/api/anthropic/v1/messages';

export const chatWithClaude = async (noteContent, noteTitle, chatHistory) => {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('Claude API key not configured. Please add VITE_CLAUDE_API_KEY to your .env file.');
  }

  // Build conversation context
  const messages = [
    {
      role: 'user',
      content: `I have a note titled "${noteTitle || 'Untitled'}" with the following content:\n\n${noteContent}\n\nI'd like to discuss this note with you. Please help me understand, analyze, or expand on any aspect of it.`
    },
    {
      role: 'assistant',
      content: 'I\'ve read your note. I\'m ready to discuss it with you. What would you like to explore about this content?'
    }
  ];

  // Add chat history
  chatHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });

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
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from Claude');
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('API connection failed. Make sure you are running the app with "npm run dev" for local development.');
    }
    
    throw error;
  }
};

export const summarizeWithClaude = async (content, type = 'content') => {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('Claude API key not configured. Please add VITE_CLAUDE_API_KEY to your .env file.');
  }

  const prompts = {
    content: `You are a Chief of Staff preparing a briefing for a busy executive. Analyze the following notes and provide a structured summary that highlights what matters most.

Create a summary with:
• KEY POINTS - The most important information and decisions
• ACTION ITEMS - Clear next steps with owners if mentioned
• BLOCKERS/CONCERNS - Any risks, issues, or obstacles identified
• CONTEXT - Brief background if relevant

Use bullet points and be concise but comprehensive. Focus on actionable insights.

Notes to summarize:
${content}`,
    title: `Generate a short, descriptive title (max 6 words) for this note:\n\n${content}`,
    both: `You are a Chief of Staff preparing a briefing for a busy executive. Analyze the following notes and provide:

1. A short descriptive title (max 6 words)
2. An executive summary with:
   • KEY POINTS - The most important information and decisions
   • ACTION ITEMS - Clear next steps with owners if mentioned
   • BLOCKERS/CONCERNS - Any risks, issues, or obstacles identified
   • CONTEXT - Brief background if relevant

Use bullet points and be concise but comprehensive. Focus on actionable insights.

Notes to analyze:
${content}

Please format your response as:
Title: [your title here]
Summary:
[your structured summary with bullet points here]`
  };

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
            content: prompts[type]
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to summarize with Claude');
    }

    const data = await response.json();
    const responseText = data.content[0].text;
    
    if (type === 'both') {
      // Parse the response to extract title and summary
      const titleMatch = responseText.match(/Title:\s*(.+)/);
      const summaryMatch = responseText.match(/Summary:\s*([\s\S]+)/);
      
      return {
        title: titleMatch ? titleMatch[1].trim() : 'Untitled',
        summary: summaryMatch ? summaryMatch[1].trim() : responseText
      };
    }
    
    return responseText;
  } catch (error) {
    console.error('Claude API error:', error);
    
    // Provide helpful error message for CORS issues
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('API connection failed. Make sure you are running the app with "npm run dev" for local development.');
    }
    
    throw error;
  }
};
