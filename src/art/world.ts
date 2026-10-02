// World pieces for scenes: tiles, trees, buildings, NPCs, shop furniture and UI boxes.
// All original designs; GBA screen is 240x160.
import type { ColourKey } from "./palette.ts";
import { and, blank, ellipse, fill, line, outline, paint, poly, put, ramps, rect, shadow, type Sprite } from "./draw.ts";
import { text, textWidth } from "./font.ts";

export const SCREEN = { w: 240, h: 160 };
export const screen = () => blank(SCREEN.w, SCREEN.h);

const set = (s: Sprite, x: number, y: number, c: ColourKey) => put(s, x, y, c);
export const blit = (dst: Sprite, src: Sprite, x0: number, y0: number) =>
  src.px.forEach((c, i) => {
    const x = x0 + (i % src.w);
    const y = y0 + Math.floor(i / src.w);
    if (!c || x < 0 || y < 0 || x >= dst.w || y >= dst.h) return;
    if (c === "shadow" && dst.px[y * dst.w + x] !== null) dst.px[y * dst.w + x] = darken(dst.px[y * dst.w + x] as ColourKey);
    else if (c !== "shadow") dst.px[y * dst.w + x] = c;
  });
// Shadows on the ground become the next shade down (no transparency in scenes).
const SHADE: Partial<Record<ColourKey, ColourKey>> = {
  grassHi: "grass", grass: "grassLo", grassLo: "tealLo",
  sandHi: "sand", sand: "sandLo", sandLo: "hairHi",
  water: "waterLo", waterHi: "water", white: "gray1", gray1: "gray3",
};
const darken = (c: ColourKey): ColourKey => SHADE[c] ?? c;

// --- tiles (16x16) ---
export type Tile = "grass" | "path" | "water" | "shore" | "floor" | "wall" | "flowers";
export function tile(s: Sprite, tx: number, ty: number, kind: Tile) {
  const ox = tx * 16;
  const oy = ty * 16;
  const at = (x: number, y: number, c: ColourKey) => set(s, ox + x, oy + y, c);
  const base: Record<Tile, ColourKey> = { grass: "grass", flowers: "grass", path: "sandHi", water: "water", shore: "water", floor: "sandHi", wall: "white" };
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) at(x, y, base[kind]);
  if (kind === "grass" || kind === "flowers") {
    // Two small tufts per tile: a 3px dark V with a light tip.
    for (const [x, y] of [[3, 4], [10, 11]]) {
      at(x, y, "grassLo");
      at(x + 2, y, "grassLo");
      at(x + 1, y + 1, "grassLo");
      at(x + 1, y - 1, "grassHi");
    }
    if (kind === "flowers")
      for (const [x, y, c] of [[11, 3, "white"], [4, 11, "redHi"]] as [number, number, ColourKey][]) {
        at(x, y, c);
        at(x + 1, y, c);
        at(x, y + 1, c);
        at(x + 1, y + 1, "gold");
      }
  } else if (kind === "path") {
    for (const [x, y] of [[3, 5], [4, 5], [11, 12], [12, 12], [9, 2]]) at(x, y, "sand");
  } else if (kind === "water" || kind === "shore") {
    for (const [x, y] of [[2, 4], [3, 4], [4, 4], [9, 11], [10, 11], [11, 11]]) at(x, y, "waterHi");
    if (kind === "shore")
      for (let y = 0; y < 16; y++) {
        at(0, y, "sand");
        at(1, y, y % 4 < 2 ? "white" : "waterHi");
      }
  } else if (kind === "floor") {
    for (let i = 0; i < 16; i++) {
      at(i, 15, "sand");
      at(15, i, "sand");
    }
  } else if (kind === "wall") {
    for (let x = 0; x < 16; x++) at(x, 15, "gray1");
  }
}

// --- objects ---
// Round FireRed-style tree, 32x32: bold canopy with lit and shaded clumps, short trunk.
export function tree(): Sprite {
  const s = blank(32, 32);
  fill(s, rect(13, 24, 18, 30), ramps.brown, { edge: 1 });
  fill(s, ellipse(16, 14, 13, 11.5), ["grass", "grassLo", "teal"], { round: [11, 8, 13, 11.5] });
  for (const [x, y, rx] of [[11, 8, 4], [20, 10, 3.5], [10, 17, 3]] as [number, number, number][])
    fill(s, ellipse(x, y, rx, rx * 0.7), ["grassHi", "grassHi", "grass"], { tone: 0 }, false);
  return shadow(outline(s), 16, 30.5, 9, 1.5);
}

// House with a coloured roof, door, windows and an optional banner (e.g. "LinkedIn"). 64x56.
export function house(roof: "navy" | "red", banner?: string): Sprite {
  const s = blank(64, 64);
  const R = roof === "navy" ? ramps.navy : ramps.roof;
  fill(s, rect(6, 26, 57, 55), ramps.tan, { edge: 2 }); // walls
  fill(s, poly([[2, 28], [32, 6], [62, 28]]), R, { edge: 2 }); // roof
  for (let y = 12; y < 28; y += 4) line(s, 32 - (y - 6) * 1.35, y, 32 + (y - 6) * 1.35, y, R[2]); // shingle rows
  fill(s, rect(27, 40, 36, 55), ["navy", "navy", "navyLo"], { edge: 1 }); // door
  put(s, 34, 48, "gold");
  for (const x of [12, 43]) {
    fill(s, rect(x, 34, x + 8, 42), ramps.water, { edge: 1 });
    line(s, x + 4, 34, x + 4, 42, "white");
  }
  if (banner) {
    const w = textWidth(banner) + 8;
    const x0 = 32 - Math.floor(w / 2);
    fill(s, rect(x0, 27, x0 + w - 1, 37), ramps.shirt, { edge: 1 });
    line(s, x0, 27, x0 + w - 1, 27, "navy");
    text(s, x0 + 4, 29, banner, "navy", null);
  }
  return shadow(outline(s), 32, 57, 28, 2);
}

// NPC, 16x32 front-facing: townsperson (blonde, crimson top) or shopkeeper (navy shirt, white apron).
const NPC_LEGEND: Record<string, ColourKey> = {
  Y: "gold", y: "orange", o: "skinLo", S: "skinHi", s: "skin", d: "skinLo", k: "ink",
  R: "redHi", r: "red", m: "redLo", N: "waterLo", n: "navy", v: "navyLo", w: "white", x: "gray1",
  H: "hairHi", h: "hair", j: "hairLo", T: "slate", t: "charcoal",
};
const NPC_HEAD_BLONDE = [
  "................",
  ".....YYYYYy.....",
  "....YYYYYYYy....",
  "...YYYYYyyyyo...",
  "..YYYyyyyyyyyo..",
  "..YYyYYyyyyyoo..",
  "..Yyssssssssyo..",
  "..ysSssssssssyo.",
  "..ysskssssksdyo.",
  "..ysskssssksdyo.",
  "..yySssssssdyyo.",
  "..yyssssssddyo..",
  "...yossdddsoo...",
  "....ossssso.....",
];
const NPC_HEAD_KEEPER = [
  "................",
  "................",
  ".....HHHhhj.....",
  "....HHhhhhhj....",
  "...HHhhhhhhhj...",
  "...Hhhhhhhhhj...",
  "...hSssssssshj..",
  "...sSssssssssd..",
  "...sskssssksd...",
  "...sskssssksd...",
  "...sSsssssssd...",
  "...shhhhhhhhd...",
  "....shhddhhs....",
  ".....ssssss.....",
];
const NPC_BODY_TOWN = [
  "....RRrrrrrm....",
  "...RRRrrrrrmm...",
  "..sRRrrrrrrmmd..",
  "..sRrrrrrrrrmd..",
  "..SRrrrrrrrrmd..",
  "...Rrrrrrrrrm...",
  "...nnnnnnnnnv...",
  "...Nnnnnnnnnv...",
  "...Nnnnnnnnnv...",
  "....ss....sd....",
  "....ss....sd....",
  "....ss....sd....",
  "....ss....sd....",
  "...vvn....nvv...",
];
const NPC_BODY_KEEPER = [
  "....NNnnnnnv....",
  "...NNwwwwwwvv...",
  "..sNnwwwwwwnvd..",
  "..sNnwwwwwwnvd..",
  "..SNnwxwwxwnvd..",
  "...Nnwwwwwwnv...",
  "...TttwwwwttT...",
  "...TttwwwwttT...",
  "...Tttt..tttT...",
  "....Tt....tT....",
  "....Tt....tT....",
  "....Tt....tT....",
  "....Tt....tT....",
  "...jhh....hhj...",
];
// Coat body (lab guide, nurse, clerk, gym leader): a long top over trousers, recoloured per role.
const NPC_BODY_COAT = [
  "....NNnnnnnv....",
  "...NNnnnnnnvv...",
  "..sNnnnnnnnnvd..",
  "..sNnnwwnnnnvd..",
  "..SNnnwwnnnnvd..",
  "...Nnnnnnnnnv...",
  "...Nnnnnnnnnv...",
  "...Nnnnnnnnnv...",
  "...Nnnn..nnnv...",
  "....Tt....tT....",
  "....Tt....tT....",
  "....Tt....tT....",
  "....Tt....tT....",
  "...jhh....hhj...",
];
type NpcKind = "townsperson" | "shopkeeper" | "guide" | "nurse" | "clerk" | "leader";
// Each role swaps the top colours (N/n/v) and, for the nurse, adds a cross on the chest.
const NPC_ROLES: Record<NpcKind, { head: string[]; body: string[]; swap?: Record<string, ColourKey> }> = {
  townsperson: { head: NPC_HEAD_BLONDE, body: NPC_BODY_TOWN },
  shopkeeper: { head: NPC_HEAD_KEEPER, body: NPC_BODY_KEEPER },
  guide: { head: NPC_HEAD_KEEPER, body: NPC_BODY_COAT, swap: { N: "white", n: "white", v: "gray1", T: "slate", t: "charcoal" } },
  nurse: { head: NPC_HEAD_BLONDE, body: NPC_BODY_COAT, swap: { N: "white", n: "white", v: "gray1", w: "red", T: "red", t: "redLo" } },
  clerk: { head: NPC_HEAD_KEEPER, body: NPC_BODY_COAT, swap: { N: "navy", n: "navy", v: "navyLo", T: "slate", t: "charcoal" } },
  leader: { head: NPC_HEAD_KEEPER, body: NPC_BODY_COAT, swap: { N: "redHi", n: "red", v: "redLo", w: "gold", T: "slate", t: "charcoal" } },
};
export function npc(kind: NpcKind): Sprite {
  const s = blank(16, 32);
  const role = NPC_ROLES[kind];
  paint(s, 0, 0, [...role.head, ...role.body], { ...NPC_LEGEND, ...role.swap });
  return shadow(outline(s), 8, 29.5, 5, 1.5);
}

// Indoor furniture, each drawn at its own size and placed by the scene.
export function furniture(kind: "table" | "pc" | "mirror" | "bed" | "counter" | "healer" | "deskEY"): Sprite {
  if (kind === "table") {
    const s = blank(56, 28);
    fill(s, rect(0, 6, 55, 17), ramps.orange, { edge: 2 });
    fill(s, rect(0, 6, 55, 8), ramps.orange, { tone: 0 }, false);
    for (const x of [4, 48]) fill(s, rect(x, 18, x + 3, 27), ramps.orange, { tone: 2 }, false);
    return outline(s);
  }
  if (kind === "pc") {
    const s = blank(24, 26);
    fill(s, rect(2, 14, 21, 25), ramps.metal, { edge: 1 });
    fill(s, rect(3, 2, 20, 14), ramps.phones, { edge: 1 });
    fill(s, rect(5, 4, 18, 11), ramps.water, { tone: 1 }, false);
    for (const y of [5, 7, 9]) line(s, 6, y, 6 + (y === 7 ? 10 : 6), y, "waterHi");
    return outline(s);
  }
  if (kind === "mirror") {
    const s = blank(20, 28);
    fill(s, rect(0, 0, 19, 27), ramps.orange, { edge: 1 });
    fill(s, rect(3, 3, 16, 24), ramps.metal, { tone: 1 }, false);
    fill(s, poly([[4, 20], [10, 4], [13, 4], [6, 23]]), ramps.shirt, { tone: 0 }, false);
    return outline(s);
  }
  if (kind === "bed") {
    const s = blank(32, 48);
    fill(s, rect(0, 0, 31, 47), ramps.orange, { edge: 2 });
    fill(s, rect(2, 4, 29, 45), ramps.teal, { edge: 1 });
    fill(s, rect(3, 5, 28, 16), ramps.shirt, { tone: 0 }, false);
    return outline(s);
  }
  if (kind === "counter") {
    const s = blank(96, 20);
    fill(s, rect(0, 0, 95, 19), ramps.orange, { edge: 2 });
    fill(s, rect(0, 0, 95, 2), ramps.orange, { tone: 0 }, false);
    return outline(s);
  }
  if (kind === "healer") {
    const s = blank(40, 28);
    fill(s, rect(0, 10, 39, 27), ramps.metal, { edge: 2 });
    fill(s, rect(4, 0, 35, 10), ramps.shirt, { tone: 0 });
    for (let i = 0; i < 3; i++) fill(s, ellipse(10 + i * 10, 16, 3, 2.4), ramps.ball, { tone: 1 }, false);
    fill(s, rect(18, 2, 21, 8), ramps.red, { tone: 1 }, false);
    fill(s, rect(16, 4, 23, 6), ramps.red, { tone: 1 }, false);
    return outline(s);
  }
  const s = blank(64, 24); // deskEY: a desk with a dashboard screen
  fill(s, rect(0, 10, 63, 23), ramps.navy, { edge: 2 });
  fill(s, rect(8, 0, 55, 11), ramps.phones, { edge: 1 });
  fill(s, rect(10, 2, 53, 9), ramps.water, { tone: 1 }, false);
  for (let i = 0; i < 6; i++) fill(s, rect(13 + i * 7, 8 - (i % 3) * 2 - 1, 15 + i * 7, 8), ramps.gold, { tone: 0 }, false);
  return outline(s);
}

// Gym badge, 16x16: a teal cog with a gold core (one design, tinted per gym).
export function badge(tint: "teal" | "orange" | "navy" = "teal"): Sprite {
  const s = blank(16, 16);
  const ramp = tint === "teal" ? ramps.teal : tint === "orange" ? ramps.orange : ramps.navy;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    fill(s, rect(Math.round(8 + Math.cos(a) * 6) - 1, Math.round(8 + Math.sin(a) * 6) - 1, Math.round(8 + Math.cos(a) * 6), Math.round(8 + Math.sin(a) * 6)), ramp, { tone: 1 }, false);
  }
  fill(s, ellipse(8, 8, 5.5, 5.5), ramp, { round: [8, 8, 5.5, 5.5] });
  fill(s, ellipse(8, 8, 2.2, 2.2), ramps.gold, { tone: 0 }, false);
  return outline(s);
}

// Fly map: a simple region outline with marked towns.
export function flyMap(w: number, h: number, towns: [number, number, string][]): Sprite {
  const s = blank(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) put(s, x, y, "waterHi");
  fill(s, ellipse(w / 2, h / 2 + 4, w * 0.42, h * 0.4), ramps.grass, { tone: 1 }, false);
  fill(s, ellipse(w * 0.32, h * 0.38, w * 0.2, h * 0.2), ramps.grass, { tone: 0 }, false);
  fill(s, ellipse(w * 0.68, h * 0.66, w * 0.16, h * 0.14), ramps.water, { tone: 1 }, false);
  for (const [x, y] of towns) {
    fill(s, rect(x - 3, y - 3, x + 3, y + 3), ramps.shirt, { tone: 0 }, false);
    fill(s, rect(x - 2, y - 2, x + 2, y + 2), ramps.red, { tone: 1 }, false);
  }
  return outline(s);
}

// Shop shelf, 48x32: wooden frame with two rows of goods.
export function shelf(goods: ColourKey[][]): Sprite {
  const s = blank(48, 32);
  fill(s, rect(0, 0, 47, 31), ramps.orange, { edge: 1 });
  for (const y of [2, 17]) fill(s, rect(2, y, 45, y + 12), ["orangeLo", "orangeLo", "hairLo"], { tone: 0 }, false);
  goods.forEach((row, ri) =>
    row.forEach((c, i) => {
      const x = 4 + i * 7;
      const y = ri === 0 ? 5 : 20;
      fill(s, rect(x, y, x + 4, y + 8), [c, c, c], { tone: 0 }, false);
      line(s, x, y, x + 4, y, "white");
      line(s, x + 4, y + 1, x + 4, y + 8, "hairLo");
    }),
  );
  return outline(s);
}

// Grey stand-in for a creature sprite, labelled so no mock-up implies a finished design.
export function placeholder(w: number, h: number): Sprite {
  const s = blank(w, h);
  const grey = ["gray1", "gray3", "slate"] as const;
  fill(s, ellipse(w / 2, h / 2 + 2, w / 2 - 3, h / 2 - 6), grey, { round: [w / 2 - 4, h / 2 - 4, w / 2, h / 2] });
  fill(s, ellipse(w / 2, h / 2 - h / 5, w / 4, h / 5), grey, { round: [w / 2 - 3, h / 2 - h / 5 - 3, w / 4, h / 5] });
  outline(s);
  text(s, Math.round((w - textWidth("PLACEHOLDER")) / 2), Math.round(h / 2), "PLACEHOLDER", "white", "charcoal");
  return s;
}

// --- UI ---
// Overworld dialogue / menu box: white with a double frame (navy outer, light inner).
export function box(s: Sprite, x0: number, y0: number, x1: number, y1: number, style: "light" | "battle" = "light") {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const d = Math.min(x - x0, x1 - x, y - y0, y1 - y);
      const corner = (x === x0 || x === x1) && (y === y0 || y === y1);
      if (corner) continue;
      const c: ColourKey =
        style === "light" ? (d === 0 ? "navyLo" : d === 1 ? "waterLo" : d === 2 ? "gray1" : "white") : d === 0 ? "ink" : d === 1 ? "gold" : d === 2 ? "orange" : "navyLo";
      set(s, x, y, c);
    }
}

// HP box: name, HP bar (green/yellow/red by fraction) and optional numbers.
export function hpBox(s: Sprite, x0: number, y0: number, name: string, hp: number, max: number, showNumbers: boolean) {
  const h = showNumbers ? 34 : 26;
  box(s, x0, y0, x0 + 103, y0 + h, "light");
  text(s, x0 + 7, y0 + 5, name, "slate");
  const bx = x0 + 30;
  const by = y0 + 17;
  text(s, x0 + 9, by - 2, "HP", "gold", "skinLo");
  fill(s, rect(bx, by, bx + 64, by + 4), ["slate", "slate", "slate"], { tone: 0 }, false);
  const w = Math.round((62 * hp) / max);
  const c: [ColourKey, ColourKey] = hp / max > 0.5 ? ["grassHi", "grassLo"] : hp / max > 0.2 ? ["gold", "orange"] : ["redHi", "red"];
  fill(s, rect(bx + 1, by + 1, bx + w, by + 1), [c[0], c[0], c[0]], { tone: 0 }, false);
  fill(s, rect(bx + 1, by + 2, bx + w, by + 3), [c[1], c[1], c[1]], { tone: 0 }, false);
  if (showNumbers) text(s, x0 + 103 - 6 - textWidth(`${hp}/${max}`), y0 + 24, `${hp}/${max}`, "slate");
}

// Wild-battle background: pale sky band and a grassy field with two oval platforms.
export function battleField(s: Sprite) {
  for (let y = 0; y < SCREEN.h; y++)
    for (let x = 0; x < SCREEN.w; x++) set(s, x, y, y < 48 ? (y < 20 ? "white" : "grassHi") : (x + y * 3) % 23 === 0 ? "grassHi" : "grass");
  const plate = (cx: number, cy: number, rx: number, ry: number) => {
    fill(s, ellipse(cx, cy, rx, ry), ["grassHi", "grassHi", "grassHi"], { tone: 0 }, false);
    fill(s, and(ellipse(cx, cy, rx, ry), (x, y) => !ellipse(cx, cy - 2, rx, ry)(x, y)), ["grassLo", "grassLo", "grassLo"], { tone: 0 }, false);
  };
  plate(176, 74, 44, 11);
  plate(64, 118, 58, 13);
}
