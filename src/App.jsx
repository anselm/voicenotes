import React, { useState, useCallback } from 'react';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useLocalStorage } from './hooks/useLocalStorage';
import AudioVisualizer from './components/AudioVisualizer';
import RecordingControls from './components/RecordingControls';
import TranscriptDisplay from './components/TranscriptDisplay';
import StatusBar from './components/StatusBar';
import NotesList from './components/NotesList';

function App() {
  const [activeTab, setActiveTab] = useState('record');
  
  const {
    isRecording,
    isPaused,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useAudioRecorder();

  const {
    transcript,
    interimTranscript,
    resetTranscript,
  } = useSpeechRecognition(isRecording && !isPaused);

  const {
    notes,
    saveNote,
    deleteNote,
    getAudioUrl,
  } = useLocalStorage();

  const handleStop = useCallback(async () => {
    stopRecording();
    
    if (audioBlob || duration > 0) {
      // Wait a bit for the final audio blob to be ready
      setTimeout(async () => {
        const recorder = useAudioRecorder.getState?.();
        const finalBlob = recorder?.audioBlob || audioBlob;
        if (finalBlob) {
          await saveNote(finalBlob, transcript, duration);
          resetTranscript();
        }
      }, 100);
    }
  }, [stopRecording, audioBlob, transcript, duration, saveNote, resetTranscript]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Audio Notes Recorder
          </h1>
          <p className="text-gray-400">Record, transcribe, and save your audio notes</p>
        </header>

        <div className="mb-6">
          <StatusBar />
        </div>

        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('record')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'record'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              Record
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              My Notes ({notes.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'record' ? (
              <div className="space-y-6">
                <AudioVisualizer isActive={isRecording && !isPaused} />
                
                <RecordingControls
                  isRecording={isRecording}
                  isPaused={isPaused}
                  onStart={startRecording}
                  onStop={handleStop}
                  onPause={pauseRecording}
                  onResume={resumeRecording}
                  duration={duration}
                />
                
                <TranscriptDisplay
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                />
              </div>
            ) : (
              <NotesList
                notes={notes}
                onDelete={deleteNote}
                getAudioUrl={getAudioUrl}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
