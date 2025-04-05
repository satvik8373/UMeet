'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiMoreVertical } from 'react-icons/fi'
import { FaCrown } from 'react-icons/fa'

interface Participant {
  userId: string
  email: string
  isHost: boolean
  isOnline: boolean
}

interface ParticipantsListProps {
  participants: Participant[]
  currentUserId: string
  onKickParticipant?: (userId: string) => void
  onPromoteToHost?: (userId: string) => void
}

export default function ParticipantsList({
  participants,
  currentUserId,
  onKickParticipant,
  onPromoteToHost,
}: ParticipantsListProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const toggleMenu = (userId: string) => {
    setActiveMenu(activeMenu === userId ? null : userId)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Participants ({participants.length})
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center justify-between space-x-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                        {participant.email.charAt(0).toUpperCase()}
                      </div>
                      {participant.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {participant.email}
                        </span>
                        {participant.isHost && (
                          <FaCrown className="w-4 h-4 text-yellow-500" title="Host" />
                        )}
                        {participant.userId === currentUserId && (
                          <span className="text-xs text-gray-500">(You)</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {participant.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Actions menu */}
                  {(onKickParticipant || onPromoteToHost) && participant.userId !== currentUserId && (
                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(participant.userId)}
                        className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                      >
                        <FiMoreVertical className="w-5 h-5 text-gray-500" />
                      </button>

                      {activeMenu === participant.userId && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            {onPromoteToHost && !participant.isHost && (
                              <button
                                onClick={() => {
                                  onPromoteToHost(participant.userId)
                                  setActiveMenu(null)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FaCrown className="w-4 h-4 mr-2" />
                                Make Host
                              </button>
                            )}
                            {onKickParticipant && (
                              <button
                                onClick={() => {
                                  onKickParticipant(participant.userId)
                                  setActiveMenu(null)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <FiUser className="w-4 h-4 mr-2" />
                                Kick Participant
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 