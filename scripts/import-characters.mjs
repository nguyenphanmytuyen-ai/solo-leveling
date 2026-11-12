#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manifestPath = path.join(rootDir, 'src', 'data', 'characters.json');
const charOutputDir = path.join(rootDir, 'public', 'assets', 'char');

console.log('=== [SOLO LEVELLING] Nhập bộ nhân vật (chars:import) ===');

const args = process.argv.slice(2);
const resetFlag = args.includes('--reset');
const targetArg = args.find(a => !a.startsWith('--'));

if (!targetArg) {
  console.log(`
Cách dùng:
  npm run chars:import -- <đường_dẫn_thư_mục_hoặc_file_zip> [--reset]

Ví dụ:
  npm run chars:import -- ./my_characters
  npm run chars:import -- ./char.zip
`);
  process.exit(0);
}

const inputPath = path.resolve(process.cwd(), targetArg);
if (!fs.existsSync(inputPath)) {
  console.error(`❌ Lỗi: Không tìm thấy đường dẫn: ${inputPath}`);
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(charOutputDir)) {
  fs.mkdirSync(charOutputDir, { recursive: true });
}

// Load existing manifest if not resetting
let existingManifest = [];
if (!resetFlag && fs.existsSync(manifestPath)) {
  try {
    existingManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch {
    existingManifest = [];
  }
}

const existingMap = new Map(existingManifest.map(c => [c.id, c]));

// Helper to inspect directory
function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const chars = new Map();

  for (const entry of entries) {
    if (['__MACOSX', '.DS_Store', 'Thumbs.db'].includes(entry.name)) continue;

    if (entry.isDirectory()) {
      const charId = entry.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const subDir = path.join(dir, entry.name);
      const subFiles = fs.readdirSync(subDir);

      let mainFile = null;
      let starFile = null;

      for (const f of subFiles) {
        const lower = f.toLowerCase();
        if (lower.startsWith('main.') || lower.startsWith('idle.')) {
          mainFile = path.join(subDir, f);
        } else if (
          lower.startsWith('get_star.') ||
          lower.startsWith('star.') ||
          lower.startsWith('happy.') ||
          lower.startsWith('reward.') ||
          lower.startsWith('cheer.')
        ) {
          starFile = path.join(subDir, f);
        }
      }

      if (mainFile) {
        chars.set(charId, { charId, mainFile, starFile });
      }
    } else {
      // Flat structure, e.g. hero_main.gif, hero_star.gif
      const name = entry.name;
      const lower = name.toLowerCase();
      const ext = path.extname(name);
      const base = path.basename(name, ext);

      const parts = base.split('_');
      if (parts.length >= 2) {
        const charId = parts[0].toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        const role = parts.slice(1).join('_').toLowerCase();

        const current = chars.get(charId) || { charId, mainFile: null, starFile: null };
        if (role === 'main' || role === 'idle') {
          current.mainFile = path.join(dir, name);
        } else if (['get_star', 'star', 'happy', 'reward', 'cheer'].includes(role)) {
          current.starFile = path.join(dir, name);
        }
        chars.set(charId, current);
      }
    }
  }

  return chars;
}

const stat = fs.statSync(inputPath);
let scannedChars = new Map();

if (stat.isDirectory()) {
  scannedChars = scanDirectory(inputPath);
} else {
  console.log(`ℹ️ Phát hiện file nén/tệp ${inputPath}. Nếu bạn dùng .zip, vui lòng giải nén ra thư mục rồi chạy lại hoặc thả vào public/assets/char/`);
}

if (scannedChars.size === 0) {
  console.log('⚠️ Không phát hiện nhân vật nào từ nguồn đã chỉ định. Giữ nguyên manifest hiện tại.');
  process.exit(0);
}

const newManifest = [];

for (const [charId, info] of scannedChars.entries()) {
  if (!info.mainFile) {
    console.warn(`⚠️ [${charId}]: Thiếu file main/idle! Bỏ qua nhân vật này.`);
    continue;
  }

  const destFolder = path.join(charOutputDir, charId);
  if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
  }

  const mainExt = path.extname(info.mainFile);
  const destMain = path.join(destFolder, `main${mainExt}`);
  fs.copyFileSync(info.mainFile, destMain);

  let destStarRel = null;
  if (info.starFile) {
    const starExt = path.extname(info.starFile);
    const destStar = path.join(destFolder, `get_star${starExt}`);
    fs.copyFileSync(info.starFile, destStar);
    destStarRel = `assets/char/${charId}/get_star${starExt}`;
  }

  const existing = existingMap.get(charId) || {};
  const capitalizedName = charId.charAt(0).toUpperCase() + charId.slice(1);

  const charDef = {
    id: charId,
    displayName: existing.displayName || capitalizedName,
    tagline: existing.tagline || 'Chiến binh sẵn sàng vượt ngưỡng',
    idle: {
      src: `assets/char/${charId}/main${mainExt}`,
      width: existing.idle?.width || 240,
      height: existing.idle?.height || 240,
    },
    ...(destStarRel
      ? {
          reward: {
            src: destStarRel,
            width: existing.reward?.width || 240,
            height: existing.reward?.height || 240,
            durationMs: existing.reward?.durationMs || 5000,
          },
        }
      : {}),
    pixelArt: existing.pixelArt ?? true,
    stage: existing.stage || { scale: 0.8, offsetY: 0 },
    placeholder: false,
  };

  newManifest.push(charDef);
  console.log(`✅ Đã nhập thành công: [${charId}] -> ${charDef.displayName} (${destStarRel ? 'Có reward' : 'Chưa có reward'})`);
}

fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2), 'utf-8');
console.log(`\n🎉 Đã cập nhật src/data/characters.json với ${newManifest.length} nhân vật.`);
