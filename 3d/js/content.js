/* Which real portfolio items live on which floor. All text and images come from your existing data files (data/projects.js, data/archive.js). */
export const FLOOR_PROJECTS = { 2: ["live-work-condo", "living-without-barriers", "ledger-residence"], 3: ["oishimono", "activity-alley"], 4: ["modunest"], 5: ["lumi-sync", "sol-seat"] };

export function exhibitsFor(n, data) {
  const T = id => data.title(id), C = id => data.category(id), I = id => data.cover(id);
  const mk = (id, extra = {}) => ({ id, title: T(id), category: C(id), image: I(id), ...extra });
  if (n === 1) return [mk("about", { wall: "B", t: -2.4 }), mk("ar:portfolio", { wall: "B", t: 2.4 })];
  if (n === 3) return [mk("oishimono", { pos: [-3.6, 6.6], focus: [0, 2.4] }), mk("activity-alley", { pos: [3.6, 6.6], focus: [0, 2.4] })];
  if (n === 4) return [mk("modunest", { pos: [0, 8.6], focus: [0, 2.6] })];
  if (n === 5) return [mk("lumi-sync", { pos: [-2.7, 6.6], focus: [0, 2.6] }), mk("sol-seat", { pos: [2.7, 6.6], focus: [0, 2.6] })];
  if (n === 6) {
    const ids = ((window.FLOORS || []).find(f => f.n === 6)?.hotspots || []).map(h => h.project);
    const slots = [{ wall: "L", t: 2.8 }, { wall: "L", t: 5.8 }, { wall: "L", t: 8.8 }, { wall: "R", t: 2.8 }, { wall: "R", t: 5.8 }, { wall: "R", t: 8.8 }, { wall: "B", t: 0 }];
    return ids.slice(0, 7).map((id, i) => mk(id, slots[i]));
  }
  if (n === 7) {
    const A = window.ARCHIVE; if (!A) return [];
    const R = 6.2, cx = 0, cz = 9.5, angs = [-130, -65, 0, 65, 130];
    const items = [...A.sections.map(s => "ar-sec:" + s.id), "ar:portfolio"];
    return items.map((id, i) => { const a = angs[i] * Math.PI / 180, x = cx + R * Math.sin(a), z = cz + R * Math.cos(a); return mk(id, { pos: [x, z], focus: [cx, cz] }); });
  }
  return [];
}
