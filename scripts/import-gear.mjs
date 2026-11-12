#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const gearDir = path.join(rootDir, 'public', 'assets', 'gear');
const manifestPath = path.join(rootDir, 'src', 'data', 'gear.json');

console.log('=== [SOLO LEVELLING] Quét & Nhập trang bị (gear:import) ===');

if (!fs.existsSync(gearDir)) {
  fs.mkdirSync(gearDir, { recursive: true });
}

let existing = [];
if (fs.existsSync(manifestPath)) {
  try {
    existing = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch {
    existing = [];
  }
}

const existingMap = new Map(existing.map(i => [i.id, i]));
const validSlots = ['head', 'face', 'body', 'legs', 'feet', 'back', 'handheld', 'accessory'];
const scanned = [];

for (const slot of validSlots) {
  const slotPath = path.join(gearDir, slot);
  if (!fs.existsSync(slotPath)) continue;

  const items = fs.readdirSync(slotPath, { withFileTypes: true });
  for (const item of items) {
    if (!item.isDirectory()) continue;
    const itemId = item.name.toLowerCase();
    const itemPath = path.join(slotPath, item.name);

    let meta = {};
    const metaFile = path.join(itemPath, 'meta.json');
    if (fs.existsSync(metaFile)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
      } catch {}
    }

    const prev = existingMap.get(itemId) || {};
    scanned.push({
      id: itemId,
      name: meta.name || prev.name || itemId,
      description: meta.description || prev.description || 'Trang bị nâng tầm phong cách thợ săn',
      slot,
      rarity: meta.rarity || prev.rarity || 'Common',
      set: meta.set || prev.set,
      unlock: meta.unlock || prev.unlock || { type: 'starter' },
      adjust: meta.adjust || prev.adjust || { x: 0, y: 0, scale: 1, flipX: false },
    });
  }
}

if (scanned.length > 0) {
  fs.writeFileSync(manifestPath, JSON.stringify(scanned, null, 2), 'utf-8');
  console.log(`✅ Đã cập nhật ${scanned.length} trang bị vào src/data/gear.json`);
} else {
  console.log('ℹ️ Không có thư mục mới trong public/assets/gear/. Giữ nguyên file hiện tại.');
}
