'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, Clock } from 'lucide-react';
import { ChatMessage, ProjectChat as ProjectChatType } from '@/types/marketplace';
import { useAccount } from 'wagmi';

interface ProjectChatProps {
  projectId: string;
  otherParty: string;
  onClose?: () => void;
}

export function ProjectChat({ projectId, otherParty, onClose }: ProjectChatProps) {
  const { address } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock chat data
  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        projectId,
        sender: otherParty,
        senderType: 'client',
        content: 'Hi! Thanks for your proposal. I have a few questions about your approach.',
        timestamp: Date.now() - 3600000,
        read: true
      },
      {
        id: '2',
        projectId,
        sender: address || '',
        senderType: 'freelancer',
        content: 'Happy to answer! What would you like to know?',
        timestamp: Date.now() - 3000000,
        read: true
      },
      {
        id: '3',
        projectId,
        sender: otherParty,
        senderType: 'client',
        content: 'How do you plan to handle the TheGraph integration? Which subgraphs will you use?',
        timestamp: Date.now() - 1800000,
        read: true
      }
    ];
    setMessages(mockMessages);
  }, [projectId, otherParty, address]);

  const handleSend = () => {
    if (!newMessage.trim() || !address) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      projectId,
      sender: address,
      senderType: 'freelancer',
      content: newMessage,
      timestamp: Date.now(),
      read: false
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // In production: Send via WebSocket/IPFS
    // websocket.send(JSON.stringify(message));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white">
                {otherParty.substring(0, 6)}...{otherParty.substring(38)}
              </div>
              <div className="text-xs text-indigo-100">Client</div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
        {messages.map((message) => {
          const isOwn = message.sender === address;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  isOwn
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-900 shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div
                  className={`flex items-center space-x-1 mt-2 text-xs ${
                    isOwn ? 'text-indigo-100' : 'text-slate-500'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-slate-50 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
