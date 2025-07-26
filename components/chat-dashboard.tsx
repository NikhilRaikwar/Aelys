"use client"

import { useState, useMemo, useCallback } from "react"
import { MessageSquare, User, Plus, Paperclip, ArrowUp, Bot, MessageCircle } from "lucide-react"
import Spline from "@splinetool/react-spline"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type ChatMode = "agent" | "chat"

const agentModeSuggestions = [
  {
    title: "Generate detailed report",
    subtitle: "of market risks for an NFT project",
  },
  {
    title: "Analyze wash trading patterns",
    subtitle: "from bitsCrunch real-time data",
  },
  {
    title: "Provide multilingual overview",
    subtitle: "for any NFT collection or project",
  },
  {
    title: "Detect possible forgery or scams",
    subtitle: "using wallet and transaction analytics",
  },
]

const chatModeSuggestions = [
  {
    title: "Show risk score",
    subtitle: "for any NFT wallet address",
  },
  {
    title: "Explain recent wash trading",
    subtitle: "activity for a specific collection",
  },
  {
    title: "Summarize market trends",
    subtitle: "across top NFT collections",
  },
  {
    title: "List latest whale trades",
    subtitle: "detected in the market",
  },
]

const recentChats = [
  "NFT Analytics Discussion",
  "Wallet Security Tips",
  "DeFi Investment Guide",
  "Smart Contract Review",
  "Token Analysis Report",
  "Portfolio Optimization",
]

export function ChatDashboard() {
  const [message, setMessage] = useState("")
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [chatMode, setChatMode] = useState<ChatMode>("agent")

  const handleWalletToggle = () => {
    setIsWalletConnected(!isWalletConnected)
  }

  // Memoized values to prevent unnecessary re-renders
  const currentSuggestions = chatMode === "agent" ? agentModeSuggestions : chatModeSuggestions
  
  const splineScene = useMemo(() => 
    chatMode === "agent"
      ? "https://prod.spline.design/OCHi5lTP-1SjSufh/scene.splinecode"
      : "https://prod.spline.design/Pl62V5iktotEfdgH/scene.splinecode"
  , [chatMode])

  // Memoized callbacks for Spline events
  const handleSplineLoad = useCallback(() => {
    console.log(`Spline scene loaded for ${chatMode} mode`)
  }, [chatMode])

  const handleSplineError = useCallback((error: any) => {
    console.error(`Spline error in ${chatMode} mode:`, error)
  }, [chatMode])

  // Memoized fallback component
  const splineFallback = useMemo(() => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          {chatMode === "agent" ? (
            <Bot className="w-8 h-8 text-primary" />
          ) : (
            <MessageCircle className="w-8 h-8 text-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">Loading animation...</p>
      </div>
    </div>
  ), [chatMode])

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div className="flex items-center gap-2">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-900">
                    <Image src="/logo.png" alt="Aelys Logo" width={20} height={20} className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Aelys Copilot</span>
                    <span className="text-xs text-muted-foreground">Instant. Intelligent. Insightful</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentChats.map((chat, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton>
                      <MessageSquare className="size-4" />
                      <span className="truncate">{chat}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <Avatar className="size-6">
                      <AvatarFallback className="bg-teal-500 text-white text-xs">G</AvatarFallback>
                    </Avatar>
                    <span>Guest User</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                  <DropdownMenuItem onClick={handleWalletToggle}>
                    <User className="size-4 mr-2" />
                    {isWalletConnected ? "Disconnect Wallet" : "Connect Wallet"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-4 flex-1">
            {/* Mode Switcher */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={chatMode === "agent" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChatMode("agent")}
                className={cn(
                  "h-8 px-3 text-xs font-medium transition-all",
                  chatMode === "agent"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Bot className="size-3 mr-1.5" />
                Agent Mode
              </Button>
              <Button
                variant={chatMode === "chat" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChatMode("chat")}
                className={cn(
                  "h-8 px-3 text-xs font-medium transition-all",
                  chatMode === "chat"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <MessageCircle className="size-3 mr-1.5" />
                Chat Mode
              </Button>
            </div>

            <div className="ml-auto">
              <Button variant="outline" size="sm">
                <Plus className="size-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </header>

        {/* Main Chat Content */}
        <div className="flex flex-1 flex-col">
          {/* Chat area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full space-y-8">
              {/* Welcome message */}
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="w-full max-w-md h-64 flex items-center justify-center">
                    <div className="w-full h-full relative spline-container">
                      <Spline
                        scene={splineScene}
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "transparent",
                        }}
                        onLoad={handleSplineLoad}
                        onError={handleSplineError}
                        fallback={splineFallback}
                      />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold">
                  {chatMode === "agent" ? "Aelys Agent Ready" : "Welcome to Aelys Chat"}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {chatMode === "agent"
                    ? "Advanced AI agent for comprehensive NFT analysis and automated insights."
                    : "Interactive chat assistant for quick NFT queries and market information."}
                </p>
              </div>

              {/* Suggestion cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSuggestions.map((card, index) => (
                  <Card
                    key={`${chatMode}-${index}`}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] border-border/50 hover:border-border group"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{card.title}</p>
                        <p className="text-muted-foreground text-sm">{card.subtitle}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="p-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    chatMode === "agent" ? "Describe your NFT analysis needs..." : "Ask me anything about NFTs..."
                  }
                  className="pr-20 py-3 text-base resize-none min-h-[48px]"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="h-8 w-8 p-0" disabled={!message.trim()}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {chatMode === "agent"
                  ? "Aelys Agent provides comprehensive analysis and automated insights."
                  : "Aelys Chat can make mistakes. Consider checking important information."}
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
