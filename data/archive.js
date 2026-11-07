/* ==========================================================
   THE DESIGN ARCHIVE: content + image map. EDIT THIS FILE.
   ----------------------------------------------------------
   IMAGE MAP
   Every image is a path under assets/archive/<section-folder>/<exhibit-folder>/.
   To replace any image with your own, save your JPG / PNG / WebP over the
   same filename (or change the file name in the list below).
   A small preview ("-thumb") is used for cards; if it is missing the full
   image is used instead. Missing images show an "Image coming soon" card.

   assets/archive/
     sketchbook/<study>/rough.webp, final.webp
     technical/johnsons-beach/sheet-01 … sheet-11.webp
     technical/building-e-site-review/sheet-01.webp
     technical/kitchen-materials/board-01.webp
     technical/living-room-materials/board-01.webp
     systems/modunest/<sheet-name>.webp
     collaborative/living-without-barriers/page-01 … page-15.webp
     collaborative/d-building/sheet-01 … sheet-07.webp
   assets/documents/archive/   <- optional full PDFs
   ========================================================== */
(() => {
  const AR = "assets/archive/";
  // img("folder/file-without-extension", caption, group, alt)
  const img = (p, caption, group = "", alt = "") => ({ src: AR + p + ".webp", thumb: AR + p + "-thumb.webp", caption, group, alt: alt || caption });
  const DOC = "assets/documents/archive/";

  /* ---------- SECTION A: Sketchbook & Observation ---------- */
  const sketch = (slug, title, place, medium, text, reflection) => ({
    id: "sk-" + slug, title, subtitle: place, medium, text, reflection, compare: true,
    images: [img(`sketchbook/${slug}/rough`, `${title}: rough sketch`, "Rough", `Rough pencil sketch: ${title}`),
             img(`sketchbook/${slug}/final`, `${title}: developed sketch`, "Final", `Developed sketch: ${title}`)]
  });

  const A = [
    sketch("kitchen", "Kitchen Perspective", "Interior perspective", "Pencil and pencil crayon",
      "A study of a modern kitchen, drawn for its dimensions and the many shades of grey in its finishes.",
      "I thought it'd be a good area to sketch for its dimensions. In the rough draft my island is way off, so I knew to fix it for my finalized copy. My kitchen has so many shades of grey that I mixed a couple of pencil crayons into the general colour palette and blended them with different pencils. I used pencil crayons because the many different shades are easier to blend and build, giving it more dimension. Looking at it still, the dimensions of the whole area are completely off, but as long as you can see a kitchen, it is perfect to me!"),
    sketch("living-room", "Living Room Perspective", "Interior perspective", "Black ink pen",
      "Drawn from the perspective of sitting on the couch in front of the T.V.",
      "I chose this area because I was comfortable where I was and drew away. I kinda wish there was something on the ground to draw, because there is a lot of negative space to cover. For the finalized copy I used a simple black ink pen. I learned this in my last year of high school, when we did weekly sketches and I drew a landscape of Banff, Alberta in black ink pen. I figured that with so many sorts of lines in this area, that kind of medium would be fit."),
    sketch("teddy-bear-museum", "Teddy Bear Museum, Phú Quốc, Vietnam", "Exterior observation from travel, summer 2022", "",
      "A sketch of the Teddy Bear Museum on Phú Quốc Island, in an area known as “No Sleep City”.",
      "It was absolutely ginormous and I wasn't even that far from it. I would describe the area as Disneyland without the rides, just a bunch of light shows and foods to eat. For the finalized copy, I wish I tested out the colours beforehand. As you can tell, I became very loose with this one. I like the rough draft over the finalized one."),
    sketch("residential-exterior", "Residential Exterior", "Exterior observation: a new-build home", "Prismacolor markers",
      "A study of a new-build house in a subdivision with black brick or slab cladding and black-framed windows.",
      "The house is still in construction but it is almost my dream house. In this subdivision I've noticed black bricks/slabs, giving it a cleaner look, and many houses with black-frame windows, which is my dream detail for my future house. I used my Prismacolor markers because we were given a pack of just shades, and I felt it could give the feeling of the variety of black and greys for a house. When I finished colouring it in, I noticed it gave it a Halloween feeling, the feeling of a house you'd see in the middle of nowhere!"),
    sketch("barrie-keg", "Barrie Keg Exterior", "Exterior observation: Barrie, Ontario", "Watercolour",
      "A study of the Barrie Keg exterior: its classy yet modern look.",
      "I really like the exterior of it, the classy yet modern look. I used watercolour paint because I wanted to try something new, and I really liked the way the colours blended, giving some variation like the colours in real life. I wish I used watercolour paper, but that is solely my fault because I chose my medium last second. I still love this one, and I can definitely see where I can improve the next time I use watercolours.")
  ];

  /* ---------- SECTION B: Technical & Spatial Thinking ---------- */
  const wash = [
    ["Cover and table of contents", "Project cover with the table of contents for the drawing package."],
    ["C1: Project information with OBC data matrix", "Ontario Building Code data matrix for the washroom building at Johnson's Beach, Barrie."],
    ["C2: Site and roof plan", "Site plan showing the building, sanitary line and water supply main, with an assemblies legend."],
    ["ID1: Interior details", "Lobby with elevator plan view, elevator section view and universal washroom plan view."],
    ["M1.1: Main floor plumbing plan", "Lobby, lifeguard station, showers, washroom and mechanical room, with waste, traps and floor drains."],
    ["M1.2: Second floor plumbing plan", "Lobby, washroom, locker room, gym and meeting room."],
    ["M1.3: Plumbing riser section", "Plumbing water supply section and plumbing water drainage section."],
    ["M2.1: Main floor HVAC plan", "Supply and return layout, vertical shaft and mechanical room equipment."],
    ["M2.2: Second floor HVAC plan", "HVAC layout for the second floor."],
    ["M2.3: HVAC riser section", "HVAC riser section through both floors."],
    ["M3: Fixture schedule and data sheets", "Fixture schedule (F1 to F8) with product, manufacturer, model, dimensions and finish."]
  ];
  const B = [
    { id: "tb-johnsons", title: "2 Johnson's Beach: Washroom Design", subtitle: "Technical drawing package · INDE3002 Building Technologies", cover: 0,
      text: "Project #1 of INDE3002 Building Technologies (instructor: Andrea Vorstermans-Zado), dated December 2, 2025. A drawing package for a two-storey washroom building at 2 Johnson's Beach, Barrie: building-code data, site and roof plan, interior details, plumbing and HVAC plans with riser sections, and a fixture schedule.",
      doc: { href: DOC + "johnsons-beach-washroom-design.pdf", label: "Open the full drawing package (PDF)" },
      images: wash.map((w, i) => img(`technical/johnsons-beach/sheet-${String(i + 1).padStart(2, "0")}`, w[0], "Drawing sheets", w[1])) },
    { id: "tb-building-e", title: "Georgian College Building E: Site Review", subtitle: "Site visit and building plan · INDE2007 · December 2022",
      text: "A site visit to Georgian College's Building E, first floor (Barrie Campus), covering the Georgian Dining Room (E100) and the large quantity kitchen (E103), with a sketched ceiling-height section and stair notes.",
      bullets: ["Some seating sits right by entrances and high foot-traffic areas: not practical.", "Table placements are interesting.", "Way too many pot lights next to a big wall of windows, for a dining room open only 12 to 1 p.m.: not sustainable or energy-saving.", "Kitchen: very crammed and claustrophobic; separate doors for entry and exit are a good idea; it needs a proper dish pit area.", "Suggestion: a push door with a window instead of handles, so servers don't need free hands to open it."],
      images: [img("technical/building-e-site-review/sheet-01", "Site visit: building plan and notes", "Site review", "Hand-drawn building plan of Georgian College Building E first floor with written site notes")] },
    { id: "tb-kitchen", title: "Kitchen: Material & Fixture Exploration", subtitle: "Material and fixture board",
      text: "A board pairing a hand-rendered kitchen elevation and a kitchen plan excerpt with appliance, faucet, countertop and flooring selections.",
      images: [img("technical/kitchen-materials/board-01", "Kitchen material and fixture board", "Board", "Kitchen board with appliances, faucet, countertop and flooring samples around a hand-rendered elevation and plan")] },
    { id: "tb-living", title: "Living Room: Furniture & Material Exploration", subtitle: "Furniture and material board",
      text: "A board pairing a hand-rendered living room elevation and furniture plan with sofa, sideboard, lounge chair, coffee table, rug and flooring selections.",
      images: [img("technical/living-room-materials/board-01", "Living room furniture and material board", "Board", "Living room board with furniture, rug and flooring samples around a hand-rendered elevation and plan")] }
  ];

  /* ---------- SECTION C: Systems & Design Research (ModuNest) ---------- */
  const C = {
    id: "sys-modunest", title: "ModuNest: Systems & Design Research", subtitle: "Workplace design · four linked studies",
    text: "Four sheets that belong together: how ModuNest's zones are separated acoustically, found by light, named by signage and kept safe. Zones across all sheets: Communal Kitchen (The Heartbeat), Co-Creation Studio (The Spark), Recreation & Wellness (The Balance), Prototype Display Area (The Experiment), Workstations (The Flow), Quiet Zone (The Nest) and Washrooms (The Reset).",
    link: { project: "modunest", label: "Open the main ModuNest project" },
    images: [
      Object.assign(img("systems/modunest/acoustic-concept-plan", "Acoustic Concept Plan (ID1)", "ModuNest studies", "Acoustic concept plan of ModuNest with loud and quiet zones"),
        { note: "Zones are mapped as loud or quiet space. Glass wall partitions separate the lounging area from the workplace; an acoustic panel wall separates the loud spaces so the quiet spaces can remain quiet; work pods serve the Quiet Zone for those who need fully enclosed spaces; workstations are open concept with dividers so users have their own space." }),
      Object.assign(img("systems/modunest/wayfinding-plan", "Wayfinding Plan (ID2)", "ModuNest studies", "Wayfinding plan of ModuNest with the main travel path"),
        { note: "Navigation uses lighting, verticality and sophisticated tech. A LEDCO Flex Neon strip runs the length of the pink main travel path. Ceiling heights vary on purpose: high in The Heartbeat and The Spark, moderate in The Balance and The Flow, shorter toward The Nest and The Reset. Interactive Robin wayfinding kiosks sit at reception and key junctions." }),
      Object.assign(img("systems/modunest/signage-considerations", "Signage Considerations (ID2.1)", "ModuNest studies", "Signage considerations for ModuNest including The Heartbeat and The Nest signs"),
        { note: "All signage uses clear lit lettering and a soft edge glow for continuity, with brightness that adjusts to each space's function. The Heartbeat sign is a wooden plaque with softly illuminated lettering and a slender pulse line; The Nest sign is a hanging sign with a minimalist nest and gesture symbol inviting quiet." }),
      Object.assign(img("systems/modunest/health-and-safety-plan", "Health and Safety Plan & Specifications (ID3)", "ModuNest studies", "Health and safety plan for ModuNest showing detectors, alarms and exits"),
        { note: "Locations of thermostats, CO2 and smoke detectors, fire alarms and cabinets, entries and exits, and security. Relevant OBC articles: 3.2.7.3 Emergency Lighting and 3.2.4.12 Prevention of Smoke Circulation." })
    ]
  };

  /* ---------- SECTION D: Human-Centred & Collaborative Design ---------- */
  const lwbCap = ["Cover", "Abstract", "Design: site and client needs", "Design: design development", "Design: final design solution", "Systems coordination and WELL design integration", "Conclusion",
    "Appendix, 1st milestone: meeting notes", "Appendix, 1st milestone: client notes", "Appendix, 1st milestone: OT meeting summary", "Appendix, 1st milestone: designing for the future", "Appendix, 2nd milestone: empathy map",
    "Appendix, 3rd milestone: zoning sketch 1", "Appendix, 3rd milestone: zoning sketch 2", "Appendix, 3rd milestone: layout options"];
  const dbCap = [["A101: Education Floor, Level 1", "Gallery space, material storage, oversize project, digital fabrication lab, 3D printing lab, print making, dark room, ceramics, kiln, sculpture, painting studios, woodshop, shipping and receiving."],
    ["A102: Education Floor, Level 2", "Interior, graphic and industrial design studios, flex classrooms, materials library and plotters, project and model storage, meeting room, and Diploma, Degree, IT and Partime rooms."],
    ["A103: Exchange Level", "The Market, café, food prep, convenience store, Activity Alley, Grove Place, Theatre Boulevard, Simulation Road, Lazy Lane, Ruff Street and Splater Way."],
    ["A104: Residence Floor, Level 1", "Resident rooms around a central lounge, flex seating, quiet study space, wellness space, and service and support."],
    ["A105: Residence Floor, Level 2", "Resident rooms around a kitchen and dining space with flexible lounge, wellness space, quiet study space and assistants' area."],
    ["A106: Section view", "Building section showing the stacked levels connected by a central spiral stair."],
    ["A107: Elevation", "Building elevation of the stacked, glazed levels beneath the roof."]];
  const D = [
    { id: "col-lwb", title: "Living Without Barriers: Accessible Muskoka Cottage", subtitle: "Collaborative project · Jasmine Mak & Larissa De Souza · INDE3007 Interdisciplinary Practice", cover: 4,
      text: "A renovation of an existing single-storey Muskoka cottage for a client living with Multiple Sclerosis. The design prioritizes accessibility, independence and safety through open circulation, accessible storage, and barrier-free kitchen and bathroom design. It was developed with Occupational Therapy students, whose input informed turning radius, reach ranges and safe circulation paths.",
      link: { project: "living-without-barriers", floor: 2, label: "View the presentation version in Residential Design (Floor 2)" },
      doc: { href: DOC + "living-without-barriers-report.pdf", label: "Open the full written report (PDF)" },
      images: lwbCap.map((c, i) => img(`collaborative/living-without-barriers/page-${String(i + 1).padStart(2, "0")}`, c, i < 7 ? "Report" : "Appendix: milestones", "Living Without Barriers report page: " + c)) },
    { id: "col-dbuilding", title: "D Building: JJRM Collaborative Building Layout", subtitle: "Collaborative academic project · JJRM team · Project 2, Building Layout", cover: 2,
      text: "A collaborative academic project developed by the JJRM team, exploring education, social exchange, student residence and green roof programming across five levels linked by a central stair.",
      doc: { href: DOC + "d-building-drawing-package.pdf", label: "Open the full drawing package (PDF)" },
      images: dbCap.map((c, i) => img(`collaborative/d-building/sheet-${String(i + 1).padStart(2, "0")}`, c[0], "Drawing sheets", c[1])) }
  ];

  /* ---------- THE COMPLETE PORTFOLIO (24 pages, from "JASMINE MAK PORTFOLIO for WEBSITE.pdf") ---------- */
  const PORTFOLIO = {
    id: "portfolio", title: "The Complete Portfolio", subtitle: "Interior design portfolio · 24 pages", cover: 0,
    text: "The full design portfolio in page order. Use the arrows or the thumbnails to move through it, and zoom in to read the drawings and text.",
    doc: { href: "assets/documents/jasmine-mak-portfolio.pdf", label: "Open the full portfolio (PDF)" },
    images: [
      img("portfolio/page-01", "Portfolio page 1 of 24: Cover", "Introduction"),
      img("portfolio/page-02", "Portfolio page 2 of 24: About and proficiencies", "Introduction"),
      img("portfolio/page-03", "Portfolio page 3 of 24: Contents", "Introduction"),
      img("portfolio/page-04", "Portfolio page 4 of 24: Live Work Condo", "Residential: Live Work Condo"),
      img("portfolio/page-05", "Portfolio page 5 of 24: Live Work Condo", "Residential: Live Work Condo"),
      img("portfolio/page-06", "Portfolio page 6 of 24: Live Work Condo", "Residential: Live Work Condo"),
      img("portfolio/page-07", "Portfolio page 7 of 24: Ledger Residence", "Residential: Ledger Residence"),
      img("portfolio/page-08", "Portfolio page 8 of 24: Ledger Residence", "Residential: Ledger Residence"),
      img("portfolio/page-09", "Portfolio page 9 of 24: Ledger Residence", "Residential: Ledger Residence"),
      img("portfolio/page-10", "Portfolio page 10 of 24: Ledger Residence", "Residential: Ledger Residence"),
      img("portfolio/page-11", "Portfolio page 11 of 24: Ledger Residence", "Residential: Ledger Residence"),
      img("portfolio/page-12", "Portfolio page 12 of 24: Ledger Residence", "Residential: Ledger Residence"),
      img("portfolio/page-13", "Portfolio page 13 of 24: Ledger Residence", "Residential: Ledger Residence"),
      img("portfolio/page-14", "Portfolio page 14 of 24: Oishimono", "Restaurant: Oishimono"),
      img("portfolio/page-15", "Portfolio page 15 of 24: Oishimono", "Restaurant: Oishimono"),
      img("portfolio/page-16", "Portfolio page 16 of 24: Oishimono", "Restaurant: Oishimono"),
      img("portfolio/page-17", "Portfolio page 17 of 24: ModuNest", "Office: ModuNest"),
      img("portfolio/page-18", "Portfolio page 18 of 24: ModuNest", "Office: ModuNest"),
      img("portfolio/page-19", "Portfolio page 19 of 24: The Activity Alley", "Hospitality: The Activity Alley"),
      img("portfolio/page-20", "Portfolio page 20 of 24: The Activity Alley", "Hospitality: The Activity Alley"),
      img("portfolio/page-21", "Portfolio page 21 of 24: The Activity Alley", "Hospitality: The Activity Alley"),
      img("portfolio/page-22", "Portfolio page 22 of 24: The Activity Alley", "Hospitality: The Activity Alley"),
      img("portfolio/page-23", "Portfolio page 23 of 24: Lumi Sync", "Product Design: Lumi Sync"),
      img("portfolio/page-24", "Portfolio page 24 of 24: The Sol Seat", "Furniture Design: The Sol Seat")
    ]
  };

  window.ARCHIVE = {
    cover: AR + "collaborative/living-without-barriers/page-05-thumb.webp",
    title: "The Design Archive",
    portfolio: PORTFOLIO,
    intro: "A curated collection of completed academic work and personal design explorations: sketches, research, technical documentation and collaborations. A studio where the thinking behind the portfolio is on the walls.",
    sections: [
      { id: "A", name: "Sketchbook & Observation", blurb: "Five observational studies. Each one shows the rough sketch beside the developed drawing, with notes on technique and lessons learned.", exhibits: A, kind: "sketch" },
      { id: "B", name: "Technical & Spatial Thinking", blurb: "Technical drawings, a site review and material exploration, shown as sheets you can enlarge and read in full.", exhibits: B, kind: "sheets" },
      { id: "C", name: "Systems & Design Research", blurb: "One workplace, four studies: acoustics, wayfinding, signage, and health and safety.", exhibits: [C], kind: "study" },
      { id: "D", name: "Human-Centred & Collaborative Design", blurb: "Two team projects: an accessible cottage designed with Occupational Therapy students, and a collaborative building layout.", exhibits: D, kind: "folio" }
    ]
  };
})();
