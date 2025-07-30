# MOSS - Minimalist Offline Speech & Summarization

A minimalist note-taking app with AI-powered summarization and voice transcription.

## Features

- 🎙️ Voice-to-text transcription
- 🤖 Executive-style AI summarization using Claude
  - Auto-generates titles from content
  - Creates structured briefings with:
    - Key points and decisions
    - Action items with owners
    - Blockers and concerns
    - Relevant context
  - Shows compression ratio
- 💾 Dual storage - browser localStorage + server persistence
- 🌙 Minimalist black & white interface
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
   PORT=3000
   ```

## Development

For development with hot reload:
```bash
npm run dev
```

This starts:
- Vite dev server on http://localhost:5173
- Express API server on http://localhost:3000

## Production

Build and run the production server:
```bash
npm run production
```

Or step by step:
```bash
# Build the frontend
npm run build

# Run the server (serves built files)
NODE_ENV=production npm start
```

The server will automatically serve the built files from the `dist` folder if it exists.

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
