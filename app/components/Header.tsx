'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Header() {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <header className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border-b border-[#3a3a3a] backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00a8ff] to-[#0088cc] rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-200 shadow-lg shadow-[#00a8ff]/20">
              <span className="text-xl font-bold text-white">U</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00a8ff] to-white bg-clip-text text-transparent">Meet</h1>
          </Link>

          {session && (
            <div 
              onClick={() => router.push('/profile')}
              className="flex items-center space-x-3 cursor-pointer bg-[#2a2a2a]/50 hover:bg-[#3a3a3a]/50 p-2.5 rounded-xl transition-all duration-200 border border-[#3a3a3a]/50 backdrop-blur-sm"
            >
              <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-gradient-to-br from-[#00a8ff] to-[#0088cc] flex items-center justify-center text-white shadow-lg shadow-[#00a8ff]/20">
                {session.user?.name ? session.user.name.charAt(0).toUpperCase() : session.user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white/90 pr-1">
                {session.user?.name || 'User'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 