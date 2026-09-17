"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image as ImagePlane } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { MathUtils } from "three";

interface CardConfig {
  slug: string;
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number];
  floatSpeed: number;
  floatOffset: number;
}

function FloatingPhoto({
  slug,
  url,
  position,
  rotation,
  scale,
  floatSpeed,
  floatOffset,
  onNavigate,
}: CardConfig & { onNavigate: (slug: string) => void }) {
  const ref = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const hoverT = useRef(0);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();

    hoverT.current = MathUtils.damp(hoverT.current, hovered ? 1 : 0, 6, 0.016);
    const lift = hoverT.current * 0.35;
    const pop = 1 + hoverT.current * 0.12;

    ref.current.position.y = position[1] + Math.sin(t * floatSpeed + floatOffset) * 0.18 + lift;
    ref.current.position.z = position[2] + hoverT.current * 0.6;
    ref.current.rotation.z = rotation[2] + Math.sin(t * floatSpeed * 0.5 + floatOffset) * 0.025;
    ref.current.scale.set(scale[0] * pop, scale[1] * pop, 1);
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
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onNavigate(slug);
      }}
    />
  );
}

function Scene({
  images,
  onNavigate,
}: {
  images: { slug: string; url: string }[];
  onNavigate: (slug: string) => void;
}) {
  const group = useRef<Group>(null);
  const { size } = useThree();
  const drag = useRef({ active: false, lastX: 0, lastY: 0, offsetX: 0, offsetY: 0 });

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
    const jitter = (seed: number) => Math.sin(seed * 12.9898) * 0.5;

    return Array.from({ length: count }).map((_, i) => ({
      slug: images[i].slug,
      url: images[i].url,
      position: layout[i] ?? [0, 0, -2],
      rotation: [0, jitter(i) * 0.3, jitter(i + 0.5) * 0.15] as [number, number, number],
      scale: [1.5, 2] as [number, number],
      floatSpeed: 0.35 + i * 0.05,
      floatOffset: i * 1.3,
    }));
  }, [images]);

  useFrame((state) => {
    if (!group.current) return;
    // Stronger, snappier pointer-parallax than a typical subtle hero effect —
    // the gallery visibly leans with the cursor.
    const targetY = state.pointer.x * 0.55 + drag.current.offsetX;
    const targetX = -state.pointer.y * 0.28 + drag.current.offsetY;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.06;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.06;
  });

  function handlePointerDown(e: React.PointerEvent) {
    drag.current.active = true;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    const dy = e.clientY - drag.current.lastY;
    drag.current.offsetX = MathUtils.clamp(drag.current.offsetX + dx / size.width, -0.6, 0.6);
    drag.current.offsetY = MathUtils.clamp(drag.current.offsetY - dy / size.height, -0.4, 0.4);
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
  }
  function handlePointerUp() {
    drag.current.active = false;
  }

  return (
    <group
      ref={group}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Invisible plane so drag works even when not directly over a photo */}
      <mesh position={[0, 0, -3]}>
        <planeGeometry args={[30, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {cards.map((card, i) => (
        <FloatingPhoto key={i} {...card} onNavigate={onNavigate} />
      ))}
    </group>
  );
}

export function Hero3DGallery({ images }: { images: { slug: string; url: string }[] }) {
  const router = useRouter();

  if (images.length === 0) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      className="!absolute !inset-0"
      style={{ touchAction: "none" }}
    >
      <Suspense fallback={null}>
        <Scene images={images} onNavigate={(slug) => router.push(`/locations/${slug}`)} />
      </Suspense>
    </Canvas>
  );
}
