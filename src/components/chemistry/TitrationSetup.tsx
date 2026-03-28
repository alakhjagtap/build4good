"use client";

import {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export type TitrationHandle = {
  addDrop: () => void;
  reset: () => void;
  getState: () => { drops: number; volume: number; ph: number; color: string };
};

const BENCH_Y = 0.89;
const ACID_VOLUME_ML = 50;
const BASE_CONCENTRATION = 0.1;
const ACID_CONCENTRATION = 0.1;

function computePH(dropsAdded: number): number {
  const volumeBase = dropsAdded * 0.05;
  const molesBase = (volumeBase / 1000) * BASE_CONCENTRATION;
  const molesAcid = (ACID_VOLUME_ML / 1000) * ACID_CONCENTRATION;
  const excess = molesAcid - molesBase;
  const totalVolume = (ACID_VOLUME_ML + volumeBase) / 1000;

  if (excess > 0.00001) {
    const h = excess / totalVolume;
    return Math.max(0, -Math.log10(h));
  }
  if (Math.abs(excess) <= 0.00001) return 7;
  const oh = -excess / totalVolume;
  return Math.min(14, 14 + Math.log10(oh));
}

function phToColor(ph: number): THREE.Color {
  if (ph < 3) return new THREE.Color("#ff2020");
  if (ph < 4.5) return new THREE.Color("#ff5533");
  if (ph < 5.5) return new THREE.Color("#ff8833");
  if (ph < 6.5) return new THREE.Color("#ffbb33");
  if (ph < 7.3) return new THREE.Color("#ffee55");
  if (ph < 8.3) return new THREE.Color("#ff66aa");
  if (ph < 9.5) return new THREE.Color("#ee33bb");
  if (ph < 11) return new THREE.Color("#cc22cc");
  return new THREE.Color("#9922dd");
}

function phToColorHex(ph: number): string {
  if (ph < 3) return "#ff2020";
  if (ph < 4.5) return "#ff5533";
  if (ph < 5.5) return "#ff8833";
  if (ph < 6.5) return "#ffbb33";
  if (ph < 7.3) return "#ffee55";
  if (ph < 8.3) return "#ff66aa";
  if (ph < 9.5) return "#ee33bb";
  if (ph < 11) return "#cc22cc";
  return "#9922dd";
}

function phLabel(ph: number): string {
  if (ph < 3) return "Strongly Acidic";
  if (ph < 5.5) return "Acidic";
  if (ph < 6.8) return "Weakly Acidic";
  if (ph < 7.3) return "Near Equivalence";
  if (ph < 8.5) return "Endpoint Reached!";
  if (ph < 10) return "Basic";
  return "Strongly Basic";
}

const TitrationSetup = forwardRef<TitrationHandle>((_props, ref) => {
  const [drops, setDrops] = useState(0);
  const solutionRef = useRef<THREE.Mesh>(null);
  const dropRef = useRef<THREE.Mesh>(null);
  const [dropping, setDropping] = useState(false);
  const dropY = useRef(0);

  const ph = computePH(drops);
  const solutionColor = phToColor(ph);
  const buretteLevel = Math.max(0.05, 1 - drops * 0.003);
  const liquidHeight = 0.08 + Math.min(drops * 0.0003, 0.04);

  const addDrop = useCallback(() => {
    if (dropping) {
      setDrops((d) => d + 1);
      return;
    }
    setDropping(true);
    dropY.current = BENCH_Y + 0.7;
  }, [dropping]);

  const reset = useCallback(() => {
    setDrops(0);
    setDropping(false);
    dropY.current = 0;
  }, []);

  useImperativeHandle(ref, () => ({
    addDrop,
    reset,
    getState: () => ({
      drops,
      volume: drops * 0.05,
      ph,
      color: phToColorHex(ph),
    }),
  }));

  useFrame((_state, delta) => {
    if (dropping && dropRef.current) {
      dropY.current -= delta * 1.8;
      dropRef.current.position.y = dropY.current;

      if (dropY.current <= BENCH_Y + 0.18) {
        setDropping(false);
        setDrops((d) => d + 1);
        dropY.current = 0;
      }
    }

    if (solutionRef.current) {
      (solutionRef.current.material as THREE.MeshPhysicalMaterial).color.lerp(
        solutionColor,
        delta * 5,
      );
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Clamp stand base */}
      <mesh position={[0.15, BENCH_Y + 0.015, -0.1]} castShadow>
        <boxGeometry args={[0.25, 0.03, 0.15]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Clamp stand rod */}
      <mesh position={[0.15, BENCH_Y + 0.45, -0.1]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.9, 12]} />
        <meshStandardMaterial color="#777" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Clamp arm */}
      <mesh position={[0, BENCH_Y + 0.75, -0.1]} castShadow>
        <boxGeometry args={[0.3, 0.02, 0.02]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Burette (glass tube) */}
      <group position={[0, BENCH_Y + 0.35, -0.1]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.65, 16, 1, true]} />
          <meshPhysicalMaterial
            color="#d0e8ff"
            transparent
            opacity={0.35}
            roughness={0.05}
            metalness={0.05}
            transmission={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* NaOH solution inside burette */}
        <mesh position={[0, 0.325 * buretteLevel - 0.325 / 2, 0]}>
          <cylinderGeometry
            args={[0.018, 0.018, 0.65 * buretteLevel, 16]}
          />
          <meshPhysicalMaterial
            color="#88bbff"
            transparent
            opacity={0.75}
            roughness={0.1}
          />
        </mesh>
        {/* Stopcock */}
        <mesh position={[0.028, -0.34, 0]}>
          <boxGeometry args={[0.035, 0.018, 0.018]} />
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Tip */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.006, 0.004, 0.04, 8]} />
          <meshPhysicalMaterial
            color="#d0e8ff"
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>

      {/* Erlenmeyer flask */}
      <group position={[0, BENCH_Y + 0.01, -0.1]}>
        {/* Flask body (wide bottom) */}
        <mesh castShadow>
          <cylinderGeometry args={[0.065, 0.085, 0.12, 24, 1, true]} />
          <meshPhysicalMaterial
            color="#e8f0ff"
            transparent
            opacity={0.3}
            roughness={0.05}
            transmission={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Flask neck (narrow top) */}
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.022, 0.06, 0.06, 16, 1, true]} />
          <meshPhysicalMaterial
            color="#e8f0ff"
            transparent
            opacity={0.3}
            roughness={0.05}
            transmission={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Solution inside flask — visible and saturated */}
        <mesh ref={solutionRef} position={[0, -0.01, 0]}>
          <cylinderGeometry
            args={[0.06, 0.08, liquidHeight, 24]}
          />
          <meshPhysicalMaterial
            color={solutionColor}
            transparent
            opacity={0.85}
            roughness={0.08}
          />
        </mesh>
      </group>

      {/* Falling drop */}
      {dropping && (
        <mesh ref={dropRef} position={[0, dropY.current, -0.1]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshPhysicalMaterial color="#88bbff" transparent opacity={0.9} />
        </mesh>
      )}

      {/* Side beaker (indicator stock) */}
      <group position={[-0.25, BENCH_Y + 0.01, 0.05]}>
        <mesh>
          <cylinderGeometry args={[0.042, 0.042, 0.09, 20, 1, true]} />
          <meshPhysicalMaterial
            color="#e8f0ff"
            transparent
            opacity={0.3}
            roughness={0.05}
            transmission={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -0.005, 0]}>
          <cylinderGeometry args={[0.039, 0.039, 0.07, 20]} />
          <meshPhysicalMaterial
            color="#ff55aa"
            transparent
            opacity={0.65}
          />
        </mesh>
      </group>

      {/* pH label floating */}
      <Html position={[0.38, BENCH_Y + 0.55, -0.1]} distanceFactor={3}>
        <div
          style={{
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(10px)",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 12,
            fontSize: 13,
            fontFamily: "system-ui",
            whiteSpace: "nowrap",
            border: `1px solid ${phToColorHex(ph)}44`,
            pointerEvents: "none",
            minWidth: 130,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>
            Titration
          </div>
          <div style={{ marginBottom: 2 }}>
            pH:{" "}
            <span style={{ color: phToColorHex(ph), fontWeight: 700, fontSize: 16 }}>
              {ph.toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: 11, color: phToColorHex(ph), fontWeight: 500 }}>
            {phLabel(ph)}
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 3 }}>
            {drops} drops &middot; {(drops * 0.05).toFixed(2)} mL NaOH
          </div>
        </div>
      </Html>

      {/* White tile under the flask */}
      <mesh
        position={[0, BENCH_Y + 0.005, -0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.22, 0.22]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Wash bottle */}
      <group position={[0.3, BENCH_Y + 0.01, 0.1]}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.035, 0.1, 16]} />
          <meshPhysicalMaterial
            color="#f0f0f0"
            transparent
            opacity={0.5}
          />
        </mesh>
        <mesh position={[0.02, 0.07, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.06, 8]} />
          <meshStandardMaterial color="#ddd" />
        </mesh>
      </group>
    </group>
  );
});

TitrationSetup.displayName = "TitrationSetup";
export default TitrationSetup;
