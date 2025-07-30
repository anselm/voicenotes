import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { summarizeWithClaude } from '../services/claudeService';
import { eventBus, EVENTS } from '../utils/eventBus';
import AudioRecordButton from './AudioRecordButton';

const NoteEditor = ({ note, onSave, onDelete }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [summary, setSummary] = useState(note?.summary || '');
  const [showSummary, setShowSummary] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
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
    setHasChanges(true);
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

  const handleSave = (includesSummary = false) => {
    const updatedNote = {
      ...note,
      title: title.trim() || 'Untitled',
      content,
      summary: includesSummary ? summary : note?.summary || '',
      lastModified: new Date().toISOString(),
    };
    onSave(updatedNote);
    setHasChanges(false);
  };

  const handleDone = async () => {
    if (!content.trim()) {
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: 'Cannot summarize empty note', 
        type: 'warning' 
      });
      return;
    }

    setIsProcessing(true);
    try {
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: 'Generating title and summary with Claude...', 
        type: 'info' 
      });
      
      const result = await summarizeWithClaude(content, 'both');
      
      // Update title if it's still empty or default
      if (!title || title === 'Untitled') {
        setTitle(result.title);
      }
      
      setSummary(result.summary);
      setShowSummary(true);
      
      // Save with both title and summary
      const updatedNote = {
        ...note,
        title: title || result.title,
        content,
        summary: result.summary,
        lastModified: new Date().toISOString(),
      };
      onSave(updatedNote);
      setHasChanges(false);
      
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: 'Note summarized successfully', 
        type: 'success' 
      });
    } catch (error) {
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: error.message || 'Failed to summarize note', 
        type: 'error' 
      });
    } finally {
      setIsProcessing(false);
    }
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
      if ((title || content) && hasChanges) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, content, hasChanges]);

  // Load existing summary when note changes
  useEffect(() => {
    if (note?.summary) {
      setSummary(note.summary);
    }
  }, [note]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="px-6 py-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full text-2xl font-semibold text-gray-100 placeholder-gray-500 border-none outline-none bg-transparent"
        />
      </div>
      
      <div className="flex-1 px-6 py-4 relative overflow-y-auto">
        {/* Toggle buttons for raw/summary view */}
        {summary && (
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setShowSummary(false)}
              className={`text-sm font-medium transition-colors ${
                !showSummary 
                  ? 'text-gray-100' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Raw
            </button>
            <span className="text-gray-600 mx-2">•</span>
            <button
              onClick={() => setShowSummary(true)}
              className={`text-sm font-medium transition-colors ${
                showSummary 
                  ? 'text-gray-100' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Summary
            </button>
          </div>
        )}

        {showSummary && summary ? (
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{summary}</p>
            <div className="mt-6 text-xs text-gray-600">
              {content.length} → {summary.length} characters ({Math.round((1 - summary.length / content.length) * 100)}% reduction)
            </div>
          </div>
        ) : (
          <textarea
            ref={contentRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Start typing or use the microphone to record..."
            className="w-full h-full text-gray-100 placeholder-gray-500 border-none outline-none resize-none bg-transparent"
            style={{ minHeight: '300px' }}
          />
        )}
        
        {/* Show interim transcript */}
        {isRecording && interimTranscript && (
          <div className="absolute bottom-20 left-6 right-6 bg-gray-800/80 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm text-gray-300">
              {interimTranscript}
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
      <div className="px-6 py-3 flex items-center justify-between">
        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
        >
          Delete Note
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            {content.length} characters
          </div>
          
          <button
            onClick={handleDone}
            disabled={isProcessing || !content.trim()}
            className={`text-sm font-medium transition-colors ${
              isProcessing || !content.trim()
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-green-500 hover:text-green-400'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Summarize'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
