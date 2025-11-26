"use client";

import { useState, useCallback, useRef } from "react";

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fallbackToWebSpeech = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to select a male voice
      const voices = window.speechSynthesis.getVoices();
      const maleVoice = voices.find(
        (voice) =>
          voice.lang.startsWith("en") &&
          (voice.name.toLowerCase().includes("male") ||
            voice.name.toLowerCase().includes("david") ||
            voice.name.toLowerCase().includes("james") ||
            voice.name.toLowerCase().includes("daniel"))
      );
      if (maleVoice) {
        utterance.voice = maleVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (typeof window === "undefined") {
      console.error("Window is not defined");
      return;
    }

    // Cancel any ongoing speech
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsSpeaking(true);

    try {
      // Call the server-side TTS API
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("TTS Error:", data.error);
        // Fallback to browser speech synthesis if server TTS fails
        fallbackToWebSpeech(text);
        return;
      }

      // Create audio from base64
      const audioBlob = base64ToBlob(data.audioContent, data.contentType);
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        console.error("Audio playback error");
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      console.error("Error calling TTS API:", error);
      // Fallback to browser speech synthesis
      fallbackToWebSpeech(text);
    }
  }, [fallbackToWebSpeech]);

  const cancel = useCallback(() => {
    // Cancel audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    // Also cancel any web speech synthesis (fallback)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    isSpeaking,
    cancel,
  };
}
