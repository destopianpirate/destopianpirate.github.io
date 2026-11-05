import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { scrollStore } from '../scrollStore';

// Outro: a 3D loss surface. Each valley is something we could build together.
// A ball runs real Adam updates on the analytic gradient of the surface; clicking the surface
// drops a new ball there. When it converges, the valley it settled in lights up.

const VALLEYS = [
  { x: -4.6, z: 1.2, d: 1.55, s: 1.5 },
  { x: -0.6, z: -1.6, d: 1.9, s: 1.7 },
  { x: 3.6, z: 0.9, d: 1.7, s: 1.6 },
  { x: 0.9, z: 2.6, d: 1.1, s: 1.2 },
];
const SX = 18, SZ = 10, RES = 90;

function f(x, z) {
  let y = 0.018 * (x * x + 2.2 * z * z) + 0.16 * Math.sin(1.35 * x + 0.4) * Math.cos(1.15 * z - 0.3);
  for (const v of VALLEYS) y -= v.d * Math.exp(-((x - v.x) ** 2 + (z - v.z) ** 2) / (2 * v.s * v.s));
  return y;
}
function grad(x, z) {
  let gx = 0.036 * x + 0.16 * 1.35 * Math.cos(1.35 * x + 0.4) * Math.cos(1.15 * z - 0.3);
  let gz = 0.0792 * z - 0.16 * 1.15 * Math.sin(1.35 * x + 0.4) * Math.sin(1.15 * z - 0.3);
  for (const v of VALLEYS) {
    const e = v.d * Math.exp(-((x - v.x) ** 2 + (z - v.z) ** 2) / (2 * v.s * v.s)) / (v.s * v.s);
    gx += e * (x - v.x);
    gz += e * (z - v.z);
  }
  return [gx, gz];
}
const Y_MIN = -2.1, Y_MAX = 1.0;

export default function LossLandscape({ theme, isMobile }) {
  const groupRef = useRef();
  const ballRef = useRef();
  const trailRef = useRef();
  const fadeRef = useRef(0);
  const ember = useTexture('/home/matcap-ember.webp');
  const { camera, gl } = useThree();
  const dark = theme === 'dark';

  // optimiser state (mutable, never React state)
  const opt = useRef({ x: 6.5, z: -3.2, m: [0, 0], v: [0, 0], t: 0, still: 0, done: false, wait: 0, trail: [] });

  const drop = (x, z) => {
    Object.assign(opt.current, { x, z, m: [0, 0], v: [0, 0], t: 0, still: 0, done: false, wait: 0, trail: [] });
  };

  // surface mesh (occluder) + grid lines tinted by height
  const { surface, lines } = useMemo(() => {
    const surf = new THREE.PlaneGeometry(SX, SZ, RES, Math.round(RES * SZ / SX));
    surf.rotateX(-Math.PI / 2);
    const p = surf.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, f(p.getX(i), p.getZ(i)));
    surf.computeVertexNormals();

    const pos = [], col = [];
    const ink = new THREE.Color(dark ? '#d9d9de' : '#2a2a2e');
    const hot = new THREE.Color(dark ? '#FF4D2E' : '#E8401F');
    const c = new THREE.Color();
    const push = (x, z) => {
      const y = f(x, z);
      pos.push(x, y + 0.004, z);
      const low = THREE.MathUtils.clamp((Y_MAX - y) / (Y_MAX - Y_MIN), 0, 1);
      c.copy(ink).lerp(hot, Math.pow(low, 3.2));
      col.push(c.r, c.g, c.b);
    };
    const STEP = 0.07;
    for (let gz = -SZ / 2; gz <= SZ / 2 + 1e-6; gz += SZ / 28) {
      for (let x = -SX / 2; x < SX / 2; x += STEP) { push(x, gz); push(x + STEP, gz); }
    }
    for (let gx = -SX / 2; gx <= SX / 2 + 1e-6; gx += SX / 48) {
      for (let z = -SZ / 2; z < SZ / 2; z += STEP) { push(gx, z); push(gx, z + STEP); }
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    lg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return { surface: surf, lines: lg };
  }, [dark]);
  useEffect(() => () => { surface.dispose(); lines.dispose(); }, [surface, lines]);

  const trailGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(600 * 3), 3));
    g.setDrawRange(0, 0);
    return g;
  }, []);
  useEffect(() => () => trailGeo.dispose(), [trailGeo]);

  // click the landscape → drop a ball there
  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onDown = (e) => {
      if (scrollStore.stage < 3.6 || !groupRef.current) return;
      if (e.target.closest && e.target.closest('a, button, input, textarea, .h3-outro-copy')) return;
      const r = gl.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const mesh = groupRef.current.getObjectByName('loss-surface');
      const hit = ray.intersectObject(mesh, false)[0];
      if (!hit) return;
      const local = groupRef.current.worldToLocal(hit.point.clone());
      drop(local.x, local.z);
    };
    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => window.removeEventListener('pointerdown', onDown);
  }, [camera, gl]);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const target = THREE.MathUtils.clamp((scrollStore.stage - 3.25) / 0.6, 0, 1);
    fadeRef.current += (target - fadeRef.current) * Math.min(1, delta * 4);
    const fade = fadeRef.current;
    g.visible = fade > 0.01;
    if (!g.visible) return;
    g.traverse((o) => { if (o.material && 'opacity' in o.material && o.userData.fade) o.material.opacity = o.userData.fade * fade; });
    g.position.y = (isMobile ? -2.1 : -2.3) - (1 - fade) * 1.2;
    g.rotation.y = scrollStore.mouse.x * 0.12;

    // --- Adam on the analytic gradient
    const o = opt.current;
    if (o.done) {
      o.wait += delta;
      if (o.wait > 3.2) {
        const a = Math.random() * Math.PI * 2;
        drop(Math.cos(a) * 7.5, Math.sin(a) * 4);
      }
    } else {
      for (let k = 0; k < 2; k++) {
        const [gx, gz] = grad(o.x, o.z);
        o.t += 1;
        const b1 = 0.9, b2 = 0.999, lr = 0.045, eps = 1e-8;
        o.m[0] = b1 * o.m[0] + (1 - b1) * gx; o.m[1] = b1 * o.m[1] + (1 - b1) * gz;
        o.v[0] = b2 * o.v[0] + (1 - b2) * gx * gx; o.v[1] = b2 * o.v[1] + (1 - b2) * gz * gz;
        const mh0 = o.m[0] / (1 - b1 ** o.t), mh1 = o.m[1] / (1 - b1 ** o.t);
        const vh0 = o.v[0] / (1 - b2 ** o.t), vh1 = o.v[1] / (1 - b2 ** o.t);
        const sx = lr * mh0 / (Math.sqrt(vh0) + eps), sz = lr * mh1 / (Math.sqrt(vh1) + eps);
        o.x = THREE.MathUtils.clamp(o.x - sx, -SX / 2, SX / 2);
        o.z = THREE.MathUtils.clamp(o.z - sz, -SZ / 2, SZ / 2);
        o.still = Math.hypot(sx, sz) < 0.004 && Math.hypot(gx, gz) < 0.03 ? o.still + 1 : 0;
        if (o.trail.length === 0 || o.t % 2 === 0) o.trail.push(o.x, f(o.x, o.z) + 0.06, o.z);
        if (o.trail.length > 600 * 3) o.trail.splice(0, 3);
      }
      if (o.still > 50) o.done = true;
    }
    const y = f(o.x, o.z);
    ballRef.current.position.set(o.x, y + 0.16, o.z);
    const tg = trailRef.current.geometry;
    tg.attributes.position.array.set(o.trail);
    tg.attributes.position.needsUpdate = true;
    tg.setDrawRange(0, o.trail.length / 3);
  });

  return (
    <group ref={groupRef} position={[0, -2.3, -3.5]} rotation={[0.12, 0, 0]} scale={isMobile ? 0.5 : 1} visible={false}>
      <mesh name="loss-surface" geometry={surface} userData={{ fade: 1 }} renderOrder={-1}>
        <meshBasicMaterial color={dark ? '#030303' : '#ffffff'} transparent opacity={0} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <lineSegments geometry={lines} userData={{ fade: 0.42 }} renderOrder={1}>
        <lineBasicMaterial vertexColors transparent opacity={0} />
      </lineSegments>
      <line ref={trailRef} geometry={trailGeo} userData={{ fade: 0.9 }}>
        <lineBasicMaterial color={dark ? '#FF4D2E' : '#E8401F'} transparent opacity={0} />
      </line>
      <mesh ref={ballRef} userData={{ fade: 1 }}>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshMatcapMaterial matcap={ember} transparent opacity={0} />
      </mesh>
    </group>
  );
}
