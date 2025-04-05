'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiLogOut } from 'react-icons/fi'

export default function ProfileClient() {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }

      // Update the session with the new name
      await updateSession({ name })
      setSuccess('Profile updated successfully')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (!session) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-8"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          <span>Back</span>
        </button>

        <div className="bg-[#2a2a2a] shadow-lg rounded-xl overflow-hidden">
          {/* Profile header */}
          <div className="bg-[#00a8ff] p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-white flex items-center justify-center text-[#00a8ff] text-2xl font-bold mb-4">
              {session.user?.name ? session.user.name.charAt(0).toUpperCase() : session.user?.email?.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-xl font-bold text-white">Profile Settings</h1>
          </div>

          {/* Profile form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    value={session.user?.email || ''}
                    disabled
                    className="input-field bg-[#1a1a1a] text-white cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                  Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field bg-[#1a1a1a] text-white"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {error && (
                <div className="text-[#ff4757] text-sm">{error}</div>
              )}

              {success && (
                <div className="text-[#00a8ff] text-sm">{success}</div>
              )}

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary bg-[#00a8ff] hover:bg-[#0097e6] text-white"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#ff4757] hover:bg-[#ff6b81] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff4757]"
                >
                  <FiLogOut className="w-4 h-4 mr-2" />
                  <span>Sign Out</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 