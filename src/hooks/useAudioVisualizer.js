import { useEffect, useRef, useCallback } from 'react';

export const useAudioVisualizer = (isActive) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  const initializeAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      sourceRef.current.connect(analyserRef.current);
      
      return true;
    } catch (error) {
      console.error('Error initializing audio context:', error);
      return false;
    }
  }, []);

  const draw = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawVisual = () => {
      animationIdRef.current = requestAnimationFrame(drawVisual);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(17, 24, 39)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, 'rgb(59, 130, 246)');
        gradient.addColorStop(0.5, 'rgb(147, 51, 234)');
        gradient.addColorStop(1, 'rgb(236, 72, 153)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    drawVisual();
  }, []);

  useEffect(() => {
    if (isActive) {
      initializeAudioContext().then((success) => {
        if (success) {
          draw();
        }
      });
    } else {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isActive, draw, initializeAudioContext]);

  return canvasRef;
};
