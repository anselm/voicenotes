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
      // Extract first meaningful line from structured summary
      const lines = note.summary.trim().split('\n');
      const firstBullet = lines.find(line => line.trim().startsWith('•')) || lines[0];
      const summaryPreview = firstBullet.trim();
      return summaryPreview.length > 150 ? summaryPreview.substring(0, 150) + '...' : summaryPreview;
    }
    
    const preview = note.content.trim().split('\n')[0] || 'Empty note';
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <div className="text-gray-600 mb-6">
          <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-400 text-lg mb-2">No notes yet</p>
        <p className="text-gray-500 text-sm">Create your first note to get started</p>
      </div>
    );
  }

  return (
    <div>
      {notes.map((note) => (
        <div
          key={note.id}
          className="px-6 py-6 hover:bg-gray-900 cursor-pointer transition-all group"
          onClick={() => onEdit(note)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-lg font-medium text-white truncate">
                {note.title || 'Untitled'}
              </h3>
              <div className="mt-1">
                <p className="text-gray-400 line-clamp-2 mt-1">
                  {getPreview(note)}
                </p>
                {note.summary && (
                  <span className="text-xs text-gray-600">
                    summarized • {Math.round((note.summary.length / note.content.length) * 100)}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                <span>{formatDate(note.lastModified || note.timestamp)}</span>
                {note.content && (
                  <>
                    <span>•</span>
                    <span>{note.content.split(' ').length} words</span>
                    <span>•</span>
                    <span>{Math.ceil(note.content.split(' ').length / 200)} min read</span>
                  </>
                )}
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
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
