
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float, Text3D, Center, useTexture } from '@react-three/drei';

function FloatingSnake() {
  const ref = useRef<any>();
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
      <Center>
        <Text3D
          ref={ref}
          font="/fonts/helvetiker_regular.typeface.json"
          size={2.5}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.05}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={8}
        >
          SNAKE
          <meshStandardMaterial 
            color="#4ade80" 
            emissive="#166534"
            metalness={0.8}
            roughness={0.1}
          />
        </Text3D>
      </Center>
    </Float>
  );
}

function AnimatedSpheres() {
  const group = useRef<any>();
  const texture = useTexture('/textures/matcap-gold.png');
  
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 0.5) * 10,
            Math.cos(i * 0.3) * 10,
            Math.sin(i * 0.7) * 10 - 10
          ]}
        >
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshMatcapMaterial color="white" matcap={texture} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas style={{ background: 'linear-gradient(to bottom, #0f172a, #020617)' }}>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={40} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        <FloatingSnake />
        <AnimatedSpheres />
      </Canvas>
    </div>
  );
}
