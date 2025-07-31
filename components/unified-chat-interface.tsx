"use client"

import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUp, Bot, TrendingUp } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import { SimpleBorderBeam } from '@/components/ui/simple-border-beam';

interface UnifiedChatInterfaceProps {
  splineScene: string;
  walletAddress: string;
  agentType: 'copilot' | 'market-insights';
}

export const UnifiedChatInterface: React.FC<UnifiedChatInterfaceProps> = ({ 
  splineScene, 
  walletAddress, 
  agentType 
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSplineLoad = useCallback(() => {
    console.log(`Spline scene loaded`);
  }, []);

  const handleSplineError = useCallback((error: any) => {
    console.error(`Spline error:`, error);
  }, []);

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
      {/* Main content area */}
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
            <div className="flex items-center justify-center gap-3">
              {agentType === 'copilot' ? (
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
              ) : (
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                {agentType === 'copilot' ? 'Aelys Copilot' : 'Market Insights'}
              </h1>
            </div>
            <h2 className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Welcome, {walletAddress}! How can I help you today?
            </h2>
          </div>

          {/* Centered Chat Input with Border Beam */}
          <div className="w-full max-w-3xl mx-auto">
            <div className="relative">
              <div className="relative group">
                <div className="relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can I help you today?"
                    className={`w-full h-16 pl-6 pr-16 text-lg rounded-2xl transition-all duration-300 bg-muted/50 placeholder:text-muted-foreground outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none ${
                      isFocused 
                        ? 'border-2 border-foreground focus:border-foreground focus-visible:border-foreground' 
                        : 'border-0 focus:border-0'
                    }`}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                  
                  {/* Send button */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button
                      size="icon"
                      className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-all duration-200"
                      disabled={!message.trim()}
                    >
                      <ArrowUp className="w-5 h-5" />
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
                  ? 'Ask anything about NFTs, wallets, or the market…'
                  : 'Get real-time market trends, top movers, and analytics…'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
