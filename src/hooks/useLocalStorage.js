import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { eventBus, EVENTS } from '../utils/eventBus';

const STORAGE_KEY = 'audio-notes';

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

  const saveNote = useCallback(async (audioBlob, transcript, duration) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(audioBlob);
      });
      
      const audioData = await base64Promise;
      
      const newNote = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        transcript,
        duration,
        audioData,
        size: audioBlob.size,
      };

      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      
      eventBus.emit(EVENTS.NOTE_SAVED, newNote);
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: 'Note saved successfully', 
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

  const getAudioUrl = useCallback((audioData) => {
    return audioData;
  }, []);

  return {
    notes,
    saveNote,
    deleteNote,
    getAudioUrl,
  };
};
