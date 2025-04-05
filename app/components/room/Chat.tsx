'use client'

import { useState, useEffect, useRef } from 'react'
import { socket } from '@/lib/socket'
import { FiSend } from 'react-icons/fi'

interface Message {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: number
}

interface ChatProps {
  roomId: string
  userId: string
  userName: string
  isHost: boolean
}

export default function Chat({ roomId, userId, userName, isHost }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'chat' | 'youtube'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleChatMessage = (message: Message) => {
      setMessages((prev) => [...prev, message])
    }

    socket.on('chatMessage', handleChatMessage)

    return () => {
      socket.off('chatMessage', handleChatMessage)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: `${Date.now()}-${userId}`,
      userId,
      userName,
      text: newMessage.trim(),
      timestamp: Date.now(),
    }

    socket.emit('chatMessage', { roomId, message })
    setNewMessage('')
  }

  // Function to generate consistent color based on username
  const generateUserColor = (name: string) => {
    const colors = [
      'bg-[#7C3AED]', // Purple
      'bg-[#F59E0B]', // Orange
      'bg-[#10B981]', // Green
      'bg-[#3B82F6]', // Blue
      'bg-[#EC4899]', // Pink
    ]
    
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      {/* Chat header with tabs */}
      <div className="p-4 border-b border-[#2a2a2a]">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('chat')}
            className={`text-lg font-semibold transition-all duration-200 ${
              activeTab === 'chat'
                ? 'text-white relative after:absolute after:bottom-[-1rem] after:left-0 after:w-full after:h-0.5 after:bg-[#00a8ff] after:rounded-full'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('youtube')}
            className={`text-lg font-semibold transition-all duration-200 ${
              activeTab === 'youtube'
                ? 'text-white relative after:absolute after:bottom-[-1rem] after:left-0 after:w-full after:h-0.5 after:bg-[#00a8ff] after:rounded-full'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            YouTube
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.userId === userId ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* User avatar */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${generateUserColor(message.userName)} flex items-center justify-center text-white font-semibold shadow-lg`}>
              {message.userName.charAt(0).toUpperCase()}
            </div>

            {/* Message content */}
            <div className={`flex flex-col ${message.userId === userId ? 'items-end' : 'items-start'}`}>
              <div className="flex items-end space-x-2 max-w-[280px]">
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    message.userId === userId
                      ? 'bg-[#00a8ff] text-white rounded-br-sm'
                      : 'bg-[#2a2a2a] text-white rounded-bl-sm'
                  }`}
                >
                  {message.userId !== userId && (
                    <span className="block text-sm font-medium mb-1 opacity-90">
                      {message.userName}
                      {message.userId === roomId && ' (Host)'}
                    </span>
                  )}
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-1 px-2">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#2a2a2a] text-white placeholder-gray-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00a8ff] border border-[#3a3a3a] transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00a8ff] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0088cc] transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-[#00a8ff]/20"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
} 