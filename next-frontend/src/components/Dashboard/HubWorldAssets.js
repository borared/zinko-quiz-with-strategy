// Helper to build Image objects from raw inline SVGs
const makeSvgImage = (svgString) => {
  if (typeof window === 'undefined') return null;
  const img = new Image();
  img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
  return img;
};

// SVG filter template to inject a bold black outline around retro pixels
const OUTLINE_DEFS = `
  <defs>
    <filter id="outline">
      <feMorphology in="SourceAlpha" result="dilated" operator="dilate" radius="0.5"/>
      <feFlood flood-color="#000000" flood-opacity="1" result="flooded"/>
      <feComposite in="flooded" in2="dilated" operator="in" result="outline"/>
      <feMerge>
        <feMergeNode in="outline"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
`;

// --- AVATARS (24x24 detailed pixel chibi character modeled on the pink-haired CodeDex character) ---

// South (Down) - Frame 1
const CHAR_S_1 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Hair (Purple) -->
    <rect x="6" y="2" width="12" height="7" fill="#805b80"/>
    <rect x="5" y="3" width="14" height="5" fill="#805b80"/>
    <rect x="7" y="1" width="10" height="1" fill="#805b80"/>
    <rect x="4" y="6" width="3" height="4" fill="#694a69"/> <!-- Hair shading -->
    <rect x="17" y="6" width="3" height="4" fill="#694a69"/>
    
    <!-- Hairband (Green/Teal) -->
    <rect x="6" y="3" width="12" height="1" fill="#3b9c7d"/>
    <rect x="5" y="4" width="14" height="1" fill="#3b9c7d"/>

    <!-- Head/Skin -->
    <rect x="7" y="7" width="10" height="7" fill="#ffd1a9"/>
    <rect x="6" y="9" width="1" height="3" fill="#ffd1a9"/> <!-- Ears -->
    <rect x="17" y="9" width="1" height="3" fill="#ffd1a9"/>

    <!-- Eyes (Cute big anime eyes) -->
    <rect x="8" y="9" width="3" height="3" fill="#000000"/>
    <rect x="13" y="9" width="3" height="3" fill="#000000"/>
    <rect x="8" y="9" width="1" height="1" fill="#ffffff"/> <!-- Sparkles -->
    <rect x="13" y="9" width="1" height="1" fill="#ffffff"/>
    
    <!-- Blush -->
    <rect x="7" y="12" width="2" height="1" fill="#ff9999"/>
    <rect x="15" y="12" width="2" height="1" fill="#ff9999"/>

    <!-- Mouth -->
    <rect x="11" y="12" width="2" height="1" fill="#c0392b"/>

    <!-- Jacket/Shirt (Red) -->
    <rect x="5" y="14" width="14" height="6" fill="#c93838"/>
    <rect x="6" y="14" width="12" height="1" fill="#ffffff"/> <!-- White undershirt colar -->
    <rect x="9" y="15" width="6" height="5" fill="#a62424"/> <!-- Shadow/pocket details -->

    <!-- Pants (Grey) -->
    <rect x="7" y="20" width="10" height="3" fill="#374151"/>

    <!-- Shoes (Green/Teal matching headband) -->
    <rect x="6" y="23" width="4" height="1" fill="#3b9c7d"/>
    <rect x="14" y="23" width="4" height="1" fill="#3b9c7d"/>
    <rect x="6" y="24" width="4" height="1" fill="#111827"/>
    <rect x="14" y="24" width="4" height="1" fill="#111827"/>
  </g>
</svg>
`;

// South (Down) - Frame 2
const CHAR_S_2 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <rect x="6" y="2" width="12" height="7" fill="#805b80"/>
    <rect x="5" y="3" width="14" height="5" fill="#805b80"/>
    <rect x="7" y="1" width="10" height="1" fill="#805b80"/>
    <rect x="4" y="6" width="3" height="4" fill="#694a69"/>
    <rect x="17" y="6" width="3" height="4" fill="#694a69"/>
    <rect x="6" y="3" width="12" height="1" fill="#3b9c7d"/>
    <rect x="5" y="4" width="14" height="1" fill="#3b9c7d"/>
    <rect x="7" y="7" width="10" height="7" fill="#ffd1a9"/>
    <rect x="6" y="9" width="1" height="3" fill="#ffd1a9"/>
    <rect x="17" y="9" width="1" height="3" fill="#ffd1a9"/>
    <rect x="8" y="9" width="3" height="3" fill="#000000"/>
    <rect x="13" y="9" width="3" height="3" fill="#000000"/>
    <rect x="8" y="9" width="1" height="1" fill="#ffffff"/>
    <rect x="13" y="9" width="1" height="1" fill="#ffffff"/>
    <rect x="7" y="12" width="2" height="1" fill="#ff9999"/>
    <rect x="15" y="12" width="2" height="1" fill="#ff9999"/>
    <rect x="11" y="12" width="2" height="1" fill="#c0392b"/>
    <rect x="5" y="14" width="14" height="6" fill="#c93838"/>
    <rect x="6" y="14" width="12" height="1" fill="#ffffff"/>
    <rect x="9" y="15" width="6" height="5" fill="#a62424"/>
    <rect x="7" y="20" width="10" height="3" fill="#374151"/>
    <!-- Feet walking swap -->
    <rect x="7" y="23" width="3" height="1" fill="#3b9c7d"/>
    <rect x="13" y="23" width="3" height="1" fill="#3b9c7d"/>
    <rect x="7" y="24" width="3" height="1" fill="#111827"/>
    <rect x="13" y="24" width="3" height="1" fill="#111827"/>
  </g>
</svg>
`;

// North (Up) - Frame 1
const CHAR_N_1 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Back of Hair (Purple) -->
    <rect x="6" y="2" width="12" height="12" fill="#805b80"/>
    <rect x="5" y="3" width="14" height="10" fill="#805b80"/>
    <rect x="7" y="1" width="10" height="1" fill="#805b80"/>
    <rect x="4" y="6" width="3" height="7" fill="#694a69"/>
    <rect x="17" y="6" width="3" height="7" fill="#694a69"/>
    <rect x="6" y="3" width="12" height="1" fill="#3b9c7d"/>
    <rect x="5" y="4" width="14" height="1" fill="#3b9c7d"/>
    
    <!-- Back of Jacket (Red) -->
    <rect x="5" y="14" width="14" height="6" fill="#c93838"/>
    <rect x="8" y="14" width="8" height="6" fill="#a62424"/>
    <rect x="7" y="20" width="10" height="3" fill="#374151"/>
    <rect x="6" y="23" width="4" height="1" fill="#3b9c7d"/>
    <rect x="14" y="23" width="4" height="1" fill="#3b9c7d"/>
    <rect x="6" y="24" width="4" height="1" fill="#111827"/>
    <rect x="14" y="24" width="4" height="1" fill="#111827"/>
  </g>
</svg>
`;

// North (Up) - Frame 2
const CHAR_N_2 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <rect x="6" y="2" width="12" height="12" fill="#805b80"/>
    <rect x="5" y="3" width="14" height="10" fill="#805b80"/>
    <rect x="7" y="1" width="10" height="1" fill="#805b80"/>
    <rect x="4" y="6" width="3" height="7" fill="#694a69"/>
    <rect x="17" y="6" width="3" height="7" fill="#694a69"/>
    <rect x="6" y="3" width="12" height="1" fill="#3b9c7d"/>
    <rect x="5" y="4" width="14" height="1" fill="#3b9c7d"/>
    <rect x="5" y="14" width="14" height="6" fill="#c93838"/>
    <rect x="8" y="14" width="8" height="6" fill="#a62424"/>
    <rect x="7" y="20" width="10" height="3" fill="#374151"/>
    <rect x="7" y="23" width="3" height="1" fill="#3b9c7d"/>
    <rect x="13" y="23" width="3" height="1" fill="#3b9c7d"/>
    <rect x="7" y="24" width="3" height="1" fill="#111827"/>
    <rect x="13" y="24" width="3" height="1" fill="#111827"/>
  </g>
</svg>
`;

// East (Right) - Frame 1
const CHAR_E_1 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Hair side profile -->
    <rect x="7" y="2" width="9" height="7" fill="#805b80"/>
    <rect x="6" y="3" width="11" height="6" fill="#805b80"/>
    <rect x="8" y="1" width="7" height="1" fill="#805b80"/>
    <rect x="6" y="3" width="9" height="1" fill="#3b9c7d"/>
    <rect x="5" y="4" width="11" height="1" fill="#3b9c7d"/>
    
    <!-- Face side profile -->
    <rect x="9" y="7" width="7" height="7" fill="#ffd1a9"/>
    <rect x="14" y="9" width="3" height="3" fill="#000000"/>
    <rect x="14" y="9" width="1" height="1" fill="#ffffff"/>
    <rect x="15" y="12" width="2" height="1" fill="#ff9999"/>
    
    <!-- Body profile (Red jacket) -->
    <rect x="6" y="14" width="10" height="6" fill="#c93838"/>
    <rect x="8" y="14" width="7" height="6" fill="#a62424"/>
    <rect x="7" y="20" width="8" height="3" fill="#374151"/>
    <rect x="7" y="23" width="4" height="1" fill="#3b9c7d"/>
    <rect x="12" y="23" width="4" height="1" fill="#3b9c7d"/>
    <rect x="7" y="24" width="4" height="1" fill="#111827"/>
    <rect x="12" y="24" width="4" height="1" fill="#111827"/>
  </g>
</svg>
`;

// East (Right) - Frame 2
const CHAR_E_2 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <rect x="7" y="2" width="9" height="7" fill="#805b80"/>
    <rect x="6" y="3" width="11" height="6" fill="#805b80"/>
    <rect x="8" y="1" width="7" height="1" fill="#805b80"/>
    <rect x="6" y="3" width="9" height="1" fill="#3b9c7d"/>
    <rect x="5" y="4" width="11" height="1" fill="#3b9c7d"/>
    <rect x="9" y="7" width="7" height="7" fill="#ffd1a9"/>
    <rect x="14" y="9" width="3" height="3" fill="#000000"/>
    <rect x="14" y="9" width="1" height="1" fill="#ffffff"/>
    <rect x="15" y="12" width="2" height="1" fill="#ff9999"/>
    <rect x="6" y="14" width="10" height="6" fill="#c93838"/>
    <rect x="8" y="14" width="7" height="6" fill="#a62424"/>
    <rect x="7" y="20" width="8" height="3" fill="#374151"/>
    <rect x="8" y="23" width="3" height="1" fill="#3b9c7d"/>
    <rect x="11" y="23" width="3" height="1" fill="#3b9c7d"/>
    <rect x="8" y="24" width="3" height="1" fill="#111827"/>
    <rect x="11" y="24" width="3" height="1" fill="#111827"/>
  </g>
</svg>
`;

// West (Left) - Frame 1
const CHAR_W_1 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Hair side profile -->
    <rect x="8" y="2" width="9" height="7" fill="#805b80"/>
    <rect x="7" y="3" width="11" height="6" fill="#805b80"/>
    <rect x="9" y="1" width="7" height="1" fill="#805b80"/>
    <rect x="9" y="3" width="9" height="1" fill="#3b9c7d"/>
    <rect x="8" y="4" width="11" height="1" fill="#3b9c7d"/>
    
    <!-- Face side profile -->
    <rect x="8" y="7" width="7" height="7" fill="#ffd1a9"/>
    <rect x="7" y="9" width="3" height="3" fill="#000000"/>
    <rect x="9" y="9" width="1" height="1" fill="#ffffff"/>
    <rect x="7" y="12" width="2" height="1" fill="#ff9999"/>
    
    <!-- Body profile (Red jacket) -->
    <rect x="8" y="14" width="10" height="6" fill="#c93838"/>
    <rect x="9" y="14" width="7" height="6" fill="#a62424"/>
    <rect x="9" y="20" width="8" height="3" fill="#374151"/>
    <rect x="8" y="23" width="4" height="1" fill="#3b9c7d"/>
    <rect x="13" y="23" width="4" height="1" fill="#3b9c7d"/>
    <rect x="8" y="24" width="4" height="1" fill="#111827"/>
    <rect x="13" y="24" width="4" height="1" fill="#111827"/>
  </g>
</svg>
`;

// West (Left) - Frame 2
const CHAR_W_2 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <rect x="8" y="2" width="9" height="7" fill="#805b80"/>
    <rect x="7" y="3" width="11" height="6" fill="#805b80"/>
    <rect x="9" y="1" width="7" height="1" fill="#805b80"/>
    <rect x="9" y="3" width="9" height="1" fill="#3b9c7d"/>
    <rect x="8" y="4" width="11" height="1" fill="#3b9c7d"/>
    <rect x="8" y="7" width="7" height="7" fill="#ffd1a9"/>
    <rect x="7" y="9" width="3" height="3" fill="#000000"/>
    <rect x="9" y="9" width="1" height="1" fill="#ffffff"/>
    <rect x="7" y="12" width="2" height="1" fill="#ff9999"/>
    <rect x="8" y="14" width="10" height="6" fill="#c93838"/>
    <rect x="9" y="14" width="7" height="6" fill="#a62424"/>
    <rect x="9" y="20" width="8" height="3" fill="#374151"/>
    <rect x="10" y="23" width="3" height="1" fill="#3b9c7d"/>
    <rect x="13" y="23" width="3" height="1" fill="#3b9c7d"/>
    <rect x="10" y="24" width="3" height="1" fill="#111827"/>
    <rect x="13" y="24" width="3" height="1" fill="#111827"/>
  </g>
</svg>
`;


// --- FURNITURE & DECORATION ---

// Desk (Computer / Workspace)
const DESK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Desk Base (Mahogany) -->
    <rect x="2" y="14" width="28" height="14" fill="#6e3a1f"/>
    <rect x="0" y="12" width="32" height="3" fill="#8e5333"/>
    <!-- Drawers/Legs -->
    <rect x="2" y="17" width="6" height="13" fill="#542b15"/>
    <rect x="24" y="17" width="6" height="13" fill="#542b15"/>
    <rect x="2" y="30" width="4" height="2" fill="#2d160b"/>
    <rect x="26" y="30" width="4" height="2" fill="#2d160b"/>
    <!-- Drawer Knobs -->
    <rect x="5" y="20" width="2" height="2" fill="#d4af37"/>
    <rect x="25" y="20" width="2" height="2" fill="#d4af37"/>
    <!-- Laptop on desk -->
    <rect x="10" y="5" width="12" height="7" fill="#666666"/>
    <rect x="11" y="6" width="10" height="5" fill="#a5f3fc"/>
    <rect x="9" y="11" width="14" height="1" fill="#cccccc"/>
  </g>
</svg>
`;

// Cozy Bed
const BED_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" width="128" height="192" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Bed frame -->
    <rect x="2" y="2" width="28" height="44" fill="#8b5a2b"/>
    <rect x="4" y="4" width="24" height="40" fill="#a0522d"/>
    <!-- Headboard -->
    <rect x="2" y="0" width="28" height="4" fill="#5c2e0b"/>
    <!-- Pillow -->
    <rect x="6" y="6" width="20" height="8" fill="#ffffff"/>
    <rect x="8" y="7" width="16" height="6" fill="#e5e7eb"/>
    <!-- Blanket (Zinko Gold/Orange) -->
    <rect x="4" y="14" width="24" height="30" fill="#f59e0b"/>
    <!-- Folded Sheet -->
    <rect x="4" y="14" width="24" height="4" fill="#ffffff"/>
  </g>
</svg>
`;

// Bookcase (Tall library bookshelf)
const BOOKCASE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" width="128" height="192" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Wooden Outer Frame -->
    <rect x="0" y="0" width="32" height="48" fill="#8e5333"/>
    <rect x="2" y="2" width="28" height="44" fill="#542b15"/>
    <!-- Shelves -->
    <rect x="2" y="12" width="28" height="2" fill="#8e5333"/>
    <rect x="2" y="24" width="28" height="2" fill="#8e5333"/>
    <rect x="2" y="36" width="28" height="2" fill="#8e5333"/>
    <!-- Top Shelf Books -->
    <rect x="4" y="3" width="3" height="9" fill="#ef4444"/>
    <rect x="7" y="3" width="3" height="9" fill="#3b82f6"/>
    <rect x="10" y="5" width="2" height="7" fill="#f59e0b"/>
    <rect x="15" y="3" width="3" height="9" fill="#10b981"/>
    <!-- Mid Shelf Books -->
    <rect x="6" y="15" width="4" height="9" fill="#a855f7"/>
    <rect x="10" y="17" width="2" height="7" fill="#ffffff"/>
    <rect x="20" y="15" width="3" height="9" fill="#3b82f6"/>
    <rect x="23" y="15" width="3" height="9" fill="#f59e0b"/>
    <!-- Bottom Shelf Books -->
    <rect x="5" y="27" width="3" height="9" fill="#10b981"/>
    <rect x="12" y="29" width="4" height="7" fill="#ef4444"/>
    <rect x="18" y="27" width="3" height="9" fill="#a855f7"/>
  </g>
</svg>
`;

// Shop Chest (Treasure Box)
const CHEST_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Body -->
    <rect x="4" y="10" width="24" height="20" fill="#542b15"/>
    <rect x="4" y="10" width="24" height="8" fill="#8e5333"/>
    <!-- Lock strap -->
    <rect x="14" y="8" width="4" height="10" fill="#1b120c"/>
    <rect x="13" y="16" width="6" height="4" fill="#d4af37"/>
    <rect x="15" y="17" width="2" height="2" fill="#000000"/>
    <!-- Metal corner brackets -->
    <rect x="4" y="10" width="2" height="20" fill="#2d160b"/>
    <rect x="26" y="10" width="2" height="20" fill="#2d160b"/>
    <rect x="4" y="10" width="24" height="2" fill="#2d160b"/>
  </g>
</svg>
`;

// Mailbox (Letter Post Box)
const MAILBOX_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 32" width="64" height="128" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Wooden pole -->
    <rect x="7" y="16" width="2" height="16" fill="#8e5333"/>
    <rect x="6" y="16" width="4" height="2" fill="#542b15"/>
    <!-- Box body -->
    <rect x="4" y="6" width="8" height="10" fill="#374151"/>
    <rect x="3" y="4" width="10" height="2" fill="#1f2937"/>
    <!-- Red flag -->
    <rect x="11" y="8" width="2" height="4" fill="#ef4444"/>
    <rect x="10" y="8" width="3" height="2" fill="#ef4444"/>
  </g>
</svg>
`;

// --- FLOOR & WALL TILES ---
const FLOOR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="64" height="64" shape-rendering="crispEdges">
  <!-- Light Wood Planks -->
  <rect x="0" y="0" width="16" height="16" fill="#dfc09f"/>
  <rect x="0" y="7" width="16" height="1" fill="#bfa182"/>
  <rect x="0" y="15" width="16" height="1" fill="#bfa182"/>
  <rect x="8" y="0" width="1" height="7" fill="#bfa182"/>
  <rect x="4" y="7" width="1" height="8" fill="#bfa182"/>
  <rect x="12" y="7" width="1" height="8" fill="#bfa182"/>
</svg>
`;

const WALL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="64" height="64" shape-rendering="crispEdges">
  <!-- Cozy Blue Bricks -->
  <rect x="0" y="0" width="16" height="16" fill="#2d3748"/>
  <rect x="0" y="7" width="16" height="2" fill="#1a202c"/>
  <rect x="0" y="15" width="16" height="1" fill="#1a202c"/>
  <rect x="8" y="0" width="2" height="7" fill="#1a202c"/>
  <rect x="4" y="8" width="2" height="7" fill="#1a202c"/>
  <rect x="12" y="8" width="2" height="7" fill="#1a202c"/>
</svg>
`;

export const HubAssets = {
  // Pre-load dynamically when imported in client-side Next.js
  getImages: () => {
    return {
      char: {
        S1: makeSvgImage(CHAR_S_1),
        S2: makeSvgImage(CHAR_S_2),
        N1: makeSvgImage(CHAR_N_1),
        N2: makeSvgImage(CHAR_N_2),
        E1: makeSvgImage(CHAR_E_1),
        E2: makeSvgImage(CHAR_E_2),
        W1: makeSvgImage(CHAR_W_1),
        W2: makeSvgImage(CHAR_W_2),
      },
      desk: makeSvgImage(DESK_SVG),
      bed: makeSvgImage(BED_SVG),
      bookcase: makeSvgImage(BOOKCASE_SVG),
      chest: makeSvgImage(CHEST_SVG),
      mailbox: makeSvgImage(MAILBOX_SVG),
      floor: makeSvgImage(FLOOR_SVG),
      wall: makeSvgImage(WALL_SVG),
    };
  }
};
