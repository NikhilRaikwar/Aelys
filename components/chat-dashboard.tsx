"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { chatStorage } from "@/lib/chat-storage"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { UnifiedChatInterface } from "@/components/unified-chat-interface"
import { StickyHeader, MobileStickyHeader } from "@/components/ui/sticky-header"

// Agent-specific configurations
const agentConfigs = {
  "copilot": {
    name: "Aelys Copilot",
    description: "Ask anything about NFTs, wallets, or the market…",
    splineScene: "https://prod.spline.design/OCHi5lTP-1SjSufh/scene.splinecode",
    suggestions: [
      { title: "Analyze my NFT portfolio", subtitle: "Get insights on your collection performance" },
      { title: "What's trending in NFTs?", subtitle: "Discover the hottest collections and trends" },
      { title: "Check wallet health", subtitle: "Analyze wallet activity and holdings" },
      { title: "Compare NFT projects", subtitle: "Side-by-side analysis of different collections" },
    ],
  },
  "market-insights": {
    name: "Market Insights",
    description: "Get real-time market trends, top movers, and analytics in chat.",
    splineScene: "https://prod.spline.design/OCHi5lTP-1SjSufh/scene.splinecode",
    suggestions: [
      { title: "Show top movers today", subtitle: "Collections with biggest price changes" },
      { title: "Market sentiment analysis", subtitle: "Current market mood and trends" },
      { title: "Volume analysis", subtitle: "Trading activity across marketplaces" },
      { title: "Price predictions", subtitle: "AI-powered forecasts for collections" },
    ],
  },
}

export function ChatDashboard() {
  const [activeAgent, setActiveAgent] = useState("copilot")
  const [refreshKey, setRefreshKey] = useState(0)
  const { user, logout } = usePrivy()
  const router = useRouter()

  // Check if the active agent has any chat history on mount
  useEffect(() => {
    const hasHistory = chatStorage.hasChatHistory(activeAgent as 'copilot' | 'market-insights')
    console.log(`Agent ${activeAgent} has chat history:`, hasHistory)
  }, [activeAgent])

  const handleWalletDisconnect = async () => {
    await logout()
    // Redirect to Aelys main website
    window.location.href = "https://aelys.framer.ai/"
  }

  const handleAgentChange = (agentId: string) => {
    setActiveAgent(agentId)
  }

  // Get wallet address and format it
  const walletAddress = user?.wallet?.address || ""
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Get user initials for avatar
  const getUserInitials = (address: string) => {
    return address.slice(2, 4).toUpperCase()
  }

  const currentAgent = agentConfigs[activeAgent as keyof typeof agentConfigs]

  return (
    <SidebarProvider>
      <AppSidebar
        activeAgent={activeAgent}
        onAgentChange={handleAgentChange}
        walletAddress={walletAddress}
        formatAddress={formatAddress}
        getUserInitials={getUserInitials}
        onWalletDisconnect={handleWalletDisconnect}
      />
      <SidebarInset>
        {/* Sticky header with sidebar trigger and new chat button */}
        <StickyHeader onNewChat={() => {
          // Clear chat history for current agent and reset interface
          chatStorage.clearChatHistory(activeAgent as 'copilot' | 'market-insights');
          // Scroll to top immediately
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setRefreshKey(prev => prev + 1); // Force refresh of chat interface
        }} />
        <MobileStickyHeader onNewChat={() => {
          // Clear chat history for current agent and reset interface  
          chatStorage.clearChatHistory(activeAgent as 'copilot' | 'market-insights');
          // Scroll to top immediately
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setRefreshKey(prev => prev + 1); // Force refresh of chat interface
        }} />

        {/* Render unified chat interface */}
        <UnifiedChatInterface
          key={`${activeAgent}-${refreshKey}`}
          splineScene="https://prod.spline.design/OCHi5lTP-1SjSufh/scene.splinecode"
          walletAddress={formatAddress(walletAddress) || "Guest User"}
          agentType={activeAgent as 'copilot' | 'market-insights'}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
