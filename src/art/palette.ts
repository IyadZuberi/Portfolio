// The one fixed palette for every asset in the game, 32 colours.
// Sprites reference colours by key, so recolouring here updates every asset.
// Ramps are hue-shifted: shadows lean cooler (blue/purple), highlights warmer (yellow). Light comes from the top-left.
// Character sprites use at most 15 of these colours each.
export const palette = {
  // neutrals
  ink: "#1c1830", // darkest outline, shadow side only
  white: "#f8f8f0",
  gray1: "#c8c8d8",
  gray3: "#7878a0",
  slate: "#484868", // glasses frames, trousers light
  charcoal: "#2c2c48", // trousers

  // skin (warm medium-light)
  skinHi: "#fce0b0",
  skin: "#e8a878",
  skinLo: "#b06858", // also the backpack's shadow

  // hair and beard
  hairHi: "#8c6440",
  hair: "#503428",
  hairLo: "#2c1a28",

  // outfit and accents: teal outfit, crimson roofs, navy UI
  tealHi: "#58c090",
  teal: "#1c7c68",
  tealLo: "#104458",
  redHi: "#f88058",
  red: "#d03040",
  redLo: "#801850",
  navy: "#304890", // light end is waterLo
  navyLo: "#201c58",
  orange: "#e88830", // backpack, Bufferfish; light end is gold
  orangeLo: "#a84838",
  gold: "#f8d848", // badge, highlights

  // grass: light yellow-green so the teal outfit stands out
  grassHi: "#e8f8a8",
  grass: "#c0e070",
  grassLo: "#78b060",

  // water (also the Debug Ball)
  waterHi: "#b8e8f8",
  water: "#58a0e8",
  waterLo: "#3858c0",

  // sand, paths, floors, the battle platform
  sandHi: "#f8e8b8",
  sand: "#d8c088",
  sandLo: "#a07868",
} as const;

export type ColourKey = keyof typeof palette;
