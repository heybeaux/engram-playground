"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface OrbProps {
  memoryCount: number;
  isDreaming: boolean;
}

function Particles({ count, isDreaming }: { count: number; isDreaming: boolean }) {
  const mesh = useRef<THREE.Points>(null);
  const particleCount = Math.min(count * 15 + 50, 500);

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [particleCount]);

  const colors = useMemo(() => {
    const col = new Float32Array(particleCount * 3);
    const palette = [
      [0.54, 0.36, 0.96],
      [0.39, 0.4, 0.94],
      [0.06, 0.82, 0.88],
      [0.96, 0.33, 0.55],
      [0.49, 0.87, 0.55],
      [0.98, 0.65, 0.27],
    ];
    for (let i = 0; i < particleCount; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return col;
  }, [particleCount]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.elapsedTime;
    const speed = isDreaming ? 3 : 0.3;
    mesh.current.rotation.y = time * speed * 0.1;
    mesh.current.rotation.x = Math.sin(time * 0.2) * 0.1;

    const posAttr = mesh.current.geometry.getAttribute("position");
    if (isDreaming && posAttr) {
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);
        const dist = Math.sqrt(x * x + y * y + z * z);
        const pulse = Math.sin(time * 4 + dist * 2) * 0.05;
        const scale = 1 + pulse;
        posAttr.setXYZ(i, x * scale, y * scale, z * scale);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={isDreaming ? 0.9 : 0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function ConnectionLines({
  memoryCount,
  isDreaming,
}: {
  memoryCount: number;
  isDreaming: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const lineCount = Math.min(memoryCount * 2, 30);

  const lineObjects = useMemo(() => {
    const result: THREE.Line[] = [];
    for (let i = 0; i < lineCount; i++) {
      const theta1 = Math.random() * Math.PI * 2;
      const phi1 = Math.acos(2 * Math.random() - 1);
      const r1 = 1.2 + Math.random() * 1;
      const theta2 = theta1 + (Math.random() - 0.5) * 1.5;
      const phi2 = phi1 + (Math.random() - 0.5) * 1;
      const r2 = 1.2 + Math.random() * 1;

      const geo = new THREE.BufferGeometry();
      const verts = new Float32Array([
        r1 * Math.sin(phi1) * Math.cos(theta1),
        r1 * Math.sin(phi1) * Math.sin(theta1),
        r1 * Math.cos(phi1),
        r2 * Math.sin(phi2) * Math.cos(theta2),
        r2 * Math.sin(phi2) * Math.sin(theta2),
        r2 * Math.cos(phi2),
      ]);
      geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
      const mat = new THREE.LineBasicMaterial({
        color: isDreaming ? "#a78bfa" : "#4338ca",
        transparent: true,
        opacity: isDreaming ? 0.4 : 0.15,
        blending: THREE.AdditiveBlending,
      });
      result.push(new THREE.Line(geo, mat));
    }
    return result;
  }, [lineCount, isDreaming]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    lineObjects.forEach((l) => group.add(l));
    return () => {
      lineObjects.forEach((l) => {
        group.remove(l);
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      });
    };
  }, [lineObjects]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    const speed = isDreaming ? 2 : 0.3;
    groupRef.current.rotation.y = time * speed * 0.1;
  });

  return <group ref={groupRef} />;
}

function CoreOrb({ isDreaming }: { isDreaming: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const scale = isDreaming
      ? 1 + Math.sin(time * 3) * 0.15
      : 1 + Math.sin(time * 0.8) * 0.05;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <MeshDistortMaterial
          color={isDreaming ? "#7c3aed" : "#312e81"}
          emissive={isDreaming ? "#a78bfa" : "#4338ca"}
          emissiveIntensity={isDreaming ? 1.5 : 0.3}
          roughness={0.2}
          metalness={0.8}
          distort={isDreaming ? 0.6 : 0.3}
          speed={isDreaming ? 8 : 2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

export default function MemoryOrb({ memoryCount, isDreaming }: OrbProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#a78bfa" />
        <pointLight position={[-5, -3, -5]} intensity={0.3} color="#06b6d4" />

        <CoreOrb isDreaming={isDreaming} />
        <Particles count={memoryCount} isDreaming={isDreaming} />
        <ConnectionLines memoryCount={memoryCount} isDreaming={isDreaming} />
      </Canvas>
    </div>
  );
}
