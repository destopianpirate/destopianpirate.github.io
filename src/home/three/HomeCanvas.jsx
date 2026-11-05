import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import ParticleField from './ParticleField';
import FloatingShapes from './FloatingShapes';
import { scrollStore } from '../scrollStore';

// Fixed, full-viewport WebGL layer behind the homepage DOM. Lazy-loaded so three.js
// stays out of the initial bundle.
export default function HomeCanvas({ theme, isMobile, onReady }) {
  useEffect(() => {
    const onMove = (e) => {
      scrollStore.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      scrollStore.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="home3d-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, isMobile ? 1.25 : 1.6]}
        camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <fog attach="fog" args={[theme === 'dark' ? '#030303' : '#ffffff', 11, 24]} />
        <ParticleField count={isMobile ? 7000 : 18000} theme={theme} isMobile={isMobile} onReady={onReady} />
        <Suspense fallback={null}>
          <FloatingShapes isMobile={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  );
}
