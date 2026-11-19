import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Outlines } from '@react-three/drei';
import * as THREE from 'three';
import { store } from '../core/store';

// Cel-shaded ("anime") scene: toon materials with a 3-step ramp + inverted-hull ink outlines.
// Scroll flies the camera down a corridor of torii gates, through sakura, to a neural core.

const INK = '#0d0d0f';
const PAPER = '#f6f3ec';
const RED = '#e3122c';
const RED_DEEP = '#9e0b1f';
const SAKURA = '#ffc2cf';

const GATE_COUNT = 15;
const GATE_GAP = 7;
const CORE_Z = -GATE_COUNT * GATE_GAP - 22;
const CAM_START = 13;
const CAM_END = CORE_Z + 15;

function useToonRamp() {
  return useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([70, 70, 170, 255]), 4, 1, THREE.RedFormat);
    t.minFilter = t.magFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.needsUpdate = true;
    return t;
  }, []);
}

function Toon({ color, ramp, ...p }) {
  return <meshToonMaterial color={color} gradientMap={ramp} {...p} />;
}

const LINE = 0.045;

/* A torii gate built from primitives, every piece with an ink outline */
function Torii({ z, ramp, scale = 1, tilt = 0 }) {
  return (
    <group position={[0, 0, z]} scale={scale} rotation={[0, 0, tilt]}>
      {[-2.5, 2.5].map((x) => (
        <group key={x}>
          <mesh position={[x, -0.6, 0]}>
            <cylinderGeometry args={[0.26, 0.32, 7.2, 14]} />
            <Toon color={RED} ramp={ramp} />
            <Outlines thickness={LINE} color={INK} />
          </mesh>
          <mesh position={[x, -4.1, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.5, 14]} />
            <Toon color={INK} ramp={ramp} />
            <Outlines thickness={LINE} color={INK} />
          </mesh>
        </group>
      ))}
      {/* nuki: lower crossbeam */}
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[6.6, 0.34, 0.34]} />
        <Toon color={RED} ramp={ramp} />
        <Outlines thickness={LINE} color={INK} />
      </mesh>
      {/* gakuzuka: centre strut */}
      <mesh position={[0, 2.25, 0]}>
        <boxGeometry args={[0.36, 1.1, 0.3]} />
        <Toon color={RED} ramp={ramp} />
        <Outlines thickness={LINE} color={INK} />
      </mesh>
      {/* shimaki + kasagi: the two top beams, the black one sweeps up at the ends */}
      <mesh position={[0, 2.95, 0]}>
        <boxGeometry args={[7.2, 0.34, 0.5]} />
        <Toon color={RED} ramp={ramp} />
        <Outlines thickness={LINE} color={INK} />
      </mesh>
      <mesh position={[0, 3.36, 0]}>
        <boxGeometry args={[6.4, 0.42, 0.66]} />
        <Toon color={INK} ramp={ramp} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 3.85, 3.5, 0]} rotation={[0, 0, s * 0.16]}>
          <boxGeometry args={[1.6, 0.42, 0.66]} />
          <Toon color={INK} ramp={ramp} />
        </mesh>
      ))}
    </group>
  );
}

/* Floating faceted shards around the corridor */
function Shards({ ramp, count }) {
  const items = useMemo(() => {
    const r = mulberry(42);
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 ? 1 : -1;
      return {
        pos: [side * (5 + r() * 9), -3 + r() * 9, 6 - r() * (GATE_COUNT * GATE_GAP + 20)],
        s: 0.3 + r() * 0.9,
        color: [INK, PAPER, RED, PAPER, INK][i % 5],
        geo: i % 3,
        spin: 0.2 + r() * 0.6,
        phase: r() * Math.PI * 2,
      };
    });
  }, [count]);
  const refs = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const it = items[i];
      m.rotation.x = t * it.spin + it.phase;
      m.rotation.y = t * it.spin * 0.7;
      m.position.y = it.pos[1] + Math.sin(t * 0.6 + it.phase) * 0.4;
    });
  });
  return items.map((it, i) => (
    <mesh key={i} ref={(m) => (refs.current[i] = m)} position={it.pos} scale={it.s}>
      {it.geo === 0 ? <octahedronGeometry args={[1, 0]} /> : it.geo === 1 ? <tetrahedronGeometry args={[1, 0]} /> : <icosahedronGeometry args={[0.9, 0]} />}
      <Toon color={it.color} ramp={ramp} flatShading />
      <Outlines thickness={0.05} color={INK} />
    </mesh>
  ));
}

/* Sakura: instanced petals that drift around the camera wherever it is */
function Petals({ count }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(() => {
    const r = mulberry(7);
    return Array.from({ length: count }, () => ({
      x: (r() - 0.5) * 26, y: (r() - 0.5) * 16, z: -r() * 40,
      vy: 0.4 + r() * 0.8, sway: r() * Math.PI * 2, spin: (r() - 0.5) * 3, s: 0.7 + r() * 0.8,
    }));
  }, [count]);
  const geo = useMemo(() => {
    // a petal: a squashed diamond with a notch
    const s = new THREE.Shape();
    s.moveTo(0, -0.14);
    s.quadraticCurveTo(0.12, -0.02, 0.06, 0.12);
    s.lineTo(0, 0.08);
    s.lineTo(-0.06, 0.12);
    s.quadraticCurveTo(-0.12, -0.02, 0, -0.14);
    return new THREE.ShapeGeometry(s);
  }, []);
  useFrame((state, dt) => {
    const m = ref.current;
    if (!m) return;
    const d = Math.min(dt, 0.05);
    const camZ = state.camera.position.z;
    const rush = Math.min(3, Math.abs(store.velocity) / 20);
    data.forEach((p, i) => {
      p.y -= p.vy * d;
      p.sway += d;
      p.x += Math.sin(p.sway) * 0.25 * d + 0.35 * d;
      // keep the petal cloud wrapped around the camera
      let rel = p.z - camZ;
      rel += rush * d * 12;
      if (rel > 4) rel -= 44;
      if (rel < -40) rel += 44;
      p.z = camZ + rel;
      if (p.y < -8) p.y = 8;
      if (p.x > 13) p.x = -13;
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.sway * p.spin, p.sway * 0.7, p.sway * p.spin * 0.5);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshBasicMaterial color={SAKURA} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

/* Retro striped sun far behind everything */
function Sun() {
  return (
    <group position={[0, 9, CORE_Z - 90]}>
      <mesh>
        <circleGeometry args={[34, 64]} />
        <meshBasicMaterial color={RED} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[0, -6 - i * 4.6, 0.1]}>
          <planeGeometry args={[80, 0.8 + i * 0.55]} />
          <meshBasicMaterial color={PAPER} />
        </mesh>
      ))}
    </group>
  );
}

/* The destination: a faceted neural core with orbiting rings */
function Core({ ramp }) {
  const g = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const sats = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (g.current) {
      g.current.rotation.y = t * 0.35;
      g.current.rotation.x = Math.sin(t * 0.3) * 0.25;
      const pulse = 1 + Math.sin(t * 2.2) * 0.03 + store.impact * 0.25;
      g.current.scale.setScalar(pulse);
    }
    if (ring1.current) ring1.current.rotation.set(t * 0.6, 0.4, 0);
    if (ring2.current) ring2.current.rotation.set(1.1, t * 0.5, 0.3);
    if (sats.current) sats.current.rotation.y = -t * 0.8;
  });
  return (
    <group position={[0, 0.5, CORE_Z]}>
      <group ref={g}>
        <mesh>
          <icosahedronGeometry args={[2.6, 0]} />
          <Toon color={RED} ramp={ramp} flatShading />
          <Outlines thickness={0.07} color={INK} />
        </mesh>
        <mesh scale={1.42}>
          <icosahedronGeometry args={[2.6, 1]} />
          <meshBasicMaterial color={INK} wireframe transparent opacity={0.35} />
        </mesh>
      </group>
      <mesh ref={ring1}>
        <torusGeometry args={[5, 0.12, 8, 80]} />
        <Toon color={INK} ramp={ramp} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[6.4, 0.08, 8, 90]} />
        <Toon color={RED_DEEP} ramp={ramp} />
      </mesh>
      <group ref={sats}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 8, Math.sin(a * 2) * 1.2, Math.sin(a) * 8]} rotation={[a, a, 0]}>
              <boxGeometry args={[0.6, 0.6, 0.6]} />
              <Toon color={i % 2 ? PAPER : INK} ramp={ramp} />
              <Outlines thickness={0.04} color={INK} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* Ink ground lines receding to the horizon */
function Ground() {
  const geo = useMemo(() => {
    const pts = [];
    const len = GATE_COUNT * GATE_GAP + 140;
    for (let i = -6; i <= 6; i++) pts.push(i * 4, -4.4, 20, i * 4 * 1.6, -4.4, -len);
    for (let z = 20; z > -len; z -= 6) pts.push(-40, -4.4, z, 40, -4.4, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={INK} transparent opacity={0.16} />
    </lineSegments>
  );
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function Rig({ progressKey }) {
  const look = useMemo(() => new THREE.Vector3(), []);
  const cur = useRef({ z: CAM_START, fov: 55, roll: 0 });
  useFrame((state, dt) => {
    const { camera } = state;
    const d = Math.min(dt, 0.05);
    const p = ease(Math.min(1, Math.max(0, store[progressKey] ?? 0)));
    const targetZ = THREE.MathUtils.lerp(CAM_START, CAM_END, p);
    const c = cur.current;
    c.z = THREE.MathUtils.damp(c.z, targetZ, 4, d);
    const speed = Math.min(1, Math.abs(store.velocity) / 60);
    c.fov = THREE.MathUtils.damp(c.fov, 55 + speed * 22, 6, d);
    c.roll = THREE.MathUtils.damp(c.roll, -store.mouse.x * 0.06 + Math.sign(store.velocity) * speed * 0.05, 3, d);
    camera.position.set(
      THREE.MathUtils.damp(camera.position.x, store.mouse.x * 1.1, 3, d),
      THREE.MathUtils.damp(camera.position.y, 0.2 + store.mouse.y * 0.6, 3, d),
      c.z,
    );
    camera.fov = c.fov;
    camera.updateProjectionMatrix();
    look.set(store.mouse.x * 0.6, 0.6 + store.mouse.y * 0.3, c.z - 12);
    camera.lookAt(look);
    camera.rotation.z += c.roll;
    store.impact = Math.max(0, store.impact - d * 2.5);
  });
  return null;
}

function Scene({ mobile, progressKey }) {
  const ramp = useToonRamp();
  const gates = useMemo(() => Array.from({ length: GATE_COUNT }, (_, i) => ({
    z: -i * GATE_GAP,
    tilt: Math.sin(i * 1.7) * 0.012,
  })), []);
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[6, 10, 8]} intensity={2.4} />
      <directionalLight position={[-8, -2, -10]} intensity={0.6} color={SAKURA} />
      <Sun />
      <Ground />
      {gates.map((g, i) => <Torii key={i} z={g.z} tilt={g.tilt} ramp={ramp} />)}
      <Shards ramp={ramp} count={mobile ? 16 : 34} />
      <Petals count={mobile ? 120 : 260} />
      <Core ramp={ramp} />
      <Rig progressKey={progressKey} />
    </>
  );
}

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Scene3D({ onReady, progressKey = 'progress', className = '', active = true }) {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 760;
  return (
    <div className={`scene3d ${className}`} aria-hidden="true">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, mobile ? 1.4 : 1.75]}
        camera={{ fov: 55, position: [0, 0.2, CAM_START], near: 0.1, far: 420 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={() => onReady?.()}
      >
        <Scene mobile={mobile} progressKey={progressKey} />
      </Canvas>
      <div className="scene3d-tone" />
    </div>
  );
}
