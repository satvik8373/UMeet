'use client'

import { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'
import { socket } from '../../lib/socket'
import { FiPlay, FiPause, FiLink } from 'react-icons/fi'

interface VideoPlayerProps {
  videoUrl: string
  isPlaying: boolean
  currentTime: number
  lastUpdated: number
  isHost: boolean
  roomId: string
}

export default function VideoPlayer({
  videoUrl,
  isPlaying,
  currentTime,
  lastUpdated,
  isHost,
  roomId,
}: VideoPlayerProps) {
  const [url, setUrl] = useState(videoUrl)
  const [inputUrl, setInputUrl] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying)
  const playerRef = useRef<ReactPlayer>(null)
  const lastSyncTime = useRef(lastUpdated)
  const lastKnownTime = useRef(currentTime)

  useEffect(() => {
    setUrl(videoUrl)
  }, [videoUrl])

  useEffect(() => {
    if (!isReady) return

    const timeDiff = Date.now() - lastUpdated
    const expectedTime = currentTime + (isPlaying ? timeDiff / 1000 : 0)
    const currentPlayerTime = playerRef.current?.getCurrentTime() || 0

    if (Math.abs(currentPlayerTime - expectedTime) > 2) {
      playerRef.current?.seekTo(expectedTime, 'seconds')
    }

    setLocalIsPlaying(isPlaying)
  }, [isPlaying, currentTime, lastUpdated, isReady])

  const handlePlay = () => {
    if (isHost) {
      socket.emit('videoStateChange', {
        roomId,
        isPlaying: true,
        currentTime: playerRef.current?.getCurrentTime() || 0,
        lastUpdated: Date.now(),
      })
    }
  }

  const handlePause = () => {
    if (isHost) {
      socket.emit('videoStateChange', {
        roomId,
        isPlaying: false,
        currentTime: playerRef.current?.getCurrentTime() || 0,
        lastUpdated: Date.now(),
      })
    }
  }

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    if (!isHost) return

    const now = Date.now()
    if (now - lastSyncTime.current > 5000 || Math.abs(playedSeconds - lastKnownTime.current) > 5) {
      socket.emit('videoStateChange', {
        roomId,
        isPlaying: localIsPlaying,
        currentTime: playedSeconds,
        lastUpdated: now,
      })
      lastSyncTime.current = now
      lastKnownTime.current = playedSeconds
    }
  }

  const handleSetUrl = () => {
    if (isHost && inputUrl) {
      socket.emit('setVideoUrl', { roomId, videoUrl: inputUrl })
      setShowUrlInput(false)
      setInputUrl('')
    }
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Video controls overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
        {isHost && (
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center px-3 py-2 border border-[#2a2a2a] text-sm font-medium rounded-xl text-white bg-black/50 backdrop-blur-sm hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a8ff] transition-all duration-200"
          >
            <FiLink className="w-4 h-4 mr-2" />
            <span>Set Video URL</span>
          </button>
        )}
      </div>

      {/* URL input overlay */}
      {showUrlInput && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#2a2a2a] shadow-xl">
            <div className="space-y-4">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter YouTube URL"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a8ff] focus:border-transparent"
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleSetUrl}
                  className="flex-1 px-4 py-2 bg-[#00a8ff] text-white rounded-xl hover:bg-[#0097e6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a8ff] transition-colors duration-200"
                >
                  Set URL
                </button>
                <button
                  onClick={() => setShowUrlInput(false)}
                  className="flex-1 px-4 py-2 bg-[#3a3a3a] text-white rounded-xl hover:bg-[#4a4a4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a8ff] transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video player */}
      <div className="relative flex-1 bg-black rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={localIsPlaying}
          controls={true}
          onPlay={handlePlay}
          onPause={handlePause}
          onProgress={handleProgress}
          onReady={() => setIsReady(true)}
          style={{ borderRadius: '1rem', overflow: 'hidden' }}
        />
      </div>

      {/* Custom play/pause overlay for non-host users */}
      {!isHost && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="p-4 rounded-full bg-black/50 backdrop-blur-sm">
            {localIsPlaying ? (
              <FiPause className="w-8 h-8 text-white" />
            ) : (
              <FiPlay className="w-8 h-8 text-white" />
            )}
          </div>
        </div>
      )}
    </div>
  )
} 