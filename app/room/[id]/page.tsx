'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { socket } from '@/app/lib/socket'
import type { Socket } from 'socket.io-client'
import type { Message } from '@/app/components/room/Chat'
import { FiMessageSquare, FiYoutube, FiLogOut, FiMoreVertical, FiCopy, FiCheck, FiChevronDown } from 'react-icons/fi'

// Dynamic imports with loading fallbacks
const RoomHeader = dynamic(() => import('@/app/components/room/RoomHeader'), {
  loading: () => <div>Loading header...</div>,
  ssr: false
})

const EnhancedChat = dynamic(() => import('@/app/components/room/EnhancedChat'), {
  loading: () => <div>Loading chat...</div>,
  ssr: false
})

// Helper function to extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string {
  if (!url) return ''
  
  try {
    // First try to parse the URL
    const urlObj = new URL(url)
    
    // Handle youtube.com URLs
    if (urlObj.hostname.includes('youtube.com')) {
      // Handle watch URLs
      const searchParams = new URLSearchParams(urlObj.search)
      const videoId = searchParams.get('v')
      if (videoId) return videoId

      // Handle live URLs
      const pathParts = urlObj.pathname.split('/')
      if (pathParts.includes('live')) {
        const liveId = pathParts[pathParts.indexOf('live') + 1]
        if (liveId) return liveId
      }
    }
    
    // Handle youtu.be URLs
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1)
      if (videoId) return videoId
    }
  } catch (e) {
    // If URL parsing fails, try regex as fallback
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]+)/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
  }

  return ''
}

interface Participant {
  email: string
  socketId: string
  isHost: boolean
  isOnline: boolean
  name?: string
}

interface RoomState {
  participants: Record<string, Participant>
  videoState: {
    videoUrl: string
    isPlaying: boolean
    currentTime: number
    lastUpdated: number
  }
  name: string
  hostId: string
}

// Remove the YouTubePlayer component import and replace with a simple iframe embed
const VideoPlayer = ({ videoId }: { videoId: string }) => {
  return (
    <div className="relative w-full h-full">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
        className="absolute inset-0 w-full h-full rounded-[2rem]"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

// Main Room Page Component
export default function RoomPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/')
    },
  })

  const [currentSocket, setCurrentSocket] = useState<Socket | null>(null)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState('')
  const [isConnecting, setIsConnecting] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeChatType, setActiveChatType] = useState<'room' | 'youtube'>('room')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [participants, setParticipants] = useState<{ userId: string; userEmail: string; userName: string; isOnline: boolean }[]>([])
  const [roomName, setRoomName] = useState('Room')
  const [isHost, setIsHost] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [youtubeVideoId, setYoutubeVideoId] = useState('')

  useEffect(() => {
    if (!session?.user?.id || !session?.user?.email) return

    socket.connect()
    setCurrentSocket(socket)

    const joinRoomData = {
      roomId: params.id,
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name || session.user.email
    }

    socket.emit('join-room', joinRoomData)

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error)
      setError('Failed to connect to the room server. Retrying...')
      setIsConnecting(true)
    })

    socket.on('connect', () => {
      console.log('Connected to socket server')
      setIsConnecting(false)
      setError('')
    })

    socket.on('room-state', (state: RoomState) => {
      console.log('Received room state:', state)
      setRoomState(state)
      setRoomName(state.name || 'Room')
      setIsHost(state.hostId === session.user.id)
      setVideoUrl(state.videoState?.videoUrl || '')
      setYoutubeVideoId(extractYouTubeId(state.videoState?.videoUrl || '') || '')
      setParticipants(Object.entries(state.participants || {}).map(([userId, data]: [string, any]) => ({
        userId,
        userEmail: data.email,
        userName: data.name || data.email,
        isOnline: data.isOnline
      })))
      setError('')
    })

    socket.on('chat-message', (message: Message) => {
      console.log('Received chat message:', message)
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        if (prev.some(m => m.id === message.id)) {
          console.log('Message already exists, skipping:', message.id)
          return prev
        }
        const newMessages = [...prev, message]
        console.log('Updated messages:', newMessages)
        return newMessages
      })
    })

    socket.on('participant-joined', ({ userId, email, isHost }: { userId: string, email: string, isHost: boolean }) => {
      setRoomState(prev => {
        if (!prev) return prev
        return {
          ...prev,
          participants: {
            ...prev.participants,
            [userId]: { email, socketId: '', isHost, isOnline: true }
          }
        }
      })
    })

    socket.on('participant-left', ({ userId }: { userId: string }) => {
      setRoomState(prev => {
        if (!prev) return prev
        const newParticipants = { ...prev.participants }
        delete newParticipants[userId]
        return {
          ...prev,
          participants: newParticipants
        }
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [params.id, session])

  if (status === 'loading' || !session?.user || !roomState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00a8ff] mb-4"></div>
        {isConnecting && <p className="text-white/70">Connecting to room...</p>}
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </div>
    )
  }

  const videoId = extractYouTubeId(roomState.videoState.videoUrl)

  if (!videoId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]">
        <p className="text-red-400">Invalid YouTube URL</p>
      </div>
    )
  }

  const handleSendMessage = (text: string) => {
    if (!socket || !session?.user?.id) {
      console.error('Socket or user session not available')
      return
    }

    const message: Message = {
      id: `${Date.now()}-${session.user.id}`,
      userId: session.user.id,
      userEmail: session.user.email || '',
      userName: session.user.name || session.user.email || 'Anonymous',
      text,
      timestamp: Date.now(),
      type: 'room'
    }

    console.log('Sending message:', message)
    
    // First update local state
    setMessages(prev => [...prev, message])
    
    // Then emit to server
    socket.emit('chat-message', {
      roomId: params.id,
      message
    })
  }

  const handleLeaveRoom = () => {
    if (!socket || !session?.user?.id) return
    socket.emit('leave-room', {
      roomId: params.id,
      userId: session.user.id
    })
    router.push('/dashboard')
  }

  const handleCopyLink = () => {
    const roomUrl = `${window.location.origin}/room/${params.id}`
    navigator.clipboard.writeText(roomUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setIsMenuOpen(false)
  }

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] overflow-hidden">
      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile slide-down menu */}
      <div 
        className={`lg:hidden fixed top-0 left-0 right-0 bg-[#2a2a2a] z-50 transition-transform duration-300 shadow-xl ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-4">
            <h2 className="text-white font-medium">Room Options</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-[#3a3a3a] rounded-lg"
            >
              <FiChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between p-3 bg-[#3a3a3a] text-white rounded-lg"
            >
              <span className="flex items-center">
                {copied ? (
                  <FiCheck className="w-5 h-5 mr-3 text-green-400" />
                ) : (
                  <FiCopy className="w-5 h-5 mr-3" />
                )}
                {copied ? 'Copied!' : 'Copy Room Link'}
              </span>
            </button>

            <button
              onClick={handleLeaveRoom}
              className="w-full flex items-center justify-between p-3 bg-red-500/10 text-red-500 rounded-lg"
            >
              <span className="flex items-center">
                <FiLogOut className="w-5 h-5 mr-3" />
                Leave Room
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-optimized header */}
      <div className="lg:hidden bg-[#1a1a1a] border-b border-[#2a2a2a]/80">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00a8ff] to-[#0088cc] flex items-center justify-center">
              <span className="text-lg font-bold text-white">U</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-white">{roomState?.name || 'Room'}</h1>
              <span className="text-xs text-gray-400">
                {Object.keys(roomState?.participants || {}).length} participants
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-[#2a2a2a] rounded-lg"
            >
              <FiMoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden lg:block">
        <RoomHeader
          roomId={params.id}
          roomName={roomName}
          isHost={isHost}
          participantCount={participants.length}
          videoUrl={videoUrl}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden lg:p-6">
        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-hidden">
          <div className="h-full">
            <div className="h-full flex flex-col lg:flex-row lg:gap-6">
              {/* Video player container */}
              <div className="h-[30vh] lg:h-full lg:w-[70%] overflow-hidden bg-black lg:rounded-[2rem] lg:shadow-2xl lg:shadow-black/20">
                <div className="relative w-full h-full">
                  <VideoPlayer videoId={videoId} />
                </div>
              </div>
              
              {/* Chat container */}
              <div className="flex-1 h-[70vh] lg:w-[30%] lg:h-full">
                <div className="h-full lg:rounded-[2rem] overflow-hidden bg-[#1a1a1a] lg:bg-[#2a2a2a] lg:shadow-2xl lg:shadow-black/20">
                  <EnhancedChat
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    currentUserEmail={session?.user?.email || ''}
                    currentUserName={session?.user?.name || 'Anonymous'}
                    youtubeVideoId={youtubeVideoId}
                    participants={participants}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 