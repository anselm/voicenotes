import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = join(__dirname, 'data');
const NOTES_FILE = join(DATA_DIR, 'notes.json');

// Ensure data directory exists
await fs.mkdir(DATA_DIR, { recursive: true });

// Middleware
app.use(express.json());
app.use(cors());

// Initialize notes file if it doesn't exist
try {
  await fs.access(NOTES_FILE);
} catch {
  await fs.writeFile(NOTES_FILE, JSON.stringify([]), 'utf-8');
}

// API Routes
app.get('/api/notes', async (req, res) => {
  try {
    const data = await fs.readFile(NOTES_FILE, 'utf-8');
    const notes = JSON.parse(data);
    res.json(notes);
  } catch (error) {
    console.error('Error reading notes:', error);
    res.status(500).json({ error: 'Failed to read notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const data = await fs.readFile(NOTES_FILE, 'utf-8');
    const notes = JSON.parse(data);
    const newNote = {
      ...req.body,
      id: req.body.id || Date.now().toString(),
      timestamp: req.body.timestamp || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      chatHistory: req.body.chatHistory || []
    };
    
    // Update existing note or add new one
    const existingIndex = notes.findIndex(n => n.id === newNote.id);
    if (existingIndex >= 0) {
      notes[existingIndex] = newNote;
    } else {
      notes.unshift(newNote);
    }
    
    // Sort by last modified
    notes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), 'utf-8');
    res.json(newNote);
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const data = await fs.readFile(NOTES_FILE, 'utf-8');
    const notes = JSON.parse(data);
    const filteredNotes = notes.filter(n => n.id !== req.params.id);
    
    await fs.writeFile(NOTES_FILE, JSON.stringify(filteredNotes, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Claude API proxy
app.post('/api/anthropic/v1/messages', async (req, res) => {
  const apiKey = req.headers['x-api-key-proxy'] || process.env.CLAUDE_API_KEY;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'Failed to connect to Claude API' });
  }
});

// Serve static files (always serve built files if they exist)
try {
  await fs.access(join(__dirname, 'dist'));
  app.use(express.static(join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
  
  console.log('Serving built static files from ./dist');
} catch {
  if (process.env.NODE_ENV === 'production') {
    console.error('No dist folder found! Run "npm run build" first.');
    process.exit(1);
  } else {
    console.log('No dist folder found. Run "npm run build" to create production bundle.');
  }
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode');
  } else {
    console.log('Running in development mode');
  }
});
