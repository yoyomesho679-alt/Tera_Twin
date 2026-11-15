import { useEffect, useRef, useState, type ReactElement, type RefObject } from "react";
import * as THREE from "three";
import type { BodyId } from "./data";
import { TEX, MAP_IMG } from "./data";
import { Bi, pick, useLang, type Bi as BiT } from "./data";


// ===== geo.ts =====
const D2R = Math.PI / 180;

/** lat/lon (deg, east positive) -> point on unit sphere matching THREE.SphereGeometry UVs */
export function latLonToVec3(lat: number, lon: number, r = 1, out = new THREE.Vector3()) {
  const la = lat * D2R;
  const lo = lon * D2R;
  return out.set(r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), -r * Math.cos(la) * Math.sin(lo));
}

export function vec3ToLatLon(v: THREE.Vector3) {
  const n = v.clone().normalize();
  return { lat: Math.asin(THREE.MathUtils.clamp(n.y, -1, 1)) / D2R, lon: Math.atan2(-n.z, n.x) / D2R };
}

/** great-circle angular distance in degrees */
export function angDist(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p1 = lat1 * D2R;
  const p2 = lat2 * D2R;
  const dl = (lon2 - lon1) * D2R;
  const c = Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dl);
  return Math.acos(Math.max(-1, Math.min(1, c))) / D2R;
}

export function fmtCoord(lat: number, lon: number) {
  const a = `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? "N" : "S"}`;
  const b = `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? "E" : "W"}`;
  return `${a}, ${b}`;
}

export const BODY_RADIUS_KM: Record<string, number> = { earth: 6371, mars: 3390, moon: 1737 };


// ===== components/Marker.tsx =====
export interface MarkerSpec {
  id: string;
  lat: number;
  lon: number;
  color: string;
  kind: "dim" | "active" | "pin";
  title?: BiT;
  sub?: BiT;
  card?: { name: BiT; stat: BiT; desc: BiT; coords: string };
}

export function MarkerView({ m }: { m: MarkerSpec }) {
  if (m.kind === "pin") {
    return (
      <div className="relative pointer-events-none">
        <span className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white/90 bg-[var(--hover)] shadow-[0_0_8px_rgba(255,255,255,.8)]" />
        <span className="absolute -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white" />
      </div>
    );
  }
  const active = m.kind === "active";
  const size = active ? 20 : 13;
  return (
    <div className="relative pointer-events-none select-none">
      {active && (
        <span
          className="absolute rounded-full animate-ping"
          style={{ width: size + 14, height: size + 14, left: -(size + 14) / 2, top: -(size + 14) / 2, background: m.color, opacity: 0.55 }}
        />
      )}
      <span
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          left: -size / 2,
          top: -size / 2,
          background: m.color,
          border: `${active ? 3 : 2}px solid #fff`,
          boxShadow: `0 0 ${active ? 14 : 8}px ${m.color}, 0 0 0 1px rgba(0,0,0,.45)`,
        }}
      />
      {m.card ? (
        <div
          className="absolute w-[236px] rounded-lg p-2.5 text-[11px] leading-snug text-[var(--text)] text-start"
          style={{
            left: -118,
            bottom: size / 2 + 12,
            background: "rgba(7,12,26,.94)",
            border: `1px solid ${m.color}`,
            boxShadow: `0 8px 30px rgba(0,0,0,.6), 0 0 18px ${m.color}55`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.color }} />
            <Bi t={m.card.name} className="font-bold text-[12px] text-white" />
          </div>
          <Bi t={m.card.stat} className="font-semibold mb-1" arClass="" />
          <Bi t={m.card.desc} className="text-[var(--text)]" />
          <div className="mt-1 text-[10px] text-[var(--muted)] font-mono">{m.card.coords}</div>
        </div>
      ) : (
        m.title && (
          <div
            className="absolute whitespace-nowrap rounded px-1.5 py-0.5 text-[10.5px] leading-tight text-white"
            style={{
              left: size / 2 + 4,
              top: -12,
              background: "rgba(7,12,26,.82)",
              borderLeft: `3px solid ${m.color}`,
            }}
          >
            <Bi t={m.title} className="font-semibold" />
            {m.sub && <Bi t={m.sub} className="text-[var(--text)] text-[10px]" />}
          </div>
        )
      )}
    </div>
  );
}

export const kindZ = (k: MarkerSpec["kind"]) => (k === "dim" ? 1 : k === "pin" ? 5 : 10);


// ===== components/FlatMap.tsx =====
interface FlatMapProps {
  body: BodyId;
  grid: boolean;
  markers: MarkerSpec[];
  focus: Focus | null;
  onPick: (lat: number, lon: number, tolDeg: number) => void;
  apiRef: RefObject<GlobeApi | null>;
}

const ZMAX = 16;

/** Google-Maps-style flat equirectangular map: drag to pan, wheel / pinch to zoom toward the cursor */
export function FlatMap({ body, grid, markers, focus, onPick, apiRef }: FlatMapProps) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 400, h: 400 });
  const [view, setView] = useState({ z: 1, tx: 0, ty: 0 });
  const [anim, setAnim] = useState(false);
  const viewRef = useRef(view);
  viewRef.current = view;
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const lastFocus = useRef<number | null>(null);
  const live = useRef({ onPick });
  live.current = { onPick };

  const clamp = (z: number, tx: number, ty: number) => {
    const { w, h } = sizeRef.current;
    const ww = w * z;
    const wh = (w / 2) * z;
    const x = ww <= w ? (w - ww) / 2 : Math.min(0, Math.max(w - ww, tx));
    const y = wh <= h ? (h - wh) / 2 : Math.min(0, Math.max(h - wh, ty));
    return { z, tx: x, ty: y };
  };

  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth || 300, h: el.clientHeight || 300 });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth || 300, h: el.clientHeight || 300 });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setView((v) => clamp(v.z, v.tx, v.ty));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const zoomAbout = (factor: number, px: number, py: number) => {
    const v = viewRef.current;
    const z = Math.max(1, Math.min(ZMAX, v.z * factor));
    const k = z / v.z;
    setView(clamp(z, px - (px - v.tx) * k, py - (py - v.ty) * k));
  };

  const centerOn = (lat: number, lon: number, zTarget: number) => {
    const { w, h } = sizeRef.current;
    const z = Math.max(viewRef.current.z, zTarget);
    const wx = ((lon + 180) / 360) * w * z;
    const wy = ((90 - lat) / 180) * (w / 2) * z;
    setAnim(true);
    setView(clamp(z, w / 2 - wx, h / 2 - wy));
    window.setTimeout(() => setAnim(false), 750);
  };

  useEffect(() => {
    apiRef.current = {
      zoom: (f) => zoomAbout(1 / f, sizeRef.current.w / 2, sizeRef.current.h / 2),
      reset: () => {
        setAnim(true);
        setView(clamp(1, 0, 0));
        window.setTimeout(() => setAnim(false), 750);
      },
    };
    return () => {
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body]);

  useEffect(() => {
    if (focus && lastFocus.current !== focus.nonce) {
      lastFocus.current = focus.nonce;
      centerOn(focus.lat, focus.lon, 3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, size]);

  // pointer handling
  useEffect(() => {
    const el = box.current!;
    const pts = new Map<number, { x: number; y: number }>();
    let info: { x: number; y: number; t: number; moved: number } | null = null;
    let pinch = 0;
    const rel = (e: { clientX: number; clientY: number }) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      setAnim(false);
      if (pts.size === 1) info = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
      else {
        info = null;
        const [a, b] = [...pts.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const move = (e: PointerEvent) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      if (pts.size >= 2) {
        const [a, b] = [...pts.values()];
        const nd = Math.hypot(a.x - b.x, a.y - b.y);
        const c = rel({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 });
        if (pinch > 0) zoomAbout(nd / pinch, c.x, c.y);
        pinch = nd;
        return;
      }
      if (info) info.moved += Math.abs(dx) + Math.abs(dy);
      const v = viewRef.current;
      setView(clamp(v.z, v.tx + dx, v.ty + dy));
    };
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = 0;
      if (pts.size === 0) {
        if (info && info.moved < 6 && performance.now() - info.t < 700) {
          const { x, y } = rel(e);
          const v = viewRef.current;
          const { w } = sizeRef.current;
          const wx = (x - v.tx) / v.z;
          const wy = (y - v.ty) / v.z;
          const lon = (wx / w) * 360 - 180;
          const lat = 90 - (wy / (w / 2)) * 180;
          if (lat <= 90 && lat >= -90 && lon >= -180 && lon <= 180) {
            const tol = (360 / (w * v.z)) * 20;
            live.current.onPick(lat, lon, tol);
          }
        }
        info = null;
      }
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      setAnim(false);
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const { x, y } = rel(e);
      zoomAbout(Math.exp(-Math.max(-120, Math.min(120, dy)) * 0.002), x, y);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { w } = size;
  const gridLines: ReactElement[] = [];
  for (let lat = -60; lat <= 60; lat += 30)
    gridLines.push(<line key={`a${lat}`} vectorEffect="non-scaling-stroke" x1={0} x2={360} y1={90 - lat} y2={90 - lat} />);
  for (let lon = -150; lon <= 150; lon += 30)
    gridLines.push(<line key={`o${lon}`} vectorEffect="non-scaling-stroke" y1={0} y2={180} x1={lon + 180} x2={lon + 180} />);

  return (
    <div ref={box} className="stage absolute inset-0 overflow-hidden starfield">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: w,
          height: w / 2,
          transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.z})`,
          transition: anim ? "transform .7s cubic-bezier(.2,.8,.2,1)" : "none",
          boxShadow: "0 0 0 1px rgba(255,255,255,.12)",
        }}
      >
        <img src={MAP_IMG[body]} alt="" draggable={false} className="w-full h-full select-none" style={{ imageRendering: "auto" }} />
        {grid && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 180" preserveAspectRatio="none">
            <g stroke="rgba(255,255,255,.22)" strokeWidth={0.8} fill="none">
              {gridLines}
            </g>
            <line x1={0} x2={360} y1={90} y2={90} stroke="rgba(255,255,255,.5)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          </svg>
        )}
        {markers.map((m) => (
          <div
            key={`${m.kind}-${m.id}`}
            className="absolute"
            style={{
              left: `${((m.lon + 180) / 360) * 100}%`,
              top: `${((90 - m.lat) / 180) * 100}%`,
              transform: `scale(${1 / view.z})`,
              transformOrigin: "0 0",
              zIndex: kindZ(m.kind),
            }}
          >
            <MarkerView m={m} />
          </div>
        ))}
      </div>
    </div>
  );
}


// ===== components/Globe.tsx =====
export interface GlobeApi {
  zoom: (factor: number) => void;
  reset: () => void;
}
export interface Focus {
  lat: number;
  lon: number;
  nonce: number;
}

interface GlobeProps {
  body: BodyId;
  grid: boolean;
  markers: MarkerSpec[];
  focus: Focus | null;
  onPick: (lat: number, lon: number, tolDeg: number) => void;
  apiRef: RefObject<GlobeApi | null>;
}

const ALT_MIN = 0.05;
const ALT_MAX = 4.2;
const FOV = 32;
const wrap180 = (x: number) => ((((x + 180) % 360) + 360) % 360) - 180;
const R2D = 180 / Math.PI;

const START: Record<BodyId, { lat: number; lon: number }> = {
  earth: { lat: 18, lon: 20 },
  mars: { lat: 8, lon: -95 },
  moon: { lat: 10, lon: -15 },
};

/** tileable multi-octave value noise used as the close-up "micro detail" layer */
function makeDetailTexture(size = 256) {
  const data = new Uint8Array(size * size * 4);
  const octaves = [4, 8, 16, 32, 64];
  const grids = octaves.map((c) => Array.from({ length: c * c }, () => Math.random()));
  const smooth = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      let amp = 0.5;
      let tot = 0;
      octaves.forEach((c, i) => {
        const fx = (x / size) * c;
        const fy = (y / size) * c;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = smooth(fx - x0);
        const ty = smooth(fy - y0);
        const g = grids[i];
        const a = g[(y0 % c) * c + (x0 % c)];
        const b = g[(y0 % c) * c + ((x0 + 1) % c)];
        const cc = g[((y0 + 1) % c) * c + (x0 % c)];
        const d = g[((y0 + 1) % c) * c + ((x0 + 1) % c)];
        v += amp * (a + (b - a) * tx + (cc - a) * ty + (a - b - cc + d) * tx * ty);
        tot += amp;
        amp *= 0.55;
      });
      v = v / tot;
      v = Math.max(0, Math.min(1, 0.5 + (v - 0.5) * 2.2));
      const o = (y * size + x) * 4;
      data[o] = data[o + 1] = data[o + 2] = v * 255;
      data[o + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}

export function Globe({ body, grid, markers, focus, onPick, apiRef }: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [webglFailed, setWebglFailed] = useState(false);
  const lang = useLang();
  const live = useRef({ grid, markers, focus, onPick });
  live.current = { grid, markers, focus, onPick };
  const focusApplied = useRef<number | null>(null);
  const focusFn = useRef<((f: Focus) => void) | null>(null);

  useEffect(() => {
    if (webglFailed) return;
    const mount = mountRef.current!;
    const overlay = overlayRef.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      setWebglFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050813);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.005, 60);
    scene.add(camera);

    const loader = new THREE.TextureLoader();
    const disposables: { dispose: () => void }[] = [];
    const aniso = renderer.capabilities.getMaxAnisotropy();
    const load = (url: string, srgb = true, onLoad?: () => void, onError?: () => void) => {
      const t = loader.load(url, onLoad, undefined, onError);
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      disposables.push(t);
      return t;
    };

    // background stars
    const stars = load(TEX.stars);
    stars.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = stars;
    scene.backgroundIntensity = 0.55;

    // lights: a "sun" that follows the viewer so the area you look at is always lit
    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.position.set(-2.2, 1.6, 3);
    camera.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    // planet
    const detail = makeDetailTexture();
    disposables.push(detail);
    const detailU = { value: 0 };
    const geo = new THREE.SphereGeometry(1, 192, 96);
    disposables.push(geo);

    const mapTex = load(
      body === "earth" ? TEX.earth : body === "mars" ? TEX.mars : TEX.moon,
      true,
      () => setLoading(false),
      () => setLoading(false)
    );
    const mat = new THREE.MeshPhongMaterial({ map: mapTex });
    if (body === "earth") {
      mat.specularMap = load(TEX.earthSpec, false);
      mat.specular = new THREE.Color(0x5b6a78);
      mat.shininess = 28;
      mat.normalMap = load(TEX.earthNormal, false);
      mat.normalScale = new THREE.Vector2(0.9, 0.9);
    } else {
      mat.bumpMap = load(body === "mars" ? TEX.marsBump : TEX.moonBump, false);
      mat.bumpScale = body === "mars" ? 0.5 : 0.7;
      mat.specular = new THREE.Color(0x0c0c0c);
      mat.shininess = 3;
    }
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uDetail = detailU;
      sh.uniforms.uDetailMap = { value: detail };
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uDetail;\nuniform sampler2D uDetailMap;")
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          {
            float d1 = texture2D(uDetailMap, vMapUv * vec2(70.0, 35.0)).r;
            float d2 = texture2D(uDetailMap, vMapUv * vec2(520.0, 260.0)).r;
            float dd = d1 * 0.5 + d2 * 0.5;
            diffuseColor.rgb *= mix(vec3(1.0), vec3(dd * 2.0), uDetail);
          }`
        );
    };
    disposables.push(mat);
    const planet = new THREE.Mesh(geo, mat);
    scene.add(planet);

    // clouds (Earth)
    let clouds: THREE.Mesh | null = null;
    let cloudMat: THREE.MeshPhongMaterial | null = null;
    if (body === "earth") {
      cloudMat = new THREE.MeshPhongMaterial({
        map: load(TEX.earthClouds, true),
        transparent: true,
        depthWrite: false,
        opacity: 0.85,
        shininess: 0,
      });
      disposables.push(cloudMat);
      clouds = new THREE.Mesh(new THREE.SphereGeometry(1.008, 128, 64), cloudMat);
      disposables.push(clouds.geometry);
      scene.add(clouds);
    }

    // atmosphere glow
    let atmoMat: THREE.ShaderMaterial | null = null;
    if (body !== "moon") {
      const col = body === "earth" ? new THREE.Color(0.3, 0.62, 1.0) : new THREE.Color(1.0, 0.6, 0.38);
      atmoMat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: col }, uFade: { value: 1 }, uStrength: { value: body === "earth" ? 0.85 : 0.5 } },
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `varying vec3 vN; uniform vec3 uColor; uniform float uFade; uniform float uStrength;
          void main(){ float i = pow(max(0.0, 0.63 - dot(vN, vec3(0.0,0.0,1.0))), 4.0); gl_FragColor = vec4(uColor * i * uStrength * uFade, i * uFade); }`,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      });
      const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.17, 96, 48), atmoMat);
      disposables.push(atmo.geometry, atmoMat);
      scene.add(atmo);
    }

    // lat/lon graticule
    const gridPts: number[] = [];
    const seg = (a: THREE.Vector3, b: THREE.Vector3) => gridPts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lon = -180; lon < 180; lon += 4) seg(latLonToVec3(lat, lon, 1.0015), latLonToVec3(lat, lon + 4, 1.0015));
    }
    for (let lon = -180; lon < 180; lon += 30) {
      for (let lat = -88; lat < 88; lat += 4) seg(latLonToVec3(lat, lon, 1.0015), latLonToVec3(lat + 4, lon, 1.0015));
    }
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridPts, 3));
    const gridMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, depthWrite: false });
    const gridLines = new THREE.LineSegments(gridGeo, gridMat);
    disposables.push(gridGeo, gridMat);
    scene.add(gridLines);

    // ---- view state ----
    const st = {
      lat: START[body].lat,
      lon: START[body].lon,
      d: 4.4,
      vlat: 0,
      vlon: 0,
      target: null as null | { lat: number; lon: number; d: number },
      auto: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      dragging: false,
    };
    const size = { w: 1, h: 1 };
    let lastSig = "";
    const tmp = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const unitSphere = new THREE.Sphere(new THREE.Vector3(), 1);

    const updateCamera = () => {
      st.lat = Math.max(-86, Math.min(86, st.lat));
      st.lon = wrap180(st.lon);
      st.d = 1 + Math.max(ALT_MIN, Math.min(ALT_MAX, st.d - 1));
      latLonToVec3(st.lat, st.lon, st.d, camera.position);
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
    };

    const pickAt = (cx: number, cy: number) => {
      const r = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.ray.intersectSphere(unitSphere, new THREE.Vector3());
      if (!hit) return null;
      const ll = vec3ToLatLon(hit);
      const dist = camera.position.distanceTo(hit);
      const tolDeg = ((2 * dist * Math.tan((FOV * Math.PI) / 360)) / r.height) * R2D * 22;
      return { ...ll, tolDeg };
    };

    const zoomAt = (factor: number, cx?: number, cy?: number) => {
      const r = renderer.domElement.getBoundingClientRect();
      const x = cx ?? r.left + r.width / 2;
      const y = cy ?? r.top + r.height / 2;
      const before = pickAt(x, y);
      st.d = 1 + (st.d - 1) * factor;
      updateCamera();
      if (before) {
        for (let i = 0; i < 2; i++) {
          const after = pickAt(x, y);
          if (!after) break;
          st.lon += before.lon - after.lon;
          st.lat += before.lat - after.lat;
          updateCamera();
        }
      }
    };

    apiRef.current = {
      zoom: (f) => {
        st.auto = false;
        st.target = null;
        zoomAt(f);
      },
      reset: () => {
        st.auto = false;
        st.target = { lat: START[body].lat, lon: START[body].lon, d: 4.4 };
      },
    };
    focusFn.current = (f) => {
      st.auto = false;
      st.target = { lat: f.lat, lon: f.lon, d: Math.min(st.d, 2.1) < 1.4 ? st.d : Math.min(st.d, 2.1) };
    };

    const resize = () => {
      const w = mount.clientWidth || 300;
      const h = mount.clientHeight || 300;
      size.w = w;
      size.h = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      lastSig = "";
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();
    updateCamera();

    // ---- pointer interaction ----
    const el = renderer.domElement;
    const pointers = new Map<number, { x: number; y: number }>();
    let downInfo: { x: number; y: number; t: number; moved: number } | null = null;
    let pinchDist = 0;

    const onDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      st.auto = false;
      st.target = null;
      st.dragging = true;
      st.vlat = st.vlon = 0;
      if (pointers.size === 1) downInfo = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
      else {
        downInfo = null;
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const onMove = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const nd = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDist > 0) zoomAt(pinchDist / nd, (a.x + b.x) / 2, (a.y + b.y) / 2);
        pinchDist = nd;
        return;
      }
      if (downInfo) downInfo.moved += Math.abs(dx) + Math.abs(dy);
      const radPerPx = (2 * (st.d - 1) * Math.tan((FOV * Math.PI) / 360)) / size.h;
      const k = radPerPx * R2D;
      const cosLat = Math.max(0.25, Math.cos((st.lat * Math.PI) / 180));
      const dlon = -(dx * k) / cosLat;
      const dlat = dy * k;
      st.lon += dlon;
      st.lat += dlat;
      st.vlon = dlon;
      st.vlat = dlat;
      updateCamera();
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (pointers.size === 0) {
        st.dragging = false;
        if (downInfo && downInfo.moved < 6 && performance.now() - downInfo.t < 700) {
          const hit = pickAt(e.clientX, e.clientY);
          st.vlat = st.vlon = 0;
          if (hit) live.current.onPick(hit.lat, hit.lon, hit.tolDeg);
        }
        downInfo = null;
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      st.auto = false;
      st.target = null;
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(Math.exp(Math.max(-120, Math.min(120, dy)) * 0.0018), e.clientX, e.clientY);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    // ---- render loop ----
    let raf = 0;
    let running = true;
    const loop = () => {
      if (!running) return;
      raf = requestAnimationFrame(loop);

      if (st.target) {
        const t = st.target;
        st.lat += (t.lat - st.lat) * 0.075;
        st.lon += wrap180(t.lon - st.lon) * 0.075;
        st.d += (t.d - st.d) * 0.075;
        if (Math.abs(t.lat - st.lat) < 0.05 && Math.abs(wrap180(t.lon - st.lon)) < 0.05 && Math.abs(t.d - st.d) < 0.002) st.target = null;
      } else if (!st.dragging) {
        if (st.auto) st.lon += 0.06;
        if (Math.abs(st.vlon) > 0.002 || Math.abs(st.vlat) > 0.002) {
          st.lon += st.vlon;
          st.lat += st.vlat;
          st.vlon *= 0.93;
          st.vlat *= 0.93;
        }
      }
      updateCamera();

      // Skip GPU work when the camera, grid, and markers are unchanged.
      const sig = `${st.lat.toFixed(5)}|${st.lon.toFixed(5)}|${st.d.toFixed(5)}|${live.current.grid ? 1 : 0}|${live.current.markers.map((m) => `${m.kind}:${m.id}:${m.lat}:${m.lon}`).join(",")}`;
      if (sig === lastSig) return;
      lastSig = sig;

      const alt = st.d - 1;
      detailU.value = Math.max(0, Math.min(1, (0.55 - alt) / 0.4)) * (body === "earth" ? 0.5 : 0.95);
      if (atmoMat) atmoMat.uniforms.uFade.value = THREE.MathUtils.smoothstep(st.d, 1.2, 1.9);
      if (clouds && cloudMat) {
        clouds.rotation.y += 0.00008;
        cloudMat.opacity = 0.85 * THREE.MathUtils.smoothstep(alt, 0.04, 0.5);
        clouds.visible = cloudMat.opacity > 0.01;
      }
      gridLines.visible = live.current.grid;

      renderer.render(scene, camera);

      // project markers
      const specs = new Map(live.current.markers.map((m) => [`${m.kind}-${m.id}`, m]));
      const kids = overlay.children;
      for (let i = 0; i < kids.length; i++) {
        const c = kids[i] as HTMLElement;
        const m = specs.get(c.dataset.k || "");
        if (!m) continue;
        latLonToVec3(m.lat, m.lon, 1, tmp);
        const facing = tmp.dot(camera.position);
        if (facing < 1.02) {
          c.style.visibility = "hidden";
          continue;
        }
        tmp.project(camera);
        const x = (tmp.x * 0.5 + 0.5) * size.w;
        const y = (-tmp.y * 0.5 + 0.5) * size.h;
        c.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
        c.style.visibility = "visible";
      }
    };
    loop();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      apiRef.current = null;
      focusFn.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, webglFailed]);

  // fly to the requested focus
  useEffect(() => {
    if (focus && focusApplied.current !== focus.nonce) {
      focusApplied.current = focus.nonce;
      focusFn.current?.(focus);
    }
  }, [focus, body]);

  if (webglFailed) {
    return <FlatMap body={body} grid={grid} markers={markers} focus={focus} onPick={onPick} apiRef={apiRef} />;
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="stage absolute inset-0" />
      <div ref={overlayRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        {markers.map((m) => (
          <div
            key={`${m.kind}-${m.id}`}
            data-k={`${m.kind}-${m.id}`}
            className="absolute left-0 top-0 will-change-transform"
            style={{ visibility: "hidden", zIndex: kindZ(m.kind) }}
          >
            <MarkerView m={m} />
          </div>
        ))}
      </div>
      {loading && (
        <div className="absolute inset-0 grid place-items-center text-xs text-[var(--muted)] pointer-events-none">
          {pick(lang, ["Loading NASA imagery…", "جارٍ تحميل صور ناسا…"])}
        </div>
      )}
    </div>
  );
}
