import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, useScroll } from "@react-three/drei";
import * as THREE from "three";

interface AuraBlobProps {
  mood: number; // 1 to 5
}

export default function AuraBlob({ mood }: AuraBlobProps) {
  const materialRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  // Colors based on mood: 1=sad/low energy, 5=happy/high energy
  const colors = [
    "#3b82f6", // 1: Blue (calm/low)
    "#1db954", // 2: Green (steady)
    "#8b5cf6", // 3: Purple (neutral/mystic)
    "#f59e0b", // 4: Amber (productive)
    "#f43f5e", // 5: Rose (energetic/happy)
  ];

  const safeMood = Math.max(1, Math.min(5, mood || 3));
  const targetColor = new THREE.Color(colors[safeMood - 1] || colors[2]);

  useFrame((state, delta) => {
    // Smoothly interpolate color
    if (materialRef.current) {
      materialRef.current.color.lerp(targetColor, delta * 3);
      
      // Affect distortion based on scroll and mood
      // Higher mood = more energy/distortion
      const targetDistortion = 0.3 + (safeMood * 0.08) + scroll.offset * 0.2;
      const targetSpeed = 1 + safeMood * 0.5 + scroll.offset * 3;

      materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistortion, delta * 2);
      materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, delta * 2);
    }

    if (meshRef.current) {
      // Rotate based on scroll
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 + scroll.offset * Math.PI * 2;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.8}>
      <sphereGeometry args={[1, 128, 128]} />
      <MeshDistortMaterial
        ref={materialRef}
        color={colors[2]}
        envMapIntensity={1.5}
        clearcoat={0.9}
        clearcoatRoughness={0.1}
        metalness={0.3}
        roughness={0.2}
        distort={0.4}
        speed={2}
      />
    </mesh>
  );
}
