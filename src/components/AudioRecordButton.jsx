import React from 'react';

const AudioRecordButton = ({ isRecording, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-8 right-8 border border-white p-4 transition-all ${
        isRecording 
          ? 'bg-white text-black animate-pulse' 
          : 'bg-black text-white hover:bg-white hover:text-black'
      }`}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <rect x="6" y="6" width="8" height="8" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};

export default AudioRecordButton;
