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


// --- DETAILED HIGH-DENSITY FURNITURE & DECORATION (32x32 pixel maps) ---

// Desk (Computer / Workspace)
const DESK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Desk Wood Body with Grain & Shadowing -->
    <rect x="2" y="14" width="28" height="14" fill="#542b15"/>
    <rect x="2" y="14" width="28" height="2" fill="#6e3a1f"/>
    <rect x="0" y="11" width="32" height="3" fill="#8e5333"/>
    <rect x="0" y="11" width="32" height="1" fill="#a87050"/> <!-- Highlights -->

    <!-- Drawers & Cabinets -->
    <rect x="2" y="17" width="7" height="13" fill="#391d0e"/>
    <rect x="23" y="17" width="7" height="13" fill="#391d0e"/>
    <!-- Drawer Panels -->
    <rect x="3" y="18" width="5" height="3" fill="#542b15"/>
    <rect x="3" y="22" width="5" height="3" fill="#542b15"/>
    <rect x="3" y="26" width="5" height="3" fill="#542b15"/>
    <rect x="24" y="18" width="5" height="11" fill="#542b15"/>
    <!-- Handles -->
    <rect x="5" y="19" width="1" height="1" fill="#ffd700"/>
    <rect x="5" y="23" width="1" height="1" fill="#ffd700"/>
    <rect x="5" y="27" width="1" height="1" fill="#ffd700"/>
    <rect x="26" y="23" width="1" height="1" fill="#ffd700"/>

    <!-- Detailed Laptop -->
    <rect x="11" y="4" width="10" height="7" fill="#4b5563"/>
    <rect x="12" y="5" width="8" height="5" fill="#a5f3fc"/> <!-- Screen glow -->
    <rect x="13" y="6" width="6" height="3" fill="#ffffff" opacity="0.6"/> <!-- Reflection -->
    <rect x="9" y="10" width="14" height="1" fill="#9ca3af"/>
    <!-- Keyboard details on lap -->
    <rect x="11" y="10" width="10" height="1" fill="#1f2937" opacity="0.4"/>
  </g>
</svg>
`;

// Cozy Bed
const BED_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" width="128" height="192" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Bed frame wood base -->
    <rect x="2" y="2" width="28" height="44" fill="#5c2e0b"/>
    <rect x="3" y="3" width="26" height="42" fill="#8b5a2b"/>
    <rect x="2" y="0" width="28" height="5" fill="#3d1e07"/> <!-- Headboard -->

    <!-- Mattress -->
    <rect x="4" y="6" width="24" height="38" fill="#e5e7eb"/>
    <rect x="4" y="6" width="24" height="3" fill="#ffffff"/>

    <!-- Double Pillow (Cozy creases) -->
    <rect x="6" y="7" width="9" height="7" fill="#ffffff"/>
    <rect x="17" y="7" width="9" height="7" fill="#ffffff"/>
    <rect x="7" y="8" width="7" height="5" fill="#f3f4f6"/>
    <rect x="18" y="8" width="7" height="5" fill="#f3f4f6"/>

    <!-- Blanket (Yellow/Gold with fold detail) -->
    <rect x="4" y="16" width="24" height="28" fill="#f59e0b"/>
    <rect x="4" y="16" width="24" height="4" fill="#d97706"/> <!-- Quilt crease shadow -->
    <rect x="4" y="14" width="24" height="2" fill="#ffffff"/> <!-- Sheets folding over -->
  </g>
</svg>
`;

// Bookcase (Tall library bookshelf)
const BOOKCASE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" width="128" height="192" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Outer wooden casing -->
    <rect x="0" y="0" width="32" height="48" fill="#6e3a1f"/>
    <rect x="1" y="1" width="30" height="46" fill="#8e5333"/>
    <rect x="2" y="2" width="28" height="44" fill="#3d1e07"/> <!-- Backing shadow -->

    <!-- Shelves wood -->
    <rect x="2" y="13" width="28" height="2" fill="#6e3a1f"/>
    <rect x="2" y="25" width="28" height="2" fill="#6e3a1f"/>
    <rect x="2" y="37" width="28" height="2" fill="#6e3a1f"/>

    <!-- Top Shelf Books (High density colors) -->
    <rect x="3" y="4" width="2" height="9" fill="#ef4444"/>
    <rect x="5" y="5" width="2" height="8" fill="#f97316"/>
    <rect x="7" y="3" width="3" height="10" fill="#3b82f6"/>
    <rect x="11" y="6" width="2" height="7" fill="#10b981"/>
    <rect x="14" y="4" width="3" height="9" fill="#a855f7"/>
    <rect x="20" y="5" width="2" height="8" fill="#ffffff"/>
    <rect x="23" y="4" width="3" height="9" fill="#f43f5e"/>

    <!-- Mid Shelf Books -->
    <rect x="4" y="16" width="3" height="9" fill="#06b6d4"/>
    <rect x="7" y="15" width="2" height="10" fill="#10b981"/>
    <rect x="10" y="17" width="3" height="8" fill="#eab308"/>
    <rect x="16" y="16" width="2" height="9" fill="#ef4444"/>
    <rect x="19" y="18" width="3" height="7" fill="#6366f1"/>
    <rect x="24" y="15" width="3" height="10" fill="#a855f7"/>

    <!-- Bottom Shelf Books -->
    <rect x="3" y="28" width="3" height="9" fill="#ec4899"/>
    <rect x="7" y="29" width="2" height="8" fill="#f97316"/>
    <rect x="10" y="27" width="3" height="10" fill="#3b82f6"/>
    <rect x="15" y="30" width="2" height="7" fill="#10b981"/>
    <rect x="18" y="28" width="4" height="9" fill="#eab308"/>
    <rect x="23" y="27" width="3" height="10" fill="#ef4444"/>

    <!-- Ornaments on top shelf floor -->
    <rect x="2" y="39" width="3" height="2" fill="#ffd700"/>
    <rect x="7" y="41" width="4" height="4" fill="#a8a29e"/> <!-- Small rock/fossil -->
    <rect x="18" y="40" width="5" height="5" fill="#f43f5e"/> <!-- Globe/box -->
  </g>
</svg>
`;

// Shop Chest (Treasure Box)
const CHEST_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Wooden Box chest -->
    <rect x="4" y="10" width="24" height="20" fill="#3d1e07"/>
    <rect x="5" y="11" width="22" height="18" fill="#6e3a1f"/>
    <rect x="5" y="11" width="22" height="6" fill="#8e5333"/> <!-- Lid -->
    <rect x="5" y="17" width="22" height="1" fill="#542b15"/> <!-- Crack/shadow -->

    <!-- Metal brackets/details -->
    <rect x="4" y="10" width="3" height="20" fill="#4b5563"/>
    <rect x="25" y="10" width="3" height="20" fill="#4b5563"/>
    <rect x="4" y="10" width="24" height="3" fill="#4b5563"/>
    <rect x="4" y="27" width="24" height="3" fill="#4b5563"/>
    <!-- Gold rivets -->
    <rect x="5" y="11" width="1" height="1" fill="#ffd700"/>
    <rect x="26" y="11" width="1" height="1" fill="#ffd700"/>
    <rect x="5" y="28" width="1" height="1" fill="#ffd700"/>
    <rect x="26" y="28" width="1" height="1" fill="#ffd700"/>

    <!-- Lock latch -->
    <rect x="13" y="14" width="6" height="6" fill="#374151"/>
    <rect x="14" y="15" width="4" height="4" fill="#d4af37"/> <!-- Golden lock plate -->
    <rect x="15" y="16" width="2" height="2" fill="#111827"/>
  </g>
</svg>
`;

// Mailbox (Letter Post Box)
const MAILBOX_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 32" width="64" height="128" shape-rendering="crispEdges">
  ${OUTLINE_DEFS}
  <g filter="url(#outline)">
    <!-- Wooden Pole -->
    <rect x="7" y="16" width="2" height="16" fill="#5c2e0b"/>
    <rect x="8" y="16" width="1" height="16" fill="#8b5a2b"/> <!-- Pole highlight -->
    
    <!-- Metal Mailbox Body -->
    <rect x="4" y="5" width="8" height="11" fill="#374151"/>
    <rect x="5" y="6" width="6" height="9" fill="#4b5563"/>
    <rect x="3" y="4" width="10" height="2" fill="#1f2937"/>
    
    <!-- Mailbox Door hinge -->
    <rect x="4" y="14" width="8" height="2" fill="#1f2937"/>

    <!-- Red Flag -->
    <rect x="12" y="8" width="1" height="5" fill="#b91c1c"/>
    <rect x="11" y="8" width="3" height="2" fill="#ef4444"/>
  </g>
</svg>
`;

const FLOOR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="64" height="64" shape-rendering="crispEdges">
  <!-- Warm wood base -->
  <rect x="0" y="0" width="16" height="16" fill="#bb7f57"/>
  <!-- Soft, blended horizontal wood grain dividers (no harsh dark lines) -->
  <rect x="0" y="8" width="16" height="1" fill="#a46d46"/>
  <!-- Soft seamless highlights -->
  <rect x="0" y="2" width="16" height="1" fill="#d39e76" opacity="0.25"/>
  <rect x="0" y="10" width="16" height="1" fill="#d39e76" opacity="0.25"/>
</svg>
`;

const WALL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="64" height="64" shape-rendering="crispEdges">
  <!-- Warm stone brick base matching reference image -->
  <rect x="0" y="0" width="16" height="16" fill="#6d5f5a"/>
  <!-- Mortar joints -->
  <rect x="0" y="7" width="16" height="1" fill="#483c38"/>
  <rect x="0" y="15" width="16" height="1" fill="#483c38"/>
  <!-- Vertical joints (seamless offset) -->
  <rect x="8" y="0" width="1" height="7" fill="#483c38"/>
  <rect x="0" y="8" width="1" height="7" fill="#483c38"/>
  <!-- Highlight edges -->
  <rect x="0" y="0" width="8" height="1" fill="#8c7b74"/>
  <rect x="8" y="8" width="8" height="1" fill="#8c7b74"/>
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
