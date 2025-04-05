'use client'

import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { GiphyFetch } from '@giphy/js-fetch-api'
import {
  FiSend,
  FiPlus,
  FiImage,
  FiSmile,
  FiPaperclip,
  FiGift,
  FiSearch
} from 'react-icons/fi'
import { BsChatDots, BsYoutube, BsPeople } from 'react-icons/bs'

interface Message {
  id: string
  userId: string
  userEmail: string
  userName: string
  text: string
  timestamp: number
  type: 'room' | 'youtube'
}

interface Participant {
  userId: string
  userEmail: string
  userName: string
  isOnline?: boolean
}

interface EnhancedChatProps {
  messages: Message[]
  onSendMessage: (text: string) => void
  currentUserEmail: string
  currentUserName: string
  youtubeVideoId?: string
  participants: Participant[]
}

type TabType = 'chat' | 'youtube' | 'participants'

export default function EnhancedChat({
  messages,
  onSendMessage,
  currentUserEmail,
  currentUserName,
  youtubeVideoId,
  participants = []
}: EnhancedChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const [isFeatureMenuOpen, setIsFeatureMenuOpen] = useState(false)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false)
  const [gifSearch, setGifSearch] = useState('')
  const [gifResults, setGifResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const featureMenuRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const gifPickerRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Giphy client with your API key
  const giphyFetch = new GiphyFetch('JXPMSMGDmXNE8LxEFi9SpKXfjbsJFFTc')

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (featureMenuRef.current && !featureMenuRef.current.contains(event.target as Node)) {
        setIsFeatureMenuOpen(false)
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setIsEmojiPickerOpen(false)
      }
      if (gifPickerRef.current && !gifPickerRef.current.contains(event.target as Node)) {
        setIsGifPickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Function to check if chat is scrolled near bottom
  const isNearBottom = () => {
    if (!chatContainerRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    return scrollHeight - scrollTop - clientHeight < 100
  }

  // Handle scroll events to determine if we should auto-scroll
  const handleScroll = () => {
    setShouldAutoScroll(isNearBottom())
  }

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current && shouldAutoScroll) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }

  // Effect for handling new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    onSendMessage(newMessage)
    setNewMessage('')
    // Force scroll to bottom when sending a message
    setShouldAutoScroll(true)
    setTimeout(scrollToBottom, 100) // Small delay to ensure message is rendered
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

  const tabs = [
    { id: 'chat', icon: BsChatDots, label: 'Chat' },
    { id: 'youtube', icon: BsYoutube, label: 'YouTube', condition: !!youtubeVideoId },
    { id: 'participants', icon: BsPeople, label: 'Participants' }
  ].filter(tab => tab.condition !== false)

  const renderMessageContent = (text: string) => {
    // Check if the message is a GIF/image
    const imageMatch = text.match(/!\[(.*?)\]\((.*?)\)/)
    if (imageMatch) {
      return (
        <img 
          src={imageMatch[2]} 
          alt={imageMatch[1] || 'GIF'} 
          className="max-w-full rounded-lg shadow-lg"
          style={{ maxHeight: '200px' }}
        />
      )
    }
    return <p className="text-sm leading-relaxed break-words">{text}</p>
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'participants':
        return (
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
            <div className="grid grid-cols-1 gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center p-3 bg-[#2a2a2a]/60 backdrop-blur-sm rounded-2xl border border-[#3a3a3a]/30"
                >
                  <div className={`flex-shrink-0 w-9 h-9 ${generateUserColor(participant.userName)} rounded-xl flex items-center justify-center text-white font-semibold shadow-inner`}>
                    {participant.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">
                      {participant.userName}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${participant.isOnline ? 'bg-green-500' : 'bg-gray-500'} shadow-lg shadow-${participant.isOnline ? 'green' : 'gray'}-500/20`}></div>
                      <span className="ml-1.5 text-xs text-gray-400">
                        {participant.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'youtube':
        return (
          <div className="flex-1 overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/live_chat?v=${youtubeVideoId}&embed_domain=${typeof window !== 'undefined' ? window.location.hostname : ''}&dark_theme=1`}
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )
      default:
        return (
          <>
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent"
            >
              {messages && messages.length > 0 ? (
                messages
                  .filter(msg => msg.type === 'room')
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-end space-x-2 ${
                        message.userEmail === currentUserEmail ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className="flex flex-col space-y-1 max-w-[75%]">
                        {message.userEmail !== currentUserEmail && (
                          <span className="text-xs text-gray-400 px-2">
                            {message.userName}
                          </span>
                        )}
                        <div className={`flex items-end ${message.userEmail === currentUserEmail ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`px-4 py-2.5 ${
                              message.userEmail === currentUserEmail
                                ? 'bg-gradient-to-br from-[#00a8ff] to-[#0088cc] text-white rounded-2xl rounded-br-md shadow-lg shadow-[#00a8ff]/20'
                                : 'bg-[#2a2a2a]/60 backdrop-blur-sm text-white rounded-2xl rounded-bl-md shadow-lg shadow-black/10 border border-[#3a3a3a]/30'
                            }`}
                          >
                            {renderMessageContent(message.text)}
                          </div>
                        </div>
                        <span className={`text-[10px] text-gray-500 ${
                          message.userEmail === currentUserEmail ? 'text-right' : 'text-left'
                        } px-2`}>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} className="h-0" />
            </div>

            {/* Message input with features */}
            <div className="p-3 bg-[#1a1a1a]/80 backdrop-blur-md border-t border-[#2a2a2a]/50">
              <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFeatureMenuOpen(!isFeatureMenuOpen)}
                    className="p-2 rounded-xl bg-[#2a2a2a]/60 text-gray-400 hover:text-[#00a8ff] transition-colors duration-200"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>

                  {/* Feature menu */}
                  {isFeatureMenuOpen && (
                    <div
                      ref={featureMenuRef}
                      className="absolute bottom-full left-0 mb-2 w-48 bg-[#2a2a2a]/95 backdrop-blur-md rounded-xl shadow-xl border border-[#3a3a3a]/50 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        {features.map((feature) => (
                          <div key={feature.label} className="relative">
                            {feature.action === 'upload' && (
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            )}
                            <button
                              type="button"
                              onClick={feature.onClick || (() => feature.action !== 'upload' && setIsFeatureMenuOpen(false))}
                              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-[#3a3a3a]/50 transition-colors duration-200"
                            >
                              <feature.icon className={`w-5 h-5 ${feature.color}`} />
                              <span className="text-sm text-gray-300">{feature.label}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emoji Picker */}
                  {isEmojiPickerOpen && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute bottom-full left-0 mb-2"
                    >
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}

                  {/* GIF Picker */}
                  {isGifPickerOpen && (
                    <div
                      ref={gifPickerRef}
                      className="absolute bottom-full left-0 mb-2 w-80 bg-[#2a2a2a]/95 backdrop-blur-md rounded-xl shadow-xl border border-[#3a3a3a]/50 overflow-hidden"
                    >
                      <div className="p-3">
                        <div className="relative">
                          <input
                            type="text"
                            value={gifSearch}
                            onChange={(e) => handleGifSearch(e.target.value)}
                            placeholder="Search GIFs..."
                            className="w-full bg-[#3a3a3a]/50 text-white text-sm placeholder-gray-400 px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a8ff]/50"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <FiSearch className="w-4 h-4" />
                          </div>
                          {isSearching && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-[#00a8ff] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-transparent">
                          {gifResults.length > 0 ? (
                            gifResults.map((gif) => (
                              <button
                                key={gif.id}
                                onClick={() => onGifSelect(gif)}
                                className="relative aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-[#00a8ff] transition-all duration-200"
                              >
                                <img
                                  src={gif.images.preview_gif.url}
                                  alt={gif.title}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))
                          ) : gifSearch ? (
                            <div className="col-span-2 py-8 text-center text-gray-400">
                              {isSearching ? 'Searching...' : 'No GIFs found'}
                            </div>
                          ) : (
                            <div className="col-span-2 py-8 text-center text-gray-400">
                              Search for GIFs to get started
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#2a2a2a]/60 backdrop-blur-sm text-white text-sm placeholder-gray-400 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a8ff]/50 border border-[#3a3a3a]/30"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#00a8ff] to-[#0088cc] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#00a8ff]/20 hover:shadow-xl hover:shadow-[#00a8ff]/30 transition-all duration-200"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file)
    }
    setIsFeatureMenuOpen(false)
  }

  // Search GIFs with debounce
  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      setGifResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data } = await giphyFetch.search(query, { 
        limit: 10,
        rating: 'g',
        type: 'gifs'
      })
      setGifResults(data)
    } catch (error) {
      console.error('Error searching GIFs:', error)
      setGifResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle GIF search input with debounce
  const handleGifSearch = (value: string) => {
    setGifSearch(value)
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchGifs(value)
    }, 500)
  }

  // Handle emoji selection
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji)
    setIsEmojiPickerOpen(false)
  }

  // Handle GIF selection
  const onGifSelect = (gif: any) => {
    const gifUrl = gif.images.original.url
    onSendMessage(`![GIF](${gifUrl})`)
    setIsGifPickerOpen(false)
    setGifSearch('')
    setGifResults([])
  }

  const features = [
    { 
      icon: FiImage, 
      label: 'Photo', 
      action: 'upload',
      color: 'text-blue-400'
    },
    { 
      icon: FiGift, 
      label: 'GIF', 
      action: 'gif',
      color: 'text-purple-400',
      onClick: () => {
        setIsGifPickerOpen(true)
        setIsFeatureMenuOpen(false)
      }
    },
    { 
      icon: FiSmile, 
      label: 'Emoji', 
      action: 'emoji',
      color: 'text-yellow-400',
      onClick: () => {
        setIsEmojiPickerOpen(true)
        setIsFeatureMenuOpen(false)
      }
    },
    { 
      icon: FiPaperclip, 
      label: 'File', 
      action: 'file',
      color: 'text-green-400'
    }
  ]

  return (
    <>
      <Script src="https://www.youtube.com/iframe_api" strategy="lazyOnload" />
      <div className="flex flex-col h-full bg-[#1a1a1a] relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#1a1a1a]" />
          <div className="absolute inset-0">
            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#00a8ff]/10 blur-[100px] animate-float-slow" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#7C3AED]/10 blur-[100px] animate-float-slower" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#10B981]/10 blur-[100px] animate-pulse-slow" />
          </div>
          <div className="absolute inset-0 backdrop-blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Chat header with tabs */}
          <div className="bg-[#1a1a1a]/40 backdrop-blur-md border-b border-[#2a2a2a]/50">
            <div className="flex justify-around">
              {tabs.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as TabType)}
                  className={`p-3 relative transition-all duration-200 ${
                    activeTab === id
                      ? 'text-[#00a8ff]'
                      : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  {activeTab === id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#00a8ff] to-[#0088cc] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content area */}
          {renderContent()}
        </div>
      </div>
    </>
  )
} 