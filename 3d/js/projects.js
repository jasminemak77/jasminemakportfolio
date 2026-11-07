/* Project presentation panels. Reads the same data as the 2D site (data/projects.js, data/case-lwb.js), so nothing is duplicated or rewritten. */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const up = p => "../" + p;

export class Projects {
  constructor() {
    this.cur = null; this.i = 0; this.onClose = null; this.zoom = false; this.listClose = null;
    $("projClose").onclick = () => this.close(); $("plistClose").onclick = () => this.closeList();
    $("pPrev").onclick = () => this.go(this.i - 1); $("pNext").onclick = () => this.go(this.i + 1);
    $("pZoom").onclick = () => this.setZoom(!this.zoom);
    addEventListener("keydown", e => {
      if (!$("proj").hidden) { if (e.key === "Escape") this.close(); else if (e.key === "ArrowRight") this.go(this.i + 1); else if (e.key === "ArrowLeft") this.go(this.i - 1); else this.trap(e); }
      else if (!$("plist").hidden && e.key === "Escape") this.closeList();
    });
  }
  title(id) { return this.data(id)?.title || id; }
  category(id) { return this.data(id)?.cat || ""; }
  /* Design Archive pieces: a whole section ("ar-sec:A") or the 24-page portfolio ("ar:portfolio") */
  archive(id) {
    const A = window.ARCHIVE; if (!A) return null;
    const toPages = imgs => imgs.map(i => ({ src: up(i.src), cap: i.caption, alt: i.alt }));
    if (id === "ar:portfolio") return { title: A.portfolio.title, cat: "The Design Archive", pages: toPages(A.portfolio.images), text: `<p>${esc(A.portfolio.text)}</p>` + (A.portfolio.doc ? `<p><a href="${up(A.portfolio.doc.href)}" target="_blank" rel="noopener">${esc(A.portfolio.doc.label)}</a></p>` : "") };
    if (id.startsWith("ar-sec:")) {
      const sec = A.sections.find(x => x.id === id.slice(7)); if (!sec) return null;
      const pages = sec.exhibits.flatMap(e => toPages(e.images));
      return { title: sec.name, cat: "The Design Archive · Section " + sec.id, pages, text: `<p>${esc(sec.blurb)}</p>` + sec.exhibits.map(e => `<h3>${esc(e.title)}</h3>${e.subtitle ? `<p class="meta">${esc(e.subtitle)}</p>` : ""}${e.text ? `<p>${esc(e.text)}</p>` : ""}`).join("") };
    }
    return null;
  }
  about() {
    const li = a => `<ul>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`, res = window.SITE?.resume;
    return { title: "Jasmine Mak", cat: "About Me", pages: [{ src: up("assets/images/profile.webp"), cap: "Jasmine Mak", alt: "Portrait of Jasmine Mak" }],
      text: `<p>Honours Bachelor of Interior Design<br>Georgian College: Barrie, ON<br>Expected graduation: 2027</p>
      <h3>Design Philosophy</h3><p>Interior design is the discipline of shaping human experience through space. I am driven by the belief that environments directly influence how people think, feel, and perform. Thoughtful design has the power to elevate everyday life.</p>
      <p>My work is grounded in strong conceptual frameworks and carried through with technical precision. I approach each project with clarity of intent, disciplined material selection, and careful spatial logic. Design, for me, is an ongoing pursuit of refinement.</p>
      <h3>Professional Interests</h3>${li(["Workplace Strategy & Environmental Psychology", "Lighting Design & Technical Systems", "Sustainable Material Applications", "Commercial Budgeting & Project Planning", "Barrier-Free & Code-Compliant Design"])}
      <h3>Software</h3>${li(["Revit", "AutoCAD", "SketchUp", "Twinmotion", "Adobe InDesign", "Adobe Photoshop", "Enscape", "Microsoft Excel"])}
      <h3>Technical</h3>${li(["Construction Documentation", "Space Planning", "Lighting Analysis", "Finish & Material Specification", "Budget Development", "Rendering & Visualization", "Code Research (OBC, Accessibility Standards)"])}
      <h3>Design Skills</h3>${li(["Concept Development & Narrative Building", "Human-Centered & Evidence-Based Design", "Biophilic & Wellness Integration", "Workplace & Commercial Strategy", "Furniture & Product Conceptualization", "Circadian Lighting Strategy", "Material Storytelling", "Graphic & Presentation Layout"])}
      <h3>Personal Skills</h3>${li(["Project Leadership", "Clear Communication", "Critical Thinking", "Adaptability Under Constraints", "Detail-Oriented Execution", "Collaborative Teamwork", "Time Management", "Strategic Decision-Making"])}
      ${res ? `<p><a href="${up(res)}" download>Download résumé</a></p>` : ""}` };
  }
  data(id) {
    if (id === "about") return this.about();
    if (id.startsWith("ar:") || id.startsWith("ar-sec:")) return this.archive(id);
    const p = (window.PROJECTS || []).find(x => x.id === id), c = window.CASES && window.CASES[id];
    if (c) {                                   // presentation-style project: use its own pages
      const pages = [c.hero, ...c.sections.flatMap(s => s.images || (s.image ? [s.image] : []))];
      return { title: c.title, cat: p?.category || "Residential Design", pages: pages.map(x => ({ src: up(x.src), cap: x.caption, alt: x.alt })),
        text: `<p class="sub">${esc(c.subtitle)}</p><p class="meta">${esc(c.designers)} · ${esc(c.course)}</p>` + c.intro.map(t => `<p>${esc(t)}</p>`).join("") };
    }
    if (!p) return null;
    const sec = (h, t) => (t ? `<h3>${h}</h3><p>${esc(t)}</p>` : "");
    return { title: p.title, cat: p.category, pages: p.gallery.map(g => ({ src: up(g.src), cap: g.caption, alt: g.alt })),
      text: `<p>${esc(p.intro)}</p>` + sec("Concept", p.concept) + sec("Process", p.process) + sec("Reflection", p.reflection) };
  }
  cover(id) { const d = this.data(id); return d ? d.pages[0].src : ""; }
  open(id, onClose) {
    const d = this.data(id); if (!d) return; this.cur = d; this.onClose = onClose; this.opener = document.activeElement;
    $("projCat").textContent = d.cat; $("projTitle").textContent = d.title; $("projText").innerHTML = d.text;
    $("projThumbs").innerHTML = d.pages.map((p, k) => `<button data-k="${k}" aria-label="Page ${k + 1}: ${esc(p.cap)}"><img loading="lazy" src="${esc(p.src)}" alt=""></button>`).join("");
    $("projThumbs").querySelectorAll("button").forEach(b => (b.onclick = () => this.go(+b.dataset.k)));
    this.zoom = false; this.go(0); $("proj").hidden = false; $("proj").scrollTop = 0; $("projClose").focus();
  }
  go(k) {
    const d = this.cur; if (!d) return; this.i = (k + d.pages.length) % d.pages.length; const p = d.pages[this.i];
    const img = $("projImg"); img.src = p.src; img.alt = p.alt || p.cap; $("projCap").textContent = `${this.i + 1} / ${d.pages.length} · ${p.cap}`;
    $("projThumbs").querySelectorAll("button").forEach((b, n) => b.classList.toggle("on", n === this.i)); this.setZoom(false);
    const multi = d.pages.length > 1; $("pPrev").hidden = $("pNext").hidden = !multi;
  }
  setZoom(v) { this.zoom = v; $("projStage").classList.toggle("zoom", v); $("pZoom").setAttribute("aria-pressed", v); $("pZoom").textContent = v ? "Fit to screen" : "Enlarge"; }
  close() { $("proj").hidden = true; const cb = this.onClose; this.onClose = null; cb && cb(); }
  trap(e) {
    if (e.key !== "Tab") return; const f = [...$("proj").querySelectorAll("button:not([hidden]),a[href]")]; if (!f.length) return;
    const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { z.focus(); e.preventDefault(); } else if (!e.shiftKey && document.activeElement === z) { a.focus(); e.preventDefault(); }
  }
  list(onPick, onClose, floorOf) {
    this.listClose = onClose; const ul = $("plistItems");
    const all = (window.PROJECTS || []).filter(p => !p.hidden);
    ul.innerHTML = all.map(p => `<li><button data-id="${p.id}"><b>${esc(p.title)}</b><span>${esc(p.category)} · Floor ${String(floorOf(p.id) || "").padStart(2, "0")} · View in 3D</span></button></li>`).join("");
    ul.querySelectorAll("button").forEach(b => (b.onclick = () => { $("plist").hidden = true; onPick(b.dataset.id); }));
    $("plist").hidden = false; $("plistClose").focus();
  }
  closeList() { $("plist").hidden = true; const cb = this.listClose; this.listClose = null; cb && cb(); }
}
