"use client";

import React from "react";
import AnimationPage from "@/components/ui/hero-ascii-one";
import { Header } from "@/components/ui/header-2";
import { useClerk, useAuth } from "@clerk/nextjs";
import { Brain, Sparkles, Target, Zap } from "lucide-react";

export function Landing({ onEnterApp }: { onEnterApp: () => void }) {
  const { openSignIn } = useClerk();
  const { isSignedIn } = useAuth();
  
  const handleStart = () => {
    if (isSignedIn) {
      onEnterApp();
    } else {
      openSignIn();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] scroll-smooth">
      <Header onAuthAction={handleStart} />
      
      {/* Hero Section */}
      <AnimationPage onStartClick={handleStart} />
      
      {/* Information Section */}
      <section id="features" className="py-24 px-6 md:px-12 bg-black text-white relative z-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-mono font-bold tracking-tight mb-4 uppercase">
              The Evolution of STEM
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-mono text-sm md:text-base">
              Emersa fundamentally redesigns how students interact with complex mathematics and scientific concepts using cutting-edge spatial computing and voice AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition duration-300">
              <Brain className="w-8 h-8 text-indigo-400 mb-6" />
              <h3 className="text-xl font-mono font-bold mb-3">Live Voice AI Tutors</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connect with our proprietary sub-200ms voice engine. Speak naturally to work through calculus derivatives or organic chemistry balancing, receiving instant vocal feedback and guidance.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition duration-300">
              <Sparkles className="w-8 h-8 text-purple-400 mb-6" />
              <h3 className="text-xl font-mono font-bold mb-3">Interactive 3D Environments</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Step inside the equation. Rotate multi-variable calculus graphs, inspect physics collision models globally, or watch chemical bonds form dynamically in real-time WebGL spaces.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition duration-300">
              <Target className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-xl font-mono font-bold mb-3">Adaptive Pacing Systems</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The platform intelligently monitors your hesitation, completion speed, and vocal confusion cues to dynamically adjust the difficulty gradient perfectly to your edge of learning.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="p-8 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition duration-300">
              <Zap className="w-8 h-8 text-orange-400 mb-6" />
              <h3 className="text-xl font-mono font-bold mb-3">Continuous Evolution</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Sisyphus Protocol guarantees our system is always improving. As our AI maps broader cognitive learning trees, your educational pathways become radically customized over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 md:px-12 bg-[#020202] text-white relative z-10 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-mono font-bold tracking-tight mb-4 uppercase">
              Access the Engine
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto font-mono text-sm">
              Simple, transparent pricing. No artificial limitations on your learning potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 border border-white/10 bg-white/[0.02] flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-mono font-bold mb-2">BASE_ACCESS</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-500 font-mono text-xs ml-2">/ FOREVER</span>
                </div>
                <ul className="space-y-4 mb-8 font-mono text-sm text-gray-400">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white" /> Basic AI Voice Chat</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white" /> Access to Standard Calculus</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white" /> Community Math Visuals</li>
                </ul>
              </div>
              <button onClick={handleStart} className="w-full py-3 bg-transparent border border-white hover:bg-white hover:text-black transition-all font-mono text-sm tracking-wider">
                INITIALIZE
              </button>
            </div>

            {/* Pro Tier */}
            <div className="p-8 border-2 border-white bg-white/[0.05] relative flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-mono font-bold px-3 py-1 uppercase translate-x-px -translate-y-[1px]">
                Recommended
              </div>
              <div>
                <h3 className="text-2xl font-mono font-bold mb-2">UNBOUND_PRO</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$15</span>
                  <span className="text-gray-500 font-mono text-xs ml-2">/ MONTH</span>
                </div>
                <ul className="space-y-4 mb-8 font-mono text-sm text-gray-300">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400" /> Advanced 3D Interactive WebGL</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400" /> Sub-200ms Priority Voice Engine</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400" /> Endless Adaptive Pacing</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400" /> Chemistry & Physics Branches</li>
                </ul>
              </div>
              <button onClick={handleStart} className="w-full py-3 bg-white text-black hover:bg-neutral-200 transition-colors font-mono font-bold text-sm tracking-wider">
                ENGAGE PRO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 md:px-12 bg-[#050505] text-white relative z-10 border-t border-white/10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-5xl font-mono font-bold tracking-tight mb-6 uppercase">
              Mission Directive
            </h2>
            <div className="space-y-4 text-gray-400 font-mono text-sm leading-relaxed">
              <p>
                We started Emersa back in 2026 because we noticed a huge problem: trying to learn high-level STEM is incredibly frustrating when you're stuck doing it alone or waiting on a teacher.
              </p>
              <p>
                We wanted to build an AI tutor that actually feels like a friend sitting right next to you—someone with infinite patience to walk you through the toughest calculus problems or chemistry models until they finally click.
              </p>
            </div>
            <div className="mt-8 flex gap-4 opacity-50">
              <div className="font-mono text-[10px] flex items-center gap-2 border border-white/20 p-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> NETWORK.ONLINE
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 aspect-square relative border border-white/20 p-2 opacity-80 pointer-events-none">
            {/* Minimal ascii visual fallback */}
            <div className="w-full h-full bg-black flex items-center justify-center border border-white/10 font-mono text-[10px] text-white/40 overflow-hidden leading-none tracking-tighter whitespace-pre" suppressHydrationWarning>
              {`+----------------------------------+
|      .                      .      |
|           [ SYSTEM NODE ]          |
|    .          \\\    //          .    |
|                >><<                |
|    .          //    \\\\          .    |
|               (CORE)               |
|                                  |
|     \\\      //          \\\\      //     |
|      \\\\__//            \\\\__//      |
|                                  |
|   .                      .         |
+----------------------------------+`}
            </div>
          </div>
        </div>
      </section>

      {/* Basic Footer to tie it off */}
      <footer className="py-12 border-t border-white/10 bg-[#020202] text-center text-gray-500 font-mono text-xs">
        <p>EMERSA.ENGINE_V1 // EST. 2026 // ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
