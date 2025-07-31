"use client";

import { cn } from "@/lib/utils";

interface SimpleBorderBeamProps {
  className?: string;
  duration?: number;
  borderWidth?: number;
}

export const SimpleBorderBeam = ({
  className,
  duration = 8,
  borderWidth = 2,
}: SimpleBorderBeamProps) => {
  return (
    <>
      <style jsx>{`
        @keyframes border-beam-travel {
          0% {
            background-position: 0% 0%;
          }
          25% {
            background-position: 100% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
        .border-beam-travel {
          animation: border-beam-travel ${duration}s linear infinite;
        }
      `}</style>
      <div
        className={cn(
          "absolute inset-0 rounded-2xl pointer-events-none overflow-hidden",
          className
        )}
      >
        {/* Static container without rotation */}
        <div className="absolute inset-0 rounded-2xl">
          {/* Traveling gradient beam */}
          <div
            className="border-beam-travel absolute inset-0 rounded-2xl"
            style={{
              background: `linear-gradient(90deg, transparent 0%, #8b5cf6 20%, #fbbf24 40%, #ec4899 60%, #8b5cf6 80%, transparent 100%)`,
              backgroundSize: '400% 400%',
              padding: `${borderWidth}px`,
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
            }}
          />
          {/* Inner content area */}
          <div className="absolute inset-0 rounded-2xl" style={{ margin: `${borderWidth}px` }}>
            <div className="w-full h-full bg-transparent rounded-2xl" />
          </div>
        </div>
      </div>
    </>
  );
};
