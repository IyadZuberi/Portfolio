// Tiny drawing kit for code-drawn sprites. Every colour comes from the fixed palette.
// Two ways to draw:
//  - paint(): hand-placed pixels from rows of legend characters (small sprites)
//  - fill(): shaded shapes with 3-tone ramps lit from the top-left (64x64 sprites)
// Then outline() adds a selective outline to the outer silhouette.
import type { ColourKey } from "./palette.ts";

export type Pixel = ColourKey | "shadow" | null; // "shadow" = ink at low opacity
export type Sprite = { w: number; h: number; px: Pixel[] };
export type Ramp = readonly [hi: ColourKey, mid: ColourKey, lo: ColourKey];
export type Mask = (x: number, y: number) => boolean;
export type Direction = "down" | "up" | "left" | "right";

export const ramps = {
  teal: ["tealHi", "teal", "tealLo"],
  red: ["redHi", "red", "redLo"],
  navy: ["waterLo", "navy", "navyLo"],
  orange: ["gold", "orange", "skinLo"],
  roof: ["redHi", "red", "redLo"],
  trousers: ["slate", "charcoal", "charcoal"],
  phones: ["gray3", "slate", "charcoal"],
  tan: ["sandHi", "sand", "sandLo"],
  brown: ["hairHi", "hair", "hairLo"],
  hair: ["hairHi", "hair", "hairLo"],
  skin: ["skinHi", "skin", "skinLo"],
  shirt: ["white", "white", "slate"],
  metal: ["white", "gray1", "gray3"],
  ball: ["water", "water", "waterLo"],
  platform: ["white", "sandHi", "sand"],
  gold: ["gold", "gold", "orange"],
  grass: ["grassHi", "grass", "grassLo"],
  water: ["waterHi", "water", "waterLo"],
} as const satisfies Record<string, Ramp>;

export const blank = (w: number, h: number): Sprite => ({ w, h, px: new Array(w * h).fill(null) });

export const get = (s: Sprite, x: number, y: number): Pixel =>
  x >= 0 && x < s.w && y >= 0 && y < s.h ? s.px[y * s.w + x] : null;

export const put = (s: Sprite, x: number, y: number, c: Pixel) => {
  if (x >= 0 && x < s.w && y >= 0 && y < s.h) s.px[y * s.w + x] = c;
};

// Paints rows of legend characters at (x, y). "." is transparent.
export function paint(s: Sprite, x: number, y: number, rows: string[], legend: Record<string, ColourKey>) {
  rows.forEach((row, dy) =>
    [...row].forEach((ch, dx) => {
      if (ch === ".") return;
      if (!(ch in legend)) throw new Error(`unknown colour "${ch}" in "${row}"`);
      put(s, x + dx, y + dy, legend[ch]);
    }),
  );
}

// Shapes (tested at pixel centres).
export const ellipse =
  (cx: number, cy: number, rx: number, ry: number): Mask =>
  (x, y) =>
    ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;

export const rect =
  (x0: number, y0: number, x1: number, y1: number): Mask =>
  (x, y) =>
    x >= x0 && x <= x1 && y >= y0 && y <= y1;

export const poly =
  (pts: [number, number][]): Mask =>
  (x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i];
      const [xj, yj] = pts[j];
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };

export const or =
  (...ms: Mask[]): Mask =>
  (x, y) =>
    ms.some((m) => m(x, y));

// Capsule around the segment a-b (limbs).
export const segment =
  ([ax, ay]: [number, number], [bx, by]: [number, number], r: number): Mask =>
  (x, y) => {
    const px = x + 0.5 - ax;
    const py = y + 0.5 - ay;
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy || 1)));
    return (px - t * dx) ** 2 + (py - t * dy) ** 2 <= r * r;
  };

export const and =
  (...ms: Mask[]): Mask =>
  (x, y) =>
    ms.every((m) => m(x, y));

// How a fill picks hi/mid/lo for each pixel.
export type Shade =
  | { round: [cx: number, cy: number, rx: number, ry: number] } // curved form, light from top-left
  | { edge: number } // flat form: lit top-left rim, dark bottom-right rim, this many px wide
  | { tone: 0 | 1 | 2 }; // one flat shade

// Fills a shape with a ramp. Where the shape's border touches pixels already drawn,
// that border becomes the ramp's dark shade: inner lines use the fill colour, not ink.
export function fill(s: Sprite, mask: Mask, ramp: Ramp, shade: Shade, innerLine = true) {
  const out: [number, number, ColourKey][] = [];
  for (let y = 0; y < s.h; y++)
    for (let x = 0; x < s.w; x++) {
      if (!mask(x, y)) continue;
      let tone: number;
      if ("round" in shade) {
        const [cx, cy, rx, ry] = shade.round;
        const lit = -(0.6 * (x + 0.5 - cx)) / rx - (0.8 * (y + 0.5 - cy)) / ry;
        tone = lit > 0.45 ? 0 : lit < -0.35 ? 2 : 1;
      } else if ("edge" in shade) {
        const off = (dx: number, dy: number) =>
          Array.from({ length: shade.edge }, (_, k) => k + 1).some((k) => !mask(x + dx * k, y + dy * k));
        tone = off(1, 0) || off(0, 1) ? 2 : off(-1, 0) || off(0, -1) ? 0 : 1;
      } else tone = shade.tone;
      if (innerLine) {
        const touches = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).some(
          ([dx, dy]) => !mask(x + dx, y + dy) && get(s, x + dx, y + dy) !== null,
        );
        if (touches) tone = 2;
      }
      out.push([x, y, ramp[tone]]);
    }
  for (const [x, y, c] of out) put(s, x, y, c);
}

// Straight 1px line (Bresenham).
export function line(s: Sprite, x0: number, y0: number, x1: number, y1: number, c: ColourKey) {
  [x0, y0, x1, y1] = [x0, y0, x1, y1].map(Math.round);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    put(s, x0, y0, c);
    if (x0 === x1 && y0 === y1) return;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

// Clean-up: a pixel that matches none of its 4 neighbours, while 3+ of them share a colour, takes that colour.
// Run after the big shaded fills, before hand-placed details, so shading has no stray dots.
export function clean(s: Sprite): Sprite {
  const out = [...s.px];
  for (let y = 0; y < s.h; y++)
    for (let x = 0; x < s.w; x++) {
      const c = get(s, x, y);
      if (c === null || c === "shadow") continue;
      const near = [get(s, x - 1, y), get(s, x + 1, y), get(s, x, y - 1), get(s, x, y + 1)];
      if (near.includes(c)) continue;
      const common = near.find((n) => n !== null && near.filter((m) => m === n).length >= 3);
      if (common) out[y * s.w + x] = common;
    }
  s.px = out;
  return s;
}

// Even silhouette before outlining: drop 1px spurs, fill 1px notches.
export function smooth(s: Sprite): Sprite {
  const filled = (x: number, y: number) => get(s, x, y) !== null;
  const nbrs = (x: number, y: number) => [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].filter(([a, b]) => filled(a, b));
  const out = [...s.px];
  for (let y = 0; y < s.h; y++)
    for (let x = 0; x < s.w; x++) {
      const n = nbrs(x, y);
      if (filled(x, y) && n.length <= 1) out[y * s.w + x] = null;
      if (!filled(x, y) && n.length >= 3) out[y * s.w + x] = get(s, n[0][0], n[0][1]);
    }
  s.px = out;
  return s;
}

// Selective outline around the outer silhouette: on the lit top and left edges the outline is a darker
// shade of the fill beside it; on the shadow side (bottom, right) and next to the darkest fills it is ink.
const darker: Partial<Record<ColourKey, ColourKey>> = {
  tealHi: "tealLo", teal: "tealLo",
  skinHi: "skinLo", skin: "skinLo",
  hairHi: "hairLo", hair: "hairLo",
  gold: "skinLo", orange: "skinLo", orangeLo: "hairLo",
  gray1: "slate", gray3: "slate", slate: "charcoal", // white edges take ink, so white details never add a colour
  redHi: "redLo", red: "redLo",
  water: "waterLo", waterHi: "waterLo", waterLo: "navyLo", navy: "navyLo",
  sandHi: "sandLo", sand: "sandLo",
  grassHi: "grassLo", grass: "grassLo",
};
export function outline(s: Sprite): Sprite {
  const edge: [number, ColourKey][] = [];
  const fillAt = (x: number, y: number) => {
    const c = get(s, x, y);
    return c === null || c === "shadow" ? null : c;
  };
  for (let y = 0; y < s.h; y++)
    for (let x = 0; x < s.w; x++) {
      if (get(s, x, y) !== null) continue;
      const lit = fillAt(x + 1, y) ?? fillAt(x, y + 1); // shape lies right of / below this pixel
      const shade = fillAt(x - 1, y) ?? fillAt(x, y - 1);
      if (shade) edge.push([y * s.w + x, "ink"]);
      else if (lit) edge.push([y * s.w + x, darker[lit] ?? "ink"]);
    }
  for (const [i, c] of edge) s.px[i] = c;
  return s;
}

// Soft oval ground shadow under everything already drawn.
export function shadow(s: Sprite, cx: number, cy: number, rx: number, ry: number): Sprite {
  const m = ellipse(cx, cy, rx, ry);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (m(x, y) && get(s, x, y) === null) put(s, x, y, "shadow");
  return s;
}

export function mirror(s: Sprite): Sprite {
  const px: Pixel[] = [];
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) px.push(s.px[y * s.w + s.w - 1 - x]);
  return { ...s, px };
}
