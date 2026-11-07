/* ==========================================================
   LIVING WITHOUT BARRIERS: Floor 2 presentation case study.
   EDIT TEXT HERE. IMAGES: upload your WebP files (rendered from "MS PROJECT.pdf")
   into  assets/projects/living-without-barriers/  using EXACTLY these names:

     01-hero.webp          page 1   hero / introduction image
     02-floor-plan.webp    page 2   accessible cottage floor plan
     03-kitchen.webp       page 3   kitchen rendering
     04-bedroom-1.webp     page 4   bedroom rendering
     05-bedroom-2.webp     page 5   bedroom rendering
     06-bedroom-3.webp     page 6   bedroom rendering
     07-wet-room.webp      page 7   accessible wet room rendering
     08-living-room.webp   page 8   living room rendering
     09-moodboard.webp     page 9   material moodboard
     10-systems-wellness.webp  page 10  systems & wellness page

   Until a file is uploaded, that spot shows an "Image coming soon" placeholder.
   ========================================================== */
(() => {
  const D = "assets/projects/living-without-barriers/";
  const im = (file, caption, alt) => ({ src: D + file + ".webp", caption, alt: alt || caption });
  window.CASES = window.CASES || {};
  window.CASES["living-without-barriers"] = {
    title: "Living Without Barriers",
    subtitle: "Designing an Accessible Cottage for Living with Multiple Sclerosis",
    type: "Residential Design | Accessible Cottage Renovation",
    course: "INDE3007 Interdisciplinary Practice",
    designers: "Jasmine Mak & Larissa De Souza",
    hero: im("01-hero", "Living Without Barriers: accessible Muskoka cottage", "Presentation hero image of the accessible Muskoka cottage design"),
    intro: [
      "Living Without Barriers is an interdisciplinary residential design project focused on creating an accessible cottage in Muskoka for an individual living with Multiple Sclerosis.",
      "The design explores how residential environments can support independence, comfort, accessibility, and long-term adaptability without sacrificing aesthetics. It combines warm accessible minimalism with thoughtful spatial planning, natural materials, and integrated accessibility features to create a calming and supportive home."
    ],
    sections: [
      { id: "plan", nav: "Floor Plan", title: "Floor Plan & Spatial Planning", kind: "feature",
        image: im("02-floor-plan", "Accessible cottage floor plan", "Floor plan of the accessible cottage"), zoom: true,
        lead: "Select the plan to enlarge it for closer viewing.",
        points: ["Open-plan circulation", "1500 mm wheelchair turning radii", "Accessible kitchen and bathroom", "Reduced travel distances", "Zoned spaces for daily activities", "Multiple rest points"] },
      { id: "kitchen", nav: "Kitchen", title: "Accessible Kitchen", kind: "wide",
        image: im("03-kitchen", "Accessible kitchen rendering", "Rendering of the accessible kitchen"),
        points: ["Lowered countertops between 720 and 800 mm", "Knee clearance for wheelchair access", "Pull-out storage systems", "Accessible reach ranges of 400 to 1200 mm"] },
      { id: "bedroom", nav: "Bedroom", title: "Bedroom Design", kind: "carousel",
        images: [im("04-bedroom-1", "Bedroom: view 1 of 3", "Bedroom rendering, view 1 of 3"), im("05-bedroom-2", "Bedroom: view 2 of 3", "Bedroom rendering, view 2 of 3"), im("06-bedroom-3", "Bedroom: view 3 of 3", "Bedroom rendering, view 3 of 3")],
        points: ["Transfer space beside the bed", "Adjustable bed", "Nighttime safety lighting", "Calm material selections to support fatigue management"] },
      { id: "wetroom", nav: "Wet Room", title: "Accessible Wet Room", kind: "wide",
        image: im("07-wet-room", "Accessible wet room rendering", "Rendering of the accessible wet room"),
        points: ["Barrier-free roll-in shower", "Grab bar positioning", "Wheelchair turning clearance", "Slip-resistant flooring"] },
      { id: "living", nav: "Living", title: "Living & Social Space", kind: "wide",
        image: im("08-living-room", "Living room rendering", "Rendering of the living and social space"),
        text: "Furniture placement, open circulation, rest points, and a calm visual environment work together to support comfortable daily living and time with others." },
      { id: "materials", nav: "Materials", title: "Materiality & Design Atmosphere", kind: "feature",
        image: im("09-moodboard", "Material moodboard", "Material moodboard for the cottage"), zoom: true,
        lead: "Warm accessible minimalism:",
        points: ["Natural wood finishes", "Soft neutral colours", "Warm lighting", "Accessible furniture", "Integrated functional features"] },
      { id: "systems", nav: "Systems", title: "Systems & Wellness", kind: "systems",
        image: im("10-systems-wellness", "Systems and wellness", "Systems and wellness page from the presentation"),
        lead: "Comfort was considered beyond the room itself:",
        points: ["Lighting", "Accessible controls", "Ventilation", "Ergonomics", "Environmental comfort"] },
      { id: "reflection", nav: "Reflection", title: "Project Reflection", kind: "reflection",
        text: "Working across disciplines kept the design grounded in how the home is actually lived in. Accessibility was treated as the starting point rather than an added feature, so that independence, dignity and comfort shaped every decision, from the plan to the finishes. The aim was a home that supports the person living in it and still feels like a place they would want to be." }
    ],
    crossLink: { text: "Explore the technical documentation in The Design Archive.", exhibit: "col-lwb" }
  };
})();
