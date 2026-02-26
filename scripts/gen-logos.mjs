/**
 * gen-logos.mjs
 * One-off script: downloads Bebas Neue TTF, converts "VYNX" / "X" to SVG paths,
 * and writes:
 *   - src/assets/logo.svg
 *   - src/components/LogoSVG.tsx
 *   - public/favicon.svg
 *
 * Run: node scripts/gen-logos.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, '..');

// ── 1. Locate Bebas Neue WOFF (bundled via @fontsource/bebas-neue) ───────────
// opentype.js supports WOFF (a TTF/OTF wrapper); WOFF2 is NOT supported.
const FONT_PATH = resolve(
  root,
  'node_modules/@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff'
);
console.log('Using font:', FONT_PATH);

// ── 2. Load font ─────────────────────────────────────────────────────────────
const opentype = (await import('opentype.js')).default;
const font = opentype.loadSync(FONT_PATH);

// ── 3. Wordmark "VYNX" ───────────────────────────────────────────────────────
const WORDMARK_TEXT   = 'VYNX';
const WORDMARK_SIZE   = 72;
const LETTER_SPACING_PX = 6; // pixels between glyphs

// Measure full path bounding box first (at y=WORDMARK_SIZE so cap-height sits at y≈0)
const fullPath = font.getPath(WORDMARK_TEXT, 0, WORDMARK_SIZE, WORDMARK_SIZE, {
  kerning: true,
  letterSpacing: LETTER_SPACING_PX / WORDMARK_SIZE, // opentype expects em
});
const bb  = fullPath.getBoundingBox();
const PAD = 2; // 1px breathing room each side

// Offset so top-left of text lands at (PAD, PAD)
const ox = -bb.x1 + PAD;
const oy = -bb.y1 + PAD;

const vbW = Math.ceil(bb.x2 - bb.x1 + PAD * 2);
const vbH = Math.ceil(bb.y2 - bb.y1 + PAD * 2);

// Re-trace each glyph individually so we can colour VYN vs X separately
const glyphs = font.stringToGlyphs(WORDMARK_TEXT);
let curX = ox;
const glyphPathData = [];

for (let i = 0; i < glyphs.length; i++) {
  const g = glyphs[i];
  const gPath = g.getPath(curX, WORDMARK_SIZE + oy - bb.y1 + PAD, WORDMARK_SIZE);
  glyphPathData.push(gPath.toPathData(2));
  // advance + letter-spacing
  curX += (g.advanceWidth / font.unitsPerEm) * WORDMARK_SIZE + LETTER_SPACING_PX;
}

// "VYN" = first 3 glyphs, "X" = last glyph
const vynD = glyphPathData.slice(0, 3).join(' ');
const xD   = glyphPathData[3];

// ── 4. Favicon "Vx" (V uppercase + x lowercase), transparent bg ─────────────
// Render at a large reference size, measure bounding box, then scale+center
// via SVG transform — avoids messy baseline arithmetic.
const FAV_VP  = 64;
const FAV_PAD = 4;
const FAV_REF = 200; // reference render size

const vxRawPath = font.getPath('Vx', 0, FAV_REF, FAV_REF, { kerning: true });
const vxBB      = vxRawPath.getBoundingBox();
const vxD       = vxRawPath.toPathData(2);

const vxW    = vxBB.x2 - vxBB.x1;
const vxH    = vxBB.y2 - vxBB.y1;
const avail  = FAV_VP - FAV_PAD * 2;
const favS   = Math.min(avail / vxW, avail / vxH);           // uniform scale
const scaledW = vxW * favS;
const scaledH = vxH * favS;
const favTx  = (FAV_PAD + (avail - scaledW) / 2 - vxBB.x1 * favS).toFixed(2);
const favTy  = (FAV_PAD + (avail - scaledH) / 2 - vxBB.y1 * favS).toFixed(2);

// ── 5. Build SVG strings ──────────────────────────────────────────────────────
const logoSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" fill="none">
  <path d="${vynD}" fill="#F2F2F0"/>
  <path d="${xD}" fill="#E8C547"/>
</svg>
`;

const logoTSX = `import React from 'react';

interface LogoSVGProps {
  height?: number;
  className?: string;
}

const ASPECT = ${vbW} / ${vbH};

export function LogoSVG({ height = 28, className }: LogoSVGProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${vbW} ${vbH}"
      height={height}
      width={Math.round(height * ASPECT)}
      className={className}
      aria-label="VynX"
      fill="none"
    >
      <path d="${vynD}" fill="#F2F2F0"/>
      <path d="${xD}" fill="#E8C547"/>
    </svg>
  );
}
`;

const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <g transform="translate(${favTx},${favTy}) scale(${favS.toFixed(4)})">
    <path d="${vxD}" fill="#E8C547"/>
  </g>
</svg>
`;

// ── 6. Write files ────────────────────────────────────────────────────────────
mkdirSync(resolve(root, 'src/assets'),     { recursive: true });
mkdirSync(resolve(root, 'src/components'), { recursive: true });
mkdirSync(resolve(root, 'public'),         { recursive: true });

writeFileSync(resolve(root, 'src/assets/logo.svg'),        logoSVG);
writeFileSync(resolve(root, 'src/components/LogoSVG.tsx'), logoTSX);
writeFileSync(resolve(root, 'public/favicon.svg'),         faviconSVG);

console.log(`viewBox: ${vbW}×${vbH}`);
console.log('✓  src/assets/logo.svg');
console.log('✓  src/components/LogoSVG.tsx');
console.log('✓  public/favicon.svg');
