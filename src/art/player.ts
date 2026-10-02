// Player avatar (Iyad): slim, relaxed young adult. Teal zip jacket over a white collared shirt,
// charcoal trousers, orange backpack, clear square glasses with light frames and a short bridge,
// groomed beard that wraps the lips, round v1 cap with a white-and-gold badge. Original design.
// Headwear: cap, headphones or none. One model across every size: same cap, face, glasses, beard.
//
// Style: FireRed-sized overworld (16x32, head about half the height and wider than the body) and
// Black-and-White-sized battle sprites (80x80). Hue-shifted ramps, light from the top-left,
// selective outlines, clean clusters, at most 15 colours per sprite.
//
// Overworld: walk [idle, stepA, stepB] played idle, A, idle, B with a 1px bob on the steps (one step
//   per 16px tile); run [pass, stepA, stepB] played A, pass, B, pass: crouched, leaning forward,
//   longer stride, arms pumping. Plus an item-get pose and Surf (rider on the Bufferfish, 2-frame bob).
// Battle: portrait, trainer front sprite (ball at the chest, weight on one leg, head tilted), and a
//   5-frame back-sprite throw in 3/4 view with fixed arm lengths.
import type { ColourKey } from "./palette.ts";
import { SURF_SIZE, drawBufferfish, float, type MountDrawer } from "./creatures.ts";
import { drawBall } from "./items.ts";
import {
  and,
  blank,
  clean,
  ellipse,
  fill,
  line,
  mirror,
  or,
  outline,
  paint,
  poly,
  put,
  ramps,
  rect,
  segment,
  shadow,
  smooth,
  type Direction,
  type Mask,
  type Ramp,
  type Sprite,
} from "./draw.ts";

export type Headwear = "cap" | "headphones" | "none";
export const HEADWEAR: Headwear[] = ["cap", "headphones", "none"];
export const DEFAULT_HEADWEAR: Headwear = "headphones";
type Pt = [number, number];

const legend: Record<string, ColourKey> = {
  w: "white",
  k: "ink",
  Y: "gold",
  S: "skin", // the overworld drops the skin highlight so the glasses frame fits the 15-colour budget
  s: "skin",
  d: "skinLo",
  H: "hairHi",
  h: "hair",
  j: "hairLo",
  C: "tealHi", // cap
  c: "teal",
  q: "tealLo",
  R: "tealHi", // jacket
  r: "teal",
  m: "tealLo",
  P: "gold", // backpack
  p: "orange",
  o: "skinLo",
  T: "slate", // trousers
  t: "charcoal",
  u: "charcoal",
  x: "gray1", // glasses frames
  g: "slate",
  G: "slate",
  z: "charcoal", // headphone band
  B: "hairHi", // shoes
  b: "hair",
  n: "hairLo",
};

// ---------------------------------------------------------------------------
// Overworld, 16x32, FireRed-style chibi proportions: the figure stands 24px tall at the bottom of the
// frame. Head rows 6-19 (about 60% of the figure, 14px wide with hair tufts under the cap), torso 20-25
// (8px wide with 1px arms, backpack edges peeking over the shoulders), short legs 25-30.
// Face: mostly skin, light glasses frames with a 2px bridge, 1px dark eyes, groomed beard that wraps a
// small dark mouth. No nose.

const E = "................";
type Dir3 = "down" | "up" | "left";
const TOP = [E, E, E, E, E, E];

const FACE = [
  "..sxxxxssxxxxd..",
  "..sxskxssxksxd..",
  "..sxxxxssxxxxd..",
  "..hSsssssssshj..",
  "..hhsshhhhsshj..",
  "..hhhhhjjhhhhj..",
  "...hhhhhhhhhj...",
  "....hhhhhhhj....",
];
// Side face: a little smaller than the front, with the neck showing under the jaw.
const SIDE = [
  "...xxxxsddhj....",
  "...xskxxsdhj....",
  "...xxxxsddhj....",
  "....Sssssshj....",
  "....hsjjhhhj....",
  "....hhhhhhj.....",
  "....hhhhhj......",
  ".......ssd......",
];
const BACK = [
  "..Hhhhhhhhhhhj..",
  "..shhhhhhhhhhd..",
  "..shhhhhhhhhhd..",
  "..hhhhhhhhhhjj..",
  "...Hhhhhhhhhj...",
  "...jhhhhhhhhj...",
  "....jsssssdj....",
  ".....ssssdd.....",
];
const HAIR_TOP = [".....HHhhhj.....", "....HHhHhhhj....", "...HHhHhhhhhj...", "..HhHhHhhhhhhj.."];
// Headphones: a charcoal band over the crown and down the sides, with the swept-back hair showing.
const BAND_FRONT = ["....zzzzzzzz....", "...zzHHhHhhzz...", "..zHHhHhhhhhjz..", "..zHhHhhhhhhjz..", "..zHhhhhhhhhjz..", ".HhSssssssssdhj."];
const BAND_BACK = ["....zzzzzzzz....", "...zzHHhhhhzz...", "..zHhhhhhhhhjz..", "..zHhhhhhhhhjz..", "..zHhhhhhhhhjz..", ".HHhhhhhhhhhhjj."];
const BAND_SIDE = ["....zzzzzzz.....", "...zHHhhhhhz....", "...zHhHhhhhj....", "...HhhHhhhhj....", "...Hhhhhhhhj....", "....Sssssshhj..."];
const FOREHEAD = ".HhSssssssssdhj."; // hair tufts poke out at both sides

const heads: Record<Dir3, Record<Headwear, string[]>> = {
  down: {
    cap: [...TOP, "....CCCCCccq....", "...CCCCwwcccq...", "..CCCCwYYwcccq..", "..CCcccwwccccq..", ".Hqqqqqqqqqqqqj.", FOREHEAD, ...FACE],
    headphones: [...TOP, ...BAND_FRONT, ...FACE],
    none: [...TOP, ...HAIR_TOP, ".HHhhHhhhhhhhjj.", FOREHEAD, ...FACE],
  },
  up: {
    cap: [...TOP, "....CCCCCccq....", "...CCCCcccccq...", "..CCCcccccccqq..", "..CCcccccccccq..", ".HqqqqqHhqqqqqj.", ".HHhhhhhhhhhhjj.", ...BACK],
    headphones: [...TOP, ...BAND_BACK, ...BACK],
    none: [...TOP, ...HAIR_TOP, ".HHhhhhhhhhhhjj.", ".HHhhhhhhhhhhjj.", ...BACK],
  },
  left: {
    cap: [...TOP, "......CCCcq.....", ".....CCCcccq....", "....CCwYcccq....", "....Ccccccccq...", "..CCqqqcccccqj..", "....SsssshHhj...", ...SIDE],
    headphones: [...TOP, ...BAND_SIDE, ...SIDE],
    none: [...TOP, "......HHhh......", "....HHhHhhj.....", "...HHhHhhhj.....", "...HhhhHhhhj....", "...HhhhhHhhhj...", "....SsssshHhj...", ...SIDE],
  },
};
// Ear cups painted over the head for the headphones option: [x, y, rows].
// Ear cups painted over the head: teal, carrying the gold accent the cap badge used to.
const CUP_L = ["Cc", "cq", "Yq", "cq", "qq"];
const CUP_R = ["cq", "qq", "qY", "qq", "qq"];
const CUPS: Record<Dir3, [number, number, string[]][]> = {
  down: [[1, 12, CUP_L], [13, 12, CUP_R]],
  up: [[1, 12, CUP_L], [13, 12, CUP_R]],
  left: [[9, 12, CUP_R]],
};

const torsos: Record<Dir3, string[]> = {
  down: ["...pRwwsswwmp...", "....Prwwwwro....", "....PRrwwrro....", "....PRrrmrro....", "....Rrrrmrmm....", "....mmmmmmmm...."],
  up: ["...pRwwwwwwmp...", "....RpPPPPpm....", "....Rpppppom....", "....RpoYYoom....", "....Rpppppom....", "....mooooomm...."],
  left: ["......wwrmp.....", "......rrrmPpo...", "......mrrmPppo..", "......mrrmpppo..", "......rrmmoooo..", "......mmmm.oo..."],
};

const LEG_Y = 25;
const ARM_Y = 21;
const H = "....Tttttttu....";
const L = "....Ttu..Ttu....";
const SH = "......Tttu......";
const SL = "......Ttu.......";
const frontLegs = {
  idle: [H, H, L, L, "....Bbn..Bbn....", E],
  stepA: [H, H, L, "....Ttu..Bbn....", "....Ttu.........", "....Bbn........."],
  stepB: [H, H, L, "....Bbn..Ttu....", ".........Ttu....", ".........Bbn...."],
  runA: [H, H, "....Ttu..Bbn....", "....Ttu.........", "....Ttu.........", "....Bbn........."],
  runB: [H, H, "....Bbn..Ttu....", ".........Ttu....", ".........Ttu....", ".........Bbn...."],
};
const sideLegs = {
  idle: [SH, SH, SL, SL, ".....Bbbn.......", E],
  stepA: [SH, SH, ".....Ttu.tu.....", "....Ttu...tu....", "...Bbbn....bnn..", E],
  stepB: [SH, SH, ".....tuu.Tt.....", "....tuu...Tt....", "...bnnn....Bn...", E],
  runA: [SH, SH, "....Ttu...tu....", "...Ttu.....tu...", "..Bbbn.....bnn..", E],
  runB: [SH, SH, "....tuu...Tt....", "...tuu.....Tt...", "..bnnn.....Bn...", E],
};

// Arms from ARM_Y: one [column, pixels] pair per row, sleeve rows then the hand.
type Arm = [number, string][];
const col = (x: number, rows: string[], xs: (i: number) => number = () => x): Arm => rows.map((p, i) => [xs(i), p]);
const swing = (x: number, rows: string[], inward: number) => {
  const hand = rows[rows.length - 1];
  const sleeve = rows.slice(0, -1);
  return {
    hang: col(x, rows),
    fwd: col(x, [...sleeve.slice(0, -1), hand]),
    back: col(x, [...sleeve, sleeve[sleeve.length - 1], hand]),
    pump: col(x, [sleeve[0], sleeve[1], hand], (i) => (i === 2 ? x + inward : x)),
    sideFwd: col(x, [...sleeve.slice(0, -1), hand], (i) => x - Math.ceil(i / 2)),
    sideBack: col(x, [...sleeve.slice(0, -1), hand], (i) => x + Math.ceil(i / 2)),
  };
};
const A_L = swing(3, ["R", "R", "r", "m", "S"], 2);
const A_R = swing(12, ["r", "m", "m", "m", "d"], -2);
const A_S = swing(7, ["RR", "Rm", "Rm", "Rm", "Sd"], 0);

const top = (dir: Dir3, hw: Headwear) => [...heads[dir][hw], ...torsos[dir]];

// lean shifts the torso by lean and the head by 2*lean (a forward lean for side runs).
type Pose = { dir: Dir3; hw: Headwear; legs: string[]; arms: Arm[]; lean?: number; dy?: number; extra?: (s: Sprite) => void };

function frame({ dir, hw, legs, arms, lean = 0, dy = 0, extra }: Pose): Sprite {
  const t = top(dir, hw);
  for (const row of [...t, ...legs]) if (row.length !== 16) throw new Error(`row is ${row.length} wide: "${row}"`);
  const s = blank(16, 32);
  paint(s, 0, LEG_Y, legs, legend);
  t.forEach((row, y) => paint(s, y < 20 ? lean * 2 : lean, y + dy, [row], legend));
  if (hw === "headphones") for (const [x, y, rows] of CUPS[dir]) paint(s, x + lean * 2, y + dy, rows, legend);
  for (const arm of arms) arm.forEach(([x, px], i) => paint(s, x + lean, ARM_Y + dy + i, [px], legend));
  extra?.(s);
  return shadow(outline(s), 8, 30.5, 5, 1.6);
}

function cycle(hw: Headwear, kind: "walk" | "run"): Record<Direction, Sprite[]> {
  const f = (dir: "down" | "up") =>
    (kind === "walk"
      ? [
          { dir, hw, legs: frontLegs.idle, arms: [A_L.hang, A_R.hang] },
          { dir, hw, legs: frontLegs.stepA, arms: [A_L.back, A_R.fwd], dy: 1 },
          { dir, hw, legs: frontLegs.stepB, arms: [A_L.fwd, A_R.back], dy: 1 },
        ]
      : [
          { dir, hw, legs: frontLegs.idle, arms: [A_L.pump, A_R.pump], dy: 2 },
          { dir, hw, legs: frontLegs.runA, arms: [A_L.back, A_R.pump], dy: 1 },
          { dir, hw, legs: frontLegs.runB, arms: [A_L.pump, A_R.back], dy: 1 },
        ]
    ).map(frame);
  const left = (
    kind === "walk"
      ? [
          { dir: "left" as const, hw, legs: sideLegs.idle, arms: [A_S.hang] },
          { dir: "left" as const, hw, legs: sideLegs.stepA, arms: [A_S.sideBack], dy: 1 },
          { dir: "left" as const, hw, legs: sideLegs.stepB, arms: [A_S.sideFwd], dy: 1 },
        ]
      : [
          { dir: "left" as const, hw, legs: sideLegs.idle, arms: [A_S.sideFwd], lean: -1, dy: 2 },
          { dir: "left" as const, hw, legs: sideLegs.runA, arms: [A_S.sideBack], lean: -1, dy: 1 },
          { dir: "left" as const, hw, legs: sideLegs.runB, arms: [A_S.sideFwd], lean: -1, dy: 1 },
        ]
  ).map(frame);
  return { down: f("down"), up: f("up"), left, right: left.map(mirror) };
}

export const walk = (hw: Headwear) => cycle(hw, "walk");
export const run = (hw: Headwear) => cycle(hw, "run");

// Item-get: facing the camera, one arm raised beside the head holding up a rolled CV.
export function itemGet(hw: Headwear): Sprite {
  const raised: Arm = [...Array.from({ length: 6 }, (): [number, string] => [13, "r"]), [13, "d"]];
  return frame({
    dir: "down",
    hw,
    legs: frontLegs.idle,
    arms: [A_L.hang],
    extra: (s) => {
      raised.forEach(([x, p], i) => paint(s, x, ARM_Y - 1 - i, [p], legend));
      paint(s, 10, 6, [".www.", "wwwww", "wjjjw", "wYYYw", "wwwww", ".www."], legend); // the CV, with a gold ribbon
    },
  });
}

// Interact: facing an NPC with the near arm reaching forward (A pressed at a person or a sign).
export function interact(hw: Headwear, dir: Direction): Sprite {
  if (dir === "right") return mirror(interact(hw, "left"));
  const reach: Arm = dir === "left" ? [[4, "Rm"], [3, "Rm"], [2, "Sd"]] : [[13, "r"], [14, "m"], [15, "S"]];
  const d3: Dir3 = dir === "left" ? "left" : dir;
  return frame({ dir: d3, hw, legs: d3 === "left" ? sideLegs.idle : frontLegs.idle, arms: [d3 === "left" ? A_S.hang : A_L.hang, reach], dy: 1 });
}

// Ledge hop, facing down: crouch, airborne with the legs tucked, land.
export function ledgeHop(hw: Headwear): Sprite[] {
  const tuck = [H, H, "....Ttu..Ttu....", "....Bbn..Bbn....", E, E];
  return [
    frame({ dir: "down", hw, legs: frontLegs.idle, arms: [A_L.pump, A_R.pump], dy: 2 }),
    frame({ dir: "down", hw, legs: tuck, arms: [A_L.pump, A_R.pump], dy: -3 }),
    frame({ dir: "down", hw, legs: frontLegs.idle, arms: [A_L.hang, A_R.hang], dy: 1 }),
  ];
}

// Surf: the whole upper body sits on the Bufferfish's back; the legs straddle it. The rider drops its
// highlight shades here so rider + golden fish with crimson fins stay within 15 colours.
// Riding drops the hair highlight and darkens the glasses frame, so rider + golden fish with
// crimson fins stay inside 15 colours.
const SURF_LEGEND = { ...legend, H: "hair", G: "slate" } as Record<string, ColourKey>;
export function surf(hw: Headwear, dir: Direction, bob: 0 | 1, lift = 0, mount: MountDrawer = drawBufferfish): Sprite {
  if (dir === "right") return mirror(surf(hw, "left", bob, lift, mount));
  const s = blank(SURF_SIZE, SURF_SIZE);
  mount(s, dir, bob, "back");
  const rider = blank(16, 32);
  paint(rider, 0, 0, top(dir, hw), SURF_LEGEND);
  if (hw === "headphones") for (const [x, y, rows] of CUPS[dir]) paint(rider, x, y, rows, SURF_LEGEND);
  for (const arm of dir === "left" ? [A_S.hang] : [A_L.hang, A_R.hang]) arm.forEach(([x, px], i) => paint(rider, x, ARM_Y + i, [px], SURF_LEGEND));
  const ox = dir === "left" ? 7 : 8;
  for (let y = 5; y < 26; y++)
    for (let x = 0; x < 16; x++) {
      const c = rider.px[y * 16 + x];
      if (c) put(s, x + ox, y - 4 + bob - lift, c);
    }
  mount(s, dir, bob, "front");
  const legs: [Pt, Pt][] = dir === "left" ? [[[14, 21], [11, 25]]] : [[[11, 21], [6, 25]], [[20, 21], [25, 25]]];
  for (const [a, b] of legs) {
    fill(s, segment([a[0], a[1] + bob], [b[0], b[1] + bob], 1.4), ["charcoal", "charcoal", "charcoal"], { tone: 1 });
    fill(s, rect(b[0] - 1, b[1] + bob, b[0] + 1, b[1] + 1 + bob), ["hair", "hair", "hairLo"], { tone: 1 });
  }
  return float(s, dir, bob, () => mount(s, dir, bob, "tail"));
}

// Mounting (lift 6, 3, 0) and dismounting (the reverse) the Bufferfish.
export const surfMount = (hw: Headwear, dir: Direction, mount?: MountDrawer) => [6, 3, 0].map((lift) => surf(hw, dir, 0, lift, mount));
export const surfDismount = (hw: Headwear, dir: Direction, mount?: MountDrawer) => [0, 3, 6].map((lift) => surf(hw, dir, 0, lift, mount));

// ---------------------------------------------------------------------------
// 80x80 battle sprites. Portrait and trainer are drawn in 64-unit coordinates scaled by 1.25;
// big shapes are filled, cleaned of stray pixels, then features are placed as clean clusters.

const K = 80 / 64;
const not = (m: Mask): Mask => (x, y) => !m(x, y);
const P = (pts: Pt[]) => poly(pts.map(([x, y]) => [x * K, y * K]));
const El = (cx: number, cy: number, rx: number, ry: number) => ellipse(cx * K, cy * K, rx * K, ry * K);
const Rect = (x0: number, y0: number, x1: number, y1: number) => rect(x0 * K, y0 * K, (x1 + 1) * K - 1, (y1 + 1) * K - 1);
const Seg = (a: Pt, b: Pt, rad: number) => segment([a[0] * K, a[1] * K], [b[0] * K, b[1] * K], rad * K);
const Rnd = (cx: number, cy: number, rx: number, ry: number) => ({ round: [cx * K, cy * K, rx * K, ry * K] as [number, number, number, number] });
const edge = (n: number) => ({ edge: Math.max(1, Math.round(n * K)) });
const below = (y0: number): Mask => (_, y) => y >= y0 * K;
const above = (y0: number): Mask => (_, y) => y <= y0 * K;
const r = (v: number) => Math.round(v * K);
const SHIRT: Ramp = ["white", "white", "white"];
const STRAP: Ramp = ["gold", "gold", "skinLo"];

// Face: clear square glasses (thin 1px mid grey-blue frame, lens open so the skin and eye show through,
// one glint pixel in the top-left corner), dark eyes inside the lenses, relaxed slightly raised brows
// above the frames, and a small nose side shadow. No pale bands anywhere across the face.
function face(s: Sprite, lenses: [number, number][], ly0: number, ly1: number, browY: number, temples: [number, number], nose: [number, number], big: boolean) {
  for (const [lx0, lx1] of lenses) {
    const [x0, x1, y0, y1] = [r(lx0), r(lx1), r(ly0), r(ly1)];
    // Eye inside the clear lens: 2x2 on the portrait, 1x2 on smaller sprites.
    const ex = Math.round((x0 + x1) / 2) - 1;
    const ey = Math.round((y0 + y1) / 2) - 1;
    fill(s, rect(ex, ey, ex + (big ? 1 : 0), ey + 1), ramps.hair, { tone: 2 }, false);
    // Brow above the frame: relaxed, slightly raised, arched in the middle.
    fill(s, rect(x0 + 2, browY, x1 - 2, browY), ramps.hair, { tone: 1 }, false);
    fill(s, rect(x0, browY + 1, x0 + 1, browY + 1), ramps.hair, { tone: 1 }, false);
    fill(s, rect(x1 - 1, browY + 1, x1, browY + 1), ramps.hair, { tone: 1 }, false);
    // Thin frame, then a single glint in the top-left corner of the lens.
    line(s, x0, y0, x1, y0, "gray1");
    line(s, x0, y1, x1, y1, "gray1");
    line(s, x0, y0, x0, y1, "gray1");
    line(s, x1, y0, x1, y1, "gray1");
    put(s, x0 + 1, y0 + 1, "white");
  }
  const [a, b] = lenses;
  const by = r(ly0) + 1;
  line(s, r(a[1]) + 1, by, r(b[0]) - 1, by, "gray1"); // short bridge
  line(s, r(temples[0]), by, r(a[0]) - 1, by, "gray1");
  line(s, r(b[1]) + 1, by, r(temples[1]), by, "gray1");
  // Nose: a small side shadow only, never a line down the middle of the face.
  const [nx, ny] = [r(nose[0]), r(nose[1])];
  fill(s, rect(nx, ny, nx, ny + (big ? 1 : 0)), ramps.skin, { tone: 2 }, false);
}

// Full groomed beard: a dark band along the jaw (head minus an inner jaw) joined to the moustache
// around the mouth, with a short fade at the cheek line. The mouth is one small dark line below the
// moustache, so it reads as a slight smile. No pale rows anywhere in the beard.
function beardAndSmile(s: Sprite, head: Mask, inner: Mask, cheekY: number, moustache: Mask, corners: Mask, shade: { round: [number, number, number, number] }, mouth: [number, number, number]) {
  const band = and(head, not(inner), (_, y) => y >= cheekY);
  fill(s, or(band, moustache, corners), ramps.hair, shade);
  // Fade at the cheek line: only at the sides, where the beard meets the cheek.
  for (let x = 0; x < s.w; x++) if (band(x, cheekY) && !band(x, cheekY + 3)) put(s, x, cheekY, "hairHi");
  const [mx0, mx1, my] = mouth;
  line(s, mx0, my, mx1, my, "hairLo");
  put(s, mx0 - 1, my - 1, "hairLo"); // corners turned up
  put(s, mx1 + 1, my - 1, "hairLo");
}

function headwear(hw: Headwear, cap: () => void, hair: () => void, phones: () => void) {
  if (hw === "cap") cap();
  else {
    hair();
    if (hw === "headphones") phones();
  }
}

export function portrait(hw: Headwear): Sprite {
  const s = blank(80, 80);
  fill(s, P([[5, 64], [9, 54], [21, 49], [43, 49], [55, 54], [59, 64]]), ramps.teal, edge(2));
  fill(s, Rect(27, 41, 37, 51), ramps.skin, edge(2));
  fill(s, P([[28, 48], [36, 48], [32, 54]]), SHIRT, { tone: 0 });
  fill(s, P([[25, 47], [31, 52], [29, 55], [23, 50]]), SHIRT, { tone: 0 });
  fill(s, P([[39, 47], [33, 52], [35, 55], [41, 50]]), SHIRT, { tone: 0 });
  fill(s, P([[15, 51], [19, 49], [21, 64], [16, 64]]), ramps.orange, edge(1));
  fill(s, P([[45, 49], [49, 51], [48, 64], [43, 64]]), ramps.orange, edge(1));
  fill(s, El(17.5, 32, 2.5, 4.5), ramps.skin, Rnd(17.5, 32, 2.5, 4.5));
  fill(s, El(46.5, 32, 2.5, 4.5), ramps.skin, { tone: 2 });
  const head = or(and(El(32, 30, 14.5, 16), above(34)), P([[17.5, 33], [46.5, 33], [45, 41], [38.5, 47], [34, 49], [30, 49], [25.5, 47], [19, 41]]));
  fill(s, head, ramps.skin, Rnd(37, 32, 16, 20)); // shadow only along the far cheek, no split down the face
  clean(s);
  fill(s, Rect(32, 55, 32, 63), ramps.teal, { tone: 2 }, false); // zip
  beardAndSmile(
    s,
    head,
    P([[22, 38.5], [42, 38.5], [41, 40.4], [36, 41.8], [34, 42.2], [30, 42.2], [28, 41.8], [23, 40.4]]),
    r(36),
    P([[25.5, 39.8], [32, 38.6], [38.5, 39.8], [38.5, 41.4], [34, 40.8], [30, 40.8], [25.5, 41.4]]),
    or(Rect(25, 41, 26.5, 44), Rect(37.5, 41, 39, 44)),
    Rnd(32, 40, 14, 10),
    [r(28.5), r(35.5), r(43)],
  );
  face(s, [[20, 30], [34, 44]], 27, 32.5, r(23.4), [17, 47], [32.6, 35], true);
  headwear(
    hw,
    () => {
      fill(s, and(El(32, 30, 15, 17), (x, y) => Math.abs((x + 0.5) / K - 32) >= 12.5 && y >= 18 * K && y <= 30 * K), ramps.hair, edge(1));
      fill(s, and(El(32, 18.5, 17.5, 15), above(18.5)), ramps.teal, Rnd(32, 16.5, 18, 15));
      fill(s, and(El(32, 18.5, 14.5, 2.8), below(17.5)), ramps.teal, { tone: 2 });
      fill(s, El(32, 10.5, 3.2, 3.2), SHIRT, { tone: 0 }, false);
      fill(s, El(32, 10.5, 1.6, 1.6), ramps.gold, { tone: 0 }, false);
      fill(s, P([[22, 9.5], [25, 6], [26.5, 7], [23.5, 10.5]]), SHIRT, { tone: 0 }, false);
    },
    () => {
      const hairline = (dx: number) => (dx > 9 ? Math.min(30, 19 + (dx - 9) * 2.2) : 19);
      fill(s, and(El(32, 24, 16, 17), (x, y) => y + 0.5 < hairline(Math.abs((x + 0.5) / K - 32)) * K), ramps.hair, Rnd(30, 16, 16, 14));
      for (const x of [25, 30, 35, 40]) line(s, r(x), r(18), r(x + (x - 32) * 0.25), r(10), "hairLo");
    },
    () => {
      fill(s, and(El(32, 24, 18, 19), not(El(32, 24, 16, 17)), above(27)), ["charcoal", "charcoal", "charcoal"], { tone: 1 });
      for (const cx of [15.5, 48.5]) {
        fill(s, El(cx, 32, 4.4, 7), ramps.teal, Rnd(cx, 31, 4.4, 7));
        fill(s, El(cx, 32, 1.3, 1.3), ramps.gold, { tone: 0 }, false);
      }
    },
  );
  return outline(smooth(s));
}

// Pale oval battle platform (separate from the sprites so they keep their own colour budget).
export function platform(w = 80, h = 20): Sprite {
  const s = blank(w, h);
  const cx = w / 2;
  const cy = h / 2;
  fill(s, ellipse(cx, cy, w / 2 - 1, h / 2 - 1), ramps.platform, { tone: 1 }, false);
  fill(s, ellipse(cx - w * 0.06, cy - 1, w * 0.3, h * 0.22), ramps.platform, { tone: 0 }, false);
  const rim = and(ellipse(cx, cy, w / 2 - 1, h / 2 - 1), not(ellipse(cx, cy - 1, w / 2 - 1, h / 2 - 1)));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (rim(x, y)) put(s, x, y, "sand");
  return s;
}

// Hands as hands: palm, thumb and finger separations. Pixel grids at 80x80 scale.
const HAND_RELAXED = ["..sss.", ".Sssss", "Ssssss", "Sssdss", "Ss.d.s", ".s...."];
const HAND_GRIP = ["..Ss.", ".Sssd", "Sssdd", "sdsd.", ".d.d."];
const HAND_LEGEND: Record<string, ColourKey> = { S: "skinHi", s: "skin", d: "skinLo" };

// Trainer front sprite for the battle intro: holding the Debug Ball at chest height in one hand, the
// other hand relaxed, weight on the left leg (hip up, right knee soft, foot turned out), head tilted.
// Trousers drop their light shade and straps their mid shade so the ball fits the 15-colour budget.
export function trainer(hw: Headwear): Sprite {
  const f = blank(80, 80);
  const TROUSERS: Ramp = ["charcoal", "charcoal", "ink"];
  fill(f, P([[20, 27], [44, 26], [43, 38], [21, 38]]), STRAP, edge(2)); // backpack
  fill(f, P([[25, 40], [31, 40], [30.5, 57], [26.5, 57]]), TROUSERS, edge(2));
  fill(f, P([[33, 41], [39, 41], [40.5, 48], [39, 57], [35, 57], [35.5, 48]]), TROUSERS, edge(2));
  fill(f, El(28.5, 58, 3.6, 2.1), ramps.brown, Rnd(28.5, 58, 3.6, 2.1));
  fill(f, El(38, 58.6, 3.8, 2), ramps.brown, Rnd(38, 58.6, 3.8, 2));
  fill(f, Rect(29, 20, 35, 26), ramps.skin, edge(1));
  fill(f, P([[23, 25], [41, 24], [42.5, 27], [41.5, 41], [24, 40], [21.5, 28]]), ramps.teal, edge(2));
  fill(f, P([[24, 25], [26.5, 25], [27.5, 39], [25.5, 39]]), STRAP, edge(1));
  fill(f, P([[37.5, 24.5], [40, 24.5], [38.5, 39], [36.5, 39]]), STRAP, edge(1));
  fill(f, P([[30, 24], [34, 24], [32, 28]]), SHIRT, { tone: 0 });
  fill(f, P([[28, 23], [31, 26], [30, 28], [27, 25]]), SHIRT, { tone: 0 });
  fill(f, P([[36, 23], [33, 26], [34, 28], [37, 25]]), SHIRT, { tone: 0 });
  clean(f);
  fill(f, Rect(32, 28, 32, 40), ramps.teal, { tone: 2 }, false); // zip
  fill(f, Rect(26, 37, 28, 37), ramps.teal, { tone: 2 }, false); // waist folds
  fill(f, Rect(36, 48, 38, 48), TROUSERS, { tone: 2 }, false); // knee fold
  // Relaxed left arm and hand; right arm bent with the Debug Ball at the chest.
  fill(f, Seg([23, 26.5], [20, 33.5], 2.5), ramps.teal, edge(1));
  fill(f, Seg([20, 33.5], [19.5, 39.5], 2.3), ramps.teal, edge(1));
  paint(f, r(19.5) - 3, r(39.5) + 1, HAND_RELAXED, HAND_LEGEND);
  fill(f, Seg([41, 26], [44.5, 33.5], 2.5), ramps.teal, edge(1));
  fill(f, Seg([44.5, 33.5], [38.5, 30.5], 2.3), ramps.teal, edge(1));
  put(f, r(43.5), r(33.5), "tealLo"); // elbow fold
  drawBall(f, r(35.5), r(29.5), 4.3, 135, ["water", "water", "water"]);
  paint(f, r(36.5), r(29.5), HAND_GRIP, HAND_LEGEND);
  // Head on its own layer, sheared a little for the tilt.
  const h = blank(80, 80);
  fill(h, El(23.5, 13, 1.6, 2.4), ramps.skin, { tone: 1 });
  fill(h, El(40.5, 13, 1.6, 2.4), ramps.skin, { tone: 2 });
  const head = or(and(El(32, 11.5, 8.5, 8.7), above(14)), P([[23.5, 14], [40.5, 14], [39.5, 18], [35.5, 22], [33.5, 23], [30.5, 23], [28.5, 22], [24.5, 18]]));
  fill(h, head, ramps.skin, Rnd(35.5, 13, 10, 12));
  clean(h);
  beardAndSmile(
    h,
    head,
    P([[26.4, 16.5], [37.6, 16.5], [37.2, 18], [34, 20], [30, 20], [26.8, 18]]),
    r(16),
    Rect(29, 18, 35, 18),
    or(Rect(28, 18, 28, 20), Rect(36, 18, 36, 20)),
    Rnd(32, 19, 9, 6),
    [r(30), r(34), r(19.4)],
  );
  face(h, [[25.4, 31.2], [32.8, 38.6]], 11, 14.5, r(9.6), [24.4, 39.6], [32.6, 15.5], false);
  headwear(
    hw,
    () => {
      fill(h, and(El(32, 11.5, 9, 9), (x, y) => Math.abs((x + 0.5) / K - 32) >= 6.8 && y >= 6 * K && y <= 12 * K), ramps.hair, { tone: 1 });
      fill(h, and(El(32, 7.5, 10, 8), above(7.5)), ramps.teal, Rnd(32, 6, 10, 8));
      fill(h, and(El(32, 8, 7.5, 1.4), below(7.5)), ramps.teal, { tone: 2 });
      fill(h, El(32, 3.5, 1.8, 1.8), SHIRT, { tone: 0 }, false);
      fill(h, El(32, 3.5, 0.9, 0.9), ramps.gold, { tone: 0 }, false);
      fill(h, P([[25.5, 3.5], [27.5, 1.2], [28.5, 2], [26.5, 4.2]]), SHIRT, { tone: 0 }, false);
    },
    () => {
      const hair = and(El(32, 10.5, 9.4, 9.5), (x, y) => {
        const dx = Math.abs((x + 0.5) / K - 32);
        return y + 0.5 < (dx > 5 ? Math.min(14, 7 + (dx - 5) * 1.6) : 7) * K;
      });
      fill(h, hair, ramps.hair, Rnd(31, 7, 9, 8));
      for (const x of [30, 35]) line(h, r(x), r(6), r(x + (x - 32) * 0.2), r(2), "hairLo");
    },
    () => {
      fill(h, and(El(32, 11, 10.2, 10.6), not(El(32, 11, 9, 9.4)), above(12)), ["charcoal", "charcoal", "charcoal"], { tone: 1 });
      for (const cx of [23, 41]) {
        fill(h, El(cx, 13.2, 2.5, 3.6), ramps.teal, Rnd(cx, 13, 2.5, 3.6));
        fill(h, El(cx, 13.2, 0.8, 0.8), ramps.gold, { tone: 0 }, false);
      }
    },
  );
  const neckY = r(23);
  h.px.forEach((c, i) => {
    if (!c) return;
    const y = Math.floor(i / 80);
    put(f, (i % 80) + Math.round((neckY - y) * 0.07), y, c);
  });
  return outline(smooth(f));
}

// ---------------------------------------------------------------------------
// Battle back-sprite, 80x80: seen from behind over the shoulder in a 3/4 view (facing up and to the
// right), showing head, backpack, torso and upper legs. 5 frames: hold, wind-up (elbow ~90 deg, ball by
// the ear, weight on the back foot, other arm forward for balance), throw (forearm forward ~45 deg),
// release (ball leaves the hand, weight on the front foot), follow-through (arm across the body,
// shoulders turned). Arms keep the same length in every frame: only the shoulder and elbow angles change.

type ThrowFrame = {
  bx: number; // body shift (weight)
  rs: Pt; // right (throwing) shoulder
  arm: [number, number]; // upper arm and forearm directions, degrees (0 = right, 90 = down)
  balance: [number, number]; // left arm upper and forearm directions
  thighs: [number, number]; // bottom x of the left (front) and right (back) thighs
  ball?: "held" | "free";
};
const UPPER = 13;
const FOREARM = 12;
const THROW: ThrowFrame[] = [
  { bx: 0, rs: [54, 44], arm: [70, 130], balance: [100, 95], thighs: [33, 48], ball: "held" },
  { bx: 2, rs: [56, 46], arm: [-20, -110], balance: [-150, -110], thighs: [30, 50], ball: "held" },
  { bx: 0, rs: [55, 43], arm: [-35, -60], balance: [120, 30], thighs: [34, 49], ball: "held" },
  { bx: -2, rs: [53, 42], arm: [-50, -55], balance: [115, 40], thighs: [36, 52], ball: "free" },
  { bx: -3, rs: [50, 44], arm: [100, 160], balance: [100, 110], thighs: [37, 54] },
];
export const THROW_FRAMES = THROW.length;

const BACK_SKIN: Ramp = ["skin", "skin", "skinLo"];
const BACK_HAIR: Ramp = ["hair", "hair", "hairLo"];
const along = ([x, y]: Pt, deg: number, len: number): Pt => [x + Math.cos((deg * Math.PI) / 180) * len, y + Math.sin((deg * Math.PI) / 180) * len];

function sleeve(s: Sprite, sh: Pt, [a1, a2]: [number, number], before?: (hand: Pt) => void): Pt {
  const el = along(sh, a1, UPPER);
  const hand = along(el, a2, FOREARM);
  fill(s, segment(sh, el, 4), ramps.teal, { edge: 2 });
  fill(s, segment(el, hand, 3.5), ramps.teal, { edge: 1 });
  fill(s, segment(along(hand, a2 + 180, 2.5), hand, 3.6), ramps.teal, { tone: 2 }, false);
  before?.(hand);
  fill(s, ellipse(hand[0], hand[1], 3.2, 3.2), BACK_SKIN, { round: [hand[0] - 1, hand[1] - 1, 3.2, 3.2] });
  return hand;
}

export function backSprite(hw: Headwear, i: number): Sprite {
  const { bx, rs, arm, balance, thighs, ball } = THROW[i];
  const s = blank(80, 80);
  const hx = 38 + Math.round(bx / 2);
  const hy = 21;
  fill(s, poly([[28 + bx, 62], [39 + bx, 62], [thighs[0] + 5, 80], [thighs[0] - 5, 80]]), ramps.trousers, { edge: 2 });
  fill(s, poly([[41 + bx, 62], [53 + bx, 62], [thighs[1] + 6, 80], [thighs[1] - 5, 80]]), ramps.trousers, { edge: 2 });
  sleeve(s, [25 + bx, 44], balance);
  fill(s, poly([[21 + bx, 41], [rs[0] + 2, rs[1] - 3], [54 + bx, 64], [27 + bx, 64]]), ramps.teal, { edge: 2 });
  fill(s, poly([[49 + bx, 43], [rs[0] + 2, rs[1] - 3], [54 + bx, 64], [49 + bx, 64]]), ramps.teal, { tone: 2 }, false);
  fill(s, rect(hx - 5, hy + 10, hx + 5, hy + 18), BACK_SKIN, { edge: 1 });
  fill(s, poly([[hx - 8, hy + 15], [hx + 8, hy + 15], [hx + 10, hy + 20], [hx - 10, hy + 20]]), ramps.shirt, { edge: 1 });
  fill(s, poly([[25 + bx, 42], [47 + bx, 42], [48 + bx, 62], [26 + bx, 62]]), ramps.orange, { edge: 2 });
  fill(s, poly([[25 + bx, 42], [47 + bx, 42], [47 + bx, 50], [25 + bx, 50]]), ramps.orange, { round: [36 + bx, 46, 18, 8] });
  fill(s, rect(34 + bx, 48, 37 + bx, 52), ramps.gold, { tone: 0 });
  fill(s, rect(23 + bx, 39, 26 + bx, 44), ramps.orange, { tone: 1 });
  fill(s, rect(46 + bx, 39, 49 + bx, 44), ramps.orange, { tone: 2 });
  // Head from behind-right: hair, cheek, close jaw beard, ear, light glasses temple, nape.
  const skull = ellipse(hx, hy, 14, 15); // big, chunky Black-and-White-style head
  fill(s, skull, BACK_HAIR, { round: [hx, hy, 14, 15] });
  fill(s, and(skull, (x, y) => x > hx + 6 && y > hy - 1), BACK_SKIN, { tone: 1 });
  fill(s, and(skull, (x, y) => x > hx + 5 && y > hy + 6), BACK_HAIR, { tone: 1 });
  fill(s, ellipse(hx + 10.5, hy + 2, 2.4, 3.6), BACK_SKIN, { tone: 2 });
  line(s, hx + 10, hy - 1, hx + 15, hy - 1, "slate"); // glasses temple, darkened to fit the budget
  fill(s, and(skull, (x, y) => y >= hy + 12 && x < hx + 5), BACK_SKIN, { tone: 1 });
  headwear(
    hw,
    () => {
      fill(s, and(ellipse(hx, hy - 7, 15, 11), (_, y) => y <= hy - 3), ramps.teal, { round: [hx, hy - 8, 15, 11] });
      fill(s, poly([[hx + 7, hy - 6], [hx + 20, hy - 10], [hx + 21, hy - 7], [hx + 9, hy - 2]]), ramps.teal, { tone: 2 });
      fill(s, rect(hx - 8, hy - 6, hx - 5, hy - 3), BACK_HAIR, { tone: 1 });
      for (const [x, y] of [[hx - 14, hy - 2], [hx - 15, hy], [hx + 13, hy - 3]]) fill(s, rect(x, y, x + 1, y + 1), BACK_HAIR, { tone: 1 }); // tufts under the cap
    },
    () => fill(s, and(skull, (x, y) => y < hy - 9), BACK_HAIR, { tone: 1 }),
    () => {
      fill(s, and(ellipse(hx, hy, 15.5, 16.5), not(ellipse(hx, hy, 12.6, 13.4)), (_, y) => y <= hy + 2), ["charcoal", "charcoal", "charcoal"], { tone: 1 });
      for (const [cx, dot] of [[hx - 13, -1], [hx + 13, 1]] as [number, number][]) {
        fill(s, ellipse(cx, hy + 2, 3.2, 4.6), ramps.teal, { round: [cx, hy + 2, 3.2, 4.6] });
        fill(s, ellipse(cx + dot, hy + 2, 1, 1), ramps.gold, { tone: 0 }, false);
      }
    },
  );
  const hand = sleeve(s, rs, arm, (h) => {
    if (ball === "held") drawBall(s, h[0], h[1] - 3, 3.5);
  });
  if (ball === "free") drawBall(s, hand[0] + 5, hand[1] - 9, 3, 90);
  return outline(smooth(s));
}
