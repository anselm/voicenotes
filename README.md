# CoolNote - AI-Powered Note Taking App

A private, offline-first note-taking app with AI summarization capabilities.

## Features

- 🎙️ Voice-to-text transcription
- 🤖 AI-powered summarization using Claude
- 💾 Local storage - all data stays on your device
- 🎨 Clean, minimal interface
- ⚡ Fast and responsive

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   VITE_CLAUDE_API_KEY=your-claude-api-key-here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Development

The app uses Vite's proxy feature to handle CORS issues with the Claude API during development. The proxy configuration in `vite.config.js` forwards requests to the Anthropic API.

## Production Deployment

For production deployment, you have several options:

### Option 1: Vercel (Recommended)

1. Deploy to Vercel
2. Add your Claude API key as an environment variable named `CLAUDE_API_KEY`
3. The `/api/summarize.js` endpoint will automatically work as a serverless function

### Option 2: Netlify

1. Create a `netlify/functions/summarize.js` file with the same content as `api/summarize.js`
2. Deploy to Netlify
3. Add your Claude API key as an environment variable

### Option 3: Self-hosted with Node.js

Create a simple Express server to proxy the API calls.

## Browser Compatibility

- Chrome/Edge: Full support including speech recognition
- Firefox: Limited speech recognition support
- Safari: Speech recognition may require permissions

## Privacy

All notes are stored locally in your browser's localStorage. No data is sent to any server except for the AI summarization feature, which only sends the note content to Claude API when you explicitly click "Done & Summarize".

## License

MIT
