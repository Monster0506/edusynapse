import { useRef, useState } from 'react';

export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const synth = useRef<SpeechSynthesis | null>(null);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !text) return;
    
    synth.current = window.speechSynthesis;

    if (isPlaying) {
      synth.current.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice to Microsoft Mark
    const voices = synth.current.getVoices();
    const markVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('microsoft mark') && 
      voice.lang.toLowerCase().includes('en-')
    );
    
    if (markVoice) {
      console.log("Using voice:", markVoice.name, markVoice.lang);
      utterance.voice = markVoice;
    } else {
      console.warn("Microsoft Mark voice not found, using default voice");
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (event) => {
      console.error("TTS Error:", event);
      setIsPlaying(false);
    };

    setIsPlaying(true);
    synth.current.speak(utterance);
  };

  const stop = () => {
    if (synth.current) {
      synth.current.cancel();
      setIsPlaying(false);
    }
  };

  return {
    speak,
    stop,
    isPlaying
  };
};
