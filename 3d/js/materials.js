/* Procedural physically-based materials. No image files: every texture is generated in code.
   Palette: champagne bronze, warm ivory limestone, natural oak. */
import * as THREE from "three";

/* ---------- tileable value noise ---------- */
function hash(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
function vnoise(x, y, s, P) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const x0 = ((xi % P) + P) % P, x1 = (x0 + 1) % P, y0 = ((yi % P) + P) % P, y1 = (y0 + 1) % P;
  const a = hash(x0, y0, s), b = hash(x1, y0, s), c = hash(x0, y1, s), d = hash(x1, y1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/* x,y in 0..1 ; periodic so textures tile without seams */
function fbm(x, y, s, base = 4, oct = 4) {
  let a = 0.5, f = 1, sum = 0, norm = 0;
  for (let i = 0; i < oct; i++) { sum += a * vnoise(x * base * f, y * base * f, s + i * 17, base * f); norm += a; f *= 2; a *= 0.5; }
  return sum / norm;
}

function paint(size, fn, { srgb = true, repeat = [1, 1] } = {}) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const ctx = c.getContext("2d"), img = ctx.createImageData(size, size), d = img.data;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const o = (y * size + x) * 4, px = fn(x / size, y / size, x, y);
    d[o] = px[0]; d[o + 1] = px[1]; d[o + 2] = px[2]; d[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8; t.needsUpdate = true;
  return t;
}
const mix = (a, b, t) => a + (b - a) * t;
const mixc = (c1, c2, t) => [mix(c1[0], c2[0], t), mix(c1[1], c2[1], t), mix(c1[2], c2[2], t)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---------- limestone: warm ivory with soft cloud and fine veining. grout = tile joints ---------- */
function limestone({ size = 512, tone = [226, 211, 188], dark = [196, 176, 148], grout = false, seed = 3, vein = 0.5 } = {}) {
  const colorFn = (u, v, x, y) => {
    const n = fbm(u, v, seed, 3, 5), n2 = fbm(u + .3, v + .7, seed + 9, 6, 4);
    let t = clamp((n - .35) * 1.9), c = mixc(tone, dark, t * .55);
    const w = Math.abs(Math.sin((u * 2 + n2 * 2.4) * Math.PI * 2 + fbm(u, v, seed + 4, 2, 3) * 6));
    const vv = Math.pow(1 - w, 14) * vein * .55; c = mixc(c, [150, 128, 100], vv);
    const sp = hash(x, y, seed) * 7 - 3.5; c = [c[0] + sp, c[1] + sp, c[2] + sp];
    if (grout) {
      const e = 3, ex = Math.min(x, size - 1 - x), ey = Math.min(y, size - 1 - y), m = Math.min(ex, ey);
      if (m < e) c = mixc(c, [150, 134, 112], (1 - m / e) * .9);
    }
    return c;
  };
  const map = paint(size, colorFn);
  const bump = paint(size, (u, v, x, y) => {
    let h = fbm(u, v, seed + 2, 8, 3) * 200 + 30;
    if (grout) { const m = Math.min(x, y, size - 1 - x, size - 1 - y); if (m < 3) h = 10; }
    return [h, h, h];
  }, { srgb: false });
  return { map, bump };
}

/* ---------- natural oak: long grain, plank joints ---------- */
function oak({ size = 512, light = [196, 154, 108], dark = [150, 105, 66], planks = 4, vertical = true, seed = 11 } = {}) {
  const map = paint(size, (u, v, x, y) => {
    const a = vertical ? u : v, b = vertical ? v : u;               // a across grain, b along grain
    const grain = fbm(a * 1.0, b * 0.12 + 0.2, seed, 24, 3);
    const ring = Math.sin((a * 28 + fbm(a, b, seed + 2, 4, 3) * 5) * Math.PI) * .5 + .5;
    const t = clamp(grain * .8 + ring * .25);
    const pi = Math.floor(a * planks), shade = hash(pi, 0, seed) * .22 - .11;
    let c = mixc(light, dark, clamp(t + shade));
    const j = (a * planks) % 1; if (j < .012 || j > .988) c = mixc(c, [70, 48, 30], .7);
    return c;
  });
  const bump = paint(size, (u, v) => { const a = vertical ? u : v, b = vertical ? v : u; const h = fbm(a, b * .12, seed, 24, 3) * 255; return [h, h, h]; }, { srgb: false });
  return { map, bump };
}

/* ---------- brushed bronze: anisotropic streaks (roughness variation) ---------- */
function brushed({ size = 512, seed = 5 } = {}) {
  const rough = paint(size, (u, v) => {
    const s = fbm(u * 1, v * 0.02 + .1, seed, 64, 3) * .5 + hash(Math.floor(v * size), 0, seed) * .25;
    const r = 255 * clamp(.26 + s * .34); return [r, r, r];
  }, { srgb: false });
  return rough;
}
function plasterTex({ size = 512, seed = 21, tone = [170, 142, 110] } = {}) {
  const map = paint(size, (u, v) => { const n = fbm(u, v, seed, 4, 4); return mixc(tone, [168, 142, 110], clamp((n - .35) * 1.2) * .5); });
  const bump = paint(size, (u, v, x, y) => { const h = fbm(u, v, seed + 1, 16, 3) * 160 + hash(x, y, seed) * 40; return [h, h, h]; }, { srgb: false });
  return { map, bump };
}
function fabricTex({ size = 256, tone = [204, 186, 156], seed = 31 } = {}) {
  const map = paint(size, (u, v, x, y) => { const n = fbm(u, v, seed, 32, 2); return mixc(tone, [214, 200, 178], clamp((n - .4) * 1.5) * .5); });
  const bump = paint(size, (u, v, x, y) => { const h = hash(x, y, seed) * 255; return [h, h, h]; }, { srgb: false });
  return { map, bump };
}
/* soft daylight glow gradient for windows (no photograph) */
function daylightTex() {
  const c = document.createElement("canvas"); c.width = 8; c.height = 256;
  const g = c.getContext("2d"), grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, "#ffe6bd"); grd.addColorStop(.55, "#ffd9a0"); grd.addColorStop(1, "#cfa970");
  g.fillStyle = grd; g.fillRect(0, 0, 8, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createMaterials(renderer) {
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const set = t => { if (t) t.anisotropy = aniso; return t; };
  const M = {};

  const fl = limestone({ grout: true, seed: 3, tone: [176, 150, 118], dark: [140, 116, 88] });
  fl.map.repeat.set(1, 1); // one texture = one tile; callers set repeat
  M.stoneFloor = new THREE.MeshStandardMaterial({ map: set(fl.map), bumpMap: fl.bump, bumpScale: .6, roughness: .28, metalness: 0, envMapIntensity: .9 });
  const wl = limestone({ grout: false, seed: 8, tone: [176, 150, 118], dark: [138, 114, 86], vein: .35 });
  M.stoneWall = new THREE.MeshStandardMaterial({ map: set(wl.map), bumpMap: wl.bump, bumpScale: .5, roughness: .78, envMapIntensity: .5 });
  const pl = plasterTex();
  M.plaster = new THREE.MeshStandardMaterial({ map: set(pl.map), bumpMap: pl.bump, bumpScale: .25, roughness: .92, envMapIntensity: .4 });
  M.ceiling = new THREE.MeshStandardMaterial({ color: 0xa88e68, roughness: .95, envMapIntensity: .35, side: THREE.DoubleSide });

  const o1 = oak({ vertical: true, planks: 6, seed: 11 });
  M.oak = new THREE.MeshStandardMaterial({ map: set(o1.map), bumpMap: o1.bump, bumpScale: .4, roughness: .52, envMapIntensity: .6 });
  const o2 = oak({ vertical: true, planks: 3, seed: 14, light: [150, 104, 66], dark: [104, 70, 42] });
  M.oakDark = new THREE.MeshStandardMaterial({ map: set(o2.map), bumpMap: o2.bump, bumpScale: .4, roughness: .5, envMapIntensity: .6 });

  const br = set(brushed());
  M.bronze = new THREE.MeshStandardMaterial({ color: 0xb48f63, metalness: 1, roughness: .38, roughnessMap: br, envMapIntensity: 1.35 });
  M.bronzePolished = new THREE.MeshStandardMaterial({ color: 0xc09a6a, metalness: 1, roughness: .16, envMapIntensity: 1.5 });
  M.bronzeDark = new THREE.MeshStandardMaterial({ color: 0x7d5f40, metalness: 1, roughness: .42, roughnessMap: br, envMapIntensity: 1.1 });
  M.mirror = new THREE.MeshStandardMaterial({ color: 0xe9ddc8, metalness: 1, roughness: .04, envMapIntensity: 1.6 });

  const fb = fabricTex();
  M.fabric = new THREE.MeshStandardMaterial({ map: set(fb.map), bumpMap: fb.bump, bumpScale: .5, roughness: .96, envMapIntensity: .35 });
  M.fabricDeep = new THREE.MeshStandardMaterial({ color: 0xb59a76, roughness: .95, envMapIntensity: .3 });
  const sd = limestone({ grout: true, seed: 5, tone: [92, 80, 68], dark: [58, 49, 41], vein: .6 });
  M.stoneDark = new THREE.MeshStandardMaterial({ map: set(sd.map), bumpMap: sd.bump, bumpScale: .5, roughness: .32, envMapIntensity: .9 });
  const pd = plasterTex({ seed: 41, tone: [92, 74, 58] });
  M.plasterDark = new THREE.MeshStandardMaterial({ map: set(pd.map), bumpMap: pd.bump, bumpScale: .25, roughness: .9, envMapIntensity: .35 });
  const pw = plasterTex({ seed: 43, tone: [190, 163, 128] });
  M.plasterLight = new THREE.MeshStandardMaterial({ map: set(pw.map), bumpMap: pw.bump, bumpScale: .25, roughness: .9, envMapIntensity: .4 });
  const ol = oak({ vertical: true, planks: 8, seed: 19, light: [222, 190, 146], dark: [190, 150, 108] });
  M.oakLight = new THREE.MeshStandardMaterial({ map: set(ol.map), bumpMap: ol.bump, bumpScale: .4, roughness: .5, envMapIntensity: .6 });
  M.ceilDark = new THREE.MeshStandardMaterial({ color: 0x3a2e24, roughness: .95, envMapIntensity: .25, side: THREE.DoubleSide });
  M.shoji = new THREE.MeshStandardMaterial({ color: 0xf2dfbb, emissive: 0xffc77a, emissiveIntensity: .55, roughness: .9 });
  M.glass = new THREE.MeshStandardMaterial({ color: 0xdfe6e0, roughness: .05, metalness: 0, transparent: true, opacity: .16, envMapIntensity: 1.2, depthWrite: false });
  M.mirrorDark = new THREE.MeshStandardMaterial({ color: 0x2b221a, metalness: .7, roughness: .5, envMapIntensity: .45 });
  M.black = new THREE.MeshStandardMaterial({ color: 0x1d1a17, roughness: .6, metalness: .2 });

  M.glowWarm = new THREE.MeshBasicMaterial({ color: 0xffe2b0, toneMapped: false });
  M.glowSoft = new THREE.MeshBasicMaterial({ color: 0xffeccc, toneMapped: false });
  M.daylight = new THREE.MeshBasicMaterial({ map: daylightTex(), toneMapped: false });
  M.dispose = () => { Object.values(M).forEach(m => m && m.dispose && m.dispose()); };
  return M;
}

/* canvas label textures (titles, floor numerals) */
export function labelTexture(w, h, draw, { srgb = true } = {}) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d"); draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.userData = { ctx, c, draw, w, h }; return t;
}
export function redraw(tex, draw) { const { ctx, w, h } = tex.userData; ctx.clearRect(0, 0, w, h); draw(ctx, w, h); tex.needsUpdate = true; }
