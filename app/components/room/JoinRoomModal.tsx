'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { useRouter } from 'next/navigation'

interface JoinRoomModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate room ID format
      if (!roomId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid room ID format')
      }

      const response = await fetch(`/api/rooms/${roomId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Room not found')
      }

      router.push(`/room/${roomId}`)
    } catch (error: any) {
      setError(error.message || 'Failed to join room')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
            Join a Room
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="input-field"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 