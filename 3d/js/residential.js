/* Scene 3: Residential Design floor. A long hall that opens into a curved apse.
   Three exhibition pavilions carry the real portfolio cover pages (textures come from your existing project images). */
import * as THREE from "three";
import { box, plane, cyl, mesh, rbox, tiled } from "./core.js";
import { buildPortal } from "./elevator.js";
import { labelTexture } from "./materials.js";
import { lookYaw } from "./lobby.js";

export function buildResidential(M, { mobile, loader, exhibits }) {
  const W = 14, R = W / 2, ZS = 5, H = 3.8, g = new THREE.Group(); g.name = "residential";
  const portal = buildPortal(M, { W, H, face: M.stoneWall }); g.add(portal.group);

  /* footprint: rectangle (z 0..5) + half circle (apse) */
  const shape = new THREE.Shape(); shape.moveTo(-R, 0); shape.lineTo(R, 0); shape.lineTo(R, -ZS); shape.absarc(0, -ZS, R, 0, Math.PI, true); shape.lineTo(-R, 0);
  const fgeo = new THREE.ShapeGeometry(shape, 64); fgeo.rotateX(-Math.PI / 2);
  const floor = new THREE.Mesh(fgeo, tiled(M.stoneFloor, 1, 1, 1.5)); floor.receiveShadow = true; floor.position.y = 0; g.add(floor);
  const ceil = new THREE.Mesh(fgeo.clone(), M.ceiling); ceil.position.y = H; ceil.receiveShadow = true; g.add(ceil);

  /* curved apse wall (plaster) + hidden cove lights top and bottom */
  const apse = mesh(new THREE.CylinderGeometry(R, R, H, 96, 1, true, -Math.PI / 2, Math.PI), tiled(M.plaster, Math.PI * R, H, 1.6), { p: [0, H / 2, ZS], cast: false });
  apse.material.side = THREE.BackSide; g.add(apse);
  const cove = (y, h, col) => { const m = mesh(new THREE.CylinderGeometry(R - .06, R - .06, h, 96, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshBasicMaterial({ color: col, side: THREE.BackSide, toneMapped: false }), { p: [0, y, ZS], cast: false, receive: false }); g.add(m); };
  cove(.06, .05, 0xffd9a0); cove(H - .22, .05, 0xffe6c0);

  /* straight side walls */
  // left wall: oak panelling with bronze reveals
  g.add(box(.2, H, ZS, tiled(M.oak, ZS, H, 1.4), { p: [-R + .05, H / 2, ZS / 2] }));
  for (let z = 0; z <= ZS; z += 1.25) g.add(box(.02, H, .05, M.bronze, { p: [-R + .16, H / 2, z] }));
  // right wall: piers + three daylight bays
  const piers = [[0, .7], [1.9, 2.3], [3.5, 3.9], [4.9, 5.0]];
  piers.forEach(([a, b]) => g.add(box(.3, H, b - a, M.stoneWall, { p: [R + .1, H / 2, (a + b) / 2] })));
  [[.7, 1.9], [2.3, 3.5], [3.9, 4.9]].forEach(([a, b]) => {
    const c = (a + b) / 2; g.add(box(.3, H - 3.1, b - a, M.stoneWall, { p: [R + .1, 3.1 + (H - 3.1) / 2, c] }));
    g.add(box(.3, .15, b - a, M.stoneWall, { p: [R + .1, .075, c] }));
    g.add(box(.05, 2.95, .04, M.bronze, { p: [R - .02, 1.62, c] }));
    g.add(box(.05, .04, b - a, M.bronze, { p: [R - .02, 2.4, c] }));
  });
  g.add(plane(ZS + 1, H, M.daylight, { p: [R + .5, H / 2, ZS / 2], r: [0, -Math.PI / 2, 0], receive: false }));
  // elevator wall: broad oak panels either side of the portal
  [-1, 1].forEach(s => { g.add(box(4.2, 3.4, .04, tiled(M.oak, 4.2, 3.4, 1.4), { p: [s * 4.5, 1.8, .035] })); [2.4, 6.6].forEach(x => g.add(box(.02, 3.4, .045, M.bronze, { p: [s * x, 1.8, .04], cast: false }))); });

  /* ceiling: soft oculus + suspended bronze ring (the quiet impossible moment) */
  const oc = [0, 6.2];
  g.add(mesh(new THREE.CircleGeometry(2.7, 80), new THREE.MeshBasicMaterial({ color: 0xfff1d8, toneMapped: false }), { p: [oc[0], H - .004, oc[1]], r: [Math.PI / 2, 0, 0], cast: false }));
  g.add(mesh(new THREE.TorusGeometry(2.78, .03, 16, 120), M.bronzePolished, { p: [oc[0], H - .02, oc[1]], r: [Math.PI / 2, 0, 0], cast: false }));
  const ringGrp = new THREE.Group(); ringGrp.position.set(oc[0], 3.05, oc[1]);
  const hover = mesh(new THREE.TorusGeometry(2.1, .035, 20, 140), M.bronzePolished, { cast: true }); hover.rotation.x = Math.PI / 2;
  const hover2 = mesh(new THREE.TorusGeometry(1.7, .018, 14, 120), M.glowWarm, { cast: false, receive: false }); hover2.rotation.x = Math.PI / 2;
  ringGrp.add(hover, hover2); g.add(ringGrp);
  [-1, 1].forEach(s => g.add(box(.08, .02, ZS - .6, M.glowWarm, { p: [s * (R - .3), H - .12, ZS / 2], cast: false, receive: false })));

  /* a soft round rug under the oculus, benches along the sides, a sculptural arc lamp */
  g.add(mesh(new THREE.CylinderGeometry(3.1, 3.1, .014, 80), tiled(M.fabric, 3, 3, 1), { p: [oc[0], .008, oc[1]], cast: false, receive: true }));
  const circles = [];
  [[-3.4, 3.1], [3.4, 3.1]].forEach(([x, z]) => {
    g.add(rbox(2.2, .42, .7, .06, M.fabric, { p: [x, .3, z], r: [0, x < 0 ? .15 : -.15, 0] }));
    g.add(box(1.9, .09, .5, M.black, { p: [x, .045, z], r: [0, x < 0 ? .15 : -.15, 0], cast: false }));
    circles.push({ x: x - .6, z, r: .7 }, { x: x + .6, z, r: .7 });
  });
  const lampCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1.1, 0), new THREE.Vector3(-.15, 1.75, 0), new THREE.Vector3(-.65, 2.05, 0), new THREE.Vector3(-1.05, 1.9, 0)]);
  const lamp = new THREE.Group(); lamp.position.set(5.9, 0, 4.2);
  lamp.add(cyl(.3, .32, .05, M.bronzeDark, { p: [0, .025, 0] }), mesh(new THREE.TubeGeometry(lampCurve, 40, .016, 10), M.bronzePolished));
  const shade = mesh(new THREE.SphereGeometry(.24, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.bronze, { p: [-1.05, 1.87, 0], r: [Math.PI, 0, 0] });
  const bulb = mesh(new THREE.SphereGeometry(.14, 24, 12), M.glowWarm, { p: [-1.05, 1.84, 0], cast: false });
  lamp.add(shade, bulb); lamp.rotation.y = -.5; g.add(lamp); circles.push({ x: 5.7, z: 4.2, r: .5 });

  /* ---------- exhibition pavilions ---------- */
  const targets = [], pav = [];
  exhibits.forEach(ex => {
    const [x, z] = ex.pos, p = new THREE.Group(); p.position.set(x, 0, z);
    const dx = (ex.focus?.[0] ?? 0) - x, dz = (ex.focus?.[1] ?? 2.2) - z; p.rotation.y = Math.atan2(dx, dz);
    const stone = tiled(M.stoneWall, 3.2, 1.9, 1.2);
    p.add(rbox(3.3, .14, 2.0, .015, stone, { p: [0, .13, 0] }));
    p.add(box(3.0, .03, 1.7, M.glowWarm, { p: [0, .045, 0], cast: false, receive: false }));
    p.add(box(3.34, .012, 2.04, M.bronzePolished, { p: [0, .2, 0], cast: false }));
    [-1, 1].forEach(s => p.add(cyl(.024, .024, 1.0, M.bronzePolished, { p: [s * 1.0, .72, -.4] }, 20)));
    const frameMat = M.bronze.clone();
    const frame = box(2.52, 1.62, .07, frameMat, { p: [0, 1.5, -.4], name: "frame" }); p.add(frame);
    const tex = loader.load(ex.image, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; img.material.needsUpdate = true; }, undefined, () => {});
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const img = plane(2.4, 2.4 / 1.545, new THREE.MeshBasicMaterial({ map: tex, color: 0xd9d4cc, toneMapped: false }), { p: [0, 1.5, -.4 + .037] });
    p.add(img);
    const label = labelTexture(512, 160, (ctx, w, h) => {
      ctx.fillStyle = "#f1e9db"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#2b2622";
      ctx.font = `600 44px "Josefin Sans","Helvetica Neue",Arial,sans-serif`; ctx.textBaseline = "alphabetic"; ctx.fillText(ex.title.toUpperCase(), 30, 74);
      ctx.fillStyle = "#8a6b49"; ctx.font = `400 26px "Josefin Sans","Helvetica Neue",Arial,sans-serif`; ctx.fillText(ex.category.toUpperCase() + "  ·  VIEW PROJECT", 30, 118);
    });
    const plaque = new THREE.Group(); plaque.position.set(0, .45, .75); plaque.rotation.x = -.95;
    plaque.add(box(1.04, .33, .025, M.bronze, { cast: true }), plane(1.0, .3125, new THREE.MeshStandardMaterial({ map: label, roughness: .5 }), { p: [0, 0, .014], cast: false }));
    p.add(plaque, box(.06, .32, .06, M.bronzeDark, { p: [0, .3, .62], r: [.4, 0, 0] }));
    const hit = new THREE.Mesh(new THREE.BoxGeometry(3.3, 2.5, 2.0), new THREE.MeshBasicMaterial({ visible: false })); hit.position.set(0, 1.25, 0);
    hit.userData = { type: "exhibit", id: ex.id, label: ex.title }; p.add(hit); targets.push(hit);
    const spot = new THREE.SpotLight(0xffe4bd, 55, 10, .62, .85, 2); spot.position.set(0, 3.55, 2.3); spot.target.position.set(0, 1.4, -.4); p.add(spot, spot.target);
    g.add(p); circles.push({ x, z, r: 1.45 });
    pav.push({ id: ex.id, frameMat, frame, group: p });
  });

  /* lights */
  g.add(new THREE.HemisphereLight(0xfff3e2, 0xb89c75, .3));
  const sun = new THREE.DirectionalLight(0xffe5c0, 1.6); sun.position.set(R + 10, 8, 3); sun.target.position.set(0, 0, 4.5); sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; sun.shadow.radius = 4;
  g.add(sun, sun.target);
  const oc1 = new THREE.PointLight(0xffdca8, 18, 12, 2); oc1.position.set(0, H - .5, 6.2); g.add(oc1);
  [-1, 1].forEach(s => { const l = new THREE.PointLight(0xffd8a0, 5, 4.5, 2); l.position.set(s * 1.45, 1.9, .5); g.add(l); });
  const apseL = new THREE.PointLight(0xffd7a0, 7, 9, 2); apseL.position.set(0, 2.2, 10.2); g.add(apseL);
  const aisle = new THREE.PointLight(0xfff0d6, 5, 8, 2); aisle.position.set(0, 3.0, 2.6); g.add(aisle);

  /* stations: authored viewing spots in front of each pavilion */
  const view = ex => { const [x, z] = ex.pos, dx = (ex.focus?.[0] ?? 0) - x, dz = (ex.focus?.[1] ?? 2.2) - z, l = Math.hypot(dx, dz), d = 3.5;
    const sx = x + dx / l * d, sz = z + dz / l * d; return { x: sx, z: sz, yaw: lookYaw(sx, sz, x, z), pitch: -.04 }; };
  const stations = [{ id: "arrival", title: "Residential Design", note: "Three residences, three ways of living.", x: 0, z: 2.55, yaw: Math.PI, pitch: -.04 },
    ...exhibits.map(ex => ({ id: ex.id, title: ex.title, exhibit: ex.id, ...view(ex) })),
    { id: "return", title: "Back to the elevator", note: "The elevator is always here.", x: 0, z: 3.0, yaw: 0, pitch: 0 }];
  const inside = (x, z, r = .3) => {
    if (z < .5 + r) return false;
    if (z <= ZS) return Math.abs(x) < R - .4 - r + .15;
    return Math.hypot(x, z - ZS) < R - .45 - r + .15;
  };
  return {
    group: g, name: "residential", portal, targets, pav, W, H, stations, colliders: { circles, rects: [] }, inside,
    update(dt, t) { ringGrp.rotation.y = t * .06; ringGrp.rotation.x = Math.sin(t * .2) * .02; }
  };
}
