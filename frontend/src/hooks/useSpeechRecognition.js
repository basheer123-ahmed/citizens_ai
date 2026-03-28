import { useState, useEffect, useCallback, useRef } from 'react';

const useSpeechRecognition = (options = {}) => {
  const {
    lang = 'te-IN',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
    onEnd
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Neural Synthesis Protocol: Browser does not support speech recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      if (onResult) onResult(currentTranscript, event.results[event.results.length - 1].isFinal);
    };

    recognition.onerror = (event) => {
      let errorMessage = 'Protocol Error: Signal interruption.';
      let shouldRestart = false;

      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Security Breach: Microphone access denied.';
          break;
        case 'no-speech':
          errorMessage = 'Signal Lost: No audio detected.';
          shouldRestart = true;
          break;
        case 'network':
          errorMessage = 'Link Down: Network failure.';
          shouldRestart = true;
          break;
        default:
          errorMessage = `Neural Error: ${event.error}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
      if (onError) onError(event);

      if (shouldRestart && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Auto-restart failed:", e);
          }
        }, 100);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (onEnd) onEnd();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [lang, continuous, interimResults, onResult, onError, onEnd]);

  const start = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Link stabilization failed:", err);
      }
    }
  }, [isListening]);

  const stop = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    start,
    stop,
    resetTranscript,
    supported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
};

export default useSpeechRecognition;
