/* The champagne-bronze elevator: portal (shared by every floor) + the car behind it.
   Coordinates: the elevator wall is the plane z = 0, floors extend to +z, the car sits behind it (z < 0). */
import * as THREE from "three";
import { box, plane, cyl, mesh, tiled, rbox } from "./core.js";
import { labelTexture, redraw } from "./materials.js";

export const DOOR_W = 1.12, DOOR_H = 2.35, CAR = { w: 1.8, d: 1.6, h: 2.4, z0: -0.25 };

function indicatorDraw(text) {
  return (ctx, w, h) => {
    ctx.fillStyle = "#17120e"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffdca0"; ctx.shadowColor = "#ffb85a"; ctx.shadowBlur = 18;
    ctx.font = `500 ${h * .62}px "Josefin Sans","Helvetica Neue",Arial,sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2 + h * .03);
  };
}

/* ---------- portal wall: opening, bronze jambs, indicator, call button ---------- */
export function buildPortal(M, { W, H, face }) {
  const g = new THREE.Group(); g.name = "portal";
  const sideW = (W - DOOR_W) / 2, T = .25;
  const mk = (w, h, x, y) => {
    const m = tiled(face, w, h, 1.6), mats = [m, m, m, m, m, M.bronzeDark];
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, T), mats); b.position.set(x, y, -T / 2); b.castShadow = b.receiveShadow = true; return b;
  };
  g.add(mk(sideW, H, -(DOOR_W / 2 + sideW / 2), H / 2), mk(sideW, H, DOOR_W / 2 + sideW / 2, H / 2), mk(DOOR_W, H - DOOR_H, 0, DOOR_H + (H - DOOR_H) / 2));
  /* bronze architrave */
  const j = .09;
  [-1, 1].forEach(s => g.add(box(j, DOOR_H + .1, .12, M.bronze, { p: [s * (DOOR_W / 2 + j / 2), (DOOR_H + .1) / 2, .02] })));
  g.add(box(DOOR_W + j * 2, j, .12, M.bronze, { p: [0, DOOR_H + j / 2 + .02, .02] }));
  g.add(box(DOOR_W + .1, .03, .3, M.bronzeDark, { p: [0, .012, -.06], cast: false }));            // sill
  /* fine bronze reveals across the limestone, like a rainscreen grid */
  const step = 1.25;
  for (let x = DOOR_W / 2 + .5 + step * 0; x < W / 2 - .3; x += step) [-1, 1].forEach(s => {
    g.add(box(.012, H - .1, .006, M.bronzeDark, { p: [s * x, H / 2, .004], cast: false, receive: false }));
  });
  /* floor indicator plate above the doors */
  const tex = labelTexture(256, 128, indicatorDraw("L"));
  const plate = box(.5, .24, .035, M.bronzePolished, { p: [0, DOOR_H + .42, .02] });
  const scr = plane(.42, .17, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), { p: [0, DOOR_H + .42, .041] });
  g.add(plate, scr);
  /* call button (interactive) */
  const callPlate = box(.13, .34, .02, M.bronzePolished, { p: [DOOR_W / 2 + .42, 1.1, .015] });
  const callBtn = cyl(.032, .032, .016, M.bronze, { p: [DOOR_W / 2 + .42, 1.14, .03], r: [Math.PI / 2, 0, 0] });
  const callBtn2 = cyl(.032, .032, .016, M.bronze, { p: [DOOR_W / 2 + .42, 1.04, .03], r: [Math.PI / 2, 0, 0] });
  callBtn.userData = callBtn2.userData = { type: "call", label: "Call the elevator" };
  const halo = mesh(new THREE.RingGeometry(.036, .047, 32), M.glowWarm, { p: [DOOR_W / 2 + .42, 1.14, .04], cast: false }); halo.visible = false;
  g.add(callPlate, callBtn, callBtn2, halo);
  return { group: g, indicator: tex, callTargets: [callBtn, callBtn2], callHalo: halo, setIndicator: t => redraw(tex, indicatorDraw(t)) };
}

/* ---------- the car ---------- */
export function buildCar(M, floors) {
  const g = new THREE.Group(); g.name = "car";
  const { w, d, h, z0 } = CAR, zc = z0 - d / 2, zEnd = z0 - d;
  /* doors (slide into the wall thickness) */
  const doorMat = M.bronze;
  const dl = box(DOOR_W / 2, DOOR_H, .05, doorMat, { p: [-DOOR_W / 4, DOOR_H / 2, -.12] }), dr = box(DOOR_W / 2, DOOR_H, .05, doorMat, { p: [DOOR_W / 4, DOOR_H / 2, -.12] });
  [dl, dr].forEach((dm, i) => { const s = i ? -1 : 1; dm.add(box(.014, DOOR_H - .1, .012, M.bronzePolished, { p: [s * (DOOR_W / 4 - .02), 0, .03], cast: false })); });
  g.add(dl, dr);
  const setOpen = k => { dl.position.x = -DOOR_W / 4 - (DOOR_W / 2) * k; dr.position.x = DOOR_W / 4 + (DOOR_W / 2) * k; };

  /* shell */
  const floorMat = tiled(M.stoneFloor, w, d, .6); floorMat.color = new THREE.Color(0xd8c9b0);
  g.add(plane(w, d, floorMat, { p: [0, .002, zc], r: [-Math.PI / 2, 0, 0], receive: true }));
  g.add(plane(w, d, M.ceiling, { p: [0, h, zc], r: [Math.PI / 2, 0, 0], receive: true }));
  g.add(plane(.95, 1.15, M.glowSoft, { p: [0, h - .004, zc], r: [Math.PI / 2, 0, 0] }));
  [[-.5, 0, 1.0, .03], [.5, 0, 1.0, .03]].forEach(([x]) => g.add(box(.03, .02, 1.2, M.bronzePolished, { p: [x, h - .01, zc], cast: false })));
  [[-.58, 0], [.58, 0]].forEach(([z]) => g.add(box(1.06, .02, .03, M.bronzePolished, { p: [0, h - .01, zc + z], cast: false })));
  const bw = tiled(M.oakDark, w, h, 1.2);
  g.add(plane(w, h, bw, { p: [0, h / 2, zEnd], receive: true }));                                   // back wall (oak)
  g.add(plane(1.0, 1.05, M.mirror, { p: [0, 1.3, zEnd + .008], receive: false }));                  // bronze-tinted mirror
  g.add(box(1.06, .03, .025, M.bronzePolished, { p: [0, 1.84, zEnd + .014], cast: false }), box(1.06, .03, .025, M.bronzePolished, { p: [0, .76, zEnd + .014], cast: false }));
  g.add(plane(d, h, tiled(M.bronze, d, h, 1.2), { p: [-w / 2, h / 2, zc], r: [0, Math.PI / 2, 0], receive: true }));     // left wall faces +x
  g.add(plane(d, h, tiled(M.bronze, d, h, 1.2), { p: [w / 2, h / 2, zc], r: [0, -Math.PI / 2, 0], receive: true }));     // right wall faces -x
  [-1, 1].forEach(s => {                                                                                                    // skirting + handrails
    g.add(box(.02, .1, d, M.bronzeDark, { p: [s * (w / 2 - .01), .05, zc], cast: false }));
    g.add(cyl(.02, .02, d - .3, M.bronzePolished, { p: [s * (w / 2 - .06), .92, zc], r: [Math.PI / 2, 0, 0] }, 20));
    [-.5, .5].forEach(o => g.add(box(.05, .02, .02, M.bronzePolished, { p: [s * (w / 2 - .03), .92, zc + o], cast: false })));
  });
  g.add(cyl(.02, .02, w - .3, M.bronzePolished, { p: [0, .92, zEnd + .06], r: [0, 0, Math.PI / 2] }, 20));
  g.add(box(w, .1, .02, M.bronzeDark, { p: [0, .05, zEnd + .01], cast: false }));

  /* inner indicator above the doors (faces into the car) */
  const itex = labelTexture(256, 128, indicatorDraw("L"));
  g.add(plane(.42, .17, new THREE.MeshBasicMaterial({ map: itex, toneMapped: false }), { p: [0, DOOR_H + .24, z0 - .01], r: [0, Math.PI, 0] }));
  g.add(box(.5, .24, .03, M.bronzePolished, { p: [0, DOOR_H + .24, z0 - .002], cast: false }));

  /* control panel on the left wall (faces +x), buttons stack: 7 ... 1, L */
  const px = -w / 2 + .02, pz = z0 - .42;
  g.add(box(.035, 1.3, .27, M.bronzeDark, { p: [px, 1.62, pz] }));
  g.add(box(.012, 1.22, .21, M.bronzePolished, { p: [px + .018, 1.62, pz], cast: false }));
  const order = floors.map(f => f.n).sort((a, b) => b - a).concat(["L"]);
  const buttons = [], halos = {};
  order.forEach((n, i) => {
    const y = 2.06 - i * .125, bx = px + .03;
    const cap = cyl(.03, .03, .018, M.bronze, { p: [bx, y, pz], r: [0, 0, Math.PI / 2] }, 40);
    const num = labelTexture(128, 128, (ctx, W, H) => { ctx.fillStyle = "#6b4c2e"; ctx.font = `600 ${n === "L" ? 74 : 66}px "Josefin Sans","Helvetica Neue",Arial,sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(n), W / 2, H / 2 + 4); });
    const face = plane(.044, .044, new THREE.MeshBasicMaterial({ map: num, transparent: true, toneMapped: false }), { p: [bx + .0095, y, pz], r: [0, Math.PI / 2, 0], cast: false });
    const ring = mesh(new THREE.TorusGeometry(.036, .0055, 12, 40), M.bronzePolished, { p: [bx, y, pz], r: [0, Math.PI / 2, 0], cast: false });
    const halo = mesh(new THREE.RingGeometry(.041, .05, 40), M.glowWarm, { p: [bx + .004, y, pz], r: [0, Math.PI / 2, 0], cast: false }); halo.visible = false;
    cap.userData = { type: "button", floor: n, label: n === "L" ? "Lobby" : `Floor ${String(n).padStart(2, "0")}` }; cap.material = cap.material.clone();
    g.add(cap, face, ring, halo); buttons.push(cap); halos[n] = halo;
  });
  const light = new THREE.PointLight(0xffe2bd, 0, 4.2, 2); light.position.set(0, h - .25, zc); g.add(light);
  return {
    group: g, buttons, setOpen, door: { dl, dr }, light, indicators: [itex],
    setIndicator: t => redraw(itex, indicatorDraw(String(t))),
    setSelected: n => Object.entries(halos).forEach(([k, hh]) => (hh.visible = String(k) === String(n))),
    region: (x, z, r) => (Math.abs(x) < w / 2 - r - .08 && z < z0 - .05 && z > zEnd + r + .1) || (Math.abs(x) < DOOR_W / 2 - r && z <= .95 && z >= z0 - .06),
  };
}
