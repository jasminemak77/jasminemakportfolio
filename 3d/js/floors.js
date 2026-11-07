/* Generic floor builder + themed floors 1, 3, 4, 5, 6, 7.
   Every floor shares: the elevator wall (z = 0), a room shell, exhibits (real portfolio images) and the same
   interface that main.js already uses: { group, portal, targets, pav, stations, colliders, inside, update }.
   Exhibit styles: "pavilion" (stone plinth), "wall" (framed board), "turntable" (slowly turning panel), "float" (hovering panel). */
import * as THREE from "three";
import { box, plane, cyl, mesh, rbox, tiled } from "./core.js";
import { buildPortal } from "./elevator.js";
import { labelTexture } from "./materials.js";
import { lookYaw } from "./lobby.js";

const FONT = `"Josefin Sans","Helvetica Neue",Arial,sans-serif`;

/* ---------- exhibit builders: local +z is the viewing direction ---------- */
function makeExhibit(M, loader, ex, style, cfg) {
  const p = new THREE.Group(), frameMat = M.bronze.clone();
  const maxW = style === "wall" ? 2.5 : 2.4, maxH = style === "wall" ? 1.7 : 1.62;
  let frame, img, imgY = 1.5, imgZ = 0, parts = {};
  const tex = loader.load(ex.image, t => {
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const a = t.image.width / t.image.height; let w = maxW, h = maxW / a; if (h > maxH) { h = maxH; w = maxH * a; }
    img.scale.set(w, h, 1); frame.scale.set(w + .12, h + .12, 1);
  }, undefined, () => {});
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const imgMat = new THREE.MeshBasicMaterial({ map: tex, color: 0xdcd6cc, toneMapped: false, side: style === "turntable" ? THREE.DoubleSide : THREE.FrontSide });
  const label = labelTexture(512, 160, (ctx, w, h) => {
    ctx.fillStyle = "#f1e9db"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#2b2622";
    ctx.font = `600 ${ex.title.length > 22 ? 36 : 44}px ${FONT}`; ctx.textBaseline = "alphabetic"; ctx.fillText(ex.title.toUpperCase(), 30, 74);
    ctx.fillStyle = "#8a6b49"; ctx.font = `400 26px ${FONT}`; ctx.fillText((ex.category || "").toUpperCase().slice(0, 30) + "  ·  VIEW", 30, 118);
  });
  const plaqueMat = new THREE.MeshStandardMaterial({ map: label, roughness: .5 });
  const frameBox = (z) => { frame = box(1, 1, .07, frameMat, { p: [0, imgY, z] }); frame.scale.set(2.52, 1.62, 1); return frame; };
  const imgPlane = (z) => { img = plane(1, 1, imgMat, { p: [0, imgY, z] }); img.scale.set(2.4, 2.4 / 1.5, 1); return img; };
  let hit, spot;

  if (style === "pavilion") {
    const stone = tiled(cfg.plinth ? cfg.plinth(M) : M.stoneWall, 3.2, 1.9, 1.2);
    p.add(rbox(3.3, .14, 2.0, .015, stone, { p: [0, .13, 0] }), box(3.0, .03, 1.7, M.glowWarm, { p: [0, .045, 0], cast: false, receive: false }), box(3.34, .012, 2.04, M.bronzePolished, { p: [0, .2, 0], cast: false }));
    [-1, 1].forEach(s => p.add(cyl(.024, .024, 1.0, M.bronzePolished, { p: [s * 1.0, .72, -.4] }, 20)));
    p.add(frameBox(-.4), imgPlane(-.4 + .037));
    const pl = new THREE.Group(); pl.position.set(0, .45, .75); pl.rotation.x = -.95;
    pl.add(box(1.04, .33, .025, M.bronze), plane(1.0, .3125, plaqueMat, { p: [0, 0, .014] })); p.add(pl, box(.06, .32, .06, M.bronzeDark, { p: [0, .3, .62], r: [.4, 0, 0] }));
    hit = new THREE.Mesh(new THREE.BoxGeometry(3.3, 2.5, 2.0), new THREE.MeshBasicMaterial({ visible: false })); hit.position.set(0, 1.25, 0);
    spot = new THREE.SpotLight(0xffe4bd, 40, 10, .62, .85, 2); spot.position.set(0, 3.4, 2.3); spot.target.position.set(0, 1.4, -.4); p.add(spot, spot.target);
  } else if (style === "wall") {
    imgY = 1.6;
    p.add(frameBox(.04), imgPlane(.08));
    p.add(box(2.9, .06, .1, M.bronzePolished, { p: [0, 2.72, .08], cast: false }), box(2.6, .02, .03, M.glowWarm, { p: [0, 2.68, .14], cast: false, receive: false }));
    p.add(box(1.04, .33, .025, M.bronze, { p: [0, .4, .04] }), plane(1.0, .3125, plaqueMat, { p: [0, .4, .056] }));
    hit = new THREE.Mesh(new THREE.BoxGeometry(3.1, 2.4, .5), new THREE.MeshBasicMaterial({ visible: false })); hit.position.set(0, 1.6, .25);
  } else if (style === "turntable") {
    p.add(cyl(1.0, 1.05, .12, cfg.plinth ? cfg.plinth(M) : M.stoneDark, { p: [0, .06, 0] }), cyl(.92, .92, .02, M.glowWarm, { p: [0, .02, 0], cast: false, receive: false }), cyl(1.0, 1.0, .02, M.bronzePolished, { p: [0, .13, 0], cast: false }));
    const spin = new THREE.Group(); spin.position.y = .13; p.add(spin); parts.spin = spin;
    spin.add(cyl(.03, .03, 1.1, M.bronzePolished, { p: [0, .55, 0] }, 20));
    imgY = 1.55; spin.add(frameBox(0), imgPlane(.038)); const back = plane(1, 1, imgMat, { p: [0, imgY, -.038], r: [0, Math.PI, 0] }); back.scale.copy(img.scale); spin.add(back); parts.back = back;
    const pl = new THREE.Group(); pl.position.set(0, .3, 1.02); pl.rotation.x = -.55; pl.add(box(1.04, .33, .025, M.bronze), plane(1.0, .3125, plaqueMat, { p: [0, 0, .014] })); p.add(pl);
    hit = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.6, 16), new THREE.MeshBasicMaterial({ visible: false })); hit.position.set(0, 1.3, 0);
    spot = new THREE.SpotLight(0xffe2b5, 36, 9, .55, .8, 2); spot.position.set(0, 3.7, 1.2); spot.target.position.set(0, 1.4, 0); p.add(spot, spot.target);
  } else {                                                                    // float
    imgY = 0; const fl = new THREE.Group(); fl.position.y = 1.95; p.add(fl); parts.fl = fl;
    frame = box(1, 1, .07, frameMat, { p: [0, 0, 0] }); frame.scale.set(2.52, 1.62, 1); fl.add(frame);
    img = plane(1, 1, imgMat, { p: [0, 0, .038] }); img.scale.set(2.4, 1.6, 1); fl.add(img);
    const ring = mesh(new THREE.TorusGeometry(1.75, .018, 12, 90), M.glowWarm, { p: [0, 0, -.12], cast: false, receive: false }); fl.add(ring);
    const ring2 = mesh(new THREE.TorusGeometry(1.95, .012, 10, 90), M.bronzePolished, { p: [0, 0, -.18], cast: false }); fl.add(ring2); parts.ring2 = ring2;
    const pl = new THREE.Group(); pl.position.set(0, -1.18, .04); pl.add(box(1.04, .33, .025, M.bronze), plane(1.0, .3125, plaqueMat, { p: [0, 0, .014] })); fl.add(pl);
    p.add(cyl(.9, .9, .012, M.glowWarm, { p: [0, .01, 0], cast: false, receive: false }));
    hit = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.2, 1.2), new THREE.MeshBasicMaterial({ visible: false })); hit.position.set(0, 1.95, 0);
  }
  hit.userData = { type: "exhibit", id: ex.id, label: ex.title }; p.add(hit);
  return { group: p, hit, frameMat, parts, style };
}

/* ---------- room shell + exhibits + stations ---------- */
export function buildHall(M, cfg, { mobile, loader, exhibits }) {
  const { W, D, H } = cfg, g = new THREE.Group(); g.name = cfg.name;
  const portal = buildPortal(M, { W, H, face: cfg.face(M) }); g.add(portal.group);
  const tl = (m, w, h, t = 1.5) => tiled(m, w, h, t);
  g.add(plane(W, D, tl(cfg.floor(M), W, D, cfg.floorTile || 1.5), { p: [0, 0, D / 2], r: [-Math.PI / 2, 0, 0], receive: true }));
  g.add(plane(W, D, cfg.ceil(M), { p: [0, H, D / 2], r: [Math.PI / 2, 0, 0] }));
  const wm = cfg.wall(M);
  g.add(plane(D, H, tl(wm, D, H, 1.6), { p: [-W / 2, H / 2, D / 2], r: [0, Math.PI / 2, 0] }), plane(D, H, tl(wm, D, H, 1.6), { p: [W / 2, H / 2, D / 2], r: [0, -Math.PI / 2, 0] }),
    plane(W, H, tl(cfg.back ? cfg.back(M) : wm, W, H, 1.6), { p: [0, H / 2, D], r: [0, Math.PI, 0] }));
  // skirting + a cove strip of light at the ceiling edge
  const sk = (w, d, x, z) => g.add(box(w, .08, d, M.bronzeDark, { p: [x, .04, z], cast: false }));
  sk(W, .04, 0, D - .02); sk(.04, D, -W / 2 + .02, D / 2); sk(.04, D, W / 2 - .02, D / 2);
  const cv = cfg.cove === false ? null : M.glowWarm;
  if (cv) { g.add(box(W, .03, .08, cv, { p: [0, H - .05, D - .06], cast: false, receive: false }), box(.08, .03, D, cv, { p: [-W / 2 + .06, H - .05, D / 2], cast: false, receive: false }), box(.08, .03, D, cv, { p: [W / 2 - .06, H - .05, D / 2], cast: false, receive: false })); }

  const ctx = { g, W, D, H, M, circles: [], updaters: [] };
  /* exhibits */
  const targets = [], pav = [], stations = [], circles = ctx.circles;
  stations.push({ id: "arrival", title: cfg.label, note: cfg.note, x: 0, z: 2.6, yaw: Math.PI, pitch: -.04 });
  exhibits.forEach(ex => {
    const style = ex.style || cfg.style, e = makeExhibit(M, loader, ex, style, cfg);
    let x, z, yaw;
    if (ex.wall) {                                                          // wall boards: wall = L | R | B, t = position along the wall
      if (ex.wall === "L") { x = -W / 2; z = ex.t; yaw = Math.PI / 2; } else if (ex.wall === "R") { x = W / 2; z = ex.t; yaw = -Math.PI / 2; } else { x = ex.t; z = D; yaw = Math.PI; }
    } else { [x, z] = ex.pos; const fx = ex.focus ? ex.focus[0] : 0, fz = ex.focus ? ex.focus[1] : 2.2; yaw = Math.atan2(fx - x, fz - z); }
    e.group.position.set(x, 0, z); e.group.rotation.y = yaw; g.add(e.group); targets.push(e.hit);
    const d = style === "wall" ? 3.3 : style === "float" ? 3.4 : 3.6, sx = x + Math.sin(yaw) * d, sz = z + Math.cos(yaw) * d;
    stations.push({ id: ex.id, title: ex.title, exhibit: ex.id, x: sx, z: sz, yaw: lookYaw(sx, sz, x, z), pitch: style === "float" ? .02 : -.04 });
    if (style === "pavilion") circles.push({ x, z, r: 1.45 }); else if (style === "turntable") circles.push({ x, z, r: 1.15 }); else if (style === "float") circles.push({ x, z, r: .5 });
    pav.push({ id: ex.id, frameMat: e.frameMat, group: e.group });
    const idx = pav.length;
    if (e.parts.spin || e.parts.fl) ctx.updaters.push((dt, t, i = idx) => {
      if (e.parts.spin) e.parts.spin.rotation.y = Math.sin(t * .45 + i) * 1.05;
      if (e.parts.fl) { e.parts.fl.position.y = 1.95 + Math.sin(t * .6 + i * 1.7) * .09; e.parts.ring2.rotation.z = t * .08; }
    });
  });
  stations.push({ id: "return", title: "Back to the elevator", note: "The elevator is always here.", x: 0, z: 3.0, yaw: 0, pitch: 0 });

  cfg.decor && cfg.decor(ctx, { mobile });
  const inside = (x, z, r = .3) => z > .5 + r && z < D - .45 - r && Math.abs(x) < W / 2 - .45 - r;
  return { group: g, name: cfg.name, portal, targets, pav, W, H, D, stations, colliders: { circles, rects: [] }, inside,
    update(dt, t) { ctx.updaters.forEach(u => u(dt, t)); } };
}

/* ---------- small helpers for decor ---------- */
const pt = (g, col, i, d, x, y, z) => { const l = new THREE.PointLight(col, i, d, 2); l.position.set(x, y, z); g.add(l); return l; };
function rand(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

/* ============================ FLOOR 1: ABOUT ME, a personal architectural studio ============================ */
const about = {
  name: "about", label: "About Me", note: "A personal studio. Come and meet the designer.", W: 12, D: 9, H: 3.4, style: "wall",
  face: M => M.plasterLight, floor: M => M.oakLight, floorTile: 2, ceil: M => M.ceiling, wall: M => M.plasterLight,
  decor({ g, W, D, H, M, circles }) {
    g.add(new THREE.HemisphereLight(0xfff0d8, 0x9a7a55, .45));
    // window wall (right): daylight with bronze mullions
    g.add(plane(D - 1.6, 2.3, M.daylight, { p: [W / 2 - .03, 1.65, D / 2], r: [0, -Math.PI / 2, 0], receive: false }));
    for (let i = 0; i <= 4; i++) g.add(box(.06, 2.5, .05, M.bronze, { p: [W / 2 - .06, 1.65, .8 + i * (D - 1.6) / 4] }));
    [.45, 2.85].forEach(y => g.add(box(.06, .05, D - 1.5, M.bronze, { p: [W / 2 - .06, y, D / 2] })));
    const sun = new THREE.DirectionalLight(0xffdcae, 1.1); sun.position.set(W / 2 + 6, 5, D / 2); sun.target.position.set(0, 0, D / 2); g.add(sun, sun.target);
    // oak bookshelves on the left wall (instanced books)
    const rnd = rand(7), cols = [0xd8c7a8, 0xa88b66, 0x6f5a45, 0xc9b79a, 0x8c7458, 0xe3d6bd, 0x4a3b2e];
    [.55, 1.2, 1.85, 2.5].forEach(y => g.add(box(.38, .045, 5.6, M.oakDark, { p: [-W / 2 + .21, y, 5.4] })));
    g.add(box(.05, 2.9, 5.6, M.oakDark, { p: [-W / 2 + .03, 1.45, 5.4] }));
    const bg = new THREE.BoxGeometry(.24, 1, .045), books = new THREE.InstancedMesh(bg, new THREE.MeshStandardMaterial({ roughness: .8 }), 120), m4 = new THREE.Matrix4(), c = new THREE.Color();
    let n = 0; [.575, 1.225, 1.875, 2.525].forEach(y => { for (let z = 2.7; z < 8.0 && n < 120; z += .07 + rnd() * .03) { const h = .3 + rnd() * .28; m4.compose(new THREE.Vector3(-W / 2 + .22, y + h / 2, z), new THREE.Quaternion(), new THREE.Vector3(1, h, 1)); books.setMatrixAt(n, m4); books.setColorAt(n, c.setHex(cols[Math.floor(rnd() * cols.length)])); n++; } });
    books.count = n; books.castShadow = true; g.add(books);
    // drafting table, stool, rolled drawings
    const tb = new THREE.Group(); tb.position.set(1.2, 0, 5.6); tb.rotation.y = -.35;
    const top = box(2.3, .05, 1.2, M.oak, { p: [0, 1.0, 0], r: [-.18, 0, 0] }); tb.add(top, box(2.34, .03, .06, M.bronze, { p: [0, .93, .56], r: [-.18, 0, 0] }));
    [[-1.0, -.5], [1.0, -.5], [-1.0, .5], [1.0, .5]].forEach(([x, z]) => tb.add(cyl(.025, .025, .98, M.bronzeDark, { p: [x, .49, z] }, 12)));
    tb.add(cyl(.2, .2, .05, M.fabricDeep, { p: [.2, .68, 1.0] }), cyl(.025, .025, .66, M.bronzeDark, { p: [.2, .33, 1.0] }, 12), cyl(.22, .22, .02, M.bronzeDark, { p: [.2, .01, 1.0] }));
    g.add(tb); circles.push({ x: 1.2, z: 5.6, r: 1.3 });
    const rolls = new THREE.Group(); rolls.position.set(3.7, 0, 7.6); rolls.add(cyl(.2, .2, .55, M.black, { p: [0, .28, 0] }));
    for (let i = 0; i < 5; i++) rolls.add(cyl(.035, .035, .8, M.fabric, { p: [Math.sin(i * 2.1) * .08, .8, Math.cos(i * 2.1) * .08], r: [.12 * Math.sin(i), 0, .1 * Math.cos(i)] }, 12));
    g.add(rolls); circles.push({ x: 3.7, z: 7.6, r: .35 });
    // pendants over the table + a round rug + lounge chair
    [[.4, 5.2], [2.0, 6.0]].forEach(([x, z]) => { g.add(cyl(.01, .01, 1.2, M.bronzeDark, { p: [x, H - .6, z] }, 8), mesh(new THREE.SphereGeometry(.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.bronze, { p: [x, H - 1.28, z], r: [Math.PI, 0, 0] }), mesh(new THREE.SphereGeometry(.12, 16, 12), M.glowWarm, { p: [x, H - 1.3, z], cast: false })); });
    pt(g, 0xffd8a0, 9, 7, 1.2, 2.2, 5.6); pt(g, 0xffe3bf, 6, 9, -2.2, 2.5, 4);
    g.add(mesh(new THREE.CylinderGeometry(2.2, 2.2, .014, 64), tiled(M.fabric, 3, 3, 1), { p: [-2.4, .008, 4.6], cast: false }));
    g.add(rbox(.9, .5, .85, .12, M.fabric, { p: [-2.4, .32, 4.6], r: [0, .5, 0] }), rbox(.9, .5, .2, .08, M.fabric, { p: [-2.7, .62, 4.7], r: [0, .5, 0] }));
    circles.push({ x: -2.4, z: 4.6, r: .65 });
  }
};

/* ============================ FLOOR 3: HOSPITALITY, a dark Japanese-inspired gallery ============================ */
const hospitality = {
  name: "hospitality", label: "Hospitality Design", note: "Intimate, sophisticated, immersive.", W: 14, D: 10, H: 3.6, style: "pavilion",
  face: M => M.plasterDark, floor: M => M.stoneDark, floorTile: 1.6, ceil: M => M.ceilDark, wall: M => M.oakDark, back: M => M.plasterDark, plinth: M => M.stoneDark,
  decor({ g, W, D, H, M, circles }) {
    g.add(new THREE.HemisphereLight(0xffd9a8, 0x2a1d12, .32));
    // shoji screens along both side walls: lit paper panels in a bronze-and-oak lattice
    [-1, 1].forEach(s => { for (let i = 0; i < 4; i++) {
      const z = 1.9 + i * 2.15, x = s * (W / 2 - .06);
      g.add(plane(1.9, 2.5, M.shoji, { p: [x - s * .005, 1.5, z], r: [0, -s * Math.PI / 2, 0], receive: false }));
      for (let k = 0; k <= 2; k++) g.add(box(.04, 2.55, .04, M.oakDark, { p: [x - s * .02, 1.5, z - .95 + k * .95] }));
      [.22, 1.5, 2.78].forEach(y => g.add(box(.04, .04, 1.95, M.oakDark, { p: [x - s * .02, y, z] })));
    } });
    // raised stone platform with a low timber table, paper lanterns hung at different heights
    g.add(box(5.2, .22, 2.4, M.stoneDark, { p: [0, .11, 8.6] }), box(5.24, .01, 2.44, M.bronzePolished, { p: [0, .225, 8.6], cast: false }));
    g.add(box(2.6, .1, .8, M.oak, { p: [0, .5, 8.6] }), ...[-1.1, 1.1].map(x => box(.08, .28, .6, M.oakDark, { p: [x, .33, 8.6] })));
    const lant = [[-3.2, 3.0, 2.6], [-1.6, 2.6, 5.4], [1.8, 2.9, 4.8], [3.4, 2.5, 2.9], [-.4, 2.7, 7.4], [.9, 2.4, 9.2]];
    lant.forEach(([x, y, z]) => { g.add(cyl(.004, .004, H - y, M.black, { p: [x, (H + y) / 2, z] }, 4), mesh(new THREE.SphereGeometry(.26, 24, 16), M.shoji, { p: [x, y, z], cast: false, receive: false })); });
    pt(g, 0xffb866, 10, 8, -1.6, 2.4, 5.4); pt(g, 0xffb866, 10, 8, 1.8, 2.4, 4.8); pt(g, 0xffc27a, 9, 8, 0, 2.2, 9);
    g.add(box(.5, .03, .5, M.glowWarm, { p: [0, .24, 9.6], cast: false, receive: false }));
    circles.push({ x: 0, z: 8.6, r: 2.4 });
  }
};

/* ============================ FLOOR 4: WORKPLACE, bright modular pods ============================ */
const workplace = {
  name: "workplace", label: "Workplace Design", note: "Open, collaborative, experimental.", W: 16, D: 12, H: 3.8, style: "pavilion",
  face: M => M.plasterLight, floor: M => M.oakLight, floorTile: 2.2, ceil: M => M.ceiling, wall: M => M.plasterLight,
  decor({ g, W, D, H, M, circles, updaters }) {
    g.add(new THREE.HemisphereLight(0xfff2dc, 0xa88a62, .55));
    for (let i = 0; i < 4; i++) g.add(box(.12, .05, D - 1, M.glowWarm, { p: [-5.5 + i * 3.65, H - .03, D / 2], cast: false, receive: false }));
    const pod = (x, z, w, d, h, rotY) => {
      const p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.y = rotY;
      p.add(box(w + .1, .1, d + .1, M.oak, { p: [0, h, 0] }), box(w, .06, d, M.oak, { p: [0, .03, 0] }));
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => p.add(box(.07, h, .07, M.bronze, { p: [a * w / 2, h / 2, b * d / 2] })));
      [[0, -d / 2, w, 0], [0, d / 2, w, 0], [-w / 2, 0, d, Math.PI / 2], [w / 2, 0, d, Math.PI / 2]].forEach(([px, pz, pw, ry], k) => { if (k === 1) return; p.add(plane(pw, h - .1, M.glass, { p: [px, h / 2, pz], r: [0, ry, 0], receive: false })); });
      p.add(rbox(w - .6, .4, .7, .08, M.fabricDeep, { p: [0, .26, -d / 2 + .7] }), box(.8, .04, .8, M.oakDark, { p: [0, .5, .2] }), cyl(.025, .025, .5, M.bronzeDark, { p: [0, .25, .2] }, 10));
      g.add(p); circles.push({ x, z, r: Math.max(w, d) * .62 });
    };
    pod(-6, 3.4, 2.6, 2.4, 2.5, .2); pod(6, 3.4, 2.6, 2.4, 2.5, -.2); pod(-6.2, 9, 2.6, 2.4, 2.5, -.15); pod(6.2, 9, 2.6, 2.4, 2.5, .15);
    // flexible partitions + hanging acoustic baffles
    [[-3, 5.4, .5], [3, 5.4, -.5], [-3.4, 10.2, 0], [3.4, 10.2, 0]].forEach(([x, z, ry]) => { g.add(box(2.2, 2.3, .06, tiled(M.oak, 2.2, 2.3, 1.4), { p: [x, 1.45, z], r: [0, ry, 0] }), box(2.24, .04, .1, M.bronze, { p: [x, 2.62, z], r: [0, ry, 0] })); circles.push({ x, z, r: 1.0 }); });
    for (let i = 0; i < 9; i++) g.add(box(.05, .55, 3.2, M.fabric, { p: [-4 + i * 1.0, H - .75, 6.3] }), cyl(.004, .004, .5, M.black, { p: [-4 + i * 1.0, H - .25, 4.8] }, 4));
    pt(g, 0xfff0d6, 14, 14, 0, 3.2, 6); pt(g, 0xfff0d6, 8, 10, -5, 3, 9.5); pt(g, 0xfff0d6, 8, 10, 5, 3, 2.8);
  }
};

/* ============================ FLOOR 5: OBJECTS & FURNITURE, a sculptural showroom ============================ */
const objects = {
  name: "objects", label: "Objects & Furniture", note: "Considered, tactile, gallery-lit.", W: 14, D: 11, H: 4.2, style: "turntable",
  face: M => M.plasterDark, floor: M => M.stoneDark, floorTile: 1.6, ceil: M => M.ceilDark, wall: M => M.plasterDark, plinth: null,
  decor({ g, W, D, H, M, circles }) {
    g.add(new THREE.HemisphereLight(0xffe0b0, 0x2c2016, .38));
    g.add(mesh(new THREE.TorusGeometry(2.6, .035, 16, 120), M.bronzePolished, { p: [0, 2.6, D - .12], cast: false }), mesh(new THREE.TorusGeometry(2.4, .016, 12, 120), M.glowWarm, { p: [0, 2.6, D - .1], cast: false, receive: false }));
    g.add(mesh(new THREE.CircleGeometry(2.3, 64), new THREE.MeshBasicMaterial({ color: 0x3a2a1c }), { p: [0, 2.6, D - .115], r: [0, Math.PI, 0], cast: false, receive: false }));
    // plinths with abstract sculptural forms along the side walls
    [[-1, 3.2, 0], [-1, 7.4, 1], [1, 3.2, 2], [1, 7.4, 3]].forEach(([s, z, k]) => {
      const x = s * (W / 2 - 1.0); g.add(box(.7, .9, .7, M.stoneDark, { p: [x, .45, z] }), box(.72, .012, .72, M.bronzePolished, { p: [x, .9, z], cast: false }));
      const geo = [new THREE.TorusKnotGeometry(.2, .06, 120, 16), new THREE.SphereGeometry(.26, 48, 32), new THREE.TorusGeometry(.24, .07, 24, 64), new THREE.IcosahedronGeometry(.27, 2)][k];
      g.add(mesh(geo, k % 2 ? M.mirror : M.bronzePolished, { p: [x, 1.25, z] }));
      const sp = new THREE.SpotLight(0xffe2b5, 22, 7, .4, .8, 2); sp.position.set(x - s * .6, 3.8, z); sp.target.position.set(x, 1.1, z); g.add(sp, sp.target);
      circles.push({ x, z, r: .6 });
    });
    g.add(box(W - 2, .02, .05, M.glowWarm, { p: [0, .06, D - .08], cast: false, receive: false }));
    pt(g, 0xffd7a0, 8, 9, 0, 3.4, 6);
  }
};

/* ============================ FLOOR 6: DESIGN PROCESS, a creative studio with pin-up walls ============================ */
const studio = {
  name: "process", label: "Design Process", note: "Creative, exploratory, personal, thoughtful.", W: 15, D: 11, H: 3.6, style: "wall",
  face: M => M.plasterLight, floor: M => M.oakLight, floorTile: 2.2, ceil: M => M.ceiling, wall: M => M.plasterLight,
  decor({ g, W, D, H, M, circles }) {
    g.add(new THREE.HemisphereLight(0xfff0d8, 0x9c7c58, .5));
    // long worktable with material sample trays
    g.add(box(4.2, .06, 1.3, M.oak, { p: [0, .86, 6.2] }), box(4.24, .02, 1.34, M.bronzePolished, { p: [0, .82, 6.2], cast: false }));
    [[-1.9, 5.7], [1.9, 5.7], [-1.9, 6.7], [1.9, 6.7]].forEach(([x, z]) => g.add(box(.07, .83, .07, M.bronzeDark, { p: [x, .415, z] })));
    const sw = [0xd8c3a0, 0xa07c52, 0x6e5a48, 0xe6dccb, 0x8d8a7c, 0xb39a7a, 0x4e4034, 0xc9b28e]; const rnd = rand(5);
    sw.forEach((c, i) => { const x = -1.7 + (i % 4) * 1.15, z = 5.9 + Math.floor(i / 4) * .6; g.add(box(.5, .03, .42, new THREE.MeshStandardMaterial({ color: c, roughness: .7 }), { p: [x, .905, z], r: [0, rnd() * .5 - .25, 0] })); });
    g.add(box(.9, .02, .6, M.fabric, { p: [1.2, .91, 6.8], r: [0, .1, 0] }));
    circles.push({ x: 0, z: 6.2, r: 2.35 });
    // string of bulbs across the room
    for (let i = 0; i < 9; i++) { const x = -5.6 + i * 1.4, y = H - .35 - Math.sin(i / 8 * Math.PI) * .1; g.add(mesh(new THREE.SphereGeometry(.06, 12, 10), M.glowWarm, { p: [x, y, 6.2], cast: false, receive: false })); }
    g.add(cyl(.004, .004, 11.5, M.black, { p: [0, H - .32, 6.2], r: [0, 0, Math.PI / 2] }, 4));
    pt(g, 0xffe0b0, 10, 12, -3, 2.8, 5); pt(g, 0xffe0b0, 10, 12, 3, 2.8, 7.5);
    g.add(box(W - 2, .03, .06, M.glowWarm, { p: [0, 2.9, 3], cast: false, receive: false }));
  }
};

/* ============================ FLOOR 7: THE DESIGN ARCHIVE, the impossible floor ============================ */
const archive = {
  name: "archive", label: "The Design Archive", note: "An impossible archive. Everything hangs in the air.", W: 18, D: 18, H: 7, style: "float",
  face: M => M.plasterDark, floor: M => M.mirrorDark, floorTile: 6, ceil: M => M.ceilDark, wall: M => M.plasterDark, cove: false,
  decor({ g, W, D, H, M, circles, updaters }) {
    g.add(new THREE.HemisphereLight(0xffd9a8, 0x1c140d, .3));
    // forced-perspective arch frames on the back wall: each smaller and brighter, so the wall seems to go on forever
    for (let i = 0; i < 9; i++) { const k = 1 - i * .105, w = 12 * k, h = 6 * k, y = 3 + (i * .12), z = D - .05 - i * .001;
      [[0, y + h / 2, w, .06], [0, y - h / 2, w, .06], [-w / 2, y, .06, h], [w / 2, y, .06, h]].forEach(([x, yy, ww, hh]) => g.add(box(ww, hh, .05, i % 2 ? M.glowWarm : M.bronzePolished, { p: [x, yy, z], cast: false, receive: i % 2 === 0 })));
    }
    // concentric light rings on the ceiling and a suspended bronze orrery at the heart of the room
    for (let i = 0; i < 6; i++) g.add(mesh(new THREE.TorusGeometry(2 + i * 1.5, .03, 8, 120), i % 2 ? M.glowWarm : M.bronzePolished, { p: [0, H - .08, 9.5], r: [Math.PI / 2, 0, 0], cast: false, receive: false }));
    const orr = new THREE.Group(); orr.position.set(0, 3.2, 9.5);
    [1.1, .8, .5].forEach((r, i) => { const t = mesh(new THREE.TorusGeometry(r, .012, 10, 90), M.bronzePolished, { cast: false }); t.rotation.set(i * 1.0, i * .6, 0); orr.add(t); });
    orr.add(mesh(new THREE.SphereGeometry(.12, 24, 16), M.glowWarm, { cast: false, receive: false })); g.add(orr);
    updaters.push((dt, t) => { orr.rotation.y = t * .25; orr.rotation.x = Math.sin(t * .3) * .2; });
    // floating bronze platforms hovering above the mirrored floor
    [[-6.2, 4.6, 1.5], [6.4, 6.2, 1.2], [-5.4, 13.6, 1.6], [5.8, 13.0, 1.3]].forEach(([x, z, r], i) => { const s = cyl(r, r, .08, M.bronze, { p: [x, .45 + i * .1, z] }); g.add(s, cyl(r - .06, r - .06, .01, M.glowWarm, { p: [x, .4 + i * .1, z], cast: false, receive: false })); circles.push({ x, z, r: r + .2 }); });
    // slim bronze columns that repeat into the dark
    for (let i = 0; i < 6; i++) [-1, 1].forEach(s => g.add(box(.18, H, .18, M.bronzeDark, { p: [s * (W / 2 - .4), H / 2, 1.6 + i * 3.0] }), box(.02, H, .02, M.glowWarm, { p: [s * (W / 2 - .52), H / 2, 1.6 + i * 3.0], cast: false, receive: false })));
    pt(g, 0xffd7a0, 12, 16, 0, 5.5, 9.5); pt(g, 0xffc890, 6, 12, 0, 3, 3.5);
  }
};

const CFG = { 1: about, 3: hospitality, 4: workplace, 5: objects, 6: studio, 7: archive };
export function buildFloor(n, M, opts) {
  const c = CFG[n]; if (!c) return null;
  return buildHall(M, c, opts);
}
