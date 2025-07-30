import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import StatusBar from './components/StatusBar';

function App() {
  const [currentView, setCurrentView] = useState('list');
  const [editingNote, setEditingNote] = useState(null);
  
  const {
    notes,
    saveNote,
    updateNote,
    deleteNote,
  } = useLocalStorage();

  const handleNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: '',
      content: '',
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    setEditingNote(newNote);
    setCurrentView('editor');
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setCurrentView('editor');
  };

  const handleSaveNote = (note) => {
    if (notes.find(n => n.id === note.id)) {
      updateNote(note);
    } else {
      saveNote(note);
    }
    setCurrentView('list');
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId) => {
    deleteNote(noteId);
    if (editingNote?.id === noteId) {
      setCurrentView('list');
      setEditingNote(null);
    }
  };

  const handleBack = () => {
    setCurrentView('list');
    setEditingNote(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="sticky top-0 bg-gray-900 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentView === 'editor' && (
                <button
                  onClick={handleBack}
                  className="text-gray-400 hover:text-gray-100 transition-colors"
                  aria-label="Back to notes list"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h1 className="text-2xl font-semibold text-gray-100">MOSS</h1>
            </div>
            
            {currentView === 'list' && (
              <button
                onClick={handleNewNote}
                className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
              >
                New Note
              </button>
            )}
          </div>
        </header>

        {/* Status Bar */}
        <div className="px-6 py-2">
          <StatusBar />
        </div>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-8rem)]">
          {currentView === 'list' ? (
            <>
              <NotesList
                notes={notes}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
              
              {/* Welcome message at bottom */}
              <div className="px-6 py-12 text-center text-gray-500">
                <p className="text-sm">
                  Welcome to MOSS
                </p>
                <p className="text-xs mt-1 text-gray-600">
                  Minimalist Offline Speech & Summarization
                </p>
              </div>
            </>
          ) : (
            <NoteEditor
              note={editingNote}
              onSave={handleSaveNote}
              onDelete={() => handleDeleteNote(editingNote.id)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
