// Every screen a visitor can reach, at the GBA size 240x160: npm run art:scenes -> docs/review/sheet-scenes.png
// All text comes from docs/DESIGN.md, which mirrors the CV.
import { ellipse, fill, line, put, ramps, rect, type Sprite } from "../src/art/draw.ts";
import { drawPlaceholderMount, placeholderMount } from "../src/art/creatures.ts";
import { ballCatch, ballOpen, debugBall } from "../src/art/items.ts";
import { DEFAULT_HEADWEAR, backSprite, interact, platform, portrait, surf, trainer, walk } from "../src/art/player.ts";
import { text, textWidth } from "../src/art/font.ts";
import { SCREEN, badge, battleField, blit, box, flyMap, furniture, hpBox, house, npc, placeholder, screen, shelf, tile, tree, type Tile } from "../src/art/world.ts";
import { canvas } from "./sheet.ts";

const hw = DEFAULT_HEADWEAR;
const walkF = walk(hw);
const panels: [string, Sprite][] = [];
const add = (name: string, s: Sprite) => panels.push([name, s]);

// --- shared screen pieces ---
const ground = (s: Sprite, pick: (tx: number, ty: number) => Tile) => {
  for (let ty = 0; ty < 10; ty++) for (let tx = 0; tx < 15; tx++) tile(s, tx, ty, pick(tx, ty));
};
const dialogue = (s: Sprite, lines: string[]) => {
  box(s, 2, 110, 237, 157, "light");
  lines.forEach((l, i) => text(s, 12, 120 + i * 17, l, "slate"));
};
const menu = (s: Sprite, x0: number, y0: number, x1: number, y1: number, items: string[], selected = 0, gap = 13) => {
  box(s, x0, y0, x1, y1, "light");
  items.forEach((it, i) => {
    if (i === selected) text(s, x0 + 7, y0 + 7 + i * gap, ">", "slate");
    text(s, x0 + 16, y0 + 7 + i * gap, it, "slate");
  });
};
const banner = (s: Sprite, y: number, title: string) => {
  fill(s, rect(0, y, 239, y + 14), ramps.navy, { tone: 1 }, false);
  line(s, 0, y + 14, 239, y + 14, "navyLo");
  text(s, 8, y + 3, title, "white", "navyLo");
};
// Foe and player platforms plus the two HP boxes, shared by every battle screen.
const battleBase = (s: Sprite, foe: Sprite | null, foeName: string) => {
  battleField(s);
  if (foe) blit(s, foe, 144, 16);
  hpBox(s, 8, 8, foeName, 18, 18, false);
};
const hometown = () => {
  const s = screen();
  ground(s, (tx, ty) => (ty === 6 || ty === 7 || (tx === 3 && (ty === 4 || ty === 5)) ? "path" : (tx * 7 + ty * 3) % 11 === 0 ? "flowers" : "grass"));
  blit(s, house("navy", "LinkedIn"), 24, 0);
  for (const [x, y] of [[160, -8], [192, -8], [208, 16], [0, 120], [176, 128], [208, 128]]) blit(s, tree(), x, y);
  return s;
};
const room = (s: Sprite) => ground(s, (_, ty) => (ty < 2 ? "wall" : "floor"));

// 1. Title screen.
{
  const s = screen();
  ground(s, (tx, ty) => (ty < 4 ? "grass" : ty < 5 ? "path" : (tx + ty) % 7 === 0 ? "flowers" : "grass"));
  for (const [x, y] of [[-8, 8], [200, 0], [216, 40]]) blit(s, tree(), x, y);
  fill(s, rect(0, 0, 239, 44), ramps.navy, { tone: 1 }, false);
  line(s, 0, 44, 239, 44, "navyLo");
  text(s, 12, 8, "IYAD ULLAH ZUBERI", "gold", "navyLo");
  text(s, 12, 24, "Computer Systems Engineer", "white", "navyLo");
  blit(s, trainer(hw), 168, 40);
  const buttons = ["New Game", "Continue", "Quick Resume", "Download CV"];
  buttons.forEach((b, i) => {
    const [x, y] = [10 + (i % 2) * 112, 62 + Math.floor(i / 2) * 28];
    box(s, x, y, x + 100, y + 22, "light");
    text(s, x + 50 - Math.floor(textWidth(b) / 2), y + 7, b, "slate");
  });
  text(s, 10, 124, "Nothing is gated: Esc opens every link.", "navyLo", null);
  text(s, 10, 140, "Arrows or WASD move. Space is A.", "navyLo", null);
  add("1 TITLE SCREEN", s);
}

// 2. Lab: the guide and the three starters on a table.
{
  const s = screen();
  room(s);
  blit(s, furniture("counter"), 72, 52);
  for (const x of [66, 102, 138]) blit(s, placeholder(32, 30), x, 24);
  blit(s, npc("guide"), 32, 34);
  blit(s, walkF.up[0], 112, 76);
  dialogue(s, ["Pick a partner. The three starters", "are not designed yet."]);
  add("2 LAB  CHOOSE A STARTER", s);
}

// 3. Hometown walking with an NPC line.
{
  const s = hometown();
  blit(s, npc("townsperson"), 136, 80);
  blit(s, interact(hw, "right"), 112, 80);
  dialogue(s, ["Hi! Press Esc any time to open the", "menu with every link and the CV."]);
  add("3 HOMETOWN  NPC DIALOGUE", s);
}

// 4. Home interior: the mirror toggles the cap, the PC holds the README.
{
  const s = screen();
  room(s);
  blit(s, furniture("bed"), 12, 36);
  blit(s, furniture("mirror"), 112, 20);
  blit(s, furniture("pc"), 176, 22);
  blit(s, walkF.up[0], 108, 52);
  blit(s, npc("townsperson"), 60, 40);
  dialogue(s, ["The mirror shows the cap on or off.", "The PC lists the known issues."]);
  add("4 HOME  MIRROR AND PC", s);
}

// 5. Contact Centre: the nurse heals the team.
{
  const s = screen();
  room(s);
  blit(s, furniture("counter"), 56, 46);
  blit(s, furniture("healer"), 96, 16);
  blit(s, npc("nurse"), 72, 18);
  blit(s, walkF.up[0], 104, 70);
  for (const [x, y] of [[100, 10], [116, 6], [132, 10]]) {
    fill(s, ellipse(x, y, 3, 3), ramps.gold, { tone: 0 }, false);
    fill(s, ellipse(x, y, 1, 1), ramps.shirt, { tone: 0 }, false);
  }
  dialogue(s, ["Your team is fully healed.", "Need my email or the message form?"]);
  add("5 CONTACT CENTRE  HEALING", s);
}

// 6. Wild battle: intro, throw, the creature appears, the command menu.
{
  const intro = screen();
  battleBase(intro, null, "PLACEHOLDER");
  blit(intro, backSprite(hw, 0), 12, 40);
  box(intro, 0, 112, 239, 159, "battle");
  text(intro, 10, 122, "The tall grass rustles...", "white", "slate");
  add("6A WILD BATTLE  INTRO", intro);

  const thrown = screen();
  battleBase(thrown, null, "PLACEHOLDER");
  blit(thrown, backSprite(hw, 2), 12, 40);
  blit(thrown, ballOpen()[1], 150, 30);
  box(thrown, 0, 112, 239, 159, "battle");
  text(thrown, 10, 122, "Go! Debug Ball!", "white", "slate");
  add("6B WILD BATTLE  THROW", thrown);

  const appear = screen();
  battleBase(appear, placeholder(72, 64), "PLACEHOLDER");
  blit(appear, backSprite(hw, 4), 12, 40);
  box(appear, 0, 112, 239, 159, "battle");
  text(appear, 10, 122, "A wild creature appeared!", "white", "slate");
  add("6C WILD BATTLE  CREATURE APPEARS", appear);

  const cmd = screen();
  battleBase(cmd, placeholder(72, 64), "PLACEHOLDER");
  blit(cmd, placeholder(64, 56), 28, 48);
  hpBox(cmd, 128, 72, "PLACEHOLDER", 20, 20, true);
  box(cmd, 0, 112, 143, 159, "battle");
  text(cmd, 10, 122, "What will", "white", "slate");
  text(cmd, 10, 138, "partner do?", "white", "slate");
  menu(cmd, 144, 112, 239, 159, ["FIGHT", "LOG", "RUN"], 0, 15);
  add("6D WILD BATTLE  COMMAND MENU", cmd);
}

// 7. Moves, damage and logging a creature in the Skilldex.
{
  const moves = screen();
  battleBase(moves, placeholder(72, 64), "PLACEHOLDER");
  blit(moves, placeholder(64, 56), 28, 48);
  hpBox(moves, 128, 72, "PLACEHOLDER", 20, 20, true);
  box(moves, 0, 112, 239, 159, "light");
  text(moves, 10, 122, ">", "slate");
  text(moves, 18, 122, "Buck Converter", "slate");
  text(moves, 128, 122, "Debounce", "slate");
  text(moves, 18, 140, "Clock Divide", "slate");
  text(moves, 128, 140, "Pull-Up", "slate");
  add("7A MOVE MENU", moves);

  const dmg = screen();
  battleField(dmg);
  blit(dmg, placeholder(72, 64), 144, 18);
  hpBox(dmg, 8, 8, "PLACEHOLDER", 5, 18, false);
  blit(dmg, placeholder(64, 56), 28, 48);
  hpBox(dmg, 128, 72, "PLACEHOLDER", 20, 20, true);
  box(dmg, 0, 112, 239, 159, "battle");
  text(dmg, 10, 122, "partner used Buck Converter!", "white", "slate");
  text(dmg, 10, 138, "creature lost some HP.", "white", "slate");
  add("7B DAMAGE MESSAGE", dmg);

  const logged = screen();
  battleBase(logged, null, "PLACEHOLDER");
  blit(logged, placeholder(64, 56), 28, 48);
  hpBox(logged, 128, 72, "PLACEHOLDER", 20, 20, true);
  blit(logged, ballCatch()[4], 164, 48);
  box(logged, 0, 112, 239, 159, "battle");
  text(logged, 10, 122, "Jitterbug was logged in the", "white", "slate");
  text(logged, 10, 138, "Skilldex! Throughput and jitter.", "white", "slate");
  add("7C LOGGED IN THE SKILLDEX", logged);
}

// 8. Waking up at the Contact Centre after fainting.
{
  const s = screen();
  room(s);
  blit(s, furniture("counter"), 56, 46);
  blit(s, furniture("healer"), 96, 16);
  blit(s, npc("nurse"), 72, 18);
  blit(s, walkF.down[0], 104, 66);
  dialogue(s, ["You hurried back to the Contact", "Centre. Your team is ready again."]);
  add("8 WAKE UP AFTER FAINTING", s);
}

// 9. Surf: the prompt, riding, and stepping back onto land.
{
  const lake = () => {
    const s = screen();
    ground(s, (tx) => (tx < 3 ? "grass" : tx < 5 ? "path" : tx === 5 ? "shore" : "water"));
    for (const [x, y] of [[-8, 0], [-8, 48], [8, 104]]) blit(s, tree(), x, y);
    return s;
  };
  const ask = lake();
  blit(ask, walkF.right[0], 64, 56);
  menu(ask, 176, 60, 231, 100, ["YES", "NO"], 0, 16);
  dialogue(ask, ["The water is calm.", "Want to Surf?"]);
  add("9A SURF PROMPT", ask);

  const riding = lake();
  blit(riding, surf(hw, "right", 0, 0, drawPlaceholderMount), 136, 48);
  add("9B SURFING ON THE LAKE", riding);

  const landing = lake();
  blit(landing, placeholderMount("left", 0), 104, 48);
  blit(landing, walkF.left[1], 64, 56);
  dialogue(landing, ["You stepped back onto dry land."]);
  add("9C BACK ON LAND", landing);
}

// 10. Skills Mart: the five CV skill categories.
{
  const s = screen();
  room(s);
  const goods: Parameters<typeof shelf>[0][] = [
    [["teal", "water", "teal", "tealHi", "water", "teal"], ["gold", "orange", "gold", "orange", "gold", "orange"]],
    [["red", "redHi", "red", "redHi", "red", "redHi"], ["navy", "waterLo", "navy", "waterLo", "navy", "waterLo"]],
    [["grass", "grassLo", "grass", "grassLo", "grass", "grassLo"], ["sand", "sandLo", "sand", "sandLo", "sand", "sandLo"]],
  ];
  goods.forEach((g, i) => blit(s, shelf(g), 128 + i * 37, 0));
  text(s, 8, 6, "SKILLS MART", "navy", "gray1");
  blit(s, npc("shopkeeper"), 48, 20);
  blit(s, furniture("counter"), 8, 38);
  blit(s, walkF.up[0], 56, 58);
  const cats = ["Networking & Troubleshooting", "Programming & Data", "Quantitative & Financial Analysis", "Professional", "Machine Learning & Embedded"];
  menu(s, 0, 92, 239, 159, cats, 0, 12);
  add("10 SKILLS MART  FIVE CV CATEGORIES", s);
}

// 11. Career Hall, Ernst & Young room.
{
  const s = screen();
  room(s);
  banner(s, 0, "CAREER HALL  -  Ernst & Young");
  blit(s, furniture("deskEY"), 136, 34);
  blit(s, npc("clerk"), 104, 30);
  blit(s, interact(hw, "right"), 72, 60);
  dialogue(s, ["Data Analyst, Jul-Sep 2025. SAP", "Analytics Cloud, 20,000+ entries."]);
  add("11 CAREER HALL  ERNST & YOUNG", s);
}

// 12. Gym: the challenge, the battle, the case study card, the badge.
{
  const gymFloor = () => {
    const s = screen();
    ground(s, (tx, ty) => (ty < 2 ? "wall" : (tx + ty) % 2 === 0 ? "floor" : "path"));
    return s;
  };
  const challenge = gymFloor();
  banner(challenge, 0, "AI GYM");
  blit(challenge, npc("leader"), 112, 36);
  blit(challenge, walkF.up[0], 112, 76);
  dialogue(challenge, ["Leader Saliency wants to battle!", "Explainable AI for clinical ECG."]);
  add("12A GYM  LEADER CHALLENGE", challenge);

  const fight = screen();
  battleBase(fight, placeholder(72, 64), "SALIENCY");
  blit(fight, placeholder(64, 56), 28, 48);
  hpBox(fight, 128, 72, "PLACEHOLDER", 20, 20, true);
  box(fight, 0, 112, 239, 159, "battle");
  text(fight, 10, 122, "Leader Saliency sent out", "white", "slate");
  text(fight, 10, 138, "a benchmark model!", "white", "slate");
  add("12B GYM BATTLE", fight);

  const card = screen();
  for (let y = 0; y < SCREEN.h; y++) for (let x = 0; x < SCREEN.w; x++) put(card, x, y, "grassHi");
  box(card, 4, 4, 235, 155, "light");
  text(card, 14, 12, "Explainable AI for ECG", "navy");
  line(card, 14, 24, 225, 24, "gray1");
  const facts = [
    "Problem: deep ECG models are accurate",
    "but clinicians cannot see the reasons.",
    "Result: macro-AUROC 0.937 against the",
    "published 0.929, 8.9x fewer parameters.",
    "Validated with a consultant cardiologist",
    "at 86.7% lead-correctness agreement.",
  ];
  facts.forEach((l, i) => text(card, 14, 32 + i * 14, l, "slate"));
  text(card, 14, 128, "PyTorch  SHAP  Grad-CAM  PTB-XL", "teal");
  add("12C GYM  CASE STUDY CARD", card);

  const got = screen();
  battleField(got);
  blit(got, trainer(hw), 80, 20);
  blit(got, platform(), 80, 84);
  blit(got, badge("teal"), 112, 60);
  for (const [x, y] of [[100, 54], [136, 58], [118, 44]]) {
    fill(got, rect(x - 3, y, x + 3, y), ramps.gold, { tone: 0 }, false);
    fill(got, rect(x, y - 3, x, y + 3), ramps.gold, { tone: 0 }, false);
  }
  box(got, 0, 112, 239, 159, "battle");
  text(got, 10, 122, "You received the Saliency Badge!", "white", "slate");
  text(got, 10, 138, "Fly is now available.", "white", "slate");
  add("12D GYM  BADGE RECEIVED", got);
}

// 13. Esc menu: every link, always reachable.
{
  const s = hometown();
  blit(s, walkF.down[0], 64, 72);
  const items = ["LinkedIn", "GitHub", "Download CV", "Email", "Resume View", "Skilldex", "Badges", "Fly", "Stuck?", "Settings"];
  menu(s, 126, 2, 238, 157, items, 0, 15);
  add("13 ESC MENU", s);
}

// 14. Trainer card.
{
  const s = screen();
  for (let y = 0; y < SCREEN.h; y++) for (let x = 0; x < SCREEN.w; x++) put(s, x, y, (x + y) % 16 < 8 ? "navy" : "navyLo");
  box(s, 6, 6, 233, 153, "light");
  text(s, 16, 14, "TRAINER CARD", "navy");
  blit(s, portrait(hw), 150, 26);
  text(s, 16, 34, "Iyad Ullah Zuberi", "slate");
  text(s, 16, 50, "BEng Computer Systems", "slate");
  text(s, 16, 64, "Brunel - First Class 2026", "slate");
  text(s, 16, 84, "Skilldex  60%", "slate");
  text(s, 16, 104, "BADGES", "slate");
  (["teal", "orange", "navy"] as const).forEach((t, i) => blit(s, badge(t), 16 + i * 22, 118));
  add("14 TRAINER CARD", s);
}

// 15. Fly map with the player marker.
{
  const s = screen();
  blit(s, flyMap(240, 160, [[72, 118, "Hometown"], [120, 78, "Junction City"], [56, 62, "AI Gym"], [168, 52, "Hardware Gym"], [188, 104, "Systems Gym"]]), 0, 0);
  banner(s, 0, "FLY  -  choose a destination");
  blit(s, walkF.down[0], 112, 48);
  box(s, 136, 110, 237, 150, "light");
  text(s, 144, 118, "Junction City", "slate");
  text(s, 144, 132, "A: Fly   B: Back", "slate");
  add("15 FLY MAP", s);
}

// 16. Hall of Fame with the contact buttons.
{
  const s = screen();
  for (let y = 0; y < SCREEN.h; y++) for (let x = 0; x < SCREEN.w; x++) put(s, x, y, y < 60 ? "navyLo" : "navy");
  for (const [x, y] of [[20, 14], [60, 8], [200, 20], [170, 10], [112, 6]]) {
    fill(s, rect(x - 2, y, x + 2, y), ramps.gold, { tone: 0 }, false);
    fill(s, rect(x, y - 2, x, y + 2), ramps.gold, { tone: 0 }, false);
  }
  text(s, 60, 16, "HALL OF FAME", "gold", "navyLo");
  blit(s, portrait(hw), 16, 32);
  text(s, 108, 36, "Iyad Ullah Zuberi", "white", "navyLo");
  text(s, 108, 50, "Broad engineer: AI/ML,", "gray1", "navyLo");
  text(s, 108, 62, "embedded and systems.", "gray1", "navyLo");
  (["3 Badges", "Skilldex 100%"] as const).forEach((t, i) => text(s, 108, 78 + i * 12, t, "gold", "navyLo"));
  ["LinkedIn", "GitHub", "Email", "Download CV"].forEach((b, i) => {
    const [x, y] = [8 + (i % 2) * 118, 114 + Math.floor(i / 2) * 22];
    box(s, x, y, x + 110, y + 18, "light");
    text(s, x + 55 - Math.floor(textWidth(b) / 2), y + 5, b, "slate");
  });
  add("16 HALL OF FAME", s);
}

// --- lay the panels out, two per row ---
const SCALE = 3;
const PW = SCREEN.w * SCALE;
const PH = SCREEN.h * SCALE;
const PAD = 12;
const W = PAD + 2 * (PW + PAD);
const H = PAD + Math.ceil(panels.length / 2) * (PH + 30) + 12;
const c = canvas(W, H);
c.fill(0, 0, W, H, "white");
panels.forEach(([name, s], i) => {
  const x = PAD + (i % 2) * (PW + PAD);
  const y = PAD + Math.floor(i / 2) * (PH + 30);
  c.label(x, y, name);
  c.draw(s, x, y + 16, SCALE);
});
c.save("docs/review/sheet-scenes.png");
console.log(`${panels.length} panels`);

// Keep the unused-import checker honest: debugBall is shown on the animation sheet.
void debugBall;
