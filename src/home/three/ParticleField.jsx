import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollStore } from '../scrollStore';
import { portraitBust, brain, lorenz, kleinBottle, terrain } from './shapes';

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uStage;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uEnergy;
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aP3;
  attribute vec3 aP4;
  attribute float aRand;
  attribute float aAccent;
  varying float vRand;
  varying float vAccent;
  varying float vDepth;

  vec3 pick(float i) {
    if (i < 0.5) return position;
    if (i < 1.5) return aP1;
    if (i < 2.5) return aP2;
    if (i < 3.5) return aP3;
    return aP4;
  }

  void main() {
    float s = clamp(uStage, 0.0, 4.0);
    float i0 = min(floor(s), 3.0);
    float f = s - i0;
    // Per-particle delay → the morph ripples through the cloud instead of moving as a block.
    float d = aRand * 0.45;
    float t = smoothstep(d, d + 0.55, f);
    vec3 p = mix(pick(i0), pick(i0 + 1.0), t);

    // Turbulence: always a little alive, much more while mid-morph or scrolling fast.
    float burst = sin(t * 3.14159);
    // Vortex: mid-morph, particles spiral around the vertical axis before locking into the new form.
    float ang = burst * (1.2 + aRand * 2.4) * (mod(i0, 2.0) < 0.5 ? 1.0 : -1.0);
    float ca = cos(ang), sa = sin(ang);
    p.xz = mat2(ca, -sa, sa, ca) * p.xz;
    float amp = 0.012 + burst * 0.55 * aRand + uEnergy * 0.25 * aRand;
    p += vec3(
      sin(uTime * 0.7 + aRand * 40.0),
      cos(uTime * 0.6 + aRand * 31.0),
      sin(uTime * 0.5 + aRand * 23.0)
    ) * amp;

    // Rolling wave once the terrain (stage 4) settles in.
    float w4 = smoothstep(3.0, 4.0, s);
    p.y += sin(p.x * 0.7 + uTime * 0.9) * cos(p.z * 0.5 + uTime * 0.6) * 0.22 * w4;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand * 0.9) * (1.0 + aAccent * 0.6) * uPixelRatio / -mv.z;

    vRand = aRand;
    vAccent = aAccent;
    vDepth = clamp((-mv.z - 6.0) / 10.0, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uAccent;
  uniform float uOpacity;
  uniform float uTime;
  varying float vRand;
  varying float vAccent;
  varying float vDepth;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.12, d);
    float pulse = 0.65 + 0.35 * sin(uTime * 2.2 + vRand * 30.0);
    vec3 col = mix(uBase, uAccent, vAccent);
    float alpha = a * uOpacity * mix(0.45 + 0.55 * vRand, pulse, vAccent) * (1.0 - vDepth * 0.6);
    gl_FragColor = vec4(col, alpha);
  }
`;

// Where the cloud sits for each stage (desktop / mobile). Text lives on the left on desktop.
const OFFSETS = {
  desktop: [[3.05, -0.15, 0], [2.6, 0, 0.3], [0, 0.1, -1.5], [2.7, 0.2, -0.8], [0, -0.7, 0]],
  mobile: [[0, 0.7, -3.5], [0, 1.0, -3], [0, 0.2, -3], [0, 0.9, -3.5], [0, -0.7, 0]],
};
const OPACITY = {
  light: [0.95, 0.9, 0.5, 0.75, 0],
  dark: [0.9, 0.85, 0.5, 0.7, 0],
};

// Point size per stage: the brain needs fine dots so its folds stay visible.
const SIZE = [24, 16, 15, 17, 24];

const lerpStage = (table, s) => {
  const i = Math.min(Math.floor(s), table.length - 2);
  const f = Math.min(Math.max(s - i, 0), 1);
  const a = table[i], b = table[i + 1];
  return Array.isArray(a) ? a.map((v, k) => v + (b[k] - v) * f) : a + (b - a) * f;
};

export default function ParticleField({ count, theme, isMobile, onReady, children }) {
  const groupRef = useRef();
  const spinRef = useRef();
  const matRef = useRef();
  const stageRef = useRef(0);
  const [geometry, setGeometry] = useState(null);
  const { gl } = useThree();

  useEffect(() => {
    let cancelled = false;
    let built = null;
    (async () => {
      const [p0, p1] = await Promise.all([portraitBust(count), brain(count)]);
      if (cancelled) return;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(p0, 3));
      g.setAttribute('aP1', new THREE.BufferAttribute(p1, 3));
      g.setAttribute('aP2', new THREE.BufferAttribute(lorenz(count), 3));
      g.setAttribute('aP3', new THREE.BufferAttribute(kleinBottle(count), 3));
      g.setAttribute('aP4', new THREE.BufferAttribute(terrain(count), 3));
      const r = new Float32Array(count);
      const acc = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        r[i] = Math.random();
        acc[i] = Math.random() < 0.055 ? 1 : 0; // ~5% of particles carry the orange-red accent
      }
      g.setAttribute('aRand', new THREE.BufferAttribute(r, 1));
      g.setAttribute('aAccent', new THREE.BufferAttribute(acc, 1));
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
      built = g;
      setGeometry(g);
      onReady?.();
    })();
    return () => {
      cancelled = true;
      built?.dispose();
    };
  }, [count, onReady]);

  // Uniforms are created once; per-frame writes go through the material ref.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStage: { value: 0 },
      uSize: { value: 26 },
      uPixelRatio: { value: 1 },
      uEnergy: { value: 0 },
      uOpacity: { value: 1 },
      uBase: { value: new THREE.Color('#1a1a1a') },
      uAccent: { value: new THREE.Color('#E8401F') },
    }),
    []
  );
  const dark = theme === 'dark';

  // Theme → colours (additive glow on dark, normal ink-like dots on white)
  useEffect(() => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uBase.value.set(dark ? '#e8e8ec' : '#1a1a1a');
    m.uniforms.uAccent.value.set(dark ? '#FF4D2E' : '#E8401F');
  }, [dark, geometry]);

  useFrame((state, delta) => {
    const m = matRef.current;
    if (!m) return;
    const u = m.uniforms;
    const dt = Math.min(delta, 0.05);
    stageRef.current += (scrollStore.stage - stageRef.current) * Math.min(1, dt * 3.2);
    const s = stageRef.current;

    u.uTime.value = state.clock.elapsedTime;
    u.uStage.value = s;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uSize.value = lerpStage(SIZE, s) * (isMobile ? 0.85 : 1);
    const energy = Math.min(Math.abs(scrollStore.velocity) / 3000, 1);
    // ScrollTrigger only reports velocity while scrolling; decay it so the cloud calms down at rest.
    scrollStore.velocity *= Math.pow(0.05, dt);
    u.uEnergy.value += (energy - u.uEnergy.value) * Math.min(1, dt * 4);
    const op = OPACITY[theme === 'dark' ? 'dark' : 'light'];
    // while the NCA voxel bust owns the hero, the particles only appear as you scroll away
    u.uOpacity.value = lerpStage(scrollStore.ncaReady ? [0, ...op.slice(1)] : op, s);

    const g = groupRef.current;
    if (!g) return;
    const [x, y, z] = lerpStage(isMobile ? OFFSETS.mobile : OFFSETS.desktop, s);
    g.position.set(x, y, z);
    const mouse = scrollStore.mouse;
    const t = state.clock.elapsedTime;
    const targetRy = mouse.x * 0.35 + Math.sin(t * 0.25) * 0.12;
    g.rotation.y += (targetRy - g.rotation.y) * Math.min(1, dt * 2.5);
    g.rotation.x += (-mouse.y * 0.15 - g.rotation.x) * Math.min(1, dt * 2.5);

    // The Lorenz attractor (2) and Klein bottle (3) turn slowly to show their 3D structure;
    // the weight fades this out for the other stages.
    if (spinRef.current) {
      const w = Math.max(0, 1 - Math.min(Math.abs(s - 2), Math.abs(s - 3)) * 1.4);
      const k3 = Math.max(0, 1 - Math.abs(s - 3) * 1.4);
      spinRef.current.rotation.y = Math.sin(t * 0.22) * 0.42 * w;
      spinRef.current.rotation.x = 0.12 * k3 + Math.cos(t * 0.15) * 0.08 * w;
      spinRef.current.rotation.z = -0.12 * k3;
    }
  });

  if (!geometry) return null;
  return (
    <group ref={groupRef}>
      <group ref={spinRef}>
        <points geometry={geometry} frustumCulled={false}>
          <shaderMaterial
            ref={matRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
          />
        </points>
      </group>
      {children}
    </group>
  );
}
