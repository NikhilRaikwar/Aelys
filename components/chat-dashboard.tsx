"use client"

import { useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { UnifiedChatInterface } from "@/components/unified-chat-interface"

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
  const { user, logout } = usePrivy()
  const router = useRouter()

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
        {/* Clean minimal header */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>

        {/* Render unified chat interface */}
        <UnifiedChatInterface
          splineScene="https://prod.spline.design/OCHi5lTP-1SjSufh/scene.splinecode"
          walletAddress={formatAddress(walletAddress) || "Guest User"}
          agentType={activeAgent as 'copilot' | 'market-insights'}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
