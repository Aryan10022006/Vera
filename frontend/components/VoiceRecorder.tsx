'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Square, Upload } from 'lucide-react';
import { useAccount } from 'wagmi';
import { generateAgreementFromVoice, pinAgreementToIPFS, Agreement } from '@/lib/ipfs';

interface VoiceRecorderProps {
  onAgreementCreated?: (agreement: Agreement, ipfsHash: string) => void;
}

export function VoiceRecorder({ onAgreementCreated }: VoiceRecorderProps) {
  const { address } = useAccount();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [freelancerAddress, setFreelancerAddress] = useState('');
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript + ' ');
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const generateAgreement = async () => {
    if (!transcript.trim() || !address || !freelancerAddress) {
      alert('Please provide transcript, connect wallet, and enter freelancer address');
      return;
    }

    setIsProcessing(true);
    try {
      // Generate agreement from voice transcript
      const newAgreement = generateAgreementFromVoice(
        transcript,
        address,
        freelancerAddress
      );

      // Pin to IPFS
      const ipfsHash = await pinAgreementToIPFS(newAgreement);
      newAgreement.ipfsHash = ipfsHash;

      setAgreement(newAgreement);
      onAgreementCreated?.(newAgreement, ipfsHash);

      console.log('Agreement created and pinned to IPFS:', {
        projectId: newAgreement.projectId,
        ipfsHash,
        title: newAgreement.title
      });
    } catch (error) {
      console.error('Error generating agreement:', error);
      alert('Failed to generate agreement. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearRecording = () => {
    setTranscript('');
    setAudioBlob(null);
    setAgreement(null);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Recording Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
            isRecording 
              ? 'bg-vera-error text-white voice-recording' 
              : 'bg-vera-primary hover:bg-vera-primary/90 text-white'
          }`}
          disabled={isProcessing}
        >
          {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {audioBlob && (
          <button
            onClick={isPlaying ? stopPlaying : playRecording}
            className="w-12 h-12 rounded-full bg-vera-accent hover:bg-vera-accent/90 text-white flex items-center justify-center transition-all duration-200"
            disabled={isProcessing}
          >
            {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        )}

        {transcript && (
          <button
            onClick={clearRecording}
            className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            Clear
          </button>
        )}
      </div>

      {/* Recording Status */}
      <div className="text-center">
        {isRecording && (
          <p className="text-vera-primary font-medium animate-pulse">
            🎤 Recording... Speak naturally about your project
          </p>
        )}
        {!isRecording && !transcript && (
          <p className="text-slate-600">
            Click the microphone to start recording your project description
          </p>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Transcript:</h3>
          <p className="text-slate-700 leading-relaxed">{transcript}</p>
        </div>
      )}

      {/* Freelancer Address Input */}
      {transcript && (
        <div className="card p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Freelancer Ethereum Address:
          </label>
          <input
            type="text"
            value={freelancerAddress}
            onChange={(e) => setFreelancerAddress(e.target.value)}
            placeholder="0x..."
            className="input-field"
            disabled={isProcessing}
          />
        </div>
      )}

      {/* Generate Agreement Button */}
      {transcript && freelancerAddress && address && (
        <div className="text-center">
          <button
            onClick={generateAgreement}
            disabled={isProcessing}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Agreement...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Generate Agreement & Pin to IPFS</span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Agreement Preview */}
      {agreement && (
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-vera-primary">Agreement Created! 🎉</h3>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Project ID:</strong> {agreement.projectId}
            </div>
            <div>
              <strong>IPFS Hash:</strong> 
              <code className="ml-1 text-xs bg-slate-100 px-1 rounded">
                {agreement.ipfsHash?.substring(0, 20)}...
              </code>
            </div>
            <div>
              <strong>Title:</strong> {agreement.title}
            </div>
            <div>
              <strong>Total Amount:</strong> {(parseInt(agreement.payment.total) / 1e18).toFixed(4)} ETH
            </div>
            <div>
              <strong>Technical Requirements:</strong> {agreement.requirements.technical.length}
            </div>
            <div>
              <strong>Subjective Requirements:</strong> {agreement.requirements.subjective.length}
            </div>
          </div>

          <div className="bg-vera-success/10 border border-vera-success/20 rounded-lg p-4">
            <p className="text-vera-success text-sm">
              ✅ Agreement successfully pinned to IPFS! You can now create the project on-chain.
            </p>
          </div>
        </div>
      )}

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}