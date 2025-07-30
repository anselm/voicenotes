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
          className="w-full text-2xl font-semibold text-white placeholder-gray-600 border-none outline-none bg-transparent"
        />
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
          {content && (
            <>
              <span>•</span>
              <span>{content.split(' ').length} words</span>
              <span>•</span>
              <span>{Math.ceil(content.split(' ').length / 200)} min read</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 px-6 py-4 relative overflow-y-auto">
        {/* Toggle buttons for raw/summary view */}
        {summary && (
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setShowSummary(false)}
              className={`text-sm font-medium transition-colors ${
                !showSummary 
                  ? 'text-white' 
                  : 'text-gray-600 hover:text-white'
              }`}
            >
              Raw
            </button>
            <span className="text-gray-700 mx-2">•</span>
            <button
              onClick={() => setShowSummary(true)}
              className={`text-sm font-medium transition-colors ${
                showSummary 
                  ? 'text-white' 
                  : 'text-gray-600 hover:text-white'
              }`}
            >
              Summary
            </button>
          </div>
        )}

        {showSummary && summary ? (
          <div className="prose prose-invert max-w-none">
            <p className="text-white whitespace-pre-wrap leading-relaxed">{summary}</p>
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
            className="w-full h-full text-white placeholder-gray-600 border-none outline-none resize-none bg-transparent leading-relaxed"
            style={{ minHeight: '300px' }}
          />
        )}
        
        {/* Show interim transcript */}
        {isRecording && interimTranscript && (
          <div className="absolute bottom-20 left-6 right-6 bg-black border border-white p-3">
            <p className="text-sm text-white">
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
            className={`border border-white px-3 py-1 text-sm font-medium transition-all ${
              isProcessing || !content.trim()
                ? 'text-gray-600 border-gray-600 cursor-not-allowed'
                : 'text-white hover:bg-white hover:text-black'
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
