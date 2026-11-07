/* ===== Presentation case study (Floor 2: Living Without Barriers) =====
   Reads window.CASES[id] from data/case-lwb.js and renders a scrolling portfolio page inside #cs. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const el = $("#cs"), EL = () => window.EL || {};
  let c, car = 0, io;
  const fig = (im, cls = "") => `<figure class="cs-fig ${cls}"><button class="cs-zoom" data-zoom aria-label="Enlarge: ${esc(im.caption)}"><img src="${esc(im.src)}" alt="${esc(im.alt)}"></button><figcaption>${esc(im.caption)}</figcaption></figure>`;
  const list = p => `<ul class="cs-list">${p.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
  function section(s, i) {
    const n = String(i + 2).padStart(2, "0");
    const head = `<header><span class="cs-n">${n}</span><h2>${esc(s.title)}</h2></header>`;
    let body = "";
    if (s.kind === "feature") body = `<div class="cs-split ${i % 2 ? "flip" : ""}">${fig(s.image, "big")}<div class="cs-copy">${s.lead ? `<p class="cs-lead">${esc(s.lead)}</p>` : ""}${list(s.points)}</div></div>`;
    else if (s.kind === "wide") body = `${fig(s.image, "full")}<div class="cs-copy row">${s.points ? list(s.points) : `<p>${esc(s.text)}</p>`}</div>`;
    else if (s.kind === "carousel") body = `<div class="cs-car" data-n="${s.images.length}"><div class="cs-stage">${s.images.map((m, k) => fig(m, "slide" + (k ? "" : " on"))).join("")}
        <button class="cs-arrow prev" aria-label="Previous bedroom rendering">‹</button><button class="cs-arrow next" aria-label="Next bedroom rendering">›</button></div>
        <div class="cs-dots">${s.images.map((m, k) => `<button data-k="${k}" aria-label="Show ${esc(m.caption)}" class="${k ? "" : "on"}"></button>`).join("")}</div></div><div class="cs-copy row">${list(s.points)}</div>`;
    else if (s.kind === "systems") body = `<div class="cs-split">${fig(s.image, "big")}<div class="cs-copy"><p class="cs-lead">${esc(s.lead)}</p><div class="cs-chips">${s.points.map(p => `<span>${esc(p)}</span>`).join("")}</div></div></div>`;
    else body = `<blockquote class="cs-ref">${esc(s.text)}</blockquote>`;
    return `<section class="cs-sec reveal" id="cs-${s.id}" data-id="${s.id}">${head}${body}</section>`;
  }
  function open(id, from) {
    c = window.CASES[id]; car = 0;
    el.dataset.id = id;
    el.innerHTML = `<div class="cs-top"><button class="btn close" data-cs-close>← Return to Residential Design</button><button class="btn close cs-el" data-cs-el>↩ Return to Elevator</button></div>
      <nav class="cs-nav" aria-label="Project sections"><button data-s="top">Intro</button>${c.sections.map(s => `<button data-s="${s.id}">${esc(s.nav)}</button>`).join("")}</nav>
      <div class="cs-scroll" id="csScroll">
      <section class="cs-hero" id="cs-top">${fig(c.hero, "hero")}</section>
      <section class="cs-sec cs-head reveal"><p class="cat">${esc(c.type)}</p><h1>${esc(c.title.toUpperCase())}</h1><p class="sub">${esc(c.subtitle)}</p>
        <p class="meta">${esc(c.designers)} · ${esc(c.course)}</p></section>
      <section class="cs-sec cs-intro reveal"><header><span class="cs-n">01</span><h2>Project Introduction</h2></header>${c.intro.map(t => `<p>${esc(t)}</p>`).join("")}</section>
      ${c.sections.map(section).join("")}
      <footer class="cs-foot"><p><button class="cs-cross" data-cross>${esc(c.crossLink.text)}</button></p>
        <p><button class="btn dark" data-cs-close>← Return to Residential Design</button> <button class="btn dark" data-cs-el>↩ Return to Elevator</button></p></footer></div>`;
    el.hidden = false; el.scrollTop = 0; $("#csScroll").scrollTop = 0;
    EL().setOpener && EL().setOpener(from || document.activeElement);
    $("[data-cs-close]", el).focus(); observe();
  }
  function observe() {
    if (io) io.disconnect();
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches || document.body.classList.contains("fast");
    const secs = $$(".cs-sec, .cs-hero", el);
    if (calm || !("IntersectionObserver" in window)) return secs.forEach(s => s.classList.add("in"));
    io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("in")), { root: $("#csScroll"), threshold: .12 });
    secs.forEach(s => io.observe(s)); $(".cs-hero", el).classList.add("in");
  }
  function slide(k) {
    const slides = $$(".cs-fig.slide", el); car = (k + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("on", i === car)); $$(".cs-dots button", el).forEach((b, i) => b.classList.toggle("on", i === car));
  }
  function spy() {
    const sc = $("#csScroll"); if (!sc) return; let cur = "top";
    $$(".cs-sec[data-id]", el).forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .4) cur = s.dataset.id; });
    $$(".cs-nav button", el).forEach(b => b.classList.toggle("on", b.dataset.s === cur));
  }
  el.addEventListener("click", e => {
    const t = e.target;
    if (t.closest("[data-cs-close]")) { el.hidden = true; return EL().restore && EL().restore(); }
    if (t.closest("[data-cs-el]")) return EL().toElevator && EL().toElevator();
    const sn = t.closest("[data-s]"); if (sn) { const tg = $("#cs-" + sn.dataset.s); tg && tg.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); return; }
    const z = t.closest("[data-zoom]"); if (z) { const i = $("img", z), lb = $("#lb"); $("img", lb).src = i.src; $("img", lb).alt = i.alt; lb.hidden = false; $(".close", lb).focus(); return; }
    if (t.closest(".cs-arrow")) return slide(car + (t.closest(".next") ? 1 : -1));
    const d = t.closest(".cs-dots button"); if (d) return slide(+d.dataset.k);
    if (t.closest("[data-cross]")) { el.hidden = true; EL().toArchive && EL().toArchive(c.crossLink.exhibit); }
  });
  el.addEventListener("scroll", spy, true);
  document.addEventListener("keydown", e => {
    if (el.hidden || !$("#lb").hidden || !$$(".cs-fig.slide", el).length) return;
    if (e.key === "ArrowRight") slide(car + 1); else if (e.key === "ArrowLeft") slide(car - 1);
  });
  window.CaseStudy = { open };
})();
