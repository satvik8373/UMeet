'use client'

import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'

export default function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if the app is running in standalone mode (added to home screen)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                            (window.navigator as any).standalone || 
                            document.referrer.includes('android-app://')
    
    setIsStandalone(isStandaloneMode)
    
    // Check if the device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)
    
    // Show prompt if it's iOS and not in standalone mode
    if (isIOSDevice && !isStandaloneMode) {
      // Check if we've shown the prompt before
      const hasShownPrompt = localStorage.getItem('iosInstallPromptShown')
      if (!hasShownPrompt) {
        setShowPrompt(true)
        localStorage.setItem('iosInstallPromptShown', 'true')
      }
    }
  }, [])

  if (!showPrompt || !isIOS || isStandalone) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-[#2a2a2a]/95 backdrop-blur-md rounded-xl shadow-xl border border-[#3a3a3a]/50 p-4 animate-fade-in">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-white font-medium">Add to Home Screen</h3>
          <p className="text-gray-300 text-sm mt-1">
            For the best experience, add UMeet to your home screen.
          </p>
          <div className="mt-3 text-sm text-gray-400">
            <ol className="list-decimal list-inside space-y-1">
              <li>Tap the share button <span className="inline-block w-4 h-4 bg-gray-600 rounded-full mx-1"></span></li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right</li>
            </ol>
          </div>
        </div>
        <button 
          onClick={() => setShowPrompt(false)}
          className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
} 