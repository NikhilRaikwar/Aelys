"use client"

import React from 'react';
import { MessageSquarePlus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface StickyHeaderProps {
  onNewChat: () => void;
  className?: string;
}

export function StickyHeader({ onNewChat, className }: StickyHeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block",
      className
    )}>
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left side - Sidebar trigger */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-8 w-8" />
        </div>

        {/* Right side - New Chat button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewChat}
            className="flex items-center gap-2 h-8 px-3 text-sm font-medium rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors new-chat-button"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

// Mobile-optimized version with cleaner styling
export function MobileStickyHeader({ onNewChat, className }: StickyHeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 block md:hidden",
      className
    )}>
      <div className="flex h-12 items-center justify-between px-3">
        {/* Left side - Sidebar trigger */}
        <SidebarTrigger className="h-8 w-8 -ml-1" />

        {/* Right side - New Chat button (icon only on mobile) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewChat}
          className="h-8 w-8 p-0 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors new-chat-button"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="sr-only">New Chat</span>
        </Button>
      </div>
    </header>
  );
}
