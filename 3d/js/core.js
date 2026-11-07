/* Shared helpers: tweens, mesh builder, sound. */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const ease = { inOut: k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2), out: k => 1 - Math.pow(1 - k, 3), lin: k => k };
export const lerp = (a, b, t) => a + (b - a) * t;
export const angDiff = (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

export class Tweens {
  constructor() { this.items = []; this.scale = 1; }               // scale < 1 shortens everything (skip animations)
  run(dur, fn, e = ease.inOut) {
    return new Promise(res => this.items.push({ t: 0, dur: Math.max(1e-3, dur * this.scale), fn, e, res }));
  }
  wait(dur) { return this.run(dur, () => {}); }
  update(dt) {
    for (const it of this.items.slice()) {
      it.t += dt; const k = Math.min(1, it.t / it.dur); it.fn(it.e(k), k);
      if (k >= 1) { this.items.splice(this.items.indexOf(it), 1); it.res(); }
    }
  }
}

/* build a mesh in one call */
export function mesh(geo, mat, { p = [0, 0, 0], r = [0, 0, 0], cast = true, receive = true, name } = {}) {
  const m = new THREE.Mesh(geo, mat); m.position.set(...p); m.rotation.set(...r);
  m.castShadow = cast; m.receiveShadow = receive; if (name) m.name = name; return m;
}
export const box = (w, h, d, mat, o) => mesh(new THREE.BoxGeometry(w, h, d), mat, o);
export const rbox = (w, h, d, rad, mat, o) => mesh(new RoundedBoxGeometry(w, h, d, 4, rad), mat, o);
export const plane = (w, h, mat, o = {}) => mesh(new THREE.PlaneGeometry(w, h), mat, { cast: false, ...o });
export const cyl = (rt, rb, h, mat, o, seg = 48) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, o);

/* clone a material and give it its own texture repeat so one stone texture can tile at any size */
export function tiled(mat, w, h, tile = 1.2) {
  const m = mat.clone();
  ["map", "bumpMap", "roughnessMap"].forEach(k => { if (m[k]) { m[k] = m[k].clone(); m[k].repeat.set(w / tile, h / tile); m[k].needsUpdate = true; } });
  return m;
}

/* ---------- Sound (Web Audio, nothing to download) ---------- */
export class Sound {
  constructor() { this.ctx = null; this.on = true; this.hum = null; }
  unlock() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; } }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }
  ding() {
    if (!this.on || !this.ctx) return; const c = this.ctx, t = c.currentTime, out = c.createGain();
    out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.09, t + .01); out.gain.exponentialRampToValueAtTime(.0001, t + 1.8); out.connect(c.destination);
    [[880, 1], [1318.5, .45], [1760, .18]].forEach(([f, g]) => { const o = c.createOscillator(), v = c.createGain(); o.type = "sine"; o.frequency.value = f; v.gain.value = g; o.connect(v); v.connect(out); o.start(t); o.stop(t + 1.9); });
  }
  click() {
    if (!this.on || !this.ctx) return; const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = "triangle"; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(260, t + .08);
    g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.0001, t + .12); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + .14);
  }
  humStart() {
    if (!this.on || !this.ctx || this.hum) return; const c = this.ctx;
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 160; const g = c.createGain(); g.gain.value = 0;
    src.connect(f); f.connect(g); g.connect(c.destination); src.start(); g.gain.linearRampToValueAtTime(.05, c.currentTime + .6);
    this.hum = { src, g };
  }
  humStop() { if (!this.hum) return; const { src, g } = this.hum, t = this.ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.linearRampToValueAtTime(0, t + .5); src.stop(t + .6); this.hum = null; }
}
