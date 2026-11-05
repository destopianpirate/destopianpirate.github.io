import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { scrollStore } from '../scrollStore';

// Renders the live 3D Neural Cellular Automaton (computed in nca.worker.js) as instanced voxels.
// A fast "slash" of the pointer through the bust cuts a hole; the trained network regrows it.

const VOXEL = 0.135;     // world size of one cell (bust ≈ 30 cells tall ≈ 4 units)
const MAX_CELLS = 6000;

export default function NCAVoxels({ theme }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const workerRef = useRef(null);
  const gridRef = useRef(null);
  const dataRef = useRef({ cells: null, count: 0, dirty: false });
  const fadeRef = useRef(0);
  const matcap = useTexture('/home/matcap-porcelain.webp');
  const { camera, gl } = useThree();
  const dark = theme === 'dark';

  const geometry = useMemo(() => new THREE.BoxGeometry(VOXEL * 0.9, VOXEL * 0.9, VOXEL * 0.9), []);
  const material = useMemo(() => {
    const m = new THREE.MeshMatcapMaterial({ matcap, transparent: true });
    m.matcap.colorSpace = THREE.SRGBColorSpace;
    return m;
  }, [matcap]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  // ---- worker lifecycle
  useEffect(() => {
    const w = new Worker(new URL('./nca.worker.js', import.meta.url), { type: 'module' });
    workerRef.current = w;
    w.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'ready') {
        gridRef.current = m.grid;
        scrollStore.ncaReady = true;
        w.postMessage({ type: 'run', value: true });
      } else if (m.type === 'frame') {
        dataRef.current = { cells: m.cells, count: m.count, dirty: true };
      }
    };
    w.onerror = () => { scrollStore.ncaReady = false; };
    w.postMessage({ type: 'init', base: '/home/nca/' });
    return () => {
      scrollStore.ncaReady = false;
      w.terminate();
    };
  }, []);

  // ---- slash to cut: pointer moving fast across the bust (or a click) removes a sphere of cells
  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const inv = new THREE.Matrix4();
    const box = new THREE.Box3();
    const hit = new THREE.Vector3();
    let last = null;
    const cut = (e, force) => {
      const grid = gridRef.current;
      const g = groupRef.current;
      if (!grid || !g || scrollStore.stage > 0.35) return;
      const now = performance.now();
      const speed = last ? Math.hypot(e.clientX - last.x, e.clientY - last.y) / Math.max(1, now - last.t) : 0;
      last = { x: e.clientX, y: e.clientY, t: now };
      if (!force && speed < 1.6) return; // px per ms: only a deliberate slash cuts
      const r = gl.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      // march the ray through the grid in the group's local space, cut at the first live cell
      inv.copy(g.matrixWorld).invert();
      const o = ray.ray.origin.clone().applyMatrix4(inv);
      const d = ray.ray.direction.clone().transformDirection(inv);
      const [GX, GY, GZ] = grid;
      box.set(new THREE.Vector3(-GX / 2, -GY / 2, -GZ / 2).multiplyScalar(VOXEL), new THREE.Vector3(GX / 2, GY / 2, GZ / 2).multiplyScalar(VOXEL));
      const local = new THREE.Ray(o, d);
      if (!local.intersectBox(box, hit)) return;
      const { cells, count } = dataRef.current;
      if (!cells) return;
      const occ = new Set();
      for (let i = 0; i < count; i++) occ.add(`${cells[i * 6]},${cells[i * 6 + 1]},${cells[i * 6 + 2]}`);
      const p = hit.clone();
      for (let s = 0; s < 120; s++) {
        const gx = Math.floor(p.x / VOXEL + GX / 2), gy = Math.floor(p.y / VOXEL + GY / 2), gz = Math.floor(p.z / VOXEL + GZ / 2);
        if (gx < 0 || gy < 0 || gz < 0 || gx >= GX || gy >= GY || gz >= GZ) { if (s > 2) break; }
        else if (occ.has(`${gx},${gy},${gz}`)) {
          workerRef.current?.postMessage({ type: 'damage', x: gx, y: gy, z: gz, r: force ? 4.5 : 3.2 });
          return;
        }
        p.addScaledVector(d, VOXEL * 0.5);
      }
    };
    const onMove = (e) => cut(e, false);
    const onDown = (e) => {
      // clicks on links/buttons are not cuts
      if (e.target.closest && e.target.closest('a, button, input, textarea')) return;
      cut(e, true);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [camera, gl]);

  // ---- per-frame: upload instances, fade out as the page scrolls away, pause worker off-hero
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const ink = useMemo(() => new THREE.Color(), []);
  const paper = useMemo(() => new THREE.Color(), []);
  const hot = useMemo(() => new THREE.Color(), []);
  const runningRef = useRef(true);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const grid = gridRef.current;
    if (!mesh || !grid) return;

    const target = Math.max(0, 1 - scrollStore.stage / 0.45);
    fadeRef.current += (target - fadeRef.current) * Math.min(1, delta * 6);
    const f = fadeRef.current;
    mesh.material.opacity = f;
    mesh.visible = f > 0.01;
    groupRef.current.scale.setScalar(0.9 + f * 0.1);

    const shouldRun = scrollStore.stage < 0.6;
    if (shouldRun !== runningRef.current) {
      runningRef.current = shouldRun;
      workerRef.current?.postMessage({ type: 'run', value: shouldRun });
    }

    const d = dataRef.current;
    if (!d.dirty || !d.cells) return;
    d.dirty = false;
    const [GX, GY, GZ] = grid;
    ink.set(dark ? '#f2f2f4' : '#17171a');
    paper.set(dark ? '#55555c' : '#b9b9c0');
    hot.set(dark ? '#FF4D2E' : '#E8401F');
    const n = Math.min(d.count, MAX_CELLS);
    for (let i = 0; i < n; i++) {
      const o = i * 6;
      const a = d.cells[o + 3], g = d.cells[o + 4], act = d.cells[o + 5];
      tmp.position.set((d.cells[o] - GX / 2 + 0.5) * VOXEL, (d.cells[o + 1] - GY / 2 + 0.5) * VOXEL, (d.cells[o + 2] - GZ / 2 + 0.5) * VOXEL);
      tmp.scale.setScalar(Math.min(1, Math.max(0.15, (a - 0.1) / 0.7)));
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
      // front (g→1) reads light, back reads as ink; cells that are actively growing/healing glow
      col.copy(paper).lerp(ink, 1 - g).lerp(hot, Math.min(1, act * 1.6));
      mesh.setColorAt(i, col);
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[0.45, -0.1, 0]}>
      <instancedMesh ref={meshRef} args={[geometry, material, MAX_CELLS]} frustumCulled={false} />
    </group>
  );
}
