import React from 'react';

const RecordingControls = ({ 
  isRecording, 
  isPaused, 
  onStart, 
  onStop, 
  onPause, 
  onResume,
  duration 
}) => {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-4xl font-mono text-white">
        {formatDuration(duration)}
      </div>
      
      <div className="flex items-center space-x-4">
        {!isRecording ? (
          <button
            onClick={onStart}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-6 transition-all transform hover:scale-105 shadow-lg"
            aria-label="Start recording"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" />
            </svg>
          </button>
        ) : (
          <>
            <button
              onClick={onStop}
              className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-4 transition-all transform hover:scale-105 shadow-lg"
              aria-label="Stop recording"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <rect x="6" y="6" width="8" height="8" />
              </svg>
            </button>
            
            {!isPaused ? (
              <button
                onClick={onPause}
                className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-4 transition-all transform hover:scale-105 shadow-lg"
                aria-label="Pause recording"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="6" y="5" width="3" height="10" />
                  <rect x="11" y="5" width="3" height="10" />
                </svg>
              </button>
            ) : (
              <button
                onClick={onResume}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 transition-all transform hover:scale-105 shadow-lg"
                aria-label="Resume recording"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 4l10 6-10 6V4z" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecordingControls;
