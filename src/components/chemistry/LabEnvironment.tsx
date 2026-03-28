"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function FluorescentLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.6, 0.06, 0.3]} />
        <meshStandardMaterial color="#f8f8ff" emissive="#f0f0ff" emissiveIntensity={2} />
      </mesh>
      <rectAreaLight
        width={1.6}
        height={0.3}
        intensity={8}
        position={[0, -0.04, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        color="#f5f5ff"
      />
    </group>
  );
}

function LabBench({
  position,
  width = 3,
  depth = 0.9,
}: {
  position: [number, number, number];
  width?: number;
  depth?: number;
}) {
  const topH = 0.04;
  const legH = 0.85;
  const legW = 0.05;

  return (
    <group position={position}>
      {/* Countertop — white epoxy */}
      <mesh position={[0, legH + topH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, topH, depth]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.15} metalness={0.05} />
      </mesh>
      {/* Cabinet body */}
      <mesh position={[0, legH / 2, 0]}>
        <boxGeometry args={[width - 0.04, legH, depth - 0.04]} />
        <meshStandardMaterial color="#d4d4d8" roughness={0.5} />
      </mesh>
      {/* Legs */}
      {[
        [-width / 2 + 0.1, 0, -depth / 2 + 0.1],
        [width / 2 - 0.1, 0, -depth / 2 + 0.1],
        [-width / 2 + 0.1, 0, depth / 2 - 0.1],
        [width / 2 - 0.1, 0, depth / 2 - 0.1],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], legW / 2, p[2]]}>
          <boxGeometry args={[legW, legW, legW]} />
          <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function FumeHood({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base cabinet */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.7]} />
        <meshStandardMaterial color="#d4d4d8" roughness={0.5} />
      </mesh>
      {/* Work surface */}
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[1.24, 0.04, 0.74]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.2} />
      </mesh>
      {/* Hood enclosure */}
      <mesh position={[0, 1.5, -0.1]}>
        <boxGeometry args={[1.2, 1.1, 0.6]} />
        <meshPhysicalMaterial
          color="#e0e8f0"
          transparent
          opacity={0.15}
          roughness={0.05}
          metalness={0.1}
          transmission={0.8}
        />
      </mesh>
      {/* Hood top */}
      <mesh position={[0, 2.06, -0.1]}>
        <boxGeometry args={[1.24, 0.04, 0.64]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Stool({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.04, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
        <meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.08, 24]} />
        <meshStandardMaterial color="#666" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Sink({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.3]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Faucet */}
      <mesh position={[0, 0.15, -0.1]}>
        <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.15} />
      </mesh>
    </group>
  );
}

export default function LabEnvironment() {
  const { camera } = useThree();
  const initialized = useRef(false);

  useFrame(() => {
    if (!initialized.current) {
      camera.position.set(0, 1.6, 2.2);
      camera.lookAt(0, 1.0, 0);
      initialized.current = true;
    }
  });

  const roomW = 12;
  const roomD = 8;
  const roomH = 3.2;

  return (
    <>
      {/* Ambient + directional fill — brighter for lab visibility */}
      <ambientLight intensity={0.65} color="#f0f0ff" />
      <directionalLight position={[3, 4, 2]} intensity={0.85} color="#fff" castShadow />
      <directionalLight position={[-2, 3, 3]} intensity={0.35} color="#f0f8ff" />

      {/* Floor — light vinyl */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.4} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, roomH, 0]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, roomH / 2, -roomD / 2]}>
        <planeGeometry args={[roomW, roomH]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* Front wall (behind camera) */}
      <mesh position={[0, roomH / 2, roomD / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[roomW, roomH]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      {/* Left wall */}
      <mesh position={[-roomW / 2, roomH / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[roomD, roomH]} />
        <meshStandardMaterial color="#f2f2f2" />
      </mesh>
      {/* Right wall */}
      <mesh position={[roomW / 2, roomH / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[roomD, roomH]} />
        <meshStandardMaterial color="#f2f2f2" />
      </mesh>

      {/* Fluorescent lights */}
      <FluorescentLight position={[-2, roomH - 0.05, -1]} />
      <FluorescentLight position={[2, roomH - 0.05, -1]} />
      <FluorescentLight position={[-2, roomH - 0.05, 1.5]} />
      <FluorescentLight position={[2, roomH - 0.05, 1.5]} />
      <FluorescentLight position={[0, roomH - 0.05, -2.5]} />
      <FluorescentLight position={[0, roomH - 0.05, 0.5]} />

      {/* Lab benches — two rows */}
      <LabBench position={[-2.5, 0, -1]} width={3.5} />
      <LabBench position={[2.5, 0, -1]} width={3.5} />
      <LabBench position={[-2.5, 0, 1.5]} width={3.5} />
      <LabBench position={[2.5, 0, 1.5]} width={3.5} />

      {/* Center bench (where titration happens) */}
      <LabBench position={[0, 0, 0]} width={2.5} depth={1} />

      {/* Fume hoods along back wall */}
      <FumeHood position={[-3.5, 0, -roomD / 2 + 0.4]} />
      <FumeHood position={[-1.5, 0, -roomD / 2 + 0.4]} />
      <FumeHood position={[1.5, 0, -roomD / 2 + 0.4]} />
      <FumeHood position={[3.5, 0, -roomD / 2 + 0.4]} />

      {/* Sinks on side benches */}
      <Sink position={[-2.5, 0.89, -0.7]} />
      <Sink position={[2.5, 0.89, -0.7]} />

      {/* Stools */}
      <Stool position={[-1.2, 0, 0.8]} />
      <Stool position={[1.2, 0, 0.8]} />
      <Stool position={[-3, 0, -0.2]} />
      <Stool position={[3, 0, -0.2]} />
      <Stool position={[-3, 0, 2.2]} />
      <Stool position={[3, 0, 2.2]} />

      {/* Door (back-left) — yellow */}
      <mesh position={[-roomW / 2 + 0.01, 1.1, -2.5]}>
        <planeGeometry args={[0.9, 2.1]} />
        <meshStandardMaterial color="#d4a520" roughness={0.6} />
      </mesh>
      <mesh position={[-roomW / 2 + 0.02, 1.1, -2.2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.03, 0.06, 0.06]} />
        <meshStandardMaterial color="#aaa" metalness={0.7} />
      </mesh>
    </>
  );
}
