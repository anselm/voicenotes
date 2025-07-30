import React from 'react';

const NotesList = ({ notes, onEdit, onDelete }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getPreview = (note) => {
    // Show summary if available, otherwise show content preview
    if (note.summary) {
      const summaryPreview = note.summary.trim();
      return summaryPreview.length > 150 ? summaryPreview.substring(0, 150) + '...' : summaryPreview;
    }
    
    const preview = note.content.trim().split('\n')[0] || 'Empty note';
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <div className="text-gray-400 mb-6">
          <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-600 text-lg mb-2">No notes yet</p>
        <p className="text-gray-500 text-sm">Create your first note to get started</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {notes.map((note) => (
        <div
          key={note.id}
          className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
          onClick={() => onEdit(note)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {note.title || 'Untitled'}
              </h3>
              <div className="mt-1">
                {note.summary && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                    AI Summary
                  </span>
                )}
                <p className="text-gray-600 line-clamp-2">
                  {getPreview(note)}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formatDate(note.lastModified || note.timestamp)}
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
              aria-label="Delete note"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotesList;
