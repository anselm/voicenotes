import React from 'react';

const TranscriptDisplay = ({ transcript, interimTranscript }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 h-32 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-400 mb-2">Live Transcription</h3>
      <p className="text-white">
        {transcript}
        <span className="text-gray-400 italic">{interimTranscript}</span>
      </p>
      {!transcript && !interimTranscript && (
        <p className="text-gray-500 italic">Start speaking to see transcription...</p>
      )}
    </div>
  );
};

export default TranscriptDisplay;
