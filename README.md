# CoolNote - AI-Powered Note Taking App

A private note-taking app with AI summarization, featuring both local storage and server persistence.

## Features

- 🎙️ Voice-to-text transcription
- 🤖 AI-powered summarization using Claude
- 💾 Dual storage - browser localStorage + server persistence
- 🌙 Dark mode interface
- ⚡ Single process architecture
- 🔄 Automatic sync between client and server

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   VITE_CLAUDE_API_KEY=your-claude-api-key-here
   CLAUDE_API_KEY=your-claude-api-key-here
   PORT=3000
   ```

## Development

Run both Vite and Express server concurrently:
```bash
npm run dev
```

This starts:
- Vite dev server on http://localhost:5173
- Express API server on http://localhost:3000

## Production

Build and run the production server:
```bash
npm run serve
```

Or separately:
```bash
npm run build
npm start
```

The production server:
- Serves the built React app
- Provides API endpoints for notes persistence
- Proxies Claude API requests
- Stores notes in `data/notes.json`

## API Endpoints

- `GET /api/notes` - Fetch all notes
- `POST /api/notes` - Create/update a note
- `DELETE /api/notes/:id` - Delete a note
- `POST /api/anthropic/v1/messages` - Proxy for Claude API

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js
- **Storage**: File-based (JSON) + browser localStorage
- **AI**: Claude API for summarization

## Browser Compatibility

- Chrome/Edge: Full support including speech recognition
- Firefox: Limited speech recognition support
- Safari: Speech recognition may require permissions

## Data Storage

- Notes are saved in both:
  - Browser localStorage (instant access)
  - Server file system at `data/notes.json` (persistence)
- Automatic fallback to localStorage if server is unavailable

## License

MIT
