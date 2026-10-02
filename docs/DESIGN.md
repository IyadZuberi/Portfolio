# Portfolio Game: Full Design Plan

Oct 1, 2026

## Overview and principles

The portfolio is a Pokémon-style open-world game that is the whole site, built so any visitor can reach every link and the full CV within 10 seconds without playing. It presents Iyad Ullah Zuberi, a First Class Computer Systems Engineering graduate (Brunel University London, 2026), as a broad engineer across AI/ML, embedded and hardware, and systems, data and fintech.

1. **Nothing is gated.** The Esc menu, Quick Resume and Resume View always reach every link and all content.
2. **CV only.** Every fact comes from the current CV. Nothing is added or invented.
3. **Original IP.** No Nintendo sprites, names, music or logos. Characters, creatures and sound are original, in a similar style.
4. **Polished tone.** Dialogue is professional and useful. Jokes live only in easter eggs and creature flavour text.
5. **FireRed look.** Top-down 2D with 16px tiles, flat colours and a limited palette, like the original FireRed. Black and White-style depth is deliberately left out of the base build because it is riskier. A day/night tint and soft lighting can be added later as an optional polish layer.
6. **Claude builds, Iyad directs.** Art is generated in code from one fixed palette, so better art can be swapped in later without code changes.

Reference site: Bryan's portfolio (bryanleezh.dev). Keep its instant start, Game Boy-style controls hint and on-screen A/B buttons for touch. Go beyond it with richer visuals, real CV content and the Esc menu of links.

## Player journey

The quick path takes about 5 minutes and the full path about 15, and both start from the same title screen.

1. **Title screen.** Loads first as static HTML, before the game. Buttons: New Game, Continue, Quick Resume, Download CV.
2. **Intro.** A short skippable cutscene. The Lab guide says Iyad is a broad engineer across AI/ML, embedded/hardware, and systems/data/fintech. The player picks a starter.
3. **Hometown tutorial.** The rival picks the starter strong against the player's and starts a scripted first battle. The player gets Running Shoes. The guide explains the Esc menu.
4. **Route 1.** Tall grass with wild encounters, the first Skilldex entries, and a lake. Surf unlocks after 3 wild battles.
5. **Junction City.** Career Hall, Academy and Skills Mart, plus roads to the three gyms.
6. **Gyms.** At each: optional puzzle, trainer, leader, badge, case study. The first badge unlocks Fly.
7. **Champion's Hall.** Opens at 3 badges, when the sleeping Daemon wakes. A rival battle, then the Hall of Fame screen with the trainer card, contact buttons and CV download.
8. **Post-game.** Chess Island, hidden easter eggs and Skilldex completion.

## World map and locations

The world has a hometown in the south, a hub city in the middle, three gyms around it and a lake with an island. Every building holds content taken straight from the CV.

| Location | Where | Contents | Action |
| --- | --- | --- | --- |
| Home | Hometown | Profile summary, CV download (public version without phone number), mirror to toggle the cap | Download CV |
| Lab | Hometown | Starter pick (Voltling, Tensorlet, Packetpup), guide NPC, 60-second tour offer | Start tour |
| LinkedIn house | Hometown | Banner and door prompt | Opens linkedin.com/in/iyad-ullah-zuberi |
| GitHub house | Hometown | Banner and door prompt | Opens github.com/IyadZuberi |
| Contact Centre | Hometown | Nurse NPC, email, message form | Email or send message |
| Route 1 | Between towns | Tall grass, wild encounters, rival battle, lake | Surf unlocks here |
| Career Hall | Junction City | Three rooms, one per job (below) | Read entries |
| Academy | Junction City | Degree, dissertation, modules, societies (below) | Read entries |
| Skills Mart | Junction City | Five shelves, one per CV skill category (below) | Browse skills |
| AI Gym | West of the city | ECG explainable-AI dissertation (leader) | Badge + case study |
| Hardware Gym | North of the city | Oven controller (trainer), FPGA sequence detector (leader) | Badge + case study |
| Systems Gym | East of the city | Banking system (trainer), 5G video streaming (leader) | Badge + case study |
| Chess Island | In the lake | Chess puzzle that nods to the Chess Society | Needs Surf |
| Champion's Hall | Past the sleeping Daemon | Rival battle and Hall of Fame | Needs 3 badges |

**Career Hall rooms**

- **Ernst & Young, Data Analyst (Jul 2025 to Sep 2025).** SAP Analytics Cloud, 20,000+ data entries, 5 interactive dashboards using Smart Predict, findings presented to non-technical stakeholders.
- **Brunel Innovation Centre, Project Technical Assistant (Jun 2024 to May 2025, Cambridge UK).** Five funded research projects. Altium PCBs, DC-DC buck converters (12V and 5V rails, up to 3.6x battery cycle life), multi-channel EMG acquisition on STM32 and Arduino, PyTorch/CUDA segmentation pipelines with about 20% less network wiring.
- **Cloud Nebula Enterprises, Data Science Intern (Jun 2023 to Aug 2023).** Derivatives strategies backtested across 7TB of data, 10+ Python libraries, 100+ research papers synthesised.

**Academy**

BEng (Honours) Computer Systems Engineering with Placement, Brunel University London, Sep 2022 to May 2026. First Class, among the top of the cohort. Dissertation: Clinically Aligned Explainable AI for ECG Classification. Modules: Embedded Systems, Digital Systems Design, Microcontroller Principles, Applied AI & Machine Learning, Autonomous Systems Design, Data Networks & Security. Committee Member of Data Science Society, member of Tech Society, GDSC Brunel and Chess Society.

**Skills Mart shelves**

1. Networking & Troubleshooting
2. Programming & Data
3. Quantitative & Financial Analysis
4. Professional
5. Machine Learning & Embedded

Shelf contents are copied from the CV skills section word for word.

## Characters

The player is a pixel version of Iyad in an Ash-style trainer outfit, and every other character has a clear job in the portfolio.

**Player avatar spec (from the supplied photo)**

- Thick dark hair, swept back and up with a side part and short sides.
- Clear-framed square aviator glasses with a thin metal bridge.
- Full dark beard with a defined cheek line, plus a trimmed moustache.
- Warm medium-light skin tone, sturdy build.
- Outfit: cap, jacket and backpack in original colours (not Ash's), with a white collared shirt underneath as a nod to the photo.
- The cap is on by default. At 16×24 pixels the beard reads as a dark lower face and the glasses as a light bar across the eyes. A larger 64×64 portrait (trainer card, dialogue box) shows the full detail. The Home mirror toggles the cap off to show the hair.
- Animations: 4-direction idle, walk and run, plus a surf pose and a battle back-sprite.

**NPC roster**

| NPC | Where | Job |
| --- | --- | --- |
| Lab guide | Lab | Pitches Iyad as a broad engineer, offers the 60-second tour |
| Rival | Hometown, Route 1, Hall | Friendly rival: tutorial battle, mid-game battle, final battle |
| Nurse | Contact Centre | Heals the team, then offers email and the message form |
| Shopkeeper | Skills Mart | Walks through the five skill shelves |
| Three clerks | Career Hall | One per job, each in a workplace outfit |
| Academy dean | Academy | Degree, dissertation, modules, societies |
| Leader Saliency | AI Gym | Boss for the ECG explainable-AI project |
| Leader Solder | Hardware Gym | Boss for the FPGA sequence detector |
| Leader Latency | Systems Gym | Boss for the 5G streaming project |
| Gym trainers | Hardware and Systems Gyms | Oven controller and banking system |
| Chess player | Chess Island | Puzzle and easter egg |
| Townsfolk (3 to 5) | Hometown and Route 1 | Hints about controls, Surf, Fly and the Skilldex |

Dialogue is short, professional and useful. Each NPC either gives a fact from the CV or helps the player navigate.

## Creatures

All creatures are original, themed on engineering bugs and the skills on the CV. Logging one in the Skilldex reveals the CV skill it stands for.

**Starters (chosen at the Lab)**

| Starter | Theme | Moves |
| --- | --- | --- |
| Voltling | Hardware | Buck Converter, Debounce, Clock Divide, Pull-Up |
| Tensorlet | AI/ML | Backprop, Gradient Descent, Dropout, Saliency Beam |
| Packetpup | Systems and data | UDP Burst, Ping, Jitter Dodge, Packet Trace |

The choice changes flavour text and the rival's pick only. All three can win every battle.

**Wild creatures**

| Creature | Rarity | Where | Skill revealed in Skilldex |
| --- | --- | --- | --- |
| Jitterbug | Common | Route 1, Systems route | Throughput, latency and jitter analysis |
| Segfault | Common | Route 1 | C and C++ |
| Nullbat | Common | Route 1, AI route | Java and SQL |
| Overfitt | Common | Route 1, AI route | PyTorch, scikit-learn, TensorFlow, SHAP |
| Driftling | Uncommon | Hardware route | Band-pass filtering for signal drift |
| Deadlock | Uncommon | Systems route | Root-cause analysis |
| Glitchwing | Rare | Hardware route | Altium Designer and PCB design |
| Drawdown | Rare | Systems route | Derivatives strategy backtesting |
| Bufferfish | Rare | Lake (Surf) | TCP and UDP sockets |
| Moorebot | Very rare | Any grass, tiny chance | FPGA and VHDL (Moore FSM) |

**Encounter rules**

- Roughly one encounter per 8 to 12 steps in tall grass.
- Each route has its own spawn table (listed above).
- The Repel item and a Settings toggle turn encounters off.
- A Debug Ball logs a creature in the Skilldex. It never fails.

## Battles and gyms

Battles are quick, scripted-feeling and impossible to lose, and every gym round reveals one real fact from the CV.

**Battle rules**

- Turn-based with 3 or 4 moves and the options Fight, Log (Debug Ball) and Run. Run always works in wild battles.
- The player cannot lose. At 1 HP the creature survives, and "fainting" means waking up at the Contact Centre.
- Quick Battle auto-resolves a fight. Repel turns off wild encounters.

**Gym structure**

Each gym follows the same order: optional puzzle, trainer (where there is one), leader, badge, case study card. The case study card shows problem, approach, result and technologies. Repo and demo links are an optional field, empty for now because none are public yet.

| Gym | Trainer | Leader | Optional puzzle |
| --- | --- | --- | --- |
| AI Gym | None | Saliency: ECG explainable AI | Match ECG leads to labels |
| Hardware Gym | Oven controller | Solder: FPGA sequence detector | Walk an FSM through its states |
| Systems Gym | Banking and supermarket system | Latency: 5G video streaming | Route packets across a network grid |

**Leader rounds (facts from the CV)**

*Saliency, Explainable AI for Clinical ECG Classification (Oct 2025 to May 2026)*

1. Benchmarked 8 deep-learning architectures (3 original) on PTB-XL, 21,388 recordings, 80 checkpoints, about 175 GPU-hours on an NVIDIA RTX A6000.
2. Macro-AUROC 0.937 against the published 0.929 benchmark, with 8.9 times fewer parameters than comparable attention-based ResNets.
3. Seven XAI attribution methods in a 5-dimensional evaluation framework, including the first documented application of Guided Grad-CAM to ECG classification.
4. Explanations validated with a consultant cardiologist at 86.7% lead-correctness agreement, with Friedman, Nemenyi and bootstrap confidence-interval testing.

*Solder, FPGA Sequence Detector (Oct 2025)*

1. Moore finite-state machine in VHDL with a modular two-process architecture, multi-button debouncing and a clock divider.
2. Verified in Vivado simulation, then deployed to a Xilinx Artix-7 (Nexys Video) with a live hardware demonstration.
3. On-chip power analysis and accessibility (EDI) considerations for varying user interaction speeds.

*Latency, Real-Time Video Streaming and Target Tracking over 5G Edge Cloud (Nov 2025)*

1. Live camera feeds over UDP with a parallel TCP channel for motion feedback, across Raspberry Pis, a PC and a cloud VM.
2. Four network configurations benchmarked, including an Azure edge-cloud deployment and an edge-cloud-over-5G link.
3. Wireshark traces quantifying throughput, round-trip delay and jitter to compare edge and cloud processing.

**Trainer fights**

- *Oven Control System (Nov 2023 to Mar 2024).* PIC16F18877 programmed at register level in assembly plus C (XC8). One of two lead programmers in a 6-person team: keypad, heating-element control and temperature sensor.
- *Banking and Supermarket Management System (Sep 2023 to Jan 2024).* Java Swing, OOP, UML across two iterations, integrated through a shared class library.

## Progression and unlocks

Unlocks make exploring feel rewarding, but none of them gates content: the Esc menu and Resume View always work.

| Unlock | Trigger | Effect |
| --- | --- | --- |
| Running Shoes | From the start | Hold Shift or the B button to run |
| Surf | Win 3 wild battles | Cross the lake: shortcut to the gyms and access to Chess Island |
| Fly | First gym badge | Fast-travel map to any visited town |
| Itemfinder | Log 5 creatures | Highlights hidden Skilldex entries and easter eggs nearby |
| Badges | Beat each gym leader | Shown on the trainer card, three in total |
| Skilldex | Log creatures | Completion percentage, each entry linked to a CV skill |
| Daemon gate | Three badges | The sleeping Daemon wakes and clears the path to Champion's Hall |

**Saving.** Progress (position, badges, Skilldex, settings) autosaves to the browser, versioned so future updates never corrupt old saves. The title screen shows Continue when a save exists.

## Menus, UI and controls

The Esc menu is the fast lane: one key reaches every link, the CV and the full content without playing.

**Esc menu**

| Item | What it does |
| --- | --- |
| LinkedIn | Opens linkedin.com/in/iyad-ullah-zuberi |
| GitHub | Opens github.com/IyadZuberi |
| Download CV | Downloads the public CV (no phone number) |
| Email | Opens a mail link, with a copy-address fallback |
| Resume View | One-page plain HTML of the whole CV |
| Skilldex | Logged creatures and the skills they reveal |
| Badges | Gym badges and case study cards |
| Fly | Fast-travel map (after the first badge) |
| Stuck? | Returns the player to the Junction City spawn |
| Settings | Sound, text speed, text size, reduced motion, encounters on or off |

**Controls**

- Keyboard: arrows or WASD to move, Space or Enter for A, Esc or X for B, Shift to run.
- Touch: on-screen D-pad plus A and B buttons, in both portrait and landscape.
- Gamepad: optional support.

**Trainer card.** Name, avatar, summary line, badges and Skilldex percentage. Whether the real photo appears is an open decision (see the last section).

## Visitor scenarios and edge cases

Every visitor type has a path that works without friction, and every failure has a fallback.

| Scenario | Design response |
| --- | --- |
| 10-second skimmer | Title screen offers Quick Resume and Download CV before the game loads |
| 3-minute viewer | Lab guide offers a 60-second guided tour with captions |
| Full explorer | Whole game, autosave, Continue on return |
| Phone user | Touch D-pad and A/B, portrait and landscape layouts, large tap targets |
| Keyboard-only user | Every menu and prompt works without a mouse |
| Screen-reader user | Resume View is the equivalent experience, and dialogue is announced in a live region |
| Low-motion preference | Reduced-motion setting and respect for the OS preference: no screen shake, no heavy camera moves |
| No WebGL or weak device | Phaser renders with WebGL and falls back to Canvas, and a very weak device is sent straight to Resume View |
| Slow connection | Static title screen loads first, game loads behind a progress bar, interiors load lazily |
| Stuck player | "Stuck?" in the Esc menu |
| Dislikes battles | Repel, Quick Battle, skippable puzzles |
| Shared link | Deep links such as `/?at=hardware-gym` spawn the player at that door |
| Link preview | Open Graph image from the world, plus an indexable Resume View |
| Contact form | Success and error states, honeypot and rate limit against spam, copy-email fallback |
| Audio | Off by default, starts only after the first interaction, mute toggle always visible |
| Browser quirks | Pause when the tab is hidden, handle the back button and resize, optional fullscreen |
| Returning visitor | Versioned save, Continue button, option to reset |
| Save corrupted or outdated | Detect the version, offer a clean restart, never crash |

## Easter eggs

This is the only place for jokes, so the main path stays polished.

- Konami code makes creatures rain across the screen.
- A hidden `/dev/null` cave holds nothing, and says so.
- The PC in Home shows a README with the game's "known issues".
- The Nurse has a different joke each visit.
- The Academy bookshelf lists the degree's modules as book titles.
- Creature flavour text puns on each engineering bug (for example, Segfault leaves the battle "with a core dump").
- Talking to the Chess player three times unlocks a real chess puzzle.
- After the Hall of Fame, a secret post-game boss called The Job Market appears, and the player can't lose.

## Tech, art, audio and performance

The build uses Iyad's existing web stack, with one content file feeding both the game and the plain-HTML Resume View.

**Stack**

| Layer | Choice |
| --- | --- |
| App | Next.js (App Router) |
| World | Phaser 3 inside a Next.js client component, with Tiled maps (16px tiles) |
| State | Zustand, with versioned saves in browser storage |
| Movement | Tile-based, grid-locked, simple collision maps (no physics engine) |
| Audio | Howler |
| Contact form | Next.js route handler writing to Supabase, with an email notification |
| Hosting | Vercel |
| Testing | Playwright smoke tests: Esc menu links, Resume View, mobile viewport, deep links |

**Content model.** A single `content.json` holds every CV fact, link and dialogue line. The game, Resume View, Open Graph data and structured data (Person) all read from it. Each case study has an optional `links` field, empty for now.

**Art pipeline**

- One fixed palette (about 32 colours) shared by every asset.
- Sprites are drawn in code, packed into texture atlases and reviewed on contact sheets before use.
- Asset list (tiles 16×16, characters about 16×24, battle sprites 64×64): player (4 directions, idle, walk, run, surf, battle back), about 14 NPC sprites, 3 starters and 10 wild creatures (front and back), tiles (grass, tall grass, paths, water, trees, fences, flowers), 5 hometown buildings, 3 hub buildings, 3 gyms, the Hall, interiors, 4 battle backdrops, UI frames and the title logo.
- Better hand-drawn art can replace any sprite later by swapping the file. An optional polish layer (day/night tint, soft lighting, light depth effects) comes last, through Phaser's lighting and post effects, each with an off switch.

**Audio.** Original chiptune loops (title, hometown, route, hub city, gym, wild battle, gym battle, Hall of Fame) and sound effects (steps, bump, menu, confirm, heal jingle, badge fanfare), generated in code or taken from licensed free packs.

**Performance budgets**

- Title screen interactive in under 3 seconds on a typical 4G connection.
- Interiors and later areas load lazily.
- 60 fps on desktop and a stable frame rate on mid-range phones, with automatic quality fallback.

**Accessibility.** Keyboard play, screen-reader dialogue announcements, adjustable text size, reduced-motion support, colour-blind-safe UI, and Resume View as the fully accessible equivalent.

**Analytics.** Privacy-friendly only (page views, CV downloads, outbound link clicks), no personal tracking.

## Build phases

The build runs in eight phases, each ending in something that can be opened and tested, with placeholder art first and real art last.

| Phase | Deliverable | Done when |
| --- | --- | --- |
| 1. Style foundation | Palette, avatar sprite, sprite pipeline, contact sheet | Avatar reads clearly at game size and Iyad approves the look |
| 2. Engine | Grid movement, collisions, dialogue boxes, Esc menu, saves | Player walks a test map, and Esc shows all links |
| 3. Hometown and title | Title screen, Resume View, Home, Lab, LinkedIn, GitHub, Contact Centre | A visitor can reach CV, links and contact in under 10 seconds |
| 4. Route 1 and battles | Tall grass, wild battles, Skilldex, rival, Surf | Battles run end to end and cannot be lost |
| 5. Junction City | Career Hall, Academy, Skills Mart | Every CV job, degree fact and skill is readable in-game |
| 6. Gyms | Three gyms, puzzles, leaders, badges, case study cards, Fly | All five CV projects playable, puzzles skippable |
| 7. Finale and extras | Daemon gate, Champion's Hall, Hall of Fame, easter eggs | Full run from title to credits works |
| 8. Polish and launch | Art cleanup, optional day/night tint and lighting, audio, accessibility, performance, deep links, tests | Budgets met, Playwright tests pass, mobile and no-WebGL fallbacks verified |

## Building with Claude Code

Claude Code builds this one phase at a time, using this doc as the spec, while the chat keeps the plan. The steps below take you from nothing to phase 1.

**Setup**

1. Install the Claude desktop app for Windows, sign in, and open the **Code** tab ([desktop quickstart](https://code.claude.com/docs/en/desktop-quickstart)). The Code tab needs neither Node.js nor the CLI, but local sessions on Windows need Git for Windows, and the website itself needs Node.js (current LTS), so install both.
2. Create one folder, `C:\portfolio`, for everything. Inside it create `downloads` and `docs`. Set your browser's download location to `C:\portfolio\downloads`.
3. Save this doc's text as `C:\portfolio\docs\DESIGN.md`.
4. In the Code tab choose **Local**, click **Select folder**, and pick `C:\portfolio`.
5. Ask Claude Code to create `CLAUDE.md` with the rules below and to set up the Next.js project inside this folder, keeping `docs` and `downloads`. Then run phase 1.
6. Work one phase per session, test it in the browser, and commit when it passes.

**CLAUDE.md**

```markdown
# Portfolio game
Pokémon FireRed-style open-world portfolio for Iyad Ullah Zuberi.
Spec: docs/DESIGN.md. Follow it and ask before deviating.

## Rules
- Everything lives inside this folder (C:\portfolio). Never create files outside it.
- Downloads and source assets go in downloads/ (ignored by git). Finished game assets go in public/ or src/.
- All content comes from content.json, which mirrors the CV. Never invent facts.
- Nothing is gated: the Esc menu, Quick Resume and /resume must always reach every link and all content.
- Original art, names and music only. No Nintendo assets.
- FireRed style: 16px tiles, flat colours, one fixed palette in src/art/palette.ts.
- Work one phase at a time and stop at that phase's "Done when" criteria.
- Add a Playwright test for each phase. Commit when it passes.

## Stack
Next.js (App Router, TypeScript), Phaser 3, Tiled maps, Zustand, Howler, Supabase, Vercel.

## Commands
npm run dev, npm run test, npm run build
```

**First prompt (phase 1)**

```text
Read docs/DESIGN.md and CLAUDE.md. We are building phase 1 only: the style foundation. Create the fixed palette (about 32 colours). Draw the player avatar in FireRed style as defined in the Characters section: 16x24 sprite with 4 directions and walk frames, plus a 64x64 portrait. Render a contact sheet PNG I can review. Build nothing else. Stop when the contact sheet is ready and tell me where to open it.
```

**Prompt for every later phase**

```text
Build phase N from docs/DESIGN.md. Follow CLAUDE.md. Stop when the phase's "Done when" criteria are met, add the Playwright test, and tell me how to try it in the browser.
```

**Working tips**

- Review every sprite on a contact sheet before it goes into the game. If something looks off, fix the palette or the shapes, not the engine.
- Start a fresh session for each phase so the context stays small, and rely on `docs/DESIGN.md` and `CLAUDE.md` for memory.
- Keep all text in `content.json`, so the game and Resume View can never disagree.
- Paste screenshots of the game back into Claude Code when something looks wrong.
- Deploy to Vercel after phase 3, so there is a live site with the CV and links early. Connect your own domain once the portfolio is complete.

## Open decisions

Seven decisions are still open, and none blocks phase 1.

- [ ] Game title and region name
- [ ] Rival's name
- [ ] Domain name for the site
- [ ] Whether the trainer card shows the real photo or only the pixel avatar
- [ ] Public CV version without the phone number (the current CV lists it)
- [ ] Rewrite the CV profile line to match the broad pitch (it currently leans toward client-facing fintech)
- [ ] Public repos or demos for the five projects (none yet, so case study cards ship without links and the `links` field stays empty until they exist)
