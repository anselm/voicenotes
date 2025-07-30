import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { eventBus, EVENTS } from '../utils/eventBus';

const STORAGE_KEY = 'coolnote-notes';

export const useLocalStorage = () => {
  const [notes, setNotes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
      return [];
    }
  });

  const saveNote = useCallback((note) => {
    try {
      const newNote = {
        ...note,
        id: note.id || uuidv4(),
        timestamp: note.timestamp || new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      const updatedNotes = [newNote, ...notes.filter(n => n.id !== newNote.id)];
      // Sort by last modified date
      updatedNotes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      
      setNotes(updatedNotes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      
      eventBus.emit(EVENTS.NOTE_SAVED, newNote);
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: 'Note saved', 
        type: 'success' 
      });
      
      return newNote;
    } catch (error) {
      console.error('Error saving note:', error);
      eventBus.emit(EVENTS.ERROR, { 
        message: 'Failed to save note', 
        error 
      });
      throw error;
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

  const deleteNote = useCallback((noteId) => {
    try {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      
      eventBus.emit(EVENTS.NOTE_DELETED, { id: noteId });
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: 'Note deleted', 
        type: 'info' 
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      eventBus.emit(EVENTS.ERROR, { 
        message: 'Failed to delete note', 
        error 
      });
    }
  }, [notes]);

  return {
    notes,
    saveNote,
    updateNote,
    deleteNote,
  };
};
