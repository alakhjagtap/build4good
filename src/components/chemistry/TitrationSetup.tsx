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

/* ─── public handle ─── */

export type TitrationHandle = {
  addDrop: () => void;
  startPour: () => void;
  stopPour: () => void;
  reset: () => void;
  getState: () => {
    drops: number;
    volume: number;
    ph: number;
    color: string;
    pouring: boolean;
  };
  setHighlight: (part: "burette" | "flask" | "indicator" | null) => void;
};

/* ─── constants ─── */

const BENCH_Y = 0.89;
const ACID_VOLUME_ML = 25;
const BASE_CONCENTRATION = 0.1;
const ACID_CONCENTRATION = 0.1;
const MICRO_ML = 0.05;
const CLICK_DROPS = 10;
const POUR_DROPS_PER_SEC = 80;
const BURETTE_CAPACITY_ML = 50;

const BURETTE_Y = BENCH_Y + 0.65;
const TIP_Y = BURETTE_Y - 0.35;
const FLASK_OPEN_Y = BENCH_Y + 0.13;
const LIQUID_SURFACE_Y = BENCH_Y + 0.06;

/* ─── chemistry ─── */

function computePH(microDrops: number): number {
  const volBase = microDrops * MICRO_ML;
  const molesBase = (volBase / 1000) * BASE_CONCENTRATION;
  const molesAcid = (ACID_VOLUME_ML / 1000) * ACID_CONCENTRATION;
  const excess = molesAcid - molesBase;
  const totalVol = (ACID_VOLUME_ML + volBase) / 1000;

  if (excess > 1e-7) {
    return Math.max(0, -Math.log10(excess / totalVol));
  }
  if (Math.abs(excess) <= 1e-7) return 7;
  const oh = -excess / totalVol;
  return Math.min(14, 14 + Math.log10(oh));
}

/*
  Phenolphthalein: colorless in acid, pink in base.
  Uses a sigmoid curve centered at pH ~8.8 for smooth, continuous
  transition matching real indicator behavior.
*/
const CLEAR_COLOR = new THREE.Color(0.85, 0.89, 0.94);
const PINK_COLOR = new THREE.Color(0.72, 0.1, 0.38);

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function phenolBlend(ph: number): number {
  if (ph < 7.0) return 0;
  return sigmoid(3.5 * (ph - 8.8));
}

function phenolColor(ph: number): THREE.Color {
  return CLEAR_COLOR.clone().lerp(PINK_COLOR, phenolBlend(ph));
}

function phenolHex(ph: number): string {
  return `#${phenolColor(ph).getHexString()}`;
}

function phenolOpacity(ph: number): number {
  const t = phenolBlend(ph);
  return 0.42 + t * 0.48;
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

function phDisplayColor(ph: number): string {
  if (ph < 5) return "#1e3a5f";
  if (ph < 7) return "#155e50";
  if (ph < 8.5) return "#065f46";
  return "#831843";
}

/* ─── highlight blend targets ─── */

type HighlightPart = "burette" | "flask" | "indicator";
type BlendMap = Record<HighlightPart, number>;

const BASE_OPACITY: Record<HighlightPart, number> = {
  burette: 0.32,
  flask: 0.48,
  indicator: 0.28,
};

function lerpScalar(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, t);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const TitrationSetup = forwardRef<TitrationHandle>((_props, ref) => {
  const [drops, setDrops] = useState(0);
  const [highlight, setHighlight] = useState<HighlightPart | null>(null);

  /* mesh refs for animated materials */
  const solutionRef = useRef<THREE.Mesh>(null);
  const dropRef = useRef<THREE.Mesh>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const streamRef = useRef<THREE.Mesh>(null);
  const buretteGlassRef = useRef<THREE.Mesh>(null);
  const flaskBodyRef = useRef<THREE.Mesh>(null);
  const flaskNeckRef = useRef<THREE.Mesh>(null);
  const indicatorGlassRef = useRef<THREE.Mesh>(null);

  const [dropping, setDropping] = useState(false);
  const dropYRef = useRef(0);

  const pouringRef = useRef(false);
  const pourAccRef = useRef(0);
  const [pouring, setPouring] = useState(false);

  const rippleScaleRef = useRef(0);
  const rippleAlphaRef = useRef(0);
  const streamWobbleRef = useRef(0);

  /* smooth highlight blend: 0 = neutral, 1 = fully highlighted */
  const blendRef = useRef<BlendMap>({ burette: 0, flask: 0, indicator: 0 });

  const ph = computePH(drops);
  const targetColor = phenolColor(ph);
  const buretteLevel = Math.max(
    0.02,
    1 - (drops * MICRO_ML) / BURETTE_CAPACITY_ML,
  );
  const addedVolumeMl = drops * MICRO_ML;
  const fillRatio = Math.min(addedVolumeMl / BURETTE_CAPACITY_ML, 1);
  const liquidHeight = 0.065 + fillRatio * 0.065;
  const liquidCenterY = -0.055 + liquidHeight / 2;
  const liquidTopY = liquidCenterY + liquidHeight / 2;
  const liquidTopFraction = Math.min(1, (liquidTopY + 0.06) / 0.12);
  const liquidTopR = 0.078 - liquidTopFraction * 0.02;

  /* ── imperative API ── */

  const addDrop = useCallback(() => {
    if (dropping) {
      setDrops((d) => d + CLICK_DROPS);
      return;
    }
    setDropping(true);
    dropYRef.current = TIP_Y;
  }, [dropping]);

  const startPour = useCallback(() => {
    pouringRef.current = true;
    pourAccRef.current = 0;
    setPouring(true);
  }, []);

  const stopPour = useCallback(() => {
    pouringRef.current = false;
    setPouring(false);
  }, []);

  const reset = useCallback(() => {
    setDrops(0);
    setDropping(false);
    dropYRef.current = 0;
    pouringRef.current = false;
    pourAccRef.current = 0;
    setPouring(false);
    rippleScaleRef.current = 0;
    rippleAlphaRef.current = 0;
  }, []);

  useImperativeHandle(ref, () => ({
    addDrop,
    startPour,
    stopPour,
    reset,
    getState: () => ({
      drops,
      volume: drops * MICRO_ML,
      ph,
      color: phenolHex(ph),
      pouring: pouringRef.current,
    }),
    setHighlight: (part) => setHighlight(part),
  }));

  /* ── frame loop ── */

  useFrame((_state, delta) => {
    /* ── Drop animation ── */
    if (dropping && dropRef.current) {
      dropYRef.current -= delta * 2.0;
      dropRef.current.position.y = dropYRef.current;
      if (dropYRef.current <= LIQUID_SURFACE_Y) {
        setDropping(false);
        setDrops((d) => d + CLICK_DROPS);
        dropYRef.current = 0;
        rippleScaleRef.current = 0.005;
        rippleAlphaRef.current = 0.5;
      }
    }

    /* ── Continuous pour ── */
    if (pouringRef.current) {
      pourAccRef.current += delta * POUR_DROPS_PER_SEC;
      const batch = Math.floor(pourAccRef.current);
      if (batch > 0) {
        pourAccRef.current -= batch;
        setDrops((d) => d + batch);
        if (rippleAlphaRef.current < 0.15) {
          rippleScaleRef.current = 0.003;
          rippleAlphaRef.current = 0.35;
        }
      }
    }

    /* ── Ripple animation ── */
    if (rippleScaleRef.current > 0 && rippleRef.current) {
      rippleScaleRef.current += delta * 0.12;
      rippleAlphaRef.current -= delta * 1.2;
      if (rippleAlphaRef.current <= 0) {
        rippleScaleRef.current = 0;
        rippleAlphaRef.current = 0;
      }
      const s = rippleScaleRef.current;
      rippleRef.current.scale.set(s / 0.003, s / 0.003, 1);
      (rippleRef.current.material as THREE.MeshBasicMaterial).opacity =
        Math.max(0, rippleAlphaRef.current);
    }

    /* ── Solution color: continuous smooth lerp ── */
    if (solutionRef.current) {
      const mat = solutionRef.current.material as THREE.MeshPhysicalMaterial;
      const speed = delta * 5;
      mat.color.lerp(targetColor, speed);
      mat.opacity = lerpScalar(mat.opacity, phenolOpacity(ph), speed);
    }

    /* ── Stream wobble ── */
    if (pouring && streamRef.current) {
      streamWobbleRef.current += delta * 12;
      streamRef.current.position.x =
        Math.sin(streamWobbleRef.current) * 0.001;
    }

    /* ── Smooth highlight transitions ── */
    const hb = blendRef.current;
    const hlSpeed = delta * 3.5;
    const anyActive = highlight !== null;
    for (const part of ["burette", "flask", "indicator"] as const) {
      const target = highlight === part ? 1 : 0;
      hb[part] = lerpScalar(hb[part], target, hlSpeed);
    }

    const applyHL = (
      meshRef: React.RefObject<THREE.Mesh | null>,
      part: HighlightPart,
    ) => {
      if (!meshRef.current) return;
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      const b = hb[part];
      const dim = anyActive ? (1 - b) * 0.55 : 0;
      mat.opacity = BASE_OPACITY[part] + b * 0.12 - dim * 0.15;
      mat.emissiveIntensity = b * 0.25;
    };

    applyHL(buretteGlassRef, "burette");
    applyHL(flaskBodyRef, "flask");
    applyHL(flaskNeckRef, "flask");
    applyHL(indicatorGlassRef, "indicator");
  });

  /* ── render ── */

  const streamH = TIP_Y - FLASK_OPEN_Y;
  const streamMidY = (TIP_Y + FLASK_OPEN_Y) / 2;
  const emissiveColor = "#506878";

  return (
    <group position={[0, 0, 0]}>
      {/* ── Clamp stand ── */}
      <mesh position={[0.15, BENCH_Y + 0.015, -0.1]} castShadow>
        <boxGeometry args={[0.28, 0.03, 0.16]} />
        <meshStandardMaterial color="#222" metalness={0.85} roughness={0.18} />
      </mesh>
      <mesh position={[0.15, BENCH_Y + 0.62, -0.1]} castShadow>
        <cylinderGeometry args={[0.013, 0.013, 1.22, 12]} />
        <meshStandardMaterial color="#707070" metalness={0.85} roughness={0.12} />
      </mesh>
      <mesh position={[0.075, BENCH_Y + 1.0, -0.1]} castShadow>
        <boxGeometry args={[0.16, 0.018, 0.018]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, BENCH_Y + 1.0, -0.1]}>
        <torusGeometry args={[0.025, 0.004, 8, 20]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* ── Burette ── */}
      <group position={[0, BURETTE_Y, -0.1]}>
        <mesh ref={buretteGlassRef}>
          <cylinderGeometry args={[0.02, 0.02, 0.65, 20, 1, true]} />
          <meshPhysicalMaterial
            color="#dce8f4"
            transparent
            opacity={BASE_OPACITY.burette}
            roughness={0.02}
            metalness={0.02}
            emissive={emissiveColor}
            emissiveIntensity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.325 * buretteLevel - 0.325 / 2, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.65 * buretteLevel, 16]} />
          <meshPhysicalMaterial
            color="#a8c8ee"
            transparent
            opacity={0.65}
            roughness={0.06}
          />
        </mesh>
        <mesh position={[0.03, -0.34, 0]}>
          <boxGeometry args={[0.04, 0.016, 0.016]} />
          <meshStandardMaterial color="#333" metalness={0.55} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.006, 0.003, 0.04, 8]} />
          <meshPhysicalMaterial
            color="#dce8f4"
            transparent
            opacity={0.45}
            roughness={0.02}
          />
        </mesh>
        <mesh position={[0, 0.335, 0]}>
          <torusGeometry args={[0.02, 0.003, 8, 20]} />
          <meshPhysicalMaterial color="#dce8f4" transparent opacity={0.35} />
        </mesh>
      </group>

      {/* ── Pour stream ── */}
      {pouring && (
        <mesh ref={streamRef} position={[0, streamMidY, -0.1]}>
          <cylinderGeometry args={[0.004, 0.002, streamH, 8]} />
          <meshPhysicalMaterial
            color="#a8c8ee"
            transparent
            opacity={0.6}
            roughness={0.02}
          />
        </mesh>
      )}

      {/* ── Erlenmeyer flask ── */}
      <group position={[0, BENCH_Y + 0.01, -0.1]}>
        {/* shadow disc under flask */}
        <mesh
          position={[0, -0.059, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial
            color="#888"
            transparent
            opacity={0.12}
          />
        </mesh>
        {/* flask body */}
        <mesh ref={flaskBodyRef} castShadow>
          <cylinderGeometry args={[0.065, 0.088, 0.12, 28, 1, true]} />
          <meshPhysicalMaterial
            color="#d8e4f0"
            transparent
            opacity={BASE_OPACITY.flask}
            roughness={0.02}
            metalness={0.04}
            emissive={emissiveColor}
            emissiveIntensity={0}
            side={THREE.DoubleSide}
            ior={1.5}
            thickness={0.5}
          />
        </mesh>
        {/* flask bottom disc */}
        <mesh
          position={[0, -0.06, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.088, 28]} />
          <meshPhysicalMaterial
            color="#d8e4f0"
            transparent
            opacity={0.18}
            roughness={0.02}
          />
        </mesh>
        {/* flask body edge highlight ring at base */}
        <mesh position={[0, -0.06, 0]}>
          <torusGeometry args={[0.088, 0.002, 8, 28]} />
          <meshPhysicalMaterial
            color="#c0d0e0"
            transparent
            opacity={0.55}
            roughness={0.02}
          />
        </mesh>
        {/* flask neck */}
        <mesh ref={flaskNeckRef} position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.022, 0.06, 0.06, 18, 1, true]} />
          <meshPhysicalMaterial
            color="#d8e4f0"
            transparent
            opacity={BASE_OPACITY.flask}
            roughness={0.02}
            emissive={emissiveColor}
            emissiveIntensity={0}
            side={THREE.DoubleSide}
            ior={1.5}
            thickness={0.5}
          />
        </mesh>
        {/* flask rim */}
        <mesh position={[0, 0.12, 0]}>
          <torusGeometry args={[0.022, 0.004, 8, 24]} />
          <meshPhysicalMaterial color="#c8d8e8" transparent opacity={0.65} />
        </mesh>
        {/* body-to-neck junction ring */}
        <mesh position={[0, 0.06, 0]}>
          <torusGeometry args={[0.065, 0.002, 8, 24]} />
          <meshPhysicalMaterial color="#c0d0e0" transparent opacity={0.4} />
        </mesh>
        {/* solution liquid */}
        <mesh ref={solutionRef} position={[0, liquidCenterY, 0]}>
          <cylinderGeometry args={[liquidTopR, 0.078, liquidHeight, 28]} />
          <meshPhysicalMaterial
            color={targetColor}
            transparent
            opacity={phenolOpacity(ph)}
            roughness={0.04}
          />
        </mesh>
        {/* liquid surface disc for visible level line */}
        <mesh
          position={[0, liquidCenterY + liquidHeight / 2 - 0.001, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[liquidTopR - 0.003, 28]} />
          <meshPhysicalMaterial
            color={targetColor}
            transparent
            opacity={Math.min(phenolOpacity(ph) + 0.15, 0.9)}
            roughness={0.01}
          />
        </mesh>
        {/* ripple */}
        <mesh
          ref={rippleRef}
          position={[0, liquidCenterY + liquidHeight / 2 + 0.001, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.015, 0.02, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ── Falling drop ── */}
      {dropping && (
        <mesh ref={dropRef} position={[0, dropYRef.current, -0.1]}>
          <sphereGeometry args={[0.008, 10, 10]} />
          <meshPhysicalMaterial
            color="#a8c8ee"
            transparent
            opacity={0.85}
            roughness={0.02}
          />
        </mesh>
      )}

      {/* ── Indicator beaker ── */}
      <group position={[-0.28, BENCH_Y + 0.01, 0.06]}>
        <mesh ref={indicatorGlassRef}>
          <cylinderGeometry args={[0.04, 0.04, 0.09, 20, 1, true]} />
          <meshPhysicalMaterial
            color="#e4ecf6"
            transparent
            opacity={BASE_OPACITY.indicator}
            roughness={0.02}
            emissive={emissiveColor}
            emissiveIntensity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -0.008, 0]}>
          <cylinderGeometry args={[0.037, 0.037, 0.065, 20]} />
          <meshPhysicalMaterial
            color="#e870a8"
            transparent
            opacity={0.6}
          />
        </mesh>
        <Html position={[0, 0.08, 0]} distanceFactor={3}>
          <div
            style={{
              fontSize: 8,
              color: "#888",
              fontFamily: "system-ui",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            Phenolphthalein
          </div>
        </Html>
      </group>

      {/* ── pH readout ── */}
      <Html position={[0.42, BENCH_Y + 0.55, -0.1]} distanceFactor={3}>
        <div
          style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(14px)",
            color: "#111",
            padding: "12px 18px",
            borderRadius: 14,
            fontSize: 13,
            fontFamily: "system-ui",
            whiteSpace: "nowrap",
            border: "1px solid rgba(0,0,0,0.14)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.14)",
            pointerEvents: "none",
            minWidth: 150,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14, color: "#111" }}>
            Acid-Base Titration
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ color: "#222", fontWeight: 600, fontSize: 13 }}>pH:</span>
            <span style={{ color: phDisplayColor(ph), fontWeight: 800, fontSize: 22 }}>
              {ph.toFixed(2)}
            </span>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: phenolHex(ph),
                border: "1px solid rgba(0,0,0,0.15)",
                flexShrink: 0,
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: phDisplayColor(ph), fontWeight: 700 }}>
            {phLabel(ph)}
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>
            {(drops * MICRO_ML).toFixed(1)} mL NaOH added
          </div>
        </div>
      </Html>

      {/* ── White tile ── */}
      <mesh
        position={[0, BENCH_Y + 0.004, -0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[0.24, 0.24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>

      {/* ── Wash bottle ── */}
      <group position={[0.32, BENCH_Y + 0.01, 0.12]}>
        <mesh>
          <cylinderGeometry args={[0.028, 0.032, 0.1, 16]} />
          <meshPhysicalMaterial
            color="#f0f0f0"
            transparent
            opacity={0.45}
            roughness={0.06}
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
