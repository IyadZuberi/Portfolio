// Shared canvas helpers for the review sheets. Whole-number nearest-neighbour scales only.
import { mkdirSync, writeFileSync } from "node:fs";
import { palette, type ColourKey } from "../src/art/palette.ts";
import { blank, type Sprite } from "../src/art/draw.ts";
import { blit, tile, type Tile } from "../src/art/world.ts";
import { encode } from "./png.ts";

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

// Sheet labels: a 3x5 font drawn at 2x (separate from the in-game font, which is for mock-ups).
const GLYPHS: Record<string, string> = {
  A: "111101111101101", B: "110101110101110", C: "111100100100111", D: "110101101101110",
  E: "111100110100111", F: "111100110100100", G: "111100101101111", H: "101101111101101",
  I: "111010010010111", J: "001001001101111", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "110101101101101", O: "111101101101111", P: "111101111100100",
  Q: "111101101111001", R: "110101110101101", S: "111100111001111", T: "111010010010010",
  U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101010010010", Z: "111001010100111", "0": "111101101101111", "1": "010110010010111",
  "2": "111001111100111", "3": "111001111001111", "4": "101101111001001", "5": "111100111001111",
  "6": "111100111101111", "7": "111001010010010", "8": "111101111101111", "9": "111101111001111",
  " ": "000000000000000", ".": "000000000000010", "/": "001001010100100", "?": "111001010000010",
  "!": "010010010000010", ":": "000010000010000", "-": "000000111000000",
  "&": "110101010101011", "%": "101001010100101", ",": "000000000010100",
};

export function canvas(w: number, h: number) {
  const rgba = new Uint8Array(w * h * 4);

  const fill = (x0: number, y0: number, fw: number, fh: number, c: ColourKey, alpha = 1) => {
    if (x0 < 0 || y0 < 0 || x0 + fw > w || y0 + fh > h) throw new Error(`fill out of bounds at ${x0},${y0} (${fw}x${fh})`);
    const rgb = hex(palette[c]);
    for (let y = y0; y < y0 + fh; y++)
      for (let x = x0; x < x0 + fw; x++) {
        const i = (y * w + x) * 4;
        for (let k = 0; k < 3; k++) rgba[i + k] = Math.round(rgba[i + k] * (1 - alpha) + rgb[k] * alpha);
        rgba[i + 3] = 255;
      }
  };

  const draw = (s: Sprite, x0: number, y0: number, scale: number) => {
    for (let y = 0; y < s.h; y++)
      for (let x = 0; x < s.w; x++) {
        const c = s.px[y * s.w + x];
        if (c === "shadow") fill(x0 + x * scale, y0 + y * scale, scale, scale, "ink", 0.3);
        else if (c) fill(x0 + x * scale, y0 + y * scale, scale, scale, c);
      }
  };

  const label = (x: number, y: number, str: string, c: ColourKey = "ink") =>
    [...str.toUpperCase()].forEach((ch, i) => {
      const g = GLYPHS[ch];
      if (!g) throw new Error(`no sheet glyph for "${ch}"`);
      [...g].forEach((b, j) => b === "1" && fill(x + i * 8 + (j % 3) * 2, y + Math.floor(j / 3) * 2, 2, 2, c));
    });

  // A row of sprites standing on a tiled background.
  const strip = (x: number, y: number, kind: Tile, tilesW: number, tilesH: number, scale: number, sprites: [Sprite, number, number][]) => {
    const s = blank(tilesW * 16, tilesH * 16);
    for (let ty = 0; ty < tilesH; ty++) for (let tx = 0; tx < tilesW; tx++) tile(s, tx, ty, kind);
    for (const [sp, sx, sy] of sprites) blit(s, sp, sx, sy);
    draw(s, x, y, scale);
  };

  // A sprite on a plain panel.
  const card = (x: number, y: number, s: Sprite, scale: number, bg: ColourKey = "gray1") => {
    fill(x, y, s.w * scale, s.h * scale, bg);
    draw(s, x, y, scale);
  };

  const save = (path: string) => {
    mkdirSync(path.replace(/\/[^/]+$/, ""), { recursive: true });
    writeFileSync(path, encode({ w, h, rgba }));
    console.log(`wrote ${path} (${w}x${h})`);
  };

  return { w, h, fill, draw, label, strip, card, save };
}

// At most 15 colours per character sprite.
export const budget = (name: string, sprites: Sprite[]) => {
  const max = Math.max(...sprites.map((s) => new Set(s.px.filter((c) => c && c !== "shadow")).size));
  if (max > 15) throw new Error(`${name} uses ${max} colours (limit 15)`);
  console.log(`${name}: max ${max} colours`);
};
