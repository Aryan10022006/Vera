'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, X, Mic, Paperclip, Circle } from 'lucide-react';
import { ChatMessage } from '@/types/marketplace';
import { useAccount } from 'wagmi';

interface ChatInterfaceProps {
  projectId: string;
  otherPartyAddress: string;
  otherPartyType: 'client' | 'freelancer';
  onClose: () => void;
}

export function ChatInterface({ projectId, otherPartyAddress, otherPartyType, onClose }: ChatInterfaceProps) {
  const { address } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time messages
    connectWebSocket();
    loadMessageHistory();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        // Subscribe to project chat
        ws.send(JSON.stringify({
          type: 'subscribe',
          projectId,
          address
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_message' && data.projectId === projectId) {
          setMessages(prev => [...prev, data.message]);
        } else if (data.type === 'typing' && data.projectId === projectId) {
          setIsTyping(data.isTyping);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  };

  const loadMessageHistory = async () => {
    try {
      // TODO: Load from IPFS/backend
      const mockMessages: ChatMessage[] = [];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading message history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !address) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      projectId,
      sender: address,
      senderType: otherPartyType === 'client' ? 'freelancer' : 'client',
      content: newMessage,
      timestamp: Date.now(),
      read: false
    };

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        message
      }));
    }

    // Optimistic update
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleTyping = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        projectId,
        isTyping: true
      }));

      // Clear typing after 3 seconds
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'typing',
            projectId,
            isTyping: false
          }));
        }
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {otherPartyType === 'client' ? 'C' : 'F'}
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold">
                Chat with {otherPartyType === 'client' ? 'Client' : 'Freelancer'}
              </h3>
              <div className="flex items-center space-x-2">
                <Circle className={`w-2 h-2 ${isConnected ? 'fill-green-400 text-green-400' : 'fill-red-400 text-red-400'}`} />
                <span className="text-white/80 text-xs">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-slate-600 font-semibold">No messages yet</p>
              <p className="text-slate-500 text-sm mt-2">Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isOwn = msg.sender === address;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isOwn
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-xs mt-1 block ${isOwn ? 'text-white/70' : 'text-slate-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="flex items-center space-x-3">
            <button className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
              <Paperclip className="w-5 h-5 text-slate-600" />
            </button>
            <button className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
              <Mic className="w-5 h-5 text-slate-600" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
