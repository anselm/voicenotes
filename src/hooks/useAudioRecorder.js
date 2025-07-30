import { useState, useRef, useCallback, useEffect } from 'react';
import { eventBus, EVENTS } from '../utils/eventBus';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedDurationRef = useRef(0);
  const animationFrameRef = useRef(null);

  const updateDuration = useCallback(() => {
    if (startTimeRef.current && !isPaused) {
      const elapsed = Date.now() - startTimeRef.current - pausedDurationRef.current;
      setDuration(Math.floor(elapsed / 1000));
      animationFrameRef.current = requestAnimationFrame(updateDuration);
    }
  }, [isPaused]);

  const startRecording = useCallback(async () => {
    try {
      eventBus.emit(EVENTS.STATUS_UPDATE, { message: 'Requesting microphone access...', type: 'info' });
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        eventBus.emit(EVENTS.RECORDING_STOPPED, { duration });
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;
      updateDuration();
      
      eventBus.emit(EVENTS.RECORDING_STARTED);
      eventBus.emit(EVENTS.STATUS_UPDATE, { message: 'Recording started', type: 'success' });
    } catch (error) {
      console.error('Error starting recording:', error);
      eventBus.emit(EVENTS.ERROR, { message: 'Failed to start recording', error });
      eventBus.emit(EVENTS.STATUS_UPDATE, { message: 'Failed to access microphone', type: 'error' });
    }
  }, [duration, updateDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
      cancelAnimationFrame(animationFrameRef.current);
      eventBus.emit(EVENTS.STATUS_UPDATE, { message: 'Recording stopped', type: 'info' });
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      pausedDurationRef.current += Date.now() - startTimeRef.current;
      cancelAnimationFrame(animationFrameRef.current);
      eventBus.emit(EVENTS.RECORDING_PAUSED);
      eventBus.emit(EVENTS.STATUS_UPDATE, { message: 'Recording paused', type: 'info' });
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimeRef.current = Date.now();
      updateDuration();
      eventBus.emit(EVENTS.RECORDING_RESUMED);
      eventBus.emit(EVENTS.STATUS_UPDATE, { message: 'Recording resumed', type: 'info' });
    }
  }, [isRecording, isPaused, updateDuration]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return {
    isRecording,
    isPaused,
    audioBlob,
    audioUrl,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
};
