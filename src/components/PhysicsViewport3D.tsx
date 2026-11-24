import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type CameraPreset = 'iso' | 'side' | 'top' | 'front';

interface PhysicsViewport3DProps {
  moduleId: string;
  params: Record<string, number>;
  time: number;
  visibleVectors: Record<string, boolean>;
  crossSection: boolean;
  cameraPreset: CameraPreset;
}

function wavelengthToHex(nm: number): number {
  if (nm < 440) return 0x8b5cf6;
  if (nm < 490) return 0x3b82f6;
  if (nm < 520) return 0x06b6d4;
  if (nm < 565) return 0x10b981;
  if (nm < 590) return 0xeab308;
  if (nm < 625) return 0xf97316;
  return 0xf43f5e;
}

export const PhysicsViewport3D: React.FC<PhysicsViewport3DProps> = ({
  moduleId,
  params,
  time,
  visibleVectors,
  crossSection,
  cameraPreset,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);

  // Initialize Three.js Scene, Camera, Renderer, Lights, Grid
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050914);
    scene.fog = new THREE.FogExp2(0x050914, 0.015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      500
    );
    camera.position.set(14, 10, 16);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.localClippingEnabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.maxDistance = 80;
    controls.minDistance = 4;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(15, 25, 18);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0x22d3ee, 1.2, 40);
    rimLight.position.set(-12, 8, -10);
    scene.add(rimLight);

    // Reference Floor Grid
    const grid = new THREE.GridHelper(36, 36, 0x1e293b, 0x0f172a);
    grid.position.y = -0.02;
    scene.add(grid);

    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    dynamicGroupRef.current = dynamicGroup;

    let animFrameId: number;
    const renderLoop = () => {
      controls.update();
      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Camera Preset
  useEffect(() => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    if (cameraPreset === 'iso') {
      cam.position.set(13, 9, 15);
      ctrl.target.set(0, 2, 0);
    } else if (cameraPreset === 'side') {
      cam.position.set(0, 3.5, 19);
      ctrl.target.set(0, 2, 0);
    } else if (cameraPreset === 'top') {
      cam.position.set(0, 22, 0.01);
      ctrl.target.set(0, 0, 0);
    } else if (cameraPreset === 'front') {
      cam.position.set(19, 3.5, 0);
      ctrl.target.set(0, 2, 0);
    }
    ctrl.update();
  }, [cameraPreset, moduleId]);

  // Rebuild / Update 3D Objects for Current Module, Parameters, and Time
  useEffect(() => {
    const group = dynamicGroupRef.current;
    if (!group) return;

    // Dispose old geometries & materials cleanly
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    const clipPlanes = crossSection ? [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)] : [];

    const makeArrow = (origin: THREE.Vector3, dir: THREE.Vector3, length: number, colorHex: number) => {
      if (length < 0.15) return;
      const clampedLen = Math.min(8, Math.max(0.5, length));
      const arrow = new THREE.ArrowHelper(
        dir.clone().normalize(),
        origin,
        clampedLen,
        colorHex,
        Math.min(0.6, clampedLen * 0.25),
        Math.min(0.38, clampedLen * 0.18)
      );
      group.add(arrow);
    };

    // =========================================================================
    // 1.1 การเคลื่อนที่แนวตรง (Linear Motion 3D Track & Electric Test Car)
    // =========================================================================
    if (moduleId === 'mech-01-linear') {
      const u = params.u ?? 20;
      const a = params.a ?? -4;
      const targetDist = params.targetDist ?? 50;

      // Asphalt Test Track
      const trackGeo = new THREE.BoxGeometry(24, 0.25, 3.2);
      const trackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      const track = new THREE.Mesh(trackGeo, trackMat);
      track.position.set(0, 0.12, 0);
      group.add(track);

      // Finish Line Flag Gate at targetDist (scaled: 100m -> 20 units, start at x = -10)
      const scaleX = 0.2;
      const startX = -9;
      const finishX = startX + targetDist * scaleX;
      const gateGeo = new THREE.BoxGeometry(0.18, 3.5, 3.4);
      const gateMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.35,
        emissive: 0x10b981,
        emissiveIntensity: 0.3,
      });
      const gate = new THREE.Mesh(gateGeo, gateMat);
      gate.position.set(finishX, 1.8, 0);
      group.add(gate);

      // Compute Car Position
      const t = time % 10;
      const stopTime = a < 0 && u > 0 ? Math.min(t, -u / a) : t;
      const v = a < 0 && t >= -u / a ? 0 : u + a * t;
      const s = Math.max(-10, Math.min(110, u * stopTime + 0.5 * a * stopTime * stopTime));
      const carX = startX + s * scaleX;

      // 3D Test Vehicle
      const carGroup = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.65, 1.1),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.5, roughness: 0.2, clippingPlanes: clipPlanes })
      );
      body.position.y = 0.55;
      carGroup.add(body);

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.45, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.1, clippingPlanes: clipPlanes })
      );
      cabin.position.set(-0.1, 1.0, 0);
      carGroup.add(cabin);

      carGroup.position.set(carX, 0.2, 0);
      group.add(carGroup);

      if (visibleVectors.v && Math.abs(v) > 0.2) {
        makeArrow(
          new THREE.Vector3(carX, 1.4, 0),
          new THREE.Vector3(v >= 0 ? 1 : -1, 0, 0),
          Math.abs(v) * 0.15,
          0x22d3ee
        );
      }
      if (visibleVectors.a && Math.abs(a) > 0.1) {
        makeArrow(
          new THREE.Vector3(carX, 1.85, 0),
          new THREE.Vector3(a >= 0 ? 1 : -1, 0, 0),
          Math.abs(a) * 0.35,
          0xf43f5e
        );
      }
    }

    // =========================================================================
    // 1.2 กฎของนิวตันบนพื้นเอียง (3D Inclined Plane & Free-Body Diagram)
    // =========================================================================
    else if (moduleId === 'mech-02-newton') {
      const mass = params.mass ?? 5;
      const angle = params.angle ?? 30;
      const mu = params.mu ?? 0.3;
      const g = params.g ?? 9.8;
      const rad = (angle * Math.PI) / 180;

      const rampGroup = new THREE.Group();
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.4, 3.5),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, clippingPlanes: clipPlanes })
      );
      rampGroup.add(plank);

      const fDown = mass * g * Math.sin(rad);
      const fMax = mu * mass * g * Math.cos(rad);
      const acc = Math.max(0, (fDown - fMax) / mass);
      const slideDist = Math.min(8, 0.5 * acc * Math.pow(time % 3.5, 2));
      const boxLocalX = 3.5 - slideDist;

      const boxSize = 0.8 + mass * 0.04;
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(boxSize, boxSize, boxSize),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.3, roughness: 0.3, clippingPlanes: clipPlanes })
      );
      box.position.set(boxLocalX, 0.2 + boxSize / 2, 0);
      rampGroup.add(box);

      rampGroup.rotation.z = rad;
      rampGroup.position.set(0, Math.sin(rad) * 5, 0);
      group.add(rampGroup);

      // Compute world position of box center for 3D FBD vectors
      const boxWorldPos = new THREE.Vector3(boxLocalX, 0.2 + boxSize / 2, 0);
      boxWorldPos.applyAxisAngle(new THREE.Vector3(0, 0, 1), rad);
      boxWorldPos.add(rampGroup.position);

      if (visibleVectors.mg) {
        makeArrow(boxWorldPos, new THREE.Vector3(0, -1, 0), Math.min(5, (mass * g) / 25), 0xf43f5e);
      }
      if (visibleVectors.N) {
        const nDir = new THREE.Vector3(-Math.sin(rad), Math.cos(rad), 0);
        makeArrow(boxWorldPos, nDir, Math.min(5, (mass * g * Math.cos(rad)) / 25), 0x22d3ee);
      }
      if (visibleVectors.f) {
        const fDir = new THREE.Vector3(Math.cos(rad), Math.sin(rad), 0);
        makeArrow(boxWorldPos, fDir, Math.min(4.5, Math.min(fDown, fMax) / 15), 0xf59e0b);
      }
    }

    // =========================================================================
    // 1.3 สมดุลกลและโมเมนต์ของแรง (3D Torque Balance Beam & Weights)
    // =========================================================================
    else if (moduleId === 'mech-03-torque') {
      const m1 = params.m1 ?? 10;
      const r1 = params.r1 ?? 3;
      const m2 = params.m2 ?? 6;
      const r2 = params.r2 ?? 4;
      const netTorque = (m1 * r1 - m2 * r2) * 9.8;
      const tiltRad = (Math.max(-22, Math.min(22, (netTorque / 150) * 14)) * Math.PI) / 180;

      // Fulcrum Pedestal
      const stand = new THREE.Mesh(
        new THREE.ConeGeometry(1.4, 3.2, 4),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 })
      );
      stand.position.set(0, 1.6, 0);
      group.add(stand);

      const beamGroup = new THREE.Group();
      beamGroup.position.set(0, 3.2, 0);
      beamGroup.rotation.z = tiltRad;

      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(14, 0.35, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.3 })
      );
      beamGroup.add(beam);

      // Left Mass m1
      const s1 = 0.6 + m1 * 0.04;
      const mass1Mesh = new THREE.Mesh(
        new THREE.BoxGeometry(s1, s1, s1),
        new THREE.MeshStandardMaterial({ color: 0x22d3ee })
      );
      mass1Mesh.position.set(-r1, 0.18 + s1 / 2, 0);
      beamGroup.add(mass1Mesh);

      // Right Mass m2
      const s2 = 0.6 + m2 * 0.04;
      const mass2Mesh = new THREE.Mesh(
        new THREE.BoxGeometry(s2, s2, s2),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b })
      );
      mass2Mesh.position.set(r2, 0.18 + s2 / 2, 0);
      beamGroup.add(mass2Mesh);

      group.add(beamGroup);

      if (visibleVectors.F1) {
        const p1 = new THREE.Vector3(-r1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), tiltRad).add(beamGroup.position);
        makeArrow(p1, new THREE.Vector3(0, -1, 0), 1 + m1 * 0.15, 0x22d3ee);
      }
      if (visibleVectors.F2) {
        const p2 = new THREE.Vector3(r2, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), tiltRad).add(beamGroup.position);
        makeArrow(p2, new THREE.Vector3(0, -1, 0), 1 + m2 * 0.15, 0xf59e0b);
      }
      if (visibleVectors.tau && Math.abs(netTorque) > 1) {
        makeArrow(
          new THREE.Vector3(0, 3.2, 0),
          new THREE.Vector3(0, 0, netTorque > 0 ? 1 : -1),
          Math.min(5, Math.abs(netTorque) / 40),
          0xa855f7
        );
      }
    }

    // =========================================================================
    // 1.4 งานและพลังงาน (3D Roller Coaster Vertical Loop)
    // =========================================================================
    else if (moduleId === 'mech-04-energy') {
      const h0 = params.h0 ?? 35;
      const loopR = params.loopR ?? 12;
      const scale = 0.22;
      const rScaled = loopR * scale;
      const hScaled = h0 * scale;

      // Build 3D Coaster Track (Ramp + Circular Loop + Exit)
      const curvePoints: THREE.Vector3[] = [];
      curvePoints.push(new THREE.Vector3(-8, hScaled, -0.8));
      curvePoints.push(new THREE.Vector3(-2.5, 0.3, -0.4));
      for (let i = 0; i <= 32; i++) {
        const ang = (i / 32) * Math.PI * 2;
        const lx = rScaled * Math.sin(ang);
        const ly = rScaled * (1 - Math.cos(ang)) + 0.3;
        const lz = -0.3 + (i / 32) * 0.6;
        curvePoints.push(new THREE.Vector3(lx, ly, lz));
      }
      curvePoints.push(new THREE.Vector3(7, 0.3, 0.5));

      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 120, 0.14, 12, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.6, roughness: 0.2 });
      group.add(new THREE.Mesh(tubeGeo, tubeMat));

      // Animate Coaster Cart along the track
      const uProgress = (time * 0.22) % 1;
      const pos = curve.getPointAt(uProgress);
      const tangent = curve.getTangentAt(uProgress);

      const cart = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 24, 24),
        new THREE.MeshStandardMaterial({ color: h0 >= 2.5 * loopR ? 0x10b981 : 0xf43f5e, emissive: 0x0f172a })
      );
      cart.position.copy(pos);
      group.add(cart);

      if (visibleVectors.v) {
        makeArrow(pos, tangent, 2.2, 0x22d3ee);
      }
      if (visibleVectors.Fc) {
        const centerLoop = new THREE.Vector3(0, rScaled + 0.3, 0);
        const toCenter = centerLoop.clone().sub(pos);
        if (toCenter.length() < rScaled * 1.5) {
          makeArrow(pos, toCenter, 1.8, 0xf43f5e);
        }
      }
    }

    // =========================================================================
    // 1.5 โมเมนตัมและการชน (3D Momentum & Collisions)
    // =========================================================================
    else if (moduleId === 'mech-05-momentum') {
      const m1 = params.m1 ?? 4;
      const u1 = params.u1 ?? 10;
      const m2 = params.m2 ?? 4;
      const e = params.e ?? 1.0;

      const v1 = ((m1 - e * m2) * u1) / (m1 + m2);
      const v2 = ((1 + e) * m1 * u1) / (m1 + m2);

      const cycle = time % 4;
      const r1 = 0.5 + m1 * 0.06;
      const r2 = 0.5 + m2 * 0.06;

      let x1 = 0;
      let x2 = 0;
      if (cycle < 2) {
        // Approaching collision at t = 2
        x1 = -(2 - cycle) * (u1 * 0.35) - r1;
        x2 = r2;
      } else {
        const dt = cycle - 2;
        x1 = -r1 + dt * (v1 * 0.35);
        x2 = r2 + dt * (v2 * 0.35);
      }

      const sphere1 = new THREE.Mesh(
        new THREE.SphereGeometry(r1, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.4, roughness: 0.2, clippingPlanes: clipPlanes })
      );
      sphere1.position.set(x1, r1, 0);
      group.add(sphere1);

      const sphere2 = new THREE.Mesh(
        new THREE.SphereGeometry(r2, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.4, roughness: 0.2, clippingPlanes: clipPlanes })
      );
      sphere2.position.set(x2, r2, 0);
      group.add(sphere2);

      const curV1 = cycle < 2 ? u1 : v1;
      const curV2 = cycle < 2 ? 0 : v2;

      if (visibleVectors.p1 && Math.abs(curV1) > 0.1) {
        makeArrow(
          new THREE.Vector3(x1, r1 * 2 + 0.3, 0),
          new THREE.Vector3(curV1 >= 0 ? 1 : -1, 0, 0),
          Math.abs(m1 * curV1) * 0.08,
          0x22d3ee
        );
      }
      if (visibleVectors.p2 && Math.abs(curV2) > 0.1) {
        makeArrow(
          new THREE.Vector3(x2, r2 * 2 + 0.3, 0),
          new THREE.Vector3(curV2 >= 0 ? 1 : -1, 0, 0),
          Math.abs(m2 * curV2) * 0.08,
          0xf59e0b
        );
      }
    }

    // =========================================================================
    // 1.6 การเคลื่อนที่แบบโปรเจกไทล์ 3 มิติ (3D Cannon & Trajectory Arc)
    // =========================================================================
    else if (moduleId === 'mech-06-projectile') {
      const u = params.u ?? 25;
      const theta = params.theta ?? 45;
      const g = params.g ?? 9.8;
      const rad = (theta * Math.PI) / 180;
      const ux = u * Math.cos(rad);
      const uy = u * Math.sin(rad);
      const tTotal = (2 * uy) / g;
      const scale = 0.18;
      const startX = -8;

      // 3D Cannon Base & Barrel
      const cannonGroup = new THREE.Group();
      cannonGroup.position.set(startX, 0.5, 0);
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.38, 1.8, 20),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 })
      );
      barrel.rotation.z = rad - Math.PI / 2;
      cannonGroup.add(barrel);
      group.add(cannonGroup);

      // Trajectory Arch Curve + Target Ring at 55m
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 50; i++) {
        const ti = (i / 50) * tTotal;
        const px = startX + ux * ti * scale;
        const py = Math.max(0, uy * ti - 0.5 * g * ti * ti) * scale + 0.5;
        pts.push(new THREE.Vector3(px, py, 0));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
      group.add(new THREE.Line(lineGeo, lineMat));

      // Target Ring at 55.0 m
      const targetRing = new THREE.Mesh(
        new THREE.RingGeometry(0.4, 0.75, 32),
        new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide })
      );
      targetRing.rotation.x = Math.PI / 2;
      targetRing.position.set(startX + 55.0 * scale, 0.05, 0);
      group.add(targetRing);

      // Projectile Ball
      const activeT = Math.min(time % (tTotal + 0.6), tTotal);
      const bx = startX + ux * activeT * scale;
      const by = Math.max(0, uy * activeT - 0.5 * g * activeT * activeT) * scale + 0.5;
      const vy = activeT >= tTotal ? 0 : uy - g * activeT;

      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x78350f })
      );
      ball.position.set(bx, by, 0);
      group.add(ball);

      const ballPos = new THREE.Vector3(bx, by, 0);
      if (visibleVectors.vx) {
        makeArrow(ballPos, new THREE.Vector3(1, 0, 0), ux * 0.12, 0x22d3ee);
      }
      if (visibleVectors.vy && Math.abs(vy) > 0.3) {
        makeArrow(ballPos, new THREE.Vector3(0, vy >= 0 ? 1 : -1, 0), Math.abs(vy) * 0.12, 0xf59e0b);
      }
      if (visibleVectors.v) {
        makeArrow(
          ballPos,
          new THREE.Vector3(ux, vy, 0),
          Math.sqrt(ux * ux + vy * vy) * 0.12,
          0x10b981
        );
      }
    }

    // =========================================================================
    // 2.1 ถังคลื่นน้ำ 3 มิติ (3D Ripple Tank Wave Interference Surface)
    // =========================================================================
    else if (moduleId === 'wave-01-ripple') {
      const freq = params.freq ?? 4;
      const dist = params.dist ?? 8;
      const speed = params.speed ?? 12;
      const lambda = speed / freq;
      const k = (2 * Math.PI) / lambda;

      const planeGeo = new THREE.PlaneGeometry(16, 16, 75, 75);
      planeGeo.rotateX(-Math.PI / 2);
      const posAttr = planeGeo.attributes.position;
      const s1x = -dist * 0.35;
      const s2x = dist * 0.35;
      const sZ = -5;

      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vz = posAttr.getZ(i);
        const r1 = Math.hypot(vx - s1x, vz - sZ) + 0.1;
        const r2 = Math.hypot(vx - s2x, vz - sZ) + 0.1;
        const y =
          0.32 *
          (Math.sin(k * r1 - freq * time * 2.5) / Math.sqrt(r1 * 0.5 + 1) +
            Math.sin(k * r2 - freq * time * 2.5) / Math.sqrt(r2 * 0.5 + 1));
        posAttr.setY(i, y);
      }
      planeGeo.computeVertexNormals();

      const waterMesh = new THREE.Mesh(
        planeGeo,
        new THREE.MeshStandardMaterial({
          color: 0x0ea5e9,
          metalness: 0.4,
          roughness: 0.2,
          side: THREE.DoubleSide,
          wireframe: crossSection,
        })
      );
      waterMesh.position.y = 1.2;
      group.add(waterMesh);

      // Two Coherent Dipper Spheres
      [s1x, s2x].forEach((sx) => {
        const dipper = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 20, 20),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xb45309 })
        );
        dipper.position.set(sx, 1.5, sZ);
        group.add(dipper);
      });
    }

    // =========================================================================
    // 2.2 ท่อเรโซแนนซ์เสียง 3 มิติ (3D Acoustic Resonance Tube & Air Particles)
    // =========================================================================
    else if (moduleId === 'wave-02-sound') {
      const harmonic = params.harmonic ?? 2;
      const tubeL = params.tubeL ?? 1.7;
      const scaledL = tubeL * 5.5;

      const tubeMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.3, scaledL, 32, 1, true),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
          clippingPlanes: clipPlanes,
        })
      );
      tubeMesh.rotation.z = Math.PI / 2;
      tubeMesh.position.y = 2.2;
      group.add(tubeMesh);

      // 3D Oscillating Air Molecules inside the tube + Standing Wave Envelope
      const numSlices = 28;
      for (let i = 0; i <= numSlices; i++) {
        const frac = i / numSlices; // 0 to 1
        const baseX = (frac - 0.5) * scaledL;
        const standingAmp = Math.cos(harmonic * Math.PI * frac);
        const dx = standingAmp * Math.cos(time * 5) * 0.45;

        for (let ring = 0; ring < 5; ring++) {
          const ang = (ring / 5) * Math.PI * 2;
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 12, 12),
            new THREE.MeshStandardMaterial({
              color: Math.abs(standingAmp) > 0.7 ? 0xf59e0b : 0x22d3ee,
            })
          );
          dot.position.set(baseX + dx, 2.2 + Math.cos(ang) * 0.65, Math.sin(ang) * 0.65);
          group.add(dot);
        }
      }
    }

    // =========================================================================
    // 2.3 ม้านั่งทดลองเลนส์และรังสีแสง 3 มิติ (3D Ray Optics Bench)
    // =========================================================================
    else if (moduleId === 'wave-03-optics') {
      const f = params.f === 0 ? 5 : (params.f ?? 15);
      const s = params.s ?? 30;
      const hObj = params.hObj ?? 6;
      const scale = 0.2;

      // Optical Axis Rail
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(24, 0.15, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      rail.position.y = 2.0;
      group.add(rail);

      // 3D Glass Lens at x = 0
      const lensGeo = new THREE.SphereGeometry(2.2, 32, 32);
      lensGeo.scale(f > 0 ? 0.18 : 0.12, 1, 1);
      const lensMat = new THREE.MeshStandardMaterial({
        color: f > 0 ? 0x38bdf8 : 0xa855f7,
        transparent: true,
        opacity: 0.55,
        roughness: 0.1,
      });
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.set(0, 2.0, 0);
      group.add(lens);

      // Object Arrow at x = -s * scale
      const objX = -s * scale;
      const objH = hObj * scale;
      makeArrow(new THREE.Vector3(objX, 2.0, 0), new THREE.Vector3(0, 1, 0), objH, 0x22d3ee);

      // Image Arrow at x = sPrime * scale
      const denom = s - f;
      if (Math.abs(denom) > 0.5) {
        const sPrime = (s * f) / denom;
        const mag = -sPrime / s;
        const imgX = Math.max(-11, Math.min(11, sPrime * scale));
        const imgH = mag * objH;
        makeArrow(
          new THREE.Vector3(imgX, 2.0, 0),
          new THREE.Vector3(0, imgH >= 0 ? 1 : -1, 0),
          Math.abs(imgH),
          sPrime > 0 ? 0x10b981 : 0xa855f7
        );

        // Principal 3D Light Rays
        if (visibleVectors.rays) {
          const objTip = new THREE.Vector3(objX, 2.0 + objH, 0);
          const lensTop = new THREE.Vector3(0, 2.0 + objH, 0);
          const lensCenter = new THREE.Vector3(0, 2.0, 0);
          const imgTip = new THREE.Vector3(imgX, 2.0 + imgH, 0);

          const rayMat = new THREE.LineBasicMaterial({ color: 0xf59e0b });
          group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([objTip, lensTop, imgTip]), rayMat));
          group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([objTip, lensCenter, imgTip]), rayMat));
        }
      }
    }

    // =========================================================================
    // 2.4 สลิตคู่ของยังและเลเซอร์ 3 มิติ (3D Young's Double Slit Laser Lab)
    // =========================================================================
    else if (moduleId === 'wave-04-doubleslit') {
      const wavelength = params.wavelength ?? 650;
      const slitD = params.slitD ?? 0.25;
      const screenL = params.screenL ?? 2.0;
      const laserColor = wavelengthToHex(wavelength);

      // Laser Emitter at x = -6
      const emitter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 1.8, 20),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
      );
      emitter.rotation.z = Math.PI / 2;
      emitter.position.set(-6, 2.2, 0);
      group.add(emitter);

      // Double Slit Plate at x = -2
      const slitPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 3.2, 4.5),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      slitPlate.position.set(-2, 2.2, 0);
      group.add(slitPlate);

      // Observation Screen at x = -2 + screenL * 3.5
      const screenX = -2 + screenL * 3.2;
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 3.8, 7.5),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      screen.position.set(screenX, 2.2, 0);
      group.add(screen);

      // Interference Bright Fringes on the 3D Screen
      const deltaXmm = ((wavelength * 1e-9 * screenL) / (slitD * 1e-3)) * 1000;
      const fringeSpacing3D = deltaXmm * 0.16;
      for (let m = -4; m <= 4; m++) {
        const fz = m * fringeSpacing3D;
        if (Math.abs(fz) < 3.4) {
          const fringe = new THREE.Mesh(
            new THREE.BoxGeometry(0.24, 2.8, Math.max(0.14, fringeSpacing3D * 0.45)),
            new THREE.MeshBasicMaterial({ color: laserColor })
          );
          fringe.position.set(screenX - 0.05, 2.2, fz);
          group.add(fringe);
        }
      }

      // Laser Beam Cone
      const beamLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-5.1, 2.2, 0),
          new THREE.Vector3(-2, 2.2, 0),
          new THREE.Vector3(screenX, 2.2, 0),
        ]),
        new THREE.LineBasicMaterial({ color: laserColor })
      );
      group.add(beamLine);
    }

    // =========================================================================
    // 3.1 ไฟฟ้าสถิตและสนามไฟฟ้า 3 มิติ (3D Electrostatic Charges & Field Lines)
    // =========================================================================
    else if (moduleId === 'em-01-coulomb') {
      const q1 = params.q1 ?? 6;
      const q2 = params.q2 ?? -6;
      const r = params.r ?? 0.6;
      const sep = r * 4.5;

      const p1 = new THREE.Vector3(-sep / 2, 2.5, 0);
      const p2 = new THREE.Vector3(sep / 2, 2.5, 0);

      const s1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 32, 32),
        new THREE.MeshStandardMaterial({
          color: q1 > 0 ? 0xf43f5e : q1 < 0 ? 0x3b82f6 : 0x64748b,
          emissive: q1 > 0 ? 0x881337 : 0x1e3a8a,
          emissiveIntensity: 0.4,
        })
      );
      s1.position.copy(p1);
      group.add(s1);

      const s2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 32, 32),
        new THREE.MeshStandardMaterial({
          color: q2 > 0 ? 0xf43f5e : q2 < 0 ? 0x3b82f6 : 0x64748b,
          emissive: q2 > 0 ? 0x881337 : 0x1e3a8a,
          emissiveIntensity: 0.4,
        })
      );
      s2.position.copy(p2);
      group.add(s2);

      // 3D Electric Field Vectors on a 3D lattice around the charges
      if (visibleVectors.Efield) {
        for (let gx = -6; gx <= 6; gx += 2.4) {
          for (let gy = 0.5; gy <= 4.5; gy += 2.0) {
            for (let gz = -2; gz <= 2; gz += 2.0) {
              const pt = new THREE.Vector3(gx, gy, gz);
              if (pt.distanceTo(p1) < 1.1 || pt.distanceTo(p2) < 1.1) continue;
              const d1 = pt.clone().sub(p1);
              const d2 = pt.clone().sub(p2);
              const E = d1
                .normalize()
                .multiplyScalar(q1 / Math.max(0.5, pt.distanceToSquared(p1)))
                .add(d2.normalize().multiplyScalar(q2 / Math.max(0.5, pt.distanceToSquared(p2))));
              if (E.length() > 0.15) {
                makeArrow(pt, E, Math.min(1.4, E.length() * 0.7), 0x22d3ee);
              }
            }
          }
        }
      }

      if (visibleVectors.Fe && q1 * q2 !== 0) {
        const attract = q1 * q2 < 0;
        makeArrow(p1, new THREE.Vector3(attract ? 1 : -1, 0, 0), 2.0, 0xf59e0b);
        makeArrow(p2, new THREE.Vector3(attract ? -1 : 1, 0, 0), 2.0, 0xf59e0b);
      }
    }

    // =========================================================================
    // 3.2 วงจรไฟฟ้ากระแสตรง 3 มิติ (3D DC Circuit Board & Flowing Electrons)
    // =========================================================================
    else if (moduleId === 'em-02-circuit') {
      const emf = params.emf ?? 12;
      const R1 = params.R1 ?? 4;
      const R2 = params.R2 ?? 8;
      const isParallel = (params.mode ?? 0) >= 0.5;
      const Req = isParallel ? (R1 * R2) / (R1 + R2) : R1 + R2;
      const I = emf / Req;

      // Circuit Breadboard Base
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.25, 8),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
      );
      board.position.y = 0.2;
      group.add(board);

      // Battery 3D Cylinder on Left
      const bat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 2.5, 24),
        new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.5 })
      );
      bat.rotation.x = Math.PI / 2;
      bat.position.set(-4.5, 0.8, 0);
      group.add(bat);

      // Resistors R1 & R2 + Glowing Lamp
      const r1Mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 2.0, 20),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
      );
      r1Mesh.rotation.z = Math.PI / 2;
      r1Mesh.position.set(0, 0.8, isParallel ? -1.5 : -2.5);
      group.add(r1Mesh);

      const r2Mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 2.0, 20),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b })
      );
      r2Mesh.rotation.z = Math.PI / 2;
      r2Mesh.position.set(isParallel ? 0 : 3.5, 0.8, isParallel ? 1.5 : 0);
      group.add(r2Mesh);

      // Moving Current Charge Spheres around loop
      const numCharges = 16;
      for (let i = 0; i < numCharges; i++) {
        const prog = ((i / numCharges) + time * I * 0.08) % 1;
        const ang = prog * Math.PI * 2;
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0xfde047 })
        );
        dot.position.set(Math.cos(ang) * 4.2, 0.8, Math.sin(ang) * 2.5);
        group.add(dot);
      }
    }

    // =========================================================================
    // 3.3 ประจุในสนามแม่เหล็ก 3 มิติ (3D Lorentz Force Helical Trajectory)
    // =========================================================================
    else if (moduleId === 'em-03-lorentz') {
      const B = params.B ?? 2.0;
      const v = params.v ?? 10;
      const pitchAngle = params.pitchAngle ?? 75;
      const rad = (pitchAngle * Math.PI) / 180;
      const vPerp = v * Math.sin(rad);
      const vPara = v * Math.cos(rad);
      const R = Math.max(0.4, vPerp / B);

      // 3D Helical Path along Y-axis (Magnetic Field B direction = +Y)
      const helixPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 140; i++) {
        const ti = (i / 140) * 6;
        const hx = R * Math.cos(B * ti);
        const hz = R * Math.sin(B * ti);
        const hy = 0.5 + vPara * ti * 0.25;
        helixPts.push(new THREE.Vector3(hx, hy, hz));
      }
      group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(helixPts),
          new THREE.LineBasicMaterial({ color: 0x38bdf8 })
        )
      );

      // Vertical Magnetic Field Pillars (B field)
      if (visibleVectors.BVec) {
        [-3, 0, 3].forEach((bx) => {
          makeArrow(new THREE.Vector3(bx, 0.2, 0), new THREE.Vector3(0, 1, 0), 6.0, 0xa855f7);
        });
      }

      // Charged Particle moving along the 3D helix
      const curT = (time * 1.5) % 6;
      const px = R * Math.cos(B * curT);
      const pz = R * Math.sin(B * curT);
      const py = 0.5 + vPara * curT * 0.25;
      const pPos = new THREE.Vector3(px, py, pz);

      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0x9f1239 })
      );
      particle.position.copy(pPos);
      group.add(particle);

      if (visibleVectors.vVec) {
        const vDir = new THREE.Vector3(-Math.sin(B * curT) * vPerp, vPara * 0.25, Math.cos(B * curT) * vPerp);
        makeArrow(pPos, vDir, 2.2, 0x22d3ee);
      }
      if (visibleVectors.FBVec) {
        const fDir = new THREE.Vector3(-px, 0, -pz);
        makeArrow(pPos, fDir, 2.0, 0xf43f5e);
      }
    }

    // =========================================================================
    // 3.4 การเหนี่ยวนำแม่เหล็กไฟฟ้าและไดนาโม 3 มิติ (3D AC Generator & Faraday)
    // =========================================================================
    else if (moduleId === 'em-04-faraday') {
      const freq = params.freq ?? 50;

      // North & South Magnet Poles
      const northPole = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 3.5, 2.5),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e })
      );
      northPole.position.set(-4.2, 2.5, 0);
      group.add(northPole);

      const southPole = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 3.5, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
      );
      southPole.position.set(4.2, 2.5, 0);
      group.add(southPole);

      // Rotating 3D Armature Coil
      const coilGroup = new THREE.Group();
      coilGroup.position.set(0, 2.5, 0);
      coilGroup.rotation.z = time * (freq * 0.08);

      const coilFrame = new THREE.Mesh(
        new THREE.TorusGeometry(2.0, 0.16, 16, 48),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 })
      );
      coilFrame.rotation.x = Math.PI / 2;
      coilGroup.add(coilFrame);
      group.add(coilGroup);

      if (visibleVectors.flux) {
        makeArrow(new THREE.Vector3(-2.8, 2.5, 0), new THREE.Vector3(1, 0, 0), 5.5, 0x22d3ee);
      }
    }

    // =========================================================================
    // 4.1 กระบอกสูบแก๊สอุดมคติ 3 มิติ (3D Kinetic Gas Chamber & Piston)
    // =========================================================================
    else if (moduleId === 'thermo-01-gas') {
      const tempK = params.tempK ?? 300;
      const volume = params.volume ?? 20;
      const moles = params.moles ?? 1.0;

      const chamberH = Math.max(1.5, volume * 0.22);

      // Transparent Glass Cylinder
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(2.8, 2.8, chamberH, 32, 1, true),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
          clippingPlanes: clipPlanes,
        })
      );
      cyl.position.y = chamberH / 2;
      group.add(cyl);

      // Movable Top Piston
      const piston = new THREE.Mesh(
        new THREE.CylinderGeometry(2.75, 2.75, 0.45, 32),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, clippingPlanes: clipPlanes })
      );
      piston.position.y = chamberH + 0.22;
      group.add(piston);

      // 3D Gas Atoms bouncing inside
      const numParticles = Math.min(60, Math.round(moles * 24));
      const speedFactor = Math.sqrt(tempK / 300) * 3.2;
      const atomColor = tempK > 500 ? 0xf43f5e : tempK > 300 ? 0xf59e0b : 0x22d3ee;

      for (let i = 0; i < numParticles; i++) {
        const px = Math.sin(i * 17.3 + time * speedFactor * (1 + (i % 3) * 0.2)) * 2.2;
        const py =
          0.3 +
          Math.abs(Math.cos(i * 23.1 + time * speedFactor * (1.1 + (i % 4) * 0.15))) *
            Math.max(0.8, chamberH - 0.6);
        const pz = Math.cos(i * 31.7 + time * speedFactor * 0.9) * 2.2;

        const atom = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 12, 12),
          new THREE.MeshStandardMaterial({ color: atomColor })
        );
        atom.position.set(px, py, pz);
        group.add(atom);
      }
    }

    // =========================================================================
    // 4.2 ของแข็งและสภาพยืดหยุ่น (3D Tensile Testing Machine & Young's Modulus)
    // =========================================================================
    else if (moduleId === 'thermo-02-elasticity') {
      const force = params.force ?? 15;
      const area = params.area ?? 50;
      const matE = params.matE ?? 200;

      const stress = (force * 1000) / area;
      const stretchVisual = (stress / matE) * 0.45;
      const radius = 0.2 + Math.sqrt(area) * 0.04;

      const rodLen = 4.5 + stretchVisual;
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.85, radius, rodLen, 28),
        new THREE.MeshStandardMaterial({
          color: stress > 500 ? 0xf43f5e : 0x38bdf8,
          metalness: 0.7,
          roughness: 0.2,
          clippingPlanes: clipPlanes,
        })
      );
      rod.rotation.z = Math.PI / 2;
      rod.position.y = 2.5;
      group.add(rod);

      if (visibleVectors.Fpull) {
        makeArrow(new THREE.Vector3(rodLen / 2, 2.5, 0), new THREE.Vector3(1, 0, 0), 1 + force * 0.06, 0xf43f5e);
        makeArrow(new THREE.Vector3(-rodLen / 2, 2.5, 0), new THREE.Vector3(-1, 0, 0), 1 + force * 0.06, 0xf43f5e);
      }
    }

    // =========================================================================
    // 4.3 พลศาสตร์ของไหลและท่อเวนจูรี 3 มิติ (3D Venturi Tube & Streamlines)
    // =========================================================================
    else if (moduleId === 'thermo-03-fluid') {
      const v1 = params.v1 ?? 2.0;
      const areaRatio = params.areaRatio ?? 2.5;
      const rWide = 2.0;
      const rThroat = Math.max(0.65, rWide / Math.sqrt(areaRatio));

      // Construct 3D Venturi Profile via LatheGeometry
      const lathePts: THREE.Vector2[] = [];
      for (let i = 0; i <= 40; i++) {
        const x = (i / 40 - 0.5) * 14;
        const neck = Math.exp(-(x * x) / 6);
        const r = rWide - (rWide - rThroat) * neck;
        lathePts.push(new THREE.Vector2(r, x));
      }
      const venturiGeo = new THREE.LatheGeometry(lathePts, 32);
      venturiGeo.rotateZ(Math.PI / 2);
      const venturiMesh = new THREE.Mesh(
        venturiGeo,
        new THREE.MeshStandardMaterial({
          color: 0x0ea5e9,
          transparent: true,
          opacity: 0.28,
          side: THREE.DoubleSide,
          clippingPlanes: clipPlanes,
        })
      );
      venturiMesh.position.y = 2.6;
      group.add(venturiMesh);

      // Streamline Particles accelerating through the narrow throat
      for (let i = 0; i < 24; i++) {
        const lane = (i % 3) - 1;
        const rawProg = ((i / 24) + time * v1 * 0.12) % 1;
        const px = (rawProg - 0.5) * 13;
        const neck = Math.exp(-(px * px) / 6);
        const curR = rWide - (rWide - rThroat) * neck;

        const drop = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 12, 12),
          new THREE.MeshBasicMaterial({ color: neck > 0.5 ? 0xf59e0b : 0x22d3ee })
        );
        drop.position.set(px, 2.6 + lane * curR * 0.45, 0);
        group.add(drop);
      }
    }

    // =========================================================================
    // 5.1 คลื่นแม่เหล็กไฟฟ้า 3 มิติ (3D Orthogonal E and B Wave Vectors)
    // =========================================================================
    else if (moduleId === 'mod-01-emwave') {
      const freqGHz = params.freqGHz ?? 10;
      const E0 = params.E0 ?? 120;
      const amp = (E0 / 120) * 2.2;
      const k = freqGHz * 0.08;

      for (let i = 0; i <= 48; i++) {
        const x = (i / 48 - 0.5) * 16;
        const val = Math.sin(k * (x + 8) - time * 4) * amp;
        const origin = new THREE.Vector3(x, 2.5, 0);

        if (visibleVectors.Evec && Math.abs(val) > 0.15) {
          makeArrow(origin, new THREE.Vector3(0, val >= 0 ? 1 : -1, 0), Math.abs(val), 0x22d3ee);
        }
        if (visibleVectors.Bvec && Math.abs(val) > 0.15) {
          makeArrow(origin, new THREE.Vector3(0, 0, val >= 0 ? 1 : -1), Math.abs(val), 0xf43f5e);
        }
      }
    }

    // =========================================================================
    // 5.2 ฟิสิกส์อะตอมและโฟโตอิเล็กทริก 3 มิติ (3D Bohr Atom & Photoelectric)
    // =========================================================================
    else if (moduleId === 'mod-02-quantum') {
      const wavelength = params.wavelength ?? 350;
      const workFunc = params.workFunc ?? 2.3;
      const orbitN = params.orbitN ?? 2;
      const Ephoton = 1240 / wavelength;
      const ejected = Ephoton >= workFunc;

      // Central Nucleus
      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0x9f1239 })
      );
      nucleus.position.set(0, 2.8, 0);
      group.add(nucleus);

      // 4 Bohr Energy Shells + Orbiting Electron at n = orbitN
      for (let n = 1; n <= 4; n++) {
        const rOrbit = n * 1.1;
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(rOrbit - 0.03, rOrbit + 0.03, 64),
          new THREE.MeshBasicMaterial({
            color: n === orbitN ? 0x22d3ee : 0x334155,
            side: THREE.DoubleSide,
          })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0, 2.8, 0);
        group.add(ring);
      }

      const activeR = orbitN * 1.1;
      const eAngle = time * (4 / orbitN);
      const electron = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee })
      );
      electron.position.set(
        Math.cos(eAngle) * activeR,
        2.8 + (ejected ? Math.sin(time * 3) * 0.8 : 0),
        Math.sin(eAngle) * activeR
      );
      group.add(electron);

      // Incoming Photon Beam
      if (visibleVectors.photon) {
        makeArrow(
          new THREE.Vector3(-5.5, 4.5, 0),
          new THREE.Vector3(1, -0.4, 0),
          3.5,
          wavelengthToHex(wavelength)
        );
      }
      if (visibleVectors.electron && ejected) {
        makeArrow(new THREE.Vector3(1.5, 3.0, 0), new THREE.Vector3(1, 0.5, 0), 3.0, 0x22d3ee);
      }
    }

    // =========================================================================
    // 5.3 ฟิสิกส์นิวเคลียร์และเตาปฏิกรณ์ 3 มิติ (3D Nucleus & Control Rods)
    // =========================================================================
    else if (moduleId === 'mod-03-nuclear') {
      const halfLife = params.halfLife ?? 3.0;
      const elapsedT = params.elapsedT ?? 6.0;
      const controlRod = params.controlRod ?? 50;
      const remainingFrac = Math.pow(0.5, elapsedT / halfLife);

      // 3D Cluster of 32 Nucleons (Undecayed = Emerald/Cyan, Decayed = Slate/Rose)
      const totalNucleons = 32;
      const activeCount = Math.round(totalNucleons * remainingFrac);

      for (let i = 0; i < totalNucleons; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / totalNucleons);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const rad = 1.6;
        const isUndecayed = i < activeCount;

        const nucleon = new THREE.Mesh(
          new THREE.SphereGeometry(0.38, 16, 16),
          new THREE.MeshStandardMaterial({
            color: isUndecayed ? (i % 2 === 0 ? 0x10b981 : 0x22d3ee) : 0x475569,
            emissive: isUndecayed ? 0x064e3b : 0x0f172a,
          })
        );
        nucleon.position.set(
          Math.cos(theta) * Math.sin(phi) * rad,
          2.6 + Math.sin(theta) * Math.sin(phi) * rad,
          Math.cos(phi) * rad
        );
        group.add(nucleon);
      }

      // 3D Boron Control Rods descending from top according to controlRod %
      const rodY = 5.5 - (controlRod / 100) * 2.5;
      [-2.8, 2.8].forEach((rx) => {
        const rod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 3.5, 20),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7 })
        );
        rod.position.set(rx, rodY, 0);
        group.add(rod);
      });
    }
  }, [moduleId, params, time, visibleVectors, crossSection]);

  return <div ref={containerRef} className="w-full h-full relative" />;
};
