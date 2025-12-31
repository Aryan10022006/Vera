import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
  placeholder?: string;
  className?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

/**
 * VoiceRecorder Component
 * 
 * Voice-to-text interface for natural language project creation
 * 
 * Features:
 * - Web Speech API integration
 * - Real-time transcription display
 * - Confidence scoring
 * - Error handling with fallback
 * - Supports continuous listening
 * 
 * Requirements: 1.1, 1.2, 1.5, 8.1, 8.5
 * Property 1: Voice-to-Text Conversion Performance
 */
export default function VoiceRecorder({ 
  onTranscriptComplete, 
  placeholder = "Click the microphone to start speaking...",
  className = ""
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;
        
        if (result.isFinal) {
          finalText += transcriptText + ' ';
          setConfidence(result[0].confidence);
        } else {
          interimText += transcriptText;
        }
      }

      if (finalText) {
        setTranscript(prev => prev + finalText);
      }
      setInterimTranscript(interimText);

      // Property 1: Voice-to-Text Conversion Performance (< 2 seconds)
      const elapsedTime = Date.now() - startTimeRef.current;
      if (finalText && elapsedTime > 2000) {
        console.warn(`Voice conversion took ${elapsedTime}ms (exceeds 2s threshold)`);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}. ${event.message || 'Please try again.'}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
      
      // Send final transcript to parent
      if (transcript.trim()) {
        onTranscriptComplete(transcript.trim());
      }
    };

    recognition.onstart = () => {
      startTimeRef.current = Date.now();
      setError(null);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript, onTranscriptComplete]);

  const startRecording = () => {
    if (!recognitionRef.current || !isSupported) return;

    try {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  };

  if (!isSupported) {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <div>
            <p className="font-medium">Speech Recognition Not Supported</p>
            <p className="text-sm text-red-400/80 mt-1">
              Please use Google Chrome or Microsoft Edge for voice input.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Recording Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={toggleRecording}
          disabled={!isSupported}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-300 transform hover:scale-105
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-gradient-to-r from-vera-600 to-vera-500 hover:from-vera-500 hover:to-vera-600'
            }
            ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'shadow-xl shadow-vera-500/20'}
          `}
        >
          {isRecording ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
          
          {/* Recording indicator */}
          {isRecording && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
          )}
        </button>
      </div>

      {/* Status Text */}
      <div className="text-center">
        {isRecording ? (
          <div className="flex items-center justify-center gap-2 text-red-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-medium">Listening...</span>
          </div>
        ) : transcript ? (
          <div className="flex items-center justify-center gap-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Recording Complete</span>
          </div>
        ) : (
          <p className="text-slate-400">{placeholder}</p>
        )}
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="card p-6 bg-slate-900/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-300">Transcript</h3>
            {confidence > 0 && (
              <div className="text-xs text-slate-500">
                Confidence: {Math.round(confidence * 100)}%
              </div>
            )}
          </div>
          
          <div className="text-white leading-relaxed">
            {transcript}
            {interimTranscript && (
              <span className="text-slate-400 italic"> {interimTranscript}</span>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={clearTranscript}
              className="btn-ghost text-sm"
            >
              Clear
            </button>
            <button
              onClick={() => onTranscriptComplete(transcript.trim())}
              className="btn-primary text-sm flex-1"
              disabled={!transcript.trim()}
            >
              Use This Text
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isRecording && !transcript && (
        <div className="text-center text-sm text-slate-500 space-y-2">
          <p>💡 <strong>Tip:</strong> Speak naturally about your project</p>
          <p className="text-xs">
            Example: "I need a React dashboard with user authentication and data visualization.
            The budget is 2 ETH and I need it completed in 30 days."
          </p>
        </div>
      )}
    </div>
  );
}
