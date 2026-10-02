// Creatures, drawn in code from the fixed palette. Original designs only; at most 15 colours each.
import { and, blank, ellipse, fill, get, line, mirror, outline, poly, put, ramps, rect, segment, type Ramp, type Sprite } from "./draw.ts";

type Pt = [number, number];
const R = (cx: number, cy: number, rx: number, ry: number) => ({ round: [cx, cy, rx, ry] as [number, number, number, number] });

export type FishDir = "down" | "up" | "left";
export type Layer = "back" | "front" | "tail"; // tail is drawn after the waterline cut
export type MountDrawer = (s: Sprite, dir: FishDir, dy: number, layer: Layer) => void;

// Plain grey stand-in for the ridable creature, until the real one is designed.
export const drawPlaceholderMount: MountDrawer = (s, _dir, dy, layer) => {
  const body = ellipse(16, 23 + dy, 10, 6);
  const grey = ["gray1", "gray3", "slate"] as const;
  if (layer === "back") fill(s, body, grey, { round: [16, 19 + dy, 10, 6] });
  else fill(s, and(body, (_, y) => y >= 23 + dy), grey, { round: [16, 27 + dy, 10, 6] });
};

export function placeholderMount(dir: FishDir | "right", bob: 0 | 1): Sprite {
  if (dir === "right") return mirror(placeholderMount("left", bob));
  const s = blank(SURF_SIZE, SURF_SIZE);
  drawPlaceholderMount(s, dir, bob, "back");
  drawPlaceholderMount(s, dir, bob, "front");
  return float(s, dir, bob);
}

// Bufferfish: rare lake creature (Skilldex: TCP and UDP sockets). A round golden puffer with
// crimson fins and teal "buffer slot" bars, seen slightly from above, head leading, about 1.5x the
// rider's width. 32x32, floating with its lower body under the waterline (row WATERLINE + bob).
// Drawn in two layers so a rider can sit between them; dy = bob offset.
export const SURF_SIZE = 32;
const WATERLINE = 28;
const FIN: Ramp = ["red", "red", "redLo"]; // crimson
const BODY: Ramp = ["gold", "gold", "orange"]; // golden yellow, clear of the orange backpack

export function drawBufferfish(s: Sprite, dir: FishDir, dy: number, layer: Layer) {
  if (layer === "tail") {
    if (dir === "up") fill(s, poly([[13, 25 + dy], [16, 24 + dy], [19, 25 + dy], [21, 30 + dy], [16, 28 + dy], [11, 30 + dy]]), FIN, { edge: 1 });
    return;
  }
  const P = (pts: Pt[]) => poly(pts.map(([x, y]) => [x, y + dy]));
  const E = (cx: number, cy: number, rx: number, ry: number) => ellipse(cx, cy + dy, rx, ry);
  const bar = (x: number, y0: number, y1: number) => fill(s, rect(x, y0 + dy, x, y1 + dy), ramps.teal, { tone: 2 }, false);
  // 2x2 eye: white with a dark pupil on the side it looks toward.
  const eye = (x: number, y: number, lookX: 0 | 1) => {
    fill(s, rect(x, y + dy, x + 1, y + 1 + dy), ramps.shirt, { tone: 0 }, false);
    put(s, x + lookX, y + 1 + dy, "ink");
  };

  if (dir === "left") {
    const body = E(15, 23, 10.5, 6);
    const shade = R(15, 22 + dy, 10.5, 6);
    if (layer === "back") {
      fill(s, P([[24, 21], [30, 16], [29, 23], [30, 29], [24, 25]]), FIN, { edge: 1 });
      fill(s, P([[17, 17], [21, 12], [23, 18]]), FIN, { edge: 1 });
      fill(s, body, BODY, shade);
      bar(21, 18, 21);
      bar(23, 19, 22);
    } else {
      fill(s, and(body, (_, y) => y >= 22 + dy), BODY, R(15, 26 + dy, 10.5, 6));
      fill(s, P([[13, 24], [18, 23], [17, 27]]), FIN, { edge: 1 });
      eye(6, 21, 0);
      fill(s, rect(5, 25 + dy, 6, 25 + dy), FIN, { tone: 2 }, false);
    }
    return;
  }

  const body = E(16, 23, 9.5, 6);
  const shade = R(16, 22 + dy, 9.5, 6);
  if (layer === "back") {
    fill(s, P([[8, 24], [3, 20], [4, 27]]), FIN, { edge: 1 });
    fill(s, P([[24, 24], [29, 20], [28, 27]]), FIN, { edge: 1 });
    fill(s, body, BODY, shade);
    if (dir === "up") for (const x of [10, 22]) bar(x, 19, 22);
  } else {
    fill(s, and(body, (_, y) => y >= 23 + dy), BODY, R(16, 27 + dy, 9.5, 6));
    if (dir === "down") {
      eye(12, 24, 0);
      eye(18, 24, 1);
      fill(s, rect(15, 26 + dy, 16, 26 + dy), FIN, { tone: 2 }, false);
    }
  }
}

// Lower body under the water, outline, then the tail (up view) and a ripple ring that grows on the bob.
export function float(s: Sprite, dir: FishDir, bob: number, tail?: () => void): Sprite {
  const wl = WATERLINE + bob;
  for (let y = wl; y < s.h; y++) for (let x = 0; x < s.w; x++) put(s, x, y, null);
  tail?.();
  outline(s);
  const outer = ellipse(16, wl, 13.5 + bob, 3 + bob * 0.4);
  const inner = ellipse(16, wl, 12 + bob, 2 + bob * 0.4);
  for (let y = 0; y < s.h; y++)
    for (let x = 0; x < s.w; x++) if (outer(x, y) && !inner(x, y) && get(s, x, y) === null && (x + bob) % 4 !== 0) put(s, x, y, "white");
  return s;
}

export function bufferfish(dir: FishDir | "right", bob: 0 | 1): Sprite {
  if (dir === "right") return mirror(bufferfish("left", bob));
  const s = blank(SURF_SIZE, SURF_SIZE);
  drawBufferfish(s, dir, bob, "back");
  drawBufferfish(s, dir, bob, "front");
  return float(s, dir, bob, () => drawBufferfish(s, dir, bob, "tail"));
}

// Jitterbug (common, Route 1; Skilldex: throughput, latency and jitter analysis).
// Round navy beetle with a gold zigzag "jitter" stripe across its shell and signal-wave antennae. Front, 64x64.
export function jitterbug(bob = 0): Sprite {
  const s = blank(64, 64);
  // Legs (behind the shell), shell, split line, zigzag stripe.
  for (const [a, b] of [
    [[20, 44], [11, 52]],
    [[22, 48], [15, 58]],
    [[26, 51], [23, 60]],
  ] as [Pt, Pt][]) {
    fill(s, segment(a, b, 1.3), ramps.navy, { tone: 2 });
    fill(s, segment([64 - a[0], a[1]], [64 - b[0], b[1]], 1.3), ramps.navy, { tone: 2 });
  }
  fill(s, ellipse(32, 41 + bob, 17, 14), ramps.navy, R(26, 34 + bob, 17, 14));
  line(s, 32, 29 + bob, 32, 54, "navyLo");
  const zig: Pt[] = ([[15, 41], [20, 36], [25, 44], [32, 36], [39, 44], [44, 36], [49, 41]] as Pt[]).map(([x, y]) => [x, y + bob] as Pt);
  for (let i = 0; i < zig.length - 1; i++) fill(s, segment(zig[i], zig[i + 1], 1.4), ramps.gold, { tone: i % 2 ? 1 : 0 }, false);
  // Head, big friendly eyes, smile, antennae with orb tips.
  fill(s, ellipse(32, 24 + bob, 11.5, 9), ramps.navy, R(28, 19 + bob, 11.5, 9));
  for (const ex of [27, 37]) {
    fill(s, ellipse(ex, 24 + bob, 3.6, 4.2), ramps.shirt, { tone: 0 });
    fill(s, rect(ex - 1, 24 + bob, ex, 26 + bob), ramps.navy, { tone: 2 }, false);
    put(s, ex - 1, 24 + bob, "white");
  }
  line(s, 30, 30 + bob, 34, 30 + bob, "navyLo");
  for (const side of [-1, 1]) {
    const sway = bob * side;
    const pts: Pt[] = [[32 + side * 4, 16 + bob], [32 + side * 6, 12 + bob], [32 + side * 4, 9], [32 + side * 7 + sway, 5]];
    for (let i = 0; i < pts.length - 1; i++) fill(s, segment(pts[i], pts[i + 1], 0.9), ramps.navy, { tone: 2 }, false);
    fill(s, ellipse(32 + side * 7 + sway, 4, 2.2, 2.2), ramps.gold, R(31 + side * 7 + sway, 3, 2.2, 2.2));
  }
  return outline(s);
}

// Voltling (hardware starter). Round gold critter with capacitor ears, a navy battery band
// and a plug-tipped tail. Back view for battles, 64x64.
export function voltlingBack(bob = 0): Sprite {
  const s = blank(64, 64);
  // Tail with a two-prong plug, behind the body.
  fill(s, segment([40, 52], [50, 44], 3.2), ramps.orange, { edge: 1 });
  fill(s, segment([50, 44], [53, 34], 3), ramps.orange, { edge: 1 });
  fill(s, rect(49, 26, 57, 33), ramps.metal, { edge: 1 });
  for (const x of [50, 55]) fill(s, rect(x, 21, x + 1, 25), ramps.metal, { tone: 1 });
  // Body with the battery band, feet, head, capacitor ears.
  fill(s, ellipse(22, 58, 4, 2.6), ramps.orange, R(21, 57, 4, 2.6));
  fill(s, ellipse(38, 58, 4, 2.6), ramps.orange, R(37, 57, 4, 2.6));
  const body = ellipse(30, 44 + bob, 15, 14);
  fill(s, body, ramps.orange, R(31, 45, 15, 14));
  fill(s, and(body, (_, y) => y >= 42 + bob && y <= 46 + bob), ramps.navy, { tone: 1 }, false);
  fill(s, rect(28, 43 + bob, 31, 45 + bob), ramps.shirt, { tone: 0 }, false);
  fill(s, ellipse(30, 26 + bob, 13, 11), ramps.orange, R(31, 27 + bob, 13, 11));
  for (const [a, b] of [
    [[23, 18 + bob], [19, 7]],
    [[37, 18 + bob], [41, 7]],
  ] as [Pt, Pt][]) {
    fill(s, segment(a, b, 3), ramps.metal, { edge: 1 });
    fill(s, segment([b[0] + (a[0] - b[0]) * 0.25, b[1] + (a[1] - b[1]) * 0.25], b, 3.1), ramps.navy, { tone: 1 }, false);
  }
  return outline(s);
}

// --- Starters (Lab table / Skilldex), front view, 32x32 ---
const smile = (s: Sprite, cx: number, y: number, c: "ink" | "navyLo" = "ink") => {
  line(s, cx - 2, y, cx + 2, y, c);
  put(s, cx - 3, y - 1, c);
  put(s, cx + 3, y - 1, c);
};
const bigEyes = (s: Sprite, cx: number, y: number, gap: number) => {
  for (const d of [-gap, gap]) {
    fill(s, ellipse(cx + d, y, 2.8, 3.2), ramps.shirt, { tone: 0 });
    fill(s, rect(cx + d - 1, y, cx + d, y + 1), ["ink", "ink", "ink"], { tone: 0 }, false);
    put(s, cx + d - 1, y - 1, "white");
  }
};

// Voltling (hardware): golden critter, capacitor ears, navy battery band, plug tail.
export function voltling(bob = 0): Sprite {
  const s = blank(32, 32);
  fill(s, segment([21, 26], [28, 20], 1.6), ramps.orange, { edge: 1 });
  fill(s, rect(26, 14, 30, 19), ramps.metal, { edge: 1 });
  for (const x of [27, 29]) fill(s, rect(x, 11, x, 13), ramps.metal, { tone: 1 });
  fill(s, ellipse(11, 29, 2.6, 1.6), ramps.orange, { tone: 1 });
  fill(s, ellipse(19, 29, 2.6, 1.6), ramps.orange, { tone: 2 });
  const body = ellipse(15, 23 + bob, 8, 7);
  fill(s, body, ramps.orange, { round: [12, 19 + bob, 8, 7] });
  fill(s, and(body, (_, y) => y >= 22 + bob && y <= 24 + bob), ramps.navy, { tone: 1 }, false);
  fill(s, rect(13, 22 + bob, 15, 24 + bob), ramps.shirt, { tone: 0 }, false);
  for (const [a, b] of [[[11, 11 + bob], [8, 3]], [[19, 11 + bob], [22, 3]]] as [[number, number], [number, number]][]) {
    fill(s, segment(a, b, 1.6), ramps.metal, { edge: 1 });
    fill(s, segment([b[0] + (a[0] - b[0]) * 0.3, b[1] + (a[1] - b[1]) * 0.3], b, 1.7), ramps.navy, { tone: 1 }, false);
  }
  fill(s, ellipse(15, 13 + bob, 7.5, 6.5), ramps.orange, { round: [12, 9 + bob, 7.5, 6.5] });
  bigEyes(s, 15, 13 + bob, 3);
  smile(s, 15, 17 + bob);
  return outline(s);
}

// Tensorlet (AI/ML): a soft teal cube with a glowing node lattice on its face and stubby feet.
export function tensorlet(bob = 0): Sprite {
  const s = blank(32, 32);
  fill(s, ellipse(11, 28, 2.6, 1.6), ramps.teal, { tone: 1 });
  fill(s, ellipse(20, 28, 2.6, 1.6), ramps.teal, { tone: 2 });
  const body = poly([[7, 10 + bob], [24, 10 + bob], [26, 14 + bob], [25, 25 + bob], [7, 25 + bob], [6, 14 + bob]]);
  fill(s, body, ramps.teal, { round: [11, 12 + bob, 10, 9] });
  for (const gy of [20, 23]) for (const gx of [9, 15, 21]) fill(s, rect(gx, gy + bob, gx + 1, gy + 1 + bob), ramps.gold, { tone: 0 }, false);
  for (const gx of [10, 16]) line(s, gx, 21 + bob, gx + 5, 24 + bob, "gold"); // lattice links
  bigEyes(s, 16, 15 + bob, 4);
  smile(s, 16, 18 + bob);
  fill(s, poly([[13, 8 + bob], [16, 3], [19, 8 + bob]]), ramps.gold, { edge: 1 }); // gradient spark
  return outline(s);
}

// Packetpup (systems and data): a navy pup with square packet ears and an antenna tail.
export function packetpup(bob = 0): Sprite {
  const s = blank(32, 32);
  fill(s, segment([22, 24], [28, 16], 1.3), ramps.navy, { edge: 1 });
  fill(s, ellipse(28, 14, 2.2, 2.2), ramps.gold, { round: [27, 13, 2.2, 2.2] });
  fill(s, ellipse(10, 29, 2.8, 1.6), ramps.navy, { tone: 1 });
  fill(s, ellipse(19, 29, 2.8, 1.6), ramps.navy, { tone: 2 });
  fill(s, ellipse(15, 23 + bob, 8.5, 6.5), ramps.navy, { round: [12, 19 + bob, 8.5, 6.5] });
  fill(s, rect(12, 21 + bob, 18, 23 + bob), ramps.shirt, { tone: 0 }, false); // packet stripe
  fill(s, rect(14, 21 + bob, 16, 23 + bob), ramps.gold, { tone: 0 }, false);
  for (const [x, flip] of [[8, 0], [19, 1]] as [number, number][])
    fill(s, poly([[x, 10 + bob], [x + 5, 10 + bob], [x + 5 - flip, 15 + bob], [x + flip, 15 + bob]]), ramps.navy, { edge: 1 });
  fill(s, ellipse(15, 14 + bob, 7.5, 6), ramps.navy, { round: [12, 10 + bob, 7.5, 6] });
  bigEyes(s, 15, 13 + bob, 3);
  fill(s, rect(14, 16 + bob, 16, 17 + bob), ramps.shirt, { tone: 0 }, false); // muzzle
  smile(s, 15, 17 + bob, "navyLo");
  return outline(s);
}
