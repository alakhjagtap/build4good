"use client";

import React, { useEffect, useState } from "react";
import { ShaderAnimation } from "@/components/ui/shader-lines";
import { motion } from "framer-motion";

export function Landing({ onEnterApp }: { onEnterApp: () => void }) {
  const [showPrompt, setShowPrompt] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Blinking effect for the prompt
  useEffect(() => {
    if (isTransitioning) return;
    
    const interval = setInterval(() => {
      setShowPrompt((prev) => !prev);
    }, 1000); 

    return () => clearInterval(interval);
  }, [isTransitioning]);

  // Keyboard space interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !isTransitioning) {
        e.preventDefault();
        setIsTransitioning(true);
        
        // Hide the prompt immediately
        setShowPrompt(false);

        // Hyper-space cinematic transition takes ~1.2s
        setTimeout(() => {
          onEnterApp();
        }, 1200);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTransitioning, onEnterApp]);

  return (
    <div className="relative w-full h-screen min-h-screen bg-[#000000] overflow-hidden flex flex-col items-center justify-center font-sans text-white select-none">
      
      {/* Background Shader Cinematic Container */}
      <motion.div 
        className="absolute inset-0 z-0 origin-center"
        initial={false}
        animate={isTransitioning ? { 
          scale: 4.5, 
          opacity: 0, 
          filter: "brightness(3) contrast(1.5) blur(4px)" 
        } : { 
          scale: 1, 
          opacity: 1, 
          filter: "brightness(1) contrast(1) blur(0px)" 
        }}
        transition={{ 
          duration: 1.2, 
          ease: "easeIn" // Accelerates as you "fall in"
        }}
      >
        <ShaderAnimation />
      </motion.div>

      {/* Main Center Content */}
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center -translate-y-4"
        initial={false}
        animate={isTransitioning ? {
          scale: 2,
          opacity: 0,
          y: -100, // Move up and away like flying into the screen
          filter: "blur(8px)"
        } : {
          scale: 1,
          opacity: 1,
          y: 0,
          filter: "blur(0px)"
        }}
        transition={{ duration: 0.9, ease: "easeIn" }}
      >
        <h1 
          className="text-6xl md:text-8xl tracking-tight font-extrabold text-white mb-4 md:mb-6 uppercase" 
          style={{ textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}
        >
          IMMERSA
        </h1>
        <p className="text-sm md:text-base font-medium text-gray-300 max-w-sm md:max-w-md text-center px-6 tracking-wide" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
          Immersive AI learning for the next generation of STEM.
        </p>
      </motion.div>

      {/* Bottom Prompt */}
      <div 
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-10 transition-all duration-300 ease-in-out ${showPrompt && !isTransitioning ? 'opacity-100' : 'opacity-0 translate-y-4 blur-sm'}`}
      >
        <p className="text-sm md:text-sm font-bold tracking-[0.3em] text-white uppercase" style={{ textShadow: "0 2px 10px rgba(0,0,0,1)" }}>
          PRESS SPACE TO CONTINUE
        </p>
      </div>
    </div>
  );
}
