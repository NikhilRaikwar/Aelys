"use client";

import { AnimatedInput } from "@/components/ui/animated-input";
import { ChatInput } from "@/components/ui/chat-input";

export default function AnimatedInputExample() {
  const handleChatSubmit = (message: string) => {
    console.log("Chat message:", message);
    // Handle chat message submission here
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">✨ What's new, Nikhil?</h1>
        <p className="text-muted-foreground">Experience the animated input components</p>
      </div>
      
      {/* Chat Input - Main Feature */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Chat Input</h2>
        <ChatInput 
          placeholder="How can I help you today?"
          onSubmit={handleChatSubmit}
        />
      </div>
      
      {/* Regular Animated Inputs */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Form Inputs</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Username
            </label>
            <AnimatedInput 
              type="text" 
              placeholder="Enter your username" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <AnimatedInput 
              type="email" 
              placeholder="Enter your email" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Search
            </label>
            <AnimatedInput 
              type="text" 
              placeholder="Ask anything about NFTs, wallets, or the market..." 
            />
          </div>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Features:</h3>
        <ul className="space-y-1">
          <li>• Border beam animation when not focused (2px width)</li>
          <li>• Single 2px black border when focused</li>
          <li>• No border on hover</li>
          <li>• Large chat input with integrated send button</li>
          <li>• Enter key to submit, disabled state management</li>
        </ul>
      </div>
    </div>
  );
}
