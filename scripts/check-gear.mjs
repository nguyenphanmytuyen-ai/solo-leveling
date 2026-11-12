#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const gearManifestPath = path.join(rootDir, 'src', 'data', 'gear.json');

console.log('=== [SOLO LEVELLING] Kiểm tra trang bị (gear:check) ===');

if (!fs.existsSync(gearManifestPath)) {
  console.error('❌ LỖI: Không tìm thấy src/data/gear.json');
  process.exit(1);
}

let gearList = [];
try {
  gearList = JSON.parse(fs.readFileSync(gearManifestPath, 'utf-8'));
} catch (err) {
  console.error('❌ LỖI: gear.json không đúng định dạng JSON:', err.message);
  process.exit(1);
}

const validSlots = new Set(['head', 'face', 'body', 'legs', 'feet', 'back', 'handheld', 'accessory']);
const idSet = new Set();
let hasErrors = false;

for (const item of gearList) {
  if (!item.id || idSet.has(item.id)) {
    console.error(`  ❌ ID trang bị không hợp lệ hoặc bị trùng: "${item.id}"`);
    hasErrors = true;
  }
  idSet.add(item.id);

  if (!validSlots.has(item.slot)) {
    console.error(`  ❌ Trang bị [${item.id}] có slot không hợp lệ: "${item.slot}"`);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('\n❌ gear:check THẤT BẠI.');
  process.exit(1);
} else {
  console.log(`✅ gear:check THÀNH CÔNG: Đã kiểm tra ${gearList.length} món trang bị.`);
  process.exit(0);
}
