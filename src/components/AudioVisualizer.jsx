import React from 'react';
import { useAudioVisualizer } from '../hooks/useAudioVisualizer';

const AudioVisualizer = ({ isActive }) => {
  const canvasRef = useAudioVisualizer(isActive);

  return (
    <div className="w-full h-32 bg-gray-900 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={800}
        height={128}
      />
    </div>
  );
};

export default AudioVisualizer;
