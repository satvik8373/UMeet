'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog } from '@headlessui/react'
import { FiVideo } from 'react-icons/fi'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
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

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const router = useRouter()
  const [videoUrl, setVideoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoTitle, setVideoTitle] = useState('')

  useEffect(() => {
    const fetchVideoTitle = async () => {
      const videoId = extractYouTubeId(videoUrl)
      if (!videoId) {
        setVideoTitle('')
        return
      }

      try {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate YouTube URL
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|live\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
      if (!youtubeRegex.test(videoUrl)) {
        throw new Error('Please enter a valid YouTube video URL')
      }

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create room')
      }

      router.push(`/room/${data.roomId}`)
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const videoId = extractYouTubeId(videoUrl)
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-[#1a1a1a] p-6 shadow-xl w-full">
          <Dialog.Title className="text-lg font-medium text-white mb-4">
            Create a Room
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-400">
                YouTube Video URL
              </label>
              <input
                type="text"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-1 block w-full rounded-md border border-[#2a2a2a] bg-[#1a1a1a] text-white placeholder-gray-400 focus:border-[#00a8ff] focus:ring-[#00a8ff] sm:text-sm"
                required
              />
            </div>

            {thumbnailUrl && (
              <div className="mt-4">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <FiVideo className="w-8 h-8 text-white" />
                  </div>
                </div>
                {videoTitle && (
                  <p className="mt-2 text-sm text-gray-400 truncate" title={videoTitle}>
                    {videoTitle}
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-[#ff4757]">{error}</p>
            )}

            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-md border border-[#2a2a2a] text-white hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2a2a2a] focus:ring-offset-[#1a1a1a]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-[#00a8ff] hover:bg-[#0097e6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a8ff] focus:ring-offset-[#1a1a1a] disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 