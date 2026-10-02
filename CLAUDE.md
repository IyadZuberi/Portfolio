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
