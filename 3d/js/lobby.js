/* Scene 1: the elevator lobby. Everything here is procedural geometry. */
import * as THREE from "three";
import { box, plane, cyl, mesh, rbox, tiled } from "./core.js";
import { buildPortal } from "./elevator.js";

export const lookYaw = (x, z, tx, tz) => Math.atan2(-(tx - x), -(tz - z));

export function buildLobby(M, { mobile }) {
  const W = 10, D = 9, H = 3.6, g = new THREE.Group(); g.name = "lobby";
  const portal = buildPortal(M, { W, H, face: M.stoneWall }); g.add(portal.group);

  /* floor: honed limestone, large tiles, bronze inlay border */
  g.add(plane(W, D, tiled(M.stoneFloor, W, D, 1.2), { p: [0, 0, D / 2], r: [-Math.PI / 2, 0, 0], receive: true }));
  g.add(box(.05, .01, D - 1.4, M.bronzePolished, { p: [0, .004, 0.7 + (D - 1.4) / 2], cast: false }));
  const ix = 3.6, iz0 = 1.0, iz1 = D - 1.1;
  [[ix, (iz0 + iz1) / 2, .04, iz1 - iz0], [-ix, (iz0 + iz1) / 2, .04, iz1 - iz0]].forEach(([x, z, w, d]) => g.add(box(w, .01, d, M.bronzePolished, { p: [x, .004, z], cast: false })));
  [iz0, iz1].forEach(z => g.add(box(ix * 2, .01, .04, M.bronzePolished, { p: [0, .004, z], cast: false })));

  /* ceiling with a deep coffer, hidden cove light and a bronze halo */
  g.add(plane(W, D, M.ceiling, { p: [0, H, D / 2], r: [Math.PI / 2, 0, 0], receive: true }));
  const cw = 6.6, cd = 5.4, cz = 4.7, ch = .38;
  g.add(plane(cw, cd, M.ceiling, { p: [0, H + ch, cz], r: [Math.PI / 2, 0, 0] }));
  [[0, cz - cd / 2, cw, .04, 0], [0, cz + cd / 2, cw, .04, 0], [-cw / 2, cz, .04, cd, 1], [cw / 2, cz, .04, cd, 1]].forEach(([x, z, w, d]) => g.add(box(w, ch, d, M.ceiling, { p: [x, H + ch / 2, z], cast: false })));
  [[0, cz - cd / 2 + .12, cw - .2, .09], [0, cz + cd / 2 - .12, cw - .2, .09]].forEach(([x, z, w, d]) => g.add(box(w, .02, d, M.glowWarm, { p: [x, H + .02, z], cast: false, receive: false })));
  [[-cw / 2 + .12, cz, .09, cd - .2], [cw / 2 - .12, cz, .09, cd - .2]].forEach(([x, z, w, d]) => g.add(box(w, .02, d, M.glowWarm, { p: [x, H + .02, z], cast: false, receive: false })));
  const ring = mesh(new THREE.TorusGeometry(1.55, .022, 16, 96), M.bronzePolished, { p: [0, H + .22, cz], r: [Math.PI / 2, 0, 0], cast: false });
  const glow = mesh(new THREE.TorusGeometry(1.43, .012, 12, 96), M.glowWarm, { p: [0, H + .2, cz], r: [Math.PI / 2, 0, 0], cast: false });
  const disc = mesh(new THREE.CircleGeometry(1.4, 64), new THREE.MeshBasicMaterial({ color: 0xfff0d6, toneMapped: false }), { p: [0, H + ch - .01, cz], r: [Math.PI / 2, 0, 0], cast: false });
  g.add(ring, glow, disc);
  for (let i = 0; i < 6; i++) { const z = 1.2 + i * 1.5; [-4.15, 4.15].forEach(x => g.add(mesh(new THREE.CircleGeometry(.07, 24), M.glowWarm, { p: [x, H - .004, z], r: [Math.PI / 2, 0, 0], cast: false }))); }

  /* side walls: backlit oak slats in three bays, bronze reveals */
  const slatGeo = new THREE.BoxGeometry(.045, H - .12, .07);
  [-1, 1].forEach(s => {
    const x = s * (W / 2);
    g.add(plane(D - .0, H, new THREE.MeshBasicMaterial({ color: 0x8e5e32 }), { p: [x - s * .08, H / 2, D / 2], r: [0, -s * Math.PI / 2, 0], receive: false }));
    const n = Math.floor((D - .6) / .095), inst = new THREE.InstancedMesh(slatGeo, M.oak, n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { m4.setPosition(x - s * .13, H / 2, .35 + i * .095); inst.setMatrixAt(i, m4); }
    inst.castShadow = true; inst.receiveShadow = true; g.add(inst);
    [0, 3, 6, 9].forEach(z => g.add(box(.09, H, .06, M.bronze, { p: [x - s * .1, H / 2, z + .02] })));
    g.add(box(.05, .09, D, M.bronzeDark, { p: [x - s * .07, .045, D / 2], cast: false }));
  });

  /* entrance-side glazing: three bays with limestone piers + bronze mullions; the glow behind is a plain daylight gradient */
  const piers = [[-4.575, .85], [-1.5, .7], [1.5, .7], [4.575, .85]];
  piers.forEach(([x, w]) => g.add(rbox(w, H, .5, .01, tiled(M.stoneWall, w, H, 1.6), { p: [x, H / 2, D - .1] })));
  [-3, 0, 3].forEach(x => {
    g.add(box(2.3, H - 3.2, .5, M.stoneWall, { p: [x, 3.2 + (H - 3.2) / 2, D - .1] }));
    g.add(box(2.3, .12, .5, M.stoneWall, { p: [x, .06, D - .1] }));
    [-.38, .38].forEach(o => g.add(box(.035, 3.1, .05, M.bronze, { p: [x + o * 1.0 * 1.5, 1.65, D - .2], cast: true })));
    g.add(box(2.3, .035, .05, M.bronze, { p: [x, 2.45, D - .2] }));
  });
  g.add(plane(W + 2, H + .4, M.daylight, { p: [0, H / 2, D + .6], r: [0, Math.PI, 0], receive: false }));

  /* sculptural stone vases flanking the elevator, wall sconces, benches */
  const prof = [[0, 0], [.2, 0], [.26, .06], [.3, .35], [.24, .78], [.15, 1.0], [.17, 1.08], [.13, 1.1], [.0, 1.1]].map(([r, y]) => new THREE.Vector2(r, y));
  [-1.75, 1.75].forEach(x => {
    g.add(mesh(new THREE.LatheGeometry(prof, 48), tiled(M.stoneWall, 1, 1, .8), { p: [x, .12, 1.15] }));
    g.add(cyl(.34, .34, .12, M.bronzeDark, { p: [x, .06, 1.15] }));
  });
  [-1.45, 1.45].forEach(x => {
    g.add(box(.07, .95, .09, M.bronzePolished, { p: [x, 1.85, .06] }));
    g.add(box(.025, .8, .02, M.glowWarm, { p: [x, 1.85, .108], cast: false, receive: false }));
  });
  const benches = [];
  [[-2.7, 5.9], [2.7, 5.9]].forEach(([x, z]) => {
    g.add(rbox(2.4, .42, .72, .06, M.fabric, { p: [x, .3, z] }));
    g.add(box(2.1, .09, .5, M.black, { p: [x, .045, z], cast: false }));
    g.add(box(2.42, .02, .74, M.bronze, { p: [x, .095, z], cast: false }));
    benches.push([x - .6, z], [x + .6, z]);
  });

  /* lights */
  const hemi = new THREE.HemisphereLight(0xfff3e2, 0xb89c75, .18); g.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe7c4, .85); sun.position.set(2.5, 8, D + 7); sun.target.position.set(0, 0, 3.2);
  sun.castShadow = true; sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 36 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; sun.shadow.radius = 4;
  g.add(sun, sun.target);
  const coffer = new THREE.PointLight(0xffd9a6, 6, 11, 2); coffer.position.set(0, H - 1.1, cz); g.add(coffer);
  [-1, 1].forEach(s => { const l = new THREE.PointLight(0xffd8a0, 5, 4.5, 2); l.position.set(s * 1.45, 1.9, .5); g.add(l); });
  const fill = new THREE.PointLight(0xffe2bd, 2.2, 9, 2); fill.position.set(0, 2.6, 7.4); g.add(fill);

  const rects = [];
  const circles = [...benches.map(([x, z]) => ({ x, z, r: .75 })), { x: -1.75, z: 1.15, r: .42 }, { x: 1.75, z: 1.15, r: .42 }];
  return {
    group: g, name: "lobby", portal, ring, W, D, H,
    inside: (x, z, r = .3) => Math.abs(x) < W / 2 - .45 - r + .3 && z > .5 + r && z < D - .55 - r + .25,
    colliders: { circles, rects },
    stations: [
      { id: "arrival", title: "The lobby", note: "Limestone, bronze and oak. Step toward the elevator when you are ready.", x: 0, z: 7.7, yaw: 0, pitch: -.03 },
      { id: "elevator", title: "The elevator", note: "The doors open as you approach.", x: 0, z: 2.9, yaw: 0, pitch: .02 }
    ],
    update(dt, t) { ring.rotation.z = t * .05; glow.rotation.z = t * .05; }
  };
}
