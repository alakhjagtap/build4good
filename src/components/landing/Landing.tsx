"use client";

import React, { useEffect, useState } from "react";
import { ShaderAnimation } from "@/components/ui/shader-lines";
import { motion, AnimatePresence } from "framer-motion";
import { Trispace } from "next/font/google";

const trispace = Trispace({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export function Landing({ onEnterApp }: { onEnterApp: () => void }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Keyboard space interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !isTransitioning) {
        e.preventDefault();
        setIsTransitioning(true);

        // Fast, punchy cinematic zoom transition over 650ms
        setTimeout(() => {
          onEnterApp();
        }, 650);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTransitioning, onEnterApp]);

  return (
    <div className={`relative w-full h-screen min-h-screen bg-[#000000] overflow-hidden flex flex-col items-center justify-center text-white select-none ${trispace.className}`}>
      
      {/* Background Shader Cinematic Container */}
      <motion.div 
        className="absolute inset-0 z-0 origin-center"
        initial={false}
        animate={isTransitioning ? { 
          scale: 1.8, 
          opacity: 0, 
          filter: "brightness(4) contrast(2) blur(2px)",
        } : { 
          scale: 1, 
          opacity: 1, 
          filter: "brightness(1) contrast(1) blur(0px)",
        }}
        transition={{ 
          duration: 0.65, 
          ease: [0.6, -0.05, 0.9, 0.8] // Anticipation pull then hard acceleration
        }}
      >
        <ShaderAnimation />
      </motion.div>

      {/* Main Center Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center -translate-y-4">
        
        {/* Logo Text Animation */}
        <motion.h1 
          className="text-6xl md:text-8xl font-bold text-white mb-4 md:mb-6 uppercase origin-center" 
          style={{ textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}
          initial={{ letterSpacing: "0.1em", scale: 1, opacity: 1, filter: "blur(0px) brightness(1)" }}
          animate={isTransitioning ? {
            letterSpacing: "0.8em",    // Sharp horizontal stretch
            scale: 5,                  // Extreme forward push (zoom through)
            opacity: 0,                // Vanishes safely past camera
            filter: "blur(12px) brightness(3)", // Motion blur and bloom
            y: 50 // Pull slightly down as it zooms so the camera goes 'over' center
          } : {
            letterSpacing: "0.1em",
            scale: 1,
            opacity: 1,
            filter: "blur(0px) brightness(1)",
            y: 0
          }}
          transition={{ duration: 0.65, ease: [0.6, -0.05, 0.9, 0.8] }} // Snaps with strong late momentum
        >
          IMMERSA
        </motion.h1>

        {/* Caption rapidly vanishes immediately */}
        <motion.p 
          className="text-sm md:text-base font-normal text-gray-300 max-w-sm md:max-w-md text-center px-6 tracking-wide" 
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
          initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          animate={isTransitioning ? {
            opacity: 0,
            scale: 0.8,
            filter: "blur(8px)",
            y: 20
          } : {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            y: 0
          }}
          transition={{ duration: 0.3, ease: "easeOut" }} // Zaps away super fast
        >
          Immersive AI learning for the next generation of STEM.
        </motion.p>
      </div>

      {/* Bottom Prompt */}
      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0.3 }}
        animate={isTransitioning ? {
          opacity: 0,
          filter: "blur(4px)"
        } : {
          opacity: [0.3, 1, 0.3],
          filter: "blur(0px)"
        }}
        transition={isTransitioning ? {
          duration: 0.2,
          ease: "easeOut"
        } : {
          duration: 1.4,
          ease: "easeInOut",
          repeat: Infinity
        }}
      >
        <p className="text-sm md:text-sm font-semibold tracking-[0.3em] text-white uppercase" style={{ textShadow: "0 2px 10px rgba(0,0,0,1)" }}>
          PRESS SPACE TO CONTINUE
        </p>
      </motion.div>
    </div>
  );
}
