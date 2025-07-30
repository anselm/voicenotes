import { useEffect, useRef, useState, useCallback } from 'react';
import { eventBus, EVENTS } from '../utils/eventBus';

export const useSpeechRecognition = (isActive) => {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);

  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: 'Speech recognition not supported in this browser', 
        type: 'warning' 
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: 'Speech recognition started', 
        type: 'info' 
      });
    };

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + ' ';
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript(prev => prev + finalText);
        eventBus.emit(EVENTS.TRANSCRIPTION_FINAL, { text: finalText });
      }
      
      setInterimTranscript(interimText);
      eventBus.emit(EVENTS.TRANSCRIPTION_UPDATE, { text: interimText });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      eventBus.emit(EVENTS.ERROR, { 
        message: `Speech recognition error: ${event.error}`, 
        error: event.error 
      });
    };

    recognition.onend = () => {
      eventBus.emit(EVENTS.STATUS_UPDATE, { 
        message: 'Speech recognition ended', 
        type: 'info' 
      });
      
      // Restart if still active
      if (isActive && recognitionRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
        }
      }
    };

    recognitionRef.current = recognition;
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      initializeRecognition();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error starting recognition:', error);
        }
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isActive, initializeRecognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    transcript,
    interimTranscript,
    resetTranscript,
  };
};
