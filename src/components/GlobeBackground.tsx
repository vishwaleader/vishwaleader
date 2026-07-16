"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Settings ───────────────────────────────────────────────────────── */
interface GlobeSettings {
  earthRotationSpeed: number;
  cloudRotationSpeed: number;
  autoRotateSpeed: number;
  glowIntensity: number;
  glowFade: number;
  glowColorHex: string;
  cloudOpacity: number;
  sunIntensity: number;
  bumpScale: number;
}

const DEFAULT_G1: GlobeSettings = {
  earthRotationSpeed: 0.00035, cloudRotationSpeed: 0.00055,
  autoRotateSpeed: 0.45, glowIntensity: 0.52, glowFade: 9,
  glowColorHex: "#6eb5e8", cloudOpacity: 0.72, sunIntensity: 3.5, bumpScale: 0.05,
};
const DEFAULT_G2: GlobeSettings = {
  earthRotationSpeed: 0, cloudRotationSpeed: 0.00025,
  autoRotateSpeed: 0.3, glowIntensity: 0.58, glowFade: 8,
  glowColorHex: "#0099ff", cloudOpacity: 1, sunIntensity: 1.0, bumpScale: 0.04,
};

interface SceneRefs {
  surfaceMat?: any; cloudsMat?: any; glowMat?: any;
  sunLight?: any; sunLights?: any[]; controls?: any;
  worldRotationPoint?: any;
}

interface Props { isAdmin?: boolean; }

const getUTCDegrees = () => {
  const d = new Date();
  return ((d.getUTCHours() * 60 + d.getUTCMinutes()) / 3.9907) + 90;
};

/* ═══════════════════════════════════════════════════════════════════════ */
export default function GlobeBackground({ isAdmin = false }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  const [preset, setPreset] = useState<1 | 2>(() => {
    try { return Number(localStorage.getItem("vl_globe_preset") ?? "1") as 1 | 2; } catch { return 1; }
  });
  const presetRef = useRef<1 | 2>(preset);

  const getInitialSettings = (): GlobeSettings => {
    try {
      const saved = localStorage.getItem("vl_globe_settings");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return preset === 1 ? { ...DEFAULT_G1 } : { ...DEFAULT_G2 };
  };

  const settingsRef = useRef<GlobeSettings>(getInitialSettings());
  const [settings, setSettings] = useState<GlobeSettings>(getInitialSettings());
  const [panelOpen, setPanelOpen] = useState(false);
  const sceneRefs = useRef<SceneRefs>({});

  /* ── Parallax input refs ──────────────────────────────────────────── */
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);        // 0..1 progress within hero
  const lerpRef  = useRef({ x: 0, y: 0, s: 0 }); // smoothed values

  const applyToScene = useCallback((key: string, value: any) => {
    const r = sceneRefs.current;
    if (key === "glowIntensity" && r.glowMat?.uniforms?.c) r.glowMat.uniforms.c.value = value;
    if (key === "glowFade"      && r.glowMat?.uniforms?.p) r.glowMat.uniforms.p.value = value;
    if (key === "glowColorHex"  && r.glowMat?.uniforms?.glowColor)
      r.glowMat.uniforms.glowColor.value.set(value);
    if (key === "cloudOpacity"  && r.cloudsMat) r.cloudsMat.opacity = value;
    if (key === "sunIntensity"  && r.sunLight)  r.sunLight.intensity = value;
    if (key === "sunIntensity"  && r.sunLights) r.sunLights.forEach(l => l.intensity = value * 0.6);
    if (key === "bumpScale"     && r.surfaceMat) r.surfaceMat.bumpScale = value;
    if (key === "autoRotateSpeed" && r.controls) r.controls.autoRotateSpeed = value;
  }, []);

  const updateSetting = useCallback(<K extends keyof GlobeSettings>(key: K, val: GlobeSettings[K]) => {
    settingsRef.current = { ...settingsRef.current, [key]: val };
    setSettings(prev => ({ ...prev, [key]: val }));
    applyToScene(key, val);
  }, [applyToScene]);

  const switchPreset = useCallback((p: 1 | 2) => {
    presetRef.current = p;
    const d = p === 1 ? DEFAULT_G1 : DEFAULT_G2;
    settingsRef.current = { ...d };
    setSettings({ ...d });
    setPreset(p);
  }, []);

  const resetDefaults = useCallback(() => {
    const d = presetRef.current === 1 ? { ...DEFAULT_G1 } : { ...DEFAULT_G2 };
    settingsRef.current = d;
    setSettings(d);
    Object.keys(d).forEach(k => applyToScene(k, (d as any)[k]));
  }, [applyToScene]);

  /* ── Helper: procedural nebula texture ───────────────────────────── */
  const makeNebulaTexture = (color: string, size = 256) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    g.addColorStop(0,   color.replace(")", ",0.35)").replace("rgb", "rgba"));
    g.addColorStop(0.5, color.replace(")", ",0.12)").replace("rgb", "rgba"));
    g.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return canvas;
  };

  /* ══════════════════════════════════════════════════════════════════
     Main Three.js effect
  ════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    let animId: number;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const run = async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      (window as any).__THREE__ = THREE;

      const mount = mountRef.current;
      if (!mount || cancelled) return;

      const W = mount.clientWidth  || window.innerWidth;
      const H = mount.clientHeight || window.innerHeight;

      /* ── Renderer ─────────────────────────────────────────────── */
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      /* ── Scene & Camera ──────────────────────────────────────── */
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);

      const onResize = () => {
        const el = mountRef.current; if (!el) return;
        camera.aspect = el.clientWidth / el.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(el.clientWidth, el.clientHeight);
      };
      window.addEventListener("resize", onResize);

      /* ── Mouse parallax ────────────────────────────────────────── */
      const onMouseMove = (e: MouseEvent) => {
        const r = mount.getBoundingClientRect();
        mouseRef.current.x =  (e.clientX - r.left)  / r.width  * 2 - 1;
        mouseRef.current.y = -((e.clientY - r.top)   / r.height * 2 - 1);
      };
      mount.addEventListener("mousemove", onMouseMove);

      /* ── Scroll parallax ──────────────────────────────────────── */
      const onScroll = () => {
        const heroH = mount.offsetHeight || window.innerHeight;
        scrollRef.current = Math.min(window.scrollY / heroH, 1);
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      /* ══════════════════════════════════════════════════════════
         GLOBE 1
      ═══════════════════════════════════════════════════════════ */
      if (presetRef.current === 1) {
        /* Camera initial position */
        camera.position.set(0.4, 0.2, 2.0);

        /* ── Lights ─────────────────────────────────────── */
        scene.add(new THREE.AmbientLight(0xffffff, 0.08));

        // Main sun (warm front-fill)
        const sunLight = new THREE.DirectionalLight(0xfff0d0, settingsRef.current.sunIntensity);
        sunLight.position.set(4, 2, 3);
        scene.add(sunLight);
        sceneRefs.current.sunLight = sunLight;

        // Cool rim backlight (creates depth)
        const rimLight = new THREE.DirectionalLight(0x4488ff, 0.6);
        rimLight.position.set(-3, -1, -2);
        scene.add(rimLight);

        /* ── Multi-layer starfield ──────────────────────── */
        const addStars = (count: number, spread: number, size: number, opacity: number) => {
          const pos = new Float32Array(count * 3);
          for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * spread;
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
          scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
            color: 0xffffff, size, transparent: true, opacity, sizeAttenuation: true,
          })));
        };
        addStars(5000, 900, 0.5, 0.85);   // background — small
        addStars(1500, 600, 0.9, 0.70);   // mid — medium
        addStars(300,  400, 1.4, 0.95);   // foreground — bright
        // Faint coloured stars
        const colPos = new Float32Array(400 * 3);
        const colColors = new Float32Array(400 * 3);
        for (let i = 0; i < 400; i++) {
          colPos[i*3]   = (Math.random()-0.5)*700;
          colPos[i*3+1] = (Math.random()-0.5)*700;
          colPos[i*3+2] = (Math.random()-0.5)*700;
          const h = Math.random();
          const c = new THREE.Color().setHSL(h, 0.6, 0.7);
          colColors[i*3] = c.r; colColors[i*3+1] = c.g; colColors[i*3+2] = c.b;
        }
        const colGeo = new THREE.BufferGeometry();
        colGeo.setAttribute("position", new THREE.BufferAttribute(colPos, 3));
        colGeo.setAttribute("color",    new THREE.BufferAttribute(colColors, 3));
        scene.add(new THREE.Points(colGeo, new THREE.PointsMaterial({
          vertexColors: true, size: 1.2, transparent: true, opacity: 0.8, sizeAttenuation: true,
        })));

        /* ── Nebula sprites ─────────────────────────────── */
        const nebulaDefs = [
          { color: "rgb(30,10,60)",  x: -180, y: 60,  z: -350, sx: 300, sy: 220 },
          { color: "rgb(0,20,60)",   x:  150, y: -80, z: -400, sx: 280, sy: 200 },
          { color: "rgb(10,40,30)",  x:  -80, y: 120, z: -300, sx: 240, sy: 180 },
          { color: "rgb(50,10,40)",  x:  200, y:  30, z: -380, sx: 260, sy: 190 },
          { color: "rgb(0,30,50)",   x: -200, y: -60, z: -320, sx: 220, sy: 160 },
        ];
        const nebulaSprites: any[] = [];
        nebulaDefs.forEach(def => {
          const tex = new THREE.CanvasTexture(makeNebulaTexture(def.color, 256));
          const mat = new THREE.SpriteMaterial({
            map: tex, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          const sprite = new THREE.Sprite(mat);
          sprite.position.set(def.x, def.y, def.z);
          sprite.scale.set(def.sx, def.sy, 1);
          scene.add(sprite);
          nebulaSprites.push(sprite);
        });

        /* ── Earth ──────────────────────────────────────── */
        const RADIUS = 1.1;
        const loader  = new THREE.TextureLoader();

        const surfaceGeo = new THREE.SphereGeometry(RADIUS, 80, 80);
        const surfaceMat = new THREE.MeshPhongMaterial({
          bumpScale: settingsRef.current.bumpScale,
          specular: new THREE.Color(0x999999), shininess: 18,
        });
        loader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthmap1k.jpg",
          t => { surfaceMat.map = t; surfaceMat.needsUpdate = true; });
        loader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthbump1k.jpg",
          t => { surfaceMat.bumpMap = t; surfaceMat.needsUpdate = true; });
        loader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthspec1k.jpg",
          t => { surfaceMat.specularMap = t; surfaceMat.needsUpdate = true; });
        const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
        sceneRefs.current.surfaceMat = surfaceMat;

        /* Clouds */
        const cloudsGeo = new THREE.SphereGeometry(RADIUS + 0.008, 80, 80);
        const cloudsMat = new THREE.MeshPhongMaterial({
          transparent: true, opacity: settingsRef.current.cloudOpacity,
          side: THREE.DoubleSide, depthWrite: false,
        });
        loader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmap.jpg",
          t => { cloudsMat.map = t; cloudsMat.needsUpdate = true; });
        loader.load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthcloudmaptrans.jpg",
          t => { cloudsMat.alphaMap = t; cloudsMat.needsUpdate = true; });
        const clouds = new THREE.Mesh(cloudsGeo, cloudsMat);
        sceneRefs.current.cloudsMat = cloudsMat;

        /* Atmospheric glow shader */
        const s = settingsRef.current;
        const glowGeo = new THREE.SphereGeometry(RADIUS + 0.07, 64, 64);
        const glowMat = new THREE.ShaderMaterial({
          uniforms: {
            c: { value: s.glowIntensity }, p: { value: s.glowFade },
            glowColor: { value: new THREE.Color(s.glowColorHex) },
            viewVector: { value: camera.position.clone() },
          },
          vertexShader: `
            uniform vec3 viewVector; uniform float c; uniform float p; varying float intensity;
            void main() {
              vec3 vN = normalize(normalMatrix * normal);
              vec3 vE = normalize(normalMatrix * viewVector);
              intensity = pow(c - dot(vN, vE), p);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: `
            uniform vec3 glowColor; varying float intensity;
            void main() { gl_FragColor = vec4(glowColor * intensity, 1.0); }`,
          side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true,
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        sceneRefs.current.glowMat = glowMat;

        /* Globe group — centered, axial tilt */
        const earth = new THREE.Group();
        earth.add(surface, clouds, glowMesh);
        earth.rotation.z = THREE.MathUtils.degToRad(23.4);
        // Position: slightly right of center so left side is free for text
        earth.position.set(0.4, 0, 0);
        scene.add(earth);

        /* ── Render loop ─────────────────────────────────── */
        const BASE_Z = 2.0;
        const BASE_Y = 0.2;

        const tick = () => {
          animId = requestAnimationFrame(tick);
          const cur = settingsRef.current;

          /* Smooth lerp parallax values */
          lerpRef.current.x += (mouseRef.current.x  - lerpRef.current.x) * 0.045;
          lerpRef.current.y += (mouseRef.current.y  - lerpRef.current.y) * 0.045;
          lerpRef.current.s += (scrollRef.current   - lerpRef.current.s) * 0.08;

          const ls = lerpRef.current;

          /* Camera: mouse tilt + scroll zoom-out */
          const targetX = earth.position.x + ls.x * 0.35;
          const targetY = BASE_Y + ls.y * 0.20 - ls.s * 0.5;
          const targetZ = BASE_Z + ls.s * 1.2;

          camera.position.x += (targetX - camera.position.x) * 0.08;
          camera.position.y += (targetY - camera.position.y) * 0.08;
          camera.position.z += (targetZ - camera.position.z) * 0.08;
          camera.lookAt(earth.position);

          /* Globe self-rotation */
          surface.rotation.y += cur.earthRotationSpeed;
          clouds.rotation.y  += cur.cloudRotationSpeed;
          glowMat.uniforms.viewVector.value.copy(camera.position);

          /* Globe subtle mouse-reactive tilt */
          earth.rotation.y += (ls.x * 0.08 - earth.rotation.y) * 0.03;
          earth.rotation.x  = ls.s * 0.1; // tilt forward slightly as scrolled

          /* Nebula slow drift */
          nebulaSprites.forEach((spr, i) => {
            spr.position.x += Math.sin(Date.now() * 0.00002 + i) * 0.03;
            spr.position.y += Math.cos(Date.now() * 0.00002 + i) * 0.02;
          });

          renderer.render(scene, camera);
        };
        tick();

        cleanup = () => {
          window.removeEventListener("resize", onResize);
          mount.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("scroll", onScroll);
          cancelAnimationFrame(animId);
          renderer.dispose();
          if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };

      /* ══════════════════════════════════════════════════════════
         GLOBE 2
      ═══════════════════════════════════════════════════════════ */
      } else {
        const TEXTURE = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/123879/";
        const R = 1.0;
        camera.position.set(0, 0.3, 2.5);

        /* Skybox */
        const cubeLoader = new THREE.CubeTextureLoader();
        cubeLoader.load(
          Array(6).fill(TEXTURE + "test.jpg") as [string,string,string,string,string,string],
          sky => { scene.background = sky; }
        );

        /* Lights */
        scene.add(new THREE.AmbientLight(0x222222, 1.0));
        const mkPL = (i: number, x: number, y: number, z: number) => {
          const l = new THREE.PointLight(0xffeecc, i * settingsRef.current.sunIntensity, 15);
          l.position.set(x, y, z); scene.add(l); return l;
        };
        const sunLights = [
          mkPL(1.0,-4,0,1), mkPL(0.6,-4,0,2.5), mkPL(0.6,-4,0,-1.5),
          mkPL(0.6,-4,1.5,1), mkPL(0.6,-4,-1.5,1),
        ];
        sceneRefs.current = { sunLights };

        const worldRot = new THREE.Object3D();
        scene.add(worldRot);
        worldRot.rotation.z = THREE.MathUtils.degToRad(23.4);
        sceneRefs.current.worldRotationPoint = worldRot;

        const loader = new THREE.TextureLoader();
        const surfGeo = new THREE.SphereGeometry(R, 128, 128);
        const surfMat = new THREE.MeshPhongMaterial({
          color: 0xffffff, shininess: 5,
          specular: new THREE.Color(0x666666),
          bumpScale: settingsRef.current.bumpScale,
        });
        loader.load(TEXTURE+"ColorMap.jpg", t=>{surfMat.map=t;surfMat.needsUpdate=true;});
        loader.load(TEXTURE+"Bump.jpg",     t=>{surfMat.bumpMap=t;surfMat.needsUpdate=true;});
        loader.load(TEXTURE+"SpecMask.jpg", t=>{surfMat.specularMap=t;surfMat.needsUpdate=true;});
        const surface = new THREE.Mesh(surfGeo, surfMat);
        surface.rotation.y = Math.PI;
        worldRot.add(surface);
        sceneRefs.current.surfaceMat = surfMat;

        const cloudsGeo = new THREE.SphereGeometry(R+0.002, 128, 128);
        const cloudsMat = new THREE.MeshPhongMaterial({
          transparent: true, opacity: settingsRef.current.cloudOpacity, depthWrite: false,
        });
        loader.load(TEXTURE+"alphaMap.jpg", t=>{cloudsMat.alphaMap=t;cloudsMat.needsUpdate=true;});
        const clouds = new THREE.Mesh(cloudsGeo, cloudsMat);
        scene.add(clouds);
        sceneRefs.current.cloudsMat = cloudsMat;

        loader.load(TEXTURE+"glow.png", glowTex => {
          const smat = new THREE.SpriteMaterial({
            map: glowTex, color: 0x0099ff, transparent: true, blending: THREE.AdditiveBlending,
          });
          const sp = new THREE.Sprite(smat);
          sp.scale.set(R*2.5, R*2.5, 1);
          scene.add(sp);
        });

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; controls.dampingFactor = 0.05;
        controls.autoRotate = false; controls.enableZoom = true; controls.enablePan = false;
        controls.maxDistance = R*8; controls.minDistance = R*2;
        controls.minPolarAngle = Math.PI*0.1; controls.maxPolarAngle = Math.PI*0.9;
        sceneRefs.current.controls = controls;

        const tick = () => {
          animId = requestAnimationFrame(tick);
          const cur = settingsRef.current;
          worldRot.rotation.y = getUTCDegrees() * Math.PI/180;
          clouds.rotation.y += cur.cloudRotationSpeed;

          /* Globe 2 also has scroll parallax */
          lerpRef.current.s += (scrollRef.current - lerpRef.current.s) * 0.08;
          lerpRef.current.x += (mouseRef.current.x - lerpRef.current.x) * 0.04;
          lerpRef.current.y += (mouseRef.current.y - lerpRef.current.y) * 0.04;

          controls.update();
          renderer.render(scene, camera);
        };
        tick();

        cleanup = () => {
          window.removeEventListener("resize", onResize);
          mount.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("scroll", onScroll);
          cancelAnimationFrame(animId);
          controls.dispose();
          renderer.dispose();
          if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
      }
    };

    run().catch(console.error);
    return () => { cancelled = true; cleanup?.(); sceneRefs.current = {}; };
  }, [preset]);

  /* ═══════════════════════════════════════════════════════════════
     JSX
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div ref={mountRef} className="absolute inset-0 z-0" aria-hidden="true"
         style={{ cursor: "none" }}>

      {/* Vignette edges — frames the globe without burying it */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)"
      }} />
      {/* Minimal left scrim — just enough for text legibility */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: "linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.25) 35%, transparent 60%)"
      }} />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none"
           style={{ background: "linear-gradient(to top, #000 0%, transparent 100%)" }} />

      {/* ── Admin Panel ─────────────────────────────────────────── */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-20 pointer-events-auto select-none">
          <button onClick={() => setPanelOpen(v => !v)}
            className="flex items-center gap-2 bg-black/70 border border-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg backdrop-blur hover:bg-white/10 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
            Globe
          </button>

          {panelOpen && (
            <div className="mt-2 bg-black/88 border border-white/15 rounded-xl backdrop-blur-md shadow-2xl text-white overflow-hidden" style={{ width: 296 }}>
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400">🌍 Globe</span>
                <span className="text-[9px] text-slate-500">Admin</span>
              </div>
              <div className="px-4 py-3 space-y-4 max-h-[72vh] overflow-y-auto">
                {/* Preset */}
                <div className="grid grid-cols-2 gap-2">
                  {([1,2] as const).map(p => (
                    <button key={p} onClick={() => switchPreset(p)}
                      className={`relative rounded-lg border p-2 text-left transition-all ${
                        preset===p ? "border-amber-400/80 bg-amber-400/10" : "border-white/10 bg-white/3 hover:bg-white/8"
                      }`}>
                      <div className="w-full h-10 rounded mb-1.5" style={{
                        background: p===1
                          ? "radial-gradient(circle at 60% 50%, #1a4a8a, #000)"
                          : "radial-gradient(circle at 60% 50%, #001a33, #000)"
                      }} />
                      <p className="text-[10px] font-bold text-white">Globe {p}</p>
                      <p className="text-[9px] text-slate-400">{p===1 ? "Shader glow·Stars" : "Skybox·UTC·Zoom"}</p>
                      {preset===p && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400"/>}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/8" />

                {preset===1 && (<>
                  <PanelSlider label="Earth Rotation" value={settings.earthRotationSpeed}
                    min={0} max={0.003} step={0.00005} fmt={v=>v.toFixed(5)}
                    onChange={v=>updateSetting("earthRotationSpeed",v)}/>
                  <PanelSlider label="Cloud Rotation" value={settings.cloudRotationSpeed}
                    min={0} max={0.005} step={0.00005} fmt={v=>v.toFixed(5)}
                    onChange={v=>updateSetting("cloudRotationSpeed",v)}/>
                  <PanelSlider label="Glow Intensity" value={settings.glowIntensity}
                    min={0} max={1} step={0.01} fmt={v=>v.toFixed(2)}
                    onChange={v=>updateSetting("glowIntensity",v)}/>
                  <PanelSlider label="Glow Fade" value={settings.glowFade}
                    min={1} max={20} step={0.5} fmt={v=>v.toFixed(1)}
                    onChange={v=>updateSetting("glowFade",v)}/>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] text-slate-400">Glow Color</span>
                      <span className="text-[10px] font-mono text-slate-300">{settings.glowColorHex}</span>
                    </div>
                    <input type="color" value={settings.glowColorHex}
                      onChange={e=>updateSetting("glowColorHex",e.target.value)}
                      className="w-full h-8 rounded cursor-pointer border border-white/10 bg-transparent"/>
                  </div>
                  <PanelSlider label="Cloud Opacity" value={settings.cloudOpacity}
                    min={0} max={1} step={0.01} fmt={v=>v.toFixed(2)}
                    onChange={v=>updateSetting("cloudOpacity",v)}/>
                  <PanelSlider label="Sun Intensity" value={settings.sunIntensity}
                    min={0} max={8} step={0.1} fmt={v=>v.toFixed(1)}
                    onChange={v=>updateSetting("sunIntensity",v)}/>
                  <PanelSlider label="Terrain Bump" value={settings.bumpScale}
                    min={0} max={0.5} step={0.005} fmt={v=>v.toFixed(3)}
                    onChange={v=>updateSetting("bumpScale",v)}/>
                </>)}

                {preset===2 && (<>
                  <div className="flex justify-between py-1.5 px-2 rounded bg-white/5 border border-white/8">
                    <span className="text-[10px] text-slate-400">Earth Rotation</span>
                    <span className="text-[10px] font-mono text-amber-400">UTC ✓</span>
                  </div>
                  <PanelSlider label="Cloud Rotation" value={settings.cloudRotationSpeed}
                    min={0} max={0.002} step={0.00005} fmt={v=>v.toFixed(5)}
                    onChange={v=>updateSetting("cloudRotationSpeed",v)}/>
                  <PanelSlider label="Sun Intensity" value={settings.sunIntensity}
                    min={0} max={4} step={0.05} fmt={v=>v.toFixed(2)}
                    onChange={v=>updateSetting("sunIntensity",v)}/>
                  <PanelSlider label="Cloud Opacity" value={settings.cloudOpacity}
                    min={0} max={1} step={0.01} fmt={v=>v.toFixed(2)}
                    onChange={v=>updateSetting("cloudOpacity",v)}/>
                </>)}

                <button onClick={resetDefaults}
                  className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors text-slate-300">
                  ↩ Reset
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PanelSlider({ label, value, min, max, step, fmt, onChange }: {
  label:string; value:number; min:number; max:number; step:number;
  fmt:(v:number)=>string; onChange:(v:number)=>void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[10px] text-slate-400 font-medium">{label}</span>
        <span className="text-[10px] font-mono text-slate-300">{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(parseFloat(e.target.value))}
        className="w-full h-1 accent-amber-400 cursor-pointer"/>
    </div>
  );
}
