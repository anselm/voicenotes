import React from 'react';

const AudioRecordButton = ({ isRecording, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-8 right-8 rounded-full p-4 transition-all transform hover:scale-105 ${
        isRecording 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <rect x="6" y="6" width="8" height="8" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};

export default AudioRecordButton;
