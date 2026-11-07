/* ===== THE DESIGN ARCHIVE: behaviour =====
   One continuous studio-gallery: an entrance (directory) + four exhibition walls (A to D)
   that you move along sideways while the studio background slowly pans with you.
   Content lives in data/archive.js. Hooks into the main script through window.EL. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const D = window.ARCHIVE, EL = window.EL || {};
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.body.classList.contains("fast");
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const root = $("#archive"), gal = $("#gallery"), av = $("#av");
  const SEC = D.sections, EXH = {};
  const PF = D.portfolio; if (PF) { PF._sec = { id: "", name: "The Complete Portfolio" }; EXH[PF.id] = PF; }
  SEC.forEach(s => s.exhibits.forEach(e => (EXH[e.id] = e, e._sec = s)));
  let mounted = false, track, cur = 0, ticking = false;

  /* thumb with automatic fall-back to the full image (see error handler in script.js) */
  const thumb = (im, alt = "") => `<img loading="lazy" src="${esc(im.thumb || im.src)}" data-fb="${esc(im.src)}" alt="${esc(alt)}">`;

  /* ---------- BUILD ---------- */
  function card(e, s, i) {
    const n = e.images.length;
    if (s.kind === "sketch") return `<button class="ex ex-sketch" data-ex="${e.id}" aria-label="Open ${esc(e.title)}: rough and final sketch">
      <span class="pair">${thumb(e.images[0], "")}${thumb(e.images[1], "")}<i class="pin" aria-hidden="true"></i></span>
      <b>${esc(e.title)}</b><small>${esc(e.subtitle)}</small><em>Compare rough + final</em></button>`;
    if (s.kind === "sheets") return `<button class="ex ex-sheet" data-ex="${e.id}" aria-label="Open ${esc(e.title)}, ${n} sheet${n > 1 ? "s" : ""}">
      <span class="sheet">${thumb(e.images[e.cover || 0], "")}</span>
      <span class="tb"><b>${esc(e.title)}</b><small>${esc(e.subtitle)}</small><i>${n} sheet${n > 1 ? "s" : ""} · click to enlarge</i></span></button>`;
    if (s.kind === "study") return e.images.map((im, k) => `<button class="ex ex-sheet" data-ex="${e.id}" data-i="${k}" aria-label="Open ${esc(im.caption)}">
      <span class="sheet">${thumb(im, "")}</span><span class="tb"><b>${esc(im.caption)}</b><small>${esc(e.title)}</small><i>Sheet ${k + 1} of ${e.images.length}</i></span></button>`).join("");
    return `<button class="ex ex-folio" data-ex="${e.id}" aria-label="Open ${esc(e.title)}">
      <span class="sheet">${thumb(e.images[e.cover || 0], "")}</span>
      <span class="tb"><b>${esc(e.title)}</b><small>${esc(e.subtitle)}</small><p>${esc(e.text)}</p><i>${n} images · open folio</i></span></button>`;
  }
  function mount() {
    if (mounted) return; mounted = true;
    const dir = SEC.map((s, i) => `<button class="dir-item" data-go="${i + 1}"><span>${s.id}</span><b>${esc(s.name)}</b><small>${s.kind === "study" ? "4 linked sheets" : s.exhibits.length + " exhibits"}</small></button>`).join("");
    const pfItem = PF ? `<button class="dir-item" data-ex="${PF.id}"><span>★</span><b>${esc(PF.title)}</b><small>${PF.images.length} pages</small></button>` : "";
    const secs = SEC.map((s, i) => {
      const extra = s.kind === "study" ? `<p class="study-link"><button class="btn" data-project="${esc(s.exhibits[0].link.project)}">${esc(s.exhibits[0].link.label)}</button></p>` : "";
      const intro = s.kind === "study" ? `<p class="study-note"><b>${esc(s.exhibits[0].title)}.</b> ${esc(s.exhibits[0].text)}</p>` : "";
      return `<section class="arc-sec" data-i="${i + 1}" data-sec="${s.id}" aria-label="Section ${s.id}: ${esc(s.name)}">
        <div class="wall k-${s.kind}"><header><span class="letter" aria-hidden="true">${s.id}</span><div><h2>${esc(s.name)}</h2><p>${esc(s.blurb)}</p></div></header>
        ${intro}<div class="grid">${s.exhibits.map((e, k) => card(e, s, k)).join("")}</div>${extra}
        <footer><button class="more" data-go="${i}" aria-label="Previous section">‹ ${i === 0 ? "Entrance" : "Section " + SEC[i - 1].id}</button>${i < 3 ? `<button class="more" data-go="${i + 2}">Section ${SEC[i + 1].id} ›</button>` : ""}</footer></div></section>`;
    }).join("");
    root.innerHTML = `<div class="arc-track" id="arcTrack" tabindex="-1">
      <section class="arc-sec arc-entrance" data-i="0" data-sec="E" aria-label="Archive entrance">
        <div class="entrance"><p class="kicker">Floor 07</p><h2>${esc(D.title).toUpperCase()}</h2><p class="lead">${esc(D.intro)}</p>
        <nav class="dirlist" aria-label="Directory of exhibition sections"><p class="dirhead">Directory</p>${dir}${pfItem}</nav></div></section>${secs}</div>
      <nav class="arc-bar" aria-label="Archive sections"><button data-go="0">Entrance</button>${SEC.map((s, i) => `<button data-go="${i + 1}" title="${esc(s.name)}">${s.id}<span> ${esc(s.name.split(" & ")[0])}</span></button>`).join("")}</nav>
      <button class="arc-arrow prev" aria-label="Previous section">‹</button><button class="arc-arrow next" aria-label="Next section">›</button>`;
    track = $("#arcTrack");
    root.addEventListener("click", e => {
      const g = e.target.closest("[data-go]"); if (g) return go(+g.dataset.go);
      const p = e.target.closest("[data-project]"); if (p) { EL.openProject && EL.openProject(p.dataset.project, p); return; }
      const di = e.target.closest(".dir-item[data-ex]"); if (di) return openViewer(EXH[di.dataset.ex], 0, di);
      const x = e.target.closest(".ex"); if (x) openViewer(EXH[x.dataset.ex], +(x.dataset.i || 0), x);
    });
    $(".arc-arrow.prev", root).onclick = () => go(cur - 1); $(".arc-arrow.next", root).onclick = () => go(cur + 1);
    track.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
    addEventListener("resize", () => { if (!root.hidden) { track.scrollLeft = cur * track.clientWidth; layout(); } });
  }
  /* ---------- MOVING THROUGH THE STUDIO ---------- */
  function go(i, instant) {
    i = Math.max(0, Math.min(SEC.length, i));
    track.scrollTo({ left: i * track.clientWidth, behavior: instant || reduced() ? "auto" : "smooth" });
    if (instant) { cur = i; paint(); }
  }
  function sync() {
    ticking = false; const w = track.clientWidth || 1, max = track.scrollWidth - w || 1;
    const i = Math.round(track.scrollLeft / w); if (i !== cur) { cur = i; paint(); }
    gal.style.setProperty("--pan", (10 - (track.scrollLeft / max) * 20).toFixed(2) + "%");  // background pans with you
  }
  function paint() {
    const id = cur === 0 ? "E" : SEC[cur - 1].id;
    gal.dataset.sec = id;                                                // drives the per-section lighting in CSS
    $$(".arc-bar button", root).forEach((b, k) => b.classList.toggle("on", k === cur));
    $(".arc-arrow.prev", root).hidden = cur === 0; $(".arc-arrow.next", root).hidden = cur === SEC.length;
    $$(".arc-sec", root).forEach(s => s.toggleAttribute("inert", +s.dataset.i !== cur && false));
  }
  /* ---------- OPEN / CLOSE (called from script.js) ---------- */
  function open() { mount(); root.hidden = false; track.scrollLeft = 0; cur = 0; paint(); gal.style.setProperty("--pan", "10%"); }
  function close() { root.hidden = true; delete gal.dataset.sec; if (av) av.hidden = true; }

  /* ---------- VIEWER: enlarge, zoom, compare, multi-sheet ---------- */
  let ex = null, idx = 0, mode = "single", z = 1, opener = null;
  const STEPS = [1, 1.5, 2, 3, 4], view = $("#avView"), imgEl = $("#avImg"), side = $("#avSide");
  function openViewer(e, i = 0, from) {
    ex = e; idx = i; z = 1; opener = from || document.activeElement;
    mode = e.compare ? "side" : "single";
    av.hidden = false; av.scrollTop = 0; EL.setOpener && EL.setOpener(opener);
    $(".close", av).focus(); info(); render();
  }
  function info() {
    const s = ex._sec;
    $("#avInfo").innerHTML = `<p class="cat">${s.id ? `Section ${s.id}: ` : ""}${esc(s.name)}</p><h2 id="avTitle">${esc(ex.title)}</h2><p class="sub">${esc(ex.subtitle || "")}</p>
      <p>${esc(ex.text || "")}</p>${ex.medium ? `<p class="med"><b>Medium:</b> ${esc(ex.medium)}</p>` : ""}
      ${ex.bullets ? `<h3>Site observations</h3><ul>${ex.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
      ${ex.reflection ? `<h3>Reflection</h3><blockquote>${esc(ex.reflection)}</blockquote>` : ""}
      <div id="avNote"></div>
      ${ex.link ? `<p><button class="btn dark" data-project="${esc(ex.link.project)}" ${ex.link.floor ? `data-floor="${ex.link.floor}"` : ""}>${esc(ex.link.label)}</button></p>` : ""}
      ${ex.doc ? `<p><a class="btn dark" href="${esc(ex.doc.href)}" target="_blank" rel="noopener">${esc(ex.doc.label)}</a></p>` : ""}`;
    $$("#avInfo [data-project]").forEach(b => b.onclick = () => { av.hidden = true; b.dataset.floor ? EL.goProject(b.dataset.project, +b.dataset.floor) : EL.openProject(b.dataset.project, b); });
    const tools = $("#avTools");
    tools.innerHTML = ex.compare
      ? `<div role="group" aria-label="Sketch view"><button data-m="rough">Rough</button><button data-m="final">Final</button><button data-m="side">Side by side</button></div>` : "";
    tools.innerHTML += `<div role="group" aria-label="Zoom" class="zoom"><button data-z="-" aria-label="Zoom out">−</button><button data-z="+" aria-label="Zoom in">+</button><button data-z="fit">Fit</button><button data-z="100">100%</button></div>`;
    $$("#avTools [data-m]").forEach(b => b.onclick = () => { mode = b.dataset.m === "side" ? "side" : "single"; if (mode === "single") idx = b.dataset.m === "rough" ? 0 : 1; z = 1; render(); });
    $$("#avTools [data-z]").forEach(b => b.onclick = () => zoom(b.dataset.z));
    const th = $("#avThumbs");
    th.hidden = !!ex.compare || ex.images.length < 2;
    let last = null; th.innerHTML = ex.images.map((im, k) => { const h = im.group && im.group !== last && ex.images.some(x => x.group !== im.group) ? `<h4>${esc(im.group)}</h4>` : ""; last = im.group;
      return h + `<button data-k="${k}" aria-label="View ${esc(im.caption)}">${thumb(im, "")}</button>`; }).join("");
    $$("button[data-k]", th).forEach(b => b.onclick = () => { idx = +b.dataset.k; z = 1; render(); });
  }
  function render() {
    const multi = !ex.compare && ex.images.length > 1;
    $$("#avTools [data-m]").forEach(b => b.classList.toggle("on", (b.dataset.m === "side") === (mode === "side") && (mode === "side" || (b.dataset.m === "rough") === (idx === 0))));
    $(".zoom", $("#avTools")).hidden = mode === "side";
    $$(".av-arrow", av).forEach(a => a.hidden = !multi || mode === "side");
    const g = ex.images[idx];
    if (mode === "side") {
      imgEl.hidden = true; side.hidden = false; view.classList.add("is-side");
      side.innerHTML = ex.images.map((im, k) => `<figure><button data-k="${k}" aria-label="Enlarge ${esc(im.caption)}"><img src="${esc(im.src)}" alt="${esc(im.alt)}"></button><figcaption>${esc(im.group)}</figcaption></figure>`).join("");
      $$("button", side).forEach(b => b.onclick = () => { mode = "single"; idx = +b.dataset.k; z = 1; render(); });
      $("#avCap").textContent = "Rough and developed versions, side by side. Select one to enlarge.";
    } else {
      side.hidden = true; imgEl.hidden = false; view.classList.remove("is-side");
      imgEl.onload = layout; imgEl.src = g.src; imgEl.alt = g.alt; if (imgEl.complete) layout();
      $("#avCap").innerHTML = `<b>${esc(g.caption)}</b>${multi ? ` <span>${idx + 1} / ${ex.images.length}</span>` : ""}`;
    }
    const n = $("#avNote"); if (n) n.innerHTML = g.note ? `<h3>${esc(g.caption)}</h3><p>${esc(g.note)}</p>` : (mode === "single" && !ex.compare && g.alt && g.alt !== g.caption && ex.images.length > 1 ? `<h3>${esc(g.caption)}</h3><p>${esc(g.alt)}</p>` : "");
    $$("#avThumbs button[data-k]").forEach(b => b.classList.toggle("on", +b.dataset.k === idx));
  }
  function layout() {                                         // fit to window, then multiply by zoom
    if (mode === "side" || !imgEl.naturalWidth) return;
    const fit = Math.min(view.clientWidth / imgEl.naturalWidth, view.clientHeight / imgEl.naturalHeight);
    imgEl.style.width = Math.round(imgEl.naturalWidth * fit * z) + "px";
    view.classList.toggle("zoomed", z > 1); imgEl._fit = fit;
  }
  function zoom(k) {
    const fit = imgEl._fit || 1; const was = z;
    if (k === "fit") z = 1; else if (k === "100") z = Math.min(6, Math.max(1, 1 / fit));
    else { let i = STEPS.findIndex(s => s >= z - .001); i = Math.max(0, Math.min(STEPS.length - 1, (i < 0 ? 0 : i) + (k === "+" ? 1 : -1))); z = STEPS[i]; }
    const cx = (view.scrollLeft + view.clientWidth / 2) / (view.scrollWidth || 1), cy = (view.scrollTop + view.clientHeight / 2) / (view.scrollHeight || 1);
    layout(); view.scrollLeft = cx * view.scrollWidth - view.clientWidth / 2; view.scrollTop = cy * view.scrollHeight - view.clientHeight / 2;
  }
  const stepImg = d => { if (ex && !ex.compare && mode === "single") { idx = (idx + d + ex.images.length) % ex.images.length; z = 1; render(); } };
  $$(".av-arrow", av)[0].onclick = () => stepImg(-1); $$(".av-arrow", av)[1].onclick = () => stepImg(1);
  imgEl.addEventListener("dblclick", () => { z = z > 1 ? 1 : 2.5; layout(); });
  let drag = null;                                           // drag to pan when zoomed
  view.addEventListener("pointerdown", e => { if (z > 1 && e.target === imgEl) { drag = { x: e.clientX, y: e.clientY, l: view.scrollLeft, t: view.scrollTop }; view.setPointerCapture(e.pointerId); view.classList.add("grab"); } });
  view.addEventListener("pointermove", e => { if (drag) { view.scrollLeft = drag.l - (e.clientX - drag.x); view.scrollTop = drag.t - (e.clientY - drag.y); } });
  ["pointerup", "pointercancel"].forEach(t => view.addEventListener(t, () => { drag = null; view.classList.remove("grab"); }));
  addEventListener("resize", layout);

  document.addEventListener("keydown", e => {
    if (!av.hidden) {                                        // viewer shortcuts
      if (e.key === "+" || e.key === "=") zoom("+"); else if (e.key === "-") zoom("-"); else if (e.key === "0") zoom("fit");
      else if (e.key === "ArrowRight" && z === 1) stepImg(1); else if (e.key === "ArrowLeft" && z === 1) stepImg(-1);
      return;
    }
    if (!root.hidden && document.body.dataset.view === "gallery" && $$(".overlay").every(o => o.hidden)) {
      if (e.key === "ArrowRight") go(cur + 1); else if (e.key === "ArrowLeft") go(cur - 1);
    }
  });

  // Jump straight to an exhibit (used by the cross-link from the Floor 2 presentation)
  function showExhibit(id) { const e = EXH[id]; if (!e) return; const i = SEC.indexOf(e._sec) + 1; go(i, true); openViewer(e, 0, null); }
  window.Archive = { open, close, go, show: showExhibit };
})();
