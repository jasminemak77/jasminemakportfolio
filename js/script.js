/* ===== The Impossible Elevator: behaviour =====
   Flow: ARRIVE (home) → CHOOSE (elevator) → REVEAL (doors open) → STEP INSIDE (gallery + project). */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, fast() ? 0 : ms));
  const fast = () => document.body.classList.contains("fast") || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const IMG = "assets/images/";
  const byId = id => PROJECTS.find(p => p.id === id);
  let busy = false, floor = 0, opener = null;

  // Missing-image fallback: keeps the site working with an elegant placeholder.
  document.addEventListener("error", e => {
    if (e.target.tagName !== "IMG") return;
    const fb = e.target.dataset.fb;                                  // a missing thumbnail falls back to its full image
    if (fb && !e.target.dataset.tried) { e.target.dataset.tried = 1; e.target.src = fb; return; }
    if (e.target.dataset.bgfb && !e.target.dataset.tried) { e.target.dataset.tried = 1; e.target.src = e.target.dataset.bgfb; return; }   // background fallback
    e.target.classList.add("missing"); e.target.alt = "";
    const p = e.target.parentElement; if (!p.querySelector(".ph")) p.insertAdjacentHTML("beforeend", `<div class="ph">Image coming soon</div>`);
  }, true);

  const bgOf = f => IMG + f.bg, bgFb = f => f.bgFallback ? IMG + f.bgFallback : "";
  // The archive background is optional: if archive-studio.webp does not exist yet, process-studio.webp is used.
  const resolveBg = f => new Promise(r => { if (!f.bgFallback) return r(bgOf(f)); const i = new Image(); i.onload = () => r(bgOf(f)); i.onerror = () => r(bgFb(f)); i.src = bgOf(f); });
  function show(id) { $$(".scene").forEach(s => s.classList.toggle("on", s.id === id)); document.body.dataset.view = id; }

  /* ---------- Floor buttons (top to bottom: 06 … 01) ---------- */
  const panel = $(".panel");
  FLOORS.slice().reverse().forEach(f => {
    const b = document.createElement("button");
    b.className = "fb"; b.style.top = `var(--y${f.n})`; b.dataset.n = f.n;
    b.setAttribute("aria-label", `Floor ${f.n}: ${f.label}`);
    b.innerHTML = `0${f.n}<span class="tip">${f.label}</span>`;
    b.addEventListener("click", () => ride(f.n));
    panel.append(b);
  });

  /* ---------- ARRIVE → CHOOSE ---------- */
  async function enter() {
    if (busy) return; busy = true;
    $(".hero").classList.add("out");
    $("#home .stage").style.transform = "translate(-50%,-50%) scale(1.35)";
    await wait(1100); resetElevator(); show("elevator"); await wait(400);
    $("#home .stage").style.transform = ""; $(".hero").classList.remove("out"); busy = false;
  }
  function resetElevator() {
    const e = $("#elevator"); e.classList.remove("open", "moving", "enter");
    $$(".fb").forEach(b => b.classList.remove("lit")); setNum(floor ? "0" + floor : "L");
    $("#floorName").textContent = floor ? FLOORS[floor - 1].label : "Lobby";
  }
  const setNum = t => $("#floorNum").textContent = t;

  /* ---------- CHOOSE → REVEAL → STEP INSIDE ---------- */
  async function ride(n) {
    if (busy) return; busy = true;
    const e = $("#elevator"), f = FLOORS[n - 1];
    $$(".fb").forEach(b => b.classList.toggle("lit", +b.dataset.n === n));       // 1 illuminate
    sfx.press();                                                                  // ding on selection
    e.classList.add("moving");                                                    // 2 subtle movement
    const from = floor || 1, step = n >= from ? 1 : -1;                           // 3 floor number updates
    for (let i = from; i !== n + step; i += step) { setNum("0" + i); await wait(260); }
    $("#floorName").textContent = f.label; await wait(500); e.classList.remove("moving");
    e.dataset.theme = f.theme || "";                                               // light from the destination spills into the cab
    $(".opening").style.backgroundImage = `url(${await resolveBg(f)})`;                   // 5 doors open onto the gallery
    e.classList.add("open"); sfx.arrive(); await wait(1500);
    e.classList.add("enter"); await wait(900);                                    // walk out
    openGallery(n); floor = n; busy = false;
  }
  function openGallery(n) {
    const f = FLOORS[n - 1], st = $("#galStage");
    const a = $("#archive"); a.hidden = true; if (window.Archive) Archive.close();
    st.innerHTML = `<img class="bg" src="${bgOf(f)}" ${f.bgFallback ? `data-bgfb="${bgFb(f)}"` : ""} alt="${f.label} gallery"><div class="atm" aria-hidden="true"></div>`;   // .atm = lighting layer
    $("#gallery").dataset.theme = f.theme || "";
    f.hotspots.forEach(h => {
      const p = byId(h.project), b = document.createElement("button");
      b.className = "hs"; b.dataset.project = h.project; b.style.cssText = `left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%`;
      b.setAttribute("aria-label", `Open ${p.title}`); b.innerHTML = `<div class="plaque"><img loading="lazy" src="${p.gallery[0].src}" alt=""><b>${p.title}</b><small>${p.category}</small><em>View project</em></div>`;
      b.addEventListener("click", () => openProject(p.id, b)); st.append(b);
    });
    $("#floorTag").innerHTML = `Floor 0${n}: ${f.label}<small>${f.mood || ""}</small><small>${f.about ? "About Jasmine" : f.archive ? "Move through the studio · click an exhibit to enlarge" : "Click a display to open the project"}</small>`;
    if (f.about) st.insertAdjacentHTML("beforeend", `<figure class="portrait"><img src="assets/images/profile.webp" alt="Portrait of Jasmine Mak"><figcaption>Jasmine Mak<small>Interior Design · Georgian College · 2027</small></figcaption></figure>`);
    const ab = $("#about"); ab.hidden = !f.about; if (f.about) buildAbout(ab);
    if (f.archive && window.Archive) { a.hidden = false; Archive.open(); }
    const g = $("#gallery"); g.classList.remove("rev"); void g.offsetWidth; g.classList.add("rev");
    show("gallery");
  }
  async function backToElevator() {
    if (busy) return; busy = true; closeAll(); show("elevator");
    const e = $("#elevator"); e.classList.add("open", "enter"); void e.offsetWidth;
    e.classList.remove("enter"); await wait(900); e.classList.remove("open"); resetElevator(); busy = false;
  }
  function goElevator() { closeAll(); resetElevator(); show("elevator"); }
  function direct(n) { closeAll(); floor = n; openGallery(n); }                    // skip the ride

  /* ---------- Project presentation ---------- */
  let cur = null, idx = 0;
  function openProject(id, from) {
    if (window.CASES && CASES[id] && window.CaseStudy) return CaseStudy.open(id, from);   // presentation-style project
    cur = byId(id); idx = 0; opener = from || document.activeElement;
    $("#pCat").textContent = cur.category; $("#pTitle").textContent = cur.title;
    const t = [["Introduction", cur.intro, 1], ["Design Concept", cur.concept], ["Design Process", cur.process], ["Project Reflection", cur.reflection]];
    $("#pText").innerHTML = t.filter(x => x[1]).map(([h, p, w]) => `<section class="${w ? "wide" : ""}"><h3>${h}</h3><p>${p}</p></section>`).join("");
    const groups = {}; cur.gallery.forEach((g, i) => (groups[g.group] ||= []).push([g, i]));
    $("#pThumbs").innerHTML = Object.entries(groups).map(([name, items]) => `<h4>${name}</h4>` + items.map(([g, i]) =>
      `<button data-i="${i}" aria-label="View: ${g.caption}"><img loading="lazy" src="${g.src}" alt=""></button>`).join("")).join("");
    $$("#pThumbs button").forEach(b => b.onclick = () => { idx = +b.dataset.i; img(); });
    img(); const o = $("#pres"); o.hidden = false; o.scrollTop = 0; $(".close", o).focus();
  }
  function img() {
    const g = cur.gallery[idx], el = $("#pImg"); el.src = g.src; el.alt = g.alt;
    $("#pCap").textContent = `${g.group}: ${g.caption}`; $("#pCount").textContent = `${idx + 1} / ${cur.gallery.length}`;
    $$("#pThumbs button").forEach(b => b.classList.toggle("on", +b.dataset.i === idx));
    $$(".arrow").forEach(a => a.hidden = cur.gallery.length < 2);
  }
  const step = d => { if (cur && !$("#pres").hidden) { idx = (idx + d + cur.gallery.length) % cur.gallery.length; img(); } };
  $(".prev").onclick = () => step(-1); $(".next").onclick = () => step(1);
  $("#pImg").onclick = () => { $("#lb img").src = $("#pImg").src; $("#lb img").alt = $("#pImg").alt; $("#lb").hidden = false; $("#lb .close").focus(); };

  /* ---------- Sheets: All Projects, Contact ---------- */
  function openSheet(html) { $("#sheetBody").innerHTML = html; $("#sheet").hidden = false; $("#sheet .close").focus(); }
  function allProjects() {
    openSheet(`<p class="cat">Portfolio</p><h2>All Projects</h2><div class="cards">` + PROJECTS.filter(p => !p.hidden).map(p =>
      `<button class="card" data-p="${p.id}"><div><img loading="lazy" src="${p.gallery[0].src}" alt="${p.title}"></div><b>${p.title.toUpperCase()}</b><small>${p.category}</small></button>`).join("") + `<button class="card" data-arc="1"><div class="arc-card" aria-hidden="true">07</div><b>THE DESIGN ARCHIVE</b><small>Sketchbook, technical, research and collaborative work</small></button></div>`);
    $$("#sheetBody .card[data-arc]").forEach(c => c.onclick = () => { $("#sheet").hidden = true; direct(7); });
    $$("#sheetBody .card").forEach(c => c.onclick = () => { $("#sheet").hidden = true; openProject(c.dataset.p, c); });
  }
  const contactHTML = () => `<a class="btn" href="mailto:${SITE.email}?subject=Portfolio%20enquiry">Email Jasmine</a><a class="btn" href="${SITE.resume}" download>Download Résumé</a>`;
  function contact() { openSheet(`<p class="cat">Contact</p><h2>Let’s Talk</h2><p style="line-height:1.8;max-width:34rem">Jasmine Mak, Honours Bachelor of Interior Design, Georgian College, Barrie, ON. Expected graduation 2027.</p><p style="margin-top:1.5rem" class="about" id="ct"></p>`);
    $("#ct").style.cssText = "position:static;background:none;padding:0;width:auto;overflow:visible"; $("#ct").innerHTML = contactHTML(); }

  /* ---------- About floor (content from the portfolio PDF) ---------- */
  function buildAbout(el) {
    const li = a => `<ul>${a.map(x => `<li>${x}</li>`).join("")}</ul>`;
    el.innerHTML = `<img class="me" src="assets/images/profile.webp" alt="Portrait of Jasmine Mak" width="140" height="175"><h2>JASMINE MAK</h2>
    <p>Honours Bachelor of Interior Design<br>Georgian College: Barrie, ON<br>Expected graduation: 2027</p>
    <h3>Design Philosophy</h3><p>Interior design is the discipline of shaping human experience through space. I am driven by the belief that environments directly influence how people think, feel, and perform. Thoughtful design has the power to elevate everyday life.</p>
    <p>My work is grounded in strong conceptual frameworks and carried through with technical precision. I approach each project with clarity of intent, disciplined material selection, and careful spatial logic. Design, for me, is an ongoing pursuit of refinement.</p>
    <h3>Professional Interests</h3>${li(["Workplace Strategy & Environmental Psychology", "Lighting Design & Technical Systems", "Sustainable Material Applications", "Commercial Budgeting & Project Planning", "Barrier-Free & Code-Compliant Design"])}
    <h3>Software</h3>${li(["Revit", "AutoCAD", "SketchUp", "Twinmotion", "Adobe InDesign", "Adobe Photoshop", "Enscape", "Microsoft Excel"])}
    <h3>Technical</h3>${li(["Construction Documentation", "Space Planning", "Lighting Analysis", "Finish & Material Specification", "Budget Development", "Rendering & Visualization", "Code Research (OBC, Accessibility Standards)"])}
    <h3>Design Skills</h3>${li(["Concept Development & Narrative Building", "Human-Centered & Evidence-Based Design", "Biophilic & Wellness Integration", "Workplace & Commercial Strategy", "Furniture & Product Conceptualization", "Circadian Lighting Strategy", "Material Storytelling", "Graphic & Presentation Layout"])}
    <h3>Personal Skills</h3>${li(["Project Leadership", "Clear Communication", "Critical Thinking", "Adaptability Under Constraints", "Detail-Oriented Execution", "Collaborative Teamwork", "Time Management", "Strategic Decision-Making"])}
    <h3>Résumé & Contact</h3>${contactHTML()}`;
  }

  /* ---------- Sound: soft lounge music + elevator ding, synthesised with the Web Audio API.
     No audio files needed. Browsers only allow sound after a click, so it starts on ENTER. ---------- */
  let ac, master, sfxBus, musicBus, soundOn = true, playing = false, timer, nextT = 0, stepN = 0;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function ensureCtx() {
    if (ac) { if (ac.state === "suspended") ac.resume(); return ac; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ac = new AC(); master = ac.createGain(); master.gain.value = 1; master.connect(ac.destination);
    const len = ac.sampleRate * 2.5, buf = ac.createBuffer(2, len, ac.sampleRate);          // gentle room reverb
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5); }
    const verb = ac.createConvolver(); verb.buffer = buf; const vg = ac.createGain(); vg.gain.value = .45; verb.connect(vg); vg.connect(master);
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1700;   // softens everything
    musicBus = ac.createGain(); musicBus.gain.value = 0; musicBus.connect(lp); lp.connect(master); lp.connect(verb);
    sfxBus = ac.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master); sfxBus.connect(verb);
    return ac;
  }
  function note(f, t, dur, peak, bus, type = "sine", attack = .02) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + .05);
  }
  // Jazzy four-chord loop: Cmaj9 – Am9 – Dm9 – G13
  const CH = [{ b: 48, pad: [60, 64, 67, 71], arp: [72, 74, 76, 79, 83] }, { b: 45, pad: [57, 60, 64, 67], arp: [69, 72, 74, 76, 79] },
              { b: 50, pad: [57, 62, 65, 69], arp: [69, 72, 74, 77, 81] }, { b: 43, pad: [59, 62, 65, 69], arp: [71, 74, 77, 79, 81] }];
  function schedule() {
    const eighth = .46;
    while (nextT < ac.currentTime + 1.2) {
      const c = CH[Math.floor(stepN / 8) % 4], s = stepN % 8;
      if (s === 0) { c.pad.forEach(m => note(hz(m), nextT, 3.9, .16, musicBus, "sine", 1.2)); note(hz(c.b), nextT, 2.6, .3, musicBus, "triangle", .05); }
      if (s === 4) note(hz(c.b + 7), nextT, 1.6, .16, musicBus, "triangle", .05);
      if (s % 2 === 0 && Math.random() < .65) { const m = c.arp[Math.floor(Math.random() * c.arp.length)];   // soft vibraphone-like notes
        note(hz(m), nextT, 1.5, .13, musicBus); note(hz(m) * 4, nextT, .4, .012, musicBus); }
      nextT += eighth; stepN++;
    }
  }
  function startMusic() {
    if (!ensureCtx() || playing) return; playing = true; nextT = ac.currentTime + .1;
    musicBus.gain.cancelScheduledValues(ac.currentTime); musicBus.gain.setTargetAtTime(.1, ac.currentTime, 1.5);  // slow, quiet fade-in
    schedule(); timer = setInterval(schedule, 250);
  }
  function stopMusic() {
    if (!ac || !playing) return; playing = false; clearInterval(timer); musicBus.gain.setTargetAtTime(0, ac.currentTime, .3);
  }
  function ding(t, f = 1318.5, level = .09) {     // bell-like: fundamental + soft overtones, long gentle decay
    note(f, t, 1.8, level, sfxBus); note(f * 2, t, .9, level * .25, sfxBus); note(f * 2.76, t, .35, level * .08, sfxBus);
  }
  const sfx = {
    press() { if (!soundOn || !ensureCtx()) return; ding(ac.currentTime + .01, 1318.5, .08); if (!playing) startMusic(); },   // button "ding"
    arrive() { if (!soundOn || !ensureCtx()) return; const t = ac.currentTime + .01; ding(t, 1318.5, .1); ding(t + .6, 1046.5, .09); } // arrival chime
  };
  const mb = $("#musicBtn");
  const mlabel = () => { mb.textContent = soundOn ? "♪ Sound on" : "♪ Sound off"; mb.setAttribute("aria-pressed", soundOn); };
  mb.addEventListener("click", () => { soundOn = !soundOn; mlabel(); if (soundOn) startMusic(); else stopMusic(); });
  $("#enter").addEventListener("click", () => { if (soundOn) startMusic(); });
  document.addEventListener("visibilitychange", () => { if (!ac || !playing) return; document.hidden ? ac.suspend() : ac.resume(); });
  mlabel();

  /* ---------- Closing, keyboard, navigation ---------- */
  function closeAll() { $$(".overlay").forEach(o => o.hidden = true); }
  function close() {
    if (!$("#lb").hidden) return $("#lb").hidden = true, $("#pImg").focus();
    closeAll(); if (opener && document.contains(opener)) opener.focus();
  }
  $$("[data-close]").forEach(b => b.addEventListener("click", close));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1);
    if (document.body.dataset.view === "elevator" && /^[1-7]$/.test(e.key) && $$(".overlay").every(o => o.hidden)) ride(+e.key);
  });
  $$("[data-nav]").forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.nav; if (busy) return; closeAll();
    ({ home: () => { show("home"); }, elevator: goElevator, projects: allProjects, about: () => direct(1), archive: () => direct(7), contact: contact })[k]();
  }));
  // Open a project on its own floor (used by cross-links between Floor 2 and Floor 7)
  function goProject(id, n) { closeAll(); floor = n; openGallery(n); openProject(id); }
  function toArchive(exhibit) { closeAll(); floor = 7; openGallery(7); window.Archive && Archive.show(exhibit); }
  function toElevator() { if (busy) return; closeAll(); backToElevator(); }
  window.EL = { openProject, goProject, toArchive, toElevator, setOpener: o => opener = o,
    restore: () => { if (opener && document.contains(opener)) opener.focus(); } };
  $("#enter").addEventListener("click", enter);
  $("#back").addEventListener("click", backToElevator);
  $("#skipAnim").addEventListener("change", e => document.body.classList.toggle("fast", e.target.checked));
})();
