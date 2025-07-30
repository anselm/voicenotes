import React from 'react';

const NotesList = ({ notes, onDelete, getAudioUrl }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No recordings yet. Start recording to create your first note!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <p className="text-sm text-gray-400">{formatDate(note.timestamp)}</p>
              <p className="text-white mt-1">
                {note.transcript || <span className="italic text-gray-500">No transcription</span>}
              </p>
            </div>
            <button
              onClick={() => onDelete(note.id)}
              className="ml-4 text-red-400 hover:text-red-300 transition-colors"
              aria-label="Delete note"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>{formatDuration(note.duration)}</span>
              <span>{formatSize(note.size)}</span>
            </div>
            
            <audio 
              controls 
              className="h-8"
              src={getAudioUrl(note.audioData)}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotesList;
