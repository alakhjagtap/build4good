# Emersa — AI Calculus 3 Tutor

An interactive AI-powered platform that teaches Calculus 3 concepts through synchronized explanation, interactive 3D visuals, and voice-based follow-up questions.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and type a concept like **"gradient vectors"** to begin.

## Supported Concepts

| Concept | Visualization |
|---------|---------------|
| Gradient Vectors | Surface + gradient arrow + contour lines |
| Partial Derivatives | Surface with x/y plane slices |
| Tangent Planes | Surface + tangent plane + normal vector |
| Double Integrals | Volume region shading |
| Lagrange Multipliers | Contour lines + constraint curve |

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
- Current: Predefined lesson templates for 5 concepts
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
