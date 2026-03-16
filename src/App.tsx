import { Canvas } from '@react-three/fiber'
import { ScrollControls, Environment, Float, Sparkles, Stars } from '@react-three/drei'
import { useState, Suspense } from 'react'
import AuraBlob from './components/AuraBlob'
import Overlay from './components/Overlay'

export default function App() {
  const [mood, setMood] = useState(3) // 1 to 5 scale

  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#8b5cf6" />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <ScrollControls pages={4} damping={0.25} distance={1.2}>
            
            <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
            
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
              <AuraBlob mood={mood} />
            </Float>
            
            <Sparkles count={150} scale={12} size={2} speed={0.4} opacity={0.5} color="#8b5cf6" />
            <Sparkles count={50} scale={10} size={4} speed={0.6} opacity={0.3} color="#f43f5e" />
            <Sparkles count={100} scale={15} size={1} speed={0.2} opacity={0.6} color="#10b981" />
            
            <Overlay mood={mood} setMood={setMood} />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  )
}
