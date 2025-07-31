import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import Spline from '@splinetool/react-spline';

interface MarketInsightsChatInterfaceProps {
  splineScene: string;
  walletAddress: string;
}

export const MarketInsightsChatInterface: React.FC<MarketInsightsChatInterfaceProps> = ({ 
  splineScene,
  walletAddress
}) => {
  const [message, setMessage] = useState('');

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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full space-y-8">
          {/* Welcome message with Spline Animation */}
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
            <h2 className="text-2xl font-semibold">Welcome, {walletAddress}! How can I help you today?</h2>
          </div>

        </div>
      </div>
      
      {/* Fixed input area at bottom */}
      <div className="sticky bottom-0 p-4 bg-background/95 backdrop-blur-sm border-t">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything about NFTs, wallets, or the market…"
              className="w-full rounded-full px-6 py-4 text-lg border-2 border-border/50 hover:border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all pr-16 shadow-lg"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Button 
                size="sm" 
                className="h-10 w-10 p-0 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50" 
                disabled={!message.trim()}
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
