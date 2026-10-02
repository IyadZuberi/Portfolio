// Items, drawn in code from the fixed palette.
import { and, blank, ellipse, fill, outline, put, ramps, rect, type Ramp, type Sprite } from "./draw.ts";

// Original "Debug Ball": blue sphere, white stripe through the middle, gold core.
// angle (degrees) turns the stripe, so a run of angles reads as spin.
// body lets a small sprite use a flat blue, which keeps it inside its colour budget.
export function drawBall(s: Sprite, cx: number, cy: number, r: number, angle = 135, body: Ramp = ramps.ball) {
  const a = (angle * Math.PI) / 180;
  const ball = ellipse(cx, cy, r, r);
  const round = { round: [cx, cy, r, r] as [number, number, number, number] };
  fill(s, ball, body, round, false);
  const stripe = and(ball, (x, y) => Math.abs((x + 0.5 - cx) * Math.sin(a) - (y + 0.5 - cy) * Math.cos(a)) < r * 0.3);
  fill(s, stripe, ["white", "white", "water"], round, false);
  if (r >= 3) fill(s, ellipse(cx, cy, r * 0.32, r * 0.32), ramps.gold, { tone: 0 }, false);
  put(s, Math.floor(cx - r * 0.5), Math.floor(cy - r * 0.55), "white"); // glint
}

export function debugBall(): Sprite {
  const s = blank(16, 16);
  drawBall(s, 8, 8, 6.5);
  return outline(s);
}

// Ball in flight after a throw: shrinks as it travels away, stripe turning each frame.
export function ballFlight(): Sprite[] {
  return [6, 5, 4.5, 3.5, 3, 2.5].map((r, i) => {
    const s = blank(16, 16);
    drawBall(s, 8, 8, r, [135, 90, 45, 0][i % 4]);
    return outline(s);
  });
}

// The ball opening to send a creature out: closed, split with a seam of light, wide open in a flash.
export function ballOpen(): Sprite[] {
  return [0, 1, 2].map((i) => {
    const s = blank(24, 24);
    if (i === 0) drawBall(s, 12, 12, 6);
    else {
      const gap = i === 1 ? 2 : 5;
      // Top and bottom halves pulling apart, with light pouring out of the seam.
      fill(s, and(ellipse(12, 12 - gap, 6, 6), (_, y) => y <= 12 - gap), ramps.ball, { round: [12, 12 - gap, 6, 6] }, false);
      fill(s, and(ellipse(12, 12 + gap, 6, 6), (_, y) => y >= 12 + gap), ramps.ball, { round: [12, 12 + gap, 6, 6] }, false);
      fill(s, rect(12 - 6 - i, 11, 12 + 5 + i, 12), ramps.gold, { tone: 0 }, false);
      if (i === 2) for (const [x, y] of [[3, 6], [20, 7], [5, 18], [19, 17], [12, 2], [12, 21]]) fill(s, rect(x, y, x, y), ramps.gold, { tone: 0 }, false);
    }
    return outline(s);
  });
}

// Logging a creature: the ball rocks left, upright, right, then a sparkle burst when it sticks.
export function ballCatch(): Sprite[] {
  const tilt = [-1, 0, 1, 0].map((d) => {
    const s = blank(24, 24);
    drawBall(s, 12 + d, 14, 6, 135 + d * 30);
    fill(s, ellipse(12, 21, 7, 1.6), ["sandHi", "sand", "sandLo"], { tone: 1 }, false); // ground
    return outline(s);
  });
  const sparkle = blank(24, 24);
  drawBall(sparkle, 12, 14, 6);
  fill(sparkle, ellipse(12, 21, 7, 1.6), ["sandHi", "sand", "sandLo"], { tone: 1 }, false);
  outline(sparkle);
  for (const [x, y, n] of [[4, 4, 2], [19, 5, 2], [2, 12, 1], [21, 11, 1], [12, 1, 2]] as [number, number, number][]) {
    fill(sparkle, rect(x - n, y, x + n, y), ramps.gold, { tone: 0 }, false);
    fill(sparkle, rect(x, y - n, x, y + n), ramps.gold, { tone: 0 }, false);
    fill(sparkle, rect(x, y, x, y), ramps.shirt, { tone: 0 }, false);
  }
  return [...tilt, sparkle];
}
