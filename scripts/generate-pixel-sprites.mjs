import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GifWriter } from 'omggif';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const heroDir = path.join(rootDir, 'public', 'assets', 'char', 'hero');
const scholarDir = path.join(rootDir, 'public', 'assets', 'char', 'scholar');

fs.mkdirSync(heroDir, { recursive: true });
fs.mkdirSync(scholarDir, { recursive: true });

// Standard 2D Pixel Art Palette (matching user image)
const PALETTE = {
  trans: 0,
  outline: 0x161224,     // 1: Black/navy outline
  hairDark: 0x361810,    // 2: Dark brown shadow
  hairBase: 0x572A1F,    // 3: Warm brown hair
  hairLight: 0x753E2C,   // 4: Hair highlight
  skinBase: 0xF8C38B,    // 5: Warm peach skin
  skinShadow: 0xE2A66C,  // 6: Shaded skin
  blush: 0xEE8E7E,       // 7: Rosy blush
  eye: 0x161224,         // 8: Eye dark
  white: 0xFFFFFF,       // 9: Shirt white / eye glint
  whiteShadow: 0xD3D9E3, // 10: Shirt crease
  collarNavy: 0x24336B,  // 11: Uniform navy collar/cuffs
  collarLight: 0x35478C, // 12: Collar fold
  pocketBlue: 0x1F2C60,  // 13: Chest emblem
  pantsNavy: 0x1D264D,   // 14: Pants navy
  shoesDark: 0x11162E,   // 15: Shoes dark
  goldStar: 0xFBBF24,    // 16: Star gold
  starLight: 0xFDE68A,   // 17: Star highlight
  sparkleCyan: 0x38BDF8, // 18: Sparkle
};

const COLOR_TABLE = [
  0x000000, // 0 (transparent)
  PALETTE.outline,
  PALETTE.hairDark,
  PALETTE.hairBase,
  PALETTE.hairLight,
  PALETTE.skinBase,
  PALETTE.skinShadow,
  PALETTE.blush,
  PALETTE.eye,
  PALETTE.white,
  PALETTE.whiteShadow,
  PALETTE.collarNavy,
  PALETTE.collarLight,
  PALETTE.pocketBlue,
  PALETTE.pantsNavy,
  PALETTE.shoesDark,
  PALETTE.goldStar,
  PALETTE.starLight,
  PALETTE.sparkleCyan,
];

// Helper to pad palette to power of 2 (32 entries)
while (COLOR_TABLE.length < 32) {
  COLOR_TABLE.push(0x000000);
}

// Convert 28x40 ASCII grid to indexed pixel array
function parseAsciiGrid(lines, charMap, width = 28, height = 40) {
  const pixels = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const line = lines[y] || '';
    for (let x = 0; x < width; x++) {
      const ch = line[x] || '.';
      pixels[y * width + x] = charMap[ch] !== undefined ? charMap[ch] : 0;
    }
  }
  return pixels;
}

// Build SVG from indexed pixel array
function buildSvgFromPixels(pixels, width = 28, height = 40, targetSize = 240) {
  let rects = '';
  // Optimization: group identical adjacent horizontal pixels into wider rects
  for (let y = 0; y < height; y++) {
    let startX = -1;
    let currentColor = 0;
    for (let x = 0; x < width; x++) {
      const c = pixels[y * width + x];
      if (c !== currentColor) {
        if (currentColor !== 0 && startX !== -1) {
          const hex = '#' + COLOR_TABLE[currentColor].toString(16).padStart(6, '0');
          rects += `<rect x="${startX}" y="${y}" width="${x - startX}" height="1" fill="${hex}"/>\n`;
        }
        currentColor = c;
        startX = x;
      }
    }
    if (currentColor !== 0 && startX !== -1) {
      const hex = '#' + COLOR_TABLE[currentColor].toString(16).padStart(6, '0');
      rects += `<rect x="${startX}" y="${y}" width="${width - startX}" height="1" fill="${hex}"/>\n`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${targetSize}" height="${targetSize}" shape-rendering="crispEdges">
  <defs>
    <style>
      rect { shape-rendering: crispEdges; }
    </style>
  </defs>
  <!-- 2D Pixel Art Character -->
  ${rects}
</svg>`;
}

// Write multi-frame animated GIF
function writeAnimatedGif(filePath, frames, width = 28, height = 40, frameDelay = 35) {
  const buf = Buffer.alloc(width * height * frames.length * 4 + 4096);
  const gif = new GifWriter(buf, width, height, { loop: 0, palette: COLOR_TABLE });
  for (const frame of frames) {
    gif.addFrame(0, 0, width, height, frame, {
      palette: COLOR_TABLE,
      delay: frameDelay,
      transparent: 0,
      disposal: 2, // Restore to background
    });
  }
  const end = gif.end();
  fs.writeFileSync(filePath, buf.subarray(0, end));
  console.log(`✅ Generated GIF: ${path.relative(rootDir, filePath)} (${end} bytes, ${frames.length} frames)`);
}

// Character 1: Male University Student (Left character in user image)
// Key mapping:
// . = trans (0)
// # = outline (1)
// d = hairDark (2)
// h = hairBase (3)
// l = hairLight (4)
// s = skinBase (5)
// S = skinShadow (6)
// b = blush (7)
// e = eye (8)
// w = white (9)
// W = whiteShadow (10)
// c = collarNavy (11)
// C = collarLight (12)
// p = pocketBlue (13)
// P = pantsNavy (14)
// x = shoesDark (15)
// * = goldStar (16)
// + = starLight (17)
// ! = sparkleCyan (18)

const CMAP = {
  '.': 0,
  '#': 1,
  'd': 2,
  'h': 3,
  'l': 4,
  's': 5,
  'S': 6,
  'b': 7,
  'e': 8,
  'w': 9,
  'W': 10,
  'c': 11,
  'C': 12,
  'p': 13,
  'P': 14,
  'x': 15,
  '*': 16,
  '+': 17,
  '!': 18,
};

const MALE_IDLE_FRAME_0 = [
  "............................",
  "........############........",
  ".......#lddhhhhhhhdd#.......",
  "......#lhddhhhhhhhhhd#......",
  ".....#llhhhhhhhhhhhhhd#.....",
  ".....#lhhhhhhhhhhhhhhhd#....",
  "....#llhhhhhhhllhhhhhhhd#...",
  "....#lhhhhhhlllhhhhhhhhd#...",
  "....#hhddhhhhllhhhhddhhd#...",
  "....#hd#dhhhhhhhhhh#d#hd#...",
  "....#d#ss#hhhhhhhh#ss#d#....",
  "....#d#ssssssssssssss#d#....",
  ".....##ssssssssssssss##.....",
  "......#ssssssssssssss#......",
  "......#s#s#ssssss#s#s#......",
  "......#sewssssssssew#.......",
  "......#seessssssssees#......",
  "......#ssssssssssssss#......",
  "......#sbss#ssss#ssbs#......",
  ".......#ssssssssssss#.......",
  ".......#ssss####ssss#.......",
  "........#ssssssssss#........",
  ".........#ssssssss#.........",
  "......####csssssc####.......",
  ".....#ccww#csssc#wwcc#......",
  "....#cwwwww#ccc#wwwww#......",
  "....#cwwwwww#c#wwwwww#......",
  "....#cwwwpww###wwwwww#......",
  "....#cwwwww#sss#wwwww#......",
  "....#ccwwww#sss#wwwwc#......",
  ".....##cccc#sss#cccc##......",
  ".....#dssss#sss#ssssd#......",
  ".....#sssss#sss#sssss#......",
  ".....#sssss#####sssss#......",
  "......#####PPPPP#####.......",
  ".........#PPPPPPP#..........",
  ".........#PPPPPPP#..........",
  ".........#PPPPPPP#..........",
  ".........#PP#.#PP#..........",
  ".........#xx#.#xx#..........",
];

const MALE_IDLE_FRAME_1 = [
  // Breathing frame (shoulders rise 1px)
  "............................",
  "........############........",
  ".......#lddhhhhhhhdd#.......",
  "......#lhddhhhhhhhhhd#......",
  ".....#llhhhhhhhhhhhhhd#.....",
  ".....#lhhhhhhhhhhhhhhhd#....",
  "....#llhhhhhhhllhhhhhhhd#...",
  "....#lhhhhhhlllhhhhhhhhd#...",
  "....#hhddhhhhllhhhhddhhd#...",
  "....#hd#dhhhhhhhhhh#d#hd#...",
  "....#d#ss#hhhhhhhh#ss#d#....",
  "....#d#ssssssssssssss#d#....",
  ".....##ssssssssssssss##.....",
  "......#ssssssssssssss#......",
  "......#s#s#ssssss#s#s#......",
  "......#sewssssssssew#.......",
  "......#seessssssssees#......",
  "......#ssssssssssssss#......",
  "......#sbss#ssss#ssbs#......",
  ".......#ssssssssssss#.......",
  ".......#ssss####ssss#.......",
  "........#ssssssssss#........",
  ".....#####csssssc#####......",
  "....#ccwwww#csssc#wwwwcc#...",
  "....#cwwwww#ccc#wwwww#......",
  "....#cwwwwww#c#wwwwww#......",
  "....#cwwwpww###wwwwww#......",
  "....#cwwwww#sss#wwwww#......",
  "....#ccwwww#sss#wwwwc#......",
  ".....##cccc#sss#cccc##......",
  ".....#dssss#sss#ssssd#......",
  ".....#sssss#sss#sssss#......",
  ".....#sssss#####sssss#......",
  "......#####PPPPP#####.......",
  ".........#PPPPPPP#..........",
  ".........#PPPPPPP#..........",
  ".........#PPPPPPP#..........",
  ".........#PP#.#PP#..........",
  ".........#xx#.#xx#..........",
  "............................",
];

const MALE_IDLE_FRAME_2 = [
  // Blink frame
  "............................",
  "........############........",
  ".......#lddhhhhhhhdd#.......",
  "......#lhddhhhhhhhhhd#......",
  ".....#llhhhhhhhhhhhhhd#.....",
  ".....#lhhhhhhhhhhhhhhhd#....",
  "....#llhhhhhhhllhhhhhhhd#...",
  "....#lhhhhhhlllhhhhhhhhd#...",
  "....#hhddhhhhllhhhhddhhd#...",
  "....#hd#dhhhhhhhhhh#d#hd#...",
  "....#d#ss#hhhhhhhh#ss#d#....",
  "....#d#ssssssssssssss#d#....",
  ".....##ssssssssssssss##.....",
  "......#ssssssssssssss#......",
  "......#s#s#ssssss#s#s#......",
  "......#ssssssssssssss#......",
  "......#s##ssssssss##s#......",
  "......#ssssssssssssss#......",
  "......#sbss#ssss#ssbs#......",
  ".......#ssssssssssss#.......",
  ".......#ssss####ssss#.......",
  "........#ssssssssss#........",
  ".........#ssssssss#.........",
  "......####csssssc####.......",
  ".....#ccww#csssc#wwcc#......",
  "....#cwwwww#ccc#wwwww#......",
  "....#cwwwwww#c#wwwwww#......",
  "....#cwwwpww###wwwwww#......",
  "....#cwwwww#sss#wwwww#......",
  "....#ccwwww#sss#wwwwc#......",
  ".....##cccc#sss#cccc##......",
  ".....#dssss#sss#ssssd#......",
  ".....#sssss#sss#sssss#......",
  ".....#sssss#####sssss#......",
  "......#####PPPPP#####.......",
  ".........#PPPPPPP#..........",
  ".........#PPPPPPP#..........",
  ".........#PPPPPPP#..........",
  ".........#PP#.#PP#..........",
  ".........#xx#.#xx#..........",
];

// Victory Celebration (get_star) for Male Student
const MALE_STAR_FRAME_0 = [
  "............+***+...........",
  "..........+*******+.........",
  "..........!**+++**!.........",
  "............+***+...........",
  "..............#.............",
  "........############........",
  ".......#lddhhhhhhhdd#.......",
  "......#lhddhhhhhhhhhd#......",
  ".....#llhhhhhhhhhhhhhd#.....",
  ".....#lhhhhhhhhhhhhhhhd#....",
  "....#llhhhhhhhllhhhhhhhd#...",
  "....#lhhhhhhlllhhhhhhhhd#...",
  "....#hhddhhhhllhhhhddhhd#...",
  "....#hd#dhhhhhhhhhh#d#hd#...",
  "....#d#ss#hhhhhhhh#ss#d#....",
  "....#d#ssssssssssssss#d#....",
  ".....##ssssssssssssss##.....",
  "......#ssssssssssssss#......",
  "......#s##ssssssss##s#......",
  "......#seessssssssees#......",
  "......#sbss#ssss#ssbs#......",
  ".......#sss#ssss#sss#.......",
  ".......#ssss####ssss#.......",
  "....###..#ssssssss#..###....",
  "...#sss#..#cssssc#..#sss#...",
  "...#scc#.#cwwwwwwc#.#ccs#...",
  "....#ww###wwwwwwww###ww#....",
  ".....#wwwwwwwwwwwwwwww#.....",
  "......#wwwwwwwwwwwwww#......",
  "......#cwwwwwwwwwwwwc#......",
  ".......#cccccccccccc#.......",
  "........#PPPPPPPPPP#........",
  "........#PPPPPPPPPP#........",
  ".........#PPPPPPPP#.........",
  ".........#PPPPPPPP#.........",
  "..........#PPPPPP#..........",
  "..........#PP##PP#..........",
  "..........#PP##PP#..........",
  "..........#xx##xx#..........",
  "............................",
];

const MALE_STAR_FRAME_1 = [
  "............!***!...........",
  "..........!*+++++*!.........",
  ".........+***+++***+........",
  "..........!*+++++*!.........",
  "............!***!...........",
  "........############........",
  ".......#lddhhhhhhhdd#.......",
  "......#lhddhhhhhhhhhd#......",
  ".....#llhhhhhhhhhhhhhd#.....",
  ".....#lhhhhhhhhhhhhhhhd#....",
  "....#llhhhhhhhllhhhhhhhd#...",
  "....#lhhhhhhlllhhhhhhhhd#...",
  "....#hhddhhhhllhhhhddhhd#...",
  "....#hd#dhhhhhhhhhh#d#hd#...",
  "....#d#ss#hhhhhhhh#ss#d#....",
  "....#d#ssssssssssssss#d#....",
  ".....##ssssssssssssss##.....",
  "......#ssssssssssssss#......",
  "......#s##ssssssss##s#......",
  "......#seessssssssees#......",
  "......#sbss#ssss#ssbs#......",
  ".......#sss#ssss#sss#.......",
  ".......#ssss####ssss#.......",
  "...####..#ssssssss#..####...",
  "..#ssss#..#cssssc#..#ssss#..",
  "..#scc#..#cwwwwwwc#..#ccs#..",
  "...#ww###wwwwwwww###ww#.....",
  "....#wwwwwwwwwwwwwwww#......",
  ".....#wwwwwwwwwwwwww#.......",
  ".....#cwwwwwwwwwwwwc#.......",
  "......#cccccccccccc#........",
  ".......#PPPPPPPPPP#.........",
  ".......#PPPPPPPPPP#.........",
  "........#PPPPPPPP#..........",
  "........#PPPPPPPP#..........",
  ".........#PPPPPP#...........",
  ".........#PP##PP#...........",
  ".........#xx##xx#...........",
  "............................",
  "............................",
];

// Character 2: Female University Student (Right character in user image)
// With iconic center parted bangs and side braid ponytail cascading down her left
const FEMALE_IDLE_FRAME_0 = [
  "............................",
  "........############........",
  ".......#lddhhhhhhhdd#.......",
  "......#lhddhhhhhhhhhd#......",
  ".....#llhhhhhhhhhhhhhd#.....",
  ".....#lhhhhhh##hhhhhhhd#....",
  "....#llhhhhh#ss#hhhhhhhd#...",
  "....#lhhhhhh#ss#hhhhhhhhd#..",
  "....#hhddhhh#ss#hhhddhhhd#..",
  "....#hd#dhhh#ss#hhh#d#hd#...",
  "....#d#ss#hh#ss#hh#ss#d#....",
  "....#d#ssssssssssssss#d#....",
  ".....##ssssssssssssss##.....",
  "......#ssssssssssssss#..#h#.",
  "......#s#s#ssssss#s#s#.#hhd#",
  "......#sewssssssssew#..#hdd#",
  "......#seessssssssees#.#hhd#",
  "......#ssssssssssssss#..#hd#",
  "......#sbss######ssbs#..#hd#",
  ".......#sss#ssss#sss#...#hd#",
  ".......#ssss####ssss#...#hd#",
  "........#ssssssssss#...#hhd#",
  ".........#ssssssss#....#hhd#",
  "......####csssssc####..#hdd#",
  ".....#ccww#csssc#wwcc#..#hd#",
  "....#cwwwww#ccc#wwwww#..#hd#",
  "....#cwwwwww#c#wwwwww#..#hd#",
  "....#cwwwpww###wwwwww#..#hd#",
  "....#cwwwww#sss#wwwww#..#hd#",
  "....#ccwwww#sss#wwwwc#..#h#.",
  ".....##cccc#sss#cccc##..###.",
  ".....#dssss#sss#ssssd#......",
  ".....#sssss#sss#sssss#......",
  ".....#sssss#####sssss#......",
  "......#####PPPPP#####.......",
  ".........#PPPPPPP#..........",
  ".........#PPPPPPP#..........",
  ".........#PPPPPPP#..........",
  ".........#PP#.#PP#..........",
  ".........#xx#.#xx#..........",
];

const FEMALE_IDLE_FRAME_1 = [
  // Gentle breathing / braid swing
  "............................",
  "........############........",
  ".......#lddhhhhhhhdd#.......",
  "......#lhddhhhhhhhhhd#......",
  ".....#llhhhhhhhhhhhhhd#.....",
  ".....#lhhhhhh##hhhhhhhd#....",
  "....#llhhhhh#ss#hhhhhhhd#...",
  "....#lhhhhhh#ss#hhhhhhhhd#..",
  "....#hhddhhh#ss#hhhddhhhd#..",
  "....#hd#dhhh#ss#hhh#d#hd#...",
  "....#d#ss#hh#ss#hh#ss#d#....",
  "....#d#ssssssssssssss#d#....",
  ".....##ssssssssssssss##.....",
  "......#ssssssssssssss#..#h#.",
  "......#s#s#ssssss#s#s#.#hhd#",
  "......#sewssssssssew#..#hdd#",
  "......#seessssssssees#.#hhd#",
  "......#ssssssssssssss#..#hd#",
  "......#sbss######ssbs#..#hd#",
  ".......#sss#ssss#sss#...#hd#",
  ".......#ssss####ssss#...#hd#",
  "........#ssssssssss#....#hd#",
  ".....#####csssssc#####..#hd#",
  "....#ccwwww#csssc#wwwwcc#hd#",
  "....#cwwwww#ccc#wwwww#.#hhd#",
  "....#cwwwwww#c#wwwwww#.#hdd#",
  "....#cwwwpww###wwwwww#..#hd#",
  "....#cwwwww#sss#wwwww#..#hd#",
  "....#ccwwww#sss#wwwwc#..#h#.",
  ".....##cccc#sss#cccc##..###.",
  ".....#dssss#sss#ssssd#......",
  ".....#sssss#sss#sssss#......",
  ".....#sssss#####sssss#......",
  "......#####PPPPP#####.......",
  ".........#PPPPPPP#..........",
  ".........#PPPPPPP#..........",
  ".........#PPPPPPP#..........",
  ".........#PP#.#PP#..........",
  ".........#xx#.#xx#..........",
  "............................",
];

const FEMALE_IDLE_FRAME_2 = [
  // Female student blink
  "............................",
  "........############........",
  ".......#lddhhhhhhhdd#.......",
  "......#lhddhhhhhhhhhd#......",
  ".....#llhhhhhhhhhhhhhd#.....",
  ".....#lhhhhhh##hhhhhhhd#....",
  "....#llhhhhh#ss#hhhhhhhd#...",
  "....#lhhhhhh#ss#hhhhhhhhd#..",
  "....#hhddhhh#ss#hhhddhhhd#..",
  "....#hd#dhhh#ss#hhh#d#hd#...",
  "....#d#ss#hh#ss#hh#ss#d#....",
  "....#d#ssssssssssssss#d#....",
  ".....##ssssssssssssss##.....",
  "......#ssssssssssssss#..#h#.",
  "......#s#s#ssssss#s#s#.#hhd#",
  "......#ssssssssssssss#.#hdd#",
  "......#s##ssssssss##s#.#hhd#",
  "......#ssssssssssssss#..#hd#",
  "......#sbss######ssbs#..#hd#",
  ".......#sss#ssss#sss#...#hd#",
  ".......#ssss####ssss#...#hd#",
  "........#ssssssssss#...#hhd#",
  ".........#ssssssss#....#hhd#",
  "......####csssssc####..#hdd#",
  ".....#ccww#csssc#wwcc#..#hd#",
  "....#cwwwww#ccc#wwwww#..#hd#",
  "....#cwwwwww#c#wwwwww#..#hd#",
  "....#cwwwpww###wwwwww#..#hd#",
  "....#cwwwww#sss#wwwww#..#hd#",
  "....#ccwwww#sss#wwwwc#..#h#.",
  ".....##cccc#sss#cccc##..###.",
  ".....#dssss#sss#ssssd#......",
  ".....#sssss#sss#sssss#......",
  ".....#sssss#####sssss#......",
  "......#####PPPPP#####.......",
  ".........#PPPPPPP#..........",
  ".........#PPPPPPP#..........",
  ".........#PPPPPPP#..........",
  ".........#PP#.#PP#..........",
  ".........#xx#.#xx#..........",
];

// Victory Celebration for Female Student
const FEMALE_STAR_FRAME_0 = [
  "............+***+...........",
  "..........+*******+.........",
  "..........!**+++**!.........",
  "............+***+...........",
  "..............#.............",
  "........############........",
  ".......#lddhhhhhhhdd#.......",
  "......#lhddhhhhhhhhhd#......",
  ".....#llhhhhhhhhhhhhhd#.....",
  ".....#lhhhhhh##hhhhhhhd#....",
  "....#llhhhhh#ss#hhhhhhhd#...",
  "....#lhhhhhh#ss#hhhhhhhhd#..",
  "....#hhddhhh#ss#hhhddhhhd#..",
  "....#hd#dhhh#ss#hhh#d#hd#...",
  "....#d#ss#hh#ss#hh#ss#d#....",
  "....#d#ssssssssssssss#d#.#h#",
  ".....##ssssssssssssss##.#hhd",
  "......#ssssssssssssss#..#hdd",
  "......#s##ssssssss##s#..#hhd",
  "......#seessssssssees#..#hd#",
  "......#sbss######ssbs#..#hd#",
  ".......#sss#ssss#sss#...#hd#",
  ".......#ssss####ssss#...#hd#",
  "....###..#ssssssss#..###.###",
  "...#sss#..#cssssc#..#sss#...",
  "...#scc#.#cwwwwwwc#.#ccs#...",
  "....#ww###wwwwwwww###ww#....",
  ".....#wwwwwwwwwwwwwwww#.....",
  "......#wwwwwwwwwwwwww#......",
  "......#cwwwwwwwwwwwwc#......",
  ".......#cccccccccccc#.......",
  "........#PPPPPPPPPP#........",
  "........#PPPPPPPPPP#........",
  ".........#PPPPPPPP#.........",
  ".........#PPPPPPPP#.........",
  "..........#PPPPPP#..........",
  "..........#PP##PP#..........",
  "..........#PP##PP#..........",
  "..........#xx##xx#..........",
  "............................",
];

const FEMALE_STAR_FRAME_1 = [
  "............!***!...........",
  "..........!*+++++*!.........",
  ".........+***+++***+........",
  "..........!*+++++*!.........",
  "............!***!...........",
  "........############........",
  ".......#lddhhhhhhhdd#.......",
  "......#lhddhhhhhhhhhd#......",
  ".....#llhhhhhhhhhhhhhd#.....",
  ".....#lhhhhhh##hhhhhhhd#....",
  "....#llhhhhh#ss#hhhhhhhd#...",
  "....#lhhhhhh#ss#hhhhhhhhd#..",
  "....#hhddhhh#ss#hhhddhhhd#..",
  "....#hd#dhhh#ss#hhh#d#hd#...",
  "....#d#ss#hh#ss#hh#ss#d#....",
  "....#d#ssssssssssssss#d#.#h#",
  ".....##ssssssssssssss##.#hhd",
  "......#ssssssssssssss#..#hdd",
  "......#s##ssssssss##s#..#hhd",
  "......#seessssssssees#..#hd#",
  "......#sbss######ssbs#..#hd#",
  ".......#sss#ssss#sss#...#hd#",
  ".......#ssss####ssss#...#hd#",
  "...####..#ssssssss#..####.##",
  "..#ssss#..#cssssc#..#ssss#..",
  "..#scc#..#cwwwwwwc#..#ccs#..",
  "...#ww###wwwwwwww###ww#.....",
  "....#wwwwwwwwwwwwwwww#......",
  ".....#wwwwwwwwwwwwww#.......",
  ".....#cwwwwwwwwwwwwc#.......",
  "......#cccccccccccc#........",
  ".......#PPPPPPPPPP#.........",
  ".......#PPPPPPPPPP#.........",
  "........#PPPPPPPP#..........",
  "........#PPPPPPPP#..........",
  ".........#PPPPPP#...........",
  ".........#PP##PP#...........",
  ".........#xx##xx#...........",
  "............................",
  "............................",
];

// Compile frames
const heroIdleFrames = [
  parseAsciiGrid(MALE_IDLE_FRAME_0, CMAP),
  parseAsciiGrid(MALE_IDLE_FRAME_1, CMAP),
  parseAsciiGrid(MALE_IDLE_FRAME_0, CMAP),
  parseAsciiGrid(MALE_IDLE_FRAME_2, CMAP),
];

const heroStarFrames = [
  parseAsciiGrid(MALE_STAR_FRAME_0, CMAP),
  parseAsciiGrid(MALE_STAR_FRAME_1, CMAP),
  parseAsciiGrid(MALE_STAR_FRAME_0, CMAP),
  parseAsciiGrid(MALE_STAR_FRAME_1, CMAP),
];

const scholarIdleFrames = [
  parseAsciiGrid(FEMALE_IDLE_FRAME_0, CMAP),
  parseAsciiGrid(FEMALE_IDLE_FRAME_1, CMAP),
  parseAsciiGrid(FEMALE_IDLE_FRAME_0, CMAP),
  parseAsciiGrid(FEMALE_IDLE_FRAME_2, CMAP),
];

const scholarStarFrames = [
  parseAsciiGrid(FEMALE_STAR_FRAME_0, CMAP),
  parseAsciiGrid(FEMALE_STAR_FRAME_1, CMAP),
  parseAsciiGrid(FEMALE_STAR_FRAME_0, CMAP),
  parseAsciiGrid(FEMALE_STAR_FRAME_1, CMAP),
];

// Write GIF files
writeAnimatedGif(path.join(heroDir, 'main.gif'), heroIdleFrames, 28, 40, 50);
writeAnimatedGif(path.join(heroDir, 'get_star.gif'), heroStarFrames, 28, 40, 30);
writeAnimatedGif(path.join(scholarDir, 'main.gif'), scholarIdleFrames, 28, 40, 50);
writeAnimatedGif(path.join(scholarDir, 'get_star.gif'), scholarStarFrames, 28, 40, 30);

// Write SVG files (crisp vector pixel art matching frame 0, fully compatible with existing SVG loaders)
fs.writeFileSync(path.join(heroDir, 'main.svg'), buildSvgFromPixels(heroIdleFrames[0], 28, 40, 240), 'utf-8');
fs.writeFileSync(path.join(heroDir, 'get_star.svg'), buildSvgFromPixels(heroStarFrames[0], 28, 40, 240), 'utf-8');
fs.writeFileSync(path.join(scholarDir, 'main.svg'), buildSvgFromPixels(scholarIdleFrames[0], 28, 40, 240), 'utf-8');
fs.writeFileSync(path.join(scholarDir, 'get_star.svg'), buildSvgFromPixels(scholarStarFrames[0], 28, 40, 240), 'utf-8');

console.log('🎉 Successfully created all 2D pixel characters in both .gif and .svg formats!');
