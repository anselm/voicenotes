import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { eventBus, EVENTS } from '../utils/eventBus';

const STORAGE_KEY = 'coolnote-notes';

export const useLocalStorage = () => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from server on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const serverNotes = await response.json();
        setNotes(serverNotes);
        // Also update localStorage as backup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverNotes));
      } else {
        // Fallback to localStorage if server fails
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setNotes(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveNote = useCallback(async (note) => {
    try {
      const newNote = {
        ...note,
        id: note.id || uuidv4(),
        timestamp: note.timestamp || new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      // Save to server
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });

      if (response.ok) {
        const savedNote = await response.json();
        
        // Update local state
        const updatedNotes = [savedNote, ...notes.filter(n => n.id !== savedNote.id)];
        updatedNotes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        
        setNotes(updatedNotes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
        
        eventBus.emit(EVENTS.NOTE_SAVED, savedNote);
        eventBus.emit(EVENTS.STATUS_UPDATE, { 
          message: 'Note saved', 
          type: 'success' 
        });
        
        return savedNote;
      } else {
        throw new Error('Failed to save note to server');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      
      // Fallback to localStorage only
      const updatedNotes = [note, ...notes.filter(n => n.id !== note.id)];
      updatedNotes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      
      setNotes(updatedNotes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      
      eventBus.emit(EVENTS.ERROR, { 
        message: 'Saved locally only (server unavailable)', 
        error 
      });
      
      return note;
    }
  }, [notes]);

  const updateNote = useCallback((note) => {
    try {
      const updatedNote = {
        ...note,
        lastModified: new Date().toISOString(),
      };

      const updatedNotes = notes.map(n => 
        n.id === note.id ? updatedNote : n
      );
      
      // Sort by last modified date
      updatedNotes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      
      setNotes(updatedNotes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      
      eventBus.emit(EVENTS.NOTE_SAVED, updatedNote);
      
      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      eventBus.emit(EVENTS.ERROR, { 
        message: 'Failed to update note', 
        error 
      });
      throw error;
    }
  }, [notes]);

  const deleteNote = useCallback(async (noteId) => {
    try {
      // Delete from server
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const updatedNotes = notes.filter(note => note.id !== noteId);
        setNotes(updatedNotes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
        
        eventBus.emit(EVENTS.NOTE_DELETED, { id: noteId });
        eventBus.emit(EVENTS.STATUS_UPDATE, { 
          message: 'Note deleted', 
          type: 'info' 
        });
      } else {
        throw new Error('Failed to delete note from server');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      
      // Fallback to local deletion
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      
      eventBus.emit(EVENTS.ERROR, { 
        message: 'Deleted locally only (server unavailable)', 
        error 
      });
    }
  }, [notes]);

  return {
    notes,
    saveNote,
    updateNote,
    deleteNote,
    isLoading,
  };
};
