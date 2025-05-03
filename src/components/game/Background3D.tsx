
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float, Text3D, Center, useTexture, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Planet({ simplified = false }) {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  // Use a simple pseudo-random pattern for the planet texture
  const planetTexture = useMemo(() => {
    const size = simplified ? 64 : 128; // Reduce texture size in simplified mode
    const data = new Uint8Array(size * size * 3);
    for (let i = 0; i < size * size; i++) {
      const r = Math.floor(Math.random() * 55) + 20;
      const g = Math.floor(Math.random() * 80) + 70;
      const b = Math.floor(Math.random() * 55) + 30;
      
      data[i * 3] = r;
      data[i * 3 + 1] = g;
      data[i * 3 + 2] = b;
    }
    
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
    texture.needsUpdate = true;
    return texture;
  }, [simplified]);
  
  useFrame(({ clock }) => {
    if (planetRef.current) {
      // Slower rotation for the planet
      planetRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      // Reduced wobble
      planetRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
    }
    
    if (ringRef.current) {
      // Slower ring rotation
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.02;
      // Reduced floating motion
      ringRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.3;
    }
  });
  
  if (simplified) {
    // Return a much simpler planet for low performance mode
    return (
      <group position={[0, 0, -15]}>
        <mesh ref={planetRef}>
          <sphereGeometry args={[5, 16, 16]} />
          <meshStandardMaterial 
            map={planetTexture}
            emissive="#166534"
            emissiveIntensity={0.2}
            roughness={0.8}
          />
        </mesh>
      
        <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[8, 0.3, 8, 32]} />
          <meshStandardMaterial 
            color="#4ade80"
            emissive="#166534"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    );
  }
  
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
      // Reduced animation speed
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.08) * 0.05;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.5}>
      <Center>
        <Text3D
          ref={ref}
          font="/fonts/helvetiker_regular.typeface.json"
          size={2.3}
          height={0.2}
          curveSegments={8}
          bevelEnabled
          bevelThickness={0.05}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={3}
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
  
  // Create a fallback material since matcap might not work
  const fallbackMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#4ade80',
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7
    });
  }, []);
  
  useFrame(({ clock }) => {
    if (group.current) {
      // Slower rotation
      group.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  // Reduce number of spheres for better performance
  const spherePositions = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      position: [
        Math.sin(i * 0.5) * 12,
        Math.cos(i * 0.3) * 12,
        Math.sin(i * 0.7) * 12 - 10
      ],
      size: 0.2 + Math.random() * 0.3,
      color: new Array('#4ade80', '#34d399', '#60a5fa', '#818cf8', '#fb7185')[Math.floor(Math.random() * 5)]
    }));
  }, []);

  return (
    <group ref={group}>
      {spherePositions.map((sphere, i) => (
        <mesh
          key={i}
          position={sphere.position as [number, number, number]}
        >
          <sphereGeometry args={[sphere.size, 12, 12]} />
          <primitive object={fallbackMaterial.clone()} />
        </mesh>
      ))}
    </group>
  );
}

function AnimatedGrid() {
  const gridRef = useRef<any>();
  
  useFrame(({ clock }) => {
    if (gridRef.current) {
      // Slower grid animation
      gridRef.current.rotation.x = Math.PI / 2 + Math.sin(clock.getElapsedTime() * 0.03) * 0.1;
      gridRef.current.position.y = -5 + Math.sin(clock.getElapsedTime() * 0.1) * 0.5;
    }
  });
  
  return (
    <mesh ref={gridRef} position={[0, -5, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 40, 10, 10]} />
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
  // Use low quality settings for better performance
  const [isLowQuality, setIsLowQuality] = useState(true);
  
  useEffect(() => {
    // Check if device is likely high-performance
    const isHighPerformance = window.navigator.hardwareConcurrency > 4;
    setIsLowQuality(!isHighPerformance);
    
    // Let user toggle quality with "Q" key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyQ') {
        setIsLowQuality(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas 
        style={{ 
          background: 'linear-gradient(to bottom, #020617, #0f172a, #111827)',
        }}
        gl={{ 
          powerPreference: "high-performance",
          antialias: false,
          alpha: false,
          precision: isLowQuality ? "lowp" : "mediump"
        }}
        dpr={[0.8, 1]} // Lower resolution for better performance
        frameloop={isLowQuality ? "demand" : "always"}
        performance={{ min: 0.5 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={40} />
        <ambientLight intensity={0.3} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        
        <FloatingTitle />
        {!isLowQuality && <AnimatedSpheres />}
        <AnimatedGrid />
        <Planet simplified={isLowQuality} />
        
        <Stars radius={100} depth={50} count={isLowQuality ? 1000 : 5000} factor={4} saturation={0} fade speed={0.5} />
      </Canvas>
    </div>
  );
}
