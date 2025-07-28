"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { useCallback } from "react"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { login, ready } = usePrivy()

  const handleConnectWallet = useCallback(async () => {
    if (!ready) return
    
    try {
      await login()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }, [login, ready])

  return (
    <div className={cn("flex flex-col items-center text-center space-y-8 py-8 max-w-4xl mx-auto", className)} {...props}>
      {/* Small Badge-style Animated Headline */}
      <div className="mb-6">
        <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 shadow-md">
          <span className="text-lg mr-2">✨</span>
          <AnimatedShinyText className="text-sm font-medium text-white whitespace-nowrap">
            Aelys: Unlock NFT Intelligence in Real Time
          </AnimatedShinyText>
          <span className="text-lg ml-2">✨</span>
        </div>
      </div>

      {/* Centered Main Headline */}
      <h1 className="text-xl sm:text-2xl text-white/90 font-normal leading-relaxed max-w-3xl">
        Connect your wallet for AI-powered analytics, live answers, and real-time NFT insights with bitsCrunch.
      </h1>

      {/* Single CTA Button with Arrow */}
      <Button 
        onClick={handleConnectWallet}
        className="bg-[#5046e6] hover:bg-[#4338ca] text-white font-bold text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 mt-8" 
        size="lg"
      >
        Connect Wallet
        <ArrowRightIcon className="ml-3 h-6 w-6" />
      </Button>
    </div>
  )
}
