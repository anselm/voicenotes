import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import AudioRecordButton from './AudioRecordButton';

const NoteEditor = ({ note, onSave, onDelete }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const contentRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const {
    isRecording,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const {
    transcript,
    interimTranscript,
    resetTranscript,
  } = useSpeechRecognition(isRecording);

  // Update cursor position when content changes
  const handleContentChange = (e) => {
    setContent(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  // Insert transcribed text at cursor position
  useEffect(() => {
    if (transcript && !isRecording) {
      const beforeCursor = content.slice(0, cursorPosition);
      const afterCursor = content.slice(cursorPosition);
      const newContent = beforeCursor + transcript + afterCursor;
      setContent(newContent);
      setCursorPosition(cursorPosition + transcript.length);
      resetTranscript();
    }
  }, [transcript, isRecording]);

  const handleSave = () => {
    const updatedNote = {
      ...note,
      title: title.trim() || 'Untitled',
      content,
      lastModified: new Date().toISOString(),
    };
    onSave(updatedNote);
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      // Store current cursor position before recording
      if (contentRef.current) {
        setCursorPosition(contentRef.current.selectionStart);
      }
      startRecording();
    }
  };

  // Auto-save on content change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (title || content) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, content]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="px-6 py-4 border-b border-gray-200">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full text-2xl font-semibold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent"
        />
      </div>
      
      <div className="flex-1 px-6 py-4 relative">
        <textarea
          ref={contentRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Start typing..."
          className="w-full h-full text-gray-800 placeholder-gray-400 border-none outline-none resize-none bg-transparent"
          style={{ minHeight: '300px' }}
        />
        
        {/* Show interim transcript */}
        {isRecording && interimTranscript && (
          <div className="absolute bottom-20 left-6 right-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Listening:</span> {interimTranscript}
            </p>
          </div>
        )}
      </div>
      
      {/* Audio Record Button */}
      <AudioRecordButton
        isRecording={isRecording}
        onToggle={handleRecordToggle}
      />
      
      {/* Bottom toolbar */}
      <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
        >
          Delete Note
        </button>
        
        <div className="text-sm text-gray-500">
          {content.length} characters
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
