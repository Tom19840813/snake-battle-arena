
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float, Text3D, Center, useTexture, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function Planet() {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  // Use a simple pseudo-random pattern for the planet texture
  const planetTexture = new THREE.DataTexture(
    (() => {
      const size = 128;
      const data = new Uint8Array(size * size * 3);
      for (let i = 0; i < size * size; i++) {
        const r = Math.floor(Math.random() * 55) + 20;
        const g = Math.floor(Math.random() * 80) + 70;
        const b = Math.floor(Math.random() * 55) + 30;
        
        data[i * 3] = r;
        data[i * 3 + 1] = g;
        data[i * 3 + 2] = b;
      }
      return data;
    })(),
    128,
    128,
    THREE.RGBFormat
  );
  planetTexture.needsUpdate = true;
  
  useFrame(({ clock }) => {
    if (planetRef.current) {
      // Slow rotation for the planet
      planetRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      // Slight wobble
      planetRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.05;
    }
    
    if (ringRef.current) {
      // Independent ring rotation
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.05;
      // Make the ring hover/float
      ringRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.3;
    }
  });
  
  return (
    <group position={[0, 0, -15]}>
      {/* Main planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial 
          map={planetTexture}
          emissive="#166534"
          emissiveIntensity={0.2}
          roughness={0.8}
          metalness={0.2}
        />
        
        {/* Planet atmosphere glow */}
        <mesh>
          <sphereGeometry args={[5.2, 32, 32]} />
          <meshStandardMaterial 
            color="#4ade80"
            transparent={true}
            opacity={0.15}
            emissive="#4ade80"
            emissiveIntensity={0.3}
          />
        </mesh>
      </mesh>
      
      {/* Ring system */}
      <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[8, 0.3, 16, 100]} />
        <meshStandardMaterial 
          color="#4ade80"
          emissive="#166534"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      
      {/* Second ring */}
      <mesh rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[7, 0.2, 16, 100]} />
        <meshStandardMaterial 
          color="#34d399"
          emissive="#166534"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.3}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

function FloatingTitle() {
  const ref = useRef<any>();
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
      <Center>
        <Text3D
          ref={ref}
          font="/fonts/helvetiker_regular.typeface.json"
          size={2.3}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.05}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={8}
        >
          SNAKE WARS
          <meshStandardMaterial 
            color="#4ade80" 
            emissive="#166534"
            emissiveIntensity={0.7}
            metalness={0.9}
            roughness={0.1}
          />
        </Text3D>
      </Center>
    </Float>
  );
}

function AnimatedSpheres() {
  const group = useRef<any>();
  
  // Use a try-catch to handle texture loading errors
  let matcapTexture;
  try {
    matcapTexture = useTexture('/textures/matcap-gold.png');
  } catch (error) {
    console.warn('Could not load matcap texture, using fallback color');
  }
  
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 0.5) * 12,
            Math.cos(i * 0.3) * 12,
            Math.sin(i * 0.7) * 12 - 10
          ]}
        >
          <sphereGeometry args={[0.2 + Math.random() * 0.3, 16, 16]} />
          {matcapTexture ? (
            <meshMatcapMaterial 
              color={new Array('#4ade80', '#34d399', '#60a5fa', '#818cf8', '#fb7185')[Math.floor(Math.random() * 5)]} 
              matcap={matcapTexture} 
              transparent 
              opacity={0.7} 
            />
          ) : (
            <meshStandardMaterial 
              color={new Array('#4ade80', '#34d399', '#60a5fa', '#818cf8', '#fb7185')[Math.floor(Math.random() * 5)]} 
              metalness={0.9} 
              roughness={0.1} 
              transparent 
              opacity={0.7} 
            />
          )}
        </mesh>
      ))}
    </group>
  );
}

function AnimatedGrid() {
  const gridRef = useRef<any>();
  
  useFrame(({ clock }) => {
    if (gridRef.current) {
      gridRef.current.rotation.x = Math.PI / 2 + Math.sin(clock.getElapsedTime() * 0.05) * 0.1;
      gridRef.current.position.y = -5 + Math.sin(clock.getElapsedTime() * 0.2) * 0.5;
    }
  });
  
  return (
    <mesh ref={gridRef} position={[0, -5, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 40, 20, 20]} />
      <meshStandardMaterial 
        color="#4ade80"
        emissive="#166534"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas 
        style={{ 
          background: 'linear-gradient(to bottom, #020617, #0f172a, #111827)',
        }}
        gl={{ 
          powerPreference: "high-performance",
          antialias: true,
          alpha: false 
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={40} />
        <ambientLight intensity={0.3} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        <FloatingTitle />
        <AnimatedSpheres />
        <AnimatedGrid />
        <Planet />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={100} scale={10} size={1} speed={0.3} color="#4ade80" />
      </Canvas>
    </div>
  );
}
