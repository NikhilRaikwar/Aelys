"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface ChatInputProps extends Omit<React.ComponentProps<"input">, "onSubmit"> {
  onSubmit?: (message: string) => void;
  showButton?: boolean;
}

const ChatInput = React.forwardRef<HTMLInputElement, ChatInputProps>(
  ({ className, onSubmit, showButton = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim() && onSubmit) {
        onSubmit(message);
        setMessage("");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex h-16 w-full rounded-2xl bg-muted/50 px-6 py-4 text-lg placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
              // Remove default border and ring styles
              "border-0 outline-none ring-0",
              // Add 2px black border only when focused
              isFocused && "border-2 border-black",
              // Add padding for button if shown
              showButton && "pr-16",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {/* Send Button */}
          {showButton && (
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim()}
              className="absolute right-2 top-1/2 h-12 w-12 -translate-y-1/2 rounded-xl bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          )}
          
          {/* Show border beam only when not focused */}
          {!isFocused && (
            <BorderBeam
              size={80}
              duration={8}
              colorFrom="#666666"
              colorTo="#333333"
              borderWidth={2}
            />
          )}
        </div>
      </form>
    );
  }
);

ChatInput.displayName = "ChatInput";

export { ChatInput };
