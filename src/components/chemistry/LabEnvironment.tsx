"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ── Overhead fluorescent panel ── */
function LabLight({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.4, 0.05, 0.28]} />
        <meshStandardMaterial
          color="#f8f8ff"
          emissive="#e8ecff"
          emissiveIntensity={1.6}
        />
      </mesh>
      <rectAreaLight
        width={1.4}
        height={0.28}
        intensity={6}
        position={[0, -0.03, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        color="#f0f2ff"
      />
    </group>
  );
}

/* ── Lab bench with cabinet and epoxy top ── */
function LabBench({
  position,
  width = 3,
  depth = 0.9,
}: {
  position: [number, number, number];
  width?: number;
  depth?: number;
}) {
  const topH = 0.045;
  const legH = 0.85;

  return (
    <group position={position}>
      <mesh position={[0, legH + topH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, topH, depth]} />
        <meshStandardMaterial
          color="#eceee8"
          roughness={0.12}
          metalness={0.03}
        />
      </mesh>
      <mesh position={[0, legH / 2, 0]}>
        <boxGeometry args={[width - 0.04, legH, depth - 0.04]} />
        <meshStandardMaterial color="#c8cac4" roughness={0.55} />
      </mesh>
      {[
        [-width / 2 + 0.08, 0, -depth / 2 + 0.08],
        [width / 2 - 0.08, 0, -depth / 2 + 0.08],
        [-width / 2 + 0.08, 0, depth / 2 - 0.08],
        [width / 2 - 0.08, 0, depth / 2 - 0.08],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], 0.025, p[2]]}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial
            color="#888"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Fume hood ── */
function FumeHood({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.7]} />
        <meshStandardMaterial color="#c8cac4" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[1.24, 0.04, 0.74]} />
        <meshStandardMaterial color="#ddddd8" roughness={0.18} />
      </mesh>
      <mesh position={[0, 1.5, -0.1]}>
        <boxGeometry args={[1.2, 1.1, 0.6]} />
        <meshPhysicalMaterial
          color="#d8e4ee"
          transparent
          opacity={0.12}
          roughness={0.02}
          metalness={0.05}
          transmission={0.85}
        />
      </mesh>
      <mesh position={[0, 2.06, -0.1]}>
        <boxGeometry args={[1.24, 0.04, 0.64]} />
        <meshStandardMaterial
          color="#9ca3af"
          metalness={0.35}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

/* ── Lab stool ── */
function Stool({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.04, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
        <meshStandardMaterial
          color="#999"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.08, 24]} />
        <meshStandardMaterial
          color="#666"
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

/* ── Sink ── */
function Sink({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.4, 0.15, 0.3]} />
        <meshStandardMaterial
          color="#c0c0c0"
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.15, -0.1]}>
        <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
        <meshStandardMaterial
          color="#aaa"
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>
      <mesh
        position={[0, 0.27, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
        <meshStandardMaterial
          color="#aaa"
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

/* ── Shelf with bottles (background detail) ── */
function ShelfRow({
  position,
}: {
  position: [number, number, number];
}) {
  const bottleColors = ["#d4a44c", "#7ab", "#a66", "#8a8", "#ca8"];
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2.4, 0.03, 0.22]} />
        <meshStandardMaterial color="#b8a080" roughness={0.6} />
      </mesh>
      {bottleColors.map((c, i) => (
        <group key={i} position={[-0.9 + i * 0.45, 0.07, 0]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.035, 0.1, 12]} />
            <meshPhysicalMaterial
              color={c}
              transparent
              opacity={0.55}
              roughness={0.08}
            />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.012, 0.02, 0.02, 8]} />
            <meshStandardMaterial color="#444" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Equipment shelf with varied glassware ── */
function EquipmentShelf({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2.4, 0.03, 0.25]} />
        <meshStandardMaterial color="#b8a080" roughness={0.6} />
      </mesh>
      {/* graduated cylinder */}
      <group position={[-0.8, 0.08, 0]}>
        <mesh>
          <cylinderGeometry args={[0.025, 0.03, 0.01, 10]} />
          <meshStandardMaterial color="#ccc" roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.065, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.12, 8, 1, true]} />
          <meshPhysicalMaterial
            color="#e0eaf4"
            transparent
            opacity={0.28}
            roughness={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 0.06, 8]} />
          <meshPhysicalMaterial
            color="#88bbee"
            transparent
            opacity={0.35}
          />
        </mesh>
      </group>
      {/* small erlenmeyer */}
      <group position={[-0.3, 0.04, 0]}>
        <mesh>
          <cylinderGeometry args={[0.012, 0.028, 0.04, 10, 1, true]} />
          <meshPhysicalMaterial
            color="#e0eaf4"
            transparent
            opacity={0.22}
            roughness={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      {/* reagent bottles */}
      {[0.1, 0.4, 0.7].map((x, i) => {
        const colors = ["#aa5533", "#3366aa", "#55aa33"];
        return (
          <group key={i} position={[x, 0.06, 0]}>
            <mesh>
              <cylinderGeometry args={[0.018, 0.02, 0.07, 10]} />
              <meshPhysicalMaterial
                color={colors[i]}
                transparent
                opacity={0.5}
                roughness={0.08}
              />
            </mesh>
            <mesh position={[0, 0.042, 0]}>
              <cylinderGeometry args={[0.012, 0.014, 0.015, 8]} />
              <meshStandardMaterial color="#333" roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.005, 0.021]}>
              <planeGeometry args={[0.025, 0.03]} />
              <meshStandardMaterial color="#f5f0e0" roughness={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ── Test tube rack ── */
function TestTubeRack({
  position,
}: {
  position: [number, number, number];
}) {
  const tubeColors = ["#ee8888", "#88bbee", "#aaee88", "#eecc66"];
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.12, 0.025, 0.04]} />
        <meshStandardMaterial color="#d4c4a0" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.12, 0.01, 0.03]} />
        <meshStandardMaterial color="#d4c4a0" roughness={0.6} />
      </mesh>
      {[-0.05, 0.05].map((x, i) => (
        <mesh key={i} position={[x, 0.035, 0]}>
          <boxGeometry args={[0.006, 0.06, 0.006]} />
          <meshStandardMaterial color="#c4b490" roughness={0.6} />
        </mesh>
      ))}
      {tubeColors.map((c, i) => (
        <group key={i} position={[-0.035 + i * 0.023, 0.04, 0]}>
          <mesh>
            <cylinderGeometry args={[0.005, 0.005, 0.085, 6, 1, true]} />
            <meshPhysicalMaterial
              color="#e0eaf4"
              transparent
              opacity={0.22}
              roughness={0.02}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.035, 6]} />
            <meshPhysicalMaterial color={c} transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Standalone beaker ── */
function BenchBeaker({
  position,
  liquidColor,
  liquidLevel = 0.5,
}: {
  position: [number, number, number];
  liquidColor?: string;
  liquidLevel?: number;
}) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 0.06, 16, 1, true]} />
        <meshPhysicalMaterial
          color="#e0eaf4"
          transparent
          opacity={0.24}
          roughness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        position={[0, -0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.03, 16]} />
        <meshPhysicalMaterial
          color="#e0eaf4"
          transparent
          opacity={0.14}
          roughness={0.02}
        />
      </mesh>
      {liquidColor && (
        <mesh
          position={[0, -0.03 + (liquidLevel * 0.06) / 2, 0]}
        >
          <cylinderGeometry
            args={[0.028, 0.028, liquidLevel * 0.06, 16]}
          />
          <meshPhysicalMaterial
            color={liquidColor}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
      <mesh position={[0, 0.03, 0]}>
        <torusGeometry args={[0.03, 0.002, 6, 16]} />
        <meshPhysicalMaterial
          color="#d0dce8"
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}

/* ── Small Erlenmeyer flask for bench decoration ── */
function BenchFlask({
  position,
  liquidColor,
}: {
  position: [number, number, number];
  liquidColor?: string;
}) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.024, 0.042, 0.055, 14, 1, true]} />
        <meshPhysicalMaterial
          color="#e0eaf4"
          transparent
          opacity={0.22}
          roughness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.011, 0.023, 0.025, 10, 1, true]} />
        <meshPhysicalMaterial
          color="#e0eaf4"
          transparent
          opacity={0.2}
          roughness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
      {liquidColor && (
        <mesh position={[0, -0.01, 0]}>
          <cylinderGeometry args={[0.018, 0.036, 0.035, 14]} />
          <meshPhysicalMaterial
            color={liquidColor}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
    </group>
  );
}

/* ── Reagent bottle for bench ── */
function ReagentBottle({
  position,
  color = "#d4a44c",
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.022, 0.024, 0.08, 12]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.5}
          roughness={0.08}
        />
      </mesh>
      <mesh position={[0, 0.048, 0]}>
        <cylinderGeometry args={[0.015, 0.018, 0.02, 10]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.005, 0.025]}>
        <planeGeometry args={[0.03, 0.035]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ── Notebook & clipboard on bench ── */
function Notebook({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.008, 0]} castShadow>
        <boxGeometry args={[0.14, 0.018, 0.2]} />
        <meshStandardMaterial color="#c4a574" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.017, -0.002]} castShadow>
        <boxGeometry args={[0.13, 0.004, 0.19]} />
        <meshStandardMaterial color="#faf8f2" roughness={0.55} />
      </mesh>
    </group>
  );
}

function Clipboard({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.02, 0.22, 0.16]} />
        <meshStandardMaterial color="#5c4030" roughness={0.65} />
      </mesh>
      <mesh position={[0.012, 0, 0]} castShadow>
        <boxGeometry args={[0.004, 0.2, 0.14]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.45} />
      </mesh>
    </group>
  );
}

function HotPlate({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.04, 0.22]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.025, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.012, 24]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0.1, 0.045, 0.08]}>
        <cylinderGeometry args={[0.012, 0.012, 0.025, 12]} />
        <meshStandardMaterial color="#222" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Pipette({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position} rotation={[0.35, 0, 0.2]}>
      <mesh>
        <cylinderGeometry args={[0.004, 0.006, 0.14, 8]} />
        <meshPhysicalMaterial
          color="#e8f0f8"
          transparent
          opacity={0.35}
          roughness={0.05}
        />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <coneGeometry args={[0.008, 0.025, 8]} />
        <meshPhysicalMaterial
          color="#e8f0f8"
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}

/* ── Stylized student with lab coat + safety goggles ── */
function LabPerson({
  position,
  rotationY = 0,
  skinTone = "#e8c4b0",
  coatColor = "#f4f6fb",
  pantsColor = "#2a3344",
  hairDark = false,
}: {
  position: [number, number, number];
  rotationY?: number;
  skinTone?: string;
  coatColor?: string;
  pantsColor?: string;
  hairDark?: boolean;
}) {
  const hairColor = hairDark ? "#3a3028" : "#8b6914";
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Feet / shoes */}
      <mesh position={[-0.07, 0.035, 0.02]} castShadow>
        <boxGeometry args={[0.1, 0.05, 0.2]} />
        <meshStandardMaterial color="#222" roughness={0.85} />
      </mesh>
      <mesh position={[0.07, 0.035, 0.02]} castShadow>
        <boxGeometry args={[0.1, 0.05, 0.2]} />
        <meshStandardMaterial color="#222" roughness={0.85} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.07, 0.28, 0]} castShadow>
        <boxGeometry args={[0.11, 0.42, 0.14]} />
        <meshStandardMaterial color={pantsColor} roughness={0.75} />
      </mesh>
      <mesh position={[0.07, 0.28, 0]} castShadow>
        <boxGeometry args={[0.11, 0.42, 0.14]} />
        <meshStandardMaterial color={pantsColor} roughness={0.75} />
      </mesh>
      {/* Torso — lab coat */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.4, 0.52, 0.24]} />
        <meshStandardMaterial color={coatColor} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.72, 0.125]} castShadow>
        <boxGeometry args={[0.08, 0.45, 0.02]} />
        <meshStandardMaterial color="#dfe6ee" roughness={0.5} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.24, 0.7, 0]} castShadow rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.1, 0.38, 0.12]} />
        <meshStandardMaterial color={coatColor} roughness={0.55} />
      </mesh>
      <mesh position={[0.24, 0.7, 0]} castShadow rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.1, 0.38, 0.12]} />
        <meshStandardMaterial color={coatColor} roughness={0.55} />
      </mesh>
      {/* Hands */}
      <mesh position={[-0.28, 0.52, 0.05]} castShadow>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color={skinTone} roughness={0.65} />
      </mesh>
      <mesh position={[0.28, 0.52, 0.05]} castShadow>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color={skinTone} roughness={0.65} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.08, 10]} />
        <meshStandardMaterial color={skinTone} roughness={0.65} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <sphereGeometry args={[0.12, 18, 18]} />
        <meshStandardMaterial color={skinTone} roughness={0.65} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.2, -0.05]} castShadow scale={[1.05, 0.48, 0.95]}>
        <sphereGeometry args={[0.11, 14, 14]} />
        <meshStandardMaterial color={hairColor} roughness={0.9} />
      </mesh>
      {/* Safety goggles — strap + lenses */}
      <mesh position={[0, 1.1, 0.1]} castShadow>
        <boxGeometry args={[0.22, 0.035, 0.025]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.45} metalness={0.3} />
      </mesh>
      <mesh position={[-0.045, 1.1, 0.115]}>
        <sphereGeometry args={[0.042, 14, 14]} />
        <meshPhysicalMaterial
          color="#a8ddff"
          transparent
          opacity={0.42}
          roughness={0.12}
          metalness={0.05}
          clearcoat={0.6}
        />
      </mesh>
      <mesh position={[0.045, 1.1, 0.115]}>
        <sphereGeometry args={[0.042, 14, 14]} />
        <meshPhysicalMaterial
          color="#a8ddff"
          transparent
          opacity={0.42}
          roughness={0.12}
          metalness={0.05}
          clearcoat={0.6}
        />
      </mesh>
      <mesh position={[0, 1.14, 0.06]}>
        <torusGeometry args={[0.11, 0.006, 6, 20, Math.PI]} />
        <meshStandardMaterial color="#333" roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ── Whiteboard: single textured plane (avoids z-fighting vs Html + stacked meshes) ── */
function ChemWhiteboard({
  position,
}: {
  position: [number, number, number];
}) {
  const [map, setMap] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const W = 2048;
    const H = 1152;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext("2d");
    if (!g) return;

    g.fillStyle = "#fafaf8";
    g.fillRect(0, 0, W, H);

    g.strokeStyle = "#4a4a4a";
    g.lineWidth = 28;
    g.strokeRect(16, 16, W - 32, H - 32);

    g.fillStyle = "#1a1a1a";
    g.font = "bold 210px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("CHEM 117", W / 2, H / 2 - 90);

    g.fillStyle = "#500000";
    g.font = "bold 118px Georgia, 'Times New Roman', serif";
    g.fillText("TEXAS A&M", W / 2, H / 2 + 150);

    g.fillStyle = "#555";
    g.font = "600 54px system-ui, sans-serif";
    g.fillText("General Chemistry", W / 2, H / 2 + 280);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;

    setMap(tex);
    return () => {
      tex.dispose();
    };
  }, []);

  return (
    <mesh position={position} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[2.2, 1.2]} />
      <meshStandardMaterial
        map={map ?? undefined}
        color="#ffffff"
        roughness={0.55}
        metalness={0.02}
        polygonOffset
        polygonOffsetFactor={2}
        polygonOffsetUnits={2}
      />
    </mesh>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN ENVIRONMENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

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
      {/* ── Lighting: warm key + cool fill + soft ambient ── */}
      <ambientLight intensity={0.55} color="#f4efe8" />
      <directionalLight
        position={[3, 4, 2]}
        intensity={0.9}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-2}
        shadow-bias={-0.001}
      />
      <directionalLight
        position={[-2.5, 3, 3]}
        intensity={0.3}
        color="#e8f0ff"
      />
      <directionalLight
        position={[0, 2.5, -3]}
        intensity={0.15}
        color="#f0f0ff"
      />

      {/* ── Floor — light vinyl tile ── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial
          color="#dddcd5"
          roughness={0.35}
          metalness={0.02}
        />
      </mesh>

      {/* ── Ceiling ── */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, roomH, 0]}
      >
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#f5f4f0" />
      </mesh>

      {/* ── Walls — warm off-white ── */}
      <mesh position={[0, roomH / 2, -roomD / 2]}>
        <planeGeometry args={[roomW, roomH]} />
        <meshStandardMaterial color="#f0eee6" />
      </mesh>
      <mesh
        position={[0, roomH / 2, roomD / 2]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[roomW, roomH]} />
        <meshStandardMaterial color="#ece9e0" />
      </mesh>
      <mesh
        position={[-roomW / 2, roomH / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[roomD, roomH]} />
        <meshStandardMaterial color="#edebe3" />
      </mesh>
      <mesh
        position={[roomW / 2, roomH / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[roomD, roomH]} />
        <meshStandardMaterial color="#edebe3" />
      </mesh>

      {/* ── Overhead fluorescent lights ── */}
      <LabLight position={[-2, roomH - 0.05, -1]} />
      <LabLight position={[2, roomH - 0.05, -1]} />
      <LabLight position={[-2, roomH - 0.05, 1.5]} />
      <LabLight position={[2, roomH - 0.05, 1.5]} />
      <LabLight position={[0, roomH - 0.05, -2.5]} />
      <LabLight position={[0, roomH - 0.05, 0.5]} />

      {/* ── Lab benches ── */}
      <LabBench position={[-2.5, 0, -1]} width={3.5} />
      <LabBench position={[2.5, 0, -1]} width={3.5} />
      <LabBench position={[-2.5, 0, 1.5]} width={3.5} />
      <LabBench position={[2.5, 0, 1.5]} width={3.5} />
      <LabBench position={[0, 0, 0]} width={2.5} depth={1} />

      {/* ── Fume hoods along back wall ── */}
      <FumeHood position={[-3.5, 0, -roomD / 2 + 0.4]} />
      <FumeHood position={[-1.5, 0, -roomD / 2 + 0.4]} />
      <FumeHood position={[1.5, 0, -roomD / 2 + 0.4]} />
      <FumeHood position={[3.5, 0, -roomD / 2 + 0.4]} />

      {/* ── Sinks ── */}
      <Sink position={[-2.5, 0.89, -0.7]} />
      <Sink position={[2.5, 0.89, -0.7]} />

      {/* ── Stools ── */}
      <Stool position={[-1.2, 0, 0.8]} />
      <Stool position={[1.2, 0, 0.8]} />
      <Stool position={[-3, 0, -0.2]} />
      <Stool position={[3, 0, -0.2]} />
      <Stool position={[-3, 0, 2.2]} />
      <Stool position={[3, 0, 2.2]} />

      {/* ── Background shelves with reagent bottles ── */}
      <ShelfRow position={[-3.5, 1.6, -roomD / 2 + 0.15]} />
      <ShelfRow position={[3.5, 1.6, -roomD / 2 + 0.15]} />
      <ShelfRow position={[-3.5, 2.0, -roomD / 2 + 0.15]} />
      <ShelfRow position={[3.5, 2.0, -roomD / 2 + 0.15]} />
      <EquipmentShelf position={[-3.5, 2.4, -roomD / 2 + 0.15]} />
      <EquipmentShelf position={[3.5, 2.4, -roomD / 2 + 0.15]} />

      {/* ── Equipment on side benches ── */}
      <TestTubeRack position={[-2.2, 0.895, -0.82]} />
      <TestTubeRack position={[2.8, 0.895, -1.18]} />
      <BenchBeaker
        position={[-2.8, 0.895, -1.15]}
        liquidColor="#88bbee"
        liquidLevel={0.6}
      />
      <BenchBeaker
        position={[-2.3, 0.895, 1.38]}
        liquidColor="#ee9988"
        liquidLevel={0.35}
      />
      <BenchBeaker
        position={[2.2, 0.895, 1.42]}
        liquidColor="#aaddaa"
        liquidLevel={0.45}
      />
      <BenchFlask
        position={[-2.7, 0.895, 1.58]}
        liquidColor="#ccaa55"
      />
      <BenchFlask
        position={[2.6, 0.895, -0.78]}
        liquidColor="#aaccee"
      />
      <ReagentBottle position={[3.0, 0.895, 1.32]} color="#995533" />
      <ReagentBottle position={[3.2, 0.895, 1.38]} color="#336699" />
      <ReagentBottle position={[-3.0, 0.895, 1.62]} color="#669933" />
      <ReagentBottle position={[-3.3, 0.895, -0.92]} color="#aa4444" />

      {/* ── Extra bench props (center + side stations) ── */}
      <Notebook position={[0.78, 0.895, 0.3]} rotationY={-0.5} />
      <Clipboard position={[-0.85, 0.895, 0.28]} rotationY={0.45} />
      <HotPlate position={[-0.52, 0.895, -0.32]} />
      <Pipette position={[0.58, 0.905, -0.26]} />
      <BenchBeaker
        position={[0.92, 0.895, 0.12]}
        liquidColor="#ddeeff"
        liquidLevel={0.25}
      />
      <BenchBeaker
        position={[-0.95, 0.895, 0.18]}
        liquidColor="#eeddcc"
        liquidLevel={0.5}
      />
      <ReagentBottle position={[0.35, 0.895, 0.38]} color="#8844aa" />
      <TestTubeRack position={[1.05, 0.895, -0.35]} />
      <Notebook position={[-1.95, 0.895, 0.34]} rotationY={0.3} />
      <HotPlate position={[-3.15, 0.895, -0.72]} />
      <Clipboard position={[-2.85, 0.895, 1.45]} rotationY={-0.35} />
      <Pipette position={[2.9, 0.905, 1.35]} />
      <BenchFlask position={[3.15, 0.895, -0.65]} liquidColor="#dde9aa" />
      <Notebook position={[2.1, 0.895, -0.95]} rotationY={-0.25} />

      {/* ── Students at benches (safety goggles + lab coats) ── */}
      <LabPerson
        position={[0.18, 0, 0.82]}
        rotationY={Math.PI}
        skinTone="#e8c4b0"
        hairDark={false}
      />
      <LabPerson
        position={[-2.38, 0, 0.4]}
        rotationY={Math.PI}
        skinTone="#c99e86"
        coatColor="#eef1f8"
        hairDark
      />
      <LabPerson
        position={[2.4, 0, 0.38]}
        rotationY={Math.PI}
        skinTone="#9d7b65"
        pantsColor="#243040"
        hairDark
      />
      <LabPerson
        position={[-1.1, 0, -2.15]}
        rotationY={0.55}
        skinTone="#deb8a0"
        coatColor="#f6f8fc"
      />

      {/* ── Periodic table poster on back wall ── */}
      <group position={[0, 1.85, -roomD / 2 + 0.01]}>
        <mesh position={[0, 0, -0.008]}>
          <boxGeometry args={[1.56, 0.98, 0.016]} />
          <meshStandardMaterial
            color="#555"
            roughness={0.5}
          />
        </mesh>
        <mesh>
          <planeGeometry args={[1.5, 0.92]} />
          <meshStandardMaterial color="#eaf0f6" roughness={0.45} />
        </mesh>
      </group>

      {/* ── Fire extinguisher on wall ── */}
      <group position={[-roomW / 2 + 0.08, 0.4, 0.5]}>
        <mesh>
          <cylinderGeometry args={[0.055, 0.055, 0.4, 12]} />
          <meshStandardMaterial color="#cc2222" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.014, 0.018, 0.07, 8]} />
          <meshStandardMaterial color="#222" roughness={0.5} />
        </mesh>
      </group>

      {/* ── Safety eyewash sign ── */}
      <mesh
        position={[roomW / 2 - 0.01, 2.2, 1]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[0.35, 0.25]} />
        <meshStandardMaterial color="#228B22" roughness={0.5} />
      </mesh>

      {/* ── Door ── */}
      <mesh position={[-roomW / 2 + 0.01, 1.1, -2.5]}>
        <planeGeometry args={[0.9, 2.1]} />
        <meshStandardMaterial color="#c49a38" roughness={0.55} />
      </mesh>
      <mesh
        position={[-roomW / 2 + 0.02, 1.1, -2.2]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[0.03, 0.06, 0.06]} />
        <meshStandardMaterial
          color="#aaa"
          metalness={0.7}
        />
      </mesh>

      {/* ── Whiteboard: one plane, inset from wall to prevent z-fighting with room mesh ── */}
      <ChemWhiteboard position={[roomW / 2 - 0.045, 1.5, -1]} />

      {/* ── Wall clock (decorative) ── */}
      <group position={[roomW / 2 - 0.02, 2.15, 1.2]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <circleGeometry args={[0.18, 32]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.008]}>
          <boxGeometry args={[0.02, 0.09, 0.01]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0.04, 0.04, 0.008]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.015, 0.06, 0.01]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>
    </>
  );
}
