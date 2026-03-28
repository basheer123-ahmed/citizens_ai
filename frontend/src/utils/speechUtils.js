let activeAudioFrame = null;

export const speak = (text, lang = 'te-IN') => {
  // IF language === "te-IN": use Google Translate TTS (Iframe Proxy fix for CORS/Source errors)
  if (lang === 'te-IN' || lang.startsWith('te')) {
    // Cleanup previous frame
    if (activeAudioFrame) {
      document.body.removeChild(activeAudioFrame);
      activeAudioFrame = null;
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=te&client=tw-ob`;
    
    // Create a hidden iframe to trigger the audio playback via browser navigation context
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    iframe.setAttribute('allow', 'autoplay');
    document.body.appendChild(iframe);
    activeAudioFrame = iframe;
    
    // Auto-remove after estimated duration (approx 200ms per word + buffer)
    const duration = Math.max(3000, text.split(' ').length * 1000);
    setTimeout(() => {
      if (activeAudioFrame === iframe) {
        document.body.removeChild(iframe);
        activeAudioFrame = null;
      }
    }, duration);
    return;
  }

  // ELSE: use existing speech function (English/Others)
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-Speech not supported in this environment.');
    return;
  }

  window.speechSynthesis.cancel();

  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.toLowerCase().includes(lang.split('-')[0])) || voices[0];
    
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  }, 100);
};

export const stopSpeech = () => {
  if (activeAudioFrame) {
    document.body.removeChild(activeAudioFrame);
    activeAudioFrame = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
