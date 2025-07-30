"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect, useCallback } from "react"
import Hyperspeed from "@/components/hyperspeed"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { ready, authenticated, login } = usePrivy()
  const router = useRouter()

  // Optimized redirect function
  const redirectToDashboard = useCallback(() => {
    router.replace("/dashboard") // Use replace instead of push for faster navigation
  }, [router])

  // Fast redirect on authentication
  useEffect(() => {
    if (ready && authenticated) {
      redirectToDashboard()
    }
  }, [ready, authenticated, redirectToDashboard])

  // Handle connect wallet with Privy
  const handleConnectWallet = useCallback(async () => {
    if (!ready) return
    
    try {
      await login()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }, [login, ready])

  // Show loading state only when Privy is initializing
  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-lg text-white font-medium">Connecting to Aelys...</p>
        </div>
      </div>
    )
  }

  // Immediate redirect if authenticated
  if (authenticated) {
    redirectToDashboard()
    return (
      <div className="flex min-h-svh items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-[#5046e6] rounded-full mx-auto mb-4"></div>
            <p className="text-xl text-white font-medium">Welcome to Aelys!</p>
            <p className="text-sm text-white/70 mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Hyperspeed Background */}
      <div className="absolute inset-0 z-0">
        <Hyperspeed />
      </div>
      
      {/* Centered Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8 px-4">
        <nav className="flex items-center justify-between w-full max-w-4xl bg-black/20 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4 shadow-lg shadow-black/20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Image 
              src="/logo.png" 
              alt="Aelys Logo" 
              width={32} 
              height={32} 
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-white">Aelys</span>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <a 
              href="https://aelys.framer.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
            >
              Home
            </a>
            <a 
              href="https://github.com/NikhilRaikwar" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
            >
              Github
            </a>
          </div>
        </nav>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-32">
        {/* Announcement Banner */}
        <div className="mb-16">
          <div className="inline-flex items-center bg-black/30 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
            <span className="text-sm font-medium text-white/90">
              ✨ Aelys: Unlock NFT Intelligence in Real Time
            </span>
          </div>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-16 leading-tight max-w-5xl">
          Connect your wallet for{" "}
          <span className="bg-gradient-to-r from-red-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            AI-powered analytics
          </span>, live answers, and real-time NFT insights with{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            bitsCrunch
          </span>.
        </h1>
        
        {/* Connect Wallet Button with Privy */}
        <Button 
          onClick={handleConnectWallet}
          disabled={!ready}
          className="bg-white hover:bg-gray-100 text-black font-bold text-lg px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          {!ready ? "Loading..." : "Connect Wallet"}
        </Button>
      </div>
    </div>
  )
}
