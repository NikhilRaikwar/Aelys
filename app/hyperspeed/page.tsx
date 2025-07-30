"use client";

import Hyperspeed from "@/components/hyperspeed";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { Button } from "@/components/ui/button";

const HyperspeedPage: FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Hyperspeed Background */}
      <div className="absolute inset-0 z-0">
        <Hyperspeed />
      </div>
      
      {/* Centered Navigation Bar */}
      <div className="relative z-10 flex justify-center pt-8 px-4">
        <nav className="flex items-center justify-between w-full max-w-4xl bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-8 py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Image 
              src="/logo.png" 
              alt="Aelys Logo" 
              width={32} 
              height={32} 
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-white">Aelys</span>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/"
              className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link 
              href="https://github.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
            >
              Github
            </Link>
          </div>
        </nav>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 -mt-16">
        {/* Announcement Banner */}
        <div className="mb-12">
          <div className="inline-flex items-center bg-black/30 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
            <span className="text-sm font-medium text-white/90">
              ✨ Aelys: Unlock NFT Intelligence in Real Time
            </span>
          </div>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-12 leading-tight max-w-5xl">
          Connect your wallet for{" "}
          <span className="bg-gradient-to-r from-red-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            AI-powered analytics
          </span>, live answers, and real-time NFT insights with{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            bitsCrunch
          </span>.
        </h1>
        
        {/* Single CTA Button */}
        <Link href="/">
          <Button 
            className="bg-white hover:bg-gray-100 text-black font-bold text-lg px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            size="lg"
          >
            Connect Wallet
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HyperspeedPage;

