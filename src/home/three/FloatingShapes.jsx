import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { scrollStore } from '../scrollStore';

// Matcap-shaded objects drifting through the page at different parallax depths.
// Porcelain + graphite dominate; ember (orange-red) is reserved for a couple of small accents.
// side: which page gutter (-1 left, 1 right); j: position inside that gutter (-1 inner … 1 outer)
const SHAPES = [
  { geo: 'sphere', mat: 'porcelain', side: -1, j: 0.1, y: 1.9, z: -4, scale: 0.32, speed: 1.0 },
  { geo: 'torusKnot', mat: 'graphite', side: 1, j: 0.2, y: -1.6, z: -5, scale: 0.3, speed: 1.4 },
  { geo: 'icosa', mat: 'ember', side: -1, j: -0.3, y: -2.6, z: -2.5, scale: 0.13, speed: 1.9 },
  { geo: 'torus', mat: 'porcelain', side: 1, j: -0.2, y: 2.6, z: -5.5, scale: 0.3, speed: 0.7 },
  { geo: 'box', mat: 'graphite', side: -1, j: 0.5, y: -0.6, z: -6, scale: 0.3, speed: 0.85 },
  { geo: 'sphere', mat: 'ember', side: 1, j: -0.5, y: 0.4, z: -2, scale: 0.07, speed: 2.3 },
  { geo: 'capsule', mat: 'porcelain', side: -1, j: 0.7, y: 0.2, z: -6.5, scale: 0.2, speed: 1.6 },
  { geo: 'octa', mat: 'graphite', side: 1, j: 0.6, y: 1.0, z: -4.5, scale: 0.18, speed: 1.2 },
];

const WRAP = 5.6; // half-height of the vertical band objects loop through (just beyond the view)

function makeGeometry(kind) {
  switch (kind) {
    case 'torusKnot': return new THREE.TorusKnotGeometry(1, 0.32, 160, 24);
    case 'icosa': return new THREE.IcosahedronGeometry(1, 0);
    case 'torus': return new THREE.TorusGeometry(1, 0.34, 32, 80);
    case 'box': return new THREE.BoxGeometry(1.4, 1.4, 1.4, 1, 1, 1);
    case 'capsule': return new THREE.CapsuleGeometry(0.6, 1.2, 8, 24);
    case 'octa': return new THREE.OctahedronGeometry(1, 0);
    default: return new THREE.SphereGeometry(1, 48, 48);
  }
}

export default function FloatingShapes({ isMobile }) {
  const [porcelain, graphite, ember] = useTexture([
    '/home/matcap-porcelain.webp',
    '/home/matcap-graphite.webp',
    '/home/matcap-ember.webp',
  ]);
  const refs = useRef([]);

  const items = useMemo(() => {
    const mats = {
      porcelain: new THREE.MeshMatcapMaterial({ matcap: porcelain }),
      graphite: new THREE.MeshMatcapMaterial({ matcap: graphite }),
      ember: new THREE.MeshMatcapMaterial({ matcap: ember }),
    };
    Object.values(mats).forEach((m) => { m.matcap.colorSpace = THREE.SRGBColorSpace; });
    const list = isMobile ? SHAPES.filter((_, i) => i % 2 === 0) : SHAPES;
    return list.map((s, i) => ({
      ...s,
      geometry: makeGeometry(s.geo),
      material: mats[s.mat],
      phase: i * 1.7,
    }));
  }, [porcelain, graphite, ember, isMobile]);

  useEffect(() => () => {
    items.forEach((it) => it.geometry.dispose());
    new Set(items.map((it) => it.material)).forEach((m) => m.dispose());
  }, [items]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { width, height } = state.size;
    const aspect = width / height;
    const tanHalf = Math.tan((state.camera.fov * Math.PI) / 360);
    // keep shapes in the page gutters, outside the ~1100px content column
    const contentHalf = Math.min(0.97, 1180 / width);
    const gutterMid = (1 + contentHalf) / 2;
    const gutterHalf = (1 - contentHalf) / 2;
    // hidden on the hero; they grow in once the page scrolls into the About section
    const vis = Math.min(1, Math.max(0, (scrollStore.stage - 0.55) / 0.35));
    const m = scrollStore.mouse;
    items.forEach((it, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      // Scroll parallax: nearer/faster shapes travel further, looping inside the band.
      const raw = it.y + scrollStore.progress * it.speed * 14 + Math.sin(t * 0.6 + it.phase) * 0.12;
      const y = ((((raw + WRAP) % (2 * WRAP)) + 2 * WRAP) % (2 * WRAP)) - WRAP;
      const halfW = (state.camera.position.z - it.z) * tanHalf * aspect;
      const x = it.side * (gutterMid + it.j * gutterHalf * 0.6) * halfW;
      mesh.position.set(x + m.x * 0.25 * it.speed, y - m.y * 0.15 * it.speed, it.z);
      mesh.visible = vis > 0.001;
      mesh.scale.setScalar(it.scale * vis);
      mesh.rotation.x = t * 0.25 * it.speed + it.phase + scrollStore.progress * 4;
      mesh.rotation.y = t * 0.18 * it.speed + it.phase;
    });
  });

  return items.map((it, i) => (
    <mesh
      key={i}
      ref={(el) => (refs.current[i] = el)}
      geometry={it.geometry}
      material={it.material}
    />
  ));
}
