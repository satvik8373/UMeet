'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiCopy, FiCheck, FiLogOut } from 'react-icons/fi'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface RoomHeaderProps {
  roomId: string
  roomName?: string
  isHost?: boolean
  onLeaveRoom?: () => void
  onToggleSidebar?: () => void
  videoUrl?: string
  participantCount?: number
}

export default function RoomHeader({ 
  roomId, 
  roomName = 'Room', 
  isHost = false, 
  onLeaveRoom = () => {}, 
  onToggleSidebar,
  videoUrl,
  participantCount = 0 
}: RoomHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [videoTitle, setVideoTitle] = useState('')

  useEffect(() => {
    const fetchVideoTitle = async () => {
      if (!videoUrl) return
      try {
        const videoId = extractYouTubeId(videoUrl)
        if (!videoId) return
        const cleanVideoUrl = `https://www.youtube.com/watch?v=${videoId}`
        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(cleanVideoUrl)}&format=json`)
        const data = await response.json()
        setVideoTitle(data.title)
      } catch (error) {
        console.error('Error fetching video title:', error)
        setVideoTitle('')
      }
    }

    if (videoUrl) {
      fetchVideoTitle()
    }
  }, [videoUrl])

  const handleCopyLink = () => {
    const roomUrl = `${window.location.origin}/room/${roomId}`
    navigator.clipboard.writeText(roomUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeaveRoom = async () => {
    try {
      await router.push('/dashboard')
      onLeaveRoom()
    } catch (error) {
      console.error('Error leaving room:', error)
    }
  }

  return (
    <header className="bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] border-b border-[#3a3a3a]/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00a8ff] to-[#0088cc] rounded-2xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-200 shadow-lg shadow-[#00a8ff]/20">
                <span className="text-xl font-bold text-white">U</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00a8ff] to-white bg-clip-text text-transparent">Meet</h1>
            </Link>
            <div className="h-6 w-px bg-[#3a3a3a]/50" />
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{roomName}</h2>
              <div className="flex items-center space-x-2">
                {isHost && (
                  <span className="px-3 py-1.5 text-xs font-medium text-[#00a8ff] bg-[#00a8ff]/10 rounded-xl border border-[#00a8ff]/20 shadow-sm shadow-[#00a8ff]/10">
                    Host
                  </span>
                )}
                <span className="px-3 py-1.5 text-xs font-medium text-white/70 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a]/50 shadow-sm shadow-black/10">
                  {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
                </span>
              </div>
            </div>
          </div>

          {/* Center section */}
          {videoTitle && (
            <div className="hidden lg:block flex-1 max-w-2xl mx-6">
              <div className="px-4 py-2 text-sm text-white/70 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a]/50 truncate shadow-sm shadow-black/10 backdrop-blur-sm">
                {videoTitle}
              </div>
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-sm font-medium rounded-xl text-white/90 border border-[#3a3a3a]/50 transition-all duration-200 backdrop-blur-sm shadow-sm shadow-black/10 hover:shadow-md hover:shadow-black/20"
            >
              {copied ? (
                <FiCheck className="w-4 h-4 mr-2 text-green-400" />
              ) : (
                <FiCopy className="w-4 h-4 mr-2" />
              )}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleLeaveRoom}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ff4757] to-[#ff6b81] text-sm font-medium rounded-xl text-white shadow-lg shadow-[#ff4757]/20 hover:shadow-xl hover:shadow-[#ff4757]/30 transition-all duration-200 transform hover:scale-105"
            >
              <FiLogOut className="w-4 h-4 mr-2" />
              <span>Leave Room</span>
            </button>

            <div 
              onClick={() => router.push('/profile')}
              className="flex items-center space-x-3 cursor-pointer bg-[#2a2a2a] hover:bg-[#3a3a3a] p-2.5 rounded-xl transition-all duration-200 border border-[#3a3a3a]/50 backdrop-blur-sm shadow-sm shadow-black/10 hover:shadow-md hover:shadow-black/20"
            >
              <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-[#00a8ff] to-[#0088cc] flex items-center justify-center text-white shadow-lg shadow-[#00a8ff]/20">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : session?.user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white/90 pr-1">
                {session?.user?.name || 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function extractYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
} 