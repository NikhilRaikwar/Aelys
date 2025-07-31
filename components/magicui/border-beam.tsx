"use client";

import { cn } from "@/lib/utils";
import { motion, MotionStyle, Transition } from "motion/react";

interface BorderBeamProps {
  /**
   * The size of the border beam.
   */
  size?: number;
  /**
   * The duration of the border beam.
   */
  duration?: number;
  /**
   * The delay of the border beam.
   */
  delay?: number;
  /**
   * The color of the border beam from.
   */
  colorFrom?: string;
  /**
   * The color of the border beam to.
   */
  colorTo?: string;
  /**
   * The motion transition of the border beam.
   */
  transition?: Transition;
  /**
   * The class name of the border beam.
   */
  className?: string;
  /**
   * The style of the border beam.
   */
  style?: React.CSSProperties;
  /**
   * Whether to reverse the animation direction.
   */
  reverse?: boolean;
  /**
   * The initial offset position (0-100).
   */
  initialOffset?: number;
  /**
   * The border width of the beam.
   */
  borderWidth?: number;
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) => {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden">
      {/* Static border container - no rotation */}
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          border: `${borderWidth}px solid transparent`,
          background: 'linear-gradient(#000, #000) padding-box, linear-gradient(45deg, transparent, transparent) border-box',
        }}
      >
        {/* Traveling gradient beam */}
        <motion.div
          className={cn(
            "absolute",
            className,
          )}
          style={{
            width: size,
            height: size,
            background: `conic-gradient(from 0deg, transparent 0%, ${colorFrom} 25%, ${colorTo} 50%, ${colorFrom} 75%, transparent 100%)`,
            borderRadius: '50%',
            filter: 'blur(4px)',
            opacity: 0.8,
            offsetPath: `rect(0px auto auto 0px round ${16}px)`,
            ...style,
          } as MotionStyle}
          initial={{ offsetDistance: `${initialOffset}%` }}
          animate={{
            offsetDistance: reverse
              ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
              : [`${initialOffset}%`, `${100 + initialOffset}%`],
          }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration,
            delay: -delay,
            ...transition,
          }}
        />
        
        {/* Additional traveling beam for more effect */}
        <motion.div
          className={cn(
            "absolute",
            className,
          )}
          style={{
            width: size * 0.6,
            height: size * 0.6,
            background: `linear-gradient(90deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
            borderRadius: '50%',
            filter: 'blur(2px)',
            opacity: 0.6,
            offsetPath: `rect(0px auto auto 0px round ${16}px)`,
            ...style,
          } as MotionStyle}
          initial={{ offsetDistance: `${initialOffset + 50}%` }}
          animate={{
            offsetDistance: reverse
              ? [`${150 - initialOffset}%`, `${50 - initialOffset}%`]
              : [`${initialOffset + 50}%`, `${150 + initialOffset}%`],
          }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: duration * 1.2,
            delay: -delay - 0.5,
            ...transition,
          }}
        />
      </div>
    </div>
  );
};
