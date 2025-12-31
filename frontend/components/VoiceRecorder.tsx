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
  const [projectListing, setProjectListing] = useState<any | null>(null);
  
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

  const createProjectListing = async () => {
    if (!transcript.trim() || !address) {
      alert('Please provide transcript and connect wallet');
      return;
    }

    setIsProcessing(true);
    try {
      // Create marketplace listing - freelancers will propose later
      const listing = {
        id: `project-${Date.now()}`,
        status: 'open',
        clientAddress: address,
        title: transcript.split('.')[0].slice(0, 100),
        description: transcript,
        budget: { total: '5.0', technical: '4.0', subjective: '1.0' },
        requirements: { technical: [], subjective: [] },
        timeline: { estimated: 14 },
        skills: [],
        createdAt: Date.now(),
        proposals: []
      };

      // Pin to IPFS
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY!,
          'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY!,
        },
        body: JSON.stringify({
          pinataContent: listing,
          pinataMetadata: {
            name: `vera-project-${listing.id}`,
            keyvalues: { projectId: listing.id, client: address, type: 'project_listing' }
          }
        })
      });

      const result = await response.json();
      const listingWithHash = { ...listing, ipfsHash: result.IpfsHash };
      setProjectListing(listingWithHash);
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create project listing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearRecording = () => {
    setTranscript('');
    setAudioBlob(null);
    setProjectListing(null);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Recording Controls - Enhanced */}
      <div className="flex justify-center items-center space-x-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`group relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
            isRecording 
              ? 'bg-gradient-to-br from-red-500 to-rose-600 voice-recording scale-110' 
              : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:scale-105 hover:shadow-indigo-500/50'
          }`}
          disabled={isProcessing}
        >
          <div className={`absolute inset-0 rounded-full ${isRecording ? 'animate-ping bg-red-400 opacity-75' : ''}`}></div>
          <div className="relative z-10">
            {isRecording ? <MicOff className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
          </div>
          {isRecording && (
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-red-100 text-red-700 px-4 py-1 rounded-full text-xs font-semibold">
              Recording...
            </div>
          )}
        </button>

        {audioBlob && (
          <button
            onClick={isPlaying ? stopPlaying : playRecording}
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 hover:scale-105 text-white flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-orange-500/50"
            disabled={isProcessing}
          >
            {isPlaying ? <Square className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
        )}

        {transcript && (
          <button
            onClick={clearRecording}
            className="px-6 py-3 text-sm bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-xl font-semibold transition-all duration-200 shadow-lg border border-slate-300"
            disabled={isProcessing}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Recording Status - Enhanced */}
      <div className="text-center min-h-[40px] flex items-center justify-center">
        {isRecording && (
          <div className="flex items-center space-x-3 bg-gradient-to-r from-red-50 to-rose-50 px-6 py-3 rounded-full border border-red-200">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-red-700 font-semibold">
              🎤 Listening... Speak naturally about your project requirements
            </p>
          </div>
        )}
        {!isRecording && !transcript && (
          <p className="text-slate-500 text-lg">
            Click the microphone button above to start recording
          </p>
        )}
      </div>

      {/* Transcript Display - Premium Card */}
      {transcript && (
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition"></div>
          <div className="relative bg-white rounded-2xl p-6 border border-blue-100 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <span>Voice Transcript</span>
              </h3>
              <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                {transcript.split(' ').length} words
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
              <p className="text-slate-700 leading-relaxed">{transcript}</p>
            </div>
          </div>
        </div>
      )}

      {/* Post to Marketplace Button - Premium */}
      {transcript && address && (
        <div className="text-center">
          <button
            onClick={createProjectListing}
            disabled={isProcessing}
            className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-pink-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition"></div>
            <div className="relative flex items-center space-x-3">
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Posting to Marketplace...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Post Project to Marketplace</span>
                </>
              )}
            </div>
          </button>
          <p className="mt-4 text-sm text-slate-600">Freelancers can browse, chat with you, and submit proposals</p>
        </div>
      )}

      {/* Project Listing Success Card */}
      {projectListing && (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-white to-green-50 rounded-3xl p-8 border-2 border-green-200 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Posted to Marketplace! 🎉
                </h3>
                <p className="text-sm text-green-600 font-medium">Freelancers can now view and propose</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-green-100">
                <div className="text-xs text-slate-500 font-semibold mb-1">Project ID</div>
                <div className="font-mono text-sm text-slate-900">{projectListing.id}</div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-green-100">
                <div className="text-xs text-slate-500 font-semibold mb-1">IPFS Hash</div>
                <div className="font-mono text-xs text-slate-900 truncate">
                  {projectListing.ipfsHash}
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-green-100">
                <div className="text-xs text-slate-500 font-semibold mb-1">Budget</div>
                <div className="text-lg font-bold text-green-600">{projectListing.budget.total} ETH</div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-green-100">
                <div className="text-xs text-slate-500 font-semibold mb-1">Timeline</div>
                <div className="text-sm text-slate-900">{projectListing.timeline.estimated} days</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-5">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                  <Upload className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-green-800 font-semibold mb-1">
                    ✅ Project Live on Marketplace
                  </p>
                  <p className="text-sm text-green-700">
                    Freelancers can browse your project, chat, and submit proposals. 
                    Smart contract deploys when you select a freelancer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}