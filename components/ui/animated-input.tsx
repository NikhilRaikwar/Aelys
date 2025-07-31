"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/magicui/border-beam";

const AnimatedInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="relative">
      <input
        type={type}
        className={cn(
          "flex h-16 w-full rounded-2xl bg-background px-6 py-4 text-lg file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          // Remove default border and ring styles, add custom focus border
          "border-0 outline-none ring-0",
          // Add 2px black border only when focused
          isFocused && "border-2 border-black",
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
  );
});

AnimatedInput.displayName = "AnimatedInput";

export { AnimatedInput };
