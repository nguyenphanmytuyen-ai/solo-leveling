#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manifestPath = path.join(rootDir, 'src', 'data', 'characters.json');
const publicDir = path.join(rootDir, 'public');

console.log('=== [SOLO LEVELLING] Kiểm tra bộ nhân vật (chars:check) ===');

if (!fs.existsSync(manifestPath)) {
  console.error('❌ LỖI: Không tìm thấy src/data/characters.json');
  process.exit(1);
}

let characters = [];
try {
  const content = fs.readFileSync(manifestPath, 'utf-8');
  characters = JSON.parse(content);
} catch (err) {
  console.error('❌ LỖI: characters.json không đúng định dạng JSON:', err.message);
  process.exit(1);
}

if (!Array.isArray(characters) || characters.length === 0) {
  console.error('❌ LỖI: characters.json phải là một mảng có ít nhất 1 nhân vật');
  process.exit(1);
}

const slugRegex = /^[a-z0-9_-]+$/i;
const idSet = new Set();
let hasErrors = false;

for (const char of characters) {
  const { id, displayName, idle, reward, placeholder } = char;
  console.log(`\n• Kiểm tra nhân vật: [${id}] - ${displayName || '(Chưa đặt tên)'}`);

  if (!id || typeof id !== 'string' || !slugRegex.test(id)) {
    console.error(`  ❌ ID "${id}" không hợp lệ (phải là slug chữ/số không dấu, gạch ngang)`);
    hasErrors = true;
  }

  if (idSet.has(id)) {
    console.error(`  ❌ Trùng ID: "${id}"`);
    hasErrors = true;
  }
  idSet.add(id);

  if (!idle || !idle.src) {
    console.error('  ❌ Thiếu khai báo trạng thái idle (main)!');
    hasErrors = true;
  } else {
    const idlePath = path.join(publicDir, idle.src);
    if (!fs.existsSync(idlePath)) {
      console.error(`  ❌ Không tìm thấy file idle: ${idle.src}`);
      hasErrors = true;
    } else {
      const stats = fs.statSync(idlePath);
      if (stats.size > 1.5 * 1024 * 1024) {
        console.warn(`  ⚠️ Cảnh báo: File idle "${idle.src}" > 1.5MB (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      }
      console.log(`  ✅ Idle file: ${idle.src} (${stats.size} bytes)`);
    }
  }

  if (!reward || !reward.src) {
    console.warn('  ⚠️ Chú ý: Nhân vật chưa có file reward/get_star (app sẽ dùng hiệu ứng nhảy nhẹ + aura thay thế)');
  } else {
    const rewardPath = path.join(publicDir, reward.src);
    if (!fs.existsSync(rewardPath)) {
      console.warn(`  ⚠️ Cảnh báo: Không tìm thấy file reward: ${reward.src}`);
    } else {
      const stats = fs.statSync(rewardPath);
      if (stats.size > 1.5 * 1024 * 1024) {
        console.warn(`  ⚠️ Cảnh báo: File reward "${reward.src}" > 1.5MB (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      }
      console.log(`  ✅ Reward file: ${reward.src} (${stats.size} bytes)`);
    }
  }

  if (placeholder) {
    console.log('  ℹ️ Lưu ý: Đây là nhân vật dự phòng SVG mặc định (placeholder: true).');
  }
}

if (hasErrors) {
  console.error('\n❌ chars:check THẤT BẠI: Vui lòng sửa các lỗi trên.');
  process.exit(1);
} else {
  console.log(`\n🎉 chars:check THÀNH CÔNG: Đã kiểm tra ${characters.length} nhân vật.`);
  process.exit(0);
}
