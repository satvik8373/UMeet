'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  userId: string
  text: string
  timestamp: string
  userEmail: string
  userName: string
}

interface ChatPanelProps {
  socket: Socket | null
  roomId: string
  userId: string
  currentUserName: string
}

export default function ChatPanel({ socket, roomId, userId, currentUserName }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!socket) return

    socket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socket.off('message')
    }
  }, [socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !newMessage.trim()) return

    socket.emit('message', {
      roomId,
      userId,
      text: newMessage,
      userName: currentUserName
    })

    setNewMessage('')
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex flex-col ${
                message.userId === userId ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.userId === userId
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm font-medium mb-1">{message.userName || message.userEmail}</p>
                <p>{message.text}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-field"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-primary px-6"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
} 