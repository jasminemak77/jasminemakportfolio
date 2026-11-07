/* ==========================================================
   EDIT THIS FILE to change any project text, image or hotspot.
   All text comes from Jasmine's 2026 portfolio PDF.
   Images in assets/projects/<slug>/ are pages rendered from that PDF.
   To use your own images, drop them in the folder and edit the paths.
   ========================================================== */
const P = (slug, n) => `assets/projects/${slug}/page-${String(n).padStart(2, "0")}.webp`;
const G = (slug, n, cap, group = "Portfolio pages") => ({ src: P(slug, n), alt: cap, caption: cap, group });

window.PROJECTS = [
  { id: "live-work-condo", title: "Live Work Condo", category: "Residential Design",
    intro: "A contemporary live-work condominium developed entirely through hand drafting and manual rendering. The project built a foundational understanding of spatial planning, technical drawing and visual communication through traditional drafting methods.",
    concept: "Rooted in minimalist and Scandinavian design principles: clean lines, simplicity and a restrained monochromatic palette of whites, blacks and cool greys. The layout organizes living, working and private spaces into a clear spatial sequence supporting everyday living and creative productivity.",
    process: "Hand-drawn plans, elevations and perspective drawings were used to communicate the design. The project incorporates research from the WELL Building Standard, exploring how natural light, indoor air quality and mental wellness influence residential environments. Large window openings, interior greenery and calm material selections support physical comfort and psychological well-being.",
    reflection: "This project strengthened my ability to communicate spatial ideas through hand drafting and manual rendering. I developed a deeper understanding of how layout, light, and material restraint can shape both function and emotional experience within compact living environments.",
    gallery: [G("live-work-condo", 1, "Live Work Condo: Cover", "Presentation"), G("live-work-condo", 2, "Live Work Condo: Mood board", "Presentation"), G("live-work-condo", 3, "Live Work Condo: Partition plan", "Technical Drawings"), G("live-work-condo", 4, "Live Work Condo: Furniture plan", "Technical Drawings"), G("live-work-condo", 5, "Live Work Condo: Section view", "Technical Drawings"), G("live-work-condo", 6, "Live Work Condo: Kitchen elevation", "Technical Drawings"), G("live-work-condo", 7, "Live Work Condo: WELL Building Standards: Air", "Research"), G("live-work-condo", 8, "Live Work Condo: WELL Building Standards: Light", "Research"), G("live-work-condo", 9, "Live Work Condo: WELL Building Standards: Mind", "Research"), G("live-work-condo", 10, "Live Work Condo: Perspective hand drawing", "Technical Drawings")] },

  { id: "ledger-residence", title: "Ledger Residence", category: "Residential Design",
    intro: "The Ledger Residence explores contemporary farmhouse living through a refined balance of warmth and restraint. Traditional architectural cues are reinterpreted through clean lines, simplified detailing, and a disciplined material palette.",
    concept: "“To design a freestanding sustainable structure with an emphasis on form to provide an inclusive space for healthy living.” Rooted in biophilic principles, the residence is conceived as a calm, grounded retreat that supports everyday rituals and connection. The design prioritizes openness, longevity, and connection to nature.",
    process: "The spatial layout supports entertaining, aging in place, and long-term comfort through thoughtful circulation and storage planning. The open concept plan connects the kitchen, dining, and living areas; a main floor primary suite enhances accessibility, while upper level bedrooms and loft space accommodate family and guests. Exterior: pitched rooflines, standing seam roofing, soft white siding and natural wood accents. Stone pavers, natural wood decking and covered gathering areas extend the interior outdoors; the screened porch, pool, and fire pit reinforce social connection. Interior palette: soft whites, sandy neutrals, and warm wood tones, with engineered hardwood flooring and layered textiles.",
    reflection: "Through this project, I explored how residential design can balance aesthetic clarity with long-term livability. I focused on creating a home that supports both social connection and aging in place, reinforcing my ability to design with both present needs and future adaptability in mind.",
    gallery: [G("ledger-residence", 1, "Ledger Residence: Cover", "Presentation"), G("ledger-residence", 2, "Ledger Residence: Proposed floor plans", "Technical Drawings"), G("ledger-residence", 3, "Ledger Residence: Exterior", "Presentation"), G("ledger-residence", 4, "Ledger Residence: Mood board", "Presentation"), G("ledger-residence", 5, "Ledger Residence: Interior rendering 1 of 4", "Final Renderings"), G("ledger-residence", 6, "Ledger Residence: Interior rendering 2 of 4", "Final Renderings"), G("ledger-residence", 7, "Ledger Residence: Interior rendering 3 of 4", "Final Renderings"), G("ledger-residence", 8, "Ledger Residence: Interior rendering 4 of 4", "Final Renderings")] },

  /* Presentation case study: content in data/case-lwb.js, rendered by js/case.js. Documentation version stays on Floor 7. */
  { id: "living-without-barriers", title: "Living Without Barriers", category: "Residential Design", case: true,
    gallery: [{ src: "assets/projects/living-without-barriers/01-hero.webp", alt: "Living Without Barriers, accessible Muskoka cottage", caption: "Living Without Barriers", group: "Presentation" }] },

  { id: "oishimono", title: "Oishimono", category: "Restaurant Design",
    intro: "Rooted in the principles of Japandi and Wabi-Sabi, the final design concept blends minimalism with warmth and imperfection with intentionality. This Japanese all-you-can-eat restaurant embraces a moody, grounded palette and natural materials to create a dining experience that feels intimate, serene, and deeply connected to the present moment. Georgian College, E Building, First Floor.",
    concept: "The interior evokes calmness and quiet luxury, where clean lines and organic textures reflect the beauty of simplicity. Guests are welcomed at a sculptural host stand, leading into a curated environment where soft lighting, raw finishes, and layered materials guide the experience. This restaurant is more than a place to eat; it is a space of presence, ritual, and rhythm.",
    process: "Thoughtful zoning supports smooth service and back-of-house operations while maintaining flow and openness. The central dining area accommodates at least 60 patrons, with seating that promotes comfort and privacy while maintaining visual connectivity. The bar, with seating for eight, is both a service point and a quiet place to pause. A muted, earthy palette of natural woods, textured finishes, woven textiles and diffused lighting builds a layered, tactile atmosphere; open sightlines maintain connectivity while private niches provide retreat.",
    reflection: "This project challenged me to translate an abstract design philosophy into a cohesive spatial experience. I refined my ability to use materiality, lighting, and spatial sequencing to shape atmosphere, while also considering operational flow and user comfort in a high-occupancy environment.",
    gallery: [1,2,3].map(n => G("oishimono", n, `Oishimono: portfolio page ${n} of 3`)) },

  { id: "modunest", title: "ModuNest", category: "Office Design: The Future of Workplace Design",
    intro: "“What if the workplace felt less like an obligation and more like a renewal?” ModuNest reframes the office as a restorative destination. Inspired by the rhythm of vacation environments, the design integrates collaboration, reflection, and rejuvenation within a cohesive spatial framework.",
    concept: "Rather than designing solely for productivity, the project prioritizes balance. The workplace is positioned as an emotional ecosystem that supports autonomy, creativity, and long-term well-being. Innovation is framed as a result of restoration rather than exhaustion.",
    process: "Circulation expands and compresses to support transitions between active collaboration and focused retreat. Variations in ceiling height, layered lighting, and natural materiality create sensory modulation throughout the day. Extensive glazing maximizes daylight penetration, reinforcing circadian alignment and visual openness. Collaboration zones foster collective energy, while enclosed focus areas provide acoustic and visual privacy.",
    reflection: "This project expanded my understanding of workplace design beyond productivity, allowing me to explore how spatial environments can support well-being, autonomy, and creativity. I developed a stronger ability to design for emotional experience, using spatial rhythm, light, and materiality to influence how users feel and perform.",
    gallery: [1,2].map(n => G("modunest", n, `ModuNest: portfolio page ${n} of 2`)) },

  { id: "activity-alley", title: "The Activity Alley", category: "Hospitality Design: Healthcare",
    intro: "“What if waiting became part of the healing experience?” The Activity Alley reimagines hospital waiting as an active, human-centered experience for pediatric patients, families, staff, and community members. Location: Royal Victoria Regional Health Centre.",
    concept: "Through movement, play, connection, immersion, and rest, the design transforms traditional circulation space into a destination that supports emotional well-being and positive healthcare experiences. Rather than a single waiting area, it creates a sequence of interconnected environments offering choice, control, and engagement throughout the patient journey.",
    process: "Design drivers: Move (intuitive circulation and flow), Play (movement, distraction, and emotional release), Connect (moments of shared presence and human connection), Immerse (sensory and atmospheric experience), Rest (calm, retreat, and mental reset) and Refuel (physical and emotional nourishment). Level 1: Community & Arrival. Level 2: Support & Relaxation. Level 3: Playground & Active Wellness.",
    reflection: "A sequence of spaces that transforms waiting into movement, connection, and care.",
    gallery: [G("activity-alley", 1, "Level plans: Community & Arrival, Support & Relaxation, Playground & Active Wellness", "Technical Drawings"), G("activity-alley", 2, "The Activity Alley: portfolio page 2"), G("activity-alley", 3, "The Activity Alley: portfolio page 3"), G("activity-alley", 4, "Move, Play, Connect, Immerse, Rest, Refuel")] },

  { id: "lumi-sync", title: "Lumi Sync", category: "Product Design",
    intro: "“Sync with the Sun. Live in Your Best Light.” A circadian-responsive luminaire that aligns interior lighting with natural biological rhythms.",
    concept: "A mechanically adjustable dome simulates the vertical movement of the sun, transitioning between 2000K warm light and 5000K daylight. The form communicates movement through curvature and graduated value; a textured diffuser softens illumination.",
    process: "Technical considerations: LED light source selection; adjustable lumen output (400–1000 lumens); 90+ CRI; circadian rhythm support; mechanical vertical dome movement. Additional: glare mitigation through diffusion, wide beam angle, energy-efficient LED, biophilic circadian integration, low heat output, user-responsive mechanical movement.",
    reflection: "Through this product, I deepened my understanding of how lighting design can directly impact human health and behaviour. I explored the relationship between form, movement, and circadian rhythm, strengthening my ability to integrate technical performance with conceptual clarity.",
    gallery: [G("lumi-sync", 1, "Lumi Sync: portfolio page")] },

  { id: "sol-seat", title: "The Sol Seat", category: "Furniture Design",
    intro: "“How can a single object restore rhythm within the workplace?” The Sol Seat reimagines workplace furniture as a restorative spatial intervention.",
    concept: "Inspired by tidal movement, its continuous wave profile supports fluid transitions between focus and pause. Rooted in environmental psychology and Attention Restoration Theory, it supports autonomy, clarity, and emotional reset within collaborative environments.",
    process: "Layered materials reinforce the concept. Wood slats introduce warmth and structure, sand-toned trims soften edges, and a blue felt base grounds the form visually. Materials listed: DOCK – 9042 Brun Refined Hickory; SAND – 9041 Natural Refined Hickory; TIDES – 9320 Blue Felt.",
    reflection: "This project allowed me to explore furniture as an extension of spatial experience. I focused on how form, material, and ergonomics can support moments of pause and restoration, reinforcing my interest in designing objects that contribute to emotional and cognitive well-being within larger environments.",
    gallery: [G("sol-seat", 1, "The Sol Seat: portfolio page")] },


  /* ---- Design Process examples (hidden from "All Projects"; reuse real project material) ---- */
  { id: "pr-concept", hidden: true, title: "Concept Development", category: "Design Process",
    intro: "Every project begins with a narrative question. ModuNest asked: what if the workplace felt less like an obligation and more like a renewal? The Sol Seat asked: how can a single object restore rhythm within the workplace?",
    gallery: [G("modunest", 1, "ModuNest concept page")] },
  { id: "pr-research", hidden: true, title: "Research and Inspiration", category: "Design Process",
    intro: "Live Work Condo draws on research from the WELL Building Standard (light, air quality, mental wellness). The Sol Seat draws on environmental psychology and Attention Restoration Theory. Oishimono is inspired by Japandi and Wabi-Sabi.",
    gallery: [G("live-work-condo", 7, "Live Work Condo: WELL Building Standards research")] },
  { id: "pr-space", hidden: true, title: "Space Planning", category: "Design Process",
    intro: "Ledger Residence plans circulation and storage for aging in place, with an open concept plan and a main floor primary suite. Oishimono zones a 60+ seat dining room with an eight-seat bar around back-of-house operations.",
    gallery: [G("ledger-residence", 2, "Ledger Residence: proposed floor plans", "Technical Drawings")] },
  { id: "pr-technical", hidden: true, title: "Technical Drawings", category: "Design Process",
    intro: "Live Work Condo was communicated entirely through hand-drafted plans, elevations and perspectives, including a longitudinal elevation and kitchen elevation.",
    gallery: [G("live-work-condo", 6, "Live Work Condo: kitchen elevation", "Technical Drawings")] },
  { id: "pr-material", hidden: true, title: "Material Exploration", category: "Design Process",
    intro: "The Sol Seat lists DOCK – 9042 Brun Refined Hickory, SAND – 9041 Natural Refined Hickory and TIDES – 9320 Blue Felt. Ledger Residence layers soft whites, sandy neutrals and warm wood tones.",
    gallery: [G("sol-seat", 1, "The Sol Seat material palette")] },
  { id: "pr-visual", hidden: true, title: "Visualization and Rendering", category: "Design Process",
    intro: "From manual rendering in Live Work Condo to digital presentation of Oishimono and Ledger Residence. Software: Revit, AutoCAD, SketchUp, Twinmotion, Enscape, Adobe InDesign and Photoshop.",
    gallery: [G("oishimono", 2, "Oishimono presentation")] },
  { id: "pr-refine", hidden: true, title: "Design Refinement", category: "Design Process",
    intro: "“Design, for me, is an ongoing pursuit of refinement.” Each project closes with a reflection on what was learned and carried forward.",
    gallery: [G("ledger-residence", 8, "Ledger Residence: interior rendering")] }
];

/* Floors: each has a theme (drives lighting/materials in css/style.css) and a mood line shown on the floor banner.
    hotspot x/y/w/h are % of the background image (1672×941). Adjust to move hotspots. */
window.FLOORS = [
  { n: 1, label: "About Me", theme: "about", mood: "Personal · warm · welcoming", bg: "about-studio.webp", about: true, hotspots: [] },
  { n: 2, label: "Residential Design", theme: "residential", mood: "Comfortable · welcoming · refined · calm", bg: "residential-gallery.webp", hotspots: [
    { project: "live-work-condo", x: 14, y: 54, w: 25, h: 25 }, { project: "ledger-residence", x: 61.5, y: 59, w: 27, h: 22 }, { project: "living-without-barriers", x: 42.5, y: 38, w: 15, h: 16 }] },
  { n: 3, label: "Hospitality Design", theme: "hospitality", mood: "Intimate · sophisticated · immersive", bg: "hospitality-gallery.webp", hotspots: [
    { project: "oishimono", x: 1, y: 22, w: 17, h: 46 }, { project: "activity-alley", x: 82, y: 20, w: 14, h: 46 }] },
  { n: 4, label: "Workplace Design", theme: "workplace", mood: "Open · collaborative · experimental", bg: "workplace-gallery.webp", hotspots: [{ project: "modunest", x: 37, y: 53, w: 36, h: 28 }] },
  { n: 5, label: "Objects & Furniture", theme: "objects", mood: "Considered · tactile · gallery-lit", bg: "objects-gallery.webp", hotspots: [
    { project: "lumi-sync", x: 15, y: 63, w: 31, h: 17 }, { project: "sol-seat", x: 59, y: 63, w: 33, h: 17 }] },
  { n: 6, label: "Design Process", theme: "archive", mood: "Creative · exploratory · personal · thoughtful", bg: "process-studio.webp", hotspots: [
    { project: "pr-concept", x: 5.7, y: 12, w: 16, h: 48 }, { project: "pr-research", x: 26, y: 21, w: 7.5, h: 37 },
    { project: "pr-space", x: 10, y: 55, w: 28, h: 31 }, { project: "pr-material", x: 42, y: 54, w: 18, h: 10 },
    { project: "pr-technical", x: 59, y: 57, w: 36, h: 28 }, { project: "pr-refine", x: 70.5, y: 38, w: 9, h: 18 },
    { project: "pr-visual", x: 81, y: 14, w: 15.5, h: 47 }] },
  /* Floor 7 is the walkable studio-gallery built in js/archive.js from data/archive.js.
     Optional: add assets/images/archive-studio.webp for its own background; until then it borrows process-studio.webp. */
  { n: 7, label: "The Design Archive", theme: "studio", mood: "Reflective · technical · collaborative · explorable", bg: "archive-studio.webp", bgFallback: "process-studio.webp", archive: true, hotspots: [] }
];

/* Contact + resume. Replace the email; I did not invent one. */
window.SITE = { email: "YOUR-EMAIL@example.com", resume: "assets/documents/resume.pdf" };
