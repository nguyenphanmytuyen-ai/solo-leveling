import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GifWriter } from 'omggif';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const gearDir = path.join(rootDir, 'public', 'assets', 'gear');
fs.mkdirSync(gearDir, { recursive: true });

// Standard 2D Pixel Palette
const PALETTE = [
  0x000000, // 0 transparent
  0x161224, // 1 outline / black
  0xFFFFFF, // 2 white
  0xEF4444, // 3 red
  0xF59E0B, // 4 gold / amber
  0x10B981, // 5 green
  0x06B6D4, // 6 cyan
  0x3B82F6, // 7 blue
  0x8B5CF6, // 8 violet
  0x78350F, // 9 brown
  0xD97706, // 10 warm yellow
  0xF3F4F6, // 11 light grey
  0x4B5563, // 12 dark grey
  0xF472B6, // 13 pink
  0xFDE047, // 14 bright yellow
  0x1E1B4B, // 15 deep indigo
];
while (PALETTE.length < 32) PALETTE.push(0x000000);

function parseGrid(lines, map, w, h) {
  const p = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const l = lines[y] || '';
    for (let x = 0; x < w; x++) {
      const ch = l[x] || '.';
      p[y * w + x] = map[ch] !== undefined ? map[ch] : 0;
    }
  }
  return p;
}

function writeGif(filePath, frames, w, h, delay = 40) {
  const buf = Buffer.alloc(w * h * frames.length * 4 + 4096);
  const gif = new GifWriter(buf, w, h, { loop: 0, palette: PALETTE });
  for (const f of frames) {
    gif.addFrame(0, 0, w, h, f, { palette: PALETTE, delay, transparent: 0, disposal: 2 });
  }
  const end = gif.end();
  fs.writeFileSync(filePath, buf.subarray(0, end));
  console.log(`Generated: ${path.relative(rootDir, filePath)}`);
}

// 1. Pixel Coffee Cup (with animated steam!) 16x16
const CMAP = {
  '.': 0, '#': 1, 'w': 2, 'r': 3, 'g': 4, 'c': 6, 'b': 7, 'v': 8, 'o': 9, 'y': 10, 'l': 11, 'd': 12, 'p': 13, 'Y': 14, 'I': 15
};

const COFFEE_F0 = [
  "................",
  "....#...#.......",
  ".....#...#......",
  "......#...#.....",
  "................",
  "...###########..",
  "...#wwwwwwwww#..",
  "...#w#wwwww#w#..",
  "...#w#wwwww#w##.",
  "...#wwwwwwwww#.#",
  "...#wroooooow###",
  "...#wooooooow#..",
  "...#wwwwwwwww#..",
  "....#########...",
  "................",
  "................",
];

const COFFEE_F1 = [
  "................",
  ".....#...#......",
  "....#...#.......",
  ".....#...#......",
  "................",
  "...###########..",
  "...#wwwwwwwww#..",
  "...#w#wwwww#w#..",
  "...#w#wwwww#w##.",
  "...#wwwwwwwww#.#",
  "...#wroooooow###",
  "...#wooooooow#..",
  "...#wwwwwwwww#..",
  "....#########...",
  "................",
  "................",
];

// 2. Graduation Cap (Mũ Cử Nhân) 24x16
const CAP_F0 = [
  "........................",
  "...........#............",
  "........#######.........",
  ".....#############......",
  "..###################...",
  "#######################.",
  "..###################Y#.",
  ".....#############...Y#.",
  "........#######......Y#.",
  "........#IIIII#.......#.",
  "........#IIIII#.........",
  "........#IIIII#.........",
  ".........#####..........",
  "........................",
  "........................",
  "........................",
];

const CAP_F1 = [
  "........................",
  "...........#............",
  "........#######.........",
  ".....#############......",
  "..###################...",
  "#######################.",
  "..###################.Y#",
  ".....#############....Y#",
  "........#######.......Y#",
  "........#IIIII#........#",
  "........#IIIII#.........",
  "........#IIIII#.........",
  ".........#####..........",
  "........................",
  "........................",
  "........................",
];

// 3. Pixel Sunglasses (Thug Life Shades) 20x10
const SHADES_F0 = [
  "....................",
  "####################",
  "#dddddddd##dddddddd#",
  "#ddwwdddd##ddwwdddd#",
  "#dddddddd##dddddddd#",
  ".#dddddd#..#dddddd#.",
  "..######....######..",
  "....................",
  "....................",
  "....................",
];

// 4. Pixel Cat on Head 20x16
const CAT_F0 = [
  "....................",
  "..##............##..",
  ".#oo#..........#oo#.",
  ".#ooo##########ooo#.",
  ".#oooooooooooooooo#.",
  ".#oooooooooooooooo#.",
  ".#oo#w#oooooo#w#oo#.",
  ".#oo###oooooo###oo#.",
  ".#oop#oooooooo#poo#.",
  ".#oooooooooooooooo#.",
  "..#oooooo##oooooo#..",
  "...##############...",
  "....................",
  "....................",
  "....................",
  "....................",
];

const CAT_F1 = [
  "....................",
  "..##............##..",
  ".#oo#..........#oo#.",
  ".#ooo##########ooo#.",
  ".#oooooooooooooooo#.",
  ".#oooooooooooooooo#.",
  ".#oo###oooooo###oo#.",
  ".#oooooooooooooooo#.",
  ".#oop#oooooooo#poo#.",
  ".#oooooooooooooooo#.",
  "..#oooooo##oooooo#..",
  "...##############...",
  "....................",
  "....................",
  "....................",
  "....................",
];

// 5. Gaming Headset 22x16
const HEADSET_F0 = [
  "......########......",
  "....############....",
  "...##############...",
  "..##............##..",
  ".##..............##.",
  ".#c#............#c#.",
  "#ccc#..........#ccc#",
  "#ccc#..........#ccc#",
  "#ccc#..........#ccc#",
  ".#c#............#c#.",
  "..#..............#..",
  "....................",
  "....................",
  "....................",
  "....................",
  "....................",
];

writeGif(path.join(gearDir, 'coffee_cup.gif'), [parseGrid(COFFEE_F0, CMAP, 16, 16), parseGrid(COFFEE_F1, CMAP, 16, 16)], 16, 16, 40);
writeGif(path.join(gearDir, 'grad_cap.gif'), [parseGrid(CAP_F0, CMAP, 24, 16), parseGrid(CAP_F1, CMAP, 24, 16)], 24, 16, 50);
writeGif(path.join(gearDir, 'pixel_shades.gif'), [parseGrid(SHADES_F0, CMAP, 20, 10)], 20, 10, 100);
writeGif(path.join(gearDir, 'cat_on_head.gif'), [parseGrid(CAT_F0, CMAP, 20, 16), parseGrid(CAT_F1, CMAP, 20, 16), parseGrid(CAT_F0, CMAP, 20, 16), parseGrid(CAT_F0, CMAP, 20, 16)], 20, 16, 40);
writeGif(path.join(gearDir, 'gaming_headset.gif'), [parseGrid(HEADSET_F0, CMAP, 22, 16)], 22, 16, 100);

console.log('✅ Generated all 2D pixel accessory GIFs!');
