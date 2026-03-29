# Immersa

An interactive AI-powered platform for **STEM learning**: synchronized explanations, interactive 3D visuals, voice interaction, and guided sessions in the browser.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the app.

## Features

- **Immersive sessions** — 3D environments and interactive visuals powered by React Three Fiber
- **AI tutoring** — Streaming and structured lesson flows via API routes
- **Voice** — Web Speech API for speech-in / speech-out where supported
- **Math & notation** — KaTeX for LaTeX rendering in the UI
- **Dashboard & onboarding** — Course-style entry into learning modes

## Architecture

```
src/
├── app/                  # Next.js App Router pages
├── components/
│   ├── lesson/           # LessonInput, ExplanationPanel
│   ├── visualization/    # 3D scene components (Three.js)
│   ├── controls/         # PlaybackControls
│   ├── instructor/       # AIInstructorPanel
│   └── practice/         # GuidedPractice
├── lib/
│   ├── lesson-engine/    # Zustand state management
│   ├── speech/           # Web Speech API wrapper
│   └── mock-data/        # Predefined lessons + AI responses
└── types/                # TypeScript interfaces
```

### Key Design Decisions

- **Zustand** for global lesson state — lightweight, no boilerplate
- **React Three Fiber + Drei** for 3D — React-native Three.js with helpers
- **Framer Motion** for UI animations
- **KaTeX** for LaTeX formula rendering
- **Web Speech API** for voice input/output (Chrome/Edge)

## Future Integrations

### Manim Community (Math Animation)
The visualization architecture is designed for future Manim integration:
- Current: Browser-native Three.js surfaces and vectors
- Future: Pre-render Manim animations server-side, stream as video overlays
- Reference: [github.com/ManimCommunity/manim](https://github.com/ManimCommunity/manim)

### HeyGen (AI Avatar)
The `AIInstructorPanel` includes a placeholder designed for HeyGen:
- Current: Static avatar with typed captions
- Future: Real-time AI avatar video synced to lesson narration
- Swap the avatar placeholder with HeyGen's streaming API

### LLM Integration
The lesson engine uses a structured JSON schema:
- Current: Predefined lesson templates for multiple concepts
- Future: Call an LLM (GPT-4, Claude) to generate lessons on-the-fly from the schema

## Tech Stack

- **Next.js 15** + React 19 + TypeScript
- **Tailwind CSS** — dark theme, custom design system
- **Three.js** via @react-three/fiber + @react-three/drei
- **Zustand** — state management
- **Framer Motion** — animations
- **KaTeX** — math rendering
- **Web Speech API** — voice input/output
- **Lucide React** — icons
