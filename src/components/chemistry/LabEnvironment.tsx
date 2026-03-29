"use client";

import { useRef } from "react";
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

      {/* ── Whiteboard on side wall ── */}
      <mesh
        position={[roomW / 2 - 0.01, 1.5, -1]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[2.2, 1.2]} />
        <meshStandardMaterial
          color="#f8f8f8"
          roughness={0.08}
          metalness={0.02}
        />
      </mesh>
      <mesh
        position={[roomW / 2 - 0.015, 1.5, -1]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <boxGeometry args={[2.28, 1.28, 0.03]} />
        <meshStandardMaterial color="#666" metalness={0.3} roughness={0.5} />
      </mesh>
    </>
  );
}
