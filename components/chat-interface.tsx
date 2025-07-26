'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Menu, Paperclip, ArrowUp, ChevronDown } from "lucide-react"

const suggestionCards = [
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

export function ChatInterface() {
  const [message, setMessage] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
      >
        <div className="p-4 flex-1">
          <p className="text-sm text-gray-600 leading-relaxed">
            Your conversations will appear here once you start chatting!
          </p>
        </div>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="text-sm font-medium">Guest</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">Chatbot</h1>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-2xl w-full space-y-8">
            {/* Welcome message */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Hello there!</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                How can Aelys Copilot assist with your NFTs or wallet analytics today?
              </p>
            </div>

            {/* Suggestion cards */}
            <div className="grid grid-cols-2 gap-4">
              {suggestionCards.map((card, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 text-sm">{card.title}</p>
                      <p className="text-gray-600 text-sm">{card.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send a message..."
                className="pr-20 py-3 text-base border-gray-300 focus:border-gray-400 focus:ring-gray-400"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </Button>
                <Button size="sm" className="h-8 w-8 p-0 bg-gray-600 hover:bg-gray-700" disabled={!message.trim()}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
