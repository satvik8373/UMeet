'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { FiUser, FiLogOut, FiVideo } from 'react-icons/fi'
import CreateRoomModal from '../components/room/CreateRoomModal'
import JoinRoomModal from '../components/room/JoinRoomModal'
import Header from '../components/Header'

interface Room {
  _id: string
  videoUrl: string
  hostId: {
    email: string
  }
  createdAt: string
}

// Helper function to extract YouTube video ID
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

export default function Dashboard() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [recentRooms, setRecentRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    const fetchRecentRooms = async () => {
      try {
        const response = await fetch('/api/rooms')
        const data = await response.json()
        if (response.ok) {
          setRecentRooms(data.rooms)
        }
      } catch (error) {
        console.error('Error fetching recent rooms:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentRooms()
  }, [session, router])

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#00a8ff] to-white bg-clip-text text-transparent">
            Start Watching Together
          </h2>
          <p className="text-lg text-white/70">Create a room or join an existing one to watch videos with friends</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#00a8ff] to-[#0088cc] text-lg font-medium rounded-xl text-white shadow-lg shadow-[#00a8ff]/20 hover:shadow-xl hover:shadow-[#00a8ff]/30 transition-all duration-200 transform hover:scale-105"
            >
              Create Room
            </button>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="inline-flex items-center justify-center px-8 py-4 bg-[#2a2a2a]/50 hover:bg-[#3a3a3a]/50 text-lg font-medium rounded-xl text-white/90 border border-[#3a3a3a]/50 transition-all duration-200 backdrop-blur-sm transform hover:scale-105"
            >
              Join Room
            </button>
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-2xl font-bold text-white/90 mb-6">
            Recent Rooms
          </h3>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00a8ff]"></div>
            </div>
          ) : recentRooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-white/50">No recent rooms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRooms.map((room) => {
                const videoId = extractYouTubeId(room.videoUrl)
                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null

                return (
                  <div
                    key={room._id}
                    onClick={() => router.push(`/room/${room._id}`)}
                    className="group bg-[#2a2a2a]/50 hover:bg-[#3a3a3a]/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border border-[#3a3a3a]/50 backdrop-blur-sm transform hover:scale-[1.02]"
                  >
                    <div className="relative aspect-video">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                          <FiVideo className="w-12 h-12 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-start p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-[#00a8ff] to-[#0088cc] flex items-center justify-center text-white shadow-lg shadow-[#00a8ff]/20">
                            {room.hostId.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {room.hostId.email}'s Room
                            </p>
                            <p className="text-xs text-white/70">
                              Created {new Date(room.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  )
} 