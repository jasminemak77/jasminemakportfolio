/* THE IMPOSSIBLE ELEVATOR, 3D prototype: lobby, elevator, residential floor.
   Flow: lobby -> elevator car -> floor. One shared camera rig drives guided and explore modes. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createMaterials } from "./materials.js";
import { Tweens, Sound, ease, lerp } from "./core.js";
import { CameraRig } from "./nav.js";
import { buildCar } from "./elevator.js";
import { buildLobby, lookYaw } from "./lobby.js";
import { buildResidential } from "./residential.js";
import { buildFloor } from "./floors.js";
import { exhibitsFor, FLOOR_PROJECTS } from "./content.js";
import { Projects } from "./projects.js";

const $ = id => document.getElementById(id);
const mobile = matchMedia("(pointer:coarse)").matches || innerWidth < 760;
const reducedMQ = matchMedia("(prefers-reduced-motion: reduce)");
const FLOORS = (window.FLOORS || []).map(f => ({ n: f.n, label: f.label }));
const CAR_L = 3;
const FLOOR_OF = id => +Object.keys(FLOOR_PROJECTS).find(n => FLOOR_PROJECTS[n].includes(id)) || null;

/* ---------- renderer (with a clean fallback when WebGL is unavailable) ---------- */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: $("gl"), antialias: true, powerPreference: "high-performance" });
  if (!renderer.capabilities.isWebGL2 && !renderer.getContext()) throw new Error("no webgl");
} catch (e) { $("intro").hidden = true; $("fallback").hidden = false; throw e; }
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .7;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
let dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2); renderer.setPixelRatio(dpr);

const scene = new THREE.Scene(); scene.background = new THREE.Color(0x14110e);
const camera = new THREE.PerspectiveCamera(58, 1, .05, 60);
const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(renderer), .04).texture;

const tw = new Tweens(), sound = new Sound();
const rig = new CameraRig(camera, $("gl"), tw, { reduced: reducedMQ.matches });
const S = { mode: "guided", place: "lobby", floor: "L", doorsOpen: false, busy: false, step: 0, steps: [], fast: reducedMQ.matches, overlay: false };
tw.scale = S.fast ? .02 : 1;

/* ---------- build the world ---------- */
const manager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(manager);
const projectsData = new Projects();
let M, lobby, resid, car, places;
function build() {
  M = createMaterials(renderer);
  car = buildCar(M, FLOORS);
  lobby = buildLobby(M, { mobile }); lobby.targets = [];
  scene.add(car.group, lobby.group);
  places = { L: lobby };
  car.door.dl.userData = car.door.dr.userData = { type: "doors", label: "Elevator doors" };
}
/* floors are built the first time they are visited, so the first load stays quick */
function ensure(n) {
  if (places[n]) return places[n];
  const pd = { title: id => projectsData.title(id), category: id => projectsData.category(id), cover: id => projectsData.cover(id) };
  const ex = n === 2 ? [
    { id: "live-work-condo", title: "Live Work Condo", category: "Residential Design", pos: [4.4, 7.0], image: projectsData.cover("live-work-condo") },
    { id: "living-without-barriers", title: "Living Without Barriers", category: "Residential Design", pos: [0, 9.7], image: projectsData.cover("living-without-barriers") },
    { id: "ledger-residence", title: "Ledger Residence", category: "Residential Design", pos: [-4.4, 7.0], image: projectsData.cover("ledger-residence") }] : exhibitsFor(n, pd);
  const pl = n === 2 ? buildResidential(M, { mobile, loader, exhibits: ex }) : buildFloor(n, M, { mobile, loader, exhibits: ex });
  pl.group.visible = false; scene.add(pl.group); places[n] = pl; pl.portal.setIndicator(String(S.floor)); return pl;
}

/* ---------- walkability + collision ---------- */
const place = () => places[S.floor];
function walkable(x, z) {
  const sc = place(), r = .3;
  if (S.doorsOpen && car.region(x, z, r)) return true;
  if (!sc.inside(x, z, r)) return false;
  for (const c of sc.colliders.circles) if (Math.hypot(x - c.x, z - c.z) < c.r + r) return false;
  return true;
}
rig.walkable = walkable;

/* ---------- doors ---------- */
let doorK = 0;
async function openDoors() {
  if (S.doorsOpen || doorK > 0 && tw.items.some(i => i.door)) return;
  sound.click(); S.doorsOpen = true;
  const p = tw.run(1.5, k => { doorK = k; car.setOpen(k); car.light.intensity = CAR_L * k; }, ease.inOut); tw.items[tw.items.length - 1].door = true; await p;
}
async function closeDoors() {
  if (!S.doorsOpen && doorK === 0) return; S.doorsOpen = false;
  const from = doorK, p = tw.run(1.3, k => { doorK = from * (1 - k); car.setOpen(doorK); if (S.where !== "inside") car.light.intensity = CAR_L * doorK; }, ease.inOut); tw.items[tw.items.length - 1].door = true; await p;
}

/* ---------- HUD helpers ---------- */
const hud = { live: null };
function say(t) { $("placeTitle").textContent = t.title; $("placeKicker").textContent = t.kicker || ""; }
function toast(msg, link) {
  const el = $("toast"); el.innerHTML = ""; el.append(msg + " ");
  if (link) { const a = document.createElement("a"); a.href = link.href; a.textContent = link.text; el.append(a); }
  el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (el.hidden = true), 6000);
}
function floorLabel() { return S.floor === "L" ? { kicker: "Ground", title: "The Lobby" } : { kicker: `Floor ${String(S.floor).padStart(2, "0")}`, title: FLOORS.find(f => f.n === S.floor)?.label || "" }; }
function refresh() {
  const inCar = S.where === "inside", steps = S.steps, cur = steps[S.step];
  $("floors").hidden = !(inCar && !S.busy);
  $("steps").style.visibility = S.mode === "guided" && !inCar ? "visible" : "hidden";
  $("prevBtn").disabled = S.busy || S.step <= 0 || S.overlay; $("nextBtn").disabled = S.busy || S.overlay || S.step >= steps.length - 1 && cur?.id === "enter";
  $("nextBtn").textContent = cur?.id === "return" || cur?.id === "elevator" ? "Step inside ›" : "Next ›";
  $("stepLabel").textContent = cur ? `${S.step + 1} / ${steps.length} · ${cur.title}` : "";
  $("modeGuided").setAttribute("aria-pressed", S.mode === "guided"); $("modeExplore").setAttribute("aria-pressed", S.mode === "explore");
  $("openProj").hidden = !(cur && cur.exhibit && S.mode === "guided" && !S.busy);
  if (cur && cur.exhibit) $("openProj").textContent = `View ${cur.title}`;
  $("toElevator").disabled = S.busy || inCar; $("toElevator").hidden = inCar; $("exitCar").hidden = !(inCar && !S.busy); $("projList").hidden = inCar;
}

/* ---------- guided steps for the place we are in ---------- */
function stepsFor(where) {
  if (where === "lobby") return [...lobby.stations, { id: "enter", title: "Step into the elevator" }];
  if (where === "floor") return [...place().stations, { id: "enter", title: "Step into the elevator" }];
  return [];
}
async function goStep(i) {
  if (S.busy) return; const st = S.steps[i]; if (!st) return; S.step = i; refresh();
  if (st.id === "enter") return enterCar();
  S.busy = true; refresh();
  const near = st.id === "elevator" || st.id === "return";
  if (near && !S.doorsOpen) setTimeout(openDoors, 500);
  await rig.glide(st); S.busy = false; $("live").textContent = st.title + (st.note ? ". " + st.note : ""); refresh();
}

/* ---------- entering the car, choosing a floor, travelling ---------- */
const PANEL = { x: .45, z: -1.5, yaw: lookYaw(.45, -1.5, -.88, -.67), pitch: .02 };
const FACE = { x: 0, z: -1.35, yaw: Math.PI, pitch: 0 };
async function enterCar() {
  if (S.where === "inside" || S.busy) return; S.busy = true; refresh();
  await openDoors();
  if (rig.z > 2.2) await rig.glide({ x: 0, z: 1.8, yaw: 0, pitch: 0 }, S.mode === "guided" ? 1.6 : 1.1);
  await rig.glide({ x: 0, z: -.95, yaw: 0, pitch: 0 }, 1.5); await rig.glide({ ...FACE }, 1.2);
  S.where = "inside"; S.steps = []; $("floors").hidden = false;
  await closeDoors(); car.light.intensity = CAR_L;
  await rig.glide(PANEL, 1.0);
  S.busy = false; say({ kicker: "Elevator", title: "Choose a floor" }); $("live").textContent = "You are in the elevator. Choose a floor, or step out."; refresh();
  $("floorList").querySelector("button")?.focus({ preventScroll: true });
}
/* step back out of the car onto the floor we are on (also what choosing the current floor does) */
async function stepOut() {
  if (S.where !== "inside" || S.busy) return; S.busy = true; $("floors").hidden = true; refresh();
  await rig.glide({ ...FACE }, .8); await openDoors(); await leaveToFloor(); S.busy = false; refresh();
}
async function leaveToFloor() {
  S.where = S.floor === "L" ? "lobby" : "floor"; S.steps = stepsFor(S.where);
  await rig.glide({ x: 0, z: -.95, yaw: Math.PI, pitch: 0 }, .7);
  if (S.mode === "guided") { S.step = 0; await rig.glide(S.steps[0], 2.2); } else await rig.glide({ x: 0, z: 2.6, yaw: Math.PI, pitch: 0 }, 1.6);
  say(floorLabel()); $("live").textContent = floorLabel().title + ". " + (S.steps[0]?.note || ""); refresh();
}
async function travel(target) {
  if (S.busy || S.where !== "inside") return;
  const t = target === "L" ? "L" : +target;
  if (t === S.floor) return stepOut();
  S.busy = true; if (t !== "L") { $("floors").hidden = true; await new Promise(r => setTimeout(r, 30)); ensure(t); } car.setSelected(t); sound.click(); $("floors").hidden = true; refresh();
  const n = v => (v === "L" ? 0 : v), a = n(S.floor), b = n(t), dur = Math.min(4.4, 2.2 + Math.abs(b - a) * .5);
  if (S.mode === "guided") await rig.glide({ ...FACE }, 1.0);
  sound.humStart(); let swapped = false, last = "";
  const base = rig.eye;
  await tw.run(dur, (k) => {
    const v = lerp(a, b, ease.inOut(Math.min(1, k * 1.05))), lab = String(Math.round(v) === 0 ? "L" : Math.round(v));
    if (lab !== last) { last = lab; car.setIndicator(lab); Object.values(places).forEach(pl => pl.portal.setIndicator(lab)); }
    rig.shake = S.fast ? 0 : .006 * Math.sin(Math.PI * k) ; car.light.intensity = CAR_L * (1 - .25 * Math.sin(Math.PI * k) * (.6 + .4 * Math.sin(k * 40)));
    if (!swapped && k > .55) { swapped = true; places[S.floor].group.visible = false; S.floor = t; places[t].group.visible = true; car.setSelected(t); }
  }, ease.lin);
  rig.shake = 0; sound.humStop(); car.setIndicator(String(t)); sound.ding();
  say({ kicker: "Arrived", title: t === "L" ? "The Lobby" : FLOORS.find(f => f.n === t)?.label || "" });
  await openDoors(); car.setSelected(null);
  await leaveToFloor(); S.busy = false; refresh();
}

/* ---------- interaction: hover, click, keyboard ---------- */
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function interactives() {
  const l = [...car.buttons, car.door.dl, car.door.dr];
  const pl = place(); l.push(...pl.portal.callTargets, ...(pl.targets || []));
  return l;
}
function pick(ev) {
  const r = $("gl").getBoundingClientRect(); mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mouse, camera); const hits = ray.intersectObjects(interactives(), false).filter(h => h.object.userData.type);
  return hits[0]?.object || null;
}
let hovered = null;
$("gl").addEventListener("pointermove", ev => {
  if (S.overlay || rig.drag) return; const o = pick(ev), tip = $("tip");
  hovered = o; $("gl").style.cursor = o ? "pointer" : (S.mode === "explore" ? "crosshair" : "grab");
  if (o) { tip.textContent = o.userData.label; tip.hidden = false; tip.style.transform = `translate(${ev.clientX + 14}px,${ev.clientY + 14}px)`; } else tip.hidden = true;
});
$("gl").addEventListener("pointerleave", () => { hovered = null; $("tip").hidden = true; });
$("gl").addEventListener("pointerup", ev => {
  sound.unlock(); if (rig.moved || S.overlay || S.busy) return;
  const o = pick(ev);
  if (o) return activate(o.userData);
  if (S.mode === "explore" && !rig.locked) {                                // click the floor to walk there
    const r = $("gl").getBoundingClientRect(); mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera); const p = new THREE.Vector3(); if (ray.ray.intersectPlane(floorPlane, p) && rig.walkTo(p.x, p.z)) $("live").textContent = "Walking";
  }
});
function activate(d) {
  if (d.type === "doors" || d.type === "call") return S.where === "inside" ? null : enterCar();
  if (d.type === "button") return travel(d.floor);
  if (d.type === "exhibit") return viewExhibit(d.id);
}
async function viewExhibit(id) {
  if (S.busy) return; const st = place().stations.find(s => s.exhibit === id); if (!st) return;
  S.busy = true; refresh(); await rig.glide(st, 1.8); S.busy = false;
  const i = S.steps.findIndex(s => s.id === st.id); if (i >= 0) S.step = i; refresh(); openProject(id);
}
function openProject(id) { S.overlay = true; rig.locked = true; projectsData.open(id, () => { S.overlay = false; rig.locked = false; refresh(); $("gl").focus({ preventScroll: true }); }); refresh(); }

/* ---------- HUD events ---------- */
function setMode(m) {
  S.mode = m; rig.setMode(m); $("gl").style.cursor = m === "explore" ? "crosshair" : "grab";
  if (m === "explore" && S.where !== "inside") { rig.eye = 1.62; }
  $("live").textContent = m === "explore" ? "Explore mode. Click the floor to walk, or use W A S D and drag to look." : "Guided mode."; refresh();
}
$("modeGuided").onclick = () => { setMode("guided"); const i = Math.max(0, S.steps.findIndex(s => Math.hypot(s.x - rig.x, s.z - rig.z) < 1.6)); if (S.where !== "inside") { S.step = i; goStep(i); } };
$("modeExplore").onclick = () => { if (!S.busy) setMode("explore"); };
$("prevBtn").onclick = () => goStep(S.step - 1); $("nextBtn").onclick = () => goStep(S.step + 1);
$("openProj").onclick = () => { const st = S.steps[S.step]; if (st?.exhibit) openProject(st.exhibit); };
$("projList").onclick = () => projectsData.list(viewIfHere, () => { S.overlay = false; rig.locked = false; }, FLOOR_OF);
function viewIfHere(id) { const n = FLOOR_OF(id); S.overlay = false; rig.locked = false; if (n === S.floor && S.where === "floor") viewExhibit(id); else toast(`Take the elevator to Floor ${String(n).padStart(2, "0")} to see this project in 3D.`); }
$("projList").addEventListener("click", () => { S.overlay = true; rig.locked = true; });
$("toElevator").onclick = async () => {
  if (S.busy || S.where === "inside") return;
  enterCar();
};
$("exitCar").onclick = () => stepOut();
$("soundBtn").onclick = () => { sound.on = !sound.on; $("soundBtn").textContent = sound.on ? "Sound on" : "Sound off"; $("soundBtn").setAttribute("aria-pressed", sound.on); if (!sound.on) sound.humStop(); };
function setFast(v) { S.fast = v; tw.scale = v ? .02 : 1; rig.reduced = v || reducedMQ.matches; $("skipBtn").setAttribute("aria-pressed", v); }
$("skipBtn").onclick = () => setFast(!S.fast);
$("helpBtn").onclick = () => { const h = $("help"); h.hidden = !h.hidden; $("helpBtn").setAttribute("aria-expanded", !h.hidden); };
addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT") return;
  if (S.overlay) return;
  if (e.key === "Escape") { $("help").hidden = true; return; }
  if (S.mode === "guided" && !S.busy && S.where !== "inside") {
    if (e.key === "ArrowRight") goStep(S.step + 1); else if (e.key === "ArrowLeft") goStep(S.step - 1);
  }
  if (S.where === "inside" && /^[1-7l]$/i.test(e.key)) travel(e.key.toLowerCase() === "l" ? "L" : +e.key);
  if (S.where === "inside" && (e.key === "Escape" || e.key.toLowerCase() === "x")) stepOut();
  if (S.where !== "inside" && !S.busy && e.key.toLowerCase() === "e") enterCar();
});

/* floor chooser (keyboard-accessible alternative to the 3D buttons) */
function buildFloorList() {
  const list = $("floorList"); list.innerHTML = "";
  [...FLOORS].sort((a, b) => b.n - a.n).concat([{ n: "L", label: "Lobby" }]).forEach(f => {
    const b = document.createElement("button"); b.className = "floor"; b.dataset.n = f.n;
    b.innerHTML = `<span>${f.n === "L" ? "L" : String(f.n).padStart(2, "0")}</span>${f.label}`;
    b.onclick = () => travel(f.n); list.append(b);
  });
}

/* ---------- main loop with simple adaptive quality ---------- */
const clock = new THREE.Clock(); let acc = 0, frames = 0, lowCount = 0, inside = false;
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(.05, clock.getDelta()), t = clock.elapsedTime;
  tw.update(dt); rig.update(dt);
  lobby.update(dt, t); if (S.floor !== "L") place().update(dt, t);
  if (S.mode === "explore" && !S.busy && !rig.locked) {                               // explore-mode triggers
    if (S.where !== "inside") {
      const nearDoor = Math.abs(rig.x) < 1.7 && rig.z < 3.3;
      if (nearDoor && !S.doorsOpen) openDoors();
      if (S.doorsOpen && !nearDoor && rig.z > 4.8) closeDoors();
      if (S.doorsOpen && rig.z < -.3 && Math.abs(rig.x) < .8) { S.where = "inside"; S.steps = []; closeDoors().then(() => { car.light.intensity = CAR_L; say({ kicker: "Elevator", title: "Choose a floor" }); refresh(); }); refresh(); }
    } else if (S.doorsOpen && rig.z > .7) { S.where = S.floor === "L" ? "lobby" : "floor"; S.steps = stepsFor(S.where); say(floorLabel()); refresh(); }
  }
  /* hover glow on exhibits */
  (place().pav || []).forEach(p => { const on = hovered && hovered.userData.id === p.id; p.frameMat.emissive.setHex(0x5a3a18); p.frameMat.emissiveIntensity = lerp(p.frameMat.emissiveIntensity, on ? .55 : 0, .15); });
  renderer.render(scene, camera);
  acc += dt; frames++;
  if (acc > 2) { const fps = frames / acc; acc = 0; frames = 0; if (fps < 26 && dpr > .8) { dpr = Math.max(.75, dpr - .25); renderer.setPixelRatio(dpr); resize(); } }
}
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < .8 ? 74 : 58; camera.updateProjectionMatrix(); }
addEventListener("resize", resize);

/* ---------- boot ---------- */
manager.onProgress = (u, i, n) => { $("loadBar").style.width = Math.round((i / Math.max(1, n)) * 100) + "%"; };
requestAnimationFrame(() => setTimeout(() => {
  build(); resize(); buildFloorList();
  rig.place({ x: 0, z: 8.5, yaw: 0, pitch: -.03 }); rig.update(0);
  S.where = "lobby"; S.steps = stepsFor("lobby"); S.step = 0; car.setIndicator("L"); lobby.portal.setIndicator("L");
  renderer.compile(scene, camera);
  const ready = () => { $("loadBar").style.width = "100%"; $("loadMsg").textContent = "Ready."; $("enter").hidden = false; $("enter").focus(); };
  if (manager.itemsLoading === 0 || true) setTimeout(ready, 400);
  loop();
}, 60));
$("enter").onclick = async () => {
  sound.unlock(); $("intro").classList.add("gone"); setTimeout(() => ($("intro").hidden = true), 900);
  S.busy = true; S.intro = true; const w = $("welcome"); const skipIntro = () => { if (S.intro) setFast(true); }; $("gl").addEventListener("pointerdown", skipIntro, { once: true }); addEventListener("keydown", skipIntro, { once: true });
  /* grand arrival: start high under the coffered ceiling with the title, then sweep down the lobby toward the elevator, which glows open to greet you */
  rig.place({ x: 0, z: 8.2, yaw: 0, pitch: -.32 }); rig.eye = 3.15; rig.update(0);
  w.hidden = false; requestAnimationFrame(() => w.classList.add("on"));
  await tw.wait(S.fast ? .05 : 3.0); sound.ding();
  w.classList.remove("on"); setTimeout(() => (w.hidden = true), 1800);
  setTimeout(() => { if (!S.doorsOpen) openDoors(); }, S.fast ? 0 : 1800);
  const sweep = tw.run(S.fast ? .05 : 5.2, k => { rig.eye = lerp(3.15, 1.62, ease.inOut(k)); }, ease.lin);
  await Promise.all([rig.glide(S.steps[0], S.fast ? .05 : 5.2), sweep]); rig.eye = 1.62;
  S.intro = false; $("hud").hidden = false; say({ kicker: "Ground", title: "The Lobby" });
  S.busy = false; refresh(); $("live").textContent = "You are in the lobby. " + S.steps[0].note;
};
window.__impossible = { S, rig, ensure, stepOut, enterCar, places: () => places, travel, openDoors, goStep, scene, camera, renderer, viewExhibit, setMode, car };   // handy for testing
