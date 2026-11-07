/* Shared camera rig. One system, two modes:
     guided  : cinematic glides between authored stations (default)
     explore : click-to-move, WASD / arrows, drag to look. Collision keeps the visitor inside the architecture. */
import * as THREE from "three";
import { ease, lerp, angDiff } from "./core.js";

export class CameraRig {
  constructor(camera, dom, tweens, opts = {}) {
    this.cam = camera; this.dom = dom; this.tw = tweens;
    this.x = 0; this.z = 0; this.yaw = 0; this.pitch = 0; this.eye = 1.62;
    this.mode = "guided"; this.busy = false; this.locked = false;           // busy: scripted move running; locked: input off (overlays)
    this.reduced = !!opts.reduced; this.keys = new Set(); this.vel = { x: 0, z: 0 }; this.target = null;
    this.walkable = () => true; this.shake = 0; this.t = 0; this.onTargetReached = null;
    this.drag = null; this.moved = false;
    camera.rotation.order = "YXZ";
    addEventListener("keydown", e => { if (this._typing(e)) return; const k = e.key.toLowerCase(); if ("wasd".includes(k) && k.length === 1 || k.startsWith("arrow")) { this.keys.add(k); if (this.mode === "explore" && !this.locked) e.preventDefault(); } });
    addEventListener("keyup", e => this.keys.delete(e.key.toLowerCase()));
    addEventListener("blur", () => this.keys.clear());
    dom.addEventListener("pointerdown", e => { this.drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; this.moved = false; });
    addEventListener("pointermove", e => {
      if (!this.drag || e.pointerId !== this.drag.id) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      if (!this.moved && Math.hypot(dx, dy) < 6) return; this.moved = true;
      this.drag.x = e.clientX; this.drag.y = e.clientY;
      if (this.locked || this.busy) return;
      const k = this.mode === "explore" ? 1 : .35;                          // guided mode: a gentle look-around only
      this.yaw += -dx * .0042 * k; this.pitch = Math.max(-.7, Math.min(.6, this.pitch - dy * .0034 * k));
      if (this.mode === "guided") { this.yaw = this._home.yaw + Math.max(-.7, Math.min(.7, angDiff(this._home.yaw, this.yaw))); this.pitch = Math.max(-.35, Math.min(.3, this.pitch)); }
      this.target = null;
    });
    const end = e => { if (this.drag && e.pointerId === this.drag.id) this.drag = null; };
    addEventListener("pointerup", end); addEventListener("pointercancel", end);
    this._home = { yaw: 0, pitch: 0 };
  }
  _typing(e) { const t = e.target; return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable); }
  setMode(m) { this.mode = m; this.target = null; this._home = { yaw: this.yaw, pitch: this.pitch }; }
  place(s) { this.x = s.x; this.z = s.z; this.yaw = s.yaw; this.pitch = s.pitch || 0; this._home = { yaw: this.yaw, pitch: this.pitch }; this.target = null; }

  /* cinematic move to a station {x,z,yaw,pitch} */
  async glide(s, dur) {
    this.busy = true; this.target = null;
    const a = { x: this.x, z: this.z, yaw: this.yaw, pitch: this.pitch }, dy = angDiff(a.yaw, s.yaw);
    const d = dur ?? Math.min(3.4, Math.max(1.3, Math.hypot(s.x - a.x, s.z - a.z) * .5 + Math.abs(dy) * .35 + .8));
    await this.tw.run(this.reduced ? .01 : d, k => {
      this.x = lerp(a.x, s.x, k); this.z = lerp(a.z, s.z, k); this.yaw = a.yaw + dy * k; this.pitch = lerp(a.pitch, s.pitch || 0, k);
    }, ease.inOut);
    this._home = { yaw: this.yaw, pitch: this.pitch }; this.busy = false;
  }
  walkTo(x, z, cb) { if (this.walkable(x, z)) { this.target = { x, z }; this.onTargetReached = cb || null; return true; } return false; }

  update(dt) {
    this.t += dt;
    if (!this.busy && !this.locked && this.mode === "explore") {
      const k = this.keys; let f = 0, r = 0, turn = 0;
      if (k.has("w") || k.has("arrowup")) f += 1; if (k.has("s") || k.has("arrowdown")) f -= 1;
      if (k.has("d")) r += 1; if (k.has("a")) r -= 1;
      if (k.has("arrowleft")) turn += 1; if (k.has("arrowright")) turn -= 1;
      this.yaw += turn * dt * 1.6;
      let dx = -Math.sin(this.yaw) * f + Math.cos(this.yaw) * r, dz = -Math.cos(this.yaw) * f - Math.sin(this.yaw) * r;
      if (f || r) this.target = null;
      else if (this.target) {
        const tx = this.target.x - this.x, tz = this.target.z - this.z, d = Math.hypot(tx, tz);
        if (d < .12) { this.target = null; const cb = this.onTargetReached; this.onTargetReached = null; cb && cb(); }
        else { dx = tx / d; dz = tz / d; const slow = Math.min(1, d / .9); dx *= slow; dz *= slow; }
      }
      const sp = 2.1, ax = 1 - Math.exp(-dt * (dx || dz ? 6 : 9));
      this.vel.x += (dx * sp - this.vel.x) * ax; this.vel.z += (dz * sp - this.vel.z) * ax;
      const nx = this.x + this.vel.x * dt, nz = this.z + this.vel.z * dt;
      if (this.walkable(nx, this.z)) this.x = nx; else { this.vel.x = 0; if (this.target) this.target = null; }
      if (this.walkable(this.x, nz)) this.z = nz; else { this.vel.z = 0; if (this.target) this.target = null; }
    } else { this.vel.x = this.vel.z = 0; }
    /* apply to camera: human eye height with a very slight, comfortable breathing sway */
    const sway = this.reduced ? 0 : Math.sin(this.t * .9) * .004, walk = this.reduced ? 0 : Math.sin(this.t * 7.5) * .006 * Math.min(1, Math.hypot(this.vel.x, this.vel.z));
    const sh = this.shake ? (Math.random() - .5) * this.shake : 0;
    this.cam.position.set(this.x + sh, this.eye + sway + walk + sh * .6, this.z + sh);
    this.cam.rotation.set(this.pitch + sway * .5, this.yaw, 0);
  }
}
