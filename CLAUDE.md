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

## Art rules
- The player character is final (phase 1, headphones version). Do not change its design.
- Palette: exactly 32 colours in src/art/palette.ts, at most 15 per sprite. New colours need Iyad's approval.
- Sizes: 16x16 tiles, 16x32 overworld characters, 80x80 portrait, trainer and battle sprites.
- Draw sprites in code with the helpers in src/art/draw.ts.
- Shading: 3 shades per material, light from the top-left, hue shifting (cooler shadows, warmer highlights), selective outlining. No pillow shading, no banding, no stray single pixels.
- Face: no pale band across the face, no vertical line down the nose, thin glasses with clear lenses, eyes always visible, beard shape wraps the mouth.
- Creatures are not designed yet: use the grey placeholders until their design round.
- Review sheets use whole-number, nearest-neighbour scaling only: npm run art:model, npm run art:scenes.

## Stack
Next.js (App Router, TypeScript), Phaser 3, Tiled maps, Zustand, Howler, Supabase, Vercel.

## Commands
npm run dev, npm run test, npm run build, npm run art:model, npm run art:scenes
