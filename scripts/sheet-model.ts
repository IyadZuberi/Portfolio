// Character model sheet: npm run art:model -> docs/review/sheet-model.png
// Headphones are the default headwear. Creatures are grey placeholders until they are designed.
import { blank, type Direction, type Sprite } from "../src/art/draw.ts";
import { drawPlaceholderMount, placeholderMount } from "../src/art/creatures.ts";
import { ballCatch, ballOpen, debugBall } from "../src/art/items.ts";
import { DEFAULT_HEADWEAR, HEADWEAR, THROW_FRAMES, backSprite, interact, itemGet, ledgeHop, platform, portrait, run, surf, surfDismount, surfMount, trainer, walk } from "../src/art/player.ts";
import { text } from "../src/art/font.ts";
import { SCREEN, battleField, blit, box, hpBox, house, npc, placeholder, screen, shelf, tile, tree, type Tile } from "../src/art/world.ts";
import { budget, canvas } from "./sheet.ts";

const hw = DEFAULT_HEADWEAR;
const dirs: Direction[] = ["down", "up", "left", "right"];
const walkF = walk(hw);
const runF = run(hw);
const all = (f: Record<Direction, Sprite[]>) => dirs.flatMap((d) => f[d]);
const surfF = dirs.flatMap((d) => [surf(hw, d, 0, 0, drawPlaceholderMount), surf(hw, d, 1, 0, drawPlaceholderMount)]);
const throwF = Array.from({ length: THROW_FRAMES }, (_, i) => backSprite(hw, i));

budget("walk", all(walkF));
budget("run", all(runF));
budget("item get", [itemGet(hw)]);
budget("interact", dirs.map((d) => interact(hw, d)));
budget("ledge hop", ledgeHop(hw));
budget("surf on placeholder", [...surfF, ...surfMount(hw, "right", drawPlaceholderMount)]);
budget("portrait", [portrait(hw)]);
budget("trainer", [trainer(hw)]);
budget("back throw", throwF);

const W = 1500;
const H = 2420;
const c = canvas(W, H);
c.fill(0, 0, W, H, "white");

// Model sheet: every size at the same height (160px).
c.label(12, 12, "MODEL SHEET  SAME HEIGHT  OVERWORLD 5X  BATTLE 2X  HEADPHONES");
const model: [Sprite, number][] = [
  [walkF.down[0], 5],
  [walkF.left[0], 5],
  [walkF.up[0], 5],
  [portrait(hw), 2],
  [trainer(hw), 2],
  [throwF[0], 2],
];
model.reduce((x, [s, k]) => {
  c.card(x, 30, s, k);
  return x + s.w * k + 12;
}, 12);

// Walk and run on grass.
const row = (y: number, name: string, sprites: Sprite[], tilesW: number, kind: Tile = "grass", step = 16) => {
  c.label(12, y, name);
  c.strip(12, y + 14, kind, tilesW, 2, 3, sprites.map((f, i) => [f, i * step, 0] as [Sprite, number, number]));
  c.strip(24 + tilesW * 48, y + 14, kind, Math.ceil((sprites.length * step) / 16), 2, 1, sprites.map((f, i) => [f, i * step, 0] as [Sprite, number, number]));
  return y + 120;
};
let y = 212;
y = row(y, "WALK  DOWN UP LEFT RIGHT  IDLE STEP STEP  3X AND 1X", all(walkF), 12);
y = row(y, "RUN  PASS STRIDE STRIDE  CROUCHED AND LEANING  3X AND 1X", all(runF), 12);
y = row(y, "SURF ON THE PLACEHOLDER MOUNT  4 DIRECTIONS X 2 BOB", surfF, 16, "water", 32);
y = row(y, "MOUNT THEN DISMOUNT THE PLACEHOLDER", [...surfMount(hw, "right", drawPlaceholderMount), ...surfDismount(hw, "right", drawPlaceholderMount)], 12, "water", 32);
y = row(y, "BUMP INTO A WALL  INTERACT WITH AN NPC  LEDGE HOP  HEADWEAR OPTIONS", [walkF.up[0], walkF.up[1], walkF.up[2], ...dirs.map((d) => interact(hw, d)), ...ledgeHop(hw), ...HEADWEAR.map((h) => walk(h).down[0])], 13);

// Item get, Debug Ball, throw.
c.label(12, y, "ITEM GET");
c.strip(12, y + 14, "grass", 1, 2, 3, [[itemGet(hw), 0, 0]]);
c.strip(72, y + 14, "grass", 1, 2, 1, [[itemGet(hw), 0, 0]]);
c.label(104, y, "TRAINER AND PORTRAIT 2X");
{
  const t: Sprite = blank(80, 84);
  blit(t, platform(), 0, 64);
  blit(t, trainer(hw), 0, 0);
  c.card(104, y + 14, t, 2);
}
c.card(280, y + 14, portrait(hw), 2);
c.label(452, y, "DEBUG BALL  AND OPENING");
c.card(452, y + 14, debugBall(), 4);
ballOpen().forEach((f, i) => c.card(524 + i * 76, y + 14, f, 3));
c.label(756, y, "BALL CATCH  SHAKE SHAKE SHAKE  THEN LOGGED");
ballCatch().forEach((f, i) => c.card(756 + i * 76, y + 14, f, 3));
y += 190;

c.label(12, y, "BACK SPRITE THROW  HOLD  WIND UP  THROW  RELEASE  FOLLOW THROUGH  3X AND 1X");
throwF.forEach((f, i) => {
  c.card(12 + i * 248, y + 14, f, 3);
  c.draw(f, 12 + i * 88, y + 262, 1);
});
y += 356;

// Three scene mock-ups that show the player.
const scenes: [string, Sprite][] = [];
{
  const s = screen();
  for (let ty = 0; ty < 10; ty++)
    for (let tx = 0; tx < 15; tx++)
      tile(s, tx, ty, ty === 6 || ty === 7 || (tx === 3 && (ty === 4 || ty === 5)) ? "path" : (tx * 7 + ty * 3) % 11 === 0 ? "flowers" : "grass");
  blit(s, house("navy", "LinkedIn"), 24, 0);
  for (const [x, y2] of [[160, -8], [192, -8], [208, 16], [0, 120], [176, 128], [208, 128]]) blit(s, tree(), x, y2);
  blit(s, npc("townsperson"), 168, 70);
  blit(s, walkF.right[1], 104, 82);
  scenes.push(["HOMETOWN", s]);
}
{
  const s = screen();
  battleField(s);
  blit(s, placeholder(72, 64), 140, 14);
  hpBox(s, 8, 8, "PLACEHOLDER", 18, 18, false);
  blit(s, backSprite(hw, 2), 12, 40);
  box(s, 0, 112, 143, 159, "battle");
  text(s, 10, 122, "A wild creature", "white", "slate");
  text(s, 10, 138, "appeared!", "white", "slate");
  box(s, 144, 112, 239, 159, "light");
  text(s, 152, 122, ">", "slate");
  text(s, 160, 122, "FIGHT", "slate");
  text(s, 204, 122, "LOG", "slate");
  text(s, 160, 138, "RUN", "slate");
  scenes.push(["WILD BATTLE", s]);
}
{
  const s = screen();
  for (let ty = 0; ty < 10; ty++) for (let tx = 0; tx < 15; tx++) tile(s, tx, ty, ty < 2 ? "wall" : "floor");
  const goods: Parameters<typeof shelf>[0][] = [
    [["teal", "water", "teal", "tealHi", "water", "teal"], ["gold", "orange", "gold", "orange", "gold", "orange"]],
    [["red", "redHi", "red", "redHi", "red", "redHi"], ["navy", "waterLo", "navy", "waterLo", "navy", "waterLo"]],
    [["grass", "grassLo", "grass", "grassLo", "grass", "grassLo"], ["sand", "sandLo", "sand", "sandLo", "sand", "sandLo"]],
  ];
  goods.forEach((g, i) => blit(s, shelf(g), 128 + i * 37, 0));
  text(s, 8, 6, "SKILLS MART", "navy", "gray1");
  blit(s, npc("shopkeeper"), 48, 20);
  blit(s, walkF.up[0], 56, 58);
  const cats = ["Networking & Troubleshooting", "Programming & Data", "Quantitative & Financial Analysis", "Professional", "Machine Learning & Embedded"];
  box(s, 0, 92, 239, 159, "light");
  cats.forEach((cat, i) => text(s, 18, 99 + i * 12, cat, "slate"));
  text(s, 9, 99, ">", "slate");
  scenes.push(["SKILLS MART", s]);
}
c.label(12, y - 2, "SCENES 240X160  3X");
y += 14;
scenes.forEach(([name, s], i) => {
  const x = 12 + (i % 2) * (SCREEN.w * 3 + 12);
  const sy = y + 18 + Math.floor(i / 2) * (SCREEN.h * 3 + 28);
  c.label(x, sy - 14, name);
  c.draw(s, x, sy, 3);
});

c.save("docs/review/sheet-model.png");
void placeholderMount;
