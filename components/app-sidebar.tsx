"use client"

import type * as React from "react"
import { Wallet, LogOut, BarChart3, Chrome, Brain, Database } from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Agent data
const agents = [
  {
    id: "chatbots-stats",
    name: "Chatbots for Stats",
    icon: BarChart3,
    description: "Statistical analysis and data insights",
  },
  {
    id: "chrome-copilot",
    name: "Chrome Copilot",
    icon: Chrome,
    description: "Browser automation and web assistance",
  },
  {
    id: "autogpt-insights",
    name: "AutoGPT for Insights",
    icon: Brain,
    description: "Autonomous AI for deep insights",
  },
  {
    id: "rag-llm-agents",
    name: "RAG/LLM Agents",
    icon: Database,
    description: "Retrieval-augmented generation agents",
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeAgent: string
  onAgentChange: (agentId: string) => void
  walletAddress: string
  formatAddress: (address: string) => string
  getUserInitials: (address: string) => string
  onWalletDisconnect: () => void
}

export function AppSidebar({
  activeAgent,
  onAgentChange,
  walletAddress,
  formatAddress,
  getUserInitials,
  onWalletDisconnect,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a 
                href="https://aelys.framer.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-900">
                  <Image src="/logo.png" alt="Aelys Logo" width={20} height={20} className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Aelys Copilot</span>
                  <span className="truncate text-xs text-muted-foreground">AI Agent Platform</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Agents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {agents.map((agent) => (
                <SidebarMenuItem key={agent.id}>
                  <SidebarMenuButton
                    tooltip={agent.description}
                    onClick={() => onAgentChange(agent.id)}
                    isActive={activeAgent === agent.id}
                  >
                    <agent.icon className="size-4" />
                    <span>{agent.name}</span>
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
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs flex items-center justify-center">
                      {walletAddress ? (
                        <Wallet className="w-4 h-4" />
                      ) : (
                        getUserInitials(walletAddress || "0x00")
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {walletAddress ? formatAddress(walletAddress) : "Guest User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {walletAddress ? "Wallet Connected" : "No Wallet"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={onWalletDisconnect}>
                  <LogOut className="size-4 mr-2" />
                  Disconnect Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
