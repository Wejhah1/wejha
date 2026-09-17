"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Environment, ContactShadows } from "@react-three/drei";
import type { Group } from "three";
import { MathUtils } from "three";

function CameraLens() {
  return (
    <group position={[0, 0.05, 0.62]}>
      {/* Barrel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.58, 0.85, 32]} />
        <meshStandardMaterial color="#0d0d0d" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Grip ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.585, 0.585, 0.12, 32]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Front glass */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.44]}>
        <cylinderGeometry args={[0.46, 0.46, 0.06, 32]} />
        <meshStandardMaterial color="#0a1622" metalness={1} roughness={0.05} envMapIntensity={2} />
      </mesh>
      {/* Inner glass reflection ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.47]}>
        <ringGeometry args={[0.18, 0.4, 32]} />
        <meshStandardMaterial
          color="#3a6ea5"
          metalness={1}
          roughness={0}
          envMapIntensity={3}
          side={2}
        />
      </mesh>
    </group>
  );
}

function CameraModel({ onNavigate }: { onNavigate: () => void }) {
  const group = useRef<Group>(null);
  const idleSpin = useRef(0);
  const dragOffset = useRef(0);
  const drag = useRef({ active: false, lastX: 0, moved: 0 });
  const [hovered, setHovered] = useState(false);
  const hoverT = useRef(0);

  useFrame(({ pointer, clock }, delta) => {
    if (!group.current) return;

    idleSpin.current += delta * 0.12;
    const scrollOffset = (window.scrollY || 0) * 0.0016;
    const pointerTilt = pointer.x * 0.18;

    group.current.rotation.y = idleSpin.current + scrollOffset + dragOffset.current + pointerTilt;
    group.current.rotation.x = MathUtils.lerp(
      group.current.rotation.x,
      -pointer.y * 0.12,
      0.05,
    );

    hoverT.current = MathUtils.damp(hoverT.current, hovered ? 1 : 0, 6, delta);
    const bob = Math.sin(clock.getElapsedTime() * 0.8) * 0.06;
    const scale = 1 + hoverT.current * 0.06;
    group.current.position.y = -0.9 + bob + hoverT.current * 0.05;
    group.current.scale.setScalar(scale);
  });

  function handlePointerDown(e: React.PointerEvent) {
    drag.current.active = true;
    drag.current.lastX = e.clientX;
    drag.current.moved = 0;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    dragOffset.current += dx * 0.006;
    drag.current.moved += Math.abs(dx);
    drag.current.lastX = e.clientX;
  }
  function handlePointerUp() {
    drag.current.active = false;
    if (drag.current.moved < 4) onNavigate();
  }

  return (
    <group
      ref={group}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Body */}
      <RoundedBox args={[2.5, 1.55, 1.05]} radius={0.14} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#161616" metalness={0.55} roughness={0.5} />
      </RoundedBox>

      {/* Viewfinder hump */}
      <RoundedBox
        args={[0.75, 0.38, 0.7]}
        radius={0.09}
        smoothness={4}
        position={[0, 0.95, -0.12]}
        castShadow
      >
        <meshStandardMaterial color="#161616" metalness={0.55} roughness={0.5} />
      </RoundedBox>

      {/* Top plate accent strip */}
      <RoundedBox
        args={[2.5, 0.1, 1.05]}
        radius={0.04}
        smoothness={2}
        position={[0, 0.78, 0]}
      >
        <meshStandardMaterial color="#2b2b2b" metalness={0.8} roughness={0.3} />
      </RoundedBox>

      {/* Dials */}
      <mesh position={[0.85, 0.85, -0.15]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.1, 24]} />
        <meshStandardMaterial color="#8a8a8a" metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh position={[-0.85, 0.85, -0.15]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.1, 24]} />
        <meshStandardMaterial color="#8a8a8a" metalness={0.9} roughness={0.35} />
      </mesh>

      {/* Shutter button */}
      <mesh position={[1.1, 0.88, 0.25]}>
        <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
        <meshStandardMaterial color="#c0392b" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Grip accent */}
      <RoundedBox
        args={[0.35, 1.55, 1.05]}
        radius={0.12}
        smoothness={4}
        position={[1.08, 0, 0]}
      >
        <meshStandardMaterial color="#0d0d0d" metalness={0.4} roughness={0.7} />
      </RoundedBox>

      <CameraLens />
    </group>
  );
}

export function Hero3DCamera() {
  const router = useRouter();

  return (
    <Canvas
      camera={{ position: [2.6, 1.3, 6.5], fov: 32 }}
      dpr={[1, 1.5]}
      shadows
      gl={{ alpha: true, antialias: true }}
      className="!absolute !inset-0"
      style={{ touchAction: "none" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} castShadow />
      <directionalLight position={[-4, 2, -2]} intensity={0.5} color="#4a7ab5" />

      <Suspense fallback={null}>
        <CameraModel onNavigate={() => router.push("/locations")} />
        <Environment preset="city" />
        <ContactShadows position={[0, -1.75, 0]} opacity={0.5} scale={8} blur={2.5} far={2} />
      </Suspense>
    </Canvas>
  );
}
