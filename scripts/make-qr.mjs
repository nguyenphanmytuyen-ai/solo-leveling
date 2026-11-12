#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetUrl = process.argv[2] || 'https://solo-levelling.app';
const outputDir = path.join(rootDir, 'qr');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generate() {
  console.log(`=== Tạo mã QR cho URL: ${targetUrl} ===`);

  const svgPath = path.join(outputDir, 'site-qr.svg');
  const pngPath = path.join(outputDir, 'site-qr.png');

  // SVG
  const svgString = await QRCode.toString(targetUrl, {
    type: 'svg',
    color: {
      dark: '#7C3AED',
      light: '#0A0E27',
    },
    width: 320,
    margin: 2,
  });
  fs.writeFileSync(svgPath, svgString, 'utf-8');
  console.log(`✅ Đã tạo SVG: ${svgPath}`);

  // PNG
  await QRCode.toFile(pngPath, targetUrl, {
    color: {
      dark: '#7C3AED',
      light: '#FFFFFF',
    },
    width: 320,
    margin: 2,
  });
  console.log(`✅ Đã tạo PNG: ${pngPath}`);
  console.log('🎉 Hoàn tất sinh mã QR!');
}

generate().catch(err => {
  console.error('❌ Lỗi sinh mã QR:', err);
  process.exit(1);
});
