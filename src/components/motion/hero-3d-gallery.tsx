"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image as ImagePlane } from "@react-three/drei";
import type { Group, Mesh } from "three";

interface CardConfig {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number];
  floatSpeed: number;
  floatOffset: number;
}

function FloatingPhoto({ url, position, rotation, scale, floatSpeed, floatOffset }: CardConfig) {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * floatSpeed + floatOffset) * 0.18;
    ref.current.rotation.z = rotation[2] + Math.sin(t * floatSpeed * 0.5 + floatOffset) * 0.025;
  });

  return (
    <ImagePlane
      ref={ref}
      url={url}
      position={position}
      rotation={rotation}
      scale={scale}
      radius={0.12}
      transparent
    />
  );
}

function Scene({ images }: { images: string[] }) {
  const group = useRef<Group>(null);

  const cards = useMemo<CardConfig[]>(() => {
    const count = Math.min(images.length, 6);
    const layout: [number, number, number][] = [
      [-3.1, 0.6, -1.4],
      [-1.5, -0.7, 0.4],
      [0.2, 0.9, -0.6],
      [1.8, -0.5, 0.9],
      [3.2, 0.5, -1.1],
      [0, -1.2, -2],
    ];
    // Deterministic pseudo-randomness (no Math.random) so this stays a pure
    // render — a fixed per-index jitter is enough for a natural-looking tilt.
    const jitter = (seed: number) => Math.sin(seed * 12.9898) * 0.5;

    return Array.from({ length: count }).map((_, i) => ({
      url: images[i],
      position: layout[i] ?? [0, 0, -2],
      rotation: [0, jitter(i) * 0.3, jitter(i + 0.5) * 0.15] as [number, number, number],
      scale: [1.5, 2] as [number, number],
      floatSpeed: 0.35 + i * 0.05,
      floatOffset: i * 1.3,
    }));
  }, [images]);

  useFrame((state) => {
    if (!group.current) return;
    const targetY = state.pointer.x * 0.25;
    const targetX = -state.pointer.y * 0.12;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04;
  });

  return (
    <group ref={group}>
      {cards.map((card, i) => (
        <FloatingPhoto key={i} {...card} />
      ))}
    </group>
  );
}

export function Hero3DGallery({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      className="!absolute !inset-0"
    >
      <Suspense fallback={null}>
        <Scene images={images} />
      </Suspense>
    </Canvas>
  );
}
