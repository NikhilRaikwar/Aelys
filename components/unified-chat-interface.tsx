"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatMessage, LoadingMessage } from '@/components/ui/chat-message';
import { EnhancedChatMessage } from '@/components/ui/enhanced-chat-message';
import { StickyHeader, MobileStickyHeader } from '@/components/ui/sticky-header';
import { chatStorage, ChatMessage as ChatMessageType } from '@/lib/chat-storage';
import { MarketChartData } from '@/lib/types';
import { ArrowUp, Bot, TrendingUp, Loader2 } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import { SimpleBorderBeam } from '@/components/ui/simple-border-beam';

interface UnifiedChatInterfaceProps {
  splineScene: string;
  walletAddress: string;
  agentType: 'copilot' | 'market-insights';
  onNewChatExternal?: () => void;
}

export const UnifiedChatInterface: React.FC<UnifiedChatInterfaceProps> = ({ 
  splineScene, 
  walletAddress, 
  agentType,
  onNewChatExternal 
}) => {
  const { user } = usePrivy(); // Get user from Privy to access wallet
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [chartDataMap, setChartDataMap] = useState<Record<string, MarketChartData>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history when agent type changes
  useEffect(() => {
    const messages = chatStorage.getMessages(agentType);
    setChatHistory(messages);
    setIsChatStarted(messages.length > 0);
    console.log(`Loaded ${messages.length} messages for ${agentType}`);
  }, [agentType]);

  // Listen for external new chat calls
  useEffect(() => {
    if (onNewChatExternal) {
      // This effect will trigger whenever onNewChatExternal changes
      // The actual reset logic is handled by the parent component
      const messages = chatStorage.getMessages(agentType);
      setChatHistory(messages);
      setIsChatStarted(messages.length > 0);
    }
  }, [onNewChatExternal, agentType]);

  // Auto-scroll to bottom when new messages arrive (only for active conversations)
  const scrollToBottom = () => {
    if (isChatStarted && chatHistory.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to top when starting a new chat or switching agents
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatStarted && chatHistory.length > 0) {
      scrollToBottom();
    } else {
      // Always start at top for new chats or welcome screen
      scrollToTop();
    }
  }, [chatHistory, isChatStarted]);

  const handleSplineLoad = useCallback(() => {
    console.log(`Spline scene loaded`);
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);
    
    // Mark chat as started and hide welcome elements
    if (!isChatStarted) {
      setIsChatStarted(true);
    }
    
    // Add user message to storage and get the generated message
    const newUserMessage = chatStorage.addMessage(agentType, 'user', userMessage);
    setChatHistory(prev => [...prev, newUserMessage]);
    
    try {

      // Get the actual wallet address from Privy or use the provided one
      const connectedWalletAddress = user?.wallet?.address || '';
      
      // Call the agent API
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          history: chatHistory,
          agentType: agentType,
          connectedWallet: connectedWalletAddress
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }
      
      const agentResponse = await response.json();
      
      // Add agent response to chat
      const newAgentMessage = chatStorage.addMessage(
        agentType,
        'assistant',
        agentResponse.answer || 'I apologize, but I encountered an error processing your request.'
      );
      
      // Store chart data if available (for market insights)
      if (agentResponse.chartData) {
        setChartDataMap(prev => ({
          ...prev,
          [newAgentMessage.id]: agentResponse.chartData
        }));
      }
      
      setChatHistory(prev => [...prev, newAgentMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = chatStorage.addMessage(
        agentType,
        'assistant',
        'I apologize, but I encountered an error processing your request. Please try again.'
      );
      
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const handleSplineError = useCallback((error: any) => {
    console.error(`Spline error:`, error);
  }, []);

  // Handle new chat - reset chat state and clear storage
  const handleNewChat = useCallback(() => {
    // Clear chat history for current agent
    chatStorage.clearChatHistory(agentType);
    setChatHistory([]);
    setIsChatStarted(false);
    setMessage('');
    setIsLoading(false);
    
    // Scroll to top immediately for new chat
    scrollToTop();
    
    // Focus the input after reset
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    console.log(`Started new chat for ${agentType}`);
  }, [agentType]);

  const splineFallback = useMemo(
    () => (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary">Loading...</span>
          </div>
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="flex flex-1 flex-col relative min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-background/95">
      {isChatStarted ? (
        /* Chat Mode - Full Screen Chat */
        <div className="flex flex-1 flex-col h-full">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 chat-scroll">
            <div className="max-w-4xl mx-auto space-y-6 chat-container">
              {chatHistory.map((entry) => {
                const chartData = chartDataMap[entry.id];
                // Use enhanced chat message for market insights with chart support
                if (agentType === 'market-insights' && entry.role === 'assistant') {
                  return (
                    <EnhancedChatMessage 
                      key={entry.id} 
                      message={entry} 
                      agentType={agentType} 
                      chartData={chartData}
                    />
                  );
                }
                // Use regular chat message for copilot and user messages
                return (
                  <ChatMessage key={entry.id} message={entry} agentType={agentType} />
                );
              })}
              {isLoading && (
                <LoadingMessage agentType={agentType} />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Fixed Chat Input at Bottom */}
          <div className="border-t bg-background/95 backdrop-blur px-4 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full h-12 pl-4 pr-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading}
                  className="absolute right-1 top-1 h-10 w-10 rounded-lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Welcome Mode - Centered Layout */
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-4xl mx-auto space-y-12">
            
            {/* Centered Spline Animation */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm h-48 flex items-center justify-center">
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

            {/* Centered Welcome Message */}
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
{agentType === 'copilot' ? 'Welcome to Your NFT Portfolio Copilot' : 'Welcome to Market Alpha Copilot'}
                </h1>
              </div>
              <h2 className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
{agentType === 'copilot'
                  ? 'AI-powered wallet insights, asset analytics, and crypto education — personalized to your Web3 journey.'
                  : 'Real-time NFT market analytics, trading insights, and Web3 education at your fingertips.'}
              </h2>
            </div>

            {/* Centered Chat Input with Border Beam */}
            <div className="w-full max-w-3xl mx-auto">
              <div className="relative">
                <div className="relative group">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
placeholder={agentType === 'copilot'
                      ? 'Ask about your wallet, NFT portfolio, DeFi exposure, risks, or general crypto questions…'
                      : 'Ask about market trends, trading volumes, whale activity, washtrading, or general NFT concepts…'}
                      className={`w-full h-16 pl-6 pr-16 text-lg rounded-2xl transition-all duration-300 bg-muted/50 placeholder:text-muted-foreground outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none ${
                        isFocused 
                          ? 'border-2 border-foreground focus:border-foreground focus-visible:border-foreground' 
                          : 'border-0 focus:border-0'
                      }`}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      disabled={isLoading}
                    />
                    
                    {/* Send button */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Button
                        size="icon"
                        className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-all duration-200"
                        onClick={sendMessage}
                        disabled={!message.trim() || isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ArrowUp className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Simple CSS Border Beam animation when not focused */}
                  {!isFocused && (
                    <SimpleBorderBeam
                      duration={8}
                      borderWidth={2}
                    />
                  )}
                </div>
              </div>
              
              {/* Bottom helper text */}
              <div className="mt-3 text-center">
                <p className="text-xs text-muted-foreground/60">
{agentType === 'copilot' 
                    ? 'Powered by OpenAI × bitsCrunch — private, real-time answers just for you.'
                    : 'Powered by OpenAI × bitsCrunch — live market insight at your fingertips.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
